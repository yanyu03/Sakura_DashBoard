import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import fs from "node:fs";
import { tidbTestDatabase } from "./tidb-test-database";
import { verificationFetch as fetch } from "./http-verification-transport";
import { readLocalSecret } from "./private-secrets";
const fixture = readLocalSecret(".local-data/functional-target.json");
const base =
  process.argv.find((v) => v.startsWith("http")) ||
  "https://sakura.250221.xyz/__tidb-preview";
if (
  !base.endsWith("/__tidb-preview") ||
  !fixture.database.startsWith("sakura_migration_functional_")
)
  throw Error(
    "Requires an isolated functional test database and preview endpoint",
  );
const { pool, db: inspector } = tidbTestDatabase(fixture.database);
const selected = (process.env.SAKURA_FUNCTIONAL_CASES || "")
  .split(",")
  .filter(Boolean);
let cookie = "",
  csrf = "",
  workflowId = "",
  lessonApiId = "",
  examWorkflowId = "",
  lastCall: any;
if (selected.length) {
  workflowId =
    (
      await inspector
        .prepare(
          "SELECT id FROM homework_assignments WHERE title=? ORDER BY created_at DESC LIMIT 1",
        )
        .get("人工批阅闭环")
    )?.id || "";
  lessonApiId =
    (
      await inspector
        .prepare(
          "SELECT id FROM lesson_plans WHERE title=? ORDER BY updated_at DESC LIMIT 1",
        )
        .get("验证教案 O'Reilly 🌸")
    )?.id || "";
  examWorkflowId =
    (
      await inspector
        .prepare("SELECT id FROM assessment_exams WHERE title=? LIMIT 1")
        .get("真实考试样本")
    )?.id || "";
}
const checks: {
  name: string;
  status: "PASS" | "FAIL";
  durationMs: number;
  error?: string;
  lastCall?: unknown;
}[] = [];
async function api(
  route: string,
  method = "GET",
  body?: unknown,
  extraHeaders: Record<string, string> = {},
) {
  const response = await fetch(`${base}/api/v1/${route}`, {
    method,
    headers: {
      Origin: new URL(base).origin,
      "Content-Type": "application/json",
      Cookie: cookie,
      "X-CSRF-Token": csrf,
      "X-Sakura-Preview-Token": fixture.token,
      ...extraHeaders,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(60000),
  });
  const text = await response.text();
  lastCall = { route, method, status: response.status, bodyBytes: text.length };
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw Error(
      `Invalid JSON: ${route}, status=${response.status}, bytes=${text.length}`,
    );
  }
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  if (json.data?.csrfToken) csrf = json.data.csrfToken;
  lastCall = {
    route,
    method,
    status: response.status,
    traceId: json.traceId,
    errorCode: response.headers.get("X-Sakura-Error-Code"),
  };
  if (response.status >= 500)
    console.log(
      JSON.stringify({
        event: "functional_api_error",
        ...lastCall,
        diagnostic: decodeURIComponent(
          response.headers.get("X-Sakura-Error-Message") || "",
        ),
      }),
    );
  return { status: response.status, json, setCookie };
}
async function login(account = "admin", password = "admin") {
  const cap = (await api("security/captcha?mode=math")).json.data;
  const expression = Array.from(
    cap.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),
    (m: any) => m[1],
  ).join("");
  const match = expression.match(/^(\d)\+(\d)=\?$/);
  assert.ok(match);
  const answer = String(+match[1] + +match[2]);
  const actual =
    (account === "admin" && password === "admin") ||
    (account.startsWith("FIX-") && password === "fixture-only")
      ? fixture.password
      : password;
  const response = await api("auth/faculty-login", "POST", {
    facultyId: account,
    password: actual,
    loginType: "account",
    captchaId: cap.captchaId,
    captchaAnswer: answer,
  });
  return { ...response, challenge: { ...cap, demoHint: answer } };
}
async function check(name: string, fn: () => Promise<unknown>) {
  if (selected.length && !selected.some((prefix) => name.startsWith(prefix)))
    return;
  const start = Date.now();
  lastCall = null;
  try {
    await fn();
    checks.push({ name, status: "PASS", durationMs: Date.now() - start });
    console.log("PASS " + name);
  } catch (error) {
    checks.push({
      name,
      status: "FAIL",
      durationMs: Date.now() - start,
      error: (error instanceof Error ? error.message : String(error))
        .replaceAll(fixture.password, "[test credential]")
        .replaceAll(fixture.token, "[preview token]"),
      lastCall,
    });
    console.log(
      "FAIL " +
        name +
        " " +
        (error instanceof Error ? error.message : String(error)) +
        " " +
        JSON.stringify(lastCall),
    );
    try {
      await login();
    } catch {}
  }
  fs.mkdirSync("docs/verification/tidb", { recursive: true });
  fs.writeFileSync(
    ".local-data/functions-progress.json",
    JSON.stringify({ checks }, null, 2),
  );
}

try {
  await check(
    "registration / real API persists optional name rejects role injection replay and duplicate identity",
    async () => {
      const cap = (await api("security/captcha")).json.data;
      await inspector
        .prepare(
          "UPDATE security_captchas SET answer_hash=? WHERE captcha_id=?",
        )
        .run(createHash("sha256").update("2468").digest("hex"), cap.captchaId);
      const payload = {
        facultyCode: "fr_" + Date.now().toString(36),
        email: "fr_" + Date.now().toString(36) + "@example.invalid",
        fullName: "",
        password: fixture.password,
        confirmPassword: fixture.password,
        role: "admin",
        captchaId: cap.captchaId,
        captchaAnswer: "2468",
      };
      assert.equal((await api("auth/register", "POST", payload)).status, 200);
      assert.equal((await api("auth/register", "POST", payload)).status, 422);
      const row = await inspector
        .prepare(
          "SELECT role,full_name,password_hash FROM faculty_users WHERE faculty_code=?",
        )
        .get(payload.facultyCode);
      assert.equal(row.role, "teacher");
      assert.equal(row.full_name, payload.facultyCode);
      assert.ok(row.password_hash.startsWith("scrypt$"));
      assert.notEqual(row.password_hash, fixture.password);
      const cap2 = (await api("security/captcha")).json.data;
      await inspector
        .prepare(
          "UPDATE security_captchas SET answer_hash=? WHERE captcha_id=?",
        )
        .run(createHash("sha256").update("2468").digest("hex"), cap2.captchaId);
      assert.equal(
        (
          await api("auth/register", "POST", {
            ...payload,
            captchaId: cap2.captchaId,
          })
        ).status,
        409,
      );
      assert.equal(
        (await login(payload.facultyCode, fixture.password)).status,
        200,
      );
      assert.equal((await api("auth/session")).json.data.role, "teacher");
      assert.equal((await api("academic/classes")).json.data.length, 0);
      assert.equal((await api("students")).status, 403);
      assert.equal(
        (
          await api("auth/default-profile", "PUT", {
            facultyCode: "cannot_rename",
            fullName: "可修改显示名",
          })
        ).status,
        403,
      );
      const profile = (await api("auth/default-profile")).json.data;
      assert.equal(
        (
          await api("auth/default-profile", "PUT", {
            ...profile,
            fullName: "可修改显示名",
          })
        ).status,
        200,
      );
      assert.equal(
        (await api("auth/default-profile")).json.data.facultyCode,
        payload.facultyCode,
      );
      await api("auth/logout", "POST", {});
      cookie = "";
      csrf = "";
    },
  );
  await check(
    "auth / anonymous requests cannot read or administer SQLite",
    async () => {
      cookie = "";
      csrf = "";
      assert.equal((await api("sqlite/status")).status, 401);
      assert.equal(
        (await api("sqlite/query", "POST", { sql: "SELECT 1" })).status,
        401,
      );
      assert.equal((await api("auth/default-profile")).status, 401);
    },
  );
  await check(
    "auth / actual credentials issue HttpOnly session without password disclosure",
    async () => {
      const response = await login();
      assert.equal(response.status, 200);
      assert.ok(response.setCookie?.includes("HttpOnly"));
      assert.ok(response.setCookie?.includes("SameSite=Strict"));
      assert.equal(response.json.data.password, undefined);
      assert.equal(response.json.data.password_hash, undefined);
      assert.equal((await api("auth/session")).json.data.role, "admin");
      const hash = (
        (await inspector!
          .prepare(
            "SELECT password_hash FROM faculty_users WHERE id='fac-admin'",
          )
          .get()) as { password_hash: string }
      ).password_hash;
      assert.ok(hash.startsWith("scrypt$"));
      assert.notEqual(hash, "admin");
      assert.equal(
        (
          await api("auth/faculty-login", "POST", {
            facultyId: "admin",
            password: "admin",
            loginType: "account",
            captchaId: response.challenge.captchaId,
            captchaAnswer: response.challenge.demoHint,
          })
        ).status,
        422,
      );
    },
  );
  await check(
    "auth / CSRF validation and expired challenges are enforced",
    async () => {
      assert.equal(
        (
          await api(
            "sqlite/query",
            "POST",
            { sql: "SELECT 1" },
            { "X-CSRF-Token": "" },
          )
        ).status,
        403,
      );
      const cap = (await api("security/captcha")).json.data;
      await inspector!
        .prepare(
          "UPDATE security_captchas SET expires_at='2000-01-01' WHERE captcha_id=?",
        )
        .run(cap.captchaId);
      assert.equal(
        (
          await api("auth/faculty-login", "POST", {
            facultyId: "admin",
            password: "admin",
            loginType: "account",
            captchaId: cap.captchaId,
            captchaAnswer: cap.demoHint,
          })
        ).status,
        422,
      );
      assert.equal((await login("admin", "wrong-password")).status, 401);
    },
  );
  await check(
    "auth / teacher scope prevents cross-class access and administration",
    async () => {
      assert.equal((await login("FIX-a", "fixture-only")).status, 200);
      assert.equal((await api("sqlite/status")).status, 403);
      assert.equal(
        (await api("students?classId=fixture-class-a")).json.data.length,
        1,
      );
      assert.equal(
        (await api("students?classId=fixture-class-b")).json.data.length,
        0,
      );
      assert.equal(
        (
          await api(
            "homework/submissions/fixture-submission-b/grade",
            "PATCH",
            { score: 80 },
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await api("students/fixture-student-b/coaching-journals", "POST", {
            content: "not allowed",
          })
        ).status,
        403,
      );
      assert.equal((await login()).status, 200);
    },
  );
  await check("auth / logout invalidates server session", async () => {
    assert.equal((await api("auth/logout", "POST")).status, 200);
    assert.equal((await api("auth/session")).status, 401);
    assert.equal((await login()).status, 200);
  });
  await check(
    "academic / create master records and persist linked student data",
    async () => {
      const term = await api("academic/terms", "POST", {
        code: "VERIFY-TERM",
        name: "验证学期",
        starts_on: "2026-09-01",
        ends_on: "2027-01-31",
      });
      assert.equal(term.status, 200);
      const faculty = await api("academic/faculty", "POST", {
        faculty_code: "VERIFY-TEACHER",
        full_name: "验证新教师",
        email: "new-teacher@example.test",
        password: "fixture-password",
      });
      assert.equal(faculty.status, 200);
      const klass = await api("academic/classes", "POST", {
        class_code: "VERIFY-CLASS",
        class_name: "验证新班级",
        grade_level: "高一",
        head_teacher_id: faculty.json.data.id,
      });
      assert.equal(klass.status, 200);
      const student = await api("academic/students", "POST", {
        student_no: "VERIFY-STUDENT",
        full_name: "验证学生",
        class_id: klass.json.data.id,
        term_id: term.json.data.id,
      });
      assert.equal(student.status, 200);
      const students = (await api("academic/students?q=VERIFY-STUDENT")).json
        .data;
      assert.equal(students.total, 1);
      assert.equal(students.items[0].full_name, "验证学生");
      const classRow = (await api("academic/classes")).json.data.find(
        (r: any) => r.id === klass.json.data.id,
      );
      assert.equal(classRow.actual_count, 1);
      const updated = await api(
        `academic/students/${student.json.data.id}`,
        "PATCH",
        { version: 1, full_name: "修改后的验证学生" },
      );
      assert.equal(updated.status, 200);
      assert.equal(
        (await api(`students?classId=${klass.json.data.id}`)).json.data[0].name,
        "修改后的验证学生",
      );
      assert.equal(
        (
          await api(`academic/students/${student.json.data.id}`, "PATCH", {
            version: 1,
            full_name: "旧版本覆盖",
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api(`academic/classes/${klass.json.data.id}`, "PATCH", {
            version: 1,
            archived: true,
          })
        ).status,
        409,
      );
      assert.equal(
        (await login("VERIFY-TEACHER", "fixture-password")).status,
        200,
      );
      assert.equal((await api("academic/classes")).json.data.length, 1);
      assert.equal(
        (await api("academic/students")).json.data.items[0].full_name,
        "修改后的验证学生",
      );
      assert.equal(
        (
          await api("academic/classes", "POST", {
            class_code: "forbidden",
            class_name: "forbidden",
            grade_level: "高一",
          })
        ).status,
        403,
      );
      assert.equal((await login()).status, 200);
      assert.equal(
        (
          await api(`academic/students/${student.json.data.id}`, "PATCH", {
            version: 2,
            archived: true,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`academic/classes/${klass.json.data.id}`, "PATCH", {
            version: 1,
            archived: true,
          })
        ).status,
        200,
      );
      assert.equal(
        (await api("academic/students?q=VERIFY-STUDENT")).json.data.total,
        0,
      );
    },
  );
  await check(
    "API / common JSON errors and unknown endpoints are structured",
    async () => {
      const missing = await api("not-an-api");
      assert.equal(missing.status, 404);
      assert.equal(missing.json.success, false);
      assert.equal(missing.json.data, null);
      assert.ok(missing.json.traceId);
      const malformed = await fetch(`${base}/api/v1/lessons/unit-plans`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
          "X-CSRF-Token": csrf,
          "X-Sakura-Preview-Token": fixture.token,
        },
        body: "{broken",
      });
      assert.equal(malformed.status, 400);
      assert.equal((await malformed.json()).success, false);
    },
  );
  await check(
    "API / grading rejects missing records and invalid scores without writing",
    async () => {
      const row = (await inspector!
        .prepare("SELECT id,total_score FROM homework_submissions LIMIT 1")
        .get()) as { id: string; total_score: number };
      assert.equal(
        (
          await api("homework/submissions/no-such-submission/grade", "PATCH", {
            score: 80,
          })
        ).status,
        404,
      );
      for (const score of [-1, 10001, null, "90"])
        assert.equal(
          (
            await api(`homework/submissions/${row.id}/grade`, "PATCH", {
              score,
            })
          ).status,
          422,
        );
      assert.equal(
        (
          (await inspector!
            .prepare("SELECT total_score FROM homework_submissions WHERE id=?")
            .get(row.id)) as { total_score: number }
        ).total_score,
        row.total_score,
      );
    },
  );
  await check(
    "homework / draft publish submit grade return resubmit and statistics",
    async () => {
      let r = await api("homework/assignments", "POST", {
        class_id: "fixture-class-a",
        title: "人工批阅闭环",
        max_score: 20,
        instructions: "",
      });
      assert.equal(r.status, 200);
      workflowId = r.json.data.id;
      assert.equal(
        (
          await api(`homework/assignments/${workflowId}/submissions`, "POST", {
            student_id: "fixture-student-a",
            content: "草稿不能提交",
          })
        ).status,
        409,
      );
      r = await api(`homework/assignments/${workflowId}`, "PATCH", {
        version: 1,
        lifecycle: "published",
      });
      assert.equal(r.status, 200);
      assert.equal(
        (
          await api(`homework/assignments/${workflowId}`, "PATCH", {
            version: 1,
            lifecycle: "closed",
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api(`homework/assignments/${workflowId}/submissions`, "POST", {
            student_id: "fixture-student-b",
            content: "跨班提交",
          })
        ).status,
        422,
      );
      r = await api(`homework/assignments/${workflowId}/submissions`, "POST", {
        student_id: "fixture-student-a",
        content: "第一次提交正文",
      });
      assert.equal(r.status, 200);
      const id = r.json.data.id;
      let d = (await api(`homework/assignments/${workflowId}`)).json.data;
      assert.equal(d.stats.submitted, 1);
      assert.equal(d.stats.total, 1);
      assert.equal(d.stats.average, null);
      assert.equal(d.stats.pending, 1);
      assert.equal(
        (
          await api(`homework/assignments/${workflowId}/submissions`, "POST", {
            student_id: "fixture-student-a",
            content: "重复提交",
            version: 1,
          })
        ).status,
        409,
      );
      for (const score of [20.01, 1.001])
        assert.equal(
          (
            await api(`homework/submissions/${id}/grade`, "PATCH", {
              version: 1,
              score,
            })
          ).status,
          422,
        );
      r = await api(`homework/submissions/${id}/grade`, "PATCH", {
        version: 1,
        score: 0,
        feedback: "零分也是真实成绩",
        stampType: "sakura",
      });
      assert.equal(r.status, 200);
      assert.equal(r.json.data.stats.average, 0);
      assert.equal(
        (
          await api(`homework/submissions/${id}/grade`, "PATCH", {
            version: 1,
            score: 20,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api(`homework/submissions/${id}/stamp`, "PATCH", {
            version: 2,
            stampType: null,
          })
        ).status,
        200,
      );
      r = await api(`homework/submissions/${id}/review`, "PATCH", {
        version: 3,
        action: "return",
        feedback: "请补充论据",
      });
      assert.equal(r.status, 200);
      d = (await api(`homework/assignments/${workflowId}`)).json.data;
      assert.equal(d.stats.average, null);
      assert.equal(d.stats.correction, 1);
      r = await api(`homework/assignments/${workflowId}/submissions`, "POST", {
        student_id: "fixture-student-a",
        content: "订正后的正文",
        version: 4,
      });
      assert.equal(r.status, 200);
      assert.equal(r.json.data.total_score, null);
      assert.equal(r.json.data.status, "pending");
      r = await api(`homework/submissions/${id}/grade`, "PATCH", {
        version: 5,
        score: 18.5,
        feedback: "论据充分",
      });
      assert.equal(r.status, 200);
      assert.equal(r.json.data.stats.average, 18.5);
      assert.equal(r.json.data.stats.excellentRate, 1);
      assert.equal(
        (
          await api(`homework/submissions/${id}/review`, "PATCH", {
            version: 6,
            action: "model",
            enabled: true,
          })
        ).status,
        200,
      );
      const h = (await api(`homework/submissions/${id}/history`)).json.data;
      assert.equal(h.length, 7);
      assert.ok(
        h.some(
          (x: any) => JSON.parse(x.snapshot_json).content === "第一次提交正文",
        ),
      );
      r = await api(`homework/assignments/${workflowId}`, "PATCH", {
        version: 2,
        lifecycle: "closed",
      });
      assert.equal(r.status, 200);
      assert.equal(
        (
          await api(`homework/assignments/${workflowId}/submissions`, "POST", {
            student_id: "fixture-student-a",
            content: "截止后提交",
            version: 7,
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api(`homework/submissions/${id}/review`, "PATCH", {
            version: 7,
            action: "return",
            feedback: "截止后继续订正",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`homework/assignments/${workflowId}/submissions`, "POST", {
            student_id: "fixture-student-a",
            content: "订正后的正文",
            version: 8,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`homework/submissions/${id}/grade`, "PATCH", {
            version: 9,
            score: 18.5,
          })
        ).status,
        200,
      );
      assert.equal((await login("FIX-b", "fixture-only")).status, 200);
      assert.equal(
        (await api(`homework/assignments/${workflowId}`)).status,
        403,
      );
      assert.equal(
        (await api(`homework/submissions/${id}/history`)).status,
        403,
      );
      await login();
    },
  );
  await check(
    "lessons / API write persists in TiDB and subsequent reads",
    async () => {
      const title = "验证教案 O'Reilly 🌸";
      const result = await api("lessons/plans", "POST", {
        title,
        body: "接口真实落盘",
        visibility: "school",
      });
      assert.equal(result.json.success, true);
      lessonApiId = result.json.data.id;
      assert.equal(
        (
          (await inspector!
            .prepare("SELECT title FROM lesson_plans WHERE id=?")
            .get(lessonApiId)) as { title: string }
        ).title,
        title,
      );
      assert.equal(
        (await api("lessons/unit-plans")).json.data.find(
          (p: any) => p.id === lessonApiId,
        ).title,
        title,
      );
      assert.ok(
        await inspector!
          .prepare(
            "SELECT id FROM sql_audit_logs WHERE fn_name='business.POST'",
          )
          .get(),
      );
    },
  );
  await check(
    "lessons / owner privacy revisions links archive and stale edits",
    async () => {
      if (selected.length)
        await inspector
          .prepare(
            "UPDATE lesson_plans SET archived_at=? WHERE owner_id=? AND title IN (?,?)",
          )
          .run(
            new Date().toISOString(),
            "fixture-teacher-a",
            "私有教案",
            "管理员不可读取的私有教案",
          );
      assert.equal((await login("FIX-a", "fixture-only")).status, 200);
      let r = await api("lessons/plans", "POST", {
        title: "私有教案",
        body: "第一版教案正文",
        tags: ["写作"],
        visibility: "private",
      });
      assert.equal(r.status, 200);
      const id = r.json.data.id;
      assert.equal(
        (
          await api(`lessons/plans/${id}`, "PATCH", {
            version: 1,
            body: "第二版正文",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`lessons/plans/${id}`, "PATCH", {
            version: 1,
            body: "过期覆盖",
          })
        ).status,
        409,
      );
      let history = (await api(`lessons/plans/${id}/revisions`)).json.data;
      assert.equal(JSON.parse(history[0].snapshot_json).body, "第一版教案正文");
      assert.equal(
        (
          await api(`lessons/plans/${id}/links`, "POST", {
            version: 2,
            assignment_id: workflowId,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`lessons/plans/${id}/links`, "POST", {
            version: 3,
            assignment_id: "fixture-assignment-b",
          })
        ).status,
        403,
      );
      await login("FIX-b", "fixture-only");
      assert.equal((await api("lessons/plans?q=私有教案")).json.data.length, 0);
      assert.equal((await api(`lessons/plans/${id}/revisions`)).status, 403);
      assert.equal(
        (
          await api(`lessons/plans/${id}`, "PATCH", {
            version: 3,
            body: "越权",
          })
        ).status,
        403,
      );
      await login("FIX-a", "fixture-only");
      assert.equal(
        (
          await api(`lessons/plans/${id}`, "PATCH", {
            version: 3,
            visibility: "school",
          })
        ).status,
        200,
      );
      await login("FIX-b", "fixture-only");
      assert.equal((await api("lessons/plans?q=私有教案")).json.data.length, 1);
      assert.equal(
        (
          await api(`lessons/plans/${id}`, "PATCH", {
            version: 4,
            body: "共享不等于可编辑",
          })
        ).status,
        403,
      );
      await login("FIX-a", "fixture-only");
      assert.equal(
        (
          await api(`lessons/plans/${id}`, "PATCH", {
            version: 4,
            archived: true,
          })
        ).status,
        200,
      );
      assert.equal((await api("lessons/plans?q=私有教案")).json.data.length, 0);
      assert.equal(
        (
          await api("lessons/unit-plans", "PUT", {
            lessonId: id,
            title: "不能覆盖",
            description: "不能绕过版本",
          })
        ).status,
        409,
      );
      await login();
    },
  );
  await check(
    "schedule / formal entry bypass is rejected in favor of scoped submission approval",
    async () => {
      await login();
      assert.equal(
        (
          await api("schedules/entries", "POST", {
            class_id: "fixture-class-a",
            teacher_id: "fixture-teacher-a",
            course_id: "course-chinese",
            starts_at: "2026-11-01T01:00:00Z",
            ends_at: "2026-11-01T02:00:00Z",
            room: "Synthetic",
          })
        ).status,
        409,
      );
    },
  );
  await check(
    "exams / preview import statistics missing scores and duplicate requests",
    async () => {
      for (const no of ["EXAM-2", "EXAM-3", "EXAM-4"])
        assert.equal(
          (
            await api("academic/students", "POST", {
              student_no: no,
              full_name: `考试学生${no}`,
              class_id: "fixture-class-a",
              term_id: "term-2024-spring",
            })
          ).status,
          200,
        );
      let r = await api("exams/batches", "POST", {
        title: "真实考试样本",
        exam_date: "2026-11-02",
        class_id: "fixture-class-a",
        course_id: "course-chinese",
        questions: [
          { title: "阅读", max_score: 40 },
          { title: "写作", max_score: 60 },
        ],
      });
      assert.equal(r.status, 200);
      examWorkflowId = r.json.data.id;
      let d = (await api(`exams/batches/${examWorkflowId}`)).json.data;
      assert.equal(d.stats.expected, 4);
      assert.equal(d.stats.missing, 4);
      assert.equal(d.stats.average, null);
      const rows = [
        { student_no: "FIX-STU-a", status: "scored", scores: [0, 0] },
        { student_no: "EXAM-2", status: "scored", scores: [40, 50] },
        { student_no: "EXAM-3", status: "absent", scores: [] },
        { student_no: "EXAM-4", status: "ungraded", scores: [] },
      ];
      for (const invalid of [
        [...rows, rows[0]],
        [{ ...rows[0], scores: [41, 10] }],
        [{ ...rows[0], student_no: "FIX-STU-b" }],
        [{ ...rows[0], scores: [null, 0] }],
      ])
        assert.equal(
          (
            await api(
              `exams/batches/${examWorkflowId}/import-preview`,
              "POST",
              { version: 1, rows: invalid },
            )
          ).status,
          422,
        );
      r = await api(`exams/batches/${examWorkflowId}/import-preview`, "POST", {
        version: 1,
        rows,
      });
      assert.equal(r.status, 200);
      assert.equal(
        (
          (await inspector!
            .prepare(
              "SELECT COUNT(*) AS n FROM assessment_results WHERE exam_id=?",
            )
            .get(examWorkflowId)) as any
        ).n,
        0,
      );
      const payload = {
        version: 1,
        rows,
        previewHash: r.json.data.previewHash,
        request_key: "verify-import-1",
      };
      r = await api(`exams/batches/${examWorkflowId}/import`, "POST", payload);
      assert.equal(r.status, 200);
      assert.equal(r.json.data.imported, 4);
      assert.equal(
        (await api(`exams/batches/${examWorkflowId}/import`, "POST", payload))
          .status,
        200,
      );
      assert.equal(
        (
          await api(`exams/batches/${examWorkflowId}/import`, "POST", {
            ...payload,
            rows: rows.slice(1),
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api(`exams/batches/${examWorkflowId}/import`, "POST", {
            ...payload,
            request_key: "new-stale-import",
          })
        ).status,
        409,
      );
      d = (await api(`exams/batches/${examWorkflowId}`)).json.data;
      assert.equal(d.stats.average, 45);
      assert.equal(d.stats.scored, 2);
      assert.equal(d.stats.absent, 1);
      assert.equal(d.stats.ungraded, 1);
      assert.equal(d.stats.passRate, 0.5);
      assert.equal(d.stats.excellentRate, 0.5);
      assert.deepEqual(
        d.stats.distribution.map((b: any) => b.count),
        [1, 0, 0, 1],
      );
      assert.equal(d.stats.questionAverages[0].average, 20);
      const trajectory = (
        await api("exams/students/fixture-student-a/trajectory")
      ).json.data;
      assert.equal(trajectory[0].total, 0);
      await login("FIX-b", "fixture-only");
      assert.equal((await api(`exams/batches/${examWorkflowId}`)).status, 403);
      assert.equal((await api("exams/batches")).json.data.length, 0);
      await login();
      const { parseScoreCsv } = await import("../src/services/scoreCsv");
      assert.deepEqual(
        parseScoreCsv(
          'student_no,status,Q1,Q2\r\n"a",scored,0,10\r\n"b",absent,,',
        ).map((r) => r.scores),
        [[0, 10], []],
      );
      assert.throws(() => parseScoreCsv("student_no,status,Q1\na,scored,"));
    },
  );
  await check(
    "care / shared contacts messages unread todos and journal ownership",
    async () => {
      await login("FIX-a", "fixture-only");
      let r = await api("care/contacts", "POST", {
        student_id: "fixture-student-a",
        name: "测试家长",
        relationship: "父亲",
        phone: "fixture-only",
      });
      assert.equal(r.status, 200);
      const contact = r.json.data.id;
      r = await api("care/threads", "POST", { contact_id: contact });
      assert.equal(r.status, 200);
      const thread = r.json.data.id;
      assert.equal(
        (await api("care/threads", "POST", { contact_id: contact })).json.data
          .id,
        thread,
      );
      const payload = {
        content: "手工记录的家长来信",
        kind: "incoming-record",
        request_key: "care-message-1",
      };
      assert.equal(
        (await api(`care/threads/${thread}/messages`, "POST", payload)).status,
        200,
      );
      assert.equal(
        (await api(`care/threads/${thread}/messages`, "POST", payload)).status,
        200,
      );
      assert.equal(
        (
          await api(`care/threads/${thread}/messages`, "POST", {
            ...payload,
            content: "不同内容复用标识",
          })
        ).status,
        409,
      );
      let list = (await api("care/threads?studentId=fixture-student-a")).json
        .data;
      assert.equal(list[0].unread_count, 1);
      assert.equal(list[0].last_message, payload.content);
      assert.equal(
        (await api(`care/threads/${thread}/read`, "POST")).status,
        200,
      );
      assert.equal(
        (await api("care/threads?studentId=fixture-student-a")).json.data[0]
          .unread_count,
        0,
      );
      r = await api(`care/threads/${thread}/messages`, "POST", {
        content: "给家长的待发送内容",
        kind: "outgoing",
        request_key: "care-message-2",
      });
      assert.equal(r.status, 200);
      assert.equal(r.json.data.status, "queued");
      r = await api("care/todos", "POST", {
        student_id: "fixture-student-a",
        title: "家访测试",
        due_at: "2026-11-03T08:00:00Z",
      });
      assert.equal(r.status, 200);
      const todo = r.json.data.id;
      assert.equal(
        (
          await api(`care/todos/${todo}`, "PATCH", {
            version: 1,
            status: "done",
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await api(`care/todos/${todo}`, "PATCH", {
            version: 1,
            status: "cancelled",
          })
        ).status,
        409,
      );
      assert.equal(
        (
          await api("students/fixture-student-a/coaching-journals", "POST", {
            content: "来自真实登录教师的辅导记录",
            teacherId: "fac-admin",
          })
        ).status,
        200,
      );
      const journals = (
        await api("students/fixture-student-a/coaching-journals")
      ).json.data;
      assert.equal(journals[0].teacher_id, "fixture-teacher-a");
      assert.equal(journals[0].teacher_name, "测试教师 a");
      await login("FIX-b", "fixture-only");
      assert.equal((await api(`care/threads/${thread}/messages`)).status, 403);
      assert.equal(
        (await api("care/contacts?studentId=fixture-student-a")).status,
        403,
      );
      const { notificationTime } = await import("../server/care");
      assert.equal(
        notificationTime(
          { dnd_enabled: 1, dnd_start_time: "18:00" },
          new Date("2026-11-01T12:00:00Z"),
        ),
        "2026-11-02T00:00:00.000Z",
      );
      assert.equal(
        notificationTime(
          { dnd_enabled: 1, dnd_start_time: "18:00" },
          new Date("2026-11-01T01:00:00Z"),
        ),
        "2026-11-01T01:00:00.000Z",
      );
      await login();
    },
  );
  await check(
    "workspace / aggregates search and notification state are scoped",
    async () => {
      await inspector!
        .prepare(
          "UPDATE faculty_users SET dnd_enabled=0 WHERE id='fixture-teacher-a'",
        )
        .run();
      await login("FIX-a", "fixture-only");
      let overview = (await api("workspace/overview")).json.data;
      assert.equal(overview.students, 4);
      assert.equal(overview.classes.length, 1);
      assert.equal(overview.pending, 0);
      assert.equal(overview.unread, 0);
      assert.equal(
        (await api("workspace/search?q=FIX-STU-b")).json.data.length,
        0,
      );
      let found = (await api("workspace/search?q=人工批阅闭环")).json.data;
      assert.equal(found[0].id, workflowId);
      assert.equal(found[0].class_id, "fixture-class-a");
      const student = (await api("students/fixture-student-a/profile")).json
        .data;
      assert.equal(
        (
          await api("students/fixture-student-a/profile", "PATCH", {
            version: student.version,
            bio: "全局档案修改",
            tag_category: "progress",
          })
        ).status,
        200,
      );
      let notices = (await api("workspace/notifications")).json.data;
      const notice = notices.find((n: any) => n.title === "档案已保存");
      assert.ok(notice);
      assert.equal(notice.read_at, null);
      assert.equal(
        (await api("workspace/notifications/read", "POST", { id: notice.id }))
          .status,
        200,
      );
      assert.ok(
        (await api("workspace/notifications")).json.data.find(
          (n: any) => n.id === notice.id,
        ).read_at,
      );
      const duplicates = (
        (await inspector!
          .prepare(
            "SELECT COUNT(*) AS n FROM business_notifications WHERE user_id='fixture-teacher-a' AND event_key LIKE '%care-message-1'",
          )
          .get()) as any
      ).n;
      assert.equal(duplicates, 1);
      await login("FIX-b", "fixture-only");
      assert.equal(
        (await api("workspace/notifications/read", "POST", { id: notice.id }))
          .status,
        404,
      );
      assert.equal(
        (await api("workspace/search?q=人工批阅闭环")).json.data.length,
        0,
      );
      overview = (await api("workspace/overview")).json.data;
      assert.equal(overview.students, 1);
      assert.equal(overview.classes.length, 1);
      await login();
    },
  );
  await check(
    "API / grading persists in physical columns and list response",
    async () => {
      const original = (await inspector!
        .prepare(
          "SELECT id,class_name FROM homework_submissions WHERE id='fixture-submission-a'",
        )
        .get()) as { id: string; class_name: string };
      assert.equal(
        (
          await api(`homework/submissions/${original.id}/grade`, "PATCH", {
            score: 87.5,
            version: 1,
          })
        ).json.success,
        true,
      );
      assert.equal(
        (
          (await inspector!
            .prepare("SELECT total_score FROM homework_submissions WHERE id=?")
            .get(original.id)) as { total_score: number }
        ).total_score,
        87.5,
      );
      assert.equal(
        (
          await api(
            `homework/submissions?className=${encodeURIComponent(original.class_name)}`,
          )
        ).json.data.find((s: any) => s.id === original.id).score,
        87.5,
      );
    },
  );
  await check(
    "external / unconfigured AI rejects instead of fabricating results",
    async () => {
      const { sakuraAIService } = await import("../src/services/aiService");
      assert.equal(sakuraAIService.getConfig().enabled, false);
      await assert.rejects(
        () => sakuraAIService.batchPreGradeEssays("fixture-class-a", 1),
        /尚未连接/,
      );
      await assert.rejects(
        () => sakuraAIService.analyzeExamCohort(examWorkflowId),
        /尚未连接/,
      );
      assert.throws(
        () => sakuraAIService.configure({ enabled: true }),
        /尚未连接/,
      );
    },
  );
  await check(
    "responses / large lesson JSON remains complete across repeated Worker responses",
    async () => {
      await login("FIX-a", "fixture-only");
      const body = "长内容教学记录".repeat(10000);
      const created = await api("lessons/plans", "POST", {
        title: "响应完整性验证",
        body,
        visibility: "private",
      });
      assert.equal(created.status, 200);
      assert.equal(created.json.data.body, body);
      for (let i = 0; i < 3; i++) {
        const result = await api(
          "lessons/plans?q=" + encodeURIComponent("响应完整性验证"),
        );
        assert.equal(result.status, 200);
        assert.equal(
          result.json.data.find((row: any) => row.id === created.json.data.id)
            .body,
          body,
        );
      }
      await login();
    },
  );
  await check(
    "isolation / private lesson must remain hidden from a different administrator",
    async () => {
      await login("FIX-a", "fixture-only");
      const created = await api("lessons/plans", "POST", {
        title: "管理员不可读取的私有教案",
        body: "Synthetic private marker",
        visibility: "private",
      });
      assert.equal(created.status, 200);
      const id = created.json.data.id;
      await login();
      assert.equal(
        (
          await api(
            "lessons/plans?q=" + encodeURIComponent("管理员不可读取的私有教案"),
          )
        ).json.data.length,
        0,
      );
      assert.equal(
        (await api("lessons/plans/" + id + "/revisions")).status,
        403,
      );
      assert.equal(
        (
          await api(
            "workspace/search?q=" +
              encodeURIComponent("管理员不可读取的私有教案"),
          )
        ).json.data.length,
        0,
      );
      assert.equal(
        (
          await api("lessons/plans/" + id, "PATCH", {
            version: 1,
            body: "forbidden",
          })
        ).status,
        403,
      );
    },
  );
  await check(
    "isolation / same-class colleague must not read an unshared draft assignment",
    async () => {
      await login("FIX-a", "fixture-only");
      const work = await api("homework/assignments", "POST", {
        class_id: "fixture-class-a",
        title: "未共享私有草稿",
        max_score: 20,
      });
      assert.equal(work.status, 200);
      await inspector
        .prepare(
          "INSERT INTO teaching_assignments(teacher_id,class_id,course_id,term_id) VALUES (?,?,?,?)",
        )
        .run(
          "fixture-teacher-b",
          "fixture-class-a",
          "course-chinese",
          "term-2024-spring",
        );
      try {
        await login("FIX-b", "fixture-only");
        assert.equal(
          (await api("homework/assignments/" + work.json.data.id)).status,
          403,
        );
        assert.ok(
          !(await api("homework/assignments")).json.data.some(
            (row: any) => row.id === work.json.data.id,
          ),
        );
        assert.equal(
          (
            await api(
              "workspace/search?q=" + encodeURIComponent("未共享私有草稿"),
            )
          ).json.data.length,
          0,
        );
      } finally {
        await inspector
          .prepare(
            "DELETE FROM teaching_assignments WHERE teacher_id=? AND class_id=?",
          )
          .run("fixture-teacher-b", "fixture-class-a");
        await login();
      }
      assert.equal(
        (await api("homework/assignments/" + work.json.data.id)).status,
        403,
      );
    },
  );
  await check(
    "isolation / same-class colleague must not overwrite an unshared draft assignment",
    async () => {
      await login("FIX-a", "fixture-only");
      const work = await api("homework/assignments", "POST", {
        class_id: "fixture-class-a",
        title: "禁止跨账号覆盖",
        max_score: 20,
      });
      assert.equal(work.status, 200);
      await inspector
        .prepare(
          "INSERT INTO teaching_assignments(teacher_id,class_id,course_id,term_id) VALUES (?,?,?,?)",
        )
        .run(
          "fixture-teacher-b",
          "fixture-class-a",
          "course-chinese",
          "term-2024-spring",
        );
      try {
        await login("FIX-b", "fixture-only");
        assert.equal(
          (
            await api("homework/assignments/" + work.json.data.id, "PATCH", {
              version: 1,
              lifecycle: "published",
            })
          ).status,
          403,
        );
        const stored = await inspector
          .prepare(
            "SELECT lifecycle,version FROM homework_assignments WHERE id=?",
          )
          .get(work.json.data.id);
        assert.equal(stored.lifecycle, "draft");
        assert.equal(stored.version, 1);
      } finally {
        await inspector
          .prepare(
            "DELETE FROM teaching_assignments WHERE teacher_id=? AND class_id=?",
          )
          .run("fixture-teacher-b", "fixture-class-a");
        await login();
      }
    },
  );
} finally {
  await pool.end();
  const previous =
    selected.length && fs.existsSync("docs/verification/tidb/functions.json")
      ? JSON.parse(
          fs.readFileSync("docs/verification/tidb/functions.json", "utf8"),
        ).checks
      : [];
  const merged = Array.from(
    new Map(
      [...previous, ...checks].map((row: any) => [row.name, row]),
    ).values(),
  ) as typeof checks;
  const report = {
    testedAt: new Date().toISOString(),
    target:
      "token-gated Cloudflare Worker with isolated synthetic TiDB database",
    checks: merged,
    passed: merged.filter((c) => c.status === "PASS").length,
    failed: merged.filter((c) => c.status === "FAIL").length,
  };
  fs.writeFileSync(
    "docs/verification/tidb/functions.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({ passed: report.passed, failed: report.failed }));
  if (report.failed) process.exitCode = 1;
}
