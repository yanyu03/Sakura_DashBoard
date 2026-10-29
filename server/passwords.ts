import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHmac,
} from "node:crypto";
export type PasswordPolicy = Readonly<{
  current: string;
  keys: Readonly<Record<string, string>>;
  requireProtected?: boolean;
}>;
const COST = { N: 16384, r: 8, p: 5, maxmem: 32 * 1024 * 1024 } as const;
const legacy = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
const versioned =
  /^scrypt\$v2\$16384\$8\$(1|5)\$([a-f0-9]{32})\$(none|[a-z][a-z0-9_-]{0,31})\$([a-f0-9]{128})$/;
function key(policy: PasswordPolicy | undefined, id: string) {
  if (!policy || !Object.hasOwn(policy.keys, id)) return null;
  const value = policy.keys[id];
  if (!/^[A-Za-z0-9_-]{43,86}$/.test(value)) return null;
  const bytes = Buffer.from(value, "base64url");
  return bytes.length >= 32 && bytes.length <= 64 ? bytes : null;
}
export function passwordPolicyFromSecret(value: unknown): PasswordPolicy {
  try {
    if (typeof value !== "string" || value.length > 8192) throw Error();
    const parsed = JSON.parse(value);
    if (
      parsed.requireProtected !== undefined &&
      typeof parsed.requireProtected !== "boolean"
    )
      throw Error();
    if (
      !/^[a-z][a-z0-9_-]{0,31}$/.test(parsed.current) ||
      parsed.current === "none" ||
      !parsed.keys ||
      Array.isArray(parsed.keys)
    )
      throw Error();
    const entries = Object.entries(parsed.keys);
    if (entries.length < 1 || entries.length > 4) throw Error();
    const keys: Record<string, string> = Object.create(null);
    for (const [id, secret] of entries) {
      if (
        !/^[a-z][a-z0-9_-]{0,31}$/.test(id) ||
        id === "none" ||
        typeof secret !== "string"
      )
        throw Error();
      keys[id] = secret;
    }
    const policy = Object.freeze({
      current: parsed.current,
      keys: Object.freeze(keys),
      requireProtected: parsed.requireProtected === true,
    });
    if (
      !key(policy, policy.current) ||
      entries.some(([id]) => !key(policy, id))
    )
      throw Error();
    return policy;
  } catch {
    throw Object.assign(
      Error("Authentication security configuration unavailable"),
      { code: "AUTH_CONFIG_UNAVAILABLE" },
    );
  }
}
function protect(
  derived: Buffer,
  salt: string,
  p: number,
  id: string,
  policy?: PasswordPolicy,
) {
  if (id === "none") return derived;
  const secret = key(policy, id);
  if (!secret) throw Error("Password protection key unavailable");
  return createHmac("sha512", secret)
    .update("SakuraEdu/password/v2\0")
    .update(`16384$8$${p}$${salt}\0`)
    .update(derived)
    .digest();
}
function encode(
  derived: Buffer,
  salt: string,
  p: number,
  policy?: PasswordPolicy,
) {
  const id = policy?.current || "none";
  return `scrypt$v2$16384$8$${p}$${salt}$${id}$${protect(derived, salt, p, id, policy).toString("hex")}`;
}
export function hashPassword(password: string, policy?: PasswordPolicy) {
  if (typeof password !== "string" || password.length > 1024)
    throw Error("Invalid password input");
  const salt = randomBytes(16).toString("hex");
  return encode(scryptSync(password, salt, 64, COST), salt, COST.p, policy);
}
export function verifyPassword(
  password: string,
  encoded: string,
  policy?: PasswordPolicy,
) {
  if (
    typeof password !== "string" ||
    password.length > 1024 ||
    typeof encoded !== "string"
  )
    return false;
  const old = legacy.exec(encoded);
  if (old && !policy?.requireProtected)
    return timingSafeEqual(
      scryptSync(password, old[1], 64),
      Buffer.from(old[2], "hex"),
    );
  const current = versioned.exec(encoded);
  if (!current) return false;
  const [, cost, salt, id, expected] = current;
  if (id === "none" && policy?.requireProtected) return false;
  if (id !== "none" && !key(policy, id)) return false;
  const actual = protect(
    scryptSync(password, salt, 64, { ...COST, p: Number(cost) }),
    salt,
    Number(cost),
    id,
    policy,
  );
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}
export function passwordNeedsUpgrade(encoded: string, policy?: PasswordPolicy) {
  const current = versioned.exec(encoded);
  return (
    !current ||
    Number(current[1]) !== COST.p ||
    current[3] !== (policy?.current || "none")
  );
}
/** Post-hash protection permits wrapping existing digests without recovering any password. */
export function protectStoredPassword(encoded: string, policy: PasswordPolicy) {
  const old = legacy.exec(encoded);
  if (old) return encode(Buffer.from(old[2], "hex"), old[1], 1, policy);
  const current = versioned.exec(encoded);
  if (!current) throw Error("Unsupported stored password format");
  if (current[3] === "none")
    return encode(
      Buffer.from(current[4], "hex"),
      current[2],
      Number(current[1]),
      policy,
    );
  if (current[3] === policy.current && key(policy, current[3])) return encoded;
  throw Error("Protected passwords need reauthentication for key rotation");
}
