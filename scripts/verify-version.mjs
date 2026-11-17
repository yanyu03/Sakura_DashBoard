import assert from "node:assert/strict";
import packageMetadata from "../package.json" with { type: "json" };

const baseUrl = (
  process.env.SAKURA_VERSION_BASE_URL || "http://127.0.0.1:3000/api/v1"
).replace(/\/$/, "");
assert.match(packageMetadata.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);

const response = await fetch(`${baseUrl}/meta/version`, {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(5_000),
});
assert.equal(response.status, 200, "version endpoint must return HTTP 200");
assert.equal(response.headers.get("cache-control"), "no-store");

const payload = await response.json();
assert.equal(payload.success, true);
assert.equal(payload.data?.name, "SakuraEdu");
assert.equal(payload.data?.version, packageMetadata.version);
assert.equal(payload.data?.designStandard, "1.0Sakura");
assert.equal(payload.data?.apiVersion, "v1");

console.log(
  `PASS version: ${payload.data.version} / ${payload.data.designStandard} / ${payload.data.apiVersion}`,
);
