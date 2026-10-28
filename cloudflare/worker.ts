import express from "express";
import { createServer, type Server } from "node:http";
import { randomUUID } from "node:crypto";
import { DurableObject } from "cloudflare:workers";
import { handleAsNodeRequest } from "cloudflare:node";
import schema from "./schema.json";
import { DurableSqlite, edgeCaptcha } from "./adapters";
import { registerAuth } from "../server/auth";
import { registerAcademic } from "../server/academic";
import { registerHomework } from "../server/homework";
import { registerLessons } from "../server/lessons";
import { registerSchedules } from "../server/schedules";
import { registerExams } from "../server/exams";
import { registerCare } from "../server/care";
import { registerWorkspace } from "../server/workspace";
import { HttpError, apiErrorHandler, text } from "../server/http";
import { reply } from "../server/business";
import {applyIdentityHierarchy} from '../server/database/identityHierarchy';
import {applyAuthProtectionSchema} from '../server/authProtection';

export class SakuraSchool extends DurableObject<Env> {
  private server: Server;
  private port: number;
  private db: DurableSqlite;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.db = new DurableSqlite(ctx.storage);
    this.ctx.blockConcurrencyWhile(async () => {
      if (
        !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(
          env.SAKURA_ADMIN_PASSWORD_HASH || "",
        )
      )
        throw new Error("Initial administrator secret is missing or invalid");
      this.ctx.storage.sql.exec(
        "CREATE TABLE IF NOT EXISTS cloud_schema_meta(version INTEGER PRIMARY KEY,checksum TEXT NOT NULL)",
      );
      const prior = this.ctx.storage.sql
        .exec<{
          version: number;
          checksum: string;
        }>("SELECT * FROM cloud_schema_meta")
        .toArray()[0];
      if (prior) {
        if (
          prior.version !== schema.version ||
          prior.checksum !== schema.checksum
        )
          throw new Error(
            "Cloud database requires an explicit schema migration",
          );
        applyIdentityHierarchy(this.db);
        applyAuthProtectionSchema(this.db);
        return;
      }
      this.ctx.storage.transactionSync(() => {
        for (const statement of schema.statements)
          this.ctx.storage.sql.exec(statement);
        for (const migration of schema.ledger)
          this.ctx.storage.sql.exec(
            "INSERT INTO schema_migrations(version,name,checksum) VALUES (?,?,?)",
            migration.version,
            migration.name,
            migration.checksum,
          );
        this.ctx.storage.sql.exec(
          "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role,default_tab,default_theme,default_class_name,semester_label,dnd_enabled) VALUES ('fac-admin','admin','admin@sakura.invalid',?,'管理员','教务管理员','教务处','admin','dashboard-overview','forest-tea','尚未选择班级','新学期尚未设置',0)",
          env.SAKURA_ADMIN_PASSWORD_HASH,
        );
        this.ctx.storage.sql.exec(
          "INSERT INTO cloud_schema_meta VALUES (?,?)",
          schema.version,
          schema.checksum,
        );
      });
      applyIdentityHierarchy(this.db);
      applyAuthProtectionSchema(this.db);
    });
    const app = express();
    app.disable("x-powered-by");
    app.use((_req, res, next) => {
      res.locals.requestId = randomUUID();
      res.setHeader("X-Request-Id", res.locals.requestId);
      res.setHeader("Cache-Control", "no-store");
      next();
    });
    app.use(express.json({ limit: "5mb" }));
    app.use((req, _res, next) => {
      if (["POST", "PATCH", "PUT"].includes(req.method)) {
        req.body ??= {};
        if (typeof req.body !== "object" || Array.isArray(req.body))
          return next(new HttpError(422, "请求内容必须为 JSON 对象"));
      }
      next();
    });
    registerAuth(app, this.db, edgeCaptcha,{trustCloudflare:true});
    registerAcademic(app, this.db);
    registerHomework(app, this.db);
    registerLessons(app, this.db);
    registerSchedules(app, this.db);
    registerExams(app, this.db);
    registerCare(app, this.db);
    registerWorkspace(app, this.db);
    app.get("/api/v1/sqlite/status", (_req, res) => {
      const tables = schema.tables.filter(
        (name) => name !== "schema_migrations",
      );
      const tableCounts = Object.fromEntries(
        tables.map((name) => [
          name,
          (
            this.db.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get() as {
              n: number;
            }
          ).n,
        ]),
      );
      reply(res, {
        engine: "SQLite · Cloudflare Durable Objects",
        dbPath: "cloudflare://SCHOOL/school",
        fileSizeBytes: 0,
        fileSizeFormatted: "由 Cloudflare 托管",
        journalMode: "MANAGED",
        lastModified: new Date().toISOString(),
        totalTables: tables.length,
        tableCounts,
        recentAuditLogs: this.db
          .prepare("SELECT * FROM sql_audit_logs ORDER BY id DESC LIMIT 25")
          .all(),
        backupFormat: "sql",
      });
    });
    app.post("/api/v1/sqlite/query", (req, res) => {
      const sql = text(req.body.sql, "SQL 语句", { max: 20000 });
      const allowed =
        /^SELECT\b/i.test(sql) ||
        /^PRAGMA\s+(?:table_info|foreign_key_list|index_list)\(\s*[a-z_][a-z0-9_]*\s*\)$/i.test(
          sql,
        ) ||
        /^PRAGMA\s+(?:foreign_key_check|integrity_check)$/i.test(sql);
      if (!allowed || sql.includes(";"))
        throw new HttpError(
          403,
          "云端控制台仅支持单条 SELECT 或结构检查 PRAGMA；不允许写入",
        );
      const rows = this.db.prepare(sql).all();
      reply(
        res,
        {
          mode: "SELECT",
          returnsRows: true,
          rowCount: rows.length,
          rows: rows.slice(0, 100),
        },
        "查询成功",
      );
    });
    app.get("/api/v1/sqlite/backup-download", (_req, res) => {
      let count = 0;
      const statements = [
        "PRAGMA foreign_keys=OFF;",
        "BEGIN TRANSACTION;",
        ...schema.statements.map((sql) => sql + ";"),
      ];
      this.ctx.storage.transactionSync(() => {
        for (const table of schema.tables) {
          const rows = this.db
            .prepare(`SELECT * FROM "${table}" LIMIT 10001`)
            .all() as Record<string, unknown>[];
          count += rows.length;
          if (count > 10000)
            throw new HttpError(
              413,
              "数据较多，请使用 Cloudflare 数据恢复工具导出",
            );
          for (const row of rows)
            statements.push(
              `INSERT INTO "${table}" (${Object.keys(row)
                .map((column) => `"${column}"`)
                .join(
                  ",",
                )}) VALUES (${Object.values(row).map(quote).join(",")});`,
            );
        }
      });
      statements.push("COMMIT;", "PRAGMA foreign_keys=ON;");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="sakura-cloud-backup.sql"',
      );
      res.type("application/sql").send(statements.join("\n"));
    });
    app.use("/api/v1", (_req, _res, next) =>
      next(new HttpError(404, "接口不存在")),
    );
    app.use(apiErrorHandler);
    this.server = createServer(app);
    this.server.listen(0);
    const address = this.server.address();
    if (!address || typeof address === "string")
      throw new Error("HTTP adapter did not bind");
    this.port = address.port;
  }
  async fetch(request: Request) {
    return handleAsNodeRequest(this.port, request);
  }
}
function quote(value: unknown): string {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return "'" + String(value).replaceAll("'", "''") + "'";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      if (
        url.pathname.startsWith("/api/v1/auth/faculty-login") ||
        url.pathname === '/api/v1/auth/register' ||
        url.pathname.startsWith("/api/v1/security/captcha")
      ) {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const limited = await env.AUTH_LIMITER.limit({ key: `sakura:${ip}` });
        if (!limited.success)
          return Response.json(
            {
              code: 429,
              success: false,
              data: null,
              message: "请求过于频繁，请稍后重试",
            },
            {
              status: 429,
              headers: { "Retry-After": "60", "Cache-Control": "no-store" },
            },
          );
      }
      try {
        return await env.SCHOOL.getByName("school").fetch(request);
      } catch (error) {
        console.error({
          event: "school_request_failed",
          name: error instanceof Error ? error.name : "UnknownError",
          message: error instanceof Error ? error.message : "Unknown failure",
        });
        return Response.json(
          {
            code: 503,
            success: false,
            data: null,
            message: "云端数据服务暂时不可用，请稍后重试",
          },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
    }
    if (url.pathname === "/" && !url.searchParams.has("design")) {
      url.searchParams.set("design", "1.0Sakura");
      return Response.redirect(url.toString(), 302);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
