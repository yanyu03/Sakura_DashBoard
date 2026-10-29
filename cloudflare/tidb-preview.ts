/** Isolated migration verification entry; use a separate Worker and database. */
import { tidbRequest } from "./tidb";
export default {
  async fetch(request: Request, env: { TIDB_DATABASE_URL: string }) {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/^\/__tidb-preview/, "");
    if (!url.pathname.startsWith("/api/"))
      return new Response("Migration verification endpoint", { status: 404 });
    try {
      return await tidbRequest(
        new Request(url, request),
        env.TIDB_DATABASE_URL,
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
