import { AsyncLocalStorage } from "node:async_hooks";
import type { Express, NextFunction, Request, Response } from "express";
import type { DatabaseConnection as SyncDatabase } from "./dbContract";
export interface DatabaseConnection {
  readonly async: true;
  prepare(sql: string): {
    get(...args: unknown[]): Promise<any>;
    all(...args: unknown[]): Promise<any[]>;
    run(
      ...args: unknown[]
    ): Promise<{ changes: number; lastInsertRowid: number | bigint }>;
  };
  transaction<T>(callback: () => T | Promise<T>): () => Promise<T>;
}
export type DatabaseSource = SyncDatabase | DatabaseConnection;
const adapters = new WeakMap<object, DatabaseConnection>();
/** SQLite is retained for isolated testing; remote databases never block the event loop. */
export function asyncDatabase(source: DatabaseSource): DatabaseConnection {
  if ("async" in source && source.async) return source;
  const existing = adapters.get(source);
  if (existing) return existing;
  const db = source as SyncDatabase,
    context = new AsyncLocalStorage<boolean>();
  let tail = Promise.resolve();
  async function exclusive<T>(fn: () => T | Promise<T>): Promise<T> {
    if (context.getStore()) return fn();
    const prior = tail;
    let release!: () => void;
    tail = new Promise<void>((r) => {
      release = r;
    });
    await prior;
    try {
      return await context.run(true, fn);
    } finally {
      release();
    }
  }
  const adapter: DatabaseConnection = {
    async: true,
    prepare(sql) {
      return {
        get: (...a) => exclusive(() => db.prepare(sql).get(...a)),
        all: (...a) => exclusive(() => db.prepare(sql).all(...a)),
        run: (...a) => exclusive(() => db.prepare(sql).run(...a)),
      };
    },
    transaction(callback) {
      return () =>
        exclusive(async () => {
          db.prepare("SAVEPOINT sakura_async_transaction").run();
          try {
            const result = await callback();
            db.prepare("RELEASE SAVEPOINT sakura_async_transaction").run();
            return result;
          } catch (e) {
            db.prepare("ROLLBACK TO SAVEPOINT sakura_async_transaction").run();
            db.prepare("RELEASE SAVEPOINT sakura_async_transaction").run();
            throw e;
          }
        });
    },
  };
  adapters.set(source, adapter);
  return adapter;
}
const configured = new WeakSet<object>();
export function installAsyncRoutes(app: Express) {
  if (configured.has(app)) return;
  configured.add(app);
  for (const method of [
    "get",
    "post",
    "patch",
    "put",
    "delete",
    "use",
  ] as const) {
    const original: any = app[method].bind(app);
    (app as any)[method] = (...args: any[]) =>
      original(
        ...args.map((arg: any) =>
          typeof arg === "function" && arg.length !== 4
            ? (req: Request, res: Response, next: NextFunction) => {
                try {
                  Promise.resolve(arg(req, res, next)).catch(next);
                } catch (e) {
                  next(e);
                }
              }
            : arg,
        ),
      );
  }
}
export async function asyncFilter<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>,
) {
  const flags = await Promise.all(items.map(predicate));
  return items.filter((_, i) => flags[i]);
}
export async function asyncSome<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>,
) {
  for (let i = 0; i < items.length; i++)
    if (await predicate(items[i], i)) return true;
  return false;
}
export async function asyncFind<T>(
  items: T[],
  predicate: (item: T, index: number) => Promise<boolean>,
) {
  for (let i = 0; i < items.length; i++)
    if (await predicate(items[i], i)) return items[i];
}
export async function asyncEach<T>(
  items: T[],
  callback: (item: T, index: number) => Promise<unknown>,
) {
  for (let i = 0; i < items.length; i++) await callback(items[i], i);
}
