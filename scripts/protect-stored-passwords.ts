import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { tidbOptions } from "./tidb-config";
import { readLocalSecret, writeLocalSecret } from "./private-secrets";
import { operatorPasswordPolicy } from "./password-policy-secret";
import { TiDBHttpPool } from "../server/tidb/http";
import {
  protectStoredPassword,
  passwordNeedsUpgrade,
} from "../server/passwords";
import { verificationFetch } from "./http-verification-transport";
const database = process.env.TIDB_DATABASE || "sakura_edu_prod_20261029";
if (!/^sakura_(edu_prod_|migration_)[a-z0-9_]+$/.test(database))
  throw Error("Explicit Sakura database required");
const staging = database.startsWith("sakura_migration_"),
  policy = operatorPasswordPolicy(staging ? "staging" : "production");
const runtime = readLocalSecret(
    ".local-data/tidb-runtime-" + database + ".json",
  ),
  options = tidbOptions(database);
const url = new URL(
  "mysql://" + options.host + ":" + options.port + "/" + database,
);
url.username = runtime.login;
url.password = runtime.password;
const pool = new TiDBHttpPool(url.href, verificationFetch);
try {
  const [values] = await pool.query(
    "SELECT id,password_hash FROM faculty_users",
  );
  if (!Array.isArray(values)) throw Error("Unexpected account result");
  const rows = values.map((row) => {
    if (typeof row.id !== "string" || typeof row.password_hash !== "string")
      throw Error("Invalid account result");
    return {
      id: row.id,
      password_hash: row.password_hash,
      protected: protectStoredPassword(row.password_hash, policy),
    };
  });
  if (!process.argv.includes("--apply"))
    console.log(
      JSON.stringify({
        dryRun: true,
        accounts: rows.length,
        toProtect: rows.filter((row) => row.protected !== row.password_hash)
          .length,
      }),
    );
  else {
    writeLocalSecret(
      ".local-data/password-protection-backup-" + randomUUID() + ".json",
      { createdAt: new Date().toISOString(), database, rows: values },
    );
    let updated = 0;
    for (const row of rows) {
      if (row.protected === row.password_hash) continue;
      const [result] = await pool.query(
        "UPDATE faculty_users SET password_hash=? WHERE id=? AND password_hash=?",
        [row.protected, row.id, row.password_hash],
      );
      if (Array.isArray(result)) throw Error("Unexpected mutation result");
      updated += result.affectedRows;
    }
    const [after] = await pool.query("SELECT password_hash FROM faculty_users");
    if (
      !Array.isArray(after) ||
      after.some(
        (row) =>
          !row.password_hash.startsWith("scrypt$v2$") ||
          row.password_hash.split("$")[6] !== policy.current,
      )
    )
      throw Error("Account protection verification incomplete");
    const report = {
      testedAt: new Date().toISOString(),
      database,
      accounts: after.length,
      updated,
      allHashesPeppered: true,
      strengthUpgradePending: after.filter((row) =>
        passwordNeedsUpgrade(row.password_hash, policy),
      ).length,
      plaintextPasswordsRecovered: false,
      backupEncrypted: true,
    };
    fs.mkdirSync("docs/verification/security", { recursive: true });
    fs.writeFileSync(
      "docs/verification/security/" +
        (staging ? "staging-" : "") +
        "password-protection.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report));
  }
} catch (error: any) {
  console.error({
    event: "password_protection_failed",
    code: /^[A-Z0-9_]+$/.test(String(error?.code)) ? error.code : "FAILED",
  });
  process.exitCode = 1;
}
