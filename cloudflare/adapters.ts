import type { DatabaseConnection, CaptchaProvider } from "../server/dbContract";
import { randomBytes, randomInt } from "node:crypto";

export class DurableSqlite implements DatabaseConnection {
  constructor(private storage: DurableObjectStorage) {}
  private query(sql: string, args: unknown[]) {
    try {
      return this.storage.sql
        .exec(sql, ...(args as SqlStorageValue[]))
        .toArray();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      const error = new Error(message) as Error & { code?: string };
      if (/UNIQUE constraint/.test(message))
        error.code = "SQLITE_CONSTRAINT_UNIQUE";
      else if (/FOREIGN KEY constraint/.test(message))
        error.code = "SQLITE_CONSTRAINT_FOREIGNKEY";
      else if (/CHECK constraint/.test(message))
        error.code = "SQLITE_CONSTRAINT_CHECK";
      else if (/NOT NULL constraint/.test(message))
        error.code = "SQLITE_CONSTRAINT_NOTNULL";
      throw error;
    }
  }
  prepare(sql: string) {
    return {
      all: (...args: unknown[]) => this.query(sql, args),
      get: (...args: unknown[]) => this.query(sql, args)[0],
      run: (...args: unknown[]) => {
        this.query(sql, args);
        const result = this.storage.sql
          .exec<{
            n: number;
            id: number;
          }>("SELECT changes() AS n,last_insert_rowid() AS id")
          .one();
        return { changes: result.n, lastInsertRowid: result.id };
      },
    };
  }
  transaction<T>(callback: () => T) {
    return () => this.storage.transactionSync(callback);
  }
}

function svg(text: string) {
  const letters = text
    .split("")
    .map(
      (letter, i) =>
        `<text x="${18 + i * 24}" y="34" transform="rotate(${randomInt(-12, 13)} ${18 + i * 24} 34)" fill="#194b3a" font-family="sans-serif" font-size="26" font-weight="bold">${letter}</text>`,
    )
    .join("");
  const noise = Array.from(
    { length: 4 },
    () =>
      `<path d="M${randomInt(0, 160)} ${randomInt(0, 48)}L${randomInt(0, 160)} ${randomInt(0, 48)}" stroke="#9dafaa" fill="none"/>`,
  ).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="170" height="48" viewBox="0 0 170 48"><rect width="170" height="48" rx="6" fill="#edf6ef"/>${noise}${letters}</svg>`;
}
export const edgeCaptcha: CaptchaProvider = {
  create() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
      text = Array.from(
        randomBytes(4),
        (n) => alphabet[n % alphabet.length],
      ).join("");
    return { text, data: svg(text) };
  },
  createMathExpr() {
    const a = randomInt(1, 10),
      b = randomInt(1, 10);
    return { text: String(a + b), data: svg(`${a}+${b}=?`) };
  },
};
