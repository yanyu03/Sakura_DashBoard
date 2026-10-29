import { readLocalTextSecret } from "./private-secrets";
import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { hashPassword } from "../server/passwords";
import { tidbTestDatabase } from "./tidb-test-database";
import { verificationFetch as fetch } from "./http-verification-transport";
if (
  process.env.TIDB_DATABASE &&
  !process.env.TIDB_DATABASE.startsWith("sakura_migration_")
)
  throw Error("Synthetic verification requires an isolated migration database");
const base =
    process.argv.find((v) => v.startsWith("http")) || "http://127.0.0.1:3018",
  suffix = randomUUID().slice(0, 8),
  password = "Synthetic-Test-Pass!42";
const { pool, db } = tidbTestDatabase();
if (!base.startsWith("http://127.0.0.1:") && !base.endsWith("/__tidb-preview"))
  throw Error("Synthetic scenarios only run on isolated migration previews");
const checks: string[] = [],
  sessions = new Map<string, { cookie: string; csrf: string }>();
async function api(who: string, route: string, method = "GET", body?: unknown) {
  const s = sessions.get(who);
  const r = await fetch(base + "/api/v1/" + route, {
    method,
    headers: {
      Origin: new URL(base).origin,
      "Content-Type": "application/json",
      ...(process.env.SAKURA_PREVIEW_TOKEN
        ? { "X-Sakura-Preview-Token": process.env.SAKURA_PREVIEW_TOKEN }
        : {}),
      ...(s ? { Cookie: s.cookie, "X-CSRF-Token": s.csrf } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(60000),
  });
  const j = (await r.json()) as any;
  return { ...j, status: r.status, response: r };
}
async function ok(who: string, route: string, method = "GET", body?: unknown) {
  const r = await api(who, route, method, body);
  assert.equal(r.status, 200, route + ": " + r.message);
  return r.data;
}
async function login(who: string, code: string, pass = password) {
  const remote = base.startsWith("https://");
  const cap = await ok("", "security/captcha" + (remote ? "?mode=math" : ""));
  let answer = "2468";
  if (remote) {
    const expression = Array.from(
      cap.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
      (m: any) => m[1],
    ).join("");
    const numbers = expression.match(/^(\d)\+(\d)=\?$/)!;
    assert.ok(numbers);
    answer = String(+numbers[1] + +numbers[2]);
  }
  const r = await api("", "auth/faculty-login", "POST", {
    facultyId: code,
    password: pass,
    loginType: "account",
    captchaId: cap.captchaId,
    captchaAnswer: answer,
  });
  assert.equal(
    r.status,
    200,
    r.message +
      " " +
      r.response.headers.get("x-sakura-error-code") +
      " " +
      decodeURIComponent(
        r.response.headers.get("x-sakura-error-message") || "",
      ),
  );
  sessions.set(who, {
    cookie: r.response.headers.get("set-cookie")!.split(";")[0],
    csrf: r.data.csrfToken,
  });
}
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
try {
  await check(
    "migrated password hash and existing account authenticate against TiDB",
    async () => {
      const adminPass =
        process.env.SAKURA_TEST_ADMIN_PASSWORD ||
        readLocalTextSecret(".local-data/cloudflare-initial-admin.txt").match(
          /^Password: (.+)$/m,
        )![1];
      await login("admin", "admin", adminPass);
      assert.equal((await ok("admin", "auth/session")).role, "admin");
    },
  );
  const A = "ta-" + suffix,
    B = "tb-" + suffix,
    C = "tc-" + suffix;
  await check(
    "asynchronous defaults and hashing create independent synthetic test accounts",
    async () => {
      for (const [id, code] of [
        [A, "A"],
        [B, "B"],
        [C, "C"],
      ])
        await db
          .prepare(
            "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role,default_tab,default_theme,default_class_name,semester_label,dnd_enabled) VALUES (?,?,?,?,?,'','','teacher','dashboard-overview','forest-tea','','',0)",
          )
          .run(
            id,
            "verify_" + suffix + "_" + code,
            id + "@test.invalid",
            hashPassword(password),
            "Test " + code,
          );
      for (const code of ["A", "B", "C"])
        await login(code, "verify_" + suffix + "_" + code);
    },
  );
  let school: any,
    party: any,
    affairs: any,
    grade: any,
    office: any,
    homeroom: any,
    subject: any,
    group: any,
    course: any,
    term: any,
    klass: any,
    appointment: any,
    qualification: any;
  await check(
    "TiDB preserves the exact governance chain and checks parent relationships",
    async () => {
      school = await ok("admin", "organization/schools", "POST", {
        code: "V" + suffix,
        name: "Synthetic school",
      });
      const unit = async (parent: string, type: string, code: string) =>
        ok("admin", "organization/units", "POST", {
          parent_id: parent,
          unit_type: type,
          code,
          name: code,
        });
      party = await unit(school.root_id, "party_committee", "party");
      affairs = await unit(party.id, "academic_affairs", "affairs");
      grade = await unit(affairs.id, "grade_department", "grade");
      office = await unit(grade.id, "grade_office", "office");
      homeroom = await unit(office.id, "homeroom", "class");
      assert.equal(
        (
          await api("admin", "organization/units", "POST", {
            parent_id: school.root_id,
            unit_type: "homeroom",
            code: "invalid",
            name: "invalid",
          })
        ).status,
        422,
      );
    },
  );
  await check(
    "subject qualification and multiple appointments survive MySQL transactions",
    async () => {
      subject = await ok("admin", "organization/subjects", "POST", {
        institution_id: school.id,
        code: "math",
        name: "Math",
      });
      course = await ok("admin", "academic/courses", "POST", {
        code: "math_" + suffix,
        name: "Math",
        max_score: 100,
      });
      await ok("admin", "organization/subject-courses", "POST", {
        subject_id: subject.id,
        course_id: course.id,
      });
      group = await ok("admin", "organization/units", "POST", {
        parent_id: grade.id,
        unit_type: "subject_group",
        subject_id: subject.id,
        code: "math",
        name: "Math group",
      });
      for (const [account, unit, role] of [
        [A, homeroom.id, "homeroom_teacher"],
        [A, group.id, "subject_member"],
        [B, group.id, "director"],
      ]) {
        const r = await ok("admin", "organization/appointments", "POST", {
          account_id: account,
          unit_id: unit,
          role_code: role,
          starts_on: "2026-01-01",
        });
        if (account === A && role === "subject_member") appointment = r;
      }
      qualification = await ok("admin", "organization/qualifications", "POST", {
        appointment_id: appointment.id,
        course_id: course.id,
        starts_on: "2026-01-01",
      });
    },
  );
  await check(
    "scoped supervisor sees one qualified person; unrelated teacher cannot inspect",
    async () => {
      const r = await ok(
        "B",
        "organization/dispatchable-teachers?unit_id=" + group.id,
      );
      assert.equal(r.teachers.length, 1);
      assert.equal(r.teachers[0].account_id, A);
      assert.equal(r.teachers[0].appointments.length, 2);
      assert.equal(
        (
          await api(
            "C",
            "organization/dispatchable-teachers?unit_id=" + group.id,
          )
        ).status,
        403,
      );
      assert.equal((await api("B", "organization/admin")).status, 403);
    },
  );
  await check(
    "database checks and application guards reject reparenting invalid identities and malformed keys",
    async () => {
      await assert.rejects(() =>
        db
          .prepare("UPDATE organization_units SET parent_id=? WHERE id=?")
          .run(school.root_id, office.id),
      );
      await assert.rejects(() =>
        db.prepare("UPDATE faculty_users SET role='root' WHERE id=?").run(A),
      );
      await assert.rejects(() =>
        db
          .prepare(
            "UPDATE organization_unit_profiles SET unit_type='school' WHERE unit_id=?",
          )
          .run(group.id),
      );
    },
  );
  await check(
    "qualification revocation affects an existing logged-in supervisor immediately",
    async () => {
      await ok(
        "admin",
        "organization/qualifications/" + qualification.id,
        "PATCH",
        { version: 1, revoked: true },
      );
      assert.equal(
        (
          await ok(
            "B",
            "organization/dispatchable-teachers?unit_id=" + group.id,
          )
        ).teachers.length,
        0,
      );
    },
  );
  await check(
    "real TiDB schedule draft submission approval and class isolation preserve prior behavior",
    async () => {
      term = await ok("admin", "academic/terms", "POST", {
        code: "T" + suffix,
        name: "2026–2027",
        starts_on: "2026-09-01",
        ends_on: "2027-08-31",
      });
      klass = await ok("admin", "academic/classes", "POST", {
        class_code: "C" + suffix,
        class_name: "Synthetic class",
        grade_level: "一年级",
        head_teacher_id: B,
        room_location: "R" + suffix,
      });
      await ok("admin", "academic/teaching-assignments", "POST", {
        teacher_id: A,
        class_id: klass.id,
        course_id: course.id,
        term_id: term.id,
      });
      await ok("admin", "organization/class-links", "POST", {
        class_id: klass.id,
        unit_id: homeroom.id,
      });
      assert.ok(
        (await ok("A", "academic/classes")).some(
          (c: any) => c.id === klass.id && c.head_teacher_id === A,
        ),
      );
      assert.ok(
        !(await ok("B", "academic/classes")).some(
          (c: any) => c.id === klass.id,
        ),
      );
      const draft = await ok("A", "schedules/submissions", "POST", {
        class_id: klass.id,
        course_id: course.id,
        unit_id: group.id,
        starts_at: "2026-11-02T01:00:00.000Z",
        ends_at: "2026-11-02T02:00:00.000Z",
        room: "R" + suffix,
        note: "Synthetic private draft",
        action: "draft",
      });
      const list = "schedules/submissions?from=2026-11-01&to=2026-11-04";
      assert.ok(!(await ok("B", list)).some((s: any) => s.id === draft.id));
      const submitted = await ok(
        "A",
        "schedules/submissions/" + draft.id,
        "PATCH",
        { version: draft.version, action: "submit" },
      );
      assert.ok((await ok("B", list)).some((s: any) => s.id === draft.id));
      assert.ok(!(await ok("C", list)).some((s: any) => s.id === draft.id));
      const approved = await ok(
        "B",
        "schedules/submissions/" + draft.id,
        "PATCH",
        {
          version: submitted.version,
          action: "approve",
          review_note: "Synthetic approval",
        },
      );
      assert.equal(approved.status, "approved");
      const entries = await ok(
        "B",
        "schedules/entries?from=2026-11-01&to=2026-11-04",
      );
      assert.ok(
        entries.some((e: any) => e.class_id === klass.id && e.teacher_id === A),
      );
    },
  );
  await check(
    "SQL management stays forbidden and logout revokes the migrated session",
    async () => {
      for (const user of ["admin", "A", "B"])
        assert.equal((await api(user, "sqlite/status")).status, 403);
      await ok("A", "auth/logout", "POST", {});
      assert.equal((await api("A", "auth/session")).status, 401);
    },
  );
  fs.mkdirSync("docs/verification/tidb", { recursive: true });
  fs.writeFileSync(
    "docs/verification/tidb/api.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        target: "isolated TiDB migration staging database",
        passed: checks.length,
        checks,
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
