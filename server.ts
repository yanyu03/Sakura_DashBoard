import svgCaptcha from "svg-captcha";
import { registerWorkspace } from "./server/workspace";
import { registerCare } from "./server/care";
import { registerExams } from "./server/exams";
import { registerSchedules } from "./server/schedules";
import { registerLessons } from "./server/lessons";
import express from "express";
import path from "path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { unlink } from "node:fs/promises";
import { HttpError, apiErrorHandler, text, number } from "./server/http";
import { registerAuth } from "./server/auth";
import { registerHomework } from "./server/homework";
import { registerAcademic } from "./server/academic";
import { createServer as createViteServer } from "vite";
import {
  getSqliteDatabaseSummary,
  initAndSeedSqliteDatabase,
  recordSqlAudit,
  sqliteDb,
} from "./server/sqliteDb";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || "127.0.0.1";

  app.use((_req, res, next) => {
    res.locals.requestId = randomUUID();
    res.setHeader("X-Request-Id", res.locals.requestId);
    next();
  });
  app.use(express.json({ limit: "5mb" }));
  app.use("/api/v1", (req, _res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      if (req.body === undefined) req.body = {};
      if (
        req.body === null ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
      )
        return next(new HttpError(422, "请求内容必须为 JSON 对象"));
    }
    next();
  });

  // Helper to wrap standard API response
  function sendSqlResponse<T>(
    res: express.Response,
    data: T,
    message: string,
    meta: {
      fn: string;
      method: string;
      endpoint: string;
      sql: string;
      rowsAffected?: number;
    },
  ) {
    const traceId = recordSqlAudit(meta);
    return res.json({
      code: 200,
      success: true,
      message,
      data,
      traceId,
      timestamp: new Date().toISOString(),
      sqlExecuted: meta.sql,
    });
  }

  registerAuth(app, sqliteDb, svgCaptcha);
  registerAcademic(app, sqliteDb);
  registerHomework(app, sqliteDb);
  registerLessons(app, sqliteDb);
  registerSchedules(app, sqliteDb);
  registerExams(app, sqliteDb);
  registerCare(app, sqliteDb);
  registerWorkspace(app, sqliteDb);

  // ===========================================================================
  // 2. Schedule & Course Swap Endpoints
  // ===========================================================================
  app.get("/api/v1/homework/submissions", (req, res) => {
    const className = String(req.query.className || "高二(1)班");
    const status = String(req.query.status || "all");

    const rows = sqliteDb
      .prepare(
        `SELECT s.* FROM homework_submissions s JOIN homework_assignments a ON a.id=s.assignment_id WHERE s.class_name=? AND (?='all' OR s.status=?) ${res.locals.classScope ? `AND a.class_id IN (${res.locals.classScope.map(() => "?").join(",")})` : ""} ORDER BY s.submitted_at,s.id`,
      )
      .all(className, status, status, ...(res.locals.classScope || [])) as {
      id: string;
      total_score: number | null;
      status: string;
      status_badge: string;
      stamp_type: string | null;
      payload_json: string;
    }[];

    const parsed = rows.map((r) => {
      const base = JSON.parse(r.payload_json);
      return {
        ...base,
        score: r.total_score ?? base.score,
        status: r.status || base.status,
        statusBadge: r.status_badge || base.statusBadge,
        stamp: r.stamp_type,
      };
    });

    const sql = `SELECT * FROM homework_submissions WHERE assignment_id = 'assign-chibifu-04' ORDER BY submitted_at DESC;`;

    return sendSqlResponse(res, parsed, `已加载 ${className} 作业批阅池`, {
      fn: "sakuraApi.homework.getClassSubmissions",
      method: "GET",
      endpoint: `/api/v1/homework/submissions?className=${encodeURIComponent(
        className,
      )}&status=${status}`,
      sql,
    });
  });

  app.get("/api/v1/students", (req, res) => {
    const classId = String(req.query.classId || "G2-201");
    const tag = String(req.query.tag || "all");

    const rows = sqliteDb
      .prepare(
        `SELECT s.*, c.class_name FROM student_profiles s JOIN academic_classes c ON c.id=s.class_id WHERE s.archived_at IS NULL AND s.class_id=? AND (?='all' OR s.tag_category=?) ${res.locals.classScope ? `AND s.class_id IN (${res.locals.classScope.map(() => "?").join(",")})` : ""} ORDER BY s.student_no,s.id`,
      )
      .all(classId, tag, tag, ...(res.locals.classScope || [])) as Record<
      string,
      any
    >[];

    const journals = sqliteDb
      .prepare(
        `SELECT id, student_id, date_title, tag, content, teacher_name, status_text FROM coaching_journals ORDER BY rowid DESC`,
      )
      .all() as {
      id: string;
      student_id: string;
      date_title: string;
      tag: string;
      content: string;
      teacher_name: string;
      status_text: string;
    }[];

    const profiles = rows.map((r) => {
      const base = JSON.parse(r.payload_json);
      const stuJournals = journals
        .filter((j) => j.student_id === r.id)
        .map((j) => ({
          id: j.id,
          dateTitle: j.date_title,
          tag: j.tag,
          content: j.content,
          teacher: j.teacher_name,
          statusText: j.status_text,
        }));
      return {
        ...base,
        id: r.id,
        name: r.full_name,
        studentNo: r.student_no,
        shortNo: r.short_no,
        className: r.class_name,
        avatarChar: r.avatar_char,
        tagCategory: r.tag_category,
        coachingJournals:
          stuJournals.length > 0 ? stuJournals : base.coachingJournals,
      };
    });

    const sql = `SELECT * FROM student_profiles WHERE class_id = '${classId}';`;

    return sendSqlResponse(res, profiles, `已加载学生学情档案`, {
      fn: "sakuraApi.student.getStudentProfiles",
      method: "GET",
      endpoint: `/api/v1/students?classId=${classId}&tag=${tag}`,
      sql,
    });
  });

  app.get("/api/v1/sqlite/status", (_req, res) => {
    const summary = getSqliteDatabaseSummary();
    return res.json({
      code: 200,
      success: true,
      message: "已获取状态",
      data: summary,
      traceId: `status-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/v1/sqlite/query", (req, res) => {
    const { sql } = req.body as { sql: string };
    const trimmed = String(sql || "").trim();
    if (!trimmed) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "SQL 语句不能为空",
      });
    }

    const startTime = performance.now();
    try {
      const statement = sqliteDb.prepare(trimmed);
      if (
        !statement.readonly &&
        (process.env.NODE_ENV === "production" ||
          process.env.SAKURA_ALLOW_SQL_WRITES !== "true")
      )
        throw new HttpError(403, "当前环境只允许只读 SQL");
      // SQLite knows whether WITH, comments, PRAGMA or RETURNING produces rows.
      if (statement.reader) {
        const rows = statement.all();
        const changes = statement.readonly
          ? undefined
          : (sqliteDb.prepare("SELECT changes() AS n").get() as { n: number })
              .n;
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        return res.json({
          code: 200,
          success: true,
          message: `查询成功，返回 ${rows.length} 行 (${durationMs} ms)`,
          data: {
            mode: statement.readonly ? "SELECT" : "MUTATION",
            returnsRows: true,
            changes,
            rowCount: rows.length,
            durationMs,
            rows: rows.slice(0, 100),
          },
        });
      } else {
        const info = statement.run();
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        return res.json({
          code: 200,
          success: true,
          message: `执行成功，影响 ${info.changes} 行 (${durationMs} ms)`,
          data: {
            mode: "MUTATION",
            rowCount: info.changes,
            changes: info.changes,
            lastInsertRowid: Number(info.lastInsertRowid),
            durationMs,
            rows: [
              {
                changes: info.changes,
                lastInsertRowid: Number(info.lastInsertRowid),
              },
            ],
          },
        });
      }
    } catch (err: unknown) {
      if (err instanceof HttpError) throw err;
      const errMsg = err instanceof Error ? err.message : String(err);
      return res.status(400).json({
        code: 400,
        success: false,
        message: `执行错误: ${errMsg}`,
        data: null,
      });
    }
  });

  app.post("/api/v1/sqlite/reseed", (_req, res) => {
    initAndSeedSqliteDatabase(true);
    const summary = getSqliteDatabaseSummary();
    return sendSqlResponse(res, summary, "已重置为默认基准数据集", {
      fn: "sakuraApi.sqlite.reseedDatabase",
      method: "POST",
      endpoint: "/api/v1/sqlite/reseed",
      sql: "BEGIN TRANSACTION; RESET BASELINE DATA; COMMIT;",
    });
  });

  app.get("/api/v1/sqlite/backup-download", async (_req, res) => {
    const snapshotPath = path.join(
      tmpdir(),
      `sakura-backup-${randomUUID()}.sqlite`,
    );
    try {
      // Online backup includes committed WAL pages even when a reader pins an old snapshot.
      await sqliteDb.backup(snapshotPath);
      return res.download(
        snapshotPath,
        `sakura_edu_backup_${new Date().toISOString().slice(0, 10)}.sqlite`,
        (error) => {
          void unlink(snapshotPath).catch(() => {});
          if (error && !res.headersSent)
            res
              .status(500)
              .json({ code: 500, success: false, message: "备份下载失败" });
        },
      );
    } catch (error) {
      await unlink(snapshotPath).catch(() => {});
      return res.status(500).json({
        code: 500,
        success: false,
        message: `备份创建失败: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });

  // ===========================================================================
  // 7. Common API boundary; unknown APIs never fall through to the SPA HTML.
  // ===========================================================================
  app.use("/api/v1", (_req, _res, next) =>
    next(new HttpError(404, "接口不存在")),
  );
  app.use(apiErrorHandler);
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[SakuraEdu] Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
