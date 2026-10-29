import { randomUUID } from "node:crypto";
import { DurableObject } from "cloudflare:workers";
import { tidbRequest } from "./tidb";
import { tidbHealth } from "./tidb-health";
import { passwordPolicyFromSecret } from "../server/passwords";
import { secureRequest, secureResponse } from "./security";
/** Keep the existing SQLite storage as an archive; it no longer serves business requests. */
export class SakuraSchool extends DurableObject<Env> {
  async fetch(_request: Request) {
    return new Response("Archived SQLite database", { status: 403 });
  }
}

const applicationHandler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/v1/health/tidb") return tidbHealth(request, env);
    if (url.pathname.startsWith("/api/")) {
      if (
        env.DATABASE_MODE === "tidb" &&
        ["/api/v1/auth/default-profile", "/api/v1/auth/session"].includes(
          url.pathname,
        ) &&
        !request.headers.get("cookie")?.includes("sakura_session=")
      ) {
        return Response.json(
          {
            code: 401,
            success: false,
            data: null,
            message: "请先登录",
            traceId: randomUUID(),
            timestamp: new Date().toISOString(),
          },
          {
            status: 401,
            headers: {
              "Cache-Control": "no-store",
              "X-Sakura-Database": "TiDB",
            },
          },
        );
      }
      if (
        url.pathname.startsWith("/api/v1/auth/faculty-login") ||
        url.pathname === "/api/v1/auth/register" ||
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
        if (env.DATABASE_MODE !== "tidb" || !env.TIDB_DATABASE_URL)
          throw Error("Production database configuration unavailable");
        return await tidbRequest(
          request,
          env.TIDB_DATABASE_URL,
          false,
          passwordPolicyFromSecret(env.AUTH_PASSWORD_PEPPERS),
        );
      } catch (error) {
        console.error({
          event: "school_request_failed",
          name: error instanceof Error ? error.name : "UnknownError",
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
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return secureResponse(
      secureRequest(request) || (await applicationHandler.fetch(request, env)),
    );
  },
} satisfies ExportedHandler<Env>;
