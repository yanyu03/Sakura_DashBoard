# SQLite 本地实测报告

日期：2026-10-27。项目：Sakura_DashBoard，本地分支 `local/1.0sakura-preview`。

**结论：SQLite 引擎、基础持久化、事务与在线备份已验证可用；修复接口与控制台问题后，自动化回归为 21 项通过、0 项失败。仍存在业务约束与接口权限方面的缺口，不能把这些通过项理解为生产环境验收。**

## 环境与数据隔离

- better-sqlite3 驱动，实际引擎为 SQLite 3.53.4，运行在 WAL 模式。
- 运行 DDL 来自 `server/sqliteDb.ts`，初始化 14 张业务表；教师、学生、班级等采用仓库的一条基准演示数据。
- 当前预览库是 `.local-data/sakura_edu.sqlite`。该文件及 WAL 不推送至 GitHub。
- 自动化测试每次在 `.local-data/sqlite-verification-*` 创建全新数据库，并启动独立、随机本地端口的实际 Express 服务。
- 写入、评分、删除、恢复种子和事务故障测试均在隔离库进行。用户预览库仅发生正常页面读取、审计与验证码签发，没有对其执行重置或业务写入测试。
- 测试直接启动 Node 进程，确认旧进程退出和新 PID，再验证记录仍存在；不以页面内存数据作为持久化证据。

## 可重跑命令

```powershell
npm.cmd run test:sqlite
npm.cmd run lint
npm.cmd run build
```

测试脚本为 `scripts/verify-sqlite.ts`，使用项目已有依赖。每次重新创建隔离库，结果覆盖 `docs/verification/sqlite/results.json`，数据库与下载备份保留在对应隔离目录便于复查。

## 通过的检查

| 范围 | 实测结果 |
| --- | --- |
| 初始化 | 14 张业务表、WAL、foreign_keys 开关均符合启动配置 |
| 文件完整性 | `PRAGMA integrity_check` 返回 ok；foreign_key_check 为空，但当前 DDL 没有外键定义，见剩余问题 |
| 参数化 CRUD | 中文、单引号、换行、emoji 插入/读取一致；更新和删除受影响行数正确 |
| 已有约束 | 主键重复和 NOT NULL 违规会被 SQLite 拒绝 |
| 事务 | 提交生效；抛出异常时写入回滚 |
| WAL 并发 | 未提交写入不暴露给第二读连接；提交后可读；竞争写入返回锁冲突 |
| 初始化幂等 | 正常重复初始化不清除既有测试记录 |
| 实际 API 读取 | 独立服务进程能读取前一连接写入的数据 |
| 状态接口 | 路径、journal mode 与实际库一致，报告主文件/WAL/总占用 |
| SQL 控制台 | SELECT、PRAGMA、CTE、注释开头查询、INSERT RETURNING 均正确返回结果 |
| 错误处理 | 空 SQL 和错误 SQL 返回 400，后续连接仍可查询 |
| 业务写入 | 教案 API 写入与物理行一致，并产生审计；评分列与作业列表读取一致 |
| 跨进程持久化 | 服务停止后重新启动，教案写入仍存在 |
| 备份 | 普通备份、活跃 WAL 读事务下备份、三个并发下载均能独立打开并通过完整性检查，已提交标记未丢失 |
| 离线管理请求 | 状态、SQL 执行、恢复种子在服务不可用时返回失败，data 为 null |
| 恢复种子 | 仅在隔离库验证；演示记录恢复，完整性仍为 ok |

自动测试分组总数为 21，部分组内包含多条断言。不是对所有业务接口或所有故障条件的穷尽检查。

## 发现并修复

1. **状态路径不真实、WAL 占用被遗漏。** 原接口始终返回 `data/sakura_edu.sqlite` 和写死的 WAL 文案；主文件只有 4KB 时界面没有显示另有约 MB 级 WAL。现在返回配置后的实际相对路径、真实 journal mode、WAL/SHM 与总占用，更新时间也考虑 WAL。
2. **SQL 按前缀分类不可靠。** 原逻辑只识别 SELECT/PRAGMA/EXPLAIN，WITH 与注释被误判为写操作，RETURNING 的返回行被丢弃。现在使用 SQLite statement.reader 判断是否返回行，用 statement.readonly 区分读取与修改；返回行数与修改行数分别报告。
3. **备份遗漏 WAL 新提交。** 已复现：读事务固定旧快照时，checkpoint 无法覆盖新提交，旧实现仍直接下载主文件，备份缺少最新记录。现在使用 SQLite Online Backup API 创建独立快照，下载完成后清理临时文件；并发请求使用各自快照路径。
4. **断线假成功。** SQLite 管理方法原先在请求失败后返回演示状态、假查询结果或假重置成功。现在这些管理操作不使用内存回退；界面清除旧结果并显示 UNAVAILABLE。失败提示说明操作结果未确认，不假定网络失败意味着服务器绝对没有执行。
5. **控制台不可到达与回调依赖不稳定。** 原代码虽传入打开回调，但没有可操作入口。已在知识库头部接上按钮，并稳定 Toast/查询回调，避免编辑 SQL 时重新触发初始查询。失败响应清除旧结果，避免将旧表格误认成新查询成功。
6. **失败响应的数据类型。** API data 允许为 null；给原有留言和成长批注处理补上失败守卫，防止读取 null 后继续显示成功。

第一轮保留了 15 通过、4 失败的记录：[before-fixes.json](verification/sqlite/before-fixes.json)。最终记录：[results.json](verification/sqlite/results.json)。后续补入了并发下载与离线客户端两组回归。

## 页面端到端验证

入口：打开本地新标准页面 → 教务协同操作手册 → 顶部「SQLite 控制台」。工作台也可先打开业务说明中心，再进入同一入口。

执行了以下只读语句：

```sql
WITH snapshot AS (SELECT sqlite_version() AS version)
SELECT version,
  (SELECT COUNT(*) FROM sqlite_master
   WHERE type='table' AND name NOT LIKE 'sqlite_%') AS business_tables
FROM snapshot;
```

页面实际渲染 `version=3.53.4`、`business_tables=14`。见 [browser-console-result.json](verification/sqlite/browser-console-result.json) 与 [控制台截图](verification/sqlite/browser-console.png)。

从页面点击下载 `.sqlite` 文件，重新用只读连接打开，结果为：integrity=ok、14 张业务表、1 名基准学生，备份 413696 字节。见 [browser-backup-check.json](verification/sqlite/browser-backup-check.json)。

还短暂停止了本地服务，页面点击刷新和执行后显示 UNAVAILABLE、清除旧查询表格并提示无法确认操作结果，见 [离线截图](verification/sqlite/browser-offline.png)。随后重启服务并重新验证在线查询。本地服务最终保持运行。

## 仍待处理的实际问题

- **管理接口没有身份与角色校验。** 测试未携带登录信息仍可调用 `/sqlite/query`。查询端点本身允许任意 SQL，恢复种子与下载也没有权限中间件。本地服务目前仅监听 127.0.0.1；这不能替代鉴权，也不能作为直接开放部署的依据。
- **关联完整性缺失。** 运行 DDL 的外键定义数量是 0，虽然开启 foreign_keys，也不会自动阻止孤立 student_id/thread_id 等。没有额外的业务查询索引，只有主键与 UNIQUE 自动索引；本次未做大数据性能验收。
- **评分接口可能假报成功。** 对不存在的作业 ID 提交评分，HTTP 仍为 200/success=true，实际没有对应记录可更新。应检查受影响行数并返回 404；分数范围验证也需要补充。
- **作业过滤未真正执行。** 请求不存在班级与 pending 状态仍返回 1 条基准作业；源码读取全部行，未使用 className/status 条件。审计示例 SQL 与实际执行 SQL 也不完全一致。
- **文档 DDL 与运行库不同。** `src/database/schema.sql` 带 COMMENT 等语法及更多关联约束，不能当作已在 SQLite 执行的建表事实；当前由 `server/sqliteDb.ts` 初始化。未来迁移应建立统一版本与升级测试。
- **其他业务服务仍有演示回退。** 本次关闭的是 SQLite 管理操作的假成功，不等于所有业务接口已切换为严格持久化失败处理。

这些问题已明确记录，未在本次测试中批量重构业务、迁移已有库或改变登录权限设计。所有代码改动仍在本地，未提交或推送 GitHub。
