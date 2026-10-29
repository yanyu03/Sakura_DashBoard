import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
export interface SqlRunner {
  query(options: any, args?: any): Promise<any>;
}
export interface SqlLease extends SqlRunner {
  commit(): Promise<any>;
  rollback(): Promise<any>;
  release?(): void | Promise<void>;
}
export interface SqlPool extends SqlRunner {
  getConnection(): Promise<SqlLease>;
}
import type { DatabaseConnection } from "../asyncDatabase";
import schema from "./schema.json";
import { tidbSql } from "./sqlDialect";
type Executor = SqlLease;
type Row = Record<string, any>;
const tables = new Map(schema.tables.map((t) => [t.name, t]));
const guarded = new Set(schema.triggers.map((t) => t.table));
const fault = (message: string) =>
  Object.assign(new Error(message), { code: "SQLITE_CONSTRAINT_TRIGGER" });
/** Async SQL, bounded driver timeouts, one leased connection per transaction. */
export class TiDBDatabase implements DatabaseConnection {
  readonly async = true as const;
  private context = new AsyncLocalStorage<Executor>();
  constructor(private source: SqlPool | SqlLease) {}
  private async query(sql: string, args: unknown[] = []): Promise<any> {
    const active = this.context.getStore() || this.source;
    try {
      const [rows] = await active.query(
        { sql: tidbSql(sql), timeout: 5000 },
        args.map((a) => (a === undefined ? null : a)),
      );
      return rows;
    } catch (error: any) {
      console.error({
        event: "database_query_failed",
        code: /^[A-Z0-9_]{1,64}$/.test(String(error?.code))
          ? error.code
          : "QUERY_FAILED",
        operation:
          /^(SELECT|INSERT|UPDATE|DELETE|BEGIN|COMMIT|ROLLBACK)\b/i
            .exec(sql.trim())?.[1].toUpperCase() || "QUERY",
      });
      throw error;
    }
  }
  transaction<T>(callback: () => T | Promise<T>): () => Promise<T> {
    return async () => {
      if (this.context.getStore()) return await callback();
      const connection =
        "getConnection" in this.source
          ? await this.source.getConnection()
          : this.source;
      let begun = false;
      try {
        await connection.query({ sql: "BEGIN PESSIMISTIC", timeout: 5000 });
        begun = true;
        // Protect cross-row organization/captcha/approval invariants, including absent rows.
        await connection.query({
          sql: "SELECT name FROM sakura_runtime_locks WHERE name='write' FOR UPDATE NOWAIT",
          timeout: 5000,
        });
        await connection.query({
          sql: "UPDATE sakura_runtime_locks SET epoch=epoch+1 WHERE name='write'",
          timeout: 5000,
        });
        const value = await this.context.run(connection, callback);
        try {
          await connection.query({ sql: "COMMIT", timeout: 5000 });
        } catch (cause) {
          throw Object.assign(
            new Error(
              "Transaction outcome must be checked before resubmitting",
              { cause },
            ),
            { code: "DB_COMMIT_UNKNOWN" },
          );
        }
        return value;
      } catch (e) {
        if (begun)
          try {
            await connection.query({ sql: "ROLLBACK", timeout: 5000 });
          } catch {}
        throw e;
      } finally {
        if ("release" in connection && typeof connection.release === "function")
          try {
            await connection.release();
          } catch {}
      }
    };
  }
  private defaults(sql: string, args: unknown[]) {
    const m = sql.match(
      /^\s*INSERT(?: OR IGNORE)? INTO\s+([\w]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^]*?)\)(?=\s*(?:ON CONFLICT|$))/i,
    );
    if (!m) return { sql, args };
    const definition = tables.get(m[1]);
    const columns = m[2].split(",").map((c) => c.trim().replaceAll('"', ""));
    const absent =
      definition?.columns
        .filter((c) => c.default !== null && !columns.includes(c.name))
        .map((c) => c.name) || [];
    if (!absent.length) return { sql, args };
    const addition = absent.map((name) => {
      if (definition!.automaticTimestamps.includes(name))
        return new Date().toISOString();
      const input = definition!.columns.find((c) => c.name === name)!.default!;
      if (/randomblob/i.test(input)) return randomUUID().replaceAll("-", "");
      if (input === "NULL") return null;
      if (/^'.*'$/s.test(input))
        return input.slice(1, -1).replaceAll("''", "'");
      if (Number.isFinite(Number(input))) return Number(input);
      throw Error("Unsupported default value for " + name);
    });
    const replacement = m[0]
      .replace(m[2], m[2] + "," + absent.join(","))
      .replace(m[3] + ")", m[3] + absent.map(() => ",?").join("") + ")");
    return {
      sql: replacement + sql.slice(m[0].length),
      args: [...args, ...addition],
    };
  }
  private bindRule(input: string, newRow: Row, oldRow: Row) {
    const args: unknown[] = [];
    const sql = input
      .replace(
        /((?:NEW|OLD)\.\w+)\s+IS NOT\s+((?:NEW|OLD)\.\w+)/gi,
        "NOT($1 <=> $2)",
      )
      .replace(/\b(NEW|OLD)\.(\w+)\b/gi, (_m, which: string, key: string) => {
        args.push(
          (which.toUpperCase() === "NEW" ? newRow : oldRow)[key] ?? null,
        );
        return "?";
      });
    return {
      sql: "SELECT CASE WHEN (" + sql + ") THEN 1 ELSE 0 END AS invalid",
      args,
    };
  }
  private async validate(
    table: string,
    event: string,
    newRow: Row,
    oldRow: Row,
    changed: string[],
  ) {
    for (const trigger of schema.triggers.filter(
      (t) => t.table === table && t.event === event,
    )) {
      if (trigger.columns && !trigger.columns.some((c) => changed.includes(c)))
        continue;
      const when = this.bindRule(trigger.when, newRow, oldRow);
      if (!(await this.query(when.sql, when.args))[0].invalid) continue;
      if (trigger.name.startsWith("reporting_scope_")) {
        const [r] = await this.query(
          "SELECT p.unit_id,p.hierarchy_level,q.unit_id supervisor_unit,q.hierarchy_level supervisor_level FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN identity_appointments b ON b.id=? JOIN organization_positions q ON q.id=b.position_id WHERE a.id=?",
          [newRow.supervisor_id, newRow.subordinate_id],
        );
        if (!r || r.supervisor_level >= r.hierarchy_level)
          throw fault(
            "supervisor must be higher in the organization hierarchy",
          );
        let id = r.unit_id,
          valid = false;
        const visited = new Set();
        while (id && !visited.has(id)) {
          visited.add(id);
          if (id === r.supervisor_unit) {
            valid = true;
            break;
          }
          id = (
            await this.query(
              "SELECT parent_id FROM organization_units WHERE id=?",
              [id],
            )
          )[0]?.parent_id;
        }
        if (!valid)
          throw fault(
            "supervisor must be higher in the organization hierarchy",
          );
        continue;
      }
      for (const rule of trigger.rules) {
        const condition = this.bindRule(rule.condition, newRow, oldRow);
        if ((await this.query(condition.sql, condition.args))[0].invalid)
          throw fault(rule.message);
      }
    }
  }
  private async write(sql: string, args: unknown[]) {
    const m = sql.match(
        /^\s*(INSERT(?: OR IGNORE)? INTO|UPDATE|DELETE FROM)\s+["`]?([\w]+)["`]?/i,
      ),
      table = m?.[2];
    if (!table || (!guarded.has(table) && !tables.get(table)?.checks.length)) {
      const input = this.defaults(sql, args);
      return this.query(input.sql, input.args);
    }
    return this.transaction(async () => {
      const event = m![1].startsWith("INSERT")
        ? "INSERT"
        : m![1].startsWith("DELETE")
          ? "DELETE"
          : "UPDATE";
      const definition = tables.get(table)!;
      const before = guarded.has(table)
        ? ((await this.query("SELECT * FROM `" + table + "`")) as Row[])
        : [];
      const key = (r: Row) =>
        JSON.stringify(definition.primary.map((c) => r[c]));
      const old = new Map(before.map((r) => [key(r), r]));
      if (event === "DELETE") {
        const position = sql.search(/\bWHERE\b/i);
        const clause = position < 0 ? "" : sql.slice(position);
        const prefix = position < 0 ? sql : sql.slice(0, position);
        const offset = (prefix.match(/\?/g) || []).length;
        const selected = await this.query(
          "SELECT * FROM `" + table + "` " + clause,
          args.slice(offset),
        );
        for (const r of selected) await this.validate(table, event, {}, r, []);
      }
      const input = this.defaults(sql, args);
      const result = (await this.query(
        input.sql,
        input.args,
      )) as ResultSetHeader;
      if (event !== "DELETE" && result.affectedRows) {
        if (definition.checks.length) {
          const invalid = await this.query(
            "SELECT 1 FROM `" +
              table +
              "` WHERE " +
              definition.checks
                .map((c) => "(" + c + ") IS FALSE")
                .join(" OR ") +
              " LIMIT 1",
          );
          if (invalid.length)
            throw fault("data does not satisfy " + table + " constraints");
        }
        if (guarded.has(table)) {
          const after = (await this.query(
            "SELECT * FROM `" + table + "`",
          )) as Row[];
          for (const row of after) {
            const previous = old.get(key(row));
            if (!previous || JSON.stringify(previous) !== JSON.stringify(row))
              await this.validate(
                table,
                previous ? "UPDATE" : "INSERT",
                row,
                previous || {},
                Object.keys(row).filter((k) => row[k] !== previous?.[k]),
              );
          }
        }
      }
      return result;
    })();
  }
  prepare(sql: string) {
    return {
      all: async (...args: unknown[]) =>
        (await this.query(sql, args)) as RowDataPacket[],
      get: async (...args: unknown[]) => (await this.query(sql, args))[0],
      run: async (...args: unknown[]) => {
        const result = (await this.write(sql, args)) as ResultSetHeader;
        return {
          changes: result.affectedRows,
          lastInsertRowid: result.insertId || 0,
        };
      },
    };
  }
}
