/** Compare source and built assets against operator values without printing those values. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { readLocalSecret, readLocalTextSecret } from "./private-secrets";
const secrets: string[] = [];
function add(value: unknown) {
  if (typeof value === "string" && value.length >= 12)
    secrets.push(value, encodeURIComponent(value));
}
let protectedFiles = 0;
function inspect(file: string) {
  const envelope = JSON.parse(fs.readFileSync(file, "utf8"));
  if (envelope.version !== 1 || envelope.protection !== "windows-dpapi-current-user")
    throw Error("Operator credential protection is missing");
  protectedFiles++;
}
const privateRoot = ".local-data";
for (const name of fs.readdirSync(privateRoot)) {
  if (!/^(tidb-runtime-.*|auth-password-peppers-.*|functional-target)\.json$/.test(name)) continue;
  const file = path.join(privateRoot, name), value = readLocalSecret(file);
  inspect(file);
  add(value.password);
  add(value.token);
  for (const key of Object.values(value.keys || {})) add(key);
}
for (const name of ["cloudflare-initial-admin.txt", "cloudflare-admin-hash.txt"]) {
  const file = path.join(privateRoot, name), value = readLocalTextSecret(file);
  inspect(file);
  add(name.includes("initial") ? value.match(/^Password: (.+)$/m)?.[1] : value.trim());
}
const jdbcFile = process.env.TIDB_CREDENTIAL_FILE || "C:/Users/admin/Desktop/tidb数据库.txt";
const jdbc = new URL(fs.readFileSync(jdbcFile, "utf8").trim().replace(/^jdbc:/, ""));
add(decodeURIComponent(jdbc.password));
const source = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" }).trim().split(/\r?\n/);
function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(name) : [name];
  });
}
const assets = walk("dist");
for (const file of new Set([...source, ...assets])) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const content = fs.readFileSync(file, "utf8");
  if (secrets.some(value => content.includes(value)))
    throw Error("Operator credential found in source or asset: " + file);
}
const report = {
  testedAt: new Date().toISOString(), sourceFiles: new Set(source).size,
  builtAssets: assets.length, protectedOperatorFiles: protectedFiles,
  knownSecretValuesAbsent: true,
};
fs.writeFileSync("docs/verification/security/secret-boundary.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
