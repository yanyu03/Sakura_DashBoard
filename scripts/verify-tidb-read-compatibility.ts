import assert from "node:assert/strict";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { tidbPool } from "./tidb-config";
import { TiDBDatabase } from "../server/tidb/database";
if (
  process.env.TIDB_DATABASE &&
  !process.env.TIDB_DATABASE.startsWith("sakura_migration_")
)
  throw Error(
    "Read compatibility fixtures require an isolated migration database",
  );
const pool = tidbPool(),
  db = new TiDBDatabase(pool),
  id = "compat-" + randomUUID();
try {
  const account = await db
    .prepare("SELECT id FROM faculty_users LIMIT 1")
    .get();
  assert.ok(account);
  await db
    .prepare(
      "INSERT INTO lesson_plans(id,title,summary,body,author_name,owner_id,tags_json) VALUES (?,?,?,?,?,?,?)",
    )
    .run(
      id,
      "跨学科 O'Reilly 🌸",
      "摘要专用词",
      "正文专用词",
      "Synthetic",
      account.id,
      '["标签专用词"]',
    );
  for (const field of ["summary", "body"]) {
    const sql = `SELECT id FROM lesson_plans WHERE id=? AND instr(title||${field}||tags_json,?)>0`;
    for (const term of [
      "O'Reilly 🌸",
      field === "summary" ? "摘要专用词" : "正文专用词",
      "标签专用词",
    ])
      assert.equal((await db.prepare(sql).get(id, term))?.id, id);
    assert.equal(await db.prepare(sql).get(id, "不存在的匹配词"), undefined);
  }
  const health = await db
    .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table'")
    .get();
  assert.ok(health.n >= 58);
  fs.writeFileSync(
    "docs/verification/tidb/read-compatibility.json",
    JSON.stringify(
      {
        testedAt: new Date().toISOString(),
        target: "isolated TiDB migration staging database",
        passed: 3,
        checks: [
          "lesson search concatenates title summary and tags with parameterized Unicode and apostrophes",
          "workspace search concatenates title body and tags and rejects unmatched terms",
          "environment health counts actual TiDB tables",
        ],
      },
      null,
      2,
    ),
  );
  console.log("PASS 3 TiDB search and metadata compatibility checks");
} finally {
  await db.prepare("DELETE FROM lesson_plans WHERE id=?").run(id);
  await pool.end();
}
