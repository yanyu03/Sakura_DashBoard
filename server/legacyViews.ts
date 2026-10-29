import type { Express } from "express";
import { asyncDatabase, type DatabaseSource } from "./asyncDatabase";
import { reply } from "./business";

/** Compatibility reads used by the current workspace, shared by both database engines. */
export function registerLegacyViews(app: Express, source: DatabaseSource) {
  const db = asyncDatabase(source);
  app.get("/api/v1/homework/submissions", async (req, res) => {
    const className = String(req.query.className || ""),
      status = String(req.query.status || "all");
    const scope: string[] | undefined = res.locals.classScope;
    const rows = await db
      .prepare(
        `SELECT s.* FROM homework_submissions s JOIN homework_assignments a ON a.id=s.assignment_id WHERE s.class_name=? AND (?='all' OR s.status=?) AND (a.lifecycle<>'draft' OR a.owner_id=?) ${scope ? `AND a.class_id IN (${scope.map(() => "?").join(",") || "NULL"})` : ""} ORDER BY s.submitted_at,s.id`,
      )
      .all(className, status, status, res.locals.user.id, ...(scope || []));
    reply(
      res,
      rows.map((row) => ({
        ...JSON.parse(row.payload_json),
        id: row.id,
        score: row.total_score,
        status: row.status,
        statusBadge: row.status_badge,
        stamp: row.stamp_type,
      })),
      "已加载作业批阅池",
    );
  });
  app.get("/api/v1/students", async (req, res) => {
    const classId = String(req.query.classId || ""),
      tag = String(req.query.tag || "all");
    const scope: string[] | undefined = res.locals.classScope;
    const rows = await db
      .prepare(
        `SELECT s.*,c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE s.archived_at IS NULL AND s.class_id=? AND (?='all' OR s.tag_category=?) ${scope ? `AND s.class_id IN (${scope.map(() => "?").join(",") || "NULL"})` : ""} ORDER BY s.student_no,s.id`,
      )
      .all(classId, tag, tag, ...(scope || []));
    const journals = rows.length
      ? await db
          .prepare(
            `SELECT id,student_id,date_title,tag,content,teacher_name,status_text FROM coaching_journals WHERE student_id IN (${rows.map(() => "?").join(",")}) ORDER BY date_title DESC,id DESC`,
          )
          .all(...rows.map((row) => row.id))
      : [];
    reply(
      res,
      rows.map((row) => ({
        ...JSON.parse(row.payload_json),
        id: row.id,
        name: row.full_name,
        studentNo: row.student_no,
        shortNo: row.short_no,
        className: row.class_name,
        avatarChar: row.avatar_char,
        tagCategory: row.tag_category,
        coachingJournals: journals
          .filter((j) => j.student_id === row.id)
          .map((j) => ({
            id: j.id,
            dateTitle: j.date_title,
            tag: j.tag,
            content: j.content,
            teacher: j.teacher_name,
            statusText: j.status_text,
          })),
      })),
      "已加载学生学情档案",
    );
  });
}
