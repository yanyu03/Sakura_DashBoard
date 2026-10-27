import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../server/passwords";
fs.mkdirSync(".local-data", { recursive: true });
const file = ".local-data/cloudflare-initial-admin.txt";
if (!fs.existsSync(file)) {
  const password = randomBytes(24).toString("base64url");
  const hash = hashPassword(password);
  fs.writeFileSync(
    file,
    `SakuraEdu Cloudflare administrator\nAccount: admin\nPassword: ${password}\nURL: https://sakura.250221.xyz/?design=1.0Sakura\nKeep this file private. This password is not the local demo password.\n`,
  );
  fs.writeFileSync(".local-data/cloudflare-admin-hash.txt", hash);
}
const hash = fs
  .readFileSync(".local-data/cloudflare-admin-hash.txt", "utf-8")
  .trim();
fs.writeFileSync(".dev.vars", `SAKURA_ADMIN_PASSWORD_HASH="${hash}"\n`);
console.log(
  "Created/reused a private initial admin credential file; no secret printed.",
);
