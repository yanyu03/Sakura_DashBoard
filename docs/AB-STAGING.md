# SakuraEdu A/B · 全功能 SQLite 测试服

AB 与生产彻底隔离：`https://ab.sakura.250221.xyz` 指向 `sakura-dashboard-ab`；正式 `sakura.250221.xyz` 仍指向原 `sakura-dashboard` + TiDB。

## 技术方案

原来的 D1（SQLite）仅导入 60 张表却不挂载应用，这不是用户要求的测试服，已停止使用那个只读状态页作为 AB 业务入口。

Cloudflare Workers **不能加载 Node 原生 better-sqlite3 扩展**。AB 改用 Cloudflare **SQLite-backed Durable Object** 的原生 SQLite 驱动，基于 `cloudflare/abSqliteDatabase.ts` 适配与原业务数据库契约一致的 `prepare().get/all/run`、参数化 SQL、异步 `transaction()`。不可用同步 `transactionSync()` 包围异步业务回调；本项目选择原生异步存储事务。数据库校验和持久化由一只独立 `SakuraAbSchool` Durable Object 承担。原 `server/application.ts`、`server/auth.ts` 等业务路由共用不改，HTTP 经 Cloudflare Node 适配器转发。

前端与正式版共用 React/Vite 源码，AB 构建部署 `./dist` 静态资源，通过独立 Wrangler `wrangler.ab.jsonc` 上传；不是从正式网站做代理转发。数据完全独立，可创建专门测试用户执行课程、排课、作业、审批等测试。

## AB 初始化

Durable Object 第一次启动只在自身原生 SQLite 文件上创建仓库的 v16 schema（60 张业务表、33 个索引、34 个触发器、16 条迁移记录）。没有自动生成管理员，也不复制正式学校数据。首位注册者由现有认证路由授予管理员身份，其余注册者是教师并遵循班级授权。初始化后禁止自动清库；若发现 schema drift，直接失败而不是重置现有测试记录。

原先为了状态页创建的 D1 `sakura-dashboard-ab-sqlite`（ID `b76ca872-f0a3-4b93-8617-f2c2487a1c61`）保持不动但**不再作为本测试服业务数据源**；避免混淆，部署中不能残留 `AB_SQLITE` D1 binding。

## 安全与 Secret

不继承正式 Worker 的 `TIDB_DATABASE_URL` 或 `AUTH_PASSWORD_PEPPERS`。`AB_PASSWORD_PEPPERS` 是另行设置的加密 Secret，只用于测试库密码保护。启用 HTTPS、HttpOnly SameSite Strict Cookie，AB 独立验证码/登录频率限制。业务仅可写入 AB Durable Object，而非正式 TiDB。

## 构建/部署

```powershell
npm ci
npm run lint
npm run cf:check
npx tsx scripts/verify-ab-driver.ts
npm run build
npx wrangler deploy --dry-run --config wrangler.ab.jsonc
npx wrangler deploy --config wrangler.ab.jsonc
```

必须使用 `--config wrangler.ab.jsonc`；默认 `wrangler.jsonc` 会指向生产站点，不可误用！AB 的 `SCHOOL_AB` Durable Object namespace 需要 `new_sqlite_classes` migration。上线前单独核对绑定及静态资源。

## 验收条件

1. AB 页面呈现最新 React UI，静态资源指纹与开发分支构建一致。
2. `GET /__ab/status` 显示 `full-business-preview`；`GET /api/v1/health/sqlite` 显示原生 SQLite v16。
3. 图形验证码、首位管理员注册、登录会话 Cookie、注销、重新登录。
4. 使用 AB 内的测试用户验证学期/班级/任教、排课待办、作业/教案、考试、身份隔离、事务冲突/回滚、跨用户 403。
5. 重新访问时数据库仍持久化，没有自动清库；正式网站与 TiDB 数据不发生变化。

Cloudflare 自动化浏览器此前在 AB 自定义域名遇到 403 安全挑战；不将部署成功误写成公网端到端测试成功，也不为方便测试放宽整个站点的安全配置。
