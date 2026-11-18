import assert from 'node:assert/strict';
import ab from '../cloudflare/ab-gateway.mjs';

const URL='https://ab.sakura.250221.xyz';
const requests=[];
const env={AB_SQLITE:{prepare(sql){requests.push(sql);return {async first(){return {tables:60,schemaVersion:16,migrationCount:16}}}}}};
async function call(path,method='GET',target=env){const response=await ab.fetch(new Request(URL+path,{method}),target);return {response,body:response.headers.get('content-type')?.includes('json')?await response.json():await response.text()};}
let tests=0;
function check(v,msg){assert.ok(v,msg);tests++}
const landing=await call('/');check(landing.response.status===200,'landing');check(landing.body.includes('Cloudflare D1（SQLite）'),'landing describes SQLite');check(!landing.body.includes('sakura.250221.xyz/api/'),'no remote production API in HTML');
const status=await call('/__ab/status');check(status.response.status===200 && status.body.data.productionTiDBConnection===false,'status isolated');
const health=await call('/api/v1/health/sqlite');check(health.response.status===200 && health.body.data.ready===true,'sqlite health');check(health.body.data.schemaVersion===16 && health.body.data.tableCount===60,'schema version');
const bad=await call('/api/v1/health/sqlite','GET',{AB_SQLITE:{prepare(){return {first:async()=>({tables:59,schemaVersion:16,migrationCount:16})}}}});check(bad.response.status===503,'schema drift fails closed');
const missing=await call('/api/v1/health/sqlite','GET',{});check(missing.response.status===503,'missing binding fails closed');
const prod=await call('/api/v1/health/tidb');check(prod.response.status===410,'TiDB not proxied');
const auth=await call('/api/v1/auth/session');check(auth.response.status===503,'business not falsely exposed');
const mutation=await call('/api/v1/schedules/task-pool','POST');check(mutation.response.status===405,'writes blocked');
const version=await call('/api/v1/meta/version');check(version.body.data.stage==='schema-only','stage honest');
const head=await call('/','HEAD');check(head.response.status===200,'head allowed');
check(requests.length>0,'sqlite prepared statement used');
console.log(`PASS Sakura AB SQLite gateway (${tests} assertions)`);
