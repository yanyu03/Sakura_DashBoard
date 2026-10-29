/** Freeze the already-deployed v15 app before the final consistent export. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const workspace = process.cwd(),
  directory = path.resolve(".local-data", "maintenance-v15");
if (!directory.startsWith(workspace + path.sep))
  throw Error("Unexpected maintenance checkout location");
fs.mkdirSync(directory, { recursive: true });
const archiveFile = path.join(directory, "source.tar");
execFileSync(
  "git",
  ["archive", "--format=tar", "--output", archiveFile, "9fab38a"],
  { stdio: "pipe" },
);
execFileSync("tar", ["-xf", archiveFile, "-C", directory], { stdio: "pipe" });
const sourceFile = path.join(directory, "cloudflare/worker.ts");
let source = fs.readFileSync(sourceFile, "utf8");
if (!source.includes("export default {"))
  throw Error("Frozen deployment source did not match");
source =
  source.replace("export default {", "const originalHandler = {") +
  `\nexport default {async fetch(request:Request,env:Env){if(request.url.includes('/api/'))return Response.json({code:503,success:false,data:null,message:'数据库迁移中，请稍后刷新。已有数据已备份。'},{status:503,headers:{'Retry-After':'30','Cache-Control':'no-store','X-Sakura-Maintenance':'migration'}});return originalHandler.fetch(request,env)}};\n`;
fs.writeFileSync(sourceFile, source);
// Wrangler accepts JSONC; reuse the parsed runtime-free configuration from the frozen commit.
const parse = JSON.parse(
  fs
    .readFileSync(path.join(directory, "wrangler.jsonc"), "utf8")
    .replace(/,\s*([}\]])/g, "$1"),
);
parse.main = sourceFile;
parse.assets.directory = path.join(workspace, "dist");
parse.alias = { "iconv-lite": path.join(directory, "cloudflare/utf8.ts") };
const config = path.join(directory, "maintenance.jsonc");
fs.writeFileSync(config, JSON.stringify(parse, null, 2));
const env = {
  ...process.env,
  HTTP_PROXY: "",
  HTTPS_PROXY: "",
  ALL_PROXY: "",
  NO_PROXY: "*",
};
try {
  console.log(
    execFileSync(
      process.execPath,
      ["node_modules/wrangler/bin/wrangler.js", "deploy", "--config", config],
      {
        encoding: "utf8",
        env,
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 120000,
      },
    ),
  );
} catch (error: any) {
  console.error(String(error.stderr || error.stdout || error.message));
  process.exit(1);
}
