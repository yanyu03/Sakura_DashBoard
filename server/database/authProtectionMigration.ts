import type Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { applyAuthProtectionSchema } from "../authProtection";
export function migrateAuthProtection(db: Database.Database, file: string) {
  if (!db.prepare("SELECT 1 FROM schema_migrations WHERE version=13").get()) {
    const dir = path.join(path.dirname(file), "migration-backups");
    fs.mkdirSync(dir, { recursive: true });
    db.prepare("VACUUM INTO ?").run(
      path.join(dir, `before-v13-${randomUUID()}.sqlite`),
    );
  }
  applyAuthProtectionSchema(db);
}
