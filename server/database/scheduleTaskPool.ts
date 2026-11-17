import { createHash } from "node:crypto";
import type { DatabaseConnection } from "../dbContract";

const statements = [
  `CREATE TABLE faculty_class_defaults(
    account_id TEXT PRIMARY KEY REFERENCES faculty_users(id),
    class_id TEXT REFERENCES academic_classes(id),
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX faculty_class_default_class ON faculty_class_defaults(class_id)`,
  `CREATE TABLE schedule_task_pool(
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES faculty_users(id),
    title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
    note TEXT NOT NULL DEFAULT '',
    preferred_class_id TEXT REFERENCES academic_classes(id),
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','linked','cancelled')),
    submission_id TEXT UNIQUE REFERENCES schedule_submissions(id),
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK((status='linked' AND submission_id IS NOT NULL) OR (status<>'linked' AND submission_id IS NULL))
  )`,
  `CREATE INDEX schedule_task_pool_owner ON schedule_task_pool(owner_id,status,updated_at)`,
];

export const scheduleTaskPoolChecksum = createHash("sha256")
  .update(JSON.stringify(statements))
  .digest("hex");

export function applyScheduleTaskPool(db: DatabaseConnection) {
  const prior = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=16")
    .get() as { checksum: string } | undefined;
  if (prior) {
    if (prior.checksum !== scheduleTaskPoolChecksum)
      throw new Error("Migration 16 checksum mismatch");
    return;
  }
  db.transaction(() => {
    for (const statement of statements) db.prepare(statement).run();
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(16,?,?)",
    ).run("private-schedule-task-pool", scheduleTaskPoolChecksum);
  })();
}
