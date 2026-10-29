import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import express from "express";
import { createServer } from "node:http";
import { AuthFailureLimiter, COOLDOWNS, applyAuthProtectionSchema, } from "../server/authProtection";
import { registerAuth } from "../server/auth";
import { apiErrorHandler } from "../server/http";
fs.mkdirSync(".local-data", { recursive: true });
const dir = fs.mkdtempSync(path.resolve(".local-data", "protection-test-"));
process.env.SAKURA_DATA_DIR = dir;
process.env.COOKIE_SECURE = "false";
const { sqliteDb: db } = await import("../server/sqliteDb");
const checks: string[] = [];
async function check(name: string, fn: () => unknown | Promise<unknown>) {
    await fn();
    checks.push(name);
    console.log("PASS " + name);
}
let time = 1000000;
const limiter = new AuthFailureLimiter(db, () => time);
await check("five failures escalate through all requested cooldowns", async () => {
    for (const seconds of [...COOLDOWNS, 10800]) {
        for (let n = 1; n <= 5; n++) {
            assert.equal((await limiter.failure([{ key: "unit-account", threshold: 5 }])), n === 5 ? seconds : 0);
        }
        assert.equal((await limiter.remaining(["unit-account"])), seconds);
        time += seconds * 1000;
        assert.equal((await limiter.remaining(["unit-account"])), 0);
    }
});
await check("blocked requests do not extend or increase the cooldown", async () => {
    (await limiter.failure([{ key: "locked", threshold: 1 }]));
    time += 1000;
    assert.equal((await limiter.failure([{ key: "locked", threshold: 1 }])), 29);
    assert.equal((await limiter.state("locked")).level, 1);
});
await check("state survives reopening the database and stores hashed keys", async () => {
    const other = new Database(path.join(dir, "sakura_edu.sqlite"));
    assert.equal((await new AuthFailureLimiter(other, () => time).remaining(["locked"])), 29);
    assert.equal(other
        .prepare("SELECT bucket_hash FROM auth_protection WHERE bucket_hash='locked'")
        .get(), undefined);
    other.close();
});
await check("account reset leaves source protection intact", async () => {
    (await limiter.failure([
        { key: "reset-account", threshold: 1 },
        { key: "shared-source", threshold: 1 },
    ]));
    (await limiter.reset("reset-account"));
    assert.equal((await limiter.remaining(["reset-account"])), 0);
    assert.equal((await limiter.remaining(["shared-source"])), 30);
});
await check("schema migration is idempotent", () => {
    applyAuthProtectionSchema(db);
    assert.equal((db
        .prepare("SELECT COUNT(*) n FROM schema_migrations WHERE version=13")
        .get() as {
        n: number;
    }).n, 1);
});
const app = express();
app.use(express.json());
const provider = {
    create: () => ({ text: "2468", data: "<svg/>" }),
    createMathExpr: () => ({ text: "2", data: "<svg/>" }),
};
registerAuth(app, db, provider);
app.use(apiErrorHandler);
const server = createServer(app);
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${(server.address() as {
    port: number;
}).port}`;
async function login(account = "admin", captchaId = "invalid", answer = "0000", password = "incorrect") {
    return fetch(base + "/api/v1/auth/faculty-login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: base },
        body: JSON.stringify({
            facultyId: account,
            password,
            loginType: "account",
            captchaId,
            captchaAnswer: answer,
        }),
    });
}
try {
    await check("fifth invalid captcha returns 429 and Retry-After immediately", async () => {
        for (let i = 0; i < 4; i++)
            assert.equal((await login()).status, 422);
        const r = await login();
        assert.equal(r.status, 429);
        assert.ok(Number(r.headers.get("retry-after")) >= 29);
        assert.ok((await r.json()).retryAfterSeconds >= 29);
    });
    await check("valid credentials and alternate account aliases cannot bypass cooldown", async () => {
        const cap = await (await fetch(base + "/api/v1/security/captcha")).json();
        const email = (db
            .prepare("SELECT email FROM faculty_users WHERE faculty_code='admin'")
            .get() as {
            email: string;
        }).email;
        assert.equal((await login(email, cap.data.captchaId, "2468", "admin")).status, 429);
    });
    await check("cooldown expiry permits login and successful login clears its ladder", async () => {
        db.prepare("UPDATE auth_protection SET blocked_until=? WHERE blocked_until>?").run(Date.now() - 1, Date.now());
        const cap = await (await fetch(base + "/api/v1/security/captcha")).json();
        assert.equal((await login("admin", cap.data.captchaId, "2468", "admin")).status, 200);
        for (let i = 0; i < 4; i++)
            assert.equal((await login()).status, 422);
        const r = await login();
        assert.equal(r.status, 429);
        assert.ok(Number(r.headers.get("retry-after")) <= 30);
    });
    await check("parallel failures cannot skip counting or create duplicate state", async () => {
        const results = await Promise.all(Array.from({ length: 5 }, () => login("concurrent-missing-account")));
        assert.deepEqual(results.map((r) => r.status).sort(), [422, 422, 422, 422, 429]);
        assert.deepEqual(db.pragma("foreign_key_check"), []);
    });
    fs.mkdirSync("docs/verification/security", { recursive: true });
    fs.writeFileSync("docs/verification/security/cooldowns.json", JSON.stringify({ testedAt: new Date().toISOString(), checks, passed: checks.length }, null, 2));
}
finally {
    await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
    db.close();
}
