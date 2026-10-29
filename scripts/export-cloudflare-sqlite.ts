/** Operator-only backup. No application SQL API or plaintext credentials. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const account = "3db21a9be03258f819017ca5c2b055d6";
const output = path.resolve(
  ".local-data",
  "tidb-migration",
  new Date().toISOString().replaceAll(":", "-"),
);
const env = {
  ...process.env,
  HTTP_PROXY: "",
  HTTPS_PROXY: "",
  ALL_PROXY: "",
  NO_PROXY: "*",
};
const authRaw = execFileSync(
  process.execPath,
  ["node_modules/wrangler/bin/wrangler.js", "auth", "token", "--json"],
  { encoding: "utf8", env, stdio: ["ignore", "pipe", "pipe"] },
);
const auth = JSON.parse(authRaw.slice(authRaw.indexOf("{")));
const token = auth.token || auth.api_token || auth.access_token;
if (typeof token !== "string")
  throw Error("Wrangler did not return an authentication token");
async function api(route: string, body?: unknown) {
  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" + account + route,
    {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30000),
    },
  );
  const data = (await response.json()) as any;
  if (!response.ok || data.success === false || data.error)
    throw Error(
      "Cloudflare backup request failed (" +
        response.status +
        "): " +
        (data.errors?.[0]?.code || "query failure"),
    );
  return data.result ?? data;
}
const namespaces = await api("/workers/durable_objects/namespaces");
const namespace = namespaces.find(
  (n: any) => n.script === "sakura-dashboard" && n.class === "SakuraSchool",
);
if (!namespace) throw Error("Expected SakuraSchool namespace was not found");
async function query(sql: string) {
  return (
    await api(
      "/workers/durable_objects/namespaces/" + namespace.id + "/query/v2",
      {
        durable_object_name: "school",
        jurisdiction: "none",
        queries: [{ sql }],
      },
    )
  ).results[0];
}
const meta = await query(
  "SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name<>'cloud_schema_meta' AND sql IS NOT NULL ORDER BY type,name",
);
const definitions = meta.rows.map((r: unknown[]) =>
  Object.fromEntries(meta.columns.map((c: string, i: number) => [c, r[i]])),
);
const tables = definitions.filter((d: any) => d.type === "table");
const values: Record<string, unknown[]> = {};
for (let start = 0; start < tables.length; start += 8) {
  const group = tables.slice(start, start + 8);
  const batch = await api(
    "/workers/durable_objects/namespaces/" + namespace.id + "/query/v2",
    {
      durable_object_name: "school",
      jurisdiction: "none",
      queries: group.map((t: any) => ({
        sql: 'SELECT * FROM "' + t.name + '"',
      })),
    },
  );
  for (let i = 0; i < group.length; i++) {
    const result = batch.results[i];
    values[group[i].name] = result.rows.map((r: unknown[]) =>
      Object.fromEntries(
        result.columns.map((c: string, j: number) => [c, r[j]]),
      ),
    );
  }
  console.log(
    "Backed up table batch " +
      (start + 1) +
      "-" +
      Math.min(start + 8, tables.length),
  );
}
const snapshot = {
  exportedAt: new Date().toISOString(),
  source: "cloudflare:sakura-dashboard/SakuraSchool/school",
  definitions,
  tables: values,
};
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, "source.json"), JSON.stringify(snapshot));
fs.writeFileSync(
  ".local-data/latest-tidb-export.json",
  JSON.stringify({ directory: output }, null, 2),
);
console.log(
  JSON.stringify({
    backupSaved: true,
    tableCount: tables.length,
    rowCounts: Object.fromEntries(
      Object.entries(snapshot.tables).map(([k, v]: [string, any]) => [
        k,
        v.length,
      ]),
    ),
  }),
);
