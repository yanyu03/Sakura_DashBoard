import {readLocalTextSecret} from './private-secrets';
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { verificationFetch as fetch } from "./http-verification-transport";
const base =
    process.argv.find((v) => v.startsWith("http")) || "http://127.0.0.1:3003",
  readOnly = process.argv.includes("--read-only");
const password = readLocalTextSecret(".local-data/cloudflare-initial-admin.txt")
  .match(/^Password: (.+)$/m)![1];
let cookie = "",
  csrf = "";
const checks: { name: string; status: string }[] = [];
async function api(route: string, method = "GET", body?: unknown) {
  const response = await fetch(`${base}/api/v1/${route}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: base,
      ...(cookie ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
  });
  return { status: response.status, json: await response.json(), response };
}
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push({ name, status: "PASS" });
  console.log(`PASS ${name}`);
}
await check("assets and anonymous boundary", async () => {
  const page = await fetch(`${base}/?design=1.0Sakura`);
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes("root"));
  assert.equal((await api("workspace/overview")).status, 401);
});
await check("production captcha credentials HttpOnly and CSRF", async () => {
  const challenge = await api("security/captcha?mode=math");
  assert.equal(challenge.status, 200);
  assert.ok(!challenge.json.data.demoHint);
  const expression = Array.from(
    challenge.json.data.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
    (m: any) => m[1],
  ).join("");
  const numbers = expression.match(/^(\d)\+(\d)=\?$/);
  assert.ok(numbers);
  const login = await api("auth/faculty-login", "POST", {
    facultyId: "admin",
    password,
    loginType: "account",
    captchaId: challenge.json.data.captchaId,
    captchaAnswer: String(Number(numbers[1]) + Number(numbers[2])),
  });
  assert.equal(login.status, 200, JSON.stringify(login.json));
  cookie = login.response.headers.get("set-cookie")!.split(";")[0];
  csrf = login.json.data.csrfToken;
  assert.ok(login.response.headers.get("set-cookie")?.includes("HttpOnly"));
  assert.ok(login.response.headers.get("set-cookie")?.includes("Secure"));
  assert.equal(login.json.data.role, "admin");
});
await check("managed SQLite schema and query restrictions", async () => {
  const status = await api("sqlite/status");
  assert.equal(status.status, 200);
  assert.equal(status.json.data.totalTables, 35);
  assert.ok(status.json.data.engine.includes("Cloudflare"));
  const migrations = await api("sqlite/query", "POST", {
    sql: "SELECT version FROM schema_migrations ORDER BY version",
  });
  assert.equal(migrations.status, 200);
  assert.equal(migrations.json.data.rows.length, 11);
  assert.equal(
    (await api("sqlite/query", "POST", { sql: "DELETE FROM faculty_users" }))
      .status,
    403,
  );
  assert.equal(
    (
      await api("sqlite/query", "POST", {
        sql: "SELECT 1; DELETE FROM faculty_users",
      })
    ).status,
    403,
  );
});
if (!readOnly) {
  await check(
    "public graphic registration creates a restricted teacher account",
    async () => {
      const challenge = (await api("security/captcha?mode=graphic")).json.data;
      const answer = Array.from(
        challenge.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
        (m: any) => m[1],
      ).join("");
      assert.match(answer, /^[a-z0-9]{4}$/i);
      const account = `signup_${Date.now()}`;
      const payload = {
        facultyCode: account,
        fullName: "注册验证教师",
        email: `${account}@example.invalid`,
        password: "signup-fixture-password",
        confirmPassword: "signup-fixture-password",
        captchaId: challenge.captchaId,
        captchaAnswer: answer.toLowerCase(),
        role: "admin",
      };
      assert.equal((await api("auth/register", "POST", payload)).status, 200);
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...payload,
            facultyCode: account + "b",
            email: `b${account}@example.invalid`,
          })
        ).status,
        422,
      );
      const fresh = (await api("security/captcha?mode=graphic")).json.data;
      const nextAnswer = Array.from(
        fresh.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
        (m: any) => m[1],
      ).join("");
      const login = await api("auth/faculty-login", "POST", {
        facultyId: account,
        password: payload.password,
        loginType: "account",
        captchaId: fresh.captchaId,
        captchaAnswer: nextAnswer,
      });
      assert.equal(login.status, 200);
      assert.equal(login.json.data.role, "teacher");
      const teacherCookie = login.response.headers
        .get("set-cookie")!
        .split(";")[0];
      assert.equal(
        (
          await fetch(`${base}/api/v1/sqlite/status`, {
            headers: { Cookie: teacherCookie },
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await fetch(`${base}/api/v1/auth/logout`, {
            method: "POST",
            headers: {
              Cookie: teacherCookie,
              Origin: base,
              "Content-Type": "application/json",
              "X-CSRF-Token": login.json.data.csrfToken,
            },
            body: "{}",
          })
        ).status,
        200,
      );
    },
  );
  const code = `CF-${Date.now()}`;
  let student = "",
    klass = "",
    work = "",
    submission = "",
    lesson = "";
  await check(
    "nested master-data transactions and constraint mapping",
    async () => {
      let r = await api("academic/terms", "POST", {
        code,
        name: "云端适配验证学期",
        starts_on: "2026-09-01",
        ends_on: "2027-02-01",
      });
      assert.equal(r.status, 200, JSON.stringify(r.json));
      const term = r.json.data.id;
      assert.equal(
        (
          await api("academic/terms", "POST", {
            code,
            name: "重复应拒绝",
            starts_on: "2026-09-01",
            ends_on: "2027-02-01",
          })
        ).status,
        409,
      );
      r = await api("academic/classes", "POST", {
        class_code: code,
        class_name: "适配验证班级",
        grade_level: "测试",
        room_location: "测试教室",
      });
      assert.equal(r.status, 200, JSON.stringify(r.json));
      klass = r.json.data.id;
      r = await api("academic/students", "POST", {
        student_no: code,
        full_name: "验证学生",
        class_id: klass,
        term_id: term,
      });
      assert.equal(r.status, 200, JSON.stringify(r.json));
      student = r.json.data.id;
      assert.equal(
        (
          await api(`academic/classes/${klass}`, "PATCH", {
            version: 1,
            archived: true,
          })
        ).status,
        409,
      );
    },
  );
  await check(
    "publish submit grade correction and optimistic conflict",
    async () => {
      let r = await api("homework/assignments", "POST", {
        class_id: klass,
        title: "云端人工批阅验证",
        max_score: 100,
      });
      assert.equal(r.status, 200);
      work = r.json.data.id;
      assert.equal(
        (
          await api(`homework/assignments/${work}`, "PATCH", {
            version: 1,
            lifecycle: "published",
          })
        ).status,
        200,
      );
      r = await api(`homework/assignments/${work}/submissions`, "POST", {
        student_id: student,
        content: "UTF-8 中文正文与表情 🌸",
      });
      assert.equal(r.status, 200, JSON.stringify(r.json));
      submission = r.json.data.id;
      r = await api(`homework/submissions/${submission}/grade`, "PATCH", {
        version: 1,
        score: 88.5,
        feedback: "测试批注",
      });
      assert.equal(r.status, 200, JSON.stringify(r.json));
      assert.equal(r.json.data.stats.average, 88.5);
      assert.equal(
        (
          await api(`homework/submissions/${submission}/grade`, "PATCH", {
            version: 1,
            score: 90,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api(`homework/submissions/${submission}/review`, "PATCH", {
            version: 2,
            action: "return",
            feedback: "补充细节",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`homework/assignments/${work}/submissions`, "POST", {
            student_id: student,
            content: "订正后的 UTF-8 中文正文",
            version: 3,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`homework/submissions/${submission}/grade`, "PATCH", {
            version: 4,
            score: 92.5,
          })
        ).status,
        200,
      );
    },
  );
  await check("lesson revision and course scheduling", async () => {
    let r = await api("lessons/plans", "POST", {
      title: "云端教案验证",
      body: "真实文本教案",
      visibility: "school",
      tags: ["云端测试"],
    });
    assert.equal(r.status, 200);
    lesson = r.json.data.id;
    assert.equal(
      (
        await api(`lessons/plans/${lesson}`, "PATCH", {
          version: 1,
          body: "教案第二版",
        })
      ).status,
      200,
    );
    r = await api("academic/courses", "POST", { code, name: "验证课程" });
    assert.equal(r.status, 200);
    const course = r.json.data.id;
    const teacher = await api("academic/faculty", "POST", {
      faculty_code: code,
      full_name: "云端测试教师",
      email: `${code}@example.test`,
      password: "fixture-only-password",
    });
    assert.equal(teacher.status, 200);
    const entry = {
      class_id: klass,
      teacher_id: teacher.json.data.id,
      course_id: course,
      lesson_id: lesson,
      starts_at: "2026-12-01T01:00:00Z",
      ends_at: "2026-12-01T02:00:00Z",
      room: code,
    };
    assert.equal((await api("schedules/entries", "POST", entry)).status, 200);
    assert.equal((await api("schedules/entries", "POST", entry)).status, 409);
    r = await api("exams/batches", "POST", {
      title: "云端考试验证",
      exam_date: "2026-10-27",
      class_id: klass,
      course_id: course,
      questions: [{ title: "总分", max_score: 100 }],
    });
    assert.equal(r.status, 200);
    const exam = r.json.data.id,
      rows = [{ student_no: code, status: "scored", scores: [88.5] }];
    const preview = await api(`exams/batches/${exam}/import-preview`, "POST", {
      version: 1,
      rows,
    });
    assert.equal(preview.status, 200);
    const imported = await api(`exams/batches/${exam}/import`, "POST", {
      version: 1,
      rows,
      previewHash: preview.json.data.previewHash,
      request_key: code,
    });
    assert.equal(imported.status, 200);
    assert.equal(
      (await api(`exams/batches/${exam}`)).json.data.stats.average,
      88.5,
    );
  });
  await check("care messages idempotency and live aggregates", async () => {
    let r = await api("care/contacts", "POST", {
      student_id: student,
      name: "验证家长",
      relationship: "监护人",
    });
    assert.equal(r.status, 200);
    r = await api("care/threads", "POST", { contact_id: r.json.data.id });
    assert.equal(r.status, 200);
    const thread = r.json.data.id,
      payload = { content: "验证站内消息", kind: "note", request_key: code };
    const first = await api(`care/threads/${thread}/messages`, "POST", payload);
    assert.equal(first.status, 200);
    const repeat = await api(
      `care/threads/${thread}/messages`,
      "POST",
      payload,
    );
    assert.equal(repeat.json.data.id, first.json.data.id);
    assert.equal(
      (await api(`care/threads/${thread}/messages`)).json.data.length,
      1,
    );
    const overview = await api("workspace/overview");
    assert.equal(overview.status, 200);
    assert.ok(overview.json.data.students >= 1);
    assert.ok(
      (
        await api(
          `workspace/search?q=${encodeURIComponent("云端人工批阅验证")}`,
        )
      ).json.data.some((w: any) => w.id === work),
    );
  });
  await check("SQL backup restores with foreign keys intact", async () => {
    const response = await fetch(`${base}/api/v1/sqlite/backup-download`, {
      headers: { Cookie: cookie },
    });
    assert.equal(response.status, 200);
    const sql = await response.text();
    assert.ok(sql.includes("PRAGMA foreign_keys=OFF;"));
    const directory = fs.mkdtempSync(
        path.resolve(".local-data", "cloud-restore-"),
      ),
      db = new Database(path.join(directory, "backup.sqlite"));
    try {
      db.exec(sql);
      assert.equal(db.pragma("integrity_check", { simple: true }), "ok");
      assert.deepEqual(db.pragma("foreign_key_check"), []);
      assert.equal(
        (
          db
            .prepare("SELECT content FROM homework_submissions WHERE id=?")
            .get(submission) as any
        ).content,
        "订正后的 UTF-8 中文正文",
      );
    } finally {
      db.close();
    }
  });
}
if (!readOnly) {
  const state = (await api("sqlite/status")).json.data.tableCounts;
  fs.writeFileSync(
    ".local-data/cloudflare-persistence-proof.json",
    JSON.stringify(state),
  );
}
if (
  readOnly &&
  base.includes("127.0.0.1") &&
  fs.existsSync(".local-data/cloudflare-persistence-proof.json")
)
  await check("Durable SQLite records survived runtime restart", async () => {
    const before = JSON.parse(
        fs.readFileSync(
          ".local-data/cloudflare-persistence-proof.json",
          "utf-8",
        ),
      ),
      after = (await api("sqlite/status")).json.data.tableCounts;
    for (const table of [
      "student_profiles",
      "homework_assignments",
      "homework_submissions",
      "assessment_marks",
      "care_messages",
    ])
      assert.equal(after[table], before[table]);
  });
await check("logout revokes cloud session", async () => {
  assert.equal((await api("auth/logout", "POST", {})).status, 200);
  assert.equal((await api("auth/session")).status, 401);
});
fs.mkdirSync("docs/verification/cloudflare", { recursive: true });
fs.writeFileSync(
  `docs/verification/cloudflare/${readOnly ? "remote" : "local"}.json`,
  JSON.stringify({ testedAt: new Date().toISOString(), base, checks }, null, 2),
);
console.log(`Cloudflare checks: ${checks.length} passed`);
