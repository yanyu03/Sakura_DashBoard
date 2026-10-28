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
      "--connect-timeout",
      "8",
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
      // Connection phase ends before transfer (DNS/TCP/TLS); see https://curl.se/docs/manpage.html#--connect-timeout.
      // Never replay an operation timeout or an HTTP response, including HTTP 429.
      const failure=error as {status?:number;stdout?:unknown;stderr?:unknown};
      const code=Number(failure.status);
      const connectTimeout=code===28&&!String(failure.stdout??'')&&/Connection timed out|SSL connection timeout/i.test(String(failure.stderr??''));
      if(attempt===3||(![7,35].includes(code)&&!connectTimeout))throw error;
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
