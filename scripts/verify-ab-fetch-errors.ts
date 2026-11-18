import assert from "node:assert/strict";
import { sakuraApi } from "../src/services/sakuraApiService";

const originalFetch = globalThis.fetch;
const payload = {code:"NETTEST",name:"Network diagnostics"};
let calls=0;
async function attempt(response: () => Promise<Response>) {
  globalThis.fetch = async (_req, opts) => {
    calls++;
    assert.equal(opts?.credentials, "same-origin");
    assert.equal(opts?.cache, "no-store");
    return await response();
  };
  return sakuraApi.academic.save("courses", payload);
}
try {
  let result = await attempt(async () => new Response("<html>Just a moment...</html>", {
    status:403,headers:{"content-type":"text/html","cf-ray":"test-ray-123"}
  }));
  assert.equal(result.code,403);
  assert.equal(result.success,false);
  assert.match(result.message,/安全验证拦截/);
  assert.match(result.message,/test-ray-123/);

  result = await attempt(async () => new Response("<html>SPA fallback</html>", {
    status:200,headers:{"content-type":"text/html"}
  }));
  assert.equal(result.code,503);
  assert.match(result.message,/非 JSON/);

  result = await attempt(async () => {throw new TypeError("Failed to fetch");});
  assert.equal(result.code,503);
  assert.match(result.message,/浏览器未能/);

  result = await attempt(async () => {throw new DOMException("Timeout","TimeoutError");});
  assert.equal(result.code,504);
  assert.match(result.message,/不要直接重复提交/);

  result = await attempt(async () => Response.json({
    code:200,success:true,message:"课程已创建",data:{id:"test-id"},
    traceId:"test-trace",timestamp:new Date().toISOString()
  }));
  assert.equal(result.code,200);
  assert.equal(result.success,true);
  assert.equal(result.data.id,"test-id");
  assert.equal(calls,5);
  console.log("PASS AB frontend transport diagnostics: 5 cases");
} finally {
  globalThis.fetch = originalFetch;
}
