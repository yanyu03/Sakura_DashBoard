/** Sakura Dashboard AB test environment — isolated Cloudflare D1 (SQLite).
 * The full teacher/business application is NOT yet wired to the D1 adapter.
 * No production Worker, TiDB connection, or production secrets are used.
 */
const EXPECTED_SCHEMA_VERSION = 16;
const EXPECTED_TABLE_COUNT = 60;
const HEALTH_SQL = `SELECT
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%') AS tables,
  (SELECT MAX(version) FROM schema_migrations) AS schemaVersion,
  (SELECT COUNT(*) FROM schema_migrations) AS migrationCount`;
const HTTP_HEADERS = {
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'x-sakura-ab': 'sqlite-d1',
  'x-sakura-database': 'SQLite (Cloudflare D1)',
  'referrer-policy': 'no-referrer',
};
function json(status, data, message) {
  return Response.json({code: status, success: status < 400, message, data, timestamp: new Date().toISOString()},
    {status, headers: HTTP_HEADERS});
}
async function inspectDb(env) {
  if (!env.AB_SQLITE || typeof env.AB_SQLITE.prepare !== 'function') throw new Error('Missing AB_SQLITE binding');
  const data = await env.AB_SQLITE.prepare(HEALTH_SQL).first();
  if (!data || !Number.isInteger(data.tables) || !Number.isInteger(data.schemaVersion)) throw new Error('Incomplete SQLite schema');
  return {engine:'SQLite', provider:'Cloudflare D1', ready:data.tables===EXPECTED_TABLE_COUNT && data.schemaVersion===EXPECTED_SCHEMA_VERSION && data.migrationCount===EXPECTED_SCHEMA_VERSION,
    tableCount:data.tables, migrationCount:data.migrationCount, schemaVersion:data.schemaVersion};
}
const PAGE = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SakuraEdu AB · SQLite 测试盘</title>
<style>body{margin:0;background:#faf8f6;color:#292b34;font:16px/1.7 system-ui,sans-serif}main{max-width:700px;margin:9vh auto;padding:28px}section{background:white;border:1px solid #ede6e8;border-radius:18px;padding:28px;box-shadow:0 12px 36px #25151c0c}h1{margin:0 0 10px;font-size:1.7rem}p{margin:12px 0}code{background:#f8eef3;border-radius:6px;padding:3px 6px;overflow-wrap:anywhere}a{color:#a83d6e}small{color:#656975}</style>
</head><body><main><section><h1>✿ SakuraEdu · AB SQLite 测试盘</h1>
<p>此 Worker 使用独立 <strong>Cloudflare D1（SQLite）</strong>，不连接正式 TiDB，也不共享正式 Sakura 的认证密钥。</p>
<p>数据库已导入 v16 业务结构。可通过 <a href="/api/v1/health/sqlite">SQLite 健康与结构检查</a> 和 <a href="/__ab/status">AB 状态</a> 查看实时结果。</p>
<p><small>当前阶段：数据库结构预演。登录、排课、作业、审批等业务 API 尚未接入 D1 适配层，因此暂不开放业务操作；不能将这里的数据库就绪理解成完整应用验收通过。</small></p>
</section></main></body></html>`;
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json(405,null,'AB 暂未开放业务写入接口');
    }
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(request.method==='HEAD'?null:PAGE,
        {status:200, headers:{...HTTP_HEADERS,'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"}});
    }
    if (url.pathname === '/__ab/status') {
      return json(200,{worker:'sakura-dashboard-ab',mode:'sqlite-d1',independentDatabase:true,productionTiDBConnection:false,
        productionSecretsCopied:false,applicationReady:false,readinessEndpoint:'/api/v1/health/sqlite'},'AB 独立测试盘已部署');
    }
    if (url.pathname === '/api/v1/meta/version') {
      return json(200,{name:'SakuraEdu AB',version:'1.0.2-sakura',apiVersion:'v1',database:'SQLite (D1)',stage:'schema-only'},'AB 测试环境版本信息');
    }
    if (url.pathname === '/api/v1/health/sqlite') {
      try {
        const started=performance.now();
        const state=await inspectDb(env);
        if(!state.ready)return json(503,{...state,readOnly:true},'AB SQLite 结构版本与仓库基线不一致');
        return json(200,{...state,readOnly:true,queryMs:Math.round((performance.now()-started)*100)/100},'AB SQLite 已连接，v16 结构就绪');
      } catch (error) {
        console.error('ab_sqlite_health_failed', {errorName:error instanceof Error?error.name:'UnknownError'});
        return json(503,{engine:'SQLite',provider:'Cloudflare D1',ready:false},'AB SQLite 暂不可用');
      }
    }
    if (url.pathname === '/api/v1/health/tidb') {
      return json(410,{engine:'SQLite',provider:'Cloudflare D1'},'AB 不再连接 TiDB，请使用 /api/v1/health/sqlite');
    }
    if (url.pathname.startsWith('/api/')) {
      return json(503,null,'AB 业务 API 尚未接入独立 SQLite 适配层，请勿视为功能已通过');
    }
    return json(404,null,'资源不存在');
  }
};
