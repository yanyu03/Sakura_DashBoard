import { notifyChange } from "./notificationEvents";
import type { Express, Response, Request } from "express";
import type {DatabaseConnection} from "./dbContract";
import { randomUUID } from "node:crypto";
import { HttpError, text, pagination } from "./http";
import { exactDate } from "./business";
import { hashPassword } from "./passwords";
import type { AuthUser } from "./auth";

const reply = (res: Response, data: unknown, message = "已加载基础资料") =>
  res.json({
    code: 200,
    success: true,
    data,
    message,
    traceId: res.locals.requestId,
    timestamp: new Date().toISOString(),
  });

function mutation(
  req: Request,
  res: Response,
  db: DatabaseConnection,
  operation: (respond: (data: unknown, message?: string) => void) => void,
) {
  let response: { data: unknown; message: string } | undefined;
  db.transaction(() => {
    operation((data, message = "资料已保存") => {
      response = { data, message };
    });
    if (!response) throw new Error("Mutation did not produce a response");
    notifyChange(db, req, res, response.data, response.message);
    db.prepare(
      "INSERT INTO sql_audit_logs(trace_id,fn_name,http_method,endpoint,sql_text,rows_affected,created_at) VALUES (?,?,?,?,?,1,strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
    ).run(
      res.locals.requestId,
      `academic.${req.method}`,
      req.method,
      req.originalUrl,
      JSON.stringify({ actor: res.locals.user.id, resource: req.path }),
    );
  })();
  return reply(res, response!.data, response!.message);
}

export function registerAcademic(app: Express, db: DatabaseConnection) {
  const admin = (res: Response) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "需要管理员权限");
  };
  const exists = (table: string, id: unknown) => {
    const row =
      typeof id === "string"
        ? (db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id) as
            | Record<string, any>
            | undefined)
        : undefined;
    if (
      !row ||
      row.archived_at ||
      (table === "faculty_users" && row.status !== "ACTIVE")
    )
      throw new HttpError(422, "关联资料不存在或已归档");
    return id as string;
  };
  const scopedClasses = (res: Response) =>
    res.locals.user.role === "admin"
      ? null
      : (
          db
            .prepare(
              "SELECT class_id FROM teaching_assignments WHERE teacher_id=? AND archived_at IS NULL UNION SELECT id FROM academic_classes WHERE head_teacher_id=? AND archived_at IS NULL",
            )
            .all(res.locals.user.id, res.locals.user.id) as {
            class_id: string;
          }[]
        ).map((r) => r.class_id);
  app.get("/api/v1/academic/terms", (_req, res) =>
    reply(
      res,
      db
        .prepare(
          "SELECT * FROM academic_terms WHERE archived_at IS NULL ORDER BY starts_on DESC,id",
        )
        .all(),
    ),
  );
  app.post("/api/v1/academic/terms", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const id = randomUUID(),
        code = text(req.body.code, "学期代码", { max: 40 }),
        name = text(req.body.name, "学期名称", { max: 80 }),
        start = text(req.body.starts_on, "开始日期"),
        end = text(req.body.ends_on, "结束日期");
      if (!exactDate(start) || !exactDate(end) || start > end)
        throw new HttpError(422, "学期日期无效");
      db.transaction(() => {
        if (req.body.active)
          db.prepare(
            "UPDATE academic_terms SET active=0,version=version+1 WHERE active=1 AND id<>?",
          ).run(id);
        db.prepare(
          "INSERT INTO academic_terms(id,code,name,starts_on,ends_on,active) VALUES (?,?,?,?,?,?)",
        ).run(id, code, name, start, end, req.body.active ? 1 : 0);
      })();
      respond(
        db.prepare("SELECT * FROM academic_terms WHERE id=?").get(id),
        "学期已创建",
      );
    }),
  );
  app.get("/api/v1/academic/courses", (_req, res) =>
    reply(
      res,
      db
        .prepare(
          "SELECT * FROM courses WHERE archived_at IS NULL ORDER BY code",
        )
        .all(),
    ),
  );
  app.post("/api/v1/academic/courses", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const id = randomUUID();
      db.prepare("INSERT INTO courses(id,code,name) VALUES (?,?,?)").run(
        id,
        text(req.body.code, "课程代码", { max: 40 }),
        text(req.body.name, "课程名称", { max: 80 }),
      );
      respond({ id }, "课程已创建");
    }),
  );
  app.get("/api/v1/academic/faculty", (_req, res) => {
    admin(res);
    reply(
      res,
      db
        .prepare(
          "SELECT id,faculty_code,email,full_name,title_role,department,role,status,version FROM faculty_users ORDER BY faculty_code",
        )
        .all(),
    );
  });
  app.post("/api/v1/academic/faculty", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const password = text(req.body.password, "初始密码", { max: 128 });
      if (password.length < 8) throw new HttpError(422, "初始密码至少 8 位");
      const role = req.body.role || "teacher";
      if (!["teacher", "admin"].includes(role))
        throw new HttpError(422, "角色无效");
      const id = randomUUID();
      db.prepare(
        "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role) VALUES (?,?,?,?,?,?,?,?)",
      ).run(
        id,
        text(req.body.faculty_code, "教工号", { max: 50 }),
        text(req.body.email, "邮箱", { max: 128 }),
        hashPassword(password),
        text(req.body.full_name, "姓名", { max: 80 }),
        text(req.body.title_role || "任课教师", "职务", { max: 100 }),
        text(req.body.department || "教研组", "部门", { max: 100 }),
        role,
      );
      respond({ id }, "教师账户已创建");
    }),
  );
  app.get("/api/v1/academic/classes", (_req, res) => {
    const scope = scopedClasses(res);
    const rows = db
      .prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM student_profiles s WHERE s.class_id=c.id AND s.archived_at IS NULL) AS actual_count FROM academic_classes c WHERE c.archived_at IS NULL ${scope ? `AND c.id IN (${scope.map(() => "?").join(",") || "NULL"})` : ""} ORDER BY c.class_code,c.id`,
      )
      .all(...(scope || []));
    reply(res, rows);
  });
  app.post("/api/v1/academic/classes", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const id = randomUUID(),
        teacher = req.body.head_teacher_id
          ? exists("faculty_users", req.body.head_teacher_id)
          : null;
      db.prepare(
        "INSERT INTO academic_classes(id,class_code,class_name,grade_level,head_teacher_id,student_count,room_location) VALUES (?,?,?,?,?,0,?)",
      ).run(
        id,
        text(req.body.class_code, "班级代码", { max: 50 }),
        text(req.body.class_name, "班级名称", { max: 80 }),
        text(req.body.grade_level, "年级", { max: 40 }),
        teacher,
        String(req.body.room_location || ""),
      );
      respond({ id }, "班级已创建");
    }),
  );
  app.patch("/api/v1/academic/classes/:id", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const row = db
        .prepare("SELECT * FROM academic_classes WHERE id=?")
        .get(req.params.id) as Record<string, any> | undefined;
      if (!row) throw new HttpError(404, "班级不存在");
      if (req.body.version !== row.version)
        throw new HttpError(409, "班级资料已变化，请刷新");
      const teacher = req.body.head_teacher_id
        ? exists("faculty_users", req.body.head_teacher_id)
        : row.head_teacher_id;
      if (
        req.body.archived &&
        (
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM student_profiles WHERE class_id=? AND archived_at IS NULL",
            )
            .get(row.id) as { n: number }
        ).n
      )
        throw new HttpError(409, "请先转出或归档班级学生");
      db.prepare(
        "UPDATE academic_classes SET class_name=?,grade_level=?,head_teacher_id=?,room_location=?,archived_at=?,version=version+1 WHERE id=?",
      ).run(
        text(req.body.class_name ?? row.class_name, "班级名称"),
        text(req.body.grade_level ?? row.grade_level, "年级"),
        teacher,
        String(req.body.room_location ?? row.room_location),
        req.body.archived ? new Date().toISOString() : row.archived_at,
        row.id,
      );
      respond({ id: row.id, version: row.version + 1 }, "班级资料已更新");
    }),
  );
  app.post("/api/v1/academic/teaching-assignments", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const args = [
        exists("faculty_users", req.body.teacher_id),
        exists("academic_classes", req.body.class_id),
        exists("courses", req.body.course_id),
        exists("academic_terms", req.body.term_id),
      ];
      db.prepare(
        "INSERT INTO teaching_assignments(teacher_id,class_id,course_id,term_id) VALUES (?,?,?,?)",
      ).run(...args);
      respond({ created: true }, "任教关系已保存");
    }),
  );
  app.get("/api/v1/academic/teaching-assignments", (_req, res) => {
    admin(res);
    reply(
      res,
      db
        .prepare(
          "SELECT t.*,u.full_name,c.class_name FROM teaching_assignments t JOIN faculty_users u ON u.id=t.teacher_id JOIN academic_classes c ON c.id=t.class_id WHERE t.archived_at IS NULL ORDER BY t.teacher_id,t.class_id",
        )
        .all(),
    );
  });
  for (const [resource, table] of [
    ["terms", "academic_terms"],
    ["courses", "courses"],
    ["faculty", "faculty_users"],
    ["teaching-assignments", "teaching_assignments"],
  ] as const) {
    app.patch(`/api/v1/academic/${resource}/:id`, (req, res) =>
      mutation(req, res, db, (respond) => {
        admin(res);
        const row = db
          .prepare(`SELECT * FROM ${table} WHERE id=?`)
          .get(req.params.id) as Record<string, any> | undefined;
        if (!row) throw new HttpError(404, "资料不存在");
        if (req.body.version !== row.version)
          throw new HttpError(409, "资料已变化，请刷新");
        db.transaction(() => {
          if (resource === "faculty") {
            if (row.id === res.locals.user.id && req.body.archived)
              throw new HttpError(409, "不能归档当前登录账户");
            if (req.body.archived) {
              db.prepare(
                "UPDATE faculty_users SET status='ARCHIVED',version=version+1 WHERE id=?",
              ).run(row.id);
              db.prepare("DELETE FROM auth_sessions WHERE user_id=?").run(
                row.id,
              );
            } else
              db.prepare(
                "UPDATE faculty_users SET full_name=?,department=?,title_role=?,version=version+1 WHERE id=?",
              ).run(
                text(req.body.full_name ?? row.full_name, "教师姓名"),
                String(req.body.department ?? row.department),
                String(req.body.title_role ?? row.title_role),
                row.id,
              );
          } else if (resource === "terms") {
            const start = String(req.body.starts_on ?? row.starts_on),
              end = String(req.body.ends_on ?? row.ends_on);
            if (!exactDate(start) || !exactDate(end) || start > end)
              throw new HttpError(422, "学期日期无效");
            if (req.body.active)
              db.prepare(
                "UPDATE academic_terms SET active=0,version=version+1 WHERE active=1 AND id<>?",
              ).run(row.id);
            db.prepare(
              "UPDATE academic_terms SET name=?,starts_on=?,ends_on=?,active=?,archived_at=?,version=version+1 WHERE id=?",
            ).run(
              text(req.body.name ?? row.name, "学期名称"),
              start,
              end,
              req.body.archived
                ? 0
                : req.body.active === undefined
                  ? row.active
                  : req.body.active
                    ? 1
                    : 0,
              req.body.archived ? new Date().toISOString() : row.archived_at,
              row.id,
            );
          } else if (resource === "courses")
            db.prepare(
              "UPDATE courses SET name=?,archived_at=?,version=version+1 WHERE id=?",
            ).run(
              text(req.body.name ?? row.name, "课程名称"),
              req.body.archived ? new Date().toISOString() : row.archived_at,
              row.id,
            );
          else
            db.prepare(
              "UPDATE teaching_assignments SET teacher_id=?,class_id=?,course_id=?,term_id=?,archived_at=?,version=version+1 WHERE id=?",
            ).run(
              exists("faculty_users", req.body.teacher_id ?? row.teacher_id),
              exists("academic_classes", req.body.class_id ?? row.class_id),
              exists("courses", req.body.course_id ?? row.course_id),
              exists("academic_terms", req.body.term_id ?? row.term_id),
              req.body.archived ? new Date().toISOString() : null,
              row.id,
            );
        })();
        respond({ id: row.id, version: row.version + 1 }, "资料已更新");
      }),
    );
  }
  app.get("/api/v1/academic/students", (req, res) => {
    const { page, pageSize, offset } = pagination(req.query),
      scope = scopedClasses(res),
      args: unknown[] = [];
    let where = "s.archived_at IS NULL";
    if (scope) {
      where += ` AND s.class_id IN (${scope.map(() => "?").join(",") || "NULL"})`;
      args.push(...scope);
    }
    if (req.query.classId) {
      where += " AND s.class_id=?";
      args.push(String(req.query.classId));
    }
    if (req.query.q) {
      where += " AND (instr(s.full_name,?)>0 OR instr(s.student_no,?)>0)";
      args.push(String(req.query.q), String(req.query.q));
    }
    const total = (
      db
        .prepare(`SELECT COUNT(*) AS n FROM student_profiles s WHERE ${where}`)
        .get(...args) as { n: number }
    ).n;
    const items = db
      .prepare(
        `SELECT s.id,s.student_no,s.full_name,s.class_id,s.avatar_char,s.tag_category,s.version,c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE ${where} ORDER BY s.student_no,s.id LIMIT ? OFFSET ?`,
      )
      .all(...args, pageSize, offset);
    reply(res, { items, total, page, pageSize });
  });
  app.post("/api/v1/academic/students", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const id = randomUUID(),
        classId = exists("academic_classes", req.body.class_id),
        termId = exists("academic_terms", req.body.term_id),
        name = text(req.body.full_name, "学生姓名", { max: 80 }),
        studentNo = text(req.body.student_no, "学号", { max: 50 });
      const klass = db
        .prepare(
          "SELECT class_name,archived_at FROM academic_classes WHERE id=?",
        )
        .get(classId) as { class_name: string; archived_at: string | null };
      if (klass.archived_at)
        throw new HttpError(422, "不能向已归档班级添加学生");
      const payload = {
        id,
        name,
        studentNo,
        shortNo: studentNo.slice(-2),
        className: klass.class_name,
        role: "",
        avatarChar: name[0],
        badgeText: "",
        badgeType: "normal",
        tagCategory: "care",
        rankBadge: "暂无成绩",
        trendText: "暂无成绩",
        trendDir: "flat",
        dailyStatus: "暂无记录",
        bio: "",
        sakuraMedals: [],
        radarScores: {
          classical: 0,
          modern: 0,
          writing: 0,
          poetry: 0,
          basics: 0,
          overall: 0,
        },
        strengthModule: "暂无分析",
        potentialModule: "暂无分析",
        examTrajectory: {
          rankChange: "暂无成绩",
          points: [],
          summary: "暂无考试记录",
          expectation: "",
        },
        presenceMetrics: {
          attendance: "—",
          attendanceSub: "暂无记录",
          interaction: "—",
          interactionSub: "暂无记录",
          quizSpeed: "—",
          quizSpeedSub: "暂无记录",
        },
        coachingJournals: [],
        parentMessages: [],
        parentName: "",
        careKitTitle: "暂无关怀包",
        careKitSub: "",
      };
      db.transaction(() => {
        db.prepare(
          "INSERT INTO student_profiles(id,student_no,short_no,full_name,avatar_char,class_id,tag_category,radar_classical,radar_modern,radar_writing,radar_poetry,radar_basics,composite_score,payload_json) VALUES (?,?,?,?,?,?,?,0,0,0,0,0,0,?)",
        ).run(
          id,
          studentNo,
          studentNo.slice(-2),
          name,
          name[0],
          classId,
          "care",
          JSON.stringify(payload),
        );
        db.prepare(
          "INSERT INTO class_enrollments(student_id,class_id,term_id) VALUES (?,?,?)",
        ).run(id, classId, termId);
      })();
      respond({ id }, "学生已创建");
    }),
  );
  app.patch("/api/v1/academic/students/:id", (req, res) =>
    mutation(req, res, db, (respond) => {
      admin(res);
      const row = db
        .prepare("SELECT * FROM student_profiles WHERE id=?")
        .get(req.params.id) as Record<string, any> | undefined;
      if (!row) throw new HttpError(404, "学生不存在");
      if (req.body.version !== row.version)
        throw new HttpError(409, "学生资料已变化，请刷新");
      const name = text(req.body.full_name ?? row.full_name, "学生姓名", {
          max: 80,
        }),
        classId = req.body.class_id
          ? exists("academic_classes", req.body.class_id)
          : row.class_id;
      const classRow = db
        .prepare("SELECT archived_at FROM academic_classes WHERE id=?")
        .get(classId) as { archived_at: string | null };
      if (classRow.archived_at) throw new HttpError(422, "目标班级已归档");
      const termId = req.body.term_id
        ? exists("academic_terms", req.body.term_id)
        : null;
      if (classId !== row.class_id && !termId)
        throw new HttpError(422, "转班必须指定学期");
      db.transaction(() => {
        db.prepare(
          "UPDATE student_profiles SET full_name=?,avatar_char=?,class_id=?,archived_at=?,version=version+1 WHERE id=?",
        ).run(
          name,
          name[0],
          classId,
          req.body.archived ? new Date().toISOString() : row.archived_at,
          row.id,
        );
        if (termId)
          db.prepare(
            "INSERT INTO class_enrollments(student_id,class_id,term_id) VALUES (?,?,?) ON CONFLICT(student_id,term_id) DO UPDATE SET class_id=excluded.class_id",
          ).run(row.id, classId, termId);
      })();
      respond({ id: row.id, version: row.version + 1 }, "学生资料已更新");
    }),
  );
}
