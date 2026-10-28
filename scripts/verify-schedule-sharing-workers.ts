import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
const base = process.argv[2] || "http://127.0.0.1:3003";
if (new URL(base).hostname !== "127.0.0.1")
  throw Error("Fixture creation is restricted to local Workers");
const key = randomUUID().slice(0, 8),
  checks: string[] = [],
  sessions = new Map<string, { cookie: string; csrf: string }>();
async function api(user: string, p: string, method = "GET", body?: unknown) {
  const session = sessions.get(user);
  const r = await fetch(base + "/api/v1/" + p, {
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
  const json = await r.json();
  return {
    status: r.status,
    data: json.data,
    message: json.message,
    cookie: r.headers.get("set-cookie"),
  };
}
async function login(user: string, facultyId: string, password: string) {
  const cap = (await api(user, "security/captcha?mode=math")).data;
  const letters = Array.from(
    cap.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
    (m: any) => m[1],
  ).join("");
  const match = letters.match(/^(\d)\+(\d)=\?$/)!;
  assert.ok(match);
  const r = await api(user, "auth/faculty-login", "POST", {
    facultyId,
    password,
    loginType: "account",
    captchaId: cap.captchaId,
    captchaAnswer: String(+match[1] + +match[2]),
  });
  assert.equal(r.status, 200);
  sessions.set(user, {
    cookie: r.cookie!.split(";")[0],
    csrf: r.data.csrfToken,
  });
}
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
async function create(p: string, body: Record<string, unknown>) {
  const r = await api("admin", p, "POST", body);
  assert.equal(r.status, 200, r.message);
  return r.data;
}
const password = fs
  .readFileSync(".local-data/cloudflare-initial-admin.txt", "utf8")
  .match(/^Password: (.+)$/m)![1];
await login("admin", "admin", password);
const accountIds: Record<string, string> = {};
let unit = "",
  other = "",
  draft: any,
  submitted: any,
  entry: any;
const range = "?from=2026-01-01&to=2027-01-01";
const list = async (user: string, r = "submissions") =>
  (await api(user, "schedules/" + r + range)).data as any[];
await check(
  "Workers additive migration supports department setup without raw SQL",
  async () => {
    const institution=(await create('organization/schools',{code:'CF-SHARING-'+key,name:'本地排课兼容测试学校'})).id;
    unit = (
      await create("schedules/departments", {
        code: "cf-" + key,
        institution_id:institution,
        name: "本地 Workers 测试室",
      })
    ).id;
    other = (
      await create("schedules/departments", {
        code: "cf-other-" + key,
        institution_id:institution,
        name: "其他测试室",
      })
    ).id;
    for (const user of ["teacher", "peer", "director", "outsider"]) {
      accountIds[user] = (
        await create("academic/faculty", {
          faculty_code: `cf_${user}_${key}`,
          email: `${user}_${key}@fixture.invalid`,
          full_name: user,
          password: "isolated-fixture-password",
        })
      ).id;
      await create(
        `schedules/departments/${user === "outsider" ? other : unit}/members`,
        {
          account_id: accountIds[user],
          role_code: user === "director" ? "director" : "teacher",
        },
      );
      await login(user, `cf_${user}_${key}`, "isolated-fixture-password");
    }
  },
);
const term = (
  await create("academic/terms", {
    code: "cf-term-" + key,
    name: "测试学期",
    starts_on: "2026-01-01",
    ends_on: "2027-12-31",
  })
).id;
const course = (
  await create("academic/courses", {
    code: "cf-course-" + key,
    name: "测试课程",
  })
).id;
const klass = (
  await create("academic/classes", {
    class_code: "cf-class-" + key,
    class_name: "测试班",
    grade_level: "高一",
  })
).id;
await create("academic/teaching-assignments", {
  teacher_id: accountIds.teacher,
  class_id: klass,
  course_id: course,
  term_id: term,
});
const body = {
  class_id: klass,
  course_id: course,
  unit_id: unit,
  starts_at: "2026-10-29T06:00:00.000Z",
  ends_at: "2026-10-29T07:00:00.000Z",
  room: "CF-" + key,
  note: "本地运行时验证",
};
await check(
  "Workers private draft stays invisible until explicitly submitted",
  async () => {
    const r = await api("teacher", "schedules/submissions", "POST", {
      ...body,
      action: "draft",
    });
    assert.equal(r.status, 200, r.message);
    draft = r.data;
    for (const user of ["peer", "director", "outsider", "admin"])
      assert.ok(!(await list(user)).some((s) => s.id === draft.id));
    const posted = await api(
      "teacher",
      `schedules/submissions/${draft.id}`,
      "PATCH",
      { version: draft.version, action: "submit" },
    );
    assert.equal(posted.status, 200, posted.message);
    submitted = posted.data;
    assert.ok((await list("peer")).some((s) => s.id === draft.id));
    assert.ok(!(await list("outsider")).some((s) => s.id === draft.id));
    assert.equal(
      (
        await api("peer", `schedules/submissions/${draft.id}`, "PATCH", {
          version: submitted.version,
          action: "approve",
        })
      ).status,
      403,
    );
  },
);
await check(
  "Workers transactionSync publishes one entry and rejects stale approval",
  async () => {
    const r = await api(
      "director",
      `schedules/submissions/${draft.id}`,
      "PATCH",
      { version: submitted.version, action: "approve" },
    );
    assert.equal(r.status, 200, r.message);
    entry = r.data;
    assert.equal(
      (
        await api("director", `schedules/submissions/${draft.id}`, "PATCH", {
          version: submitted.version,
          action: "approve",
        })
      ).status,
      409,
    );
    assert.ok(
      (await list("peer", "entries")).some((s) => s.id === entry.entry_id),
    );
    assert.ok(
      !(await list("outsider", "entries")).some((s) => s.id === entry.entry_id),
    );
  },
);
await check(
  "Workers sharing revocation hides formal and submitted records together",
  async () => {
    const row = (await list("teacher", "entries")).find(
      (s) => s.id === entry.entry_id,
    )!;
    assert.equal(
      (
        await api("teacher", `schedules/entries/${row.id}/sharing`, "PATCH", {
          version: row.version,
          unit_id: null,
        })
      ).status,
      200,
    );
    assert.ok(!(await list("peer", "entries")).some((s) => s.id === row.id));
    assert.ok(!(await list("peer")).some((s) => s.id === entry.id));
  },
);
assert.equal((await api("admin", "schedules/options")).status, 200);
fs.mkdirSync("docs/verification/schedule-sharing", { recursive: true });
fs.writeFileSync(
  "docs/verification/schedule-sharing/workers.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), base, passed: checks.length, checks },
    null,
    2,
  ),
);
