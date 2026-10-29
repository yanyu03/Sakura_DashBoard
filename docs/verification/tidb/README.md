# TiDB 平移与加载适配

日期：2026-10-29。业务结构沿用 v15；TiDB 是生产存储，原生 SQLite 保留为本地测试引擎。

后续完整业务回归与修复见 [功能测试记录](FUNCTIONAL-TESTS.md)，包含首注册管理员、读取接口、成绩轨迹和私有内容保护的修正及明确未验收范围。

## 数据与切换

正式来源是线上 `sakura-dashboard / SakuraSchool / school`，不是本地调试库或 TiDB 测试库。最终快照在维护模式暂停应用写入后取得，保存在忽略提交的 `.local-data/tidb-migration/`，另有切换前 SQLite 备份及源码备份。账号 ID、密码哈希、已有课时及业务关系按原值复制；不重新注册、不按姓名合并账号。

生产库 `sakura_edu_prod_20261029` 与 `sakura_migration_20261029` 分开。后者的合成测试账号、组织和课表不会进入生产。`production-import.json` 记录 58 张表逐行比较、来源快照哈希及外键孤儿检查；包含用户资料的原始备份不提交到 Git。运行账户只授予该库 SELECT、INSERT、UPDATE、DELETE，不授予 DDL、账户管理或系统库权限。

旧 Durable Object 随 TiDB 模式关闭业务访问，保留归档。应用不自动切回旧库：TiDB 开始接收写入以后，回滚必须先暂停写入并反向核对新数据，不能直接启用已经过期的 SQLite 快照。WAF 未作修改。

## 运行方式与约束

业务 SQL 改为异步接口，事务固定在同一连接上下文；SQLite 测试适配器串行执行，支持跨 await 的保存点。Workers 使用 `@tidbcloud/serverless` 0.3.0 的 HTTPS 驱动，避免复用失效 TCP 连接。Hyperdrive 与当前 TiDB 网关认证协商不兼容，未用于此次部署。运行位置提示为新加坡附近，数据库凭据只存于 Worker Secret。

保留 99 个外键、34 组旧触发器规则和 60 项检查规则。其中 54 项为 TiDB 原生 CHECK，6 项因外键动作列限制由应用事务检查；所有 60 项均经过应用写入检查。检查规则与组织图修改在事务内执行，锁住统一写入协调行，并增加 epoch 以触发并发写入冲突。运行账户持有者仍可以绕过应用检查，因此不能把数据库凭据交给客户端或普通用户。这里不宣称所有历史模块已经完成权限收紧，尚未实现的 Key 报送等功能仍见架构路线图。

每次 HTTPS 数据库请求最多等待 7 秒；锁争用返回可重试的服务不可用响应。SQL 写入及结果不明的 COMMIT 不自动重放。网络故障保留登录状态，界面要求先确认保存结果再重新提交。客户端读取等待 15 秒、提交等待至少 45 秒，页面在等待期间保留反馈。此处是单次请求上限，不是整项复杂业务的响应时间承诺。

**限制：官方驱动仍为 Public Preview，交互事务标为 experimental。此次通过实际 Workers 场景和故障测试，但尚不能作为大规模推广或容量验收。** 官方说明：[TiDB Cloud Serverless Driver](https://docs.pingcap.com/tidbcloud/serverless-driver-config/)。约束检查当前含表扫描，大规模数据下应改为精确行检查并进行独立并发、容量与恢复演练。

## 验证与加载

- `api.json`：独立 TiDB 库经实际 Cloudflare HTTPS 入口完成 9 个场景，涵盖迁移账号登录、组织链、多岗任教资格、作用域、撤销即时生效、课表提交审批、SQL 管理封禁和退出。
- `failures.json`：3 个故障注入场景，覆盖提交确认丢失不重放、连接释放后恢复、读取失败 503 且不撤销会话。该文件是故障注入测试，不代表实际断网压测。
- `read-compatibility.json`：3 项 TiDB 搜索和环境检查验证，覆盖文本拼接、中文和引号参数、不匹配关键词。`runtime-privileges.json` 验证运行账户权限、TLS 主机名校验和 99 个实际外键。
- `constraints.json`：54 项原生检查与 6 项应用事务检查的边界。
- 原生 SQLite 回归：注册 6、冷却 9、组织 22、课表共享 17、可靠性 11、身份层级 16、迁移 7 项通过。类型检查和生产构建通过。
- 线上切换后的冒烟记录见 `../security/remote.json`，部署版本见 `deployment.json`。

主要教学模块改为 React.lazy/Suspense 按需加载，加载动画遵循减少动态效果偏好。App 分包由约 168 KB 降至 74.02 KB（gzip 23.28 KB）；另有公共入口 222.91 KB（gzip 69.93 KB），不能将分包大小当作整站总下载量或实际首屏耗时。

## 课表参考

用户提供的授课总表用于核对班级、周课时、任课关系及轮换规则。结构设计见 [学期周课表与日期课时](../../architecture/ADR-0002-weekly-timetable.md)。本次保持旧日期课时事实不变；周模板、作息、校历、导入预览需要独立增量迁移与接口验收。未将原始工作簿或教师姓名导入生产。

## 运维脚本

### Worker 到 TiDB 的直接探测

`GET https://sakura.250221.xyz/api/v1/health/tidb` 直接由现有 Worker 处理，不启动 Express。每次执行固定的参数化只读查询 `SELECT 1 AS ok, ? AS probe`，通过本次请求的随机 traceId 核对真实往返结果。返回 `connected`、引擎、HTTPS 传输类型和 `queryMs`；不返回数据库地址、账号、表数据或底层错误。`queryMs` 是 Worker 到 TiDB 的请求耗时，不等于纯 SQL 执行时间。

该最小健康接口允许匿名 GET，禁止缓存；POST 等方法返回 405，任何查询参数返回 400，均不访问数据库。`HEALTH_LIMITER` 单独配置每来源 IP 每 60 秒 6 次，Cloudflare 限额按数据中心计数并近似执行，不是全局精确计数。故障返回 503 和 `Retry-After: 3`，触发限速返回 429。

执行 `tsx scripts/verify-tidb-worker-health.ts` 可获取 3 次真实线上连接样本，并检查写方法与 SQL 参数被拒绝。结果见 `worker-health.json`。验证命令只读，不创建或修改业务数据。

`export-cloudflare-sqlite.ts` 由已登录的 Wrangler 读取线上快照；`prepare-tidb.ts --schema-only` 预建结构，省略参数后导入并逐表验证。导入拒绝覆盖已有账号的目标库；目标库由 `TIDB_DATABASE` 明确指定，禁止系统库。`provision-tidb-runtime.ts` 创建受限账户，私有凭据保存在 `.local-data/`。不要在生产入口运行 `verify-tidb.ts` 的合成业务测试。

`test:organization-workers`、`test:schedule-workers` 等旧 Workers SQLite 验证脚本保留作历史参考，不能用于本轮归档后的生产 Worker；当前 SQLite 回归使用原生测试适配器，TiDB 场景使用独立预览数据库。旧 `test:sqlite` 首轮综合脚本仍有旧表数量及 SQL 管理接口断言，尚未适配当前封禁策略，本轮不计入验收。
