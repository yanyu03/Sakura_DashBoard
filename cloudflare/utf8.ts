/** Express JSON bodies use UTF-8; avoid iconv-lite's browser-only stream shims. */
export function encodingExists(encoding: string) {
  return /^utf-?8$/i.test(encoding);
}
export function getDecoder(encoding: string) {
  if (!encodingExists(encoding))
    throw new Error("Only UTF-8 JSON requests are supported");
  const decoder = new TextDecoder("utf-8");
  return {
    write: (chunk: Uint8Array) => decoder.decode(chunk, { stream: true }),
    end: () => decoder.decode(),
  };
}
export function decode(chunk: Uint8Array, encoding: string) {
  if (!encodingExists(encoding)) throw new Error("Unsupported encoding");
  return new TextDecoder("utf-8").decode(chunk);
}
