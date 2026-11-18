import { AsyncLocalStorage } from "node:async_hooks";
import type { DatabaseConnection } from "../server/asyncDatabase";
import schema from "./schema.json";

/**
 * AB-only SQLite driver. Durable Object SQLite is a native SQLite engine;
 * unlike better-sqlite3 it is available within Cloudflare Workers.
 */
/** Minimal SQLite storage contract, kept portable for Node unit tests. */
export type AbStorage = {
  sql: {
    exec<T extends Record<string, any> = Record<string, any>>(
      statement: string, ...args: Array<string | number | bigint | null | ArrayBuffer | Uint8Array>
    ): { toArray(): T[]; one(): T };
  };
  transactionSync<T>(callback: () => T): T;
  transaction<T>(callback: () => T | Promise<T>): Promise<T>;
};

export class AbDurableSqlite implements DatabaseConnection {
  readonly async = true as const;
  private readonly activeTransaction = new AsyncLocalStorage<boolean>();

  constructor(private readonly storage: AbStorage) {}

  private execute(sql: string, args: unknown[] = []) {
    try {
      return this.storage.sql.exec(sql, ...(args.map((value) =>
        value === undefined ? null : typeof value === 'boolean' ? Number(value) : value
      ) as Array<string | number | bigint | null | ArrayBuffer | Uint8Array>)).toArray();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      const error = new Error(message) as Error & { code?: string };
      if (/UNIQUE constraint|PRIMARY KEY constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_UNIQUE";
      else if (/FOREIGN KEY constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_FOREIGNKEY";
      else if (/CHECK constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_CHECK";
      else if (/NOT NULL constraint/i.test(message))
        error.code = "SQLITE_CONSTRAINT_NOTNULL";
      throw error;
    }
  }

  prepare(sql: string) {
    return {
      get: async (...args: unknown[]) => this.execute(sql, args)[0],
      all: async (...args: unknown[]) => this.execute(sql, args),
      run: async (...args: unknown[]) => {
        // No await between the mutation and changes(): both run in one DO turn.
        this.execute(sql, args);
        const stats = this.execute("SELECT changes() AS changes, last_insert_rowid() AS id")[0] as
          | { changes: number; id: number }
          | undefined;
        return { changes: stats?.changes || 0, lastInsertRowid: stats?.id || 0 };
      },
    };
  }

  transaction<T>(callback: () => T | Promise<T>): () => Promise<T> {
    return async () => {
      if (this.activeTransaction.getStore()) return await callback();
      // Async DO transaction, NOT transactionSync (business handlers await).
      return await this.storage.transaction(async () =>
        this.activeTransaction.run(true, callback)
      );
    };
  }
}

const expectedVersion = schema.sourceMigrationVersion;
const expectedTables = schema.tables.length;

/**
 * Initialize the same frozen v16 SQLite schema used by CI. Do not seed users
 * or reset an existing test database. Reject drift rather than guessing.
 */
export function ensureAbSchema(storage: AbStorage) {
  const sql = storage.sql;
  const exists = sql.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'",
  ).toArray().length > 0;

  if (!exists) {
    storage.transactionSync(() => {
      for (const statement of schema.statements) sql.exec(statement);
      for (const migration of schema.ledger)
        sql.exec(
          "INSERT INTO schema_migrations(version,name,checksum) VALUES (?,?,?)",
          migration.version, migration.name, migration.checksum,
        );
    });
  }

  const migration = sql.exec<{ count: number; version: number }>(
    "SELECT COUNT(*) AS count, MAX(version) AS version FROM schema_migrations",
  ).one();
  const tables = sql.exec<{ count: number }>(
    "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",
  ).one().count;

  if (migration.count !== schema.ledger.length ||
      migration.version !== expectedVersion || tables !== expectedTables)
    throw Error("AB SQLite migration drift: refusing to serve business requests");

  return { engine: "SQLite", driver: "Durable Object SQL", version: expectedVersion,
    migrations: migration.count, tables, ready: true };
}
