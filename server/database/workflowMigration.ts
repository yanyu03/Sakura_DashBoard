import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";

const sql = `
ALTER TABLE homework_assignments ADD COLUMN lifecycle TEXT NOT NULL DEFAULT 'published' CHECK(lifecycle IN ('draft','published','closed','archived'));
ALTER TABLE homework_assignments ADD COLUMN owner_id TEXT REFERENCES faculty_users(id);
ALTER TABLE homework_assignments ADD COLUMN instructions TEXT NOT NULL DEFAULT '';
ALTER TABLE homework_assignments ADD COLUMN due_at TEXT;
ALTER TABLE homework_assignments ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE homework_assignments ADD COLUMN roster_json TEXT;
ALTER TABLE homework_submissions ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE homework_submissions ADD COLUMN content TEXT NOT NULL DEFAULT '';
ALTER TABLE homework_submissions ADD COLUMN feedback TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX idx_submission_assignment_student ON homework_submissions(assignment_id,student_id);
CREATE TABLE homework_history(id TEXT PRIMARY KEY,submission_id TEXT NOT NULL REFERENCES homework_submissions(id),actor_id TEXT NOT NULL REFERENCES faculty_users(id),action TEXT NOT NULL,snapshot_json TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX idx_homework_history_submission ON homework_history(submission_id,created_at);
`;
export function migrateWorkflow(db: Database.Database, databasePath: string) {
  const checksum = createHash("sha256").update(sql).digest("hex");
  const row = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=5")
    .get() as { checksum: string } | undefined;
  if (row) {
    if (row.checksum !== checksum)
      throw new Error("Migration 5 checksum mismatch");
    return;
  }
  const duplicates = db
    .prepare(
      "SELECT assignment_id,student_id,COUNT(*) AS n FROM homework_submissions GROUP BY assignment_id,student_id HAVING COUNT(*)>1",
    )
    .all();
  if (duplicates.length)
    throw new Error(
      `Migration 5 requires duplicate submission repair: ${JSON.stringify(duplicates)}`,
    );
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(databasePath),
      "migration-backups",
      `before-v5-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES (5,?,?)",
    ).run("manual-homework-workflow", checksum);
  })();
}
