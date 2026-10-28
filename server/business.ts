import { notifyChange } from "./notificationEvents";
import type { Request, Response } from "express";
import type { DatabaseConnection } from "./dbContract";
import { HttpError } from "./http";
import {
  headTeacherClassIds,
  classOrganizationActive,
} from "./organizationCore";

export const reply = (res: Response, data: unknown, message = "已加载") =>
  res.json({
    code: 200,
    success: true,
    data,
    message,
    traceId: res.locals.requestId,
    timestamp: new Date().toISOString(),
  });
/** Commit the business mutation and audit together, before emitting a success response. */
export function mutate(
  req: Request,
  res: Response,
  db: DatabaseConnection,
  operation: () => unknown,
  message = "已保存",
) {
  const result = db.transaction(() => {
    const data = operation();
    db.prepare(
      "INSERT INTO sql_audit_logs(trace_id,fn_name,http_method,endpoint,sql_text,rows_affected,created_at) VALUES (?,?,?,?,?,1,?)",
    ).run(
      res.locals.requestId,
      `business.${req.method}`,
      req.method,
      req.originalUrl,
      JSON.stringify({ actor: res.locals.user.id, resource: req.path }),
      new Date().toISOString(),
    );
    notifyChange(db, req, res, data, message);
    return data;
  })();
  return reply(res, result, message);
}
export function classAccess(db: DatabaseConnection, res: Response, id: string) {
  const row = db
    .prepare("SELECT * FROM academic_classes WHERE id=?")
    .get(id) as Record<string, any> | undefined;
  if (!row) throw new HttpError(404, "班级不存在");
  if (!classOrganizationActive(db, id))
    throw new HttpError(403, "班级的组织归属已归档");
  if (
    res.locals.user.role !== "admin" &&
    !(res.locals.headTeacherClassIds ??= headTeacherClassIds(
      db,
      res.locals.user.id,
    )).has(id) &&
    !db
      .prepare(
        "SELECT 1 FROM teaching_assignments WHERE teacher_id=? AND class_id=? AND archived_at IS NULL",
      )
      .get(res.locals.user.id, id)
  )
    throw new HttpError(403, "无权访问该班级");
  return row;
}
export function version(
  body: Record<string, unknown>,
  row: Record<string, any>,
) {
  if (!Number.isSafeInteger(body.version) || body.version !== row.version)
    throw new HttpError(409, "记录已变化，请刷新后再保存");
}
export function exactDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
