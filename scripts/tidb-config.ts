import fs from "node:fs";
import mysql from "mysql2/promise";
import http from "node:http";
import { Duplex } from "node:stream";
/** Operator tools can use the user's already configured HTTP proxy for MySQL TLS. */
function tunnel(host: string, port: number) {
  const proxy = new URL(process.env.HTTPS_PROXY || process.env.HTTP_PROXY!);
  let stream: Duplex;
  const ready = new Promise<import("node:net").Socket>((resolve, reject) => {
    const request = http.request({
      hostname: proxy.hostname,
      port: Number(proxy.port),
      method: "CONNECT",
      path: host + ":" + port,
      timeout: 8000,
    });
    request.on("connect", (response, socket, head) => {
      if (response.statusCode !== 200) {
        socket.destroy();
        return reject(Error("Database proxy connection was rejected"));
      }
      if (head.length) socket.unshift(head);
      resolve(socket);
    });
    request.on("timeout", () =>
      request.destroy(
        Object.assign(Error("Database proxy timeout"), { code: "ETIMEDOUT" }),
      ),
    );
    request.on("error", reject);
    request.end();
  });
  stream = new Duplex({
    read() {},
    write(chunk, encoding, callback) {
      void ready.then(
        (socket) => socket.write(chunk, encoding, callback),
        callback,
      );
    },
    final(callback) {
      void ready.then((socket) => socket.end(callback), callback);
    },
    destroy(error, callback) {
      void ready.then(
        (socket) => socket.destroy(),
        () => {},
      );
      callback(error);
    },
  });
  void ready.then(
    (socket) => {
      socket.on("data", (chunk) => stream.push(chunk));
      socket.on("end", () => stream.push(null));
      socket.on("close", () => stream.destroy());
      socket.on("error", (error) => stream.destroy(error));
    },
    (error) => stream.destroy(error),
  );
  return stream;
}
/** Explicit operator supplied JDBC credential file, never copied into source or browser storage. */
export function tidbOptions(
  database = process.env.TIDB_DATABASE || "sakura_migration_20261029",
) {
  const file =
    process.env.TIDB_CREDENTIAL_FILE || "C:/Users/admin/Desktop/tidb数据库.txt";
  const u = new URL(
    fs
      .readFileSync(file, "utf8")
      .trim()
      .replace(/^jdbc:/, ""),
  );
  if (
    u.protocol !== "mysql:" ||
    !u.hostname.endsWith(".tidbcloud.com") ||
    !u.username ||
    !u.password
  )
    throw Error("Expected a TiDB Cloud JDBC URL with credentials");
  if (
    ["mysql", "sys", "information_schema", "performance_schema"].includes(
      database.toLowerCase(),
    )
  )
    throw Error("System schemas cannot be migration targets");
  const port = Number(u.port) || 4000;
  return {
    host: u.hostname,
    port,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database,
    ssl: {
      rejectUnauthorized: true,
      verifyIdentity: true,
      minVersion: "TLSv1.2",
    },
    connectTimeout: 15000,
    multipleStatements: false,
    decimalNumbers: true,
    dateStrings: true,
    charset: "utf8mb4",
    ...((process.env.HTTPS_PROXY || process.env.HTTP_PROXY) &&
    process.env.TIDB_USE_PROXY !== "false"
      ? { stream: () => tunnel(u.hostname, port) }
      : {}),
  };
}
export function tidbPool(database?: string) {
  const pool = mysql.createPool({
    ...tidbOptions(database),
    connectionLimit: 2,
    maxIdle: 2,
    idleTimeout: 30000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 1000,
    waitForConnections: true,
    queueLimit: 16,
  });
  const acquire = pool.getConnection.bind(pool);
  pool.getConnection = async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await acquire();
      } catch (error: any) {
        if (
          attempt >= 1 ||
          !["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"].includes(error.code)
        )
          throw error;
      }
    }
  };
  // Retry only acquisition, before SQL is sent. A query or commit is never replayed.
  pool.query = (async (sql: any, args?: any) => {
    const connection = await pool.getConnection();
    try {
      return await connection.query(
        typeof sql === "string" ? { sql, timeout: 15000 } : sql,
        args,
      );
    } catch (error: any) {
      if (
        error.fatal ||
        ["PROTOCOL_SEQUENCE_TIMEOUT", "ETIMEDOUT", "ECONNRESET"].includes(
          error.code,
        )
      )
        connection.destroy();
      throw error;
    } finally {
      connection.release();
    }
  }) as typeof pool.query;
  return pool;
}
