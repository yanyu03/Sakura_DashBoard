import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { tidbPool } from "../scripts/tidb-config.ts";
import schema from "../server/tidb/schema.json";
import { hashPassword } from "../server/passwords.ts";
fs.mkdirSync(".local-data", { recursive: true });
const directory = fs.mkdtempSync(
  path.resolve(".local-data", "functional-fixture-"),
);
process.env.SAKURA_DATA_DIR = directory;
const { sqliteDb: native } = await import("../server/sqliteDb.ts");
const { installBusinessFixtures } = await import("../scripts/test-fixtures.ts");
installBusinessFixtures(native);
const password = randomBytes(28).toString("base64url"),
  token = randomBytes(32).toString("base64url"),
  database = "sakura_migration_functional_" + Date.now();
native
  .prepare("UPDATE faculty_users SET password_hash=?")
  .run(hashPassword(password));
const pool = tidbPool(),
  c = await pool.getConnection();
try {
  await c.query(
    "CREATE DATABASE `" +
      database +
      "` CHARACTER SET utf8mb4 COLLATE utf8mb4_bin",
  );
  await c.query("USE `" + database + "`");
  for (const [i, t] of schema.tables.entries()) {
    await c.query({ sql: t.ddl, timeout: 20000 });
    if (i % 10 === 0)
      console.log("Prepared " + (i + 1) + "/58 synthetic tables");
  }
  for (const t of schema.tables)
    for (const ddl of t.foreignDdl) await c.query({ sql: ddl, timeout: 20000 });
  await c.query(
    "CREATE TABLE sakura_runtime_locks(name VARCHAR(40) PRIMARY KEY,epoch BIGINT NOT NULL DEFAULT 0)",
  );
  await c.query("INSERT INTO sakura_runtime_locks(name) VALUES('write')");
  await c.query("SET foreign_key_checks=0");
  await c.beginTransaction();
  let rows = 0;
  for (const t of schema.tables) {
    const values = native
      .prepare('SELECT * FROM "' + t.name + '"')
      .all() as any[];
    if (!values.length) continue;
    const columns = Object.keys(values[0]);
    await c.query(
      {
        sql:
          "INSERT INTO `" +
          t.name +
          "` (" +
          columns.map((v) => "`" + v + "`").join(",") +
          ") VALUES " +
          values
            .map(() => "(" + columns.map(() => "?").join(",") + ")")
            .join(","),
        timeout: 20000,
      },
      values.flatMap((row) => columns.map((k) => row[k])),
    );
    rows += values.length;
  }
  await c.commit();
  await c.query("SET foreign_key_checks=1");
  fs.writeFileSync(
    ".local-data/functional-target.json",
    JSON.stringify({ database, password, token, directory }, null, 2),
  );
  console.log(
    JSON.stringify({ database, syntheticRows: rows, prepared: true }),
  );
} catch (e) {
  try {
    await c.rollback();
  } catch {}
  throw e;
} finally {
  native.close();
  c.release();
  await pool.end();
}
