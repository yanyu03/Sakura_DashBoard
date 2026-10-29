/** Isolated migration verification entry; use a separate Worker and database. */
import { tidbRequest } from "./tidb";
import { createHash, timingSafeEqual } from "node:crypto";
import { passwordPolicyFromSecret } from "../server/passwords";
import { secureRequest, secureResponse } from "./security";
const applicationHandler = {
  async fetch(
    request: Request,
    env: {
      TIDB_DATABASE_URL: string;
      SAKURA_PREVIEW_TOKEN: string;
      SAKURA_PREVIEW_DIAGNOSTICS?: string;
      AUTH_PASSWORD_PEPPERS: string;
    },
  ) {
    const digest = (value: string) =>
      createHash("sha256").update(value).digest();
    if (
      !env.SAKURA_PREVIEW_TOKEN ||
      !timingSafeEqual(
        digest(request.headers.get("X-Sakura-Preview-Token") || ""),
        digest(env.SAKURA_PREVIEW_TOKEN),
      )
    )
      return new Response("Forbidden", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/^\/__tidb-preview/, "");
    if (!url.pathname.startsWith("/api/"))
      return new Response("Migration verification endpoint", { status: 404 });
    try {
      return await tidbRequest(
        new Request(url, request),
        env.TIDB_DATABASE_URL,
        env.SAKURA_PREVIEW_DIAGNOSTICS === "true",
        passwordPolicyFromSecret(env.AUTH_PASSWORD_PEPPERS),
      );
    } catch {
      return Response.json(
        {
          code: 503,
          success: false,
          data: null,
          message: "迁移验证数据服务暂时不可用",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  },
};
export default {
  async fetch(
    request: Request,
    env: Parameters<typeof applicationHandler.fetch>[1],
  ) {
    return secureResponse(
      secureRequest(request) || (await applicationHandler.fetch(request, env)),
    );
  },
};
