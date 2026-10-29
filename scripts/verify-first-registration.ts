import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import express from "express";
import { createServer } from "node:http";
import { LEGACY_SCHEMA_SQL } from "../server/database/legacySchema";
import { migrateDatabase } from "../server/database/migrations";
import { registerAuth } from "../server/auth";
import { apiErrorHandler } from "../server/http";
fs.mkdirSync(".local-data", { recursive: true });
const directory = fs.mkdtempSync(
  path.resolve(".local-data", "first-registration-"),
);
const db = new Database(path.join(directory, "empty.sqlite"));
db.pragma("foreign_keys=ON");
db.exec(LEGACY_SCHEMA_SQL);
migrateDatabase(db, path.join(directory, "empty.sqlite"));
process.env.COOKIE_SECURE = "false";
process.env.SAKURA_DEMO_MODE = "false";
const app = express();
app.use(express.json());
registerAuth(app, db, {
  create: () => ({ text: "2468", data: "<svg/>" }),
  createMathExpr: () => ({ text: "2", data: "<svg/>" }),
});
app.use(apiErrorHandler);
const server = createServer(app);
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = "http://127.0.0.1:" + (server.address() as { port: number }).port;
const checks: {
  name: string;
  status: string;
  expected: string;
  actual: string;
}[] = [];
try {
  for (const [index, name] of ["first_owner", "next_user"].entries()) {
    const cap = await (await fetch(base + "/api/v1/security/captcha")).json();
    const r = await fetch(base + "/api/v1/auth/register", {
      method: "POST",
      headers: { Origin: base, "Content-Type": "application/json" },
      body: JSON.stringify({
        facultyCode: name,
        email: name + "@test.invalid",
        password: "fresh-install-test-42",
        confirmPassword: "fresh-install-test-42",
        fullName: "",
        role: "admin",
        captchaId: cap.data.captchaId,
        captchaAnswer: "2468",
      }),
    });
    if (r.status !== 200) throw Error("Registration failed: " + r.status);
    const row = db
      .prepare("SELECT role FROM faculty_users WHERE faculty_code=?")
      .get(name) as { role: string };
    const expected = index === 0 ? "admin" : "teacher";
    checks.push({
      name:
        index === 0
          ? "first registration must bootstrap an administrator"
          : "later public registration must ignore injected admin role",
      status: row.role === expected ? "PASS" : "FAIL",
      expected,
      actual: row.role,
    });
  }
  db.prepare("DELETE FROM faculty_users").run();
  const caps = await Promise.all(
    [0, 1].map(
      async () => await (await fetch(base + "/api/v1/security/captcha")).json(),
    ),
  );
  const replies = await Promise.all(
    caps.map((cap, index) =>
      fetch(base + "/api/v1/auth/register", {
        method: "POST",
        headers: { Origin: base, "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyCode: "parallel_" + index,
          email: "parallel_" + index + "@test.invalid",
          password: "fresh-install-test-42",
          confirmPassword: "fresh-install-test-42",
          captchaId: cap.data.captchaId,
          captchaAnswer: "2468",
          role: "admin",
        }),
      }),
    ),
  );
  const admins = (
    db
      .prepare("SELECT COUNT(*) n FROM faculty_users WHERE role='admin'")
      .get() as { n: number }
  ).n;
  checks.push({
    name: "concurrent first registrations create exactly one administrator",
    status:
      replies.every((r) => r.status === 200) && admins === 1 ? "PASS" : "FAIL",
    expected: "1 administrator",
    actual: String(admins) + " administrator",
  });
} finally {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  db.close();
  fs.mkdirSync("docs/verification/tidb", { recursive: true });
  fs.writeFileSync(
    "docs/verification/tidb/first-registration.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        target:
          "empty migrated SQLite with the same authentication application code",
        checks,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks }));
  if (checks.some((c) => c.status === "FAIL")) process.exitCode = 1;
}
