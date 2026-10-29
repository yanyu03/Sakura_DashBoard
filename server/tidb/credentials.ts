/** Validate the server-only descriptor before the HTTPS driver receives any credentials. */
export function databaseCredentialUrl(value: unknown): URL {
  try {
    if (typeof value !== "string" || value.length > 4096) throw Error();
    const url = new URL(value),
      user = decodeURIComponent(url.username),
      password = decodeURIComponent(url.password);
    if (
      url.protocol !== "mysql:" ||
      !url.hostname.endsWith(".tidbcloud.com") ||
      (url.port && url.port !== "4000") ||
      !user ||
      /(?:^|\.)root$/i.test(user) ||
      /[\r\n]/.test(user) ||
      password.length < 16 ||
      password.length > 256 ||
      url.search ||
      url.hash
    )
      throw Error();
    if (
      !/^\/[a-z][a-z0-9_]+$/.test(url.pathname) ||
      /^\/(mysql|sys|information_schema|performance_schema)$/.test(url.pathname)
    )
      throw Error();
    return url;
  } catch {
    throw Object.assign(Error("Database security configuration unavailable"), {
      code: "DB_CONFIG_UNAVAILABLE",
    });
  }
}
