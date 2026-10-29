import type { Express, Response } from "express";
import {
  asyncDatabase,
  asyncFilter,
  type DatabaseSource,
} from "./asyncDatabase";
import { classAccess, reply } from "./business";
import { HttpError, text } from "./http";
import { scheduleAccess } from "./scheduleAccess";
export function registerWorkspace(app: Express, source: DatabaseSource) {
  const db = asyncDatabase(source);
  const visible = async (res: Response, classId: string) => {
    try {
      await classAccess(db, res, classId);
      return true;
    } catch {
      return false;
    }
  };
  app.get("/api/v1/workspace/overview", async (_req, res) => {
    const classes = await asyncFilter(
        (await db
          .prepare(
            "SELECT id,class_name FROM academic_classes WHERE archived_at IS NULL ORDER BY class_code,id",
          )
          .all()) as {
          id: string;
          class_name: string;
        }[],
        async (c) => await visible(res, c.id),
      ),
      ids = classes.map((c) => c.id),
      inClasses = `(${ids.map(() => "?").join(",") || "NULL"})`,
      now = new Date(),
      shifted = new Date(now.getTime() + 8 * 3600000),
      today = shifted.toISOString().slice(0, 10),
      dayStart = new Date(`${today}T00:00:00+08:00`).toISOString(),
      dayEnd = new Date(Date.parse(dayStart) + 86400000).toISOString();
    const students = (
      (await db
        .prepare(
          `SELECT COUNT(*) AS n FROM student_profiles WHERE archived_at IS NULL AND class_id IN ${inClasses}`,
        )
        .get(...ids)) as {
        n: number;
      }
    ).n;
    const homework = (await db
      .prepare(
        `SELECT a.id,a.title,a.due_at,a.class_id,COUNT(CASE WHEN s.status IN ('pending','ai-pregraded') THEN 1 END) AS pending FROM homework_assignments a LEFT JOIN homework_submissions s ON s.assignment_id=a.id WHERE a.lifecycle IN ('published','closed') AND a.class_id IN ${inClasses} GROUP BY a.id ORDER BY a.due_at IS NULL,a.due_at,a.id`,
      )
      .all(...ids)) as Record<string, any>[];
    const scheduleScope = await scheduleAccess(db, res.locals.user.id);
    const schedules = (
      (await db
        .prepare(
          `SELECT e.*,g.unit_id,c.class_name,k.name AS course_name,u.full_name FROM schedule_entries e LEFT JOIN schedule_entry_scopes g ON g.entry_id=e.id JOIN academic_classes c ON c.id=e.class_id JOIN courses k ON k.id=e.course_id JOIN faculty_users u ON u.id=e.teacher_id WHERE cancelled_at IS NULL AND starts_at>=? AND starts_at<? ORDER BY starts_at,e.id`,
        )
        .all(dayStart, dayEnd)) as Record<string, any>[]
    )
      .filter(
        (e) =>
          e.teacher_id === res.locals.user.id ||
          scheduleScope.visible(e.unit_id),
      )
      .map((e) => ({
        ...e,
        lesson_id: e.teacher_id === res.locals.user.id ? e.lesson_id : null,
      }));
    const todos = await db
      .prepare(
        `SELECT t.*,s.full_name FROM care_todos t JOIN student_profiles s ON s.id=t.student_id WHERE t.owner_id=? AND t.status='open' AND s.class_id IN ${inClasses} ORDER BY due_at,id`,
      )
      .all(res.locals.user.id, ...ids);
    const unread = (
      (await db
        .prepare(
          `SELECT COUNT(*) AS n FROM care_messages m JOIN care_threads t ON t.id=m.thread_id JOIN care_contacts c ON c.id=t.contact_id JOIN student_profiles s ON s.id=c.student_id WHERE t.teacher_id=? AND m.kind='incoming-record' AND m.sequence>t.last_read_sequence AND s.class_id IN ${inClasses}`,
        )
        .get(res.locals.user.id, ...ids)) as {
        n: number;
      }
    ).n;
    const lessons = (
      (await db
        .prepare(
          "SELECT COUNT(*) AS n FROM lesson_plans WHERE archived_at IS NULL AND (visibility='school' OR owner_id=?)",
        )
        .get(res.locals.user.id)) as {
        n: number;
      }
    ).n;
    reply(res, {
      today,
      classes,
      students,
      pending: homework.reduce((sum, row) => sum + row.pending, 0),
      unread,
      lessons,
      homework,
      schedules,
      todos,
      external: {
        ai: false,
        ocr: false,
        parentDelivery: false,
        projection: false,
      },
    });
  });
  app.get("/api/v1/workspace/search", async (req, res) => {
    const q = text(req.query.q, "搜索关键词", { max: 100 }),
      results: Record<string, unknown>[] = [];
    const studentRows = (await db
      .prepare(
        "SELECT s.id,s.full_name,s.student_no,s.class_id,c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE s.archived_at IS NULL AND (instr(s.full_name,?)>0 OR instr(s.student_no,?)>0) ORDER BY s.student_no,s.id",
      )
      .all(q, q)) as Record<string, any>[];
    for (const s of (
      await asyncFilter(
        studentRows,
        async (s) => await visible(res, s.class_id),
      )
    ).slice(0, 20))
      results.push({
        id: s.id,
        title: s.full_name,
        subtitle: `${s.class_name} · ${s.student_no}`,
        type: "student",
        tab: "student-profiles",
        class_id: s.class_id,
      });
    const lessons = (await db
      .prepare(
        "SELECT id,title,owner_id,visibility FROM lesson_plans WHERE archived_at IS NULL AND instr(title||body||tags_json,?)>0 AND (visibility='school' OR owner_id=?) ORDER BY updated_at DESC,id LIMIT 20",
      )
      .all(q, res.locals.user.id)) as Record<string, any>[];
    for (const l of lessons)
      results.push({
        id: l.id,
        title: l.title,
        subtitle: "教案",
        type: "lesson",
        tab: "lesson-plans",
      });
    for (const [table, type, tab] of [
      ["homework_assignments", "homework", "homework-center"],
      ["assessment_exams", "exam", "exam-analytics"],
    ] as const) {
      const rows = (await db
        .prepare(
          `SELECT id,title,class_id FROM ${table} WHERE instr(title,?)>0 AND ${type === "homework" ? "lifecycle<>'archived' AND (lifecycle<>'draft' OR owner_id=?)" : "archived_at IS NULL"} ORDER BY id`,
        )
        .all(
          q,
          ...(type === "homework" ? [res.locals.user.id] : []),
        )) as Record<string, any>[];
      for (const row of (
        await asyncFilter(rows, async (r) => await visible(res, r.class_id))
      ).slice(0, 20))
        results.push({
          id: row.id,
          title: row.title,
          subtitle: type === "homework" ? "作业" : "考试",
          type,
          tab,
          class_id: row.class_id,
        });
    }
    reply(res, results);
  });
  app.get("/api/v1/workspace/notifications", async (_req, res) =>
    reply(
      res,
      await db
        .prepare(
          "SELECT * FROM business_notifications WHERE user_id=? AND available_at<=? ORDER BY created_at DESC,id LIMIT 100",
        )
        .all(res.locals.user.id, new Date().toISOString()),
    ),
  );
  app.post("/api/v1/workspace/notifications/read", async (req, res) => {
    const id = req.body.id;
    if (id !== undefined && typeof id !== "string")
      throw new HttpError(422, "通知标识无效");
    if (
      id &&
      !(await db
        .prepare(
          "SELECT id FROM business_notifications WHERE id=? AND user_id=?",
        )
        .get(id, res.locals.user.id))
    )
      throw new HttpError(404, "通知不存在");
    await db
      .prepare(
        `UPDATE business_notifications SET read_at=? WHERE user_id=? AND available_at<=? ${id ? "AND id=?" : ""}`,
      )
      .run(
        new Date().toISOString(),
        res.locals.user.id,
        new Date().toISOString(),
        ...(id ? [id] : []),
      );
    reply(res, { read: true }, "已标记已读");
  });
}
