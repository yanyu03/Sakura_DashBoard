import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
const sql = `
ALTER TABLE lesson_plans ADD COLUMN owner_id TEXT REFERENCES faculty_users(id);
ALTER TABLE lesson_plans ADD COLUMN body TEXT NOT NULL DEFAULT '';
ALTER TABLE lesson_plans ADD COLUMN tags_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE lesson_plans ADD COLUMN visibility TEXT NOT NULL DEFAULT 'school' CHECK(visibility IN ('private','school'));
ALTER TABLE lesson_plans ADD COLUMN archived_at TEXT;
ALTER TABLE lesson_plans ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
CREATE TABLE lesson_revisions(id TEXT PRIMARY KEY,lesson_id TEXT NOT NULL REFERENCES lesson_plans(id),actor_id TEXT NOT NULL REFERENCES faculty_users(id),snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE lesson_homework(lesson_id TEXT NOT NULL REFERENCES lesson_plans(id),assignment_id TEXT NOT NULL REFERENCES homework_assignments(id),PRIMARY KEY(lesson_id,assignment_id));
UPDATE lesson_plans SET body=summary,citation_count=0;
`;
export function migrateLessons(db: Database.Database, file: string) {
  const checksum = createHash("sha256").update(sql).digest("hex"),
    existing = db
      .prepare("SELECT checksum FROM schema_migrations WHERE version=6")
      .get() as { checksum: string } | undefined;
  if (existing) {
    if (existing.checksum !== checksum)
      throw new Error("Migration 6 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(file),
      "migration-backups",
      `before-v6-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES (6,?,?)",
    ).run("lesson-content-and-revisions", checksum);
  })();
}
