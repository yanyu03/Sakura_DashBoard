import type { Express, Response } from "express";
import type {DatabaseConnection} from "./dbContract";
import { randomUUID } from "node:crypto";
import { HttpError, text, number } from "./http";
import { classAccess, mutate, reply, version } from "./business";

export function registerHomework(app: Express, db: DatabaseConnection) {
  const assignment = (id: unknown, res: Response) => {
    const row = db
      .prepare(
        "SELECT a.*,c.class_name FROM homework_assignments a JOIN academic_classes c ON c.id=a.class_id WHERE a.id=?",
      )
      .get(id) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "作业不存在");
    classAccess(db, res, row.class_id);
    return row;
  };
  const entry = (id: unknown, res: Response) => {
    const row = db
      .prepare("SELECT * FROM homework_submissions WHERE id=?")
      .get(id) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "提交记录不存在");
    const work = assignment(row.assignment_id, res);
    return { row, work };
  };
  const roster = (work: Record<string, any>) =>
    work.roster_json
      ? (JSON.parse(work.roster_json) as string[])
      : (
          db
            .prepare(
              "SELECT id FROM student_profiles WHERE class_id=? AND archived_at IS NULL ORDER BY student_no,id",
            )
            .all(work.class_id) as { id: string }[]
        ).map((r) => r.id);
  const history = (row: Record<string, any>, res: Response, action: string) =>
    db
      .prepare("INSERT INTO homework_history VALUES (?,?,?,?,?,?)")
      .run(
        randomUUID(),
        row.id,
        res.locals.user.id,
        action,
        JSON.stringify(row),
        new Date().toISOString(),
      );
  const open = (work: Record<string, any>) => {
    if (work.lifecycle === "archived" || work.lifecycle === "draft")
      throw new HttpError(409, "当前作业状态不允许批阅");
  };
  const stats = (work: Record<string, any>) => {
    const counts = db
      .prepare(
        `SELECT COUNT(*) AS submitted,SUM(CASE WHEN status='graded' THEN 1 ELSE 0 END) AS graded,SUM(CASE WHEN status='needs-correction' THEN 1 ELSE 0 END) AS correction,AVG(CASE WHEN status='graded' THEN total_score END) AS average,SUM(CASE WHEN status='graded' AND total_score>=? THEN 1 ELSE 0 END) AS excellent FROM homework_submissions WHERE assignment_id=?`,
      )
      .get(work.max_score * 0.9, work.id) as Record<string, number | null>;
    const total = roster(work).length;
    return {
      ...counts,
      total,
      unsubmitted: Math.max(0, total - Number(counts.submitted)),
      pending:
        Number(counts.submitted) -
        Number(counts.graded) -
        Number(counts.correction),
      submissionRate: total ? Number(counts.submitted) / total : null,
      excellentRate: counts.graded
        ? Number(counts.excellent) / Number(counts.graded)
        : null,
    };
  };
  app.get("/api/v1/homework/assignments", (req, res) => {
    const classes = db
      .prepare("SELECT id FROM academic_classes WHERE archived_at IS NULL")
      .all() as { id: string }[];
    const ids = classes
      .filter((c) => {
        try {
          classAccess(db, res, c.id);
          return true;
        } catch {
          return false;
        }
      })
      .map((c) => c.id);
    const rows = db
      .prepare(
        `SELECT a.*,c.class_name FROM homework_assignments a JOIN academic_classes c ON c.id=a.class_id WHERE a.class_id IN (${ids.map(() => "?").join(",") || "NULL"}) ${req.query.classId ? "AND a.class_id=?" : ""} ORDER BY a.created_at DESC,a.id`,
      )
      .all(
        ...ids,
        ...(req.query.classId ? [String(req.query.classId)] : []),
      ) as Record<string, any>[];
    reply(
      res,
      rows.map((row) => ({ ...row, stats: stats(row) })),
    );
  });
  app.post("/api/v1/homework/assignments", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const classId = text(req.body.class_id, "班级"),
          klass = classAccess(db, res, classId);
        if (klass.archived_at) throw new HttpError(409, "班级已归档");
        const id = randomUUID(),
          max = number(req.body.max_score, "满分", 1, 10000);
        if (Math.abs(max * 100 - Math.round(max * 100)) > 1e-7)
          throw new HttpError(422, "满分最多两位小数");
        const due = req.body.due_at ? text(req.body.due_at, "截止时间") : null;
        if (
          due &&
          (!Number.isFinite(Date.parse(due)) || Date.parse(due) <= Date.now())
        )
          throw new HttpError(422, "截止时间必须晚于当前时间");
        db.prepare(
          "INSERT INTO homework_assignments(id,title,course_tag,class_id,max_score,lifecycle,owner_id,instructions,due_at,submitted_count,total_students,graded_count,avg_score,excellent_rate) VALUES (?,?,?,?,?,?,?,?,?,0,0,0,0,0)",
        ).run(
          id,
          text(req.body.title, "作业标题", { max: 200 }),
          text(req.body.course_tag || "综合", "课程", { max: 80 }),
          classId,
          max,
          "draft",
          res.locals.user.id,
          text(req.body.instructions, "作业要求", {
            optional: true,
            max: 30000,
          }),
          due ? new Date(due).toISOString() : null,
        );
        return assignment(id, res);
      },
      "作业草稿已创建",
    ),
  );
  app.patch("/api/v1/homework/assignments/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const work = assignment(req.params.id, res);
        version(req.body, work);
        const target = req.body.lifecycle;
        const transitions: Record<string, string[]> = {
          draft: ["published", "archived"],
          published: ["closed", "archived"],
          closed: ["archived"],
          archived: [],
        };
        if (
          typeof target !== "string" ||
          !transitions[work.lifecycle].includes(target)
        )
          throw new HttpError(409, "作业状态转换无效");
        const snapshot =
          target === "published"
            ? JSON.stringify(roster(work))
            : work.roster_json;
        if (
          target === "published" &&
          work.due_at &&
          Date.parse(work.due_at) <= Date.now()
        )
          throw new HttpError(409, "草稿截止时间已过，请重新创建");
        db.prepare(
          "UPDATE homework_assignments SET lifecycle=?,roster_json=?,version=version+1 WHERE id=?",
        ).run(target, snapshot, work.id);
        return assignment(work.id, res);
      },
      "作业状态已更新",
    ),
  );
  app.get("/api/v1/homework/assignments/:id", (req, res) => {
    const work = assignment(req.params.id, res),
      ids = roster(work);
    const students = db
      .prepare(
        `SELECT id,full_name,student_no FROM student_profiles WHERE id IN (${ids.map(() => "?").join(",") || "NULL"}) ORDER BY student_no,id`,
      )
      .all(...ids);
    const submissions = db
      .prepare(
        "SELECT s.*,p.full_name AS student_name FROM homework_submissions s JOIN student_profiles p ON p.id=s.student_id WHERE s.assignment_id=? ORDER BY s.submitted_at,s.id",
      )
      .all(work.id);
    reply(res, { assignment: work, students, submissions, stats: stats(work) });
  });
  app.post("/api/v1/homework/assignments/:id/submissions", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const work = assignment(req.params.id, res),
          studentId = text(req.body.student_id, "学生");
        const prior = db
          .prepare(
            "SELECT * FROM homework_submissions WHERE assignment_id=? AND student_id=?",
          )
          .get(work.id, studentId) as Record<string, any> | undefined;
        const correction = prior?.status === "needs-correction";
        if (
          ["draft", "archived"].includes(work.lifecycle) ||
          (!correction &&
            (work.lifecycle !== "published" ||
              (work.due_at && Date.parse(work.due_at) < Date.now())))
        )
          throw new HttpError(409, "当前作业已停止接收提交");
        if (!roster(work).includes(studentId))
          throw new HttpError(422, "该学生不在作业发布名单中");
        const student = db
          .prepare("SELECT full_name FROM student_profiles WHERE id=?")
          .get(studentId) as { full_name: string };
        const content = text(req.body.content, "提交正文", { max: 100000 });
        if (prior) {
          version(req.body, prior);
          if (prior.status !== "needs-correction")
            throw new HttpError(409, "已有提交，请先退回订正");
          history(prior, res, "resubmit");
          db.prepare(
            "UPDATE homework_submissions SET content=?,status='pending',total_score=NULL,feedback='',stamp_type=NULL,is_model_essay=0,status_badge='待批阅',graded_at=NULL,submitted_at=?,version=version+1 WHERE id=?",
          ).run(content, new Date().toISOString(), prior.id);
          return entry(prior.id, res).row;
        }
        const id = randomUUID();
        db.prepare(
          "INSERT INTO homework_submissions(id,assignment_id,student_id,student_name,class_name,total_score,question_score,status,status_badge,payload_json,content,submitted_at) VALUES (?,?,?,?,?,NULL,0,'pending','待批阅','{}',?,?)",
        ).run(
          id,
          work.id,
          studentId,
          student.full_name,
          work.class_name,
          content,
          new Date().toISOString(),
        );
        history(entry(id, res).row, res, "submit");
        return entry(id, res).row;
      },
      "提交已登记",
    ),
  );
  app.patch("/api/v1/homework/submissions/:id/grade", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const { row, work } = entry(req.params.id, res);
        open(work);
        const score = number(req.body.score, "分数", 0, work.max_score);
        if (Math.abs(score * 100 - Math.round(score * 100)) > 1e-7)
          throw new HttpError(422, "分数最多两位小数");
        version(req.body, row);
        if (!["pending", "ai-pregraded", "graded"].includes(row.status))
          throw new HttpError(409, "请先登记订正重交，再重新评分");
        const stamp =
          req.body.stampType === undefined
            ? row.stamp_type
            : req.body.stampType;
        if (
          stamp !== null &&
          ![
            "excellent",
            "progress",
            "neat",
            "sakura",
            "妙笔生花",
            "见解独到",
          ].includes(stamp)
        )
          throw new HttpError(422, "印章无效");
        const feedback =
          req.body.feedback === undefined
            ? row.feedback
            : text(req.body.feedback, "批注", { optional: true, max: 20000 });
        history(row, res, "grade");
        db.prepare(
          "UPDATE homework_submissions SET total_score=?,feedback=?,status='graded',status_badge='已批阅',stamp_type=?,graded_at=?,version=version+1 WHERE id=?",
        ).run(score, feedback, stamp, new Date().toISOString(), row.id);
        return { submission: entry(row.id, res).row, stats: stats(work) };
      },
      "评分已保存",
    ),
  );
  app.patch("/api/v1/homework/submissions/:id/stamp", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const { row, work } = entry(req.params.id, res);
        open(work);
        version(req.body, row);
        if (
          req.body.stampType !== null &&
          ![
            "excellent",
            "progress",
            "neat",
            "sakura",
            "妙笔生花",
            "见解独到",
          ].includes(req.body.stampType)
        )
          throw new HttpError(422, "印章无效");
        history(row, res, "stamp");
        db.prepare(
          "UPDATE homework_submissions SET stamp_type=?,version=version+1 WHERE id=?",
        ).run(req.body.stampType, row.id);
        return entry(row.id, res).row;
      },
      "印章已保存",
    ),
  );
  app.patch("/api/v1/homework/submissions/:id/review", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const { row, work } = entry(req.params.id, res);
        open(work);
        version(req.body, row);
        if (req.body.action === "return") {
          if (row.status === "needs-correction")
            throw new HttpError(409, "已经退回订正");
          const feedback = text(req.body.feedback, "订正要求", { max: 20000 });
          history(row, res, "return");
          db.prepare(
            "UPDATE homework_submissions SET status='needs-correction',feedback=?,is_model_essay=0,version=version+1 WHERE id=?",
          ).run(feedback, row.id);
        } else if (req.body.action === "model") {
          if (row.status !== "graded" || typeof req.body.enabled !== "boolean")
            throw new HttpError(422, "只能标记已批阅范文");
          history(row, res, "model");
          db.prepare(
            "UPDATE homework_submissions SET is_model_essay=?,version=version+1 WHERE id=?",
          ).run(req.body.enabled ? 1 : 0, row.id);
        } else throw new HttpError(422, "操作无效");
        return entry(row.id, res).row;
      },
      "批阅状态已保存",
    ),
  );
  app.get("/api/v1/homework/submissions/:id/history", (req, res) => {
    entry(req.params.id, res);
    reply(
      res,
      db
        .prepare(
          "SELECT * FROM homework_history WHERE submission_id=? ORDER BY created_at,id",
        )
        .all(req.params.id),
    );
  });
}
