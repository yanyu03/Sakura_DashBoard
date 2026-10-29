# 独立部署与运维

生产路径为浏览器 → Cloudflare Worker → TiDB 固定 HTTPS 接口。本文命令面向**你自己的 CF 账户、域名和独立数据库**。仓库内作者的 account_id、Worker 名与域名是现有部署记录，不是公共部署凭据；克隆后必须先替换。

本地评审无需执行这些步骤。当前通用运维工具使用 Windows DPAPI，以下操作者流程以 PowerShell 为例；Linux / macOS 的秘密存储适配尚未实现，不应通过保存明文 JSON 绕过失败。

## 1. 准备自己的环境

1. 安装 Node.js 24，执行 `npm ci`，运行 `npx wrangler login` 登录自己的账户。
2. 在 TiDB Cloud 创建兼容的数据库和启用的 HTTP / Serverless 接口，管理连接必须使用校验主机名的 TLS。
3. 在管理控制台新建空数据库，例如 `sakura_portfolio_demo`，字符集使用 `utf8mb4` / `utf8mb4_bin`。不使用 `sys`、`mysql` 等系统库。
4. 将自己的 JDBC 管理连接放入受控的本地输入文件，设置 `TIDB_CREDENTIAL_FILE`。不要放在仓库、聊天、截图或命令行参数中。项目不会自动加密这份外部输入原件，应按自己的凭据管理流程保管 / 移除它。

```powershell
$env:TIDB_DATABASE='sakura_portfolio_demo'
$env:TIDB_CREDENTIAL_FILE='C:/private/tidb-operator.txt'
```

运维初始化需要管理权限创建表和受限账号；Worker 只使用 `SELECT, INSERT, UPDATE, DELETE` 运行账号。不要把管理凭据上传为 Worker Secret。

## 2. 全新安装与现有数据迁移分开

全新安装只导入空 SQLite v15 的基础元数据：

```powershell
npx tsx scripts/prepare-empty-install.ts --select
npx tsx scripts/prepare-tidb.ts
npx tsx scripts/provision-tidb-runtime.ts
```

第一步创建独立空库，包含迁移、组织类型和岗位定义，不含演示账号或学生；`--select` 明确将其设为后续导入源。第二步读取当前导出源，准备 58 张表及关系、导入并逐表 / 外键核对。目标必须是专门创建的空库；不要在已有参考数据或运行中的库上反复导入。

`prepare-tidb.ts --schema-only` **只准备结构，不初始化角色 / 组织基础数据**，不能把它独立当作可用的新安装。现有 SQLite 平移应先做一致性快照，再使用经核对的 v15 导出；不能用空安装快照覆盖现有数据。

运行账号凭据写入 `.local-data/tidb-runtime-<database>.json`，由 DPAPI 加密。表约束 / 触发器的应用保护边界见 [TiDB 说明](verification/tidb/README.md)。

## 3. 改写 Wrangler 配置

检查 `wrangler.jsonc`：

| 项目 | 必须确认 |
| --- | --- |
| `name`、`account_id` | 换成自己的 Worker 名称与 CF 账户 |
| `routes` | 换成自己控制的 custom domain；未有域名时移除该路由并核查 workers.dev 可用性 |
| `compatibility_date` / `nodejs_compat` | 保留已验证的 Node 兼容能力；升级日期后重新验证 |
| `placement` | 结合自己的 TiDB 区域调整，不盲目沿用作者区域 |
| `DATABASE_MODE` | 保持 `tidb` |
| Cookie / demo / SQL 开关 | `COOKIE_SECURE=true`、`SAKURA_DEMO_MODE=false`、`SAKURA_ALLOW_SQL_WRITES=false` |
| `SCHOOL` Durable Object | 当前为归档兼容类和历史迁移；已有部署不可随意删 namespace / 改 migration |
| 日志 | 自动 invocation logs / traces 关闭；保留脱敏应用事件 |

## 4. 使用 Secret，而非明文 vars

```powershell
npx tsx scripts/upload-tidb-runtime.ts
npx tsx scripts/upload-password-policy.ts --initialize --require-protected
npm run cf:deploy
```

`upload-tidb-runtime.ts` 从加密运行账号文件构造连接，通过 stdin 上传 `TIDB_DATABASE_URL`，不会将密码放入命令行参数。`AUTH_PASSWORD_PEPPERS` 同样从 DPAPI 策略文件经 stdin 上传。

**`--initialize` 只用于确认没有现存密码账号的全新环境。** 本步骤的目标为空安装，允许立即启用严格策略。旧环境不得在丢失密钥后用同名新密钥替换；应按密钥恢复流程操作。旧 `SAKURA_ADMIN_PASSWORD_HASH` 已不再是当前 Worker 必需 Secret，首次管理员由空库注册产生。

若 Wrangler 要先创建 Worker 才接受 Secret，应先在自己的 CF 账户中创建对应空 Worker，再上传 Secret 和部署；不要为了让部署“先跑起来”而临时塞入源码值。

## 5. 首次上线与验证

1. 查看自己的 Worker 部署状态、域名 / TLS 和返回版本。
2. `GET /api/v1/health/tidb` 应返回 connected、https 和只读探测结果，不含用户名、连接字符串或表数据；该接口有独立限速。
3. 在受控窗口完成首位管理员注册，确认后续注册不会成为管理员。应用管理员仍需配置学校 / 组织任职。
4. 验证 Cookie 的 HttpOnly / Secure / SameSite、退出撤销、验证码复用拒绝与 SQL 管理 403。
5. 使用独立合成数据库执行 [云端集成](TESTING.md)，不要对生产运行注册 / 教学写入夹具。

仓库已有的 Worker 集成脚本针对作者的部署命名和额外令牌路由，独立部署时要核对配置与脚本中的基址；它们不是任意地址的一键探测器。本轮开源文档不自动重新部署作者站点或改变其 WAF。

## 6. 旧密码升级、备份与恢复

现有安装更新顺序：一致快照与旧代码 bundle → 支持旧 / 新格式的兼容验证器 → 原账号登录验证 → 对剩余旧摘要增加 HMAC 保护 → 全账号保护确认 → 启用 `requireProtected` → 再次冒烟。详见 [凭据安全说明](verification/security/CF-ENV-SECURITY.md)。

`backup-security-release.ts` 与 `protect-stored-passwords.ts` 是作者现有安装的运维工具，含明确的生产数据库默认值；独立部署者必须检查和适配目标，不能直接照抄运行。快照是否存在不等于已经验证可恢复，正式使用前要在隔离环境完成恢复演练。

完成 v2 哈希迁移后，不可直接回滚只识别旧 scrypt 格式的代码；恢复数据库还需核对迁移期间的新密码和新业务写入。pepper 与数据库快照应分别安全备份，DPAPI 文件复制到其他机器不能直接解密。

## 7. 故障排查

| 现象 | 检查方向 |
| --- | --- |
| 503 / AUTH_CONFIG_UNAVAILABLE | pepper Secret 缺失、格式、密钥编号、部署是否匹配；只检查元数据，不输出值 |
| 503 / 数据服务不可用 | TiDB HTTP 接口、运行账号权限、TLS / 目标地址、限速与超时 |
| 登录失败但健康探测成功 | 哈希密钥、严格策略、账号状态、验证码与冷却；SELECT 1 不证明认证可用 |
| workers.dev 不可用 | 区分 Worker 执行错误、路由、域名与 WAF；不要擅自停用防火墙 |
| 保存超时 | 先确认是否已落盘，结果不明的 COMMIT 不自动重放 |

记录脱敏 traceId、状态、时间和版本即可。API 不支持任意 SQL，公开源码也不会授予数据库管理权限。

官方参考：[Worker Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)、[Wrangler](https://developers.cloudflare.com/workers/wrangler/)、[TiDB HTTP 驱动](https://docs.pingcap.com/tidbcloud/serverless-driver-config/)。当前驱动与交互事务的实验限制仍适用。
