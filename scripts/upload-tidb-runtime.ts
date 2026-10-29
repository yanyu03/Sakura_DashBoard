/** Upload an already provisioned restricted account; no secret in argv or stdout. */
import { execFileSync } from "node:child_process";
import { readLocalSecret } from "./private-secrets";
import { tidbOptions } from "./tidb-config";
import { databaseCredentialUrl } from "../server/tidb/credentials";
try {
  const database = process.env.TIDB_DATABASE;
  if (!database || !/^sakura_[a-z0-9_]+$/.test(database))
    throw Error("Set an explicit Sakura target database");
  const options = tidbOptions(database);
  const runtime = readLocalSecret(".local-data/tidb-runtime-" + database + ".json");
  const url = new URL("mysql://" + options.host + ":" + options.port + "/" + database);
  url.username = runtime.login;
  url.password = runtime.password;
  databaseCredentialUrl(url.href);
  console.log(execFileSync(process.execPath, [
    "node_modules/wrangler/bin/wrangler.js", "secret", "put", "TIDB_DATABASE_URL",
  ], { input: url.href, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 120000 }));
} catch {
  console.error({ event: "runtime_secret_upload_failed" });
  process.exitCode = 1;
}
