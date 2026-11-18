# Sakura AB · D1（SQLite）预演盘

2026-11-18 建立了独立数据库和 Worker：

- Worker：`sakura-dashboard-ab`
- 测试域名：`https://ab.sakura.250221.xyz`
- 正式域名：`https://sakura.250221.xyz`，仍使用 TiDB；本变更不修改正式 Worker。
- 数据库：Cloudflare D1 `sakura-dashboard-ab-sqlite`，ID `b76ca872-f0a3-4b93-8617-f2c2487a1c61`（APAC）。
- 源码：`cloudflare/ab-gateway.mjs`；配置：`wrangler.ab.jsonc`。
- 所有业务数据均独立，未复制 TiDB 内容或 Secret。不存在任何指向正式 Worker 的 Service Binding。

## SQLite 结构导入

来自仓库的 `cloudflare/schema.json`，源迁移 v16。通过 Cloudflare D1 API 在独立 D1 创建 60 张业务表、33 个索引、34 个触发器，执行 127 条结构语句，并插入 16 条迁移记录。首次验证中教师账号为 0、排课任务为 0。更改 schema 后需要重新校验本盘，不能擅自把正式 TiDB 数据导入 D1。

## 已完成和未完成

**已完成：** D1 数据库和 schema 初始化、独立 D1 Worker binding、基本数据库查询和版本检查、AB 独立公网域名绑定、无正式 TiDB 依赖。只读取 SQLite 数据库的 `GET /api/v1/health/sqlite` 是唯一数据库健康检查；`GET /__ab/status` 显示绑定状态；`GET /api/v1/meta/version` 标明 `stage=schema-only`。

**未完成：** D1 与现有 Express/asyncDatabase 业务层适配，特别是原先同步 SQLite事务与 D1 交互式事务的差异；真实登录、排课、作业及审批、前端完整业务构建。当前根页面仅展示测试盘状态；全部写入返回 405，受保护业务 API 返回 503。**不能把 schema-ready 当作 business-ready。**

## 环境变量

生产的普通环境变量可复制，但 `DATABASE_MODE` 在 AB 专门设为 `sqlite`，并增加 `AB_STAGE=schema-only`。当前没有 `TIDB_DATABASE_URL`、`AUTH_PASSWORD_PEPPERS` 或 `SAKURA_ADMIN_PASSWORD_HASH`，也没有 `SAKURA_UPSTREAM` Service Binding；不允许通过环境变量回退到正式数据库。

## 独立部署

```powershell
npm ci
node scripts/verify-ab-sqlite.mjs
npx wrangler deploy --dry-run --config wrangler.ab.jsonc
npx wrangler deploy --config wrangler.ab.jsonc
```

发布和测试都**只允许**使用 `wrangler.ab.jsonc`，禁止把它替换到正式 `wrangler.jsonc`。云端环境必须验证绑定类型为 `d1` 且数据库 ID 正确，旧 `SAKURA_UPSTREAM` 应消失；确认正式域名的 Worker 指向不变。

## 下一道门槛

首先完成现有业务数据库契约的 D1/SQLite 适配并在本盘上执行注册登录、课程排课、权限与事务回归；不能简单把 `DATABASE_MODE` 改为 `sqlite` 就让 D1 支持原应用。只有 AB SQLite 预演完成后，再在独立 TiDB 目标库做真实部署测试。若 Cloudflare 安全挑战拦截自动化浏览器访问，应单独诊断正常浏览器访问，不应为了测试放宽生产 WAF。
