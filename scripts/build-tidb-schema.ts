import fs from "node:fs";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { tidbSql, splitSqlList, sqlGroups } from "../server/tidb/sqlDialect";
import { transactionOnlyChecks } from "../server/tidb/nativeChecks";
const db = new Database("data/sakura_edu.sqlite", { readonly: true });
const definitions = db
  .prepare(
    "SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND sql IS NOT NULL",
  )
  .all() as any[];
const tables = definitions
  .filter((r) => r.type === "table")
  .map((t) => {
    const cols = db.prepare(`PRAGMA table_info("${t.name}")`).all() as any[];
    const indexes = (
      db.prepare(`PRAGMA index_list("${t.name}")`).all() as any[]
    )
      .filter((i) => i.origin !== "pk")
      .map((i) => ({
        ...i,
        columns: db.prepare(`PRAGMA index_info("${i.name}")`).all(),
        sql: (
          db
            .prepare("SELECT sql FROM sqlite_master WHERE name=?")
            .get(i.name) as any
        )?.sql,
      }));
    const foreign = db
      .prepare(`PRAGMA foreign_key_list("${t.name}")`)
      .all() as any[];
    const indexed = new Set([
      ...cols.filter((c) => c.pk).map((c) => c.name),
      ...indexes.flatMap((i) => i.columns.map((c: any) => c.name)),
      ...foreign.map((f) => f.from),
    ]);
    const checks = sqlGroups(t.sql, "CHECK").map(tidbSql),
      automaticTimestamps: string[] = [];
    const columns = cols.map((c) => {
      const definition =
        splitSqlList(
          t.sql.slice(t.sql.indexOf("(") + 1, t.sql.lastIndexOf(")")),
        ).find((s) =>
          new RegExp('^["`]?' + c.name + '["`]?\\s', "i").test(s),
        ) || "";
      const numeric = /INT/i.test(c.type)
        ? "BIGINT"
        : /REAL|DOUBLE|FLOAT/i.test(c.type)
          ? "DOUBLE"
          : /NUMERIC|DECIMAL/i.test(c.type)
            ? "DECIMAL(18,6)"
            : null;
      const type =
        numeric ||
        (c.name === "email"
          ? "VARCHAR(254)"
          : indexed.has(c.name)
            ? "VARCHAR(128)"
            : "LONGTEXT");
      let value =
        "`" +
        c.name +
        "` " +
        type +
        (/COLLATE NOCASE/i.test(definition)
          ? " COLLATE utf8mb4_general_ci"
          : "") +
        (c.notnull || c.pk ? " NOT NULL" : "");
      if (c.pk && numeric === "BIGINT" && cols.filter((x) => x.pk).length === 1)
        value += " AUTO_INCREMENT";
      if (c.dflt_value !== null) {
        if (/datetime|strftime|CURRENT_TIMESTAMP/i.test(c.dflt_value)) {
          automaticTimestamps.push(c.name);
          if (type !== "LONGTEXT") value += " DEFAULT ''";
        } else if (
          !/randomblob/i.test(c.dflt_value) &&
          (type !== "LONGTEXT" || c.dflt_value === "NULL")
        )
          value += " DEFAULT " + c.dflt_value;
      }
      return {
        name: c.name,
        type,
        sql: value,
        pk: c.pk,
        notnull: c.notnull,
        default: c.dflt_value,
      };
    });
    const ddl = columns.map((c) => c.sql);
    const primary = cols
      .filter((c) => c.pk)
      .sort((a, b) => a.pk - b.pk)
      .map((c) => c.name);
    if (primary.length)
      ddl.push(
        "PRIMARY KEY (" + primary.map((c) => "`" + c + "`").join(",") + ")",
      );
    for (const [i, index] of indexes.entries()) {
      let columns = index.columns.map((c: any) =>
        c.name ? "`" + c.name + "`" : null,
      );
      if (columns.some((c: any) => !c))
        throw Error(
          "Expression index requires explicit migration: " + index.name,
        );
      if (index.partial) {
        const condition = index.sql.slice(index.sql.search(/\bWHERE\b/i) + 5);
        const marker = "_active_" + i;
        ddl.push(
          "`" +
            marker +
            "` BIGINT GENERATED ALWAYS AS (CASE WHEN " +
            tidbSql(condition) +
            " THEN 1 ELSE NULL END) STORED",
        );
        columns.push("`" + marker + "`");
      }
      ddl.push(
        (index.unique ? "UNIQUE " : "") +
          "KEY `idx_" +
          i +
          "` (" +
          columns.join(",") +
          ")",
      );
    }
    for (const [i, check] of checks.entries())
      if (!transactionOnlyChecks.has(t.name + ":" + i))
        ddl.push(
          "CONSTRAINT `" + t.name + "_check_" + i + "` CHECK (" + check + ")",
        );
    const groups = new Map<number, any[]>();
    for (const f of foreign) groups.set(f.id, [...(groups.get(f.id) || []), f]);
    const fks = [...groups].map(([id, rows]) => {
      rows.sort((a, b) => a.seq - b.seq);
      return (
        "ALTER TABLE `" +
        t.name +
        "` ADD CONSTRAINT `" +
        t.name +
        "_fk_" +
        id +
        "` FOREIGN KEY (" +
        rows.map((f) => "`" + f.from + "`").join(",") +
        ") REFERENCES `" +
        rows[0].table +
        "` (" +
        rows.map((f) => "`" + f.to + "`").join(",") +
        ") ON UPDATE " +
        rows[0].on_update +
        " ON DELETE " +
        rows[0].on_delete
      );
    });
    return {
      name: t.name,
      columns,
      primary,
      automaticTimestamps,
      checks,
      foreign,
      ddl:
        "CREATE TABLE `" +
        t.name +
        "` (" +
        ddl.join(",") +
        ") CHARACTER SET utf8mb4 COLLATE utf8mb4_bin",
      foreignDdl: fks,
    };
  });
const triggers = definitions
  .filter((d) => d.type === "trigger")
  .map((t) => {
    const m = t.sql.match(
      /^CREATE TRIGGER\s+\w+\s+BEFORE\s+(INSERT|UPDATE|DELETE)(?:\s+OF\s+(.+?))?\s+ON\s+(\w+)\s*(?:WHEN\s+([\s\S]+?))?\s+BEGIN\s*([\s\S]+)\s*END$/i,
    );
    if (!m) throw Error("Unrecognized source guard " + t.name);
    const rules = splitSqlList(m[5].replace(/;\s*(?=SELECT)/gi, ","))
      .filter(Boolean)
      .map((s) => {
        s = s.replace(/;\s*$/, "");
        const a = s.match(
            /^SELECT CASE WHEN ([\s\S]+) THEN RAISE\(ABORT,'([^']*)'\) END$/i,
          ),
          b = s.match(/^SELECT RAISE\(ABORT,'([^']*)'\)$/i);
        if (!a && !b) throw Error("Unrecognized source guard body " + t.name);
        return { condition: a ? a[1] : "1", message: a ? a[2] : b![1] };
      });
    return {
      name: t.name,
      table: m[3],
      event: m[1].toUpperCase(),
      columns: m[2]?.split(",").map((c: string) => c.trim()),
      when: m[4] || "1",
      rules,
    };
  });
const content = { sourceSchemaVersion: 15, tables, triggers };
fs.mkdirSync("server/tidb", { recursive: true });
fs.writeFileSync(
  "server/tidb/schema.json",
  JSON.stringify(
    {
      ...content,
      checksum: createHash("sha256")
        .update(JSON.stringify(content))
        .digest("hex"),
    },
    null,
    2,
  ),
);
console.log(
  "Built TiDB schema for " +
    tables.length +
    " tables and " +
    triggers.length +
    " guarded invariants",
);
db.close();
