/** Build only v15 reference metadata; never imports the historical demo seeder. */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { LEGACY_SCHEMA_SQL } from "../server/database/legacySchema";
import { migrateDatabase } from "../server/database/migrations";
import schema from "../server/tidb/schema.json";

fs.mkdirSync(".local-data", { recursive: true });
const directory = fs.mkdtempSync(path.resolve(".local-data", "empty-install-"));
const file = path.join(directory, "bootstrap.sqlite");
const db = new Database(file);
try {
  db.pragma("foreign_keys=ON");
  db.exec(LEGACY_SCHEMA_SQL);
  migrateDatabase(db, file);
  const tables = Object.fromEntries(schema.tables.map(table => [
    table.name, db.prepare('SELECT * FROM "' + table.name + '"').all(),
  ]));
  if (tables.faculty_users.length || tables.student_profiles.length)
    throw Error("Empty bootstrap must not contain accounts or student records");
  if ((db.pragma("foreign_key_check") as unknown[]).length)
    throw Error("Bootstrap foreign key validation failed");
  fs.writeFileSync(path.join(directory, "source.json"), JSON.stringify({
    exportedAt: new Date().toISOString(), source: "empty SQLite v15 reference metadata", tables,
  }));
  if (process.argv.includes("--select"))
    fs.writeFileSync(".local-data/latest-tidb-export.json", JSON.stringify({ directory }));
  console.log(JSON.stringify({
    directory, tables: schema.tables.length, accounts: 0, students: 0,
    schemaMigrations: tables.schema_migrations.length,
    selectedForImport: process.argv.includes("--select"),
  }));
} finally {
  db.close();
}
