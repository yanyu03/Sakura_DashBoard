import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import {
  asyncDatabase,
  type DatabaseConnection,
  type DatabaseSource,
} from "./asyncDatabase";
import { HttpError } from "./http";
export const COOLDOWNS = [30, 60, 120, 900, 10800] as const;
export const protectionSql = `CREATE TABLE auth_protection(bucket_hash TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0 CHECK(failures>=0),level INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN 0 AND 5),blocked_until INTEGER NOT NULL DEFAULT 0 CHECK(blocked_until>=0),updated_at INTEGER NOT NULL)`;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const protectionChecksum = hash(protectionSql);
export { applyAuthProtectionSchema } from "./database/authProtectionSchema";
type State = {
  failures: number;
  level: number;
  blocked_until: number;
  updated_at: number;
};
export class AuthFailureLimiter {
  constructor(
    source: DatabaseSource,
    private now = () => Date.now(),
  ) {
    this.db = asyncDatabase(source);
  }
  private db: DatabaseConnection;
  async state(key: string): Promise<Awaited<State>> {
    return (
      ((await this.db
        .prepare(
          "SELECT failures,level,blocked_until,updated_at FROM auth_protection WHERE bucket_hash=?",
        )
        .get(hash(key))) as State) || {
        failures: 0,
        level: 0,
        blocked_until: 0,
        updated_at: 0,
      }
    );
  }
  async remaining(keys: string[]) {
    return Math.max(
      0,
      ...(await Promise.all(
        keys.map(async (key) =>
          Math.ceil(
            ((await this.state(key)).blocked_until - this.now()) / 1000,
          ),
        ),
      )),
    );
  }
  async failure(
    buckets: {
      key: string;
      threshold: number;
      idleResetMs?: number;
    }[],
  ) {
    return await this.db.transaction(async () => {
      const time = this.now();
      let until = 0;
      for (const { key, threshold, idleResetMs } of buckets) {
        const prior = await this.state(key);
        if (prior.blocked_until > time) {
          until = Math.max(until, prior.blocked_until);
          continue;
        }
        const expired =
          idleResetMs !== undefined && time - prior.updated_at >= idleResetMs;
        let failures = (expired ? 0 : prior.failures) + 1,
          level = expired ? 0 : prior.level,
          blocked = 0;
        if (failures >= threshold) {
          blocked =
            time + COOLDOWNS[Math.min(level, COOLDOWNS.length - 1)] * 1000;
          level = Math.min(level + 1, COOLDOWNS.length);
          failures = 0;
        }
        await this.db
          .prepare(
            "INSERT INTO auth_protection(bucket_hash,failures,level,blocked_until,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(bucket_hash) DO UPDATE SET failures=excluded.failures,level=excluded.level,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at",
          )
          .run(hash(key), failures, level, blocked, time);
        until = Math.max(until, blocked);
      }
      return Math.max(0, Math.ceil((until - time) / 1000));
    })();
  }
  async reset(key: string) {
    await this.db
      .prepare("DELETE FROM auth_protection WHERE bucket_hash=?")
      .run(hash(key));
  }
}
/** Synchronous auth handlers: reject before password hashing and atomically record failures. */
export function withAuthProtection(
  source: DatabaseSource,
  kind: "login" | "register",
  handler: RequestHandler,
  trustCloudflare = false,
): RequestHandler {
  const db = asyncDatabase(source);
  const limiter = new AuthFailureLimiter(db);
  return async (req, res, next) => {
    const input = String(
      (kind === "login" ? req.body?.facultyId : req.body?.facultyCode) || "",
    )
      .trim()
      .toLowerCase()
      .slice(0, 128);
    // Resolve aliases to one account bucket; the source bucket cannot be reset with another valid account.
    const user =
      kind === "login"
        ? ((await db
            .prepare(
              "SELECT id FROM faculty_users WHERE faculty_code=? COLLATE NOCASE OR email=? COLLATE NOCASE OR phone=?",
            )
            .get(input, input, input)) as
            | {
                id: string;
              }
            | undefined)
        : undefined;
    const account = `${kind}:account:${user?.id || input}`;
    const source = `${kind}:source:${(trustCloudflare ? req.get("cf-connecting-ip") : undefined) || req.ip || "local"}`;
    const cooldown = (seconds: number) => {
      res.setHeader("Retry-After", seconds);
      res.setHeader("Cache-Control", "no-store");
      const error = new HttpError(429, `尝试过多，请在 ${seconds} 秒后重试`);
      Object.assign(error, { retryAfterSeconds: seconds });
      return error;
    };
    try {
      const remaining = await limiter.remaining([account, source]);
      if (remaining) throw cooldown(remaining);
      res.locals.authProtectionSuccess = () => limiter.reset(account);
      await handler(req, res, next);
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 429
      ) {
        const seconds = await limiter.failure([
          { key: account, threshold: 5 },
          { key: source, threshold: 25, idleResetMs: 600000 },
        ]);
        if (seconds) return next(cooldown(seconds));
      }
      next(error);
    }
  };
}
