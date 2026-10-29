import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { readLocalSecret, writeLocalSecret } from "./private-secrets";
import {
  passwordPolicyFromSecret,
  type PasswordPolicy,
} from "../server/passwords";
export function operatorPasswordPolicy(
  environment: "production" | "staging",
  initialize = false,
): PasswordPolicy {
  const file = ".local-data/auth-password-peppers-" + environment + ".json";
  if (!fs.existsSync(file)) {
    if (!initialize)
      throw Error(
        "Protected pepper backup missing; restore it or explicitly initialize a new environment",
      );
    writeLocalSecret(file, {
      current: "p1",
      keys: { p1: randomBytes(32).toString("base64url") },
    });
  }
  return passwordPolicyFromSecret(JSON.stringify(readLocalSecret(file)));
}
