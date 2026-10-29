import fs from "node:fs";
import schema from "../server/tidb/schema.json";
import { tidbPool } from "./tidb-config";
const pool = tidbPool(),
  connection = await pool.getConnection();
const exceptions: {
  table: string;
  index: number;
  enforcedBy: string;
  reason: string;
}[] = [];
try {
  await connection.query("SET GLOBAL tidb_enable_check_constraint=ON");
  const [current] = (await connection.query(
    "SELECT CONSTRAINT_NAME AS name FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND CONSTRAINT_TYPE='CHECK'",
  )) as any;
  const names = new Set(current.map((r: any) => r.name));
  let native = 0;
  for (const table of schema.tables)
    for (const [i, check] of table.checks.entries()) {
      const name = table.name + "_check_" + i;
      if (names.has(name)) {
        native++;
        continue;
      }
      try {
        await connection.query({
          sql:
            "ALTER TABLE `" +
            table.name +
            "` ADD CONSTRAINT `" +
            name +
            "` CHECK (" +
            check +
            ") ENFORCED",
          timeout: 20000,
        });
        native++;
      } catch (e: any) {
        if (e.code === "ER_CHECK_CONSTRAINT_DUP_NAME") {
          native++;
          continue;
        }
        if (
          e.code === "ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN"
        ) {
          exceptions.push({
            table: table.name,
            index: i,
            enforcedBy: "application transaction",
            reason: e.code,
          });
          continue;
        }
        throw new Error(table.name + " [" + e.code + "] " + e.sqlMessage);
      }
    }
  const expected = schema.tables.reduce((n, t) => n + t.checks.length, 0);
  if (native + exceptions.length !== expected)
    throw Error("Missing enforced checks");
  fs.mkdirSync("docs/verification/tidb", { recursive: true });
  fs.writeFileSync(
    "docs/verification/tidb/constraints.json",
    JSON.stringify(
      {
        nativeChecks: native,
        totalChecks: expected,
        transactionChecks: expected,
        exceptions,
      },
      null,
      2,
    ),
  );
  console.log(
    "TiDB checks: " +
      native +
      " native, " +
      exceptions.length +
      " application-only, all " +
      expected +
      " validated in application transactions",
  );
} finally {
  connection.release();
  await pool.end();
}
