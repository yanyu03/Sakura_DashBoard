import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
const sql =
  "ALTER TABLE schedule_entries ADD COLUMN lesson_id TEXT REFERENCES lesson_plans(id); CREATE INDEX idx_schedule_lesson ON schedule_entries(lesson_id);";
export function migrateLessonSchedules(db: Database.Database, file: string) {
  const checksum = createHash("sha256").update(sql).digest("hex"),
    row = db
      .prepare("SELECT checksum FROM schema_migrations WHERE version=11")
      .get() as { checksum: string } | undefined;
  if (row) {
    if (row.checksum !== checksum)
      throw new Error("Migration 11 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(file),
      "migration-backups",
      `before-v11-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(11,?,?)",
    ).run("lesson-schedule-links", checksum);
  })();
}
