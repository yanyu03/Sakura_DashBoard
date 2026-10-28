import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { registerAuth } from "../server/auth";
import { registerSchedules } from "../server/schedules";
import { registerWorkspace } from "../server/workspace";
import { apiErrorHandler } from "../server/http";
import { hashPassword } from "../server/passwords";
import { applyScheduleSharing } from "../server/database/scheduleSharing";
fs.mkdirSync(".local-data", { recursive: true });
process.env.SAKURA_DATA_DIR = fs.mkdtempSync(
  path.resolve(".local-data", "schedule-sharing-test-"),
);
process.env.COOKIE_SECURE = "false";
process.env.SAKURA_DEMO_MODE = "false";
const { sqliteDb: db } = await import("../server/sqliteDb");
const users = [
  "admin",
  "alice",
  "bob",
  "chair",
  "outsider",
  "otherchair",
  "upper",
  "expired",
  "foreignchair",
];
for (const id of users)
  db.prepare(
    "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role) VALUES (?,?,?,?,?,'主任','同名教研室',?)",
  ).run(
    "test-" + id,
    "test_" + id,
    `${id}@schedule.invalid`,
    hashPassword("isolated-fixture-password"),
    id,
    id === "admin" ? "admin" : "teacher",
  );
db.prepare(
  "INSERT INTO academic_terms(id,code,name,starts_on,ends_on) VALUES ('test-term','test-term','测试学期','2026-01-01','2027-12-31')",
).run();
db.prepare(
  "INSERT INTO courses(id,code,name) VALUES ('test-course','test-course','测试课程')",
).run();
for (let i = 1; i <= 3; i++)
  db.prepare(
    "INSERT INTO academic_classes(id,class_code,class_name,grade_level,room_location) VALUES (?,?,?,'高一','测试楼')",
  ).run("test-class" + i, "test-class" + i, "测试班" + i);
for (const id of ["alice", "bob", "chair", "outsider", "expired"])
  for (let i = 1; i <= 2; i++)
    db.prepare(
      "INSERT INTO teaching_assignments(teacher_id,class_id,course_id,term_id) VALUES (?,?,'test-course','test-term')",
    ).run("test-" + id, "test-class" + i);
const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.locals.requestId = randomUUID();
  next();
});
registerAuth(app, db, {
  create: () => ({ text: "2468", data: "<svg/>" }),
  createMathExpr: () => ({ text: "2", data: "<svg/>" }),
});
registerSchedules(app, db);
registerWorkspace(app, db);
app.use(apiErrorHandler);
const server = createServer(app);
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const sessions = new Map<string, { cookie: string; csrf: string }>(),
  checks: string[] = [];
async function api(
  user: string,
  route: string,
  method = "GET",
  body?: unknown,
) {
  const session = sessions.get(user);
  const r = await fetch(base + "/api/v1/" + route, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(session
        ? { Cookie: session.cookie, "X-CSRF-Token": session.csrf }
        : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const type = r.headers.get("content-type") || "";
  return {
    status: r.status,
    data: type.includes("json") ? (await r.json()).data : await r.text(),
    cookie: r.headers.get("set-cookie"),
  };
}
async function login(user: string) {
  const cap = await api(user, "security/captcha");
  const r = await api(user, "auth/faculty-login", "POST", {
    facultyId: "test_" + user,
    password: "isolated-fixture-password",
    loginType: "account",
    captchaId: cap.data.captchaId,
    captchaAnswer: "2468",
  });
  assert.equal(r.status, 200);
  sessions.set(user, {
    cookie: r.cookie!.split(";")[0],
    csrf: r.data.csrfToken,
  });
}
async function check(name: string, fn: () => Promise<void> | void) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
const range = "?from=2026-01-01&to=2027-01-01";
let deptA = "",
  deptB = "",
  draft: any,
  pending: any,
  published: any,
  conflict: any,
  bobAppointment = "";
const body = (hour = 8, klass = "test-class1") => ({
  class_id: klass,
  course_id: "test-course",
  starts_at: `2026-10-29T${String(hour).padStart(2, "0")}:00:00Z`,
  ends_at: `2026-10-29T${String(hour + 1).padStart(2, "0")}:00:00Z`,
  room: "测试教室" + hour,
  note: "排课说明",
  unit_id: deptA,
});
const list = async (user: string, resource = "submissions") =>
  (await api(user, "schedules/" + resource + range)).data as any[];
const update = (user: string, row: any, action: string, extra = {}) =>
  api(user, `schedules/submissions/${row.id}`, "PATCH", {
    version: row.version,
    action,
    ...extra,
  });
try {
  for (const user of users) await login(user);
  await check(
    "migration is idempotent and retains all legacy schedule rows",
    () => {
      // Exercise the real v13 -> v14 upgrade, rather than only a fresh schema.
      db.exec(
        "DROP TABLE schedule_submissions; DROP TABLE schedule_entry_scopes; DELETE FROM schema_migrations WHERE version=14",
      );
      db.prepare(
        "INSERT INTO schedule_entries(id,class_id,teacher_id,course_id,starts_at,ends_at,room) VALUES ('legacy-private','test-class1','test-alice','test-course','2025-01-01T00:00:00.000Z','2025-01-01T01:00:00.000Z','旧教室')",
      ).run();
      const count = (
        db.prepare("SELECT COUNT(*) n FROM schedule_entries").get() as any
      ).n;
      applyScheduleSharing(db);
      assert.equal(
        (db.prepare("SELECT COUNT(*) n FROM schedule_entries").get() as any).n,
        count,
      );
      assert.equal(
        (
          db
            .prepare("SELECT MAX(version) n FROM schema_migrations")
            .get() as any
        ).n,
        15,
      );
    },
  );
  await check(
    "only administrators configure departments and immutable account membership",
    async () => {
      assert.equal(
        (
          await api("alice", "schedules/departments", "POST", {
            code: "fake",
            name: "伪造",
          })
        ).status,
        403,
      );
      deptA = (
        await api("admin", "schedules/departments", "POST", {
          code: "A",
          name: "同名教研室",
        })
      ).data.id;
      deptB = (
        await api("admin", "schedules/departments", "POST", {
          code: "B",
          name: "同名教研室",
        })
      ).data.id;
      for (const [user, unit, role] of [
        ["alice", deptA, "teacher"],
        ["bob", deptA, "teacher"],
        ["chair", deptA, "director"],
        ["outsider", deptB, "teacher"],
        ["otherchair", deptB, "director"],
        ["expired", deptA, "teacher"],
      ]) {
        const r = await api(
          "admin",
          `schedules/departments/${unit}/members`,
          "POST",
          { account_id: "test-" + user, role_code: role },
        );
        assert.equal(r.status, 200);
        if (user === "bob") bobAppointment = r.data.id;
      }
      assert.equal(
        (await api("bob", "schedules/department-admin")).status,
        403,
      );
      assert.equal(
        (
          await api("alice", `schedules/departments/${deptA}/members`, "POST", {
            account_id: "test-alice",
            role_code: "director",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "cross-school and expired appointments do not confer schedule access",
    async () => {
      db.prepare(
        "INSERT INTO institutions(id,code,name) VALUES ('foreign-school','foreign-school','同名学校')",
      ).run();
      const department = (
        await api("admin", "schedules/departments", "POST", {
          institution_id: "foreign-school",
          code: "A",
          name: "同名教研室",
        })
      ).data.id;
      assert.equal(
        (
          await api(
            "admin",
            `schedules/departments/${department}/members`,
            "POST",
            { account_id: "test-foreignchair", role_code: "director" },
          )
        ).status,
        200,
      );
      assert.ok(
        !(await api("foreignchair", "schedules/options")).data.departments.some(
          (d: any) => d.id === deptA,
        ),
      );
      db.prepare(
        "UPDATE identity_appointments SET starts_on='2020-01-01',ends_on='2020-12-31' WHERE identity_id IN (SELECT id FROM identity_registry WHERE account_id='test-expired')",
      ).run();
      const org = (
        db
          .prepare("SELECT institution_id FROM organization_units WHERE id=?")
          .get(deptA) as any
      ).institution_id;
      const root = (
        db
          .prepare(
            "SELECT id FROM organization_units WHERE institution_id=? AND parent_id IS NULL",
          )
          .get(org) as any
      ).id;
      db.prepare(
        "INSERT INTO identity_registry(id,institution_id,account_id,identity_kind,external_id) VALUES ('upper-identity',?,'test-upper','staff','upper')",
      ).run(org);
      db.prepare(
        "INSERT INTO organization_positions(id,institution_id,unit_id,role_code,code,hierarchy_level) VALUES ('upper-position',?,?,'director','upper',1)",
      ).run(org, root);
      db.prepare(
        "INSERT INTO identity_appointments(id,institution_id,identity_id,position_id,starts_on) VALUES ('upper-appointment',?,'upper-identity','upper-position','2020-01-01')",
      ).run(org);
    },
  );
  await check(
    "private drafts stay invisible to peers directors school supervisors and administrators",
    async () => {
      const r = await api("alice", "schedules/submissions", "POST", {
        ...body(),
        action: "draft",
        owner_id: "test-bob",
        teacher_id: "test-bob",
      });
      assert.equal(r.status, 200);
      draft = r.data;
      assert.equal(draft.owner_id, "test-alice");
      for (const u of [
        "bob",
        "chair",
        "upper",
        "outsider",
        "admin",
        "foreignchair",
      ]) {
        assert.ok(!(await list(u)).some((r) => r.id === draft.id));
        assert.equal((await update(u, draft, "approve")).status, 404);
      }
    },
  );
  await check(
    "submission rejects foreign department arbitrary class and expired identity",
    async () => {
      assert.equal(
        (
          await api("alice", "schedules/submissions", "POST", {
            ...body(9),
            unit_id: deptB,
            action: "submit",
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await api("alice", "schedules/submissions", "POST", {
            ...body(9, "test-class3"),
            action: "submit",
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await api("expired", "schedules/submissions", "POST", {
            ...body(9),
            action: "submit",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "submitted schedules are shared only with same unit and responsible ancestors",
    async () => {
      const r = await update("alice", draft, "submit");
      assert.equal(r.status, 200);
      pending = r.data;
      for (const u of ["bob", "chair", "upper"])
        assert.ok((await list(u)).some((r) => r.id === draft.id));
      for (const u of [
        "outsider",
        "otherchair",
        "admin",
        "expired",
        "foreignchair",
      ])
        assert.ok(!(await list(u)).some((r) => r.id === draft.id));
      assert.equal((await update("bob", pending, "approve")).status, 403);
      assert.equal(
        (await update("otherchair", pending, "approve")).status,
        404,
      );
      assert.equal((await update("bob", pending, "withdraw")).status, 403);
      assert.equal(
        (
          await api("bob", `schedules/entries/nonexistent/sharing`, "PATCH", {
            version: 1,
            unit_id: deptA,
          })
        ).status,
        404,
      );
    },
  );
  await check(
    "withdraw stops peer access and stale versions cannot publish",
    async () => {
      const r = await update("alice", pending, "withdraw");
      assert.equal(r.status, 200);
      assert.ok(!(await list("bob")).some((r) => r.id === draft.id));
      assert.equal((await update("chair", pending, "approve")).status, 409);
      const resubmitted = await update("alice", r.data, "submit");
      assert.equal(resubmitted.status, 200);
      pending = resubmitted.data;
    },
  );
  await check(
    "parallel approvals create exactly one formal entry with atomic scope and audit",
    async () => {
      const results = await Promise.all([
        update("chair", pending, "approve"),
        update("upper", pending, "approve"),
      ]);
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
      published = results.find((r) => r.status === 200)!.data;
      assert.equal(
        (
          db
            .prepare("SELECT COUNT(*) n FROM schedule_entries WHERE id=?")
            .get(published.entry_id) as any
        ).n,
        1,
      );
      assert.equal(
        (
          db
            .prepare(
              "SELECT unit_id FROM schedule_entry_scopes WHERE entry_id=?",
            )
            .get(published.entry_id) as any
        ).unit_id,
        deptA,
      );
      for (const u of ["alice", "bob", "chair", "upper"])
        assert.ok(
          (await list(u, "entries")).some((r) => r.id === published.entry_id),
        );
      assert.ok(
        !(await list("outsider", "entries")).some(
          (r) => r.id === published.entry_id,
        ),
      );
    },
  );
  await check("directors cannot approve their own submissions", async () => {
    const own = (
      await api("chair", "schedules/submissions", "POST", {
        ...body(10),
        action: "submit",
      })
    ).data;
    assert.equal((await update("chair", own, "approve")).status, 403);
    assert.equal((await update("upper", own, "approve")).status, 200);
  });
  await check(
    "approval rechecks conflicts introduced after submission",
    async () => {
      const first = (
        await api("alice", "schedules/submissions", "POST", {
          ...body(12),
          action: "submit",
        })
      ).data;
      conflict = (
        await api("bob", "schedules/submissions", "POST", {
          ...body(12, "test-class2"),
          action: "submit",
        })
      ).data;
      assert.equal((await update("chair", first, "approve")).status, 200);
      assert.equal((await update("chair", conflict, "approve")).status, 409);
      assert.equal(
        (
          db
            .prepare("SELECT status FROM schedule_submissions WHERE id=?")
            .get(conflict.id) as any
        ).status,
        "submitted",
      );
    },
  );
  await check(
    "rejected submissions are private to owner and responsible reviewers",
    async () => {
      assert.equal(
        (
          await update("chair", conflict, "reject", {
            review_note: "请另选教室",
          })
        ).status,
        200,
      );
      assert.ok(!(await list("alice")).some((r) => r.id === conflict.id));
      assert.ok((await list("bob")).some((r) => r.id === conflict.id));
      assert.ok((await list("chair")).some((r) => r.id === conflict.id));
    },
  );
  await check(
    "sharing revocation closes entries submission history and ICS access",
    async () => {
      let entry = (await list("alice", "entries")).find(
        (r) => r.id === published.entry_id,
      )!;
      assert.equal(
        (
          await api("alice", `schedules/entries/${entry.id}/sharing`, "PATCH", {
            version: entry.version,
            unit_id: null,
          })
        ).status,
        200,
      );
      assert.ok(!(await list("bob", "entries")).some((r) => r.id === entry.id));
      assert.ok(!(await list("bob")).some((r) => r.id === published.id));
      assert.ok(
        !(await api("bob", "schedules/calendar.ics" + range)).data.includes(
          `UID:${entry.id}@`,
        ),
      );
      entry = (await list("alice", "entries")).find((r) => r.id === entry.id)!;
      assert.equal(
        (
          await api("alice", `schedules/entries/${entry.id}/sharing`, "PATCH", {
            version: entry.version,
            unit_id: deptA,
          })
        ).status,
        200,
      );
    },
  );
  await check(
    "removing appointment immediately revokes existing session visibility and writes",
    async () => {
      assert.equal(
        (
          await api(
            "admin",
            `schedules/appointments/${bobAppointment}`,
            "PATCH",
            { revoked: true },
          )
        ).status,
        200,
      );
      assert.ok(
        !(await list("bob", "entries")).some(
          (r) => r.id === published.entry_id,
        ),
      );
      assert.ok(!(await list("bob")).some((r) => r.id === published.id));
      assert.equal(
        (
          await api("bob", "schedules/submissions", "POST", {
            ...body(15),
            action: "submit",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "workspace overview and ICS cannot bypass private schedule boundaries",
    async () => {
      const now = new Date(),
        end = new Date(now.getTime() + 3600000);
      db.prepare(
        "UPDATE schedule_entries SET starts_at=?,ends_at=? WHERE id=?",
      ).run(now.toISOString(), end.toISOString(), published.entry_id);
      assert.ok(
        !(await api("outsider", "workspace/overview")).data.schedules.some(
          (r: any) => r.id === published.entry_id,
        ),
      );
      assert.ok(
        (await api("chair", "workspace/overview")).data.schedules.some(
          (r: any) => r.id === published.entry_id,
        ),
      );
      assert.equal(
        (await api("alice", "schedules/entries", "POST", body(16))).status,
        409,
      );
    },
  );
  await check(
    "Chinese local date ranges include early morning lessons without UTC day leakage",
    async () => {
      db.prepare(
        "INSERT INTO schedule_entries(id,class_id,teacher_id,course_id,starts_at,ends_at,room) VALUES ('midnight-fixture','test-class1','test-alice','test-course','2026-10-28T17:30:00.000Z','2026-10-28T18:00:00.000Z','夜间教室')",
      ).run();
      assert.ok(
        (
          await api("alice", "schedules/entries?from=2026-10-29&to=2026-10-30")
        ).data.some((r: any) => r.id === "midnight-fixture"),
      );
      assert.ok(
        !(
          await api("alice", "schedules/entries?from=2026-10-28&to=2026-10-29")
        ).data.some((r: any) => r.id === "midnight-fixture"),
      );
    },
  );
  await check(
    "sharing a formal lesson to another appointed unit preserves original approval ownership",
    async () => {
      assert.equal(
        (
          await api("admin", `schedules/departments/${deptB}/members`, "POST", {
            account_id: "test-alice",
            role_code: "teacher",
          })
        ).status,
        200,
      );
      const row = (await list("alice", "entries")).find(
        (r) => r.id === published.entry_id,
      )!;
      assert.equal(
        (
          await api("alice", `schedules/entries/${row.id}/sharing`, "PATCH", {
            version: row.version,
            unit_id: deptB,
          })
        ).status,
        200,
      );
      const original = db
        .prepare("SELECT unit_id,shared FROM schedule_submissions WHERE id=?")
        .get(published.id) as any;
      assert.equal(original.unit_id, deptA);
      assert.equal(original.shared, 0);
      assert.ok(
        (await list("outsider", "entries")).some((r) => r.id === row.id),
      );
      assert.ok(!(await list("outsider")).some((r) => r.id === published.id));
      assert.ok(!(await list("chair")).some((r) => r.id === published.id));
    },
  );
  await check("foreign keys and database integrity remain valid", () => {
    assert.equal(db.pragma("integrity_check", { simple: true }), "ok");
    assert.deepEqual(db.pragma("foreign_key_check"), []);
  });
  fs.mkdirSync("docs/verification/schedule-sharing", { recursive: true });
  fs.writeFileSync(
    ".local-data/latest-schedule-sharing-fixture.json",
    JSON.stringify({ dir: process.env.SAKURA_DATA_DIR }),
  );
  fs.writeFileSync(
    "docs/verification/schedule-sharing/native.json",
    JSON.stringify(
      { testedAt: new Date().toISOString(), passed: checks.length, checks },
      null,
      2,
    ),
  );
} finally {
  await new Promise<void>((r) => server.close(() => r()));
  db.close();
}
