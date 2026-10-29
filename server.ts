import {registerLegacyViews} from './server/legacyViews';
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
  registerLegacyViews(app, sqliteDb);

  // ===========================================================================
  // 2. Schedule & Course Swap Endpoints
  // ===========================================================================
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
