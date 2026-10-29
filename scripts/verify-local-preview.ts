/** Exercise the actual local entry in its own empty database, including restart. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { createHash, randomBytes } from "node:crypto";
import Database from "better-sqlite3";

fs.mkdirSync(".local-data", { recursive: true });
const directory = fs.mkdtempSync(path.resolve(".local-data", "preview-check-"));
const reservation = createServer();
await new Promise<void>(resolve => reservation.listen(0, "127.0.0.1", resolve));
const port = (reservation.address() as { port: number }).port;
await new Promise<void>(resolve => reservation.close(() => resolve()));
const base = "http://127.0.0.1:" + port;
const password = randomBytes(24).toString("base64url");
let child: ChildProcess | undefined, cookie = "", csrf = "";
const checks: string[] = [];
async function start() {
  child = spawn(process.execPath, ["--import", "tsx", "scripts/dev-portfolio.ts"], {
    env: { ...process.env, PORT: String(port), SAKURA_DATA_DIR: directory },
    stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  const active = child;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(Error("Local preview startup timed out")), 30000);
    let output = "";
    const closed = () => { clearTimeout(timer); reject(Error("Local preview exited during startup")); };
    active.once("error", closed);
    active.once("exit", closed);
    active.stderr?.on("data", () => {});
    active.stdout?.on("data", chunk => {
      output += chunk.toString();
      if (!output.includes("[SakuraEdu] Local SQLite preview:")) return;
      clearTimeout(timer);
      active.removeListener("error", closed);
      active.removeListener("exit", closed);
      resolve();
    });
  });
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const closed = once(child, "exit");
  child.kill();
  await closed;
  child = undefined;
}
async function api(route: string, method = "GET", body?: unknown) {
  const response = await fetch(base + "/api/v1/" + route, {
    method, headers: {
      Origin: base, "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}),
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
  });
  return { response, json: await response.json() };
}
function inspect() { return new Database(path.join(directory, "sakura_edu.sqlite")); }
async function challenge() {
  const cap = (await api("security/captcha?mode=graphic")).json.data;
  assert.equal(cap.demoHint, "");
  // Only this newly generated test DB is writable here; product keeps real CAPTCHA.
  const db = inspect();
  try {
    db.prepare("UPDATE security_captchas SET answer_hash=? WHERE captcha_id=?")
      .run(createHash("sha256").update("2468").digest("hex"), cap.captchaId);
  } finally { db.close(); }
  return { captchaId: cap.captchaId, captchaAnswer: "2468" };
}
async function check(name: string, action: () => Promise<void>) {
  await action(); checks.push(name); console.log("PASS " + name);
}
try {
  await start();
  await check("actual local entry serves pages and starts without seeded accounts", async () => {
    for (const route of ["/", "/login", "/register"])
      assert.equal((await fetch(base + route)).status, 200);
    const db = inspect();
    try { assert.equal((db.prepare("SELECT COUNT(*) n FROM faculty_users").get() as { n: number }).n, 0); }
    finally { db.close(); }
  });
  await check("first registration through the real entry creates the administrator", async () => {
    const r = await api("auth/register", "POST", {
      facultyCode: "portfolio_owner", email: "owner@portfolio.invalid", fullName: "",
      password, confirmPassword: password, ...(await challenge()),
    });
    assert.equal(r.response.status, 200);
    const db = inspect();
    try { assert.equal((db.prepare("SELECT role FROM faculty_users").get() as { role: string }).role, "admin"); }
    finally { db.close(); }
  });
  await check("real local login uses SQLite and preserves API management restrictions", async () => {
    const r = await api("auth/faculty-login", "POST", {
      facultyId: "portfolio_owner", password, loginType: "account", ...(await challenge()),
    });
    assert.equal(r.response.status, 200);
    assert.equal(r.response.headers.get("x-sakura-database"), "SQLite");
    cookie = r.response.headers.get("set-cookie")!.split(";")[0];
    csrf = r.json.data.csrfToken;
    assert.equal((await api("auth/session")).response.status, 200);
    assert.equal((await api("sqlite/query", "POST", { sql: "SELECT 1" })).response.status, 403);
    assert.equal((await api("auth/logout", "POST", {})).response.status, 200);
    assert.equal((await api("auth/session")).response.status, 401);
  });
  cookie = ""; csrf = "";
  await stop();
  await start();
  await check("restart retains the account and accepts its original password", async () => {
    const r = await api("auth/faculty-login", "POST", {
      facultyId: "portfolio_owner", password, loginType: "account", ...(await challenge()),
    });
    assert.equal(r.response.status, 200);
    const db = inspect();
    try { assert.equal((db.prepare("SELECT COUNT(*) n FROM faculty_users").get() as { n: number }).n, 1); }
    finally { db.close(); }
  });
  fs.mkdirSync("docs/verification/opensource", { recursive: true });
  fs.writeFileSync("docs/verification/opensource/local-preview.json", JSON.stringify({
    testedAt: new Date().toISOString(), passed: checks.length, checks,
    target: "real dev-portfolio entry with an isolated local SQLite file",
    captchaOverride: "test-owned database challenge hash only; no product bypass",
  }, null, 2));
} finally { await stop(); }
