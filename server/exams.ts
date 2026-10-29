import type { Express, Response } from "express";
import {
  asyncDatabase,
  asyncFilter,
  asyncEach,
  type DatabaseSource,
} from "./asyncDatabase";
import { createHash, randomUUID } from "node:crypto";
import { HttpError, text, number } from "./http";
import { classAccess, exactDate, mutate, reply, version } from "./business";
export function registerExams(app: Express, source: DatabaseSource) {
  const db = asyncDatabase(source);
  const get = async (id: unknown, res: Response) => {
    const row = (await db
      .prepare("SELECT * FROM assessment_exams WHERE id=?")
      .get(id)) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "考试不存在");
    await classAccess(db, res, row.class_id);
    return row;
  };
  const questions = async (id: string) =>
    (await db
      .prepare(
        "SELECT * FROM assessment_questions WHERE exam_id=? ORDER BY ordinal",
      )
      .all(id)) as Record<string, any>[];
  const report = async (exam: Record<string, any>) => {
    const ids = JSON.parse(exam.roster_json) as string[],
      qs = await questions(exam.id);
    const students = (await db
      .prepare(
        `SELECT id,student_no,full_name FROM student_profiles WHERE id IN (${ids.map(() => "?").join(",") || "NULL"}) ORDER BY student_no,id`,
      )
      .all(...ids)) as Record<string, any>[];
    const results = await Promise.all(
      students.map(async (s) => {
        const result = (await db
          .prepare(
            "SELECT status FROM assessment_results WHERE exam_id=? AND student_id=?",
          )
          .get(exam.id, s.id)) as
          | {
              status: string;
            }
          | undefined;
        const marks = (await db
          .prepare(
            "SELECT question_id,score FROM assessment_marks WHERE exam_id=? AND student_id=?",
          )
          .all(exam.id, s.id)) as {
          question_id: string;
          score: number;
        }[];
        return {
          ...s,
          id: String(s.id),
          full_name: String(s.full_name),
          student_no: String(s.student_no),
          status: result?.status || "missing",
          scores: qs.map(
            (q) => marks.find((m) => m.question_id === q.id)?.score ?? null,
          ),
          total:
            result?.status === "scored" && marks.length === qs.length
              ? marks.reduce((sum, m) => sum + m.score, 0)
              : null,
        };
      }),
    );
    const scored = results.filter((r) => r.total !== null),
      totals = scored.map((r) => r.total as number),
      average = totals.length
        ? totals.reduce((a, b) => a + b, 0) / totals.length
        : null;
    return {
      exam,
      questions: qs,
      students: results,
      stats: {
        expected: ids.length,
        scored: scored.length,
        absent: results.filter((r) => r.status === "absent").length,
        ungraded: results.filter((r) => r.status === "ungraded").length,
        missing: results.filter((r) => r.status === "missing").length,
        average,
        passRate: totals.length
          ? totals.filter((n) => n >= exam.max_score * exam.pass_ratio).length /
            totals.length
          : null,
        excellentRate: totals.length
          ? totals.filter((n) => n >= exam.max_score * exam.excellent_ratio)
              .length / totals.length
          : null,
        distribution: [0, 0.6, 0.8, 0.9].map((min, i, arr) => ({
          label: ["低于60%", "60%—80%", "80%—90%", "90%及以上"][i],
          count: totals.filter(
            (n) =>
              n >= min * exam.max_score &&
              (i === 3 || n < arr[i + 1] * exam.max_score),
          ).length,
        })),
        questionAverages: qs.map((q) => {
          const marks = scored.map((s) => s.scores[qs.indexOf(q)] as number);
          return {
            title: q.title,
            average: marks.length
              ? marks.reduce((a, b) => a + b, 0) / marks.length
              : null,
            max_score: q.max_score,
          };
        }),
      },
    };
  };
  app.get("/api/v1/exams/batches", async (_req, res) => {
    const rows = (await db
      .prepare(
        "SELECT e.*,c.class_name,k.name AS course_name FROM assessment_exams e JOIN academic_classes c ON c.id=e.class_id JOIN courses k ON k.id=e.course_id WHERE e.archived_at IS NULL ORDER BY e.exam_date DESC,e.id",
      )
      .all()) as Record<string, any>[];
    reply(
      res,
      await asyncFilter(rows, async (r) => {
        try {
          await classAccess(db, res, r.class_id);
          return true;
        } catch {
          return false;
        }
      }),
    );
  });
  app.post(
    "/api/v1/exams/batches",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const classId = text(req.body.class_id, "班级"),
            klass = await classAccess(db, res, classId);
          if (klass.archived_at) throw new HttpError(409, "班级已归档");
          const courseId = text(req.body.course_id, "课程");
          if (
            !(await db
              .prepare(
                "SELECT id FROM courses WHERE id=? AND archived_at IS NULL",
              )
              .get(courseId))
          )
            throw new HttpError(422, "课程无效");
          const date = text(req.body.exam_date, "考试日期");
          if (!exactDate(date)) throw new HttpError(422, "考试日期无效");
          if (
            !Array.isArray(req.body.questions) ||
            req.body.questions.length < 1 ||
            req.body.questions.length > 100
          )
            throw new HttpError(422, "请配置 1 至 100 道题目");
          const qs = req.body.questions.map((q: any) => ({
            title: text(q?.title, "题目名称", { max: 100 }),
            max: number(q?.max_score, "题目满分", 0.01, 10000),
          }));
          const max = qs.reduce(
            (
              n: number,
              q: {
                max: number;
              },
            ) => n + q.max,
            0,
          );
          const pass = number(req.body.pass_ratio ?? 0.6, "及格比例", 0, 1),
            excellent = number(
              req.body.excellent_ratio ?? 0.9,
              "优秀比例",
              pass,
              1,
            ),
            id = randomUUID();
          const ids = (
            (await db
              .prepare(
                "SELECT id FROM student_profiles WHERE class_id=? AND archived_at IS NULL ORDER BY student_no,id",
              )
              .all(classId)) as {
              id: string;
            }[]
          ).map((r) => r.id);
          await db
            .prepare(
              "INSERT INTO assessment_exams(id,title,exam_date,class_id,course_id,owner_id,max_score,pass_ratio,excellent_ratio,roster_json) VALUES (?,?,?,?,?,?,?,?,?,?)",
            )
            .run(
              id,
              text(req.body.title, "考试名称", { max: 200 }),
              date,
              classId,
              courseId,
              res.locals.user.id,
              max,
              pass,
              excellent,
              JSON.stringify(ids),
            );
          await asyncEach(
            qs,
            async (
              q: {
                title: string;
                max: number;
              },
              i: number,
            ) =>
              await db
                .prepare("INSERT INTO assessment_questions VALUES (?,?,?,?,?)")
                .run(randomUUID(), id, q.title, q.max, i),
          );
          return await get(id, res);
        },
        "考试已创建",
      ),
  );
  app.get("/api/v1/exams/batches/:id", async (req, res) =>
    reply(res, await report(await get(req.params.id, res))),
  );
  app.patch(
    "/api/v1/exams/batches/:id",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const row = await get(req.params.id, res);
          version(req.body, row);
          if (req.body.archived !== true)
            throw new HttpError(422, "只支持归档，题目发布后保留原始满分");
          await db
            .prepare(
              "UPDATE assessment_exams SET archived_at=?,version=version+1 WHERE id=?",
            )
            .run(new Date().toISOString(), row.id);
          return await get(row.id, res);
        },
        "考试已归档",
      ),
  );
  const validateImport = async (
    row: Record<string, any>,
    body: Record<string, any>,
  ) => {
    version(body, row);
    if (row.archived_at) throw new HttpError(409, "考试已归档");
    const qs = await questions(row.id),
      ids = JSON.parse(row.roster_json) as string[];
    if (
      !Array.isArray(body.rows) ||
      body.rows.length < 1 ||
      body.rows.length > 500
    )
      throw new HttpError(422, "每次导入 1 至 500 行");
    const seen = new Set<string>();
    return await Promise.all(
      body.rows.map(async (item: any, index: number) => {
        const no = text(item?.student_no, `第 ${index + 1} 行学号`),
          student = (await db
            .prepare(
              "SELECT id,full_name FROM student_profiles WHERE student_no=?",
            )
            .get(no)) as
            | {
                id: string;
                full_name: string;
              }
            | undefined;
        if (!student || !ids.includes(student.id) || seen.has(student.id))
          throw new HttpError(
            422,
            `第 ${index + 1} 行学号不存在、不在考试名单中或重复`,
          );
        seen.add(student.id);
        const status = item.status;
        if (!["scored", "absent", "ungraded"].includes(status))
          throw new HttpError(422, `第 ${index + 1} 行状态无效`);
        if (
          !Array.isArray(item.scores) ||
          (status === "scored" && item.scores.length !== qs.length) ||
          (status !== "scored" && item.scores.length)
        )
          throw new HttpError(422, `第 ${index + 1} 行题目分数数量不符`);
        const scores = item.scores.map((score: unknown, i: number) => {
          const value = number(
            score,
            `第 ${index + 1} 行第 ${i + 1} 题`,
            0,
            qs[i].max_score,
          );
          if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-7)
            throw new HttpError(422, "成绩最多两位小数");
          return value;
        });
        return {
          student_id: student.id,
          student_no: no,
          full_name: student.full_name,
          status,
          scores,
          total:
            status === "scored"
              ? scores.reduce((a: number, b: number) => a + b, 0)
              : null,
        };
      }),
    );
  };
  const hash = (data: unknown) =>
    createHash("sha256").update(JSON.stringify(data)).digest("hex");
  app.post("/api/v1/exams/batches/:id/import-preview", async (req, res) => {
    const row = await get(req.params.id, res),
      rows = await validateImport(row, req.body);
    reply(
      res,
      {
        rows,
        previewHash: hash({ exam: row.id, version: row.version, rows }),
        version: row.version,
      },
      "校验通过；导入将替换这些学生的成绩，其他学生保持原值",
    );
  });
  app.post(
    "/api/v1/exams/batches/:id/import",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const row = await get(req.params.id, res),
            key = text(req.body.request_key, "导入请求标识", { max: 100 }),
            payloadHash = hash({
              exam: row.id,
              version: req.body.version,
              rows: req.body.rows,
              previewHash: req.body.previewHash,
            });
          const prior = (await db
            .prepare(
              "SELECT * FROM assessment_imports WHERE actor_id=? AND request_key=?",
            )
            .get(res.locals.user.id, key)) as Record<string, any> | undefined;
          if (prior) {
            if (prior.exam_id !== row.id || prior.payload_hash !== payloadHash)
              throw new HttpError(409, "请求标识已用于另一份导入");
            return JSON.parse(prior.result_json);
          }
          const rows = await validateImport(row, req.body),
            qs = await questions(row.id);
          if (
            req.body.previewHash !==
            hash({ exam: row.id, version: row.version, rows })
          )
            throw new HttpError(409, "预览已变化，请重新校验");
          for (const item of rows) {
            await db
              .prepare(
                "DELETE FROM assessment_marks WHERE exam_id=? AND student_id=?",
              )
              .run(row.id, item.student_id);
            await db
              .prepare(
                "INSERT INTO assessment_results VALUES (?,?,?) ON CONFLICT(exam_id,student_id) DO UPDATE SET status=excluded.status",
              )
              .run(row.id, item.student_id, item.status);
            await asyncEach(
              item.scores,
              async (score: number, i: number) =>
                await db
                  .prepare("INSERT INTO assessment_marks VALUES (?,?,?,?)")
                  .run(row.id, item.student_id, qs[i].id, score),
            );
          }
          await db
            .prepare("UPDATE assessment_exams SET version=version+1 WHERE id=?")
            .run(row.id);
          const result = { imported: rows.length, version: row.version + 1 };
          await db
            .prepare("INSERT INTO assessment_imports VALUES (?,?,?,?,?)")
            .run(
              res.locals.user.id,
              key,
              row.id,
              payloadHash,
              JSON.stringify(result),
            );
          return result;
        },
        "成绩已导入",
      ),
  );
  app.get("/api/v1/exams/students/:id/trajectory", async (req, res) => {
    const student = (await db
      .prepare("SELECT class_id FROM student_profiles WHERE id=?")
      .get(req.params.id)) as
      | {
          class_id: string;
        }
      | undefined;
    if (!student) throw new HttpError(404, "学生不存在");
    await classAccess(db, res, student.class_id);
    const exams = (await db
      .prepare(
        "SELECT * FROM assessment_exams WHERE archived_at IS NULL ORDER BY exam_date,id",
      )
      .all()) as Record<string, any>[];
    reply(
      res,
      (
        await Promise.all(
          (
            await asyncFilter(exams, async (e) => {
              try {
                await classAccess(db, res, e.class_id);
                return true;
              } catch {
                return false;
              }
            })
          ).map(async (e) => {
            const student = (await report(e)).students.find(
              (s) => s.id === req.params.id,
            );
            return student
              ? [
                  {
                    exam_id: e.id,
                    title: e.title,
                    date: e.exam_date,
                    total: student.total,
                    max_score: e.max_score,
                    status: student.status,
                  },
                ]
              : [];
          }),
        )
      ).flat(),
    );
  });
}
