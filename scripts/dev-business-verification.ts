import fs from "node:fs";
import path from "node:path";
fs.mkdirSync(".local-data", { recursive: true });
const directory = fs.mkdtempSync(
  path.resolve(".local-data", "browser-business-"),
);
process.env.SAKURA_DATA_DIR = directory;
process.env.SAKURA_DEMO_MODE = "true";
process.env.PORT = "3002";
process.env.DISABLE_HMR = "true";
const { sqliteDb } = await import("../server/sqliteDb");
const { installBusinessFixtures } = await import("./test-fixtures");
installBusinessFixtures(sqliteDb);
console.log(`Disposable browser database: ${directory}`);
await import("../server");
