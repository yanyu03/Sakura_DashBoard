import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash, randomBytes, scryptSync } from "node:crypto";
import { readLocalSecret } from "./private-secrets";
import { operatorPasswordPolicy } from "./password-policy-secret";
import { tidbTestDatabase } from "./tidb-test-database";
import { verifyPassword, passwordNeedsUpgrade } from "../server/passwords";
import { verificationFetch as fetch } from "./http-verification-transport";
const fixture = readLocalSecret(".local-data/functional-target.json"),
  policy = operatorPasswordPolicy("staging"),
  { db, pool } = tidbTestDatabase(fixture.database);
const base = "https://sakura.250221.xyz/__tidb-preview";
let cookie = "",
  csrf = "";
const checks: string[] = [];
const latency: number[] = [];
async function api(route: string, method = "GET", body?: unknown) {
  const response = await fetch(base + "/api/v1/" + route, {
    method,
    headers: {
      Origin: new URL(base).origin,
      "Content-Type": "application/json",
      "X-Sakura-Preview-Token": fixture.token,
      ...(cookie ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await response.json();
  return { response, json };
}
async function login(account: string, password: string) {
  const cap = (await api("security/captcha?mode=math")).json.data;
  const text = Array.from(
    cap.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
    (m: any) => m[1],
  ).join("");
  const match = text.match(/^(\d)\+(\d)=\?$/);
  assert.ok(match);
  const start = Date.now();
  const r = await api("auth/faculty-login", "POST", {
    facultyId: account,
    password,
    loginType: "account",
    captchaId: cap.captchaId,
    captchaAnswer: String(+match[1] + +match[2]),
  });
  latency.push(Date.now() - start);
  if (r.response.status === 200) {
    cookie = r.response.headers.get("set-cookie")!.split(";")[0];
    csrf = r.json.data.csrfToken;
  }
  return r;
}
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
try {
  await check(
    "actual Worker upgrades an existing salted hash to pepper-protected stronger scrypt on successful login",
    async () => {
      const salt = randomBytes(16).toString("hex"),
        old =
          "scrypt$" +
          salt +
          "$" +
          scryptSync(fixture.password, salt, 64).toString("hex");
      await db
        .prepare("UPDATE faculty_users SET password_hash=? WHERE id=?")
        .run(old, "fixture-teacher-a");
      const r = await login("FIX-a", fixture.password);
      assert.equal(r.response.status, 200);
      const row = await db
        .prepare("SELECT password_hash FROM faculty_users WHERE id=?")
        .get("fixture-teacher-a");
      assert.ok(verifyPassword(fixture.password, row.password_hash, policy));
      assert.equal(passwordNeedsUpgrade(row.password_hash, policy), false);
      assert.ok(row.password_hash.includes("$" + policy.current + "$"));
      assert.ok(!JSON.stringify(r.json).includes(row.password_hash));
    },
  );
  await check(
    "wrong passwords and replaying stored hashes cannot authenticate or create cookies",
    async () => {
      const row = await db
        .prepare("SELECT password_hash FROM faculty_users WHERE id=?")
        .get("fixture-teacher-a");
      for (const candidate of ["wrong-password", row.password_hash]) {
        const r = await login("FIX-a", candidate);
        assert.equal(r.response.status, 401);
        assert.equal(r.response.headers.get("set-cookie"), null);
      }
      assert.equal(
        (await login("FIX-a", fixture.password)).response.status,
        200,
      );
    },
  );
  await check(
    "new registrations through CF store only pepper-protected hashes and cannot request admin privileges",
    async () => {
      const cap = (await api("security/captcha")).json.data;
      await db
        .prepare(
          "UPDATE security_captchas SET answer_hash=? WHERE captcha_id=?",
        )
        .run(createHash("sha256").update("2468").digest("hex"), cap.captchaId);
      const account = "sec_" + randomBytes(4).toString("hex");
      const r = await api("auth/register", "POST", {
        facultyCode: account,
        email: account + "@test.invalid",
        fullName: "",
        role: "admin",
        password: fixture.password,
        confirmPassword: fixture.password,
        captchaId: cap.captchaId,
        captchaAnswer: "2468",
      });
      assert.equal(r.response.status, 200);
      const row = await db
        .prepare(
          "SELECT password_hash,role FROM faculty_users WHERE faculty_code=?",
        )
        .get(account);
      assert.equal(row.role, "teacher");
      assert.ok(verifyPassword(fixture.password, row.password_hash, policy));
      assert.equal(passwordNeedsUpgrade(row.password_hash, policy), false);
      assert.ok(!JSON.stringify(r.json).includes(fixture.password));
    },
  );
  await check(
    "hardened sessions preserve class isolation and SQL management remains forbidden",
    async () => {
      assert.equal(
        (await api("sqlite/query", "POST", { sql: "SELECT 1" })).response
          .status,
        403,
      );
      const classes = (await api("academic/classes")).json.data;
      assert.ok(classes.some((row: any) => row.id === "fixture-class-a"));
      assert.ok(!classes.some((row: any) => row.id === "fixture-class-b"));
    },
  );
  await check(
    "real Worker responses use HSTS and discard sensitive URL parameters and raw error messages",
    async () => {
      const session = await api("auth/session");
      assert.equal(session.response.status, 200);
      assert.match(session.response.headers.get("strict-transport-security") || '',/max-age=31536000(?:;|$)/);
      const rejected = await api("auth/session?password=synthetic-secret");
      assert.equal(rejected.response.status, 400);
      assert.ok(!JSON.stringify(rejected.json).includes("synthetic-secret"));
      assert.equal(
        rejected.response.headers.get("x-sakura-error-message"),
        null,
      );
    },
  );
  await check(
    "logout revokes a session authenticated with the protected password scheme",
    async () => {
      assert.equal((await api("auth/logout", "POST", {})).response.status, 200);
      assert.equal((await api("auth/session")).response.status, 401);
    },
  );
  fs.mkdirSync("docs/verification/security", { recursive: true });
  fs.writeFileSync(
    "docs/verification/security/cf-hardening.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        target: "token-gated Worker and isolated synthetic TiDB database",
        passed: checks.length,
        checks,
        loginRoundTripMs: latency,
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
