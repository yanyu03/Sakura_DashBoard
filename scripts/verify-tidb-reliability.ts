import assert from "node:assert/strict";
import fs from "node:fs";
import {
  TiDBDatabase,
  type SqlLease,
  type SqlPool,
} from "../server/tidb/database";
import { apiErrorHandler } from "../server/http";
const checks: string[] = [];
let failRead = false,
  failCommit = false,
  writes = 0,
  commits = 0,
  rollbacks = 0,
  releases = 0;
const query = async (options: any) => {
  const sql = typeof options === "string" ? options : options.sql;
  if (sql === "COMMIT") {
    commits++;
    if (failCommit)
      throw Object.assign(Error("lost acknowledgement"), {
        code: "ECONNRESET",
      });
  }
  if (sql === "ROLLBACK") rollbacks++;
  if (sql.startsWith("INSERT")) writes++;
  if (sql === "SELECT probe") {
    if (failRead) throw Object.assign(Error("offline"), { code: "ETIMEDOUT" });
    return [[{ ok: 1 }]];
  }
  return [{ affectedRows: 1, insertId: 1 }];
};
const lease: SqlLease = {
  query,
  commit: () => query("COMMIT"),
  rollback: () => query("ROLLBACK"),
  release: () => {
    releases++;
  },
};
const pool: SqlPool = { query, getConnection: async () => lease };
const db = new TiDBDatabase(pool);
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
await check(
  "unconfirmed commit is never retried and the connection lease is released",
  async () => {
    failCommit = true;
    await assert.rejects(
      () =>
        db.transaction(async () => {
          await db.prepare("INSERT INTO diagnostic_probe VALUES(?)").run("one");
        })(),
      (e: any) => e.code === "DB_COMMIT_UNKNOWN",
    );
    assert.equal(writes, 1);
    assert.equal(commits, 1);
    assert.equal(rollbacks, 1);
    assert.equal(releases, 1);
  },
);
await check(
  "a new explicit transaction recovers after the previous failure",
  async () => {
    failCommit = false;
    await db.transaction(async () => {
      await db.prepare("INSERT INTO diagnostic_probe VALUES(?)").run("two");
    })();
    assert.equal(writes, 2);
    assert.equal(commits, 2);
    assert.equal(releases, 2);
  },
);
await check(
  "temporary data failure produces bounded 503 and preserves the authenticated browser state",
  async () => {
    failRead = true;
    let error: any;
    try {
      await db.prepare("SELECT probe").get();
    } catch (e) {
      error = e;
    }
    const headers: Record<string, string> = {};
    let status = 0,
      payload: any;
    const response: any = {
      headersSent: false,
      locals: { requestId: "synthetic-reliability" },
      setHeader: (n: string, v: string) => {
        headers[n] = v;
      },
      status: (s: number) => {
        status = s;
        return response;
      },
      json: (p: any) => {
        payload = p;
      },
    };
    apiErrorHandler(error, {} as any, response, () => {});
    assert.equal(status, 503);
    assert.equal(headers["Retry-After"], "3");
    assert.equal(payload.success, false);
    assert.equal(payload.data, null);
    assert.ok(!headers["Set-Cookie"]);
    failRead = false;
    assert.deepEqual(await db.prepare("SELECT probe").get(), { ok: 1 });
  },
);
fs.mkdirSync("docs/verification/tidb", { recursive: true });
fs.writeFileSync(
  "docs/verification/tidb/failures.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), passed: checks.length, checks },
    null,
    2,
  ),
);
