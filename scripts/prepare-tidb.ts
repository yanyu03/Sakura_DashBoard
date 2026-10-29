import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import schema from "../server/tidb/schema.json";
import { tidbPool } from "./tidb-config";
const pool = tidbPool();
const connection = await pool.getConnection();
try {
  const [existingTables] = (await connection.query("SHOW TABLES")) as any;
  const names = new Set(existingTables.map((r: any) => Object.values(r)[0]));
  const [existingForeign] = (await connection.query(
    "SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE()",
  )) as any;
  const foreignNames = new Set(
    existingForeign.map((r: any) => r.CONSTRAINT_NAME),
  );
  for (const [i, table] of schema.tables.entries()) {
    try {
      if (!names.has(table.name))
        await connection.query({ sql: table.ddl, timeout: 20000 });
    } catch (e: any) {
      if (e.code !== "ER_TABLE_EXISTS_ERROR")
        throw Object.assign(
          new Error(
            "Schema creation failed for " +
              table.name +
              " [" +
              e.code +
              "]: " +
              e.sqlMessage,
          ),
          { cause: e },
        );
    }
    if (i % 10 === 0)
      console.log(
        "Prepared " + (i + 1) + "/" + schema.tables.length + " tables",
      );
  }
  for (const table of schema.tables)
    for (const sql of table.foreignDdl) {
      try {
        const name = sql.match(/ADD CONSTRAINT `([^`]+)`/)?.[1];
        if (!name || !foreignNames.has(name))
          await connection.query({ sql, timeout: 20000 });
      } catch (e: any) {
        if (!["ER_FK_DUP_NAME", "ER_DUP_CONSTRAINT_NAME"].includes(e.code))
          throw new Error(
            "Foreign key creation failed for " +
              table.name +
              " [" +
              e.code +
              "]: " +
              e.sqlMessage,
          );
      }
    }
  await connection.query(
    "CREATE TABLE IF NOT EXISTS sakura_runtime_locks(name VARCHAR(40) PRIMARY KEY,epoch BIGINT NOT NULL DEFAULT 0)",
  );
  await connection.query(
    "INSERT IGNORE INTO sakura_runtime_locks(name) VALUES('write')",
  );
  if (process.argv.includes("--schema-only")) {
    console.log(
      "Target schema and constraints prepared; no business rows imported",
    );
    process.exitCode = 0;
  } else {
    const latest = JSON.parse(
      fs.readFileSync(".local-data/latest-tidb-export.json", "utf8"),
    );
    const input = fs.readFileSync(
        path.join(latest.directory, "source.json"),
        "utf8",
      ),
      source = JSON.parse(input);
    const [count] = (await connection.query(
      "SELECT COUNT(*) n FROM faculty_users",
    )) as any;
    if (count[0].n)
      throw Error("Target contains accounts; refusing to overwrite it");
    await connection.query("SET foreign_key_checks=0");
    await connection.beginTransaction();
    for (const table of schema.tables) {
      const rows = source.tables[table.name];
      if (!Array.isArray(rows))
        throw Error("Missing source table " + table.name);
      for (const row of rows) {
        const columns = table.columns.map((c) => c.name);
        await connection.query(
          "INSERT INTO `" +
            table.name +
            "` (" +
            columns.map((c) => "`" + c + "`").join(",") +
            ") VALUES (" +
            columns.map(() => "?").join(",") +
            ")",
          columns.map((c) => row[c] ?? null),
        );
      }
    }
    await connection.commit();
    await connection.query("SET foreign_key_checks=1");
    const checks = [];
    for (const table of schema.tables) {
      const columns = table.columns.map((c) => c.name);
      const [rows] = (await connection.query(
        "SELECT " +
          columns.map((c) => "`" + c + "`").join(",") +
          " FROM `" +
          table.name +
          "`",
      )) as any;
      const canonical = (rs: any[]) =>
        JSON.stringify(
          rs
            .map((row) => columns.map((c) => row[c]))
            .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
        );
      if (canonical(rows) !== canonical(source.tables[table.name]))
        throw Error("Source/target row verification failed for " + table.name);
      for (const id of new Set(table.foreign.map((f) => f.id))) {
        const keys = table.foreign.filter((f) => f.id === id);
        const condition = keys
          .map((f) => "c.`" + f.from + "`=p.`" + f.to + "`")
          .join(" AND ");
        const notnull = keys
          .map((f) => "c.`" + f.from + "` IS NOT NULL")
          .join(" AND ");
        const [bad] = (await connection.query(
          "SELECT COUNT(*) n FROM `" +
            table.name +
            "` c WHERE " +
            notnull +
            " AND NOT EXISTS (SELECT 1 FROM `" +
            keys[0].table +
            "` p WHERE " +
            condition +
            ")",
        )) as any;
        if (bad[0].n)
          throw Error("Foreign key verification failed for " + table.name);
      }
      checks.push({ table: table.name, rows: rows.length, verified: true });
    }
    fs.mkdirSync("docs/verification/tidb", { recursive: true });
    fs.writeFileSync(
      "docs/verification/tidb/" +
        (process.env.TIDB_DATABASE?.includes("prod")
          ? "production-import.json"
          : "staging-import.json"),
      JSON.stringify(
        {
          testedAt: new Date().toISOString(),
          source: "current Cloudflare v15",
          database: process.env.TIDB_DATABASE || "sakura_migration_20261029",
          sourceSha256: createHash("sha256").update(input).digest("hex"),
          schemaChecksum: schema.checksum,
          checks,
        },
        null,
        2,
      ),
    );
    console.log(
      "Verified identical data across " +
        checks.length +
        " tables; no production cutover yet",
    );
  }
} catch (error) {
  try {
    await connection.rollback();
    await connection.query("SET foreign_key_checks=1");
  } catch {}
  throw error;
} finally {
  connection.release();
  await pool.end();
}
