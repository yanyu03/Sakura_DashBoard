/** Credential-free local entry using the same business application as the Worker. */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import svgCaptcha from "svg-captcha";
import { createServer as createViteServer } from "vite";
import { createApplication } from "../server/application";
import { LEGACY_SCHEMA_SQL } from "../server/database/legacySchema";
import { migrateDatabase } from "../server/database/migrations";

const directory = path.resolve(process.env.SAKURA_DATA_DIR || ".local-data/portfolio");
const port = Number(process.env.PORT || 3000);
if (!Number.isSafeInteger(port) || port < 1 || port > 65535)
  throw Error("PORT must be an integer between 1 and 65535");
process.env.COOKIE_SECURE = "false";
process.env.SAKURA_DEMO_MODE = "false";
fs.mkdirSync(directory, { recursive: true });
const file = path.join(directory, "sakura_edu.sqlite");
const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 3000");
db.exec(LEGACY_SCHEMA_SQL);
migrateDatabase(db, file);
const app = createApplication(db, svgCaptcha, false, false, undefined, "SQLite");
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "spa",
});
app.use(vite.middlewares);
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`[SakuraEdu] Local SQLite preview: http://127.0.0.1:${port}/?design=1.0Sakura`);
  console.log("An empty installation has no default account; register its first administrator.");
});
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await vite.close();
  db.close();
}
process.once("SIGINT", () => void close());
process.once("SIGTERM", () => void close());
