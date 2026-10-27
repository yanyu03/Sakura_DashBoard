export interface DatabaseConnection {
  prepare(sql: string): {
    get(...args: unknown[]): unknown;
    all(...args: unknown[]): unknown[];
    run(...args: unknown[]): {
      changes: number;
      lastInsertRowid: number | bigint;
    };
  };
  transaction<T>(callback: () => T): () => T;
}
export interface CaptchaProvider {
  create(options: Record<string, unknown>): { text: string; data: string };
  createMathExpr(options: Record<string, unknown>): {
    text: string;
    data: string;
  };
}
