/** Operator files are protected by Windows DPAPI, scoped to the current OS user. */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
const protection = "windows-dpapi-current-user";
function crypt(input: string, decrypt = false) {
  if (process.platform !== "win32")
    throw Error("An OS-protected secret store is required for operator files");
  const script =
    `$ErrorActionPreference='Stop';[Console]::InputEncoding=[Text.UTF8Encoding]::new($false);[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false);Add-Type -AssemblyName System.Security;$raw=[Console]::In.ReadToEnd();$entropy=[Text.Encoding]::UTF8.GetBytes('SakuraEdu/operator-secrets/v1');` +
    (decrypt
      ? `[Console]::Out.Write([Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($raw),$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)))`
      : `[Console]::Out.Write([Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($raw),$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)))`);
  try {
    return execFileSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      {
        input,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        maxBuffer: 16 * 1024 * 1024,
        timeout: 30000,
      },
    ).trim();
  } catch {
    throw Error("Operator secret protection failed");
  }
}
function target(file: string) {
  const resolved = path.resolve(file),
    root = path.resolve(".local-data") + path.sep;
  if (!resolved.startsWith(root))
    throw Error(
      "Operator secret must be inside the private workspace directory",
    );
  return resolved;
}
export function writeLocalSecret(file: string, value: unknown) {
  const name = target(file),
    plain = JSON.stringify(value),
    ciphertext = crypt(plain);
  if (crypt(ciphertext, true) !== plain)
    throw Error("Encrypted secret verification failed");
  fs.mkdirSync(path.dirname(name), { recursive: true });
  const temporary = name + "." + randomUUID() + ".tmp";
  fs.writeFileSync(
    temporary,
    JSON.stringify({ version: 1, protection, ciphertext }),
    { mode: 0o600 },
  );
  fs.renameSync(temporary, name);
}
function readValue(file: string, text = false): any {
  const name = target(file),
    contents = fs.readFileSync(name, "utf8");
  let value: any;
  try {
    value = JSON.parse(contents);
  } catch {
    if (!text) throw Error("Invalid operator secret file");
    value = { text: contents };
  }
  if (
    value?.protection === protection &&
    value.version === 1 &&
    typeof value.ciphertext === "string"
  )
    return JSON.parse(crypt(value.ciphertext, true));
  writeLocalSecret(name, value);
  return value;
}
export function readLocalSecret<T = any>(file: string): T {
  return readValue(file);
}
export function readLocalTextSecret(file: string): string {
  const value = readValue(file, true);
  if (typeof value?.text !== "string")
    throw Error("Invalid protected text secret");
  return value.text;
}
export function writeLocalTextSecret(file: string, value: string) {
  writeLocalSecret(file, { text: value });
}
