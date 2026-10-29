/** Secret values travel through stdin only; encrypted operator backup is retained for recovery. */
import { execFileSync } from "node:child_process";
import { operatorPasswordPolicy } from "./password-policy-secret";
import { readLocalSecret, writeLocalSecret } from "./private-secrets";
import { tidbOptions } from "./tidb-config";
import { TiDBHttpPool } from "../server/tidb/http";
import { verificationFetch } from "./http-verification-transport";
const staging = process.argv.includes("--staging"),
  configIndex = process.argv.indexOf("--config");
let policy = operatorPasswordPolicy(
  staging ? "staging" : "production",
  process.argv.includes("--initialize"),
);
if (process.argv.includes("--require-protected")) {
  const database = process.env.TIDB_DATABASE || "sakura_edu_prod_20261029",
    runtime = readLocalSecret(".local-data/tidb-runtime-" + database + ".json"),
    options = tidbOptions(database);
  const url = new URL(
    "mysql://" + options.host + ":" + options.port + "/" + database,
  );
  url.username = runtime.login;
  url.password = runtime.password;
  const [rows] = await new TiDBHttpPool(url.href, verificationFetch).query(
    "SELECT password_hash FROM faculty_users",
  );
  if (
    !Array.isArray(rows) ||
    rows.some(
      (row) =>
        !row.password_hash.startsWith("scrypt$v2$") ||
        row.password_hash.split("$")[6] !== policy.current,
    )
  )
    throw Error(
      "Protect every stored password before enabling strict verification",
    );
  policy = { ...policy, requireProtected: true };
  writeLocalSecret(
    ".local-data/auth-password-peppers-" +
      (staging ? "staging" : "production") +
      ".json",
    policy,
  );
}
const args = [
  "node_modules/wrangler/bin/wrangler.js",
  "secret",
  "put",
  "AUTH_PASSWORD_PEPPERS",
  ...(configIndex >= 0 ? ["--config", process.argv[configIndex + 1]] : []),
];
try {
  console.log(
    execFileSync(process.execPath, args, {
      input: JSON.stringify(policy),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120000,
      env: {
        ...process.env,
        HTTP_PROXY: "",
        HTTPS_PROXY: "",
        ALL_PROXY: "",
        NO_PROXY: "*",
      },
    }),
  );
} catch (error: any) {
  console.error({
    event: "password_policy_upload_failed",
    status: error.status,
  });
  process.exitCode = 1;
}
