import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import {
  hashPassword,
  verifyPassword,
  passwordNeedsUpgrade,
  protectStoredPassword,
  passwordPolicyFromSecret,
} from "../server/passwords";
import { databaseCredentialUrl } from "../server/tidb/credentials";
import { TiDBHttpPool } from "../server/tidb/http";
import { secureRequest, secureResponse } from "../cloudflare/security";
import { writeLocalSecret, readLocalSecret } from "./private-secrets";
const checks: string[] = [];
const policy = passwordPolicyFromSecret(
  JSON.stringify({
    current: "p1",
    keys: { p1: randomBytes(32).toString("base64url") },
  }),
);
const password = "Unicode 密码 / 🌸 test",
  encoded = hashPassword(password, policy);
async function check(name: string, fn: () => unknown | Promise<unknown>) {
  await fn();
  checks.push(name);
  console.log("PASS " + name);
}
await check(
  "versioned salted scrypt uses the strengthened bounded work factor and verifies Unicode",
  () => {
    assert.ok(encoded.startsWith("scrypt$v2$16384$8$5$"));
    assert.equal(verifyPassword(password, encoded, policy), true);
    assert.equal(verifyPassword("wrong", encoded, policy), false);
    assert.notEqual(encoded, hashPassword(password, policy));
    assert.ok(!encoded.includes(password));
    assert.ok(!encoded.includes(policy.keys.p1));
  },
);
await check(
  "database hashes cannot be replayed as passwords and missing or incorrect peppers fail closed",
  () => {
    assert.equal(verifyPassword(encoded, encoded, policy), false);
    assert.equal(verifyPassword(password, encoded), false);
    assert.equal(
      verifyPassword(password, encoded, {
        current: "p1",
        keys: { p1: randomBytes(32).toString("base64url") },
      }),
      false,
    );
  },
);
await check(
  "existing hashes can be protected without recovering passwords and retain upgrade eligibility",
  () => {
    const salt = randomBytes(16).toString("hex"),
      old =
        "scrypt$" + salt + "$" + scryptSync(password, salt, 64).toString("hex");
    assert.ok(verifyPassword(password, old, policy));
    const protectedHash = protectStoredPassword(old, policy);
    assert.ok(verifyPassword(password, protectedHash, policy));
    assert.equal(passwordNeedsUpgrade(protectedHash, policy), true);
    assert.equal(passwordNeedsUpgrade(encoded, policy), false);
    assert.ok(!protectedHash.includes(old.split("$")[2]));
  },
);
await check(
  "pepper rotation supports retained keys and requests an upgrade to the current key",
  () => {
    const next = {
      current: "p2",
      keys: { ...policy.keys, p2: randomBytes(32).toString("base64url") },
    };
    assert.ok(verifyPassword(password, encoded, next));
    assert.ok(passwordNeedsUpgrade(encoded, next));
    assert.equal(
      verifyPassword(password, hashPassword(password, next), policy),
      false,
    );
  },
);
await check(
  "strict production policy rejects legacy and unpeppered downgrade hashes",
  () => {
    const strict = { ...policy, requireProtected: true };
    const salt = randomBytes(16).toString("hex"),
      old =
        "scrypt$" + salt + "$" + scryptSync(password, salt, 64).toString("hex");
    assert.equal(verifyPassword(password, old, strict), false);
    assert.equal(
      verifyPassword(password, hashPassword(password), strict),
      false,
    );
    assert.ok(
      verifyPassword(password, protectStoredPassword(old, policy), strict),
    );
  },
);
await check(
  "malformed digests and attacker supplied work factors are rejected before hashing",
  () => {
    for (const value of [
      "",
      password,
      "scrypt$bad$bad",
      encoded.replace("$16384$", "$1073741824$"),
      encoded + "suffix",
    ])
      assert.equal(verifyPassword(password, value, policy), false);
    assert.throws(
      () => passwordPolicyFromSecret(undefined),
      /configuration unavailable/,
    );
    assert.throws(
      () => passwordPolicyFromSecret("{not-json"),
      /configuration unavailable/,
    );
  },
);
await check(
  "operator secrets use DPAPI and migrate private legacy JSON without retaining plaintext",
  () => {
    fs.mkdirSync(".local-data", { recursive: true });
    const directory = fs.mkdtempSync(
        path.resolve(".local-data", "secret-test-"),
      ),
      file = path.join(directory, "secret.json"),
      value = {
        password: randomBytes(32).toString("base64url"),
        unicode: "本机秘密",
      };
    writeLocalSecret(file, value);
    assert.deepEqual(readLocalSecret(file), value);
    assert.ok(!fs.readFileSync(file, "utf8").includes(value.password));
    const legacy = path.join(directory, "legacy.json");
    fs.writeFileSync(legacy, JSON.stringify(value));
    assert.deepEqual(readLocalSecret(legacy), value);
    assert.ok(!fs.readFileSync(legacy, "utf8").includes(value.password));
  },
);
const uri = new URL("mysql://gateway.test.tidbcloud.com:4000/sakura_test");
uri.username = "tenant.sk_test";
uri.password = randomBytes(32).toString("base64url");
await check(
  "database descriptors reject root system schemas SSRF hosts downgrade and unsafe options",
  () => {
    assert.equal(databaseCredentialUrl(uri.href).hostname, uri.hostname);
    for (const change of [
      (u: URL) => (u.hostname = "localhost"),
      (u: URL) => (u.hostname = "evil.example"),
      (u: URL) => (u.pathname = "/sys"),
      (u: URL) => (u.username = "tenant.root"),
      (u: URL) => (u.search = "sslMode=DISABLED"),
      (u: URL) => (u.password = "short"),
    ]) {
      const bad = new URL(uri);
      change(bad);
      assert.throws(
        () => databaseCredentialUrl(bad.href),
        (error) =>
          error instanceof Error && !error.message.includes(uri.password),
      );
    }
    assert.throws(() =>
      databaseCredentialUrl(uri.href.replace(/^mysql:/, "http:")),
    );
  },
);
await check(
  "TiDB transport uses only the fixed HTTPS origin and rejects HTTP redirects",
  async () => {
    let captured = false;
    const pool = new TiDBHttpPool(uri.href, async (input, init) => {
      const url = new URL(String(input));
      assert.equal(url.origin, "https://http-" + uri.hostname);
      assert.equal(init?.redirect, "manual");
      assert.ok(!url.username && !url.password);
      captured = true;
      throw new TypeError("synthetic transport failure");
    });
    await assert.rejects(() => pool.query("SELECT 1"));
    assert.ok(captured);
  },
);
await check(
  "HTTP writes and sensitive query strings are rejected while HTTPS responses use HSTS",
  async () => {
    assert.equal(
      secureRequest(
        new Request("http://sakura.test/api/v1/auth/faculty-login", {
          method: "POST",
        }),
      )?.status,
      400,
    );
    const redirect = secureRequest(new Request("http://sakura.test/login"));
    assert.equal(redirect?.status, 308);
    assert.equal(
      redirect?.headers.get("location"),
      "https://sakura.test/login",
    );
    assert.equal(
      secureRequest(
        new Request("https://sakura.test/api/v1/auth/session?password=secret"),
      )?.status,
      400,
    );
    assert.equal(secureRequest(new Request("https://sakura.test/login")), null);
    assert.equal(
      secureResponse(new Response("ok")).headers.get(
        "strict-transport-security",
      ),
      "max-age=31536000",
    );
  },
);
await check(
  "browser call history discards SQL payloads query values passwords and CSRF values",
  async () => {
    const original = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        Response.json({
          code: 200,
          success: true,
          traceId: "synthetic-trace",
          data: { csrfToken: "synthetic-csrf" },
          sqlExecuted: password,
        });
      const { sakuraApi } = await import("../src/services/sakuraApiService");
      await sakuraApi.auth.loginWithCredentials({
        facultyId: "private-email@example.invalid",
        password,
        loginType: "account",
        captchaId: "test",
        captchaAnswer: "test",
      });
      const log = JSON.stringify(sakuraApi.getRecentCallLogs());
      assert.ok(!log.includes(password));
      assert.ok(!log.includes("private-email"));
      assert.ok(!log.includes("synthetic-csrf"));
      assert.ok(sakuraApi.getRecentCallLogs().every((row) => row.sql === ""));
    } finally {
      globalThis.fetch = original;
    }
  },
);
fs.mkdirSync("docs/verification/security", { recursive: true });
fs.writeFileSync(
  "docs/verification/security/hardening.json",
  JSON.stringify(
    { testedAt: new Date().toISOString(), passed: checks.length, checks },
    null,
    2,
  ),
);
