/** Sakura AB staging gateway. Public, read-only, no production database credentials. */
const UPSTREAM = "https://sakura.250221.xyz";
const PUBLIC_API = new Set([
  "/api/v1/meta/version", "/api/v1/health/tidb", "/api/v1/auth/env-check"
]);
const COMMON_HEADERS = {
  "cache-control": "no-store",
  "x-sakura-ab": "read-only-preview",
  "x-content-type-options": "nosniff"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/__ab/status" && request.method === "GET") {
      return Response.json({
        ok: true, worker: "sakura-dashboard-ab", mode: "read-only-preview",
        upstream: "sakura-dashboard", secretsCopied: false,
        publicApi: [...PUBLIC_API]
      }, { headers: COMMON_HEADERS });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return Response.json(
        { code: 405, success: false, message: "AB 测试入口禁止写入", data: null },
        { status: 405, headers: { ...COMMON_HEADERS, allow: "GET, HEAD" } }
      );
    }
    if (url.pathname.startsWith("/api/") && !PUBLIC_API.has(url.pathname)) {
      return Response.json(
        { code: 401, success: false, message: "AB 入口只提供公开只读接口", data: null },
        { status: 401, headers: COMMON_HEADERS }
      );
    }
    try {
      const dest = new URL(url.pathname + url.search, UPSTREAM);
      const h = new Headers();
      h.set("accept", request.headers.get("accept") || "*/*");
      const r = await env.SAKURA_UPSTREAM.fetch(new Request(dest, {
        method: request.method, headers: h, redirect: "manual"
      }));
      const rh = new Headers(r.headers);
      rh.delete("set-cookie");
      rh.set("x-sakura-ab", "read-only-preview");
      if (url.pathname.startsWith("/api/")) rh.set("cache-control", "no-store");
      const redirect = rh.get("location");
      if (redirect && redirect.startsWith(UPSTREAM)) {
        rh.set("location", "https://ab.sakura.250221.xyz" + redirect.slice(UPSTREAM.length));
      }
      return new Response(request.method === "HEAD" ? null : r.body, {
        status: r.status, statusText: r.statusText, headers: rh
      });
    } catch (error) {
      console.error("ab_upstream_failed", { name: error?.name || "Error" });
      return Response.json(
        { code: 502, success: false, message: "AB 上游暂时不可访问", data: null },
        { status: 502, headers: COMMON_HEADERS }
      );
    }
  }
};
