import assert from "node:assert/strict";
import Database from "better-sqlite3";
import { AbDurableSqlite, ensureAbSchema } from "../cloudflare/abSqliteDatabase";

const sqlite = new Database(":memory:");
sqlite.pragma("foreign_keys = ON");
let nativeTransactions = 0;
let asyncTransactions = 0;
const storage = {
  sql: {
    exec(sql: string, ...params: unknown[]) {
      const stmt = sqlite.prepare(sql);
      if (stmt.reader) {
        return {
          toArray: () => stmt.all(...params),
          one: () => stmt.get(...params),
        };
      }
      stmt.run(...params);
      return { toArray: () => [], one: () => undefined };
    },
  },
  transactionSync<T>(callback: () => T): T {
    nativeTransactions++;
    return sqlite.transaction(callback)();
  },
  async transaction<T>(callback: () => T | Promise<T>): Promise<T> {
    asyncTransactions++;
    // Unit mock validates adapter dispatch, not DO runtime transaction semantics.
    return await callback();
  },
} as unknown as import('../cloudflare/abSqliteDatabase').AbStorage;
let checks = 0;
const check = (condition: unknown, message: string) => {
  assert.ok(condition, message);
  checks++;
};
try {
  const schema = ensureAbSchema(storage);
  check(schema.ready && schema.version === 16, "schema initialized to v16");
  check(schema.tables === 60, "all business tables initialized");
  check(schema.migrations === 16, "migration ledger complete");
  check(nativeTransactions === 1, "schema installed atomically");
  ensureAbSchema(storage);
  check(nativeTransactions === 1, "re-initialization does not reseed");
  const count = sqlite.prepare(
    "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='trigger'"
  ).get() as { count: number };
  check(count.count === 34, "trigger count");

  const db = new AbDurableSqlite(storage);
  const term = {
    id: "ab-fixture-term", code: "ABFIXTURE", name: "AB 测试学期",
    starts_on: "2026-09-01", ends_on: "2027-02-01",
  };
  const value = await db.transaction(async () => {
    await db.prepare(
      "INSERT INTO academic_terms (id,code,name,starts_on,ends_on) VALUES (?,?,?,?,?)"
    ).run(term.id, term.code, term.name, term.starts_on, term.ends_on);
    return await db.transaction(async () =>
      db.prepare("SELECT name FROM academic_terms WHERE id=?").get(term.id)
    )();
  })();
  check(value.name === term.name, "async nested transaction and query");
  check(asyncTransactions === 1, "nested transaction reuses outer context");
  const rows = await db.prepare("SELECT id FROM academic_terms WHERE code=?").all(term.code);
  check(rows.length === 1 && rows[0].id === term.id, "prepared query");
  await assert.rejects(() =>
    db.prepare(
      "INSERT INTO academic_terms (id,code,name,starts_on,ends_on) VALUES (?,?,?,?,?)"
    ).run("another", term.code, "duplicate", term.starts_on, term.ends_on),
    (error: any) => error?.code === "SQLITE_CONSTRAINT_UNIQUE",
  );
  checks++;
  check((await db.prepare("SELECT COUNT(*) AS n FROM faculty_users").get()).n === 0,
    "database is an empty test installation");
  console.log(`PASS AB native SQLite driver (${checks} assertions)`);
} finally {
  sqlite.close();
}
