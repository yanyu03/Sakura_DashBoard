import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const base="https://127.0.0.1:8788";
// Only the ephemeral Wrangler loopback uses a self-signed certificate.
process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";
const key=randomBytes(48).toString("base64url");
const policy=JSON.stringify({current:"abtest",keys:{abtest:key},requireProtected:true});
const args=[
  "wrangler","dev","--local","--config","wrangler.ab.jsonc",
  "--ip","127.0.0.1","--port","8788","--local-protocol","https",
  "--persist-to",".local-data/ab-local-durable",
  "--var","AB_PASSWORD_PEPPERS:"+policy,
];
const command=process.platform==="win32"?"npx.cmd":"npx";
const runner=spawn(command,args,{cwd:process.cwd(),stdio:["ignore","pipe","pipe"],detached:process.platform!=="win32"});
let runnerLog="";
runner.stdout.on("data",x=>{runnerLog=(runnerLog+String(x)).slice(-15000)});
runner.stderr.on("data",x=>{runnerLog=(runnerLog+String(x)).slice(-15000)});
const redact=s=>s.replaceAll(key,"<redacted>").replaceAll(policy,"<redacted>");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let checks=0;
function check(value,label){assert.ok(value,label);console.log("PASS "+label);checks++;}
async function api(route,method="GET",body,cookie,csrf){
 const response=await fetch(base+route,{method,redirect:"manual",headers:{
  accept:"application/json", ...(method==="GET"?{}:{"content-type":"application/json",origin:base}),
  ...(cookie?{cookie}:{}),...(csrf?{"x-csrf-token":csrf}:{})
 },...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(20000)});
 let json;try{json=await response.json()}catch{json={}};
 return {response,json};
}
async function getCaptcha(mode="graphic"){
 const r=await api("/api/v1/security/captcha?mode="+mode);
 check(r.response.status===200&&r.json.data?.captchaId,"generate "+mode+" captcha");
 const data=r.json.data;
 const label=Array.from(data.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g),m=>m[1]).join("");
 const answer=mode==="math"?String(label.match(/(\d+)\+(\d+)=\?/)?.slice(1).reduce((a,x)=>a+Number(x),0)):label;
 check(!!answer&& (mode==="math"||/^[23456789]{4}$/.test(answer)),"captcha parse");
 return {captchaId:data.captchaId,captchaAnswer:answer};
}
try{
 let healthy=false;
 for(let i=0;i<90;i++){
  if(runner.exitCode!==null)break;
  try{const r=await api("/__ab/status");if(r.response.status===200&&r.json.data?.stage==="full-business-preview"){healthy=true;break}}catch{}
  await sleep(500);
 }
 if(!healthy)throw new Error("AB dev startup failed: "+redact(runnerLog.slice(-3500)));
 let r=await api("/api/v1/health/sqlite");
 check(r.response.status===200,"native SQLite DO health");
 check(r.json.data?.tables===60 && r.json.data?.version===16,"schema v16 and 60 tables");
 check(r.json.data?.driver==="Durable Object SQLite","native SQLite driver");
 r=await api("/api/v1/health/tidb");
 check(r.response.status===410,"no TiDB");
 r=await api("/api/v1/auth/session");
 check(r.response.status===401,"guest session blocked");
 const creds={facultyCode:"ab_admin",fullName:"AB SQLite 管理员",email:"ab_admin@example.test",password:"AB-Sqlite-test-password-2026",confirmPassword:"AB-Sqlite-test-password-2026"};
 const captcha=await getCaptcha();
 r=await api("/api/v1/auth/register","POST",{...creds,...captcha});
 check(r.response.status===200,"first admin registration: "+JSON.stringify(r.json).slice(0,260));
 const captcha2=await getCaptcha("math");
 r=await api("/api/v1/auth/faculty-login","POST",{loginType:"account",facultyId:creds.facultyCode,password:creds.password,...captcha2});
 check(r.response.status===200,"admin account login: "+JSON.stringify(r.json).slice(0,260));
 check(r.json.data?.role==="admin","first registration is admin");
 const cookie=r.response.headers.get("set-cookie")?.split(";")[0];
 const csrf=r.json.data?.csrfToken;
 check(!!cookie&&!!csrf,"HttpOnly cookie and CSRF issued");
 for(const path of ["/api/v1/auth/session","/api/v1/academic/terms","/api/v1/academic/classes","/api/v1/schedules/task-pool","/api/v1/workspace/overview"]){
  r=await api(path,"GET",undefined,cookie);
  check(r.response.status===200,"authenticated "+path+": "+r.response.status+" "+JSON.stringify(r.json).slice(0,120));
 }

 // Regression for mobile "creating information => service unavailable".
 // All these mutations operate only on the ephemeral local SQLite Durable Object.
 for (const [label,path,payload] of [
  ["term","/api/v1/academic/terms",{code:"2026-FALL-AB",name:"测试学期",starts_on:"2026-09-01",ends_on:"2027-01-31",active:true}],
  ["course","/api/v1/academic/courses",{code:"MATH-AB",name:"数学"}],
  ["class","/api/v1/academic/classes",{class_code:"AB-CLASS",class_name:"AB 测试班",grade_level:"高一"}],
  ["task pool","/api/v1/schedules/task-pool",{title:"手机创建回归",note:"仅本地 SQLite 数据"}],
 ]) {
  r=await api(path,"POST",payload,cookie,csrf);
  check(r.response.status===200&&r.json.success===true,
    "create "+label+" SQLite write: status "+r.response.status+" "+JSON.stringify(r.json).slice(0,420));
 }
 r=await api("/api/v1/academic/terms","GET",undefined,cookie);
 check(r.json.data?.some(t=>t.code==="2026-FALL-AB"),"term persisted in SQLite");
 r=await api("/api/v1/academic/courses","GET",undefined,cookie);
 check(r.json.data?.some(t=>t.code==="MATH-AB"),"course persisted in SQLite");

 r=await api("/api/v1/auth/logout","POST",{},cookie,csrf);
 check(r.response.status===200,"logout");
 r=await api("/api/v1/auth/session","GET",undefined,cookie);
 check(r.response.status===401,"logout invalidates session");
 console.log("PASS AB local Worker + SQLite end-to-end ("+checks+" assertions)");
}finally{
 // Wrangler uses child processes. Kill the process group on Linux so the
 // workerd/esbuild descendants do not keep CI pipes open after test completion.
 if(process.platform!=="win32" && runner.pid){
  try{process.kill(-runner.pid,"SIGTERM")}catch{}
  await sleep(700);
  try{process.kill(-runner.pid,"SIGKILL")}catch{}
 }else if(runner.exitCode===null){
  runner.kill("SIGTERM");
  await Promise.race([new Promise(resolve=>runner.once("exit",resolve)),sleep(1000)]);
  if(runner.exitCode===null)runner.kill("SIGKILL");
 }
 runner.stdout.destroy();
 runner.stderr.destroy();
}
