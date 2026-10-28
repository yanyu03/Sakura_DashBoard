import type { ErrorRequestHandler } from "express";
import { randomUUID } from "node:crypto";

export class HttpError extends Error {
  retryAfterSeconds?: number;
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function text(
  value: unknown,
  name: string,
  options: { optional?: boolean; max?: number } = {},
) {
  if (
    options.optional &&
    (value === undefined || (typeof value === "string" && !value.trim()))
  )
    return "";
  if (typeof value !== "string" || !value.trim())
    throw new HttpError(422, `${name}不能为空`);
  const result = value.trim();
  if (result.length > (options.max ?? 2000))
    throw new HttpError(422, `${name}超过长度限制`);
  return result;
}
export function number(value: unknown, name: string, min: number, max: number) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  )
    throw new HttpError(422, `${name}必须为 ${min} 至 ${max} 之间的数字`);
  return value;
}
export function pagination(query: Record<string, unknown>) {
  const parse = (value: unknown, fallback: number, max: number) => {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value))
      throw new HttpError(422, "分页参数必须是正整数");
    const result = Number(value);
    if (!Number.isSafeInteger(result) || result < 1 || result > max)
      throw new HttpError(422, "分页参数超出范围");
    return result;
  };
  const page = parse(query.page, 1, 100000),
    pageSize = parse(query.pageSize, 20, 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
}
export const apiErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (res.headersSent) return _next(error);
  const sqliteCode = typeof error?.code === "string" ? error.code : "";
  let status = error instanceof HttpError ? error.status : 500;
  let message =
    error instanceof HttpError ? error.message : "服务处理失败，请稍后重试";
  if (sqliteCode.startsWith("SQLITE_CONSTRAINT")) {
    status = /UNIQUE|PRIMARYKEY|FOREIGNKEY/.test(sqliteCode) ? 409 : 422;
    message = status === 409 ? "记录重复或关联关系冲突" : "数据不符合业务约束";
  } else if (error?.type === "entity.parse.failed") {
    status = 400;
    message = "请求 JSON 格式错误";
  } else if (error?.type === "entity.too.large") {
    status = 413;
    message = "请求内容过大";
  }
  res.status(status).json({
    code: status,
    success: false,
    message,
    data: null,
    ...(error instanceof HttpError &&
    error.status === 429 &&
    Number.isSafeInteger(error.retryAfterSeconds)
      ? { retryAfterSeconds: error.retryAfterSeconds }
      : {}),
    traceId: res.locals.requestId || randomUUID(),
    timestamp: new Date().toISOString(),
  });
};
