import { randomUUID } from "node:crypto";
export function secureRequest(request: Request): Response | null {
  const url = new URL(request.url),
    headers = {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    };
  if (
    Array.from(url.searchParams.keys()).some((name) =>
      /^(password|password_hash|confirmPassword|secret|token|access_token|refresh_token|csrfToken|captchaAnswer|TIDB_DATABASE_URL)$/i.test(
        name,
      ),
    )
  )
    return Response.json(
      {
        code: 400,
        success: false,
        data: null,
        message: "敏感凭据不能放在网址中",
        traceId: randomUUID(),
      },
      { status: 400, headers },
    );
  if (url.protocol !== "https:") {
    if (request.method === "GET" || request.method === "HEAD") {
      url.protocol = "https:";
      return new Response(null, {
        status: 308,
        headers: { ...headers, Location: url.href },
      });
    }
    return Response.json(
      {
        code: 400,
        success: false,
        data: null,
        message: "认证和提交操作必须使用 HTTPS",
        traceId: randomUUID(),
      },
      { status: 400, headers },
    );
  }
  return null;
}
export function secureResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
