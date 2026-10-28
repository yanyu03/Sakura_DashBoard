import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import Database from "better-sqlite3";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { registerAuth } from "../server/auth";
import { registerAcademic } from "../server/academic";
import { registerSchedules } from "../server/schedules";
import { registerWorkspace } from "../server/workspace";
import { apiErrorHandler } from "../server/http";
import { hashPassword } from "../server/passwords";
import { classAccess, reply } from "../server/business";
import { applyOrganizationFoundation } from "../server/database/organizationFoundation";
import { applyIdentityHierarchy } from "../server/database/identityHierarchy";
import { applyAuthProtectionSchema } from "../server/authProtection";
import { applyScheduleSharing } from "../server/database/scheduleSharing";
fs.mkdirSync(".local-data", { recursive: true });
const dir = fs.mkdtempSync(path.resolve(".local-data", "organization-test-"));
process.env.SAKURA_DATA_DIR = dir;
process.env.COOKIE_SECURE = "false";
process.env.SAKURA_DEMO_MODE = "false";
const { sqliteDb: db } = await import("../server/sqliteDb");
const users = ["admin", "A", "B", "C", "D", "E", "F", "G", "Z", "alias"];
for (const id of users)
  db.prepare(
    "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role,default_tab,default_theme) VALUES (?,?,?,?,?,'主任','A数学组',?,'schedule-management','forest-tea')",
  ).run(
    "org-" + id,
    "org_" + id,
    `${id}@org.invalid`,
    hashPassword("isolated-org-fixture"),
    id,
    id === "admin" ? "admin" : "teacher",
  );
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
registerAcademic(app, db);
registerSchedules(app, db);
registerWorkspace(app, db);
app.get("/api/v1/academic/test/class/:id", (req, res) => {
  classAccess(db, res, req.params.id);
  reply(res, { allowed: true });
});
app.use(apiErrorHandler);
const server = createServer(app);
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const sessions = new Map<string, { cookie: string; csrf: string }>(),
  checks: string[] = [];
async function api(user: string, p: string, method = "GET", body?: unknown) {
  const s = sessions.get(user);
  const r = await fetch(base + "/api/v1/" + p, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(s ? { Cookie: s.cookie, "X-CSRF-Token": s.csrf } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await r.json();
  return {
    status: r.status,
    data: json.data,
    message: json.message,
    cookie: r.headers.get("set-cookie"),
  };
}
async function login(user: string) {
  const cap = (await api(user, "security/captcha")).data;
  const r = await api(user, "auth/faculty-login", "POST", {
    facultyId: "org_" + user,
    password: "isolated-org-fixture",
    loginType: "account",
    captchaId: cap.captchaId,
    captchaAnswer: "2468",
  });
  assert.equal(r.status, 200, r.message);
  sessions.set(user, {
    cookie: r.cookie!.split(";")[0],
    csrf: r.data.csrfToken,
  });
}
async function check(name: string, fn: () => unknown | Promise<unknown>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
async function post(p: string, body: Record<string, unknown>) {
  const r = await api("admin", p, "POST", body);
  assert.equal(r.status, 200, r.message);
  return r.data;
}
const config = async () => (await api("admin", "organization/admin")).data;
const appoint = (user: string, unit: string, role: string, other = {}) =>
  post("organization/appointments", {
    account_id: "org-" + user,
    unit_id: unit,
    role_code: role,
    ...other,
  });
const candidates = async (user: string, unit: string, course?: string) =>
  api(
    user,
    "organization/dispatchable-teachers?" +
      new URLSearchParams({
        unit_id: unit,
        ...(course ? { course_id: course } : {}),
      }),
  );
let school: any,
  foreign: any,
  party = "",
  affairs = "",
  grade = "",
  office = "",
  klassNode = "",
  mathGroup = "",
  otherGroup = "",
  subject = "",
  math = "",
  english = "",
  klass = "",
  term = "",
  aHead: any,
  aMember: any,
  bDirector: any,
  qualification: any,
  pending: any;
try {
  await check(
    "real v14 upgrade preserves account identities and creates scoped people without name merging",
    () => {
      const old = new Database(":memory:");
      old.pragma("foreign_keys=ON");
      const schema = JSON.parse(
        fs.readFileSync("cloudflare/schema.json", "utf8"),
      );
      for (const sql of schema.statements) old.exec(sql);
      for (const row of schema.ledger)
        old
          .prepare(
            "INSERT INTO schema_migrations(version,name,checksum) VALUES (?,?,?)",
          )
          .run(row.version, row.name, row.checksum);
      old
        .prepare(
          "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role) VALUES ('old','old','old@invalid','hash','同名','教师')",
        )
        .run();
      applyIdentityHierarchy(old);
      applyAuthProtectionSchema(old);
      applyScheduleSharing(old);
      for (const id of ["S", "T"]) {
        old.prepare("INSERT INTO institutions VALUES (?,?,?)").run(id, id, id);
        old
          .prepare(
            "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,NULL,'school','root','学校')",
          )
          .run("root" + id, id);
      }
      for (const [id, org, kind] of [
        ["staff", "S", "staff"],
        ["guardian", "S", "guardian"],
        ["foreign", "T", "staff"],
      ])
        old
          .prepare(
            "INSERT INTO identity_registry(id,institution_id,account_id,identity_kind,external_id,display_name) VALUES (?,?,?,?,?,?)",
          )
          .run(id, org, "old", kind, "001", "同名");
      const checksum = (
        old
          .prepare("SELECT checksum FROM schema_migrations WHERE version=12")
          .get() as any
      ).checksum;
      applyOrganizationFoundation(old);
      applyOrganizationFoundation(old);
      assert.equal(
        (old.prepare("SELECT COUNT(*) n FROM school_people").get() as any).n,
        2,
      );
      assert.equal(
        (
          old
            .prepare(
              "SELECT COUNT(DISTINCT person_id) n FROM identity_person_links WHERE institution_id='S'",
            )
            .get() as any
        ).n,
        1,
      );
      assert.equal(
        (
          old
            .prepare("SELECT checksum FROM schema_migrations WHERE version=12")
            .get() as any
        ).checksum,
        checksum,
      );
      assert.deepEqual(old.pragma("foreign_key_check"), []);
      old.close();
    },
  );
  for (const user of users) await login(user);
  await check(
    "organization mutations reject ordinary teachers and require authenticated sessions",
    async () => {
      assert.equal(
        (
          await api("B", "organization/schools", "POST", {
            code: "fake",
            name: "fake",
          })
        ).status,
        403,
      );
      assert.equal((await api("B", "organization/admin")).status, 403);
      assert.equal((await api("nobody", "organization/scope")).status, 401);
    },
  );
  await check(
    "constructs party academic affairs grade department office and class with validated parent types",
    async () => {
      school = await post("organization/schools", {
        code: "ORG-S",
        name: "组织测试学校",
      });
      foreign = await post("organization/schools", {
        code: "ORG-T",
        name: "其他学校",
      });
      const node = async (
        parent: string,
        type: string,
        code: string,
        name: string,
      ) =>
        (
          await post("organization/units", {
            parent_id: parent,
            unit_type: type,
            code,
            name,
          })
        ).id;
      party = await node(school.root_id, "party_committee", "PARTY", "校党委");
      affairs = await node(party, "academic_affairs", "ACADEMIC", "教务处");
      grade = await node(affairs, "grade_department", "GRADE-A", "A年级部");
      office = await node(grade, "grade_office", "OFFICE-A", "A年级办公室");
      klassNode = await node(office, "homeroom", "CLASS-A", "A班");
      const row = (await config()).units.find((u: any) => u.id === klassNode);
      assert.equal(
        row.path,
        "组织测试学校 / 校党委 / 教务处 / A年级部 / A年级办公室 / A班",
      );
      assert.equal(
        (
          await api("admin", "organization/units", "POST", {
            parent_id: party,
            unit_type: "homeroom",
            code: "bad",
            name: "错误班级",
          })
        ).status,
        422,
      );
    },
  );
  await check(
    "subject groups link to a scoped subject and one or more catalog courses",
    async () => {
      subject = (
        await post("organization/subjects", {
          institution_id: school.id,
          code: "MATH",
          name: "数学",
        })
      ).id;
      math = (
        await post("academic/courses", { code: "org-math", name: "数学课程" })
      ).id;
      english = (
        await post("academic/courses", {
          code: "org-english",
          name: "英语课程",
        })
      ).id;
      await post("organization/subject-courses", {
        subject_id: subject,
        course_id: math,
      });
      mathGroup = (
        await post("organization/units", {
          parent_id: grade,
          unit_type: "subject_group",
          code: "MATH-A",
          name: "A年级数学组",
          subject_id: subject,
        })
      ).id;
      const otherGrade = (
        await post("organization/units", {
          parent_id: affairs,
          unit_type: "grade_department",
          code: "GRADE-B",
          name: "B年级部",
        })
      ).id;
      otherGroup = (
        await post("organization/units", {
          parent_id: otherGrade,
          unit_type: "subject_group",
          code: "MATH-B",
          name: "B年级数学组",
          subject_id: subject,
        })
      ).id;
      assert.equal(
        (
          await api("admin", "organization/units", "POST", {
            parent_id: foreign.root_id,
            unit_type: "subject_group",
            code: "bad-subject",
            name: "跨校",
            subject_id: subject,
          })
        ).status,
        422,
      );
    },
  );
  await check(
    "A retains one person and staff identity while holding class lead and subject membership",
    async () => {
      aHead = await appoint("A", klassNode, "homeroom_teacher", {
        starts_on: "2020-01-01",
      });
      aMember = await appoint("A", mathGroup, "subject_member", {
        starts_on: "2020-01-01",
      });
      bDirector = await appoint("B", mathGroup, "director", {
        starts_on: "2020-01-01",
      });
      assert.equal(aHead.person_id, aMember.person_id);
      assert.equal(
        (
          db
            .prepare(
              "SELECT COUNT(*) n FROM identity_registry WHERE account_id='org-A' AND institution_id=?",
            )
            .get(school.id) as any
        ).n,
        1,
      );
      assert.equal(
        (
          await api("admin", "organization/appointments", "POST", {
            account_id: "org-C",
            unit_id: mathGroup,
            role_code: "homeroom_teacher",
          })
        ).status,
        422,
      );
      assert.equal(
        (
          await api("admin", "organization/appointments", "POST", {
            account_id: "org-C",
            unit_id: klassNode,
            role_code: "homeroom_teacher",
          })
        ).status,
        422,
      );
    },
  );
  await check(
    "binding the academic class activates real homeroom permissions and retires legacy head field authority",
    async () => {
      klass = (
        await post("academic/classes", {
          class_code: "ORG-A",
          class_name: "A班",
          grade_level: "高一",
          head_teacher_id: "org-C",
        })
      ).id;
      await post("organization/class-links", {
        unit_id: klassNode,
        class_id: klass,
      });
      assert.equal(
        (await api("A", "academic/test/class/" + klass)).status,
        200,
      );
      assert.equal(
        (await api("C", "academic/test/class/" + klass)).status,
        403,
      );
      const classes = (await api("A", "academic/classes")).data;
      assert.ok(
        classes.some(
          (c: any) =>
            c.id === klass &&
            c.head_teacher_id === "org-A" &&
            c.head_teacher_source === "organization_appointment",
        ),
      );
      assert.equal(
        (await api("B", "academic/test/class/" + klass)).status,
        403,
      );
      assert.ok(
        !(await api("B", "academic/classes")).data.some(
          (c: any) => c.id === klass,
        ),
      );
    },
  );
  await check(
    "expired head appointments lose class authority without falling back to the old head",
    async () => {
      db.prepare(
        "UPDATE identity_appointments SET starts_on='2000-01-01',ends_on='2000-12-31' WHERE id=?",
      ).run(aHead.id);
      assert.equal(
        (await api("A", "academic/test/class/" + klass)).status,
        403,
      );
      assert.equal(
        (await api("C", "academic/test/class/" + klass)).status,
        403,
      );
      db.prepare(
        "UPDATE identity_appointments SET starts_on='2020-01-01',ends_on=NULL WHERE id=?",
      ).run(aHead.id);
      assert.equal(
        (await api("A", "academic/test/class/" + klass)).status,
        200,
      );
    },
  );
  await check(
    "B discovers A once with both current jobs only after course eligibility is confirmed",
    async () => {
      assert.equal(
        (await candidates("B", mathGroup, math)).data.teachers.length,
        0,
      );
      qualification = await post("organization/qualifications", {
        appointment_id: aMember.id,
        course_id: math,
      });
      const result = await candidates("B", mathGroup, math);
      assert.equal(result.status, 200);
      assert.equal(result.data.teachers.length, 1);
      const A = result.data.teachers[0];
      assert.equal(A.account_id, "org-A");
      assert.equal(A.availability, "needs_confirmation");
      assert.deepEqual(
        new Set(A.appointments.map((a: any) => a.role_code)),
        new Set(["homeroom_teacher", "subject_member"]),
      );
      assert.equal(A.qualifications[0].course_id, math);
      assert.ok(!JSON.stringify(result.data).includes("password_hash"));
      assert.ok(!JSON.stringify(result.data).includes("@org.invalid"));
    },
  );
  await check(
    "wrong courses missing qualifications future expired or archived staff never become candidates",
    async () => {
      assert.equal(
        (
          await api("admin", "organization/qualifications", "POST", {
            appointment_id: aMember.id,
            course_id: english,
          })
        ).status,
        422,
      );
      await appoint("D", mathGroup, "subject_member");
      const expired = await appoint("E", mathGroup, "subject_member", {
        starts_on: "2000-01-01",
        ends_on: "2000-12-31",
      });
      assert.ok(expired.id);
      await appoint("F", mathGroup, "subject_member", {
        starts_on: "2099-01-01",
      });
      const archived = await appoint("G", mathGroup, "subject_member");
      await post("organization/qualifications", {
        appointment_id: archived.id,
        course_id: math,
      });
      db.prepare(
        "UPDATE faculty_users SET status='ARCHIVED' WHERE id='org-G'",
      ).run();
      assert.deepEqual(
        (await candidates("B", mathGroup, math)).data.teachers.map(
          (t: any) => t.account_id,
        ),
        ["org-A"],
      );
      assert.equal(
        (await candidates("B", mathGroup, english)).data.teachers.length,
        0,
      );
    },
  );
  await check(
    "unrelated groups and foreign institutions cannot inspect or self-assign the organization directory",
    async () => {
      const z = await appoint("Z", otherGroup, "subject_member");
      await post("organization/qualifications", {
        appointment_id: z.id,
        course_id: math,
      });
      assert.equal((await candidates("B", otherGroup, math)).status, 403);
      assert.equal((await candidates("Z", mathGroup, math)).status, 403);
      assert.equal((await candidates("B", foreign.root_id, math)).status, 403);
      assert.equal(
        (
          await api("B", "organization/appointments", "POST", {
            account_id: "org-B",
            unit_id: affairs,
            role_code: "director",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "higher responsible appointments can discover descendant subject groups and directory entries remain deduplicated",
    async () => {
      await appoint("C", affairs, "director");
      const result = await candidates("C", affairs, math);
      assert.equal(result.status, 200);
      assert.deepEqual(
        new Set(result.data.teachers.map((t: any) => t.account_id)),
        new Set(["org-A", "org-Z"]),
      );
    },
  );
  await check(
    "revoked qualifications disappear from an already logged in supervisor directory",
    async () => {
      assert.equal(
        (
          await api(
            "admin",
            "organization/qualifications/" + qualification.id,
            "PATCH",
            { version: 1, revoked: true },
          )
        ).status,
        200,
      );
      assert.ok(
        !(await candidates("B", mathGroup, math)).data.teachers.some(
          (t: any) => t.account_id === "org-A",
        ),
      );
      qualification = await post("organization/qualifications", {
        appointment_id: aMember.id,
        course_id: math,
      });
    },
  );
  await check(
    "existing current teaching proves eligibility only through a same-school class binding",
    async () => {
      term = (
        await post("academic/terms", {
          code: "ORG-TERM",
          name: "测试学期",
          starts_on: "2026-01-01",
          ends_on: "2027-12-31",
        })
      ).id;
      await post("academic/teaching-assignments", {
        teacher_id: "org-A",
        class_id: klass,
        course_id: math,
        term_id: term,
      });
      await api(
        "admin",
        "organization/qualifications/" + qualification.id,
        "PATCH",
        { version: 1, revoked: true },
      );
      const result = await candidates("B", mathGroup, math);
      assert.ok(
        result.data.teachers.some(
          (t: any) =>
            t.account_id === "org-A" &&
            t.qualifications.some(
              (q: any) => q.evidence === "current_teaching",
            ),
        ),
      );
    },
  );
  await check(
    "staff discovery does not reveal drafts or create course assignments or sessions for others",
    async () => {
      const r = await api("A", "schedules/submissions", "POST", {
        class_id: klass,
        course_id: math,
        unit_id: mathGroup,
        starts_at: "2026-11-01T01:00:00.000Z",
        ends_at: "2026-11-01T02:00:00.000Z",
        room: "测试楼201",
        note: "PRIVATE-DRAFT-ONLY-A",
        action: "draft",
      });
      assert.equal(r.status, 200, r.message);
      pending = r.data;
      assert.ok(
        !(
          await api("B", "schedules/submissions?from=2026-10-01&to=2026-12-01")
        ).data.some((s: any) => s.id === pending.id),
      );
      const before = (
        db.prepare("SELECT COUNT(*) n FROM teaching_assignments").get() as any
      ).n;
      await candidates("B", mathGroup, math);
      assert.equal(
        (db.prepare("SELECT COUNT(*) n FROM teaching_assignments").get() as any)
          .n,
        before,
      );
    },
  );
  await check(
    "same person linked to another managerial account cannot self-approve",
    async () => {
      db.prepare("INSERT INTO person_account_links VALUES (?,?,?)").run(
        school.id,
        aHead.person_id,
        "org-alias",
      );
      await appoint("alias", mathGroup, "director");
      const submitted = await api(
        "A",
        "schedules/submissions/" + pending.id,
        "PATCH",
        { version: pending.version, action: "submit" },
      );
      assert.equal(submitted.status, 200, submitted.message);
      pending = submitted.data;
      assert.equal(
        (
          await api("alias", "schedules/submissions/" + pending.id, "PATCH", {
            version: pending.version,
            action: "approve",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "scoped director approves A while a subject member cannot bypass course or class permissions",
    async () => {
      assert.equal(
        (
          await api("B", "schedules/submissions/" + pending.id, "PATCH", {
            version: pending.version,
            action: "approve",
          })
        ).status,
        200,
      );
      assert.equal(
        (await api("B", "academic/test/class/" + klass)).status,
        403,
      );
      assert.equal(
        (
          await api("A", "schedules/submissions", "POST", {
            class_id: klass,
            course_id: english,
            unit_id: mathGroup,
            starts_at: "2026-11-02T01:00:00.000Z",
            ends_at: "2026-11-02T02:00:00.000Z",
            room: "测试楼201",
            action: "submit",
          })
        ).status,
        403,
      );
    },
  );
  await check('substitution requires scoped course eligibility and approval without granting class record access',async()=>{
    const entry=(await api('A','schedules/entries?from=2026-11-01&to=2026-11-02')).data.find((row:any)=>row.teacher_id==='org-A');
    const payload={entry_id:entry.id,version:entry.version,reason:'测试代课协调',target:{teacher_id:'org-D',starts_at:'2026-11-03T01:00:00.000Z',ends_at:'2026-11-03T02:00:00.000Z',room:'测试楼202'}};
    assert.equal((await api('A','schedules/changes','POST',payload)).status,403);
    const D=(await config()).members.find((a:any)=>a.account_id==='org-D'&&a.unit_id===mathGroup&&a.role_code==='subject_member');
    await post('organization/qualifications',{appointment_id:D.id,course_id:math});
    const change=await api('A','schedules/changes','POST',payload);assert.equal(change.status,200,change.message);
    const row=(await api('B','schedules/changes')).data.find((r:any)=>r.id===change.data.id);
    assert.equal((await api('B','schedules/changes/'+row.id,'PATCH',{version:row.version,status:'approved'})).status,200);
    assert.ok((await api('D','schedules/entries?from=2026-11-03&to=2026-11-04')).data.some((r:any)=>r.id===entry.id));
    assert.equal((await api('D','academic/test/class/'+klass)).status,403);
  });
  await check(
    "revoking group membership keeps the independent class lead job and removes dispatch eligibility",
    async () => {
      await api("admin", "schedules/appointments/" + aMember.id, "PATCH", {
        revoked: true,
      });
      assert.ok(
        !(await candidates("B", mathGroup, math)).data.teachers.some(
          (t: any) => t.account_id === "org-A",
        ),
      );
      assert.equal(
        (await api("A", "academic/test/class/" + klass)).status,
        200,
      );
    },
  );
  await check(
    "archiving a parent invalidates descendant lookup class access and new schedule writes",
    async () => {
      assert.equal(
        (
          await api("admin", "organization/units/" + grade, "PATCH", {
            archived: true,
          })
        ).status,
        200,
      );
      assert.equal((await candidates("B", mathGroup, math)).status, 403);
      assert.equal(
        (await api("A", "academic/test/class/" + klass)).status,
        403,
      );
      assert.equal(
        (
          await api("A", "schedules/submissions", "POST", {
            class_id: klass,
            course_id: math,
            starts_at: "2026-11-02T01:00:00Z",
            ends_at: "2026-11-02T02:00:00Z",
            room: "X",
            action: "draft",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "cross-school class links semantic rewrites and identity-account relinking are rejected",
    () => {
      assert.throws(() =>
        db
          .prepare(
            "UPDATE organization_unit_profiles SET unit_type='division' WHERE unit_id=?",
          )
          .run(party),
      );
      const registry = db
        .prepare(
          "SELECT id FROM identity_registry WHERE account_id='org-A' AND institution_id=?",
        )
        .get(school.id) as any;
      assert.throws(() =>
        db
          .prepare("UPDATE identity_registry SET account_id='org-D' WHERE id=?")
          .run(registry.id),
      );
      assert.throws(() =>
        db
          .prepare("INSERT INTO organization_class_links VALUES (?,?,?)")
          .run("missing", foreign.id, klassNode),
      );
    },
  );
  await check(
    "hierarchical reporting supports higher responsible jobs and rejects self supervision through an alias",
    async () => {
      const manager = await appoint("alias", affairs, "director");
      assert.equal(
        (
          await api("admin", "organization/appointments", "POST", {
            account_id: "org-A",
            unit_id: otherGroup,
            role_code: "mentor",
            supervisor_appointment_id: manager.id,
          })
        ).status,
        422,
      );
      const C = (await config()).members.find(
        (m: any) =>
          m.account_id === "org-C" &&
          m.unit_id === affairs &&
          m.role_code === "director",
      );
      const result = await appoint("D", otherGroup, "mentor", {
        supervisor_appointment_id: C.id,
      });
      assert.ok(
        db
          .prepare(
            "SELECT id FROM identity_reporting_lines WHERE subordinate_id=? AND supervisor_id=?",
          )
          .get(result.id, C.id),
      );
    },
  );
  await check(
    "schema migration is idempotent and all foreign keys and integrity checks pass",
    () => {
      applyOrganizationFoundation(db);
      assert.equal(
        (
          db
            .prepare("SELECT MAX(version) v FROM schema_migrations")
            .get() as any
        ).v,
        15,
      );
      assert.equal(db.pragma("integrity_check", { simple: true }), "ok");
      assert.deepEqual(db.pragma("foreign_key_check"), []);
    },
  );
  fs.mkdirSync("docs/verification/organization", { recursive: true });
  fs.writeFileSync(
    "docs/verification/organization/native.json",
    JSON.stringify(
      { testedAt: new Date().toISOString(), passed: checks.length, checks },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    ".local-data/latest-organization-fixture.json",
    JSON.stringify({
      dir,
      school,
      foreign,
      grade,
      office,
      klassNode,
      mathGroup,
      otherGroup,
      subject,
      math,
      english,
      klass,
      term,
    }),
  );
} finally {
  await new Promise<void>((r) => server.close(() => r()));
  db.close();
}
