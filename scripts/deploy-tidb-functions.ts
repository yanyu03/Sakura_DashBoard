/** Operator-only deployment of a token-gated Worker, never the production Worker. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { tidbOptions } from "./tidb-config";
const target = JSON.parse(
  fs.readFileSync(".local-data/functional-target.json", "utf8"),
);
if (!target.database.startsWith("sakura_migration_functional_"))
  throw Error("Functional staging database required");
const production = JSON.parse(
  fs.readFileSync("wrangler.jsonc", "utf8").replace(/,\s*([}\]])/g, "$1"),
);
const hostname = production.routes.find(
  (route: any) => route.custom_domain,
)?.pattern;
if (!/^[a-z0-9.-]+$/i.test(hostname || ""))
  throw Error("Expected a custom-domain hostname");
const directory = path.resolve(".local-data", "tidb-preview");
fs.mkdirSync(directory, { recursive: true });
const file = path.join(directory, "wrangler.jsonc");
const config = {
  name: "sakura-tidb-preview",
  account_id: production.account_id,
  main: path.resolve("cloudflare/tidb-preview.ts"),
  compatibility_date: production.compatibility_date,
  compatibility_flags: ["nodejs_compat"],
  workers_dev: false,
  preview_urls: false,
  routes: [
    {
      pattern: hostname + "/__tidb-preview/*",
      zone_name: hostname.split(".").slice(-2).join("."),
    },
  ],
  placement: production.placement,
  vars: {
    NODE_ENV: "production",
    COOKIE_SECURE: "true",
    SAKURA_DEMO_MODE: "false",
    SAKURA_ALLOW_SQL_WRITES: "false",
    SAKURA_PREVIEW_DIAGNOSTICS: "true",
  },
  observability: { enabled: true, head_sampling_rate: 1 },
  alias: { "iconv-lite": path.resolve("cloudflare/utf8.ts") },
};
fs.writeFileSync(file, JSON.stringify(config, null, 2));
const cleanEnv = {
  ...process.env,
  HTTP_PROXY: "",
  HTTPS_PROXY: "",
  ALL_PROXY: "",
  NO_PROXY: "*",
};
if (process.argv.includes("--cleanup")) {
  execFileSync(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "delete",
      "sakura-tidb-preview",
      "--force",
      "--config",
      file,
    ],
    { env: cleanEnv, stdio: "inherit" },
  );
} else {
  execFileSync(
    process.execPath,
    ["node_modules/tsx/dist/cli.mjs", "scripts/provision-tidb-runtime.ts"],
    {
      env: { ...process.env, TIDB_DATABASE: target.database },
      stdio: "inherit",
    },
  );
  const options = tidbOptions(target.database),
    runtime = JSON.parse(
      fs.readFileSync(
        ".local-data/tidb-runtime-" + target.database + ".json",
        "utf8",
      ),
    );
  const url = new URL(
    "mysql://" + options.host + ":" + options.port + "/" + target.database,
  );
  url.username = runtime.login;
  url.password = runtime.password;
  for (const [args, input] of [
    [["secret", "put", "TIDB_DATABASE_URL", "--config", file], url.href],
    [["secret", "put", "SAKURA_PREVIEW_TOKEN", "--config", file], target.token],
    [["deploy", "--config", file], undefined],
  ] as [string[], string | undefined][]) {
    try {
      console.log(
        execFileSync(
          process.execPath,
          ["node_modules/wrangler/bin/wrangler.js", ...args],
          {
            input,
            env: cleanEnv,
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
            timeout: 120000,
          },
        ),
      );
    } catch (error: any) {
      console.error(
        String(error.stderr || error.stdout || "Preview deployment failed")
          .replaceAll(url.href, "[database URL]")
          .replaceAll(runtime.password, "[redacted]")
          .replaceAll(target.token, "[redacted]"),
      );
      process.exitCode = 1;
      break;
    }
  }
}
