import fs from "node:fs";
import { tidbOptions } from "./tidb-config";
import { TiDBDatabase } from "../server/tidb/database";
import { TiDBHttpPool } from "../server/tidb/http";
import { verificationFetch } from "./http-verification-transport";
import { readLocalSecret } from "./private-secrets";
/** Same HTTPS transport and restricted database account as the test Worker. */
export function tidbTestDatabase(
  database = process.env.TIDB_DATABASE || "sakura_migration_20261029",
) {
  if (!database.startsWith("sakura_migration_"))
    throw Error("Synthetic fixtures cannot use production databases");
  const options = tidbOptions(database);
  const runtime = readLocalSecret(
    ".local-data/tidb-runtime-" + database + ".json",
  );
  const url = new URL(
    "mysql://" + options.host + ":" + options.port + "/" + database,
  );
  url.username = runtime.login;
  url.password = runtime.password;
  const pool = Object.assign(new TiDBHttpPool(url.href, verificationFetch), {
    end: async () => {},
  });
  return { pool, db: new TiDBDatabase(pool) };
}
