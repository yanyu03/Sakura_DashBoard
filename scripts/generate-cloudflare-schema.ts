import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
fs.mkdirSync(".local-data", { recursive: true });
process.env.SAKURA_DATA_DIR = fs.mkdtempSync(
  path.resolve(".local-data", "cloud-schema-"),
);
const { sqliteDb: db } = await import("../server/sqliteDb");
const objects = db
  .prepare(
    "SELECT type,name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END,name",
  )
  .all() as { type: string; name: string; sql: string }[];
const ledger = db
  .prepare(
    "SELECT version,name,checksum FROM schema_migrations ORDER BY version",
  )
  .all() as {version:number;name:string;checksum:string}[];
const schema = {
  version: 1,
  sourceMigrationVersion: Math.max(0,...ledger.map(row=>row.version)),
  tables: objects.filter((o) => o.type === "table").map((o) => o.name),
  statements: objects.map((o) => o.sql),
  ledger,
};
const checksum = createHash("sha256")
  .update(JSON.stringify(schema))
  .digest("hex");
fs.writeFileSync(
  "cloudflare/schema.json",
  JSON.stringify({ ...schema, checksum }, null, 2),
);
db.close();
console.log(
  `Generated empty cloud schema: ${schema.tables.length} tables, no local account or student rows`,
);
