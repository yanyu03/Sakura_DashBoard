import type { Express, Response } from "express";
import type {DatabaseConnection} from "./dbContract";
import { randomUUID } from "node:crypto";
import { HttpError, text } from "./http";
import { classAccess, mutate, reply, version } from "./business";
import { notificationTime } from "./notificationTime";
export { notificationTime } from "./notificationTime";
export function registerCare(app: Express, db: DatabaseConnection) {
  const student = (id: unknown, res: Response) => {
    const row = db
      .prepare("SELECT * FROM student_profiles WHERE id=?")
      .get(id) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "学生不存在");
    classAccess(db, res, row.class_id);
    return row;
  };
  const contact = (id: unknown, res: Response) => {
    const row = db.prepare("SELECT * FROM care_contacts WHERE id=?").get(id) as
      | Record<string, any>
      | undefined;
    if (!row) throw new HttpError(404, "联系人不存在");
    student(row.student_id, res);
    return row;
  };
  const thread = (id: unknown, res: Response) => {
    const row = db.prepare("SELECT * FROM care_threads WHERE id=?").get(id) as
      | Record<string, any>
      | undefined;
    if (!row) throw new HttpError(404, "会话不存在");
    contact(row.contact_id, res);
    if (
      row.teacher_id !== res.locals.user.id &&
      res.locals.user.role !== "admin"
    )
      throw new HttpError(403, "无权访问其他教师的会话");
    return row;
  };
  app.get("/api/v1/care/contacts", (req, res) => {
    student(req.query.studentId, res);
    reply(
      res,
      db
        .prepare(
          "SELECT * FROM care_contacts WHERE student_id=? AND archived_at IS NULL ORDER BY name,id",
        )
        .all(req.query.studentId),
    );
  });
  app.post("/api/v1/care/contacts", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const s = student(req.body.student_id, res);
        if (s.archived_at) throw new HttpError(409, "学生已归档");
        const id = randomUUID();
        db.prepare(
          "INSERT INTO care_contacts(id,student_id,name,relationship,phone) VALUES (?,?,?,?,?)",
        ).run(
          id,
          s.id,
          text(req.body.name, "联系人姓名", { max: 80 }),
          text(req.body.relationship, "关系", { max: 40 }),
          String(req.body.phone || "").slice(0, 40),
        );
        return { id };
      },
      "联系人已保存",
    ),
  );
  app.patch("/api/v1/care/contacts/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = contact(req.params.id, res);
        version(req.body, row);
        db.prepare(
          "UPDATE care_contacts SET name=?,relationship=?,phone=?,archived_at=?,version=version+1 WHERE id=?",
        ).run(
          text(req.body.name ?? row.name, "姓名", { max: 80 }),
          text(req.body.relationship ?? row.relationship, "关系", { max: 40 }),
          String(req.body.phone ?? row.phone).slice(0, 40),
          req.body.archived ? new Date().toISOString() : row.archived_at,
          row.id,
        );
        return { id: row.id, version: row.version + 1 };
      },
      "联系人已更新",
    ),
  );
  app.get("/api/v1/care/threads", (req, res) => {
    const rows = db
      .prepare(
        `SELECT t.*,c.name AS contact_name,c.relationship,c.student_id,s.full_name AS student_name,s.class_id,(SELECT COUNT(*) FROM care_messages m WHERE m.thread_id=t.id AND m.kind='incoming-record' AND m.sequence>t.last_read_sequence) AS unread_count FROM care_threads t JOIN care_contacts c ON c.id=t.contact_id JOIN student_profiles s ON s.id=c.student_id WHERE (?='admin' OR t.teacher_id=?) ${req.query.studentId ? "AND c.student_id=?" : ""} ORDER BY t.updated_at DESC,t.id`,
      )
      .all(
        res.locals.user.role,
        res.locals.user.id,
        ...(req.query.studentId ? [String(req.query.studentId)] : []),
      ) as Record<string, any>[];
    reply(
      res,
      rows
        .filter((r) => {
          try {
            classAccess(db, res, r.class_id);
            return true;
          } catch {
            return false;
          }
        })
        .map((r) => ({ ...r, canWrite: r.teacher_id === res.locals.user.id })),
    );
  });
  app.post("/api/v1/care/threads", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const c = contact(req.body.contact_id, res);
        if (c.archived_at) throw new HttpError(409, "联系人已归档");
        const existing = db
          .prepare(
            "SELECT id FROM care_threads WHERE contact_id=? AND teacher_id=?",
          )
          .get(c.id, res.locals.user.id) as { id: string } | undefined;
        if (existing) return existing;
        const id = randomUUID();
        db.prepare(
          "INSERT INTO care_threads(id,contact_id,teacher_id,updated_at) VALUES (?,?,?,?)",
        ).run(id, c.id, res.locals.user.id, new Date().toISOString());
        return { id };
      },
      "会话已打开",
    ),
  );
  app.get("/api/v1/care/threads/:id/messages", (req, res) => {
    thread(req.params.id, res);
    reply(
      res,
      db
        .prepare(
          "SELECT * FROM care_messages WHERE thread_id=? ORDER BY sequence",
        )
        .all(req.params.id),
    );
  });
  app.post("/api/v1/care/threads/:id/read", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = thread(req.params.id, res);
        if (row.teacher_id !== res.locals.user.id)
          throw new HttpError(403, "只能修改自己的已读状态");
        db.prepare(
          "UPDATE care_threads SET last_read_sequence=COALESCE((SELECT MAX(sequence) FROM care_messages WHERE thread_id=?),0) WHERE id=?",
        ).run(row.id, row.id);
        return { id: row.id };
      },
      "已标记已读",
    ),
  );
  app.post("/api/v1/care/threads/:id/messages", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = thread(req.params.id, res);
        if (row.teacher_id !== res.locals.user.id)
          throw new HttpError(403, "只能在自己的会话中记录消息");
        const c = contact(row.contact_id, res);
        if (c.archived_at) throw new HttpError(409, "联系人已归档");
        const content = text(req.body.content, "消息正文", { max: 20000 }),
          key = text(req.body.request_key, "请求标识", { max: 100 }),
          kind = req.body.kind;
        if (!["note", "outgoing", "incoming-record"].includes(kind))
          throw new HttpError(422, "消息类型无效");
        const previous = db
          .prepare(
            "SELECT * FROM care_messages WHERE actor_id=? AND request_key=?",
          )
          .get(res.locals.user.id, key) as Record<string, any> | undefined;
        if (previous) {
          if (
            previous.thread_id !== row.id ||
            previous.content !== content ||
            previous.kind !== kind
          )
            throw new HttpError(409, "请求标识已用于另一条消息");
          return previous;
        }
        const id = randomUUID(),
          now = new Date().toISOString(),
          status = kind === "outgoing" ? "queued" : "recorded",
          notBefore = notificationTime(res.locals.user);
        db.prepare(
          "INSERT INTO care_messages(id,thread_id,actor_id,request_key,kind,content,status,not_before,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        ).run(
          id,
          row.id,
          res.locals.user.id,
          key,
          kind,
          content,
          status,
          notBefore,
          now,
        );
        db.prepare(
          "UPDATE care_threads SET last_message=?,updated_at=? WHERE id=?",
        ).run(content, now, row.id);
        return db.prepare("SELECT * FROM care_messages WHERE id=?").get(id);
      },
      "已保存站内记录；待发送内容尚未对外投递",
    ),
  );
  app.get("/api/v1/care/todos", (req, res) => {
    const rows = db
      .prepare(
        `SELECT t.*,s.full_name,s.class_id FROM care_todos t JOIN student_profiles s ON s.id=t.student_id WHERE (?='admin' OR t.owner_id=?) ${req.query.studentId ? "AND t.student_id=?" : ""} ${req.query.dueBefore ? "AND t.due_at<=?" : ""} ORDER BY t.due_at,t.id`,
      )
      .all(
        res.locals.user.role,
        res.locals.user.id,
        ...(req.query.studentId ? [String(req.query.studentId)] : []),
        ...(req.query.dueBefore ? [String(req.query.dueBefore)] : []),
      ) as Record<string, any>[];
    reply(
      res,
      rows.filter((r) => {
        try {
          classAccess(db, res, r.class_id);
          return true;
        } catch {
          return false;
        }
      }),
    );
  });
  app.post("/api/v1/care/todos", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const s = student(req.body.student_id, res),
          due = String(req.body.due_at);
        if (!Number.isFinite(Date.parse(due)))
          throw new HttpError(422, "待办日期无效");
        const id = randomUUID();
        db.prepare(
          "INSERT INTO care_todos(id,student_id,owner_id,title,due_at,created_at) VALUES (?,?,?,?,?,?)",
        ).run(
          id,
          s.id,
          res.locals.user.id,
          text(req.body.title, "待办标题", { max: 200 }),
          new Date(due).toISOString(),
          new Date().toISOString(),
        );
        return { id };
      },
      "关怀待办已创建",
    ),
  );
  app.patch("/api/v1/care/todos/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const row = db
          .prepare("SELECT * FROM care_todos WHERE id=?")
          .get(req.params.id) as Record<string, any> | undefined;
        if (!row) throw new HttpError(404, "待办不存在");
        student(row.student_id, res);
        if (
          row.owner_id !== res.locals.user.id &&
          res.locals.user.role !== "admin"
        )
          throw new HttpError(403, "无权修改他人待办");
        version(req.body, row);
        if (!["open", "done", "cancelled"].includes(req.body.status))
          throw new HttpError(422, "待办状态无效");
        db.prepare(
          "UPDATE care_todos SET status=?,version=version+1 WHERE id=?",
        ).run(req.body.status, row.id);
        return { id: row.id, version: row.version + 1 };
      },
      "待办状态已保存",
    ),
  );
  app.get("/api/v1/students/:id/coaching-journals", (req, res) => {
    student(req.params.id, res);
    reply(
      res,
      db
        .prepare(
          "SELECT * FROM coaching_journals WHERE student_id=? ORDER BY created_at DESC,id",
        )
        .all(req.params.id),
    );
  });
  app.post("/api/v1/students/:id/coaching-journals", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const s = student(req.params.id, res),
          id = randomUUID(),
          now = new Date().toISOString();
        db.prepare(
          "INSERT INTO coaching_journals(id,student_id,student_name,teacher_id,date_title,tag,content,teacher_name,status_text,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        ).run(
          id,
          s.id,
          s.full_name,
          res.locals.user.id,
          now.slice(0, 10),
          String(req.body.tag || "关怀记录").slice(0, 40),
          text(req.body.content, "辅导内容", { max: 20000 }),
          res.locals.user.full_name,
          "站内已记录",
          now,
        );
        return { id };
      },
      "辅导记录已保存",
    ),
  );
  app.get("/api/v1/students/:id/profile", (req, res) => {
    const s = student(req.params.id, res);
    reply(res, {
      id: s.id,
      full_name: s.full_name,
      student_no: s.student_no,
      class_id: s.class_id,
      tag_category: s.tag_category,
      version: s.version,
      bio: JSON.parse(s.payload_json).bio || "",
    });
  });
  app.patch("/api/v1/students/:id/profile", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        const s = student(req.params.id, res);
        version(req.body, s);
        const tag = req.body.tag_category ?? s.tag_category;
        if (
          !["focus", "progress", "coaching", "competition", "care"].includes(
            tag,
          )
        )
          throw new HttpError(422, "学生标签无效");
        const payload = JSON.parse(s.payload_json),
          bio = req.body.bio ?? payload.bio;
        if (typeof bio !== "string" || bio.length > 2000)
          throw new HttpError(422, "简介无效");
        db.prepare(
          "UPDATE student_profiles SET tag_category=?,payload_json=?,version=version+1 WHERE id=?",
        ).run(tag, JSON.stringify({ ...payload, bio }), s.id);
        return { id: s.id, version: s.version + 1 };
      },
      "档案已保存",
    ),
  );
}
