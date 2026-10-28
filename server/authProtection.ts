import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import type { DatabaseConnection } from "./dbContract";
import { HttpError } from "./http";
export const COOLDOWNS = [30, 60, 120, 900, 10800] as const;
export const protectionSql = `CREATE TABLE auth_protection(bucket_hash TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0 CHECK(failures>=0),level INTEGER NOT NULL DEFAULT 0 CHECK(level BETWEEN 0 AND 5),blocked_until INTEGER NOT NULL DEFAULT 0 CHECK(blocked_until>=0),updated_at INTEGER NOT NULL)`;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const protectionChecksum = hash(protectionSql);
export function applyAuthProtectionSchema(db: DatabaseConnection) {
  const old = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=13")
    .get() as { checksum: string } | undefined;
  if (old) {
    if (old.checksum !== protectionChecksum)
      throw new Error("Migration 13 checksum mismatch");
    return;
  }
  db.transaction(() => {
    db.prepare(protectionSql).run();
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(13,?,?)",
    ).run("persistent-authentication-cooldowns", protectionChecksum);
  })();
}
type State = {
  failures: number;
  level: number;
  blocked_until: number;
  updated_at: number;
};
export class AuthFailureLimiter {
  constructor(
    private db: DatabaseConnection,
    private now = () => Date.now(),
  ) {}
  state(key: string): State {
    return (
      (this.db
        .prepare(
          "SELECT failures,level,blocked_until,updated_at FROM auth_protection WHERE bucket_hash=?",
        )
        .get(hash(key)) as State) || {
        failures: 0,
        level: 0,
        blocked_until: 0,
        updated_at: 0,
      }
    );
  }
  remaining(keys: string[]) {
    return Math.max(
      0,
      ...keys.map((key) =>
        Math.ceil((this.state(key).blocked_until - this.now()) / 1000),
      ),
    );
  }
  failure(buckets: { key: string; threshold: number; idleResetMs?: number }[]) {
    return this.db.transaction(() => {
      const time = this.now();
      let until = 0;
      for (const { key, threshold, idleResetMs } of buckets) {
        const prior = this.state(key);
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
        this.db
          .prepare(
            "INSERT INTO auth_protection(bucket_hash,failures,level,blocked_until,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(bucket_hash) DO UPDATE SET failures=excluded.failures,level=excluded.level,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at",
          )
          .run(hash(key), failures, level, blocked, time);
        until = Math.max(until, blocked);
      }
      return Math.max(0, Math.ceil((until - time) / 1000));
    })();
  }
  reset(key: string) {
    this.db
      .prepare("DELETE FROM auth_protection WHERE bucket_hash=?")
      .run(hash(key));
  }
}
/** Synchronous auth handlers: reject before password hashing and atomically record failures. */
export function withAuthProtection(
  db: DatabaseConnection,
  kind: "login" | "register",
  handler: RequestHandler,
  trustCloudflare = false,
): RequestHandler {
  const limiter = new AuthFailureLimiter(db);
  return (req, res, next) => {
    const input = String(
      (kind === "login" ? req.body?.facultyId : req.body?.facultyCode) || "",
    )
      .trim()
      .toLowerCase()
      .slice(0, 128);
    // Resolve aliases to one account bucket; the source bucket cannot be reset with another valid account.
    const user =
      kind === "login"
        ? (db
            .prepare(
              "SELECT id FROM faculty_users WHERE faculty_code=? COLLATE NOCASE OR email=? COLLATE NOCASE OR phone=?",
            )
            .get(input, input, input) as { id: string } | undefined)
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
      const remaining = limiter.remaining([account, source]);
      if (remaining) throw cooldown(remaining);
      res.locals.authProtectionSuccess = () => limiter.reset(account);
      handler(req, res, next);
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 429
      ) {
        const seconds = limiter.failure([
          { key: account, threshold: 5 },
          { key: source, threshold: 25, idleResetMs: 600000 },
        ]);
        if (seconds) return next(cooldown(seconds));
      }
      next(error);
    }
  };
}
