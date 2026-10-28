import type { Express, Response } from "express";
import type { DatabaseConnection } from "./dbContract";
import { randomUUID } from "node:crypto";
import { HttpError, text } from "./http";
import { exactDate, mutate, reply, version } from "./business";
import { scheduleAccess, requestScheduleAccess } from "./scheduleAccess";
import { registerScheduleDepartments } from "./scheduleDepartments";
import { registerScheduleSubmissions } from "./scheduleSubmissions";
import { registerOrganization } from "./organization";
import {
  assertSubstituteQualification,
  sameSchoolPerson,
} from "./organizationCore";
export function registerSchedules(app: Express, db: DatabaseConnection) {
  const admin = (res: Response, unitId?: string) => {
    requestScheduleAccess(db, res).requireManager(unitId);
    const ids = process.env.SAKURA_SWAP_APPROVER_IDS?.split(",");
    if (ids && !ids.includes(res.locals.user.id))
      throw new HttpError(403, "未配置为调课审批人");
  };
  const read = (id: unknown, res: Response) => {
    const row = db
      .prepare(
        "SELECT e.*,s.unit_id FROM schedule_entries e LEFT JOIN schedule_entry_scopes s ON s.entry_id=e.id WHERE e.id=?",
      )
      .get(id) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "课时不存在");
    if (
      row.teacher_id !== res.locals.user.id &&
      !requestScheduleAccess(db, res).visible(row.unit_id)
    )
      throw new HttpError(404, "课时不存在或未共享");
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
      return (
        row.teacher_id === res.locals.user.id ||
        requestScheduleAccess(db, res).visible(row.unit_id)
      );
    } catch {
      return false;
    }
  };
  const rows = (res: Response, from: string, to: string) =>
    (
      db
        .prepare(
          "SELECT e.*,s.unit_id,o.name unit_name,c.class_name,u.full_name,k.name AS course_name FROM schedule_entries e LEFT JOIN schedule_entry_scopes s ON s.entry_id=e.id LEFT JOIN organization_units o ON o.id=s.unit_id JOIN academic_classes c ON c.id=e.class_id JOIN faculty_users u ON u.id=e.teacher_id JOIN courses k ON k.id=e.course_id WHERE e.cancelled_at IS NULL AND e.starts_at>=? AND e.starts_at<? ORDER BY e.starts_at,e.id",
        )
        .all(from, to) as Record<string, any>[]
    )
      .filter((row) => visible(res, row))
      .map<Record<string, any>>((row) => ({
        ...row,
        lesson_id: row.teacher_id === res.locals.user.id ? row.lesson_id : null,
        canRequestChange: row.teacher_id === res.locals.user.id,
        canCancel:
          row.teacher_id !== res.locals.user.id &&
          requestScheduleAccess(db, res).manages(row.unit_id),
        canShare: row.teacher_id === res.locals.user.id,
      }));
  const range = (query: Record<string, unknown>) => {
    const from = String(
        query.from ||
          new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10),
      ),
      to = String(
        query.to ||
          new Date(Date.now() + 31 * 86400000 + 8 * 3600000)
            .toISOString()
            .slice(0, 10),
      );
    if (
      !exactDate(from) ||
      !exactDate(to) ||
      from >= to ||
      Date.parse(to) - Date.parse(from) > 367 * 86400000
    )
      throw new HttpError(422, "日期范围无效，最多一年，结束日期不含当天");
    return [
      new Date(`${from}T00:00:00+08:00`).toISOString(),
      new Date(`${to}T00:00:00+08:00`).toISOString(),
    ];
  };
  registerScheduleDepartments(app, db);
  registerOrganization(app, db);
  registerScheduleSubmissions(app, db, { validate, noConflict, range });
  app.get("/api/v1/schedules/options", (_req, res) => {
    const scope = requestScheduleAccess(db, res);
    const teachers = (
      db
        .prepare(
          "SELECT id,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY full_name",
        )
        .all() as Record<string, any>[]
    ).filter(
      (u) =>
        u.id === res.locals.user.id ||
        scope.departments.some((d) => scheduleAccess(db, u.id).member(d.id)),
    );
    const teacherIds = teachers.map((t) => t.id);
    const classes = (
      db
        .prepare(
          "SELECT c.id,c.class_name,t.teacher_id,t.course_id,a.name term_name,a.starts_on,a.ends_on FROM academic_classes c JOIN teaching_assignments t ON t.class_id=c.id JOIN academic_terms a ON a.id=t.term_id WHERE c.archived_at IS NULL AND t.archived_at IS NULL AND a.archived_at IS NULL",
        )
        .all() as Record<string, any>[]
    ).filter((c) => teacherIds.includes(c.teacher_id));
    reply(res, {
      teachers,
      classes,
      departments: scope.departments,
      userId: res.locals.user.id,
      assignments: classes.filter((c) => c.teacher_id === res.locals.user.id),
      courses: db
        .prepare(
          "SELECT id,name FROM courses WHERE archived_at IS NULL ORDER BY name",
        )
        .all(),
      canAdmin: res.locals.user.role === "admin",
      lessons: db
        .prepare(
          "SELECT id,title FROM lesson_plans WHERE archived_at IS NULL AND (visibility='school' OR owner_id=?) ORDER BY title,id",
        )
        .all(res.locals.user.id),
    });
  });
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
        throw new HttpError(
          409,
          "请使用课表提交，由教研室负责人审批后生成正式课时",
        );
      },
      "课时已建立",
    ),
  );
  app.patch("/api/v1/schedules/entries/:id/sharing", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = read(req.params.id, res);
        version(req.body, row);
        if (row.teacher_id !== res.locals.user.id)
          throw new HttpError(403, "仅任课教师可变更课时的共享范围");
        if (row.cancelled_at) throw new HttpError(409, "课时已取消");
        const unit = req.body.unit_id || null;
        if (unit) requestScheduleAccess(db, res).requireMember(unit);
        db.prepare("DELETE FROM schedule_entry_scopes WHERE entry_id=?").run(
          row.id,
        );
        if (unit)
          db.prepare(
            "INSERT INTO schedule_entry_scopes(entry_id,unit_id,shared_by) VALUES (?,?,?)",
          ).run(row.id, unit, res.locals.user.id);
        db.prepare(
          "UPDATE schedule_entries SET version=version+1 WHERE id=?",
        ).run(row.id);
        db.prepare(
          "UPDATE schedule_submissions SET shared=CASE WHEN unit_id=? THEN 1 ELSE 0 END,version=version+1,updated_at=? WHERE entry_id=?",
        ).run(unit, new Date().toISOString(), row.id);
        return { id: row.id };
      },
      "课时共享范围已更新",
    ),
  );
  app.patch("/api/v1/schedules/entries/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = read(req.params.id, res);
        admin(res, row.unit_id);
        if (row.teacher_id === res.locals.user.id)
          throw new HttpError(403, "自己的课时请提交调代课申请");
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
        "SELECT s.*,e.class_id,e.teacher_id,e.starts_at,g.unit_id,u.full_name AS applicant_name FROM schedule_changes s JOIN schedule_entries e ON e.id=s.entry_id LEFT JOIN schedule_entry_scopes g ON g.entry_id=e.id JOIN faculty_users u ON u.id=s.applicant_id ORDER BY s.created_at DESC,s.id",
      )
      .all() as Record<string, any>[];
    reply(
      res,
      changes
        .filter(
          (r) =>
            r.applicant_id === res.locals.user.id ||
            requestScheduleAccess(db, res).manages(r.unit_id),
        )
        .map((r) => ({
          ...r,
          target: JSON.parse(r.target_json),
          canReview:
            !sameSchoolPerson(
              db,
              r.applicant_id,
              res.locals.user.id,
              r.unit_id,
            ) && requestScheduleAccess(db, res).manages(r.unit_id),
          canWithdraw: r.applicant_id === res.locals.user.id,
        })),
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
        if (row.teacher_id !== res.locals.user.id)
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
        if (
          target.teacher_id !== row.teacher_id &&
          (!row.unit_id ||
            !scheduleAccess(db, target.teacher_id).member(row.unit_id))
        )
          throw new HttpError(403, "代课教师必须属于共享教研室");
        noConflict(target, row.id);
        if (target.teacher_id !== row.teacher_id && row.unit_id)
          assertSubstituteQualification(
            db,
            target.teacher_id,
            row.unit_id,
            row.course_id,
          );
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
          if (change.applicant_id !== res.locals.user.id)
            throw new HttpError(403, "只能取消自己的申请");
        } else {
          admin(res, source.unit_id);
          if (
            sameSchoolPerson(
              db,
              change.applicant_id,
              res.locals.user.id,
              source.unit_id,
            )
          )
            throw new HttpError(403, "申请人不能审批自己的申请");
        }
        if (status === "approved") {
          if (source.cancelled_at || source.version !== change.source_version)
            throw new HttpError(409, "原课时已变化，请重新申请");
          const target = validate({
            ...source,
            ...JSON.parse(change.target_json),
          });
          if (
            target.teacher_id !== source.teacher_id &&
            (!source.unit_id ||
              !scheduleAccess(db, target.teacher_id).member(source.unit_id))
          )
            throw new HttpError(403, "代课教师任职已失效");
          noConflict(target, source.id);
          if (target.teacher_id !== source.teacher_id && source.unit_id)
            assertSubstituteQualification(
              db,
              target.teacher_id,
              source.unit_id,
              source.course_id,
            );
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
