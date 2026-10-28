import type Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { applyScheduleSharing } from "./scheduleSharing";

export function migrateScheduleSharing(db: Database.Database, file: string) {
  if (!db.prepare("SELECT 1 FROM schema_migrations WHERE version=14").get()) {
    const dir = path.join(path.dirname(file), "migration-backups");
    fs.mkdirSync(dir, { recursive: true });
    db.prepare("VACUUM INTO ?").run(
      path.join(dir, `before-v14-${randomUUID()}.sqlite`),
    );
  }
  applyScheduleSharing(db);
}
