import { TiDBHttpPool } from "../server/tidb/http";

/** Fixed, read-only probe. Never accept SQL or expose database/user metadata. */
export async function tidbHealth(
  request: Request,
  env: Env,
): Promise<Response> {
  const traceId = crypto.randomUUID();
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Request-Id": traceId,
    "X-Sakura-Database": "TiDB",
  });
  const respond = (status: number, data: unknown, message: string) =>
    Response.json(
      {
        code: status,
        success: status === 200,
        data,
        message,
        traceId,
        timestamp: new Date().toISOString(),
      },
      { status, headers },
    );
  if (request.method !== "GET") {
    headers.set("Allow", "GET");
    return respond(405, null, "仅支持 GET 健康检查");
  }
  if (new URL(request.url).search)
    return respond(400, null, "健康检查不接受查询参数");
  try {
    if (env.DATABASE_MODE !== "tidb" || !env.TIDB_DATABASE_URL)
      throw Error("Database configuration unavailable");
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (
      !(await env.HEALTH_LIMITER.limit({ key: "tidb-health:" + ip })).success
    ) {
      headers.set("Retry-After", "60");
      return respond(429, null, "健康检查过于频繁，请稍后重试");
    }
    const started = performance.now();
    const [rows] = await new TiDBHttpPool(env.TIDB_DATABASE_URL).query(
      "SELECT 1 AS ok, ? AS probe",
      [traceId],
    );
    if (!Array.isArray(rows) || rows[0]?.ok !== 1 || rows[0].probe !== traceId)
      throw Error("Unexpected database probe result");
    return respond(
      200,
      {
        connected: true,
        engine: "TiDB",
        transport: "https",
        readOnly: true,
        queryMs: Math.round((performance.now() - started) * 10) / 10,
      },
      "TiDB 连接正常",
    );
  } catch (error) {
    console.error({
      event: "tidb_health_failed",
      traceId,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    headers.set("Retry-After", "3");
    return respond(503, null, "TiDB 暂时不可用，请稍后重试");
  }
}
