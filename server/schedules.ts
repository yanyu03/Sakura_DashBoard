import type { Express, Response } from "express";
import type {DatabaseConnection} from "./dbContract";
import { randomUUID } from "node:crypto";
import { HttpError, text } from "./http";
import { classAccess, exactDate, mutate, reply, version } from "./business";
export function registerSchedules(app: Express, db: DatabaseConnection) {
  const admin = (res: Response) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "需要管理员审批权限");
    const ids = process.env.SAKURA_SWAP_APPROVER_IDS?.split(",");
    if (ids && !ids.includes(res.locals.user.id))
      throw new HttpError(403, "未配置为调课审批人");
  };
  const read = (id: unknown, res: Response) => {
    const row = db
      .prepare("SELECT * FROM schedule_entries WHERE id=?")
      .get(id) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "课时不存在");
    if (row.teacher_id !== res.locals.user.id)
      classAccess(db, res, row.class_id);
    return row;
  };
  const validate = (data: Record<string, any>): Record<string, any> => {
    const teacher = db
        .prepare("SELECT id FROM faculty_users WHERE id=? AND status='ACTIVE'")
        .get(data.teacher_id),
      course = db
        .prepare("SELECT id FROM courses WHERE id=? AND archived_at IS NULL")
        .get(data.course_id),
      klass = db
        .prepare(
          "SELECT id FROM academic_classes WHERE id=? AND archived_at IS NULL",
        )
        .get(data.class_id);
    if (!teacher || !course || !klass)
      throw new HttpError(422, "教师、班级或课程无效");
    const start = String(data.starts_at),
      end = String(data.ends_at);
    if (
      !exactDate(start.slice(0, 10)) ||
      !exactDate(end.slice(0, 10)) ||
      !Number.isFinite(Date.parse(start)) ||
      !Number.isFinite(Date.parse(end)) ||
      Date.parse(start) >= Date.parse(end) ||
      Date.parse(end) - Date.parse(start) > 86400000
    )
      throw new HttpError(422, "课时开始/结束时间无效，最长 24 小时");
    return {
      ...data,
      starts_at: new Date(start).toISOString(),
      ends_at: new Date(end).toISOString(),
      room: text(data.room, "教室", { max: 80 }),
    };
  };
  const noConflict = (target: Record<string, any>, exclude = "") => {
    const row = db
      .prepare(
        "SELECT id FROM schedule_entries WHERE cancelled_at IS NULL AND id<>? AND starts_at<? AND ends_at>? AND (teacher_id=? OR class_id=? OR room=?) LIMIT 1",
      )
      .get(
        exclude,
        target.ends_at,
        target.starts_at,
        target.teacher_id,
        target.class_id,
        target.room,
      );
    if (row) throw new HttpError(409, "与现有课时的教师、班级或教室时间冲突");
  };
  const visible = (res: Response, row: Record<string, any>) => {
    try {
      if (row.teacher_id !== res.locals.user.id)
        classAccess(db, res, row.class_id);
      return true;
    } catch {
      return false;
    }
  };
  const rows = (res: Response, from: string, to: string) =>
    (
      db
        .prepare(
          "SELECT e.*,c.class_name,u.full_name,k.name AS course_name FROM schedule_entries e JOIN academic_classes c ON c.id=e.class_id JOIN faculty_users u ON u.id=e.teacher_id JOIN courses k ON k.id=e.course_id WHERE e.cancelled_at IS NULL AND e.starts_at>=? AND e.starts_at<? ORDER BY e.starts_at,e.id",
        )
        .all(from, to) as Record<string, any>[]
    ).filter((row) => visible(res, row));
  const range = (query: Record<string, unknown>) => {
    const from = String(query.from || new Date().toISOString().slice(0, 10)),
      to = String(
        query.to ||
          new Date(Date.now() + 31 * 86400000).toISOString().slice(0, 10),
      );
    if (
      !exactDate(from) ||
      !exactDate(to) ||
      from >= to ||
      Date.parse(to) - Date.parse(from) > 367 * 86400000
    )
      throw new HttpError(422, "日期范围无效，最多一年，结束日期不含当天");
    return [new Date(from).toISOString(), new Date(to).toISOString()];
  };
  app.get("/api/v1/schedules/options", (_req, res) =>
    reply(res, {
      teachers: db
        .prepare(
          "SELECT id,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY full_name",
        )
        .all(),
      courses: db
        .prepare(
          "SELECT id,name FROM courses WHERE archived_at IS NULL ORDER BY name",
        )
        .all(),
      canAdmin: res.locals.user.role === "admin",
      lessons: db
        .prepare(
          "SELECT id,title FROM lesson_plans WHERE archived_at IS NULL AND (?='admin' OR visibility='school' OR owner_id=?) ORDER BY title,id",
        )
        .all(res.locals.user.role, res.locals.user.id),
    }),
  );
  app.get("/api/v1/schedules/entries", (req, res) => {
    const [from, to] = range(req.query);
    reply(res, rows(res, from, to));
  });
  app.post("/api/v1/schedules/entries", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        admin(res);
        const data = validate(req.body);
        classAccess(db, res, data.class_id);
        noConflict(data);
        const lessonId = req.body.lesson_id || null;
        if (lessonId) {
          const lesson = db
            .prepare(
              "SELECT id FROM lesson_plans WHERE id=? AND archived_at IS NULL AND (?='admin' OR owner_id=? OR visibility='school')",
            )
            .get(lessonId, res.locals.user.role, res.locals.user.id);
          if (!lesson) throw new HttpError(422, "关联教案不存在或不可见");
        }
        const id = randomUUID();
        db.prepare(
          "INSERT INTO schedule_entries(id,class_id,teacher_id,course_id,starts_at,ends_at,room,lesson_id) VALUES (?,?,?,?,?,?,?,?)",
        ).run(
          id,
          data.class_id,
          data.teacher_id,
          data.course_id,
          data.starts_at,
          data.ends_at,
          data.room,
          lessonId,
        );
        return read(id, res);
      },
      "课时已建立",
    ),
  );
  app.patch("/api/v1/schedules/entries/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        admin(res);
        const row = read(req.params.id, res);
        version(req.body, row);
        if (req.body.cancelled !== true)
          throw new HttpError(422, "只支持取消课时，改期请发起审批");
        db.prepare(
          "UPDATE schedule_entries SET cancelled_at=?,version=version+1 WHERE id=?",
        ).run(new Date().toISOString(), row.id);
        return read(row.id, res);
      },
      "课时已取消",
    ),
  );
  app.get("/api/v1/schedules/changes", (_req, res) => {
    const changes = db
      .prepare(
        "SELECT s.*,e.class_id,e.starts_at,u.full_name AS applicant_name FROM schedule_changes s JOIN schedule_entries e ON e.id=s.entry_id JOIN faculty_users u ON u.id=s.applicant_id ORDER BY s.created_at DESC,s.id",
      )
      .all() as Record<string, any>[];
    reply(
      res,
      changes
        .filter((r) => r.applicant_id === res.locals.user.id || visible(res, r))
        .map((r) => ({ ...r, target: JSON.parse(r.target_json) })),
    );
  });
  app.post("/api/v1/schedules/changes", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = read(req.body.entry_id, res);
        version(req.body, row);
        if (row.cancelled_at) throw new HttpError(409, "课时已取消");
        if (
          res.locals.user.role !== "admin" &&
          row.teacher_id !== res.locals.user.id
        )
          throw new HttpError(403, "只能为自己的课时申请调代课");
        if (
          db
            .prepare(
              "SELECT id FROM schedule_changes WHERE entry_id=? AND status='pending'",
            )
            .get(row.id)
        )
          throw new HttpError(409, "该课时已有待审申请");
        const target = validate({
          ...row,
          ...req.body.target,
          class_id: row.class_id,
          course_id: row.course_id,
        });
        noConflict(target, row.id);
        const id = randomUUID();
        db.prepare(
          "INSERT INTO schedule_changes(id,entry_id,source_version,applicant_id,target_json,reason,created_at) VALUES (?,?,?,?,?,?,?)",
        ).run(
          id,
          row.id,
          row.version,
          res.locals.user.id,
          JSON.stringify({
            teacher_id: target.teacher_id,
            starts_at: target.starts_at,
            ends_at: target.ends_at,
            room: target.room,
          }),
          text(req.body.reason, "调课原因", { max: 2000 }),
          new Date().toISOString(),
        );
        return { id, status: "pending" };
      },
      "申请已提交，审批通过后生效",
    ),
  );
  app.patch("/api/v1/schedules/changes/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const change = db
          .prepare("SELECT * FROM schedule_changes WHERE id=?")
          .get(req.params.id) as Record<string, any> | undefined;
        if (!change) throw new HttpError(404, "申请不存在");
        const source = read(change.entry_id, res);
        version(req.body, change);
        if (change.status !== "pending") throw new HttpError(409, "申请已处理");
        const status = req.body.status;
        if (!["approved", "rejected", "cancelled"].includes(status))
          throw new HttpError(422, "审批状态无效");
        if (status === "cancelled") {
          if (
            change.applicant_id !== res.locals.user.id &&
            res.locals.user.role !== "admin"
          )
            throw new HttpError(403, "只能取消自己的申请");
        } else {
          admin(res);
          if (change.applicant_id === res.locals.user.id)
            throw new HttpError(403, "申请人不能审批自己的申请");
        }
        if (status === "approved") {
          if (source.cancelled_at || source.version !== change.source_version)
            throw new HttpError(409, "原课时已变化，请重新申请");
          const target = validate({
            ...source,
            ...JSON.parse(change.target_json),
          });
          noConflict(target, source.id);
          db.prepare(
            "UPDATE schedule_entries SET teacher_id=?,starts_at=?,ends_at=?,room=?,version=version+1 WHERE id=?",
          ).run(
            target.teacher_id,
            target.starts_at,
            target.ends_at,
            target.room,
            source.id,
          );
        }
        const note =
          req.body.review_note === undefined
            ? ""
            : String(req.body.review_note);
        if (note.length > 2000) throw new HttpError(422, "审批意见过长");
        db.prepare(
          "UPDATE schedule_changes SET status=?,reviewer_id=?,review_note=?,version=version+1 WHERE id=?",
        ).run(status, res.locals.user.id, note, change.id);
        return { id: change.id, status };
      },
      "申请状态已更新",
    ),
  );
  app.get("/api/v1/schedules/calendar.ics", (req, res) => {
    const [from, to] = range(req.query),
      stamp = (s: string) =>
        new Date(s)
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, ""),
      escape = (s: string) =>
        s
          .replace(/\\/g, "\\\\")
          .replace(/\r?\n/g, "\\n")
          .replace(/,/g, "\\,")
          .replace(/;/g, "\\;");
    const events = rows(res, from, to).map((row) =>
      [
        "BEGIN:VEVENT",
        `UID:${row.id}@sakura.local`,
        `DTSTAMP:${stamp(new Date().toISOString())}`,
        `DTSTART:${stamp(row.starts_at)}`,
        `DTEND:${stamp(row.ends_at)}`,
        `SUMMARY:${escape(`${row.class_name} ${row.course_name}`)}`,
        `LOCATION:${escape(row.room)}`,
        `DESCRIPTION:${escape(row.full_name)}`,
        "END:VEVENT",
      ].join("\r\n"),
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sakura-calendar.ics"',
    );
    res
      .type("text/calendar")
      .send(
        [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//SakuraEdu//Schedule//ZH",
          "CALSCALE:GREGORIAN",
          ...events,
          "END:VCALENDAR",
          "",
        ].join("\r\n"),
      );
  });
  app.post("/api/v1/schedules/swap-requests", (_req, _res, next) =>
    next(new HttpError(409, "旧调课接口已停用，请使用带审批的调代课申请")),
  );
}
