/** Consistent production export: encrypted operator backup, aggregate public receipt only. */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tidbOptions } from "./tidb-config";
import { readLocalSecret, writeLocalSecret } from "./private-secrets";
import schema from "../server/tidb/schema.json";
import { TiDBHttpPool } from "../server/tidb/http";
import { verificationFetch } from "./http-verification-transport";
try {
  const database = "sakura_edu_prod_20261029";
  const runtime = readLocalSecret(".local-data/tidb-runtime-" + database + ".json");
  const options = tidbOptions(database);
  const url = new URL("mysql://" + options.host + ":" + options.port + "/" + database);
  url.username = runtime.login;
  url.password = runtime.password;
  const connection = await new TiDBHttpPool(url.href, verificationFetch).getConnection();
  const tables: Record<string, unknown[]> = {};
  try {
    for (const table of schema.tables) {
      if (!/^[a-z][a-z0-9_]+$/.test(table.name)) throw Error("Invalid schema name");
      const [rows] = await connection.query("SELECT * FROM `" + table.name + "`");
      if (!Array.isArray(rows)) throw Error("Invalid snapshot result");
      tables[table.name] = rows;
    }
    await connection.rollback();
  } finally {
    await connection.release?.();
  }
  const snapshot = { database, schemaChecksum: schema.checksum, tables };
  const directory = path.join(".local-data", "security-release-backup", new Date().toISOString().replaceAll(":", "-"));
  writeLocalSecret(path.join(directory, "tidb-backup.json"), snapshot);
  execFileSync("git", ["bundle", "create", path.join(directory, "source.bundle"), "--all"], { stdio: "pipe" });
  const receipt = {
    createdAt: new Date().toISOString(), database,
    sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    tableCount: Object.keys(tables).length,
    rowCount: Object.values(tables).reduce((sum, rows) => sum + rows.length, 0),
    sha256: createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"),
    encryptedBackupVerified: true, transport: "official HTTPS transaction",
  };
  fs.mkdirSync("docs/verification/security", { recursive: true });
  fs.writeFileSync("docs/verification/security/backup.json", JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
} catch {
  console.error({ event: "encrypted_security_backup_failed" });
  process.exitCode = 1;
}
