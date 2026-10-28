import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { registerAuth } from "../server/auth";
import { apiErrorHandler } from "../server/http";

fs.mkdirSync(".local-data", { recursive: true });
process.env.SAKURA_DATA_DIR = fs.mkdtempSync(
  path.resolve(".local-data", "registration-test-"),
);
process.env.NODE_ENV = "test";
process.env.COOKIE_SECURE = "false";
process.env.SAKURA_DEMO_MODE = "false";
const { sqliteDb: db } = await import("../server/sqliteDb");
const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.locals.requestId = randomUUID();
  next();
});
// Known challenge provider only in this isolated test server.
const provider = {
  create: () => ({
    text: "Ab3D",
    data: '<svg xmlns="http://www.w3.org/2000/svg"><text>Ab3D</text></svg>',
  }),
  createMathExpr: () => ({ text: "2", data: "<svg/>" }),
};
registerAuth(app, db, provider);
app.use(apiErrorHandler);
const server = createServer(app);
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
let cookie = "",
  csrf = "";
const checks: string[] = [];
async function api(
  route: string,
  method = "GET",
  body?: unknown,
  token = csrf,
) {
  const r = await fetch(base + "/api/v1/" + route, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie, "X-CSRF-Token": token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie"),
  };
}
async function challenge() {
  const r = await api("security/captcha");
  assert.equal(r.status, 200);
  assert.equal(r.data.data.demoHint, "");
  return { captchaId: r.data.data.captchaId, captchaAnswer: "aB3d" };
}
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
const details = {
  facultyCode: "new_teacher",
  fullName: "新教师",
  email: "new@example.invalid",
  password: "example-password-932",
  confirmPassword: "example-password-932",
  role: "admin",
};
try {
  await check(
    "registration rejects missing and incorrect captcha",
    async () => {
      assert.equal((await api("auth/register", "POST", details)).status, 422);
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...details,
            ...(await challenge()),
            captchaAnswer: "wrong",
          })
        ).status,
        422,
      );
      assert.equal(
        (
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM faculty_users WHERE faculty_code=?",
            )
            .get(details.facultyCode) as { n: number }
        ).n,
        0,
      );
    },
  );
  let consumed: Awaited<ReturnType<typeof challenge>>;
  await check(
    "registration persists a teacher with hashed password and neutral defaults",
    async () => {
      consumed = await challenge();
      const r = await api("auth/register", "POST", { ...details, ...consumed });
      assert.equal(r.status, 200);
      const user = db
        .prepare("SELECT * FROM faculty_users WHERE faculty_code=?")
        .get(details.facultyCode) as Record<string, unknown>;
      assert.equal(user.role, "teacher");
      assert.equal(user.default_class_name, "尚未分配班级");
      assert.notEqual(user.password_hash, details.password);
      assert.ok(String(user.password_hash).startsWith("scrypt$"));
      assert.equal(r.data.data.password_hash, undefined);
    },
  );
  await check(
    "duplicate identities captcha replay expiry and invalid passwords are rejected",
    async () => {
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...details,
            facultyCode: "second",
            email: "second@example.invalid",
            ...consumed,
          })
        ).status,
        422,
      );
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...details,
            facultyCode: "NEW_TEACHER",
            ...(await challenge()),
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...details,
            facultyCode: "second",
            email: "NEW@EXAMPLE.INVALID",
            ...(await challenge()),
          })
        ).status,
        409,
      );
      const expired = await challenge();
      db.prepare(
        "UPDATE security_captchas SET expires_at='2000-01-01' WHERE captcha_id=?",
      ).run(expired.captchaId);
      assert.equal(
        (await api("auth/register", "POST", { ...details, ...expired })).status,
        422,
      );
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...details,
            confirmPassword: "different",
          })
        ).status,
        422,
      );
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...details,
            password: "short",
            confirmPassword: "short",
          })
        ).status,
        422,
      );
    },
  );
  await check(
    "new teacher logs in with case-insensitive graphic captcha and cannot administer SQLite",
    async () => {
      const r = await api("auth/faculty-login", "POST", {
        facultyId: details.facultyCode,
        password: details.password,
        loginType: "account",
        ...(await challenge()),
      });
      assert.equal(r.status, 200);
      assert.equal(r.data.data.role, "teacher");
      assert.ok(r.cookie?.includes("HttpOnly"));
      cookie = r.cookie!.split(";")[0];
      csrf = r.data.data.csrfToken;
      assert.equal((await api("auth/session")).status, 200);
      assert.equal((await api("sqlite/status")).status, 403);
      assert.equal(
        (await api("auth/logout", "POST", {}, "invalid")).status,
        403,
      );
      assert.equal((await api("auth/logout", "POST", {})).status, 200);
      assert.equal((await api("auth/session")).status, 401);
      cookie = "";
    },
  );
  await check("administrators cannot access SQL, status or database backup", async () => {
    const login=await api('auth/faculty-login','POST',{facultyId:'admin',password:'admin',loginType:'account',...await challenge()});
    assert.equal(login.status,200); cookie=login.cookie!.split(';')[0];csrf=login.data.data.csrfToken;
    for(const [route,method,body] of [['sqlite/status','GET',undefined],['sqlite/query','POST',{sql:'SELECT 1'}],['sqlite/backup-download','GET',undefined],['sqlite/reseed','POST',{}]] as const){
      assert.equal((await api(route,method,body)).status,403);
    }
    assert.equal((await api('auth/logout','POST',{})).status,200);cookie='';csrf='';
  });
  await check("public registration has server-side throttling", async () => {
    let limited = false;
    for (let i = 0; i < 32; i++) {
      const r = await api("auth/register", "POST", details);
      if (r.status === 429) {
        limited = true;
        break;
      }
      assert.equal(r.status, 422);
    }
    assert.ok(limited);
    assert.deepEqual(db.pragma("foreign_key_check"), []);
  });
  fs.mkdirSync("docs/verification/auth", { recursive: true });
  fs.writeFileSync(
    "docs/verification/auth/registration.json",
    JSON.stringify(
      { testedAt: new Date().toISOString(), checks, passed: checks.length },
      null,
      2,
    ),
  );
} finally {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  db.close();
}
