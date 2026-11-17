# Sakura A/B 隔离入口

2026-11-18 创建的独立 Cloudflare Worker：

- 名称：`sakura-dashboard-ab`
- 域名：`https://ab.sakura.250221.xyz`
- 正式 Worker：`sakura-dashboard` / `https://sakura.250221.xyz`（**不修改**）
- 代码：[`cloudflare/ab-gateway.mjs`](../cloudflare/ab-gateway.mjs)
- 独立 Wrangler 配置：[`wrangler.ab.jsonc`](../wrangler.ab.jsonc)

## 环境变量与 Secret

从正式 Worker 复制 **非敏感** 环境变量：`NODE_ENV=production`、`COOKIE_SECURE=true`、`DATABASE_MODE=tidb`、`SAKURA_ALLOW_SQL_WRITES=false`、`SAKURA_DEMO_MODE=false`。

`TIDB_DATABASE_URL`、`AUTH_PASSWORD_PEPPERS`、旧的 `SAKURA_ADMIN_PASSWORD_HASH` 是 Worker 专属加密 Secret。Cloudflare 不允许读取这些 Secret 的明文来直接复制到另一个 Worker。**不要**尝试导出、硬编码、打印或在 GitHub 中提交 Secret。

AB 目前通过 `SAKURA_UPSTREAM` Service Binding 转发到生产 Worker，由生产 Worker 在自身运行时使用原有密钥和 TiDB 连接；这是间接使用**相同后端**，**不是**克隆数据库或复制了 Secret。

## 只读保护

- `GET /__ab/status` 返回隔离入口元数据，不会触发数据库请求。
- 仅允许代理公开 `GET /api/v1/meta/version`、`GET /api/v1/health/tidb` 和 `GET /api/v1/auth/env-check`。
- 静态页面及资源的 GET/HEAD 请求从正式 Worker 代理，因此**UI 与正式版相同**，不代表已经部署本 PR 的最新前端代码。
- 拒绝全部 POST/PUT/PATCH/DELETE；其余受保护业务 API 返回 401，不传递请求 Cookie 和 Authorization，代理响应会丢弃 Set-Cookie。
- 不应在这一路由下测试登录、教师业务写入、学生资料修改、排课审批或业务事务。

## 独立发布与验收

A/B Worker 的 **Gateway** 配置由 `wrangler.ab.jsonc` 单独维护；不要用正式版的 `wrangler.jsonc` 部署测试代码。部署前检查 Wrangler 的目标、账号、域名与差异并测试：

```powershell
npx wrangler deploy --dry-run --config wrangler.ab.jsonc
npx wrangler deploy --config wrangler.ab.jsonc
```

此配置**仅更新只读 Gateway**。后续如果要真正进行 GitHub 新代码的 A/B 业务验收，应在独立的 TiDB 测试库建立受限运行账号及新的 Secret，使用完整的前端/Worker 构建产物替换 Gateway；绝不能让新代码以正式库上的可写测试身份运行。

Cloudflare Browser Rendering 对新自定义域名出现过挑战页（HTTP 403），对 `workers.dev` 也曾返回 1101（正式 Worker 的 workers.dev 域名同样复现），因此**域名绑定成功≠浏览器访问和功能回归通过**。需要在不绕过生产安全策略的前提下，用正常浏览器核查 A/B 访问链路；不要因为自动化测试受挑战就放宽全站 WAF。

## CI 状态

SQLite v16 的本地测试已经通过；`sakura-dashboard-ab` 当前未加载开发分支前端，也未在独立 TiDB 环境做真实写事务集成验收。
