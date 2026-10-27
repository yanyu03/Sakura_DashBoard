import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
const sql = `
CREATE TABLE schedule_entries(id TEXT PRIMARY KEY,class_id TEXT NOT NULL REFERENCES academic_classes(id),teacher_id TEXT NOT NULL REFERENCES faculty_users(id),course_id TEXT NOT NULL REFERENCES courses(id),starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,room TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,cancelled_at TEXT,CHECK(starts_at<ends_at));
CREATE INDEX idx_schedule_time ON schedule_entries(starts_at,ends_at);
CREATE TABLE schedule_changes(id TEXT PRIMARY KEY,entry_id TEXT NOT NULL REFERENCES schedule_entries(id),source_version INTEGER NOT NULL,applicant_id TEXT NOT NULL REFERENCES faculty_users(id),target_json TEXT NOT NULL,reason TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled')),reviewer_id TEXT REFERENCES faculty_users(id),review_note TEXT NOT NULL DEFAULT '',version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);
`;
export function migrateSchedules(db: Database.Database, file: string) {
  const checksum = createHash("sha256").update(sql).digest("hex"),
    row = db
      .prepare("SELECT checksum FROM schema_migrations WHERE version=7")
      .get() as { checksum: string } | undefined;
  if (row) {
    if (row.checksum !== checksum)
      throw new Error("Migration 7 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(file),
      "migration-backups",
      `before-v7-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(7,?,?)",
    ).run("schedule-approval-workflow", checksum);
  })();
}
