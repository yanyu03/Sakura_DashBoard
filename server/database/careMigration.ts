import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
const sql = `
CREATE TABLE care_contacts(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES student_profiles(id),name TEXT NOT NULL,relationship TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',version INTEGER NOT NULL DEFAULT 1,archived_at TEXT);
CREATE TABLE care_threads(id TEXT PRIMARY KEY,contact_id TEXT NOT NULL REFERENCES care_contacts(id),teacher_id TEXT NOT NULL REFERENCES faculty_users(id),last_message TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL,last_read_sequence INTEGER NOT NULL DEFAULT 0,UNIQUE(contact_id,teacher_id));
CREATE TABLE care_messages(sequence INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT NOT NULL UNIQUE,thread_id TEXT NOT NULL REFERENCES care_threads(id),actor_id TEXT NOT NULL REFERENCES faculty_users(id),request_key TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('note','outgoing','incoming-record')),content TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('recorded','queued')),not_before TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(actor_id,request_key));
CREATE INDEX idx_care_messages_thread ON care_messages(thread_id,sequence);
CREATE TABLE care_todos(id TEXT PRIMARY KEY,student_id TEXT NOT NULL REFERENCES student_profiles(id),owner_id TEXT NOT NULL REFERENCES faculty_users(id),title TEXT NOT NULL,due_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','done','cancelled')),version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);
`;
export function migrateCare(db: Database.Database, file: string) {
  const checksum = createHash("sha256").update(sql).digest("hex"),
    row = db
      .prepare("SELECT checksum FROM schema_migrations WHERE version=9")
      .get() as { checksum: string } | undefined;
  if (row) {
    if (row.checksum !== checksum)
      throw new Error("Migration 9 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(file),
      "migration-backups",
      `before-v9-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(9,?,?)",
    ).run("internal-care-records", checksum);
  })();
}
