import { DurableObject } from "cloudflare:workers";
import { createServer } from "node:http";
import { handleAsNodeRequest } from "cloudflare:node";
import { randomUUID } from "node:crypto";
import { createApplication } from "../server/application";
import { edgeCaptcha } from "./adapters";
import { AbDurableSqlite, ensureAbSchema, type AbStorage } from "./abSqliteDatabase";
import { passwordPolicyFromSecret } from "../server/passwords";
import { secureRequest, secureResponse } from "./security";
import { VERSION_INFO } from "../app-version";

type AbEnv = {
  SCHOOL_AB: DurableObjectNamespace<SakuraAbSchool>;
  ASSETS: Fetcher;
  AB_PASSWORD_PEPPERS: string;
  AUTH_LIMITER: { limit(arg: { key: string }): Promise<{ success: boolean }> };
  DATABASE_MODE: string;
  AB_STAGE: string;
};

const responses = {
  headers: { "Cache-Control": "no-store", "X-Sakura-Database": "SQLite" },
  reply(status: number, data: unknown, message: string) {
    return Response.json({
      code: status, success: status === 200, data, message,
      traceId: randomUUID(), timestamp: new Date().toISOString(),
    }, { status, headers: this.headers });
  },
};

/**
 * All AB requests reach one separate SQLite-backed Durable Object.
 * This is NOT the archived SakuraSchool object from production.
 */
export class SakuraAbSchool extends DurableObject<AbEnv> {
  private readonly db: AbDurableSqlite;
  private schemaStatus?: ReturnType<typeof ensureAbSchema>;

  constructor(state: DurableObjectState, env: AbEnv) {
    super(state, env);
    this.db = new AbDurableSqlite(state.storage as unknown as AbStorage);
    state.blockConcurrencyWhile(async () => {
      this.schemaStatus = ensureAbSchema(state.storage as unknown as AbStorage);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/v1/health/sqlite") {
      if (request.method !== "GET") return responses.reply(405, null, "仅支持 GET");
      return responses.reply(200, {
        ...this.schemaStatus, database: "SQLite", driver: "Durable Object SQLite",
        isolated: true, businessApiEnabled: true, readOnly: false,
      }, "AB SQLite 测试服数据库已连接");
    }

    // The same Express business router used in production, but a different DB.
    const app = createApplication(this.db, edgeCaptcha, true, false,
      passwordPolicyFromSecret(this.env.AB_PASSWORD_PEPPERS), "SQLite");
    const server = createServer(app);
    try {
      server.listen(0);
      const address = server.address();
      if (!address || typeof address === "string")
        throw Error("AB Node HTTP adapter unavailable");
      return await handleAsNodeRequest(address.port, request);
    } finally {
      server.close();
    }
  }
}

const authPaths = new Set([
  "/api/v1/auth/faculty-login",
  "/api/v1/auth/register",
  "/api/v1/security/captcha",
]);

const gateway = {
  async fetch(request: Request, env: AbEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/__ab/status") {
      if (request.method !== "GET") return responses.reply(405, null, "仅支持 GET");
      return responses.reply(200, {
        worker: "sakura-dashboard-ab",
        database: "SQLite",
        driver: "Durable Object SQLite",
        stage: "full-business-preview",
        isolatedFromProduction: true,
        sourceDatabase: "AB-only Durable Object",
      }, "AB SQLite 测试服运行中");
    }
    if (url.pathname === "/api/v1/meta/version") {
      if (request.method !== "GET") return responses.reply(405, null, "仅支持 GET");
      return responses.reply(200, {
        ...VERSION_INFO,
        database: "SQLite",
        environment: "AB preview",
      }, "AB 测试服版本信息");
    }
    if (url.pathname === "/api/v1/health/tidb")
      return responses.reply(410, null, "AB 不使用 TiDB，请改用 /api/v1/health/sqlite");
    if (url.pathname.startsWith("/api/")) {
      if (env.DATABASE_MODE !== "sqlite")
        return responses.reply(503, null, "AB SQLite 数据库配置错误");
      if (authPaths.has(url.pathname)) {
        const ip = request.headers.get("CF-Connecting-IP") || "unknown";
        const limiter = await env.AUTH_LIMITER.limit({ key: "ab:" + ip });
        if (!limiter.success) return responses.reply(429, null, "请求过于频繁，请稍后重试");
      }
      const stub = env.SCHOOL_AB.get(env.SCHOOL_AB.idFromName("sakura-ab-sqlite-v1"));
      return await stub.fetch(request);
    }

    if (url.pathname === "/" && !url.searchParams.has("design")) {
      url.searchParams.set("design", "1.0Sakura");
      return Response.redirect(url.toString(), 302);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<AbEnv>;

export default {
  async fetch(request: Request, env: AbEnv): Promise<Response> {
    try {
      return secureResponse(secureRequest(request) || (await gateway.fetch(request, env)));
    } catch (error) {
      console.error({
        event: "ab_sqlite_request_failed",
        name: error instanceof Error ? error.name : "UnknownError",
      });
      return secureResponse(responses.reply(503, null, "AB SQLite 测试服暂时不可用"));
    }
  },
} satisfies ExportedHandler<AbEnv>;
