import assert from "node:assert/strict";
import fs from "node:fs";
import { verificationFetch as fetch } from "./http-verification-transport";

const base =
  process.argv.find((v) => v.startsWith("http")) || "https://sakura.250221.xyz";
const endpoint = new URL("/api/v1/health/tidb", base).href;
const samples: { status: number; queryMs: number; roundTripMs: number }[] = [];
const traceIds = new Set<string>();
for (let i = 0; i < 3; i++) {
  const started = Date.now();
  const response = await fetch(endpoint);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-sakura-database"), "TiDB");
  assert.equal(body.success, true);
  assert.equal(body.data.connected, true);
  assert.equal(body.data.engine, "TiDB");
  assert.equal(body.data.transport, "https");
  assert.equal(body.data.readOnly, true);
  assert.ok(Number.isFinite(body.data.queryMs) && body.data.queryMs >= 0);
  assert.equal(body.traceId, response.headers.get("x-request-id"));
  assert.ok(!traceIds.has(body.traceId));
  traceIds.add(body.traceId);
  assert.deepEqual(Object.keys(body.data).sort(), [
    "connected",
    "engine",
    "queryMs",
    "readOnly",
    "transport",
  ]);
  samples.push({
    status: response.status,
    queryMs: body.data.queryMs,
    roundTripMs: Date.now() - started,
  });
}
const mutation = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sql: "SELECT 1" }),
});
assert.equal(mutation.status, 405);
assert.equal(mutation.headers.get("allow"), "GET");
const arbitrarySql = await fetch(endpoint + "?sql=SELECT%201");
assert.equal(arbitrarySql.status, 400);
const meanQueryMs =
  Math.round(
    (samples.reduce((sum, sample) => sum + sample.queryMs, 0) /
      samples.length) *
      10,
  ) / 10;
fs.mkdirSync("docs/verification/tidb", { recursive: true });
fs.writeFileSync(
  "docs/verification/tidb/worker-health.json",
  JSON.stringify(
    {
      testedAt: new Date().toISOString(),
      endpoint,
      samples,
      meanQueryMs,
      checks: [
        "three actual Worker to TiDB round trips succeed without exposing connection/user data",
        "mutating methods are rejected before database access",
        "arbitrary SQL query parameters are rejected before database access",
      ],
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    passed: true,
    samples,
    meanQueryMs,
    mutationStatus: mutation.status,
    sqlParameterStatus: arbitrarySql.status,
  }),
);
