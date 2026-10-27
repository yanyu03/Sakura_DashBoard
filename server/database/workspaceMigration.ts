import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
const sql = `CREATE TABLE business_notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES faculty_users(id),event_key TEXT NOT NULL,title TEXT NOT NULL,resource_path TEXT NOT NULL,resource_id TEXT,available_at TEXT NOT NULL,created_at TEXT NOT NULL,read_at TEXT,UNIQUE(user_id,event_key)); CREATE INDEX idx_notifications_user ON business_notifications(user_id,available_at,read_at);`;
export function migrateWorkspace(db: Database.Database, file: string) {
  const checksum = createHash("sha256").update(sql).digest("hex"),
    row = db
      .prepare("SELECT checksum FROM schema_migrations WHERE version=10")
      .get() as { checksum: string } | undefined;
  if (row) {
    if (row.checksum !== checksum)
      throw new Error("Migration 10 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(file),
      "migration-backups",
      `before-v10-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(10,?,?)",
    ).run("workspace-notifications", checksum);
  })();
}
