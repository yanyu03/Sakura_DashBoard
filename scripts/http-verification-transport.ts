import { execFileSync } from "node:child_process";

/** Optional transport for Windows proxies that reject Node's TLS connection. */
export const verificationFetch: typeof globalThis.fetch = async (
  input,
  init,
) => {
  if (process.env.SAKURA_VERIFY_CURL !== "true")
    return globalThis.fetch(input, init);
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const config = [
    `url = ${JSON.stringify(url)}`,
    `request = ${JSON.stringify(init?.method || "GET")}`,
    ...Array.from(
      new Headers(init?.headers),
      ([key, value]) => `header = ${JSON.stringify(`${key}: ${value}`)}`,
    ),
    ...(init?.body === undefined
      ? []
      : [`data = ${JSON.stringify(String(init.body))}`]),
  ].join("\n");
  // Credentials travel through stdin, never command arguments or saved files.
  const request = () => execFileSync(
    "curl.exe",
    [
      "--silent",
      "--show-error",
      "--include",
      "--suppress-connect-headers",
      "--max-time",
      "25",
      "--config",
      "-",
    ],
    { input: config, encoding: "utf8", maxBuffer: 8 * 1024 * 1024,stdio:'pipe' },
  );
  let raw='';
  for(let attempt=0;attempt<4;attempt++){
    try{raw=request();break;}catch(error){
      // Retry only pre-request connection/TLS failures; never retry HTTP 429 or other responses.
      if(attempt===3||![7,35].includes(Number((error as {status?:number}).status)))throw error;
    }
  }
  const split = raw.indexOf("\r\n\r\n");
  if (split < 0) throw new Error("Missing HTTP response headers");
  const lines = raw.slice(0, split).split("\r\n");
  const status = Number(lines.shift()?.match(/^HTTP\/\S+ (\d+)/)?.[1]);
  const headers = new Headers();
  for (const line of lines) {
    const separator = line.indexOf(":");
    if (separator > 0)
      headers.append(
        line.slice(0, separator),
        line.slice(separator + 1).trim(),
      );
  }
  return new Response(raw.slice(split + 4), { status, headers });
};
