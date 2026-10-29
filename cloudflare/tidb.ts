import { createServer } from "node:http";
import { handleAsNodeRequest } from "cloudflare:node";
import { createApplication } from "../server/application";
import { TiDBDatabase } from "../server/tidb/database";
import { TiDBHttpPool } from "../server/tidb/http";
import { edgeCaptcha } from "./adapters";
/** Request-owned clients: no stale TCP socket or shared auth state across invocations. */
export async function tidbRequest(
  request: Request,
  url: string,
  diagnostics = false,
): Promise<Response> {
  const server = createServer(
    createApplication(
      new TiDBDatabase(new TiDBHttpPool(url)),
      edgeCaptcha,
      true,
      diagnostics,
    ),
  );
  try {
    server.listen(0);
    const address = server.address();
    if (!address || typeof address === "string")
      throw Error("HTTP adapter unavailable");
    return await handleAsNodeRequest(address.port, request);
  } finally {
    server.close();
  }
}
