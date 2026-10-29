# 验证指南与证据分层

## 无外部凭据的本地检查

```bash
npm ci
npm run lint
npm run cf:check
npm run build
npm run docs:check
npm run test:local
```

`test:local` 顺序执行下表项目，任一失败立即停止。各业务脚本自己创建 `.local-data/` 中的隔离 SQLite / 临时 HTTP 服务，不连接生产 TiDB，不需要登录 CF，不使用默认演示库作为测试目标。

| 命令 | 重点 | 已留存的历史基准 |
| --- | --- | --- |
| `npm run test:migrations` | 迁移、外键、旧关系保留、重复升级 | 7 组 |
| `npm run test:auth` | 注册、角色注入、验证码、CSRF、用户名边界 | 6 组 |
| `npm run test:protection` | 五次错误与各档冷却、重启保留、并发计数 | 9 组 |
| `npm run test:reliability` | SQLite 锁 / 写入故障、事务与恢复 | 11 组 |
| `npm run test:hierarchy` | 身份、组织任职、层级约束 | 16 组 |
| `npm run test:schedule-sharing` | 跨室隔离、草稿、自审、并发审批、共享撤销 | 17 组 |
| `npm run test:organization` | 组织链、兼任、资格目录、跨校 / 跨组拒绝 | 22 组 |
| `npm run test:first-registration` | 空库首位管理员、后续不可提权、并发首次注册 | 3 项 |
| `npm run test:tidb-reliability` | 适配器故障注入、未知提交不重放、503 保留状态 | 3 项（模拟，不连接 TiDB） |
| `npm run test:preview` | 实际本地入口、无预置账号、首次注册、SQL 封禁、重启持久化 | 4 项 |

当前 GitHub Actions 在 Windows / Node.js 24 上执行安装、类型检查、构建、文档链接、本地回归和密码专项，不注入云端密钥，也不部署到生产。首次注册等服务端测试使用隔离夹具；实际本地入口测试仅在其独占测试库中替换一次性验证码摘要，不在产品中增加验证码绕过。

Windows 可额外执行：

```powershell
npm run test:security-hardening
```

该专项的 11 项覆盖密码格式、Unicode、密钥轮换、旧摘要包装、严格策略、成本注入拒绝、DPAPI、数据库目标 / 重定向、HTTPS 与日志脱敏。DPAPI 绑定 Windows CurrentUser，不能把在 Linux 上无法解密解释成业务认证故障。

`lint` 当前实际是 TypeScript 类型检查，尚未配置完整 ESLint 规则集；`cf:check` 会生成被忽略的 Worker 类型并检查边缘代码。`build` 验证编译，不证明每个页面按钮都已人工验收。`docs:check` 检查当前入口文档的相对链接与 npm 命令，不访问外部网络链接。

## 本地完整故事

按 [快速开始](GETTING-STARTED.md) 从空库注册，在不同浏览器配置文件中使用教师 A、教师 B 与负责人，演示“建立资料 → 有效任职 → 私有草稿 → 提交 → 审批 → 正式课时”。至少加入一个无关教师对照、一次自审拒绝和一次旧版本修改。

当前默认本地入口不插入测试学校或账号。自动测试中的已知验证码提供者仅挂在隔离测试服务，不属于产品验证码后门。证据截图中的便捷会话也不是公共演示账号。

## 真正的 Worker → TiDB 集成

前提：操作者拥有自己的 TiDB 管理凭据、Windows DPAPI 与自己的 Wrangler 配置 / CF 账户。先读 [部署手册](DEPLOYMENT.md)，不要直接使用作者账号、域名或生产配置。

```powershell
npx tsx scripts/prepare-tidb-functions.ts
npx tsx scripts/deploy-tidb-functions.ts
npm run test:tidb-functions
npm run test:cf-security
npx tsx scripts/deploy-tidb-functions.ts --cleanup
```

准备程序创建 `sakura_migration_functional_*` 独立数据库，生成随机密码和额外入口 Token；其配置和运行凭据保存在 DPAPI 加密的 `.local-data/`。运行中不能重新生成目标。清理命令删除临时 Worker 与路由，不删除生产 Worker，也不自动清空测试数据库。

Windows 网络需要 curl 兼容传输时可设置 `SAKURA_VERIFY_CURL=true`；这是测试工具选项，生产 Worker 不依赖 curl。定向重跑、夹具状态与结果合并规则见 [业务回归说明](verification/tidb/FUNCTIONAL-TESTS.md)。

## 生产与历史证据

| 文件 | 可以支持的结论 |
| --- | --- |
| [functions.json](verification/tidb/functions.json) | 独立库的 22 组业务 API 回归，包括实际写入、权限拒绝和幂等 |
| [api.json](verification/tidb/api.json) | 9 组组织 / 调度 / 审批链路 |
| [cf-hardening.json](verification/security/cf-hardening.json) | 6 项真实 Worker 密码与权限检查 |
| [remote.json](verification/security/remote.json) | 8 项生产认证及读取冒烟，不向线上创建合成教学业务 |
| [backup.json](verification/security/backup.json) | 加密快照表数与校验和；不能证明恢复演练已经完成 |
| [deployment.json](verification/security/deployment.json) | 当次发布版本、严格策略与临时 Worker 清理记录 |

报告包含日期、环境与场景，历史数量不自动等于本次 CI 通过数量。测试会更新部分 JSON 日期；提交前只保留有意义的新证据，勿把测试产生的 `.local-data/` 加入版本控制。

旧 `test:sqlite` 仍包含过期的控制台及表数断言；`test:cloudflare`、`test:schedule-workers`、`test:organization-workers` 面向归档前的 Durable Object 方案。它们保留为演进参考，不属于当前 CI 的通过声明。

## 尚未验证

没有学校大规模负载、长期稳定性 SLA、完整灾难恢复演练或全模块多租户安全认证。外部 AI、OCR、家长消息实际投递保持停用。故障注入不能代替真实断网压测；CI 通过也不代表具备直接推广到真实学校的条件。
