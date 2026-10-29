import { createServer } from "node:http";
import { createApplication } from "../server/application";
import { TiDBDatabase } from "../server/tidb/database";
import { tidbPool } from "./tidb-config";
if (
  process.env.TIDB_DATABASE &&
  !process.env.TIDB_DATABASE.startsWith("sakura_migration_")
)
  throw Error("Preview fixtures require an isolated migration database");
const pool = tidbPool();
const app = createApplication(new TiDBDatabase(pool), {
  create: () => ({ text: "2468", data: "<svg/>" }),
  createMathExpr: () => ({ text: "2", data: "<svg/>" }),
});
const server = createServer(app);
server.listen(3018, "127.0.0.1", () => console.log("TiDB staging API on 3018"));
process.on("SIGINT", () => {
  server.close();
  void pool.end();
});
