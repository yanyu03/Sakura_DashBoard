import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { tidbPool, tidbOptions } from "./tidb-config";
const database = process.env.TIDB_DATABASE || "sakura_migration_20261029",
  file = ".local-data/tidb-runtime-" + database + ".json";
if (!/^[a-z][a-z0-9_]+$/.test(database)) throw Error("Invalid database name");
const settings = tidbOptions(database);
const pool = tidbPool(database);
const runtime = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, "utf8"))
  : {
      user: "sk_" + randomBytes(4).toString("hex"),
      password: randomBytes(32).toString("base64url"),
    };
if (runtime.user.length > 15) {
  runtime.user = "sk_" + randomBytes(4).toString("hex");
  runtime.password = randomBytes(32).toString("base64url");
}
runtime.login = settings.user.includes(".")
  ? settings.user.slice(0, settings.user.lastIndexOf(".") + 1) + runtime.user
  : runtime.user;
fs.writeFileSync(file, JSON.stringify(runtime));
try {
  await pool.query("CREATE USER IF NOT EXISTS ?@'%' IDENTIFIED BY ?", [
    runtime.login,
    runtime.password,
  ]);
  await pool.query(
    "ALTER USER ?@'%' IDENTIFIED WITH mysql_native_password BY ?",
    [runtime.login, runtime.password],
  );
  await pool.query(
    "GRANT SELECT,INSERT,UPDATE,DELETE ON `" + database + "`.* TO ?@'%'",
    [runtime.login],
  );
} catch (error: any) {
  throw Error("Runtime account provisioning failed [" + error.code + "]");
} finally {
  await pool.end();
}
console.log(
  JSON.stringify({
    provisioned: true,
    database,
    runtimePrivileges: "SELECT INSERT UPDATE DELETE only",
  }),
);
