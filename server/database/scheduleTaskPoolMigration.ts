import type Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { applyScheduleTaskPool } from "./scheduleTaskPool";

export function migrateScheduleTaskPool(db: Database.Database, file: string) {
  if (!db.prepare("SELECT 1 FROM schema_migrations WHERE version=16").get()) {
    const dir = path.join(path.dirname(file), "migration-backups");
    fs.mkdirSync(dir, { recursive: true });
    db.prepare("VACUUM INTO ?").run(
      path.join(dir, `before-v16-${randomUUID()}.sqlite`),
    );
  }
  applyScheduleTaskPool(db);
}
