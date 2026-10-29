import {readLocalTextSecret} from './private-secrets';
import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
const base = process.argv[2] || "http://127.0.0.1:3003";
if (new URL(base).hostname !== "127.0.0.1")
  throw Error("Organization fixtures are restricted to local Workers");
const key = randomUUID().slice(0, 8),
  checks: string[] = [],
  sessions = new Map<string, { cookie: string; csrf: string }>();
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
async function login(user: string, faculty: string, password: string) {
  const cap = (await api(user, "security/captcha?mode=math")).data,
    letters = Array.from(
      cap.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
      (m: any) => m[1],
    ).join(""),
    match = letters.match(/^(\d)\+(\d)=\?$/)!;
  assert.ok(match);
  const r = await api(user, "auth/faculty-login", "POST", {
    facultyId: faculty,
    password,
    loginType: "account",
    captchaId: cap.captchaId,
    captchaAnswer: String(+match[1] + +match[2]),
  });
  assert.equal(r.status, 200, r.message);
  sessions.set(user, {
    cookie: r.cookie!.split(";")[0],
    csrf: r.data.csrfToken,
  });
}
async function post(p: string, body: Record<string, unknown>) {
  const r = await api("admin", p, "POST", body);
  assert.equal(r.status, 200, r.message);
  return r.data;
}
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
const password = readLocalTextSecret(".local-data/cloudflare-initial-admin.txt")
  .match(/^Password: (.+)$/m)![1];
await login("admin", "admin", password);
let school: any,
  group = "",
  grade = "",
  klass = "",
  course = "",
  subject = "",
  A = "",
  B = "",
  member: any,
  qual: any;
await check(
  "Workers upgrades an existing schema and creates typed governance chain through API",
  async () => {
    school = await post("organization/schools", {
      code: "CF-ORG-" + key,
      name: "本地学校",
    });
    let parent = school.root_id;
    for (const [type, code, name] of [
      ["party_committee", "P", "校党委"],
      ["academic_affairs", "AC", "教务处"],
      ["grade_department", "G", "A年级部"],
      ["grade_office", "O", "A年级办公室"],
      ["homeroom", "C", "A班"],
    ]) {
      parent = (
        await post("organization/units", {
          parent_id: parent,
          unit_type: type,
          code,
          name,
        })
      ).id;
      if (type === "grade_department") grade = parent;
    }
    klass = (
      await post("academic/classes", {
        class_code: "CF-O-" + key,
        class_name: "A班",
        grade_level: "高一",
      })
    ).id;
    await post("organization/class-links", {
      class_id: klass,
      unit_id: parent,
    });
    subject = (
      await post("organization/subjects", {
        institution_id: school.id,
        code: "MATH",
        name: "数学",
      })
    ).id;
    course = (
      await post("academic/courses", { code: "CF-MATH-" + key, name: "数学" })
    ).id;
    await post("organization/subject-courses", {
      subject_id: subject,
      course_id: course,
    });
    group = (
      await post("organization/units", {
        parent_id: grade,
        unit_type: "subject_group",
        code: "MATH-G",
        name: "数学组",
        subject_id: subject,
      })
    ).id;
    for (const user of ["A", "B"]) {
      const id = (
        await post("academic/faculty", {
          faculty_code: `cf_org_${user}_${key}`,
          email: `${user}_${key}@org.invalid`,
          full_name: user,
          password: "isolated-org-fixture",
        })
      ).id;
      if (user === "A") A = id;
      else B = id;
      await login(user, `cf_org_${user}_${key}`, "isolated-org-fixture");
    }
    const head = await post("organization/appointments", {
      account_id: A,
      unit_id: parent,
      role_code: "homeroom_teacher",
    });
    member = await post("organization/appointments", {
      account_id: A,
      unit_id: group,
      role_code: "subject_member",
    });
    assert.equal(head.person_id, member.person_id);
    await post("organization/appointments", {
      account_id: B,
      unit_id: group,
      role_code: "director",
    });
  },
);
await check(
  "Workers supports real class leadership without exposing class records to the subject supervisor",
  async () => {
    assert.ok(
      (await api("A", "academic/classes")).data.some(
        (c: any) => c.id === klass && c.head_teacher_id === A,
      ),
    );
    assert.ok(
      !(await api("B", "academic/classes")).data.some(
        (c: any) => c.id === klass,
      ),
    );
    assert.equal((await api("B", "organization/admin")).status, 403);
  },
);
await check(
  "Workers director sees one qualified person with both positions after explicit qualification",
  async () => {
    qual = await post("organization/qualifications", {
      appointment_id: member.id,
      course_id: course,
    });
    const r = await api(
      "B",
      "organization/dispatchable-teachers?unit_id=" +
        group +
        "&course_id=" +
        course,
    );
    assert.equal(r.status, 200, r.message);
    assert.equal(r.data.teachers.length, 1);
    assert.equal(r.data.teachers[0].account_id, A);
    assert.equal(r.data.teachers[0].appointments.length, 2);
    assert.equal(r.data.teachers[0].availability, "needs_confirmation");
  },
);
await check(
  "Workers revoke and parent archival invalidate previously logged-in directory access",
  async () => {
    assert.equal(
      (
        await api("admin", "organization/qualifications/" + qual.id, "PATCH", {
          version: 1,
          revoked: true,
        })
      ).status,
      200,
    );
    assert.equal(
      (await api("B", "organization/dispatchable-teachers?unit_id=" + group))
        .data.teachers.length,
      0,
    );
    await post("organization/qualifications", {
      appointment_id: member.id,
      course_id: course,
    });
    assert.equal(
      (
        await api("admin", "organization/units/" + grade, "PATCH", {
          archived: true,
        })
      ).status,
      200,
    );
    assert.equal(
      (await api("B", "organization/dispatchable-teachers?unit_id=" + group))
        .status,
      403,
    );
  },
);
fs.mkdirSync("docs/verification/organization", { recursive: true });
fs.writeFileSync(
  "docs/verification/organization/workers.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), base, passed: checks.length, checks },
    null,
    2,
  ),
);
