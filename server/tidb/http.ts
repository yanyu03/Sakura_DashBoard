import { connect, type FullResult, type Config } from "@tidbcloud/serverless";
import type { SqlPool, SqlLease } from "./database";
const codes: Record<string, string> = {
  "1062": "ER_DUP_ENTRY",
  "1452": "ER_NO_REFERENCED_ROW_2",
  "1451": "ER_ROW_IS_REFERENCED_2",
  "3819": "ER_CHECK_CONSTRAINT_VIOLATED",
  "1048": "ER_BAD_NULL_ERROR",
  "1406": "ER_DATA_TOO_LONG",
  "1213": "ER_LOCK_DEADLOCK",
  "1205": "ER_LOCK_WAIT_TIMEOUT",
  "3572": "ER_LOCK_NOWAIT",
};
function normalize(result: FullResult) {
  if (result.rowsAffected !== null)
    return [
      {
        affectedRows: result.rowsAffected,
        insertId: Number(result.lastInsertId || 0),
      },
    ];
  const rows = (result.rows || []) as Record<string, any>[];
  for (const row of rows)
    for (const [name, type] of Object.entries(result.types || {}))
      if (
        row[name] !== null &&
        /^(?:UNSIGNED )?(?:TINYINT|SMALLINT|MEDIUMINT|INT|BIGINT|FLOAT|DOUBLE|DECIMAL|YEAR)$/i.test(
          type,
        )
      ) {
        const number = Number(row[name]);
        if (!Number.isFinite(number))
          throw Error("Invalid numeric database result");
        row[name] = number;
      }
  return [rows];
}
function failure(error: any) {
  const code = String(error.details?.code || "").match(/\d+/)?.[0];
  if (code) error.code = codes[code] || "ER_UNKNOWN_ERROR";
  if (error.name === "TimeoutError" || error.name === "AbortError")
    error.code = "ETIMEDOUT";
  if (
    !error.code &&
    (error instanceof TypeError || error.status >= 500 || error.status === 429)
  )
    error.code = "ECONNRESET";
  return error;
}
/** Official HTTPS transport avoids unsupported MySQL TLS/auth proxy hooks in Workers. */
export class TiDBHttpPool implements SqlPool {
  private config: Config & { fullResult: true };
  constructor(
    url: string,
    fetcher: typeof globalThis.fetch = globalThis.fetch,
  ) {
    this.config = {
      url,
      fullResult: true,
      fetch: (input, init) =>
        fetcher(input, { ...init, signal: AbortSignal.timeout(7000) }),
    };
  }
  async query(options: any, args?: any) {
    try {
      return normalize(
        await connect(this.config).execute(
          typeof options === "string" ? options : options.sql,
          args,
        ),
      );
    } catch (e) {
      throw failure(e);
    }
  }
  async getConnection(): Promise<SqlLease> {
    let transaction;
    try {
      transaction = await connect(this.config).begin();
    } catch (error) {
      throw failure(error);
    }
    let tail = Promise.resolve(),
      finished = false;
    const query = (options: any, args?: any) => {
      const sql = typeof options === "string" ? options : options.sql;
      const result = tail.then(async () => {
        try {
          if (/^BEGIN\b/i.test(sql)) return [[]];
          if (sql === "COMMIT") {
            const result = await transaction.commit();
            finished = true;
            return normalize(result);
          }
          if (sql === "ROLLBACK") {
            const result = await transaction.rollback();
            finished = true;
            return normalize(result);
          }
          return normalize(await transaction.execute(sql, args));
        } catch (e) {
          throw failure(e);
        }
      });
      tail = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    };
    return {
      query,
      commit: () => query("COMMIT"),
      rollback: () => query("ROLLBACK"),
      release: async () => {
        await tail;
        if (!finished) await transaction.rollback();
      },
    };
  }
}
