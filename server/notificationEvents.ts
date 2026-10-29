import type { Request, Response } from "express";
import { type DatabaseConnection } from "./asyncDatabase";
import { randomUUID } from "node:crypto";
import { notificationTime } from "./notificationTime";
export async function notifyChange(
  db: DatabaseConnection,
  req: Request,
  res: Response,
  result: unknown,
  title: string,
) {
  const row =
    result && typeof result === "object" ? (result as Record<string, any>) : {};
  const recipients = new Set([res.locals.user.id]);
  if (
    req.path.includes("/schedules/submissions/") &&
    typeof row.owner_id === "string"
  )
    recipients.add(row.owner_id);
  if (
    req.path.startsWith("/api/v1/schedules/changes/") ||
    req.path.startsWith("/schedules/changes/")
  ) {
    const change = (await db
      .prepare("SELECT applicant_id FROM schedule_changes WHERE id=?")
      .get(req.params.id)) as
      | {
          applicant_id: string;
        }
      | undefined;
    if (change) recipients.add(change.applicant_id);
  }
  const resource = String(row.id || req.params.id || ""),
    key = req.body.request_key
      ? `${req.path}:${req.body.request_key}`
      : res.locals.requestId,
    now = new Date();
  for (const userId of recipients) {
    const user = (await db
      .prepare("SELECT * FROM faculty_users WHERE id=?")
      .get(userId)) as Record<string, any>;
    await db
      .prepare(
        "INSERT OR IGNORE INTO business_notifications VALUES (?,?,?,?,?,?,?,?,NULL)",
      )
      .run(
        randomUUID(),
        userId,
        key,
        title,
        req.path,
        resource,
        notificationTime(user, now),
        now.toISOString(),
      );
  }
}
