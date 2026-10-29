# 文档导航

**当前基准：2026-10-29，1.0Sakura，业务 schema v15。** 生产运行于 Workers + TiDB，原生 SQLite 用于本地复现和测试。目录下 2026-10-27 / 28 的记录是当时的验收，不自动代表当前线上行为。

## 按阅读目的进入

| 读者 / 任务 | 建议顺序 |
| --- | --- |
| 招聘方 / 面试官 | [项目首页](../README.md) → [作品案例](PORTFOLIO.md) → [架构](ARCHITECTURE.md) → [验证证据](TESTING.md) |
| 首次本地运行 | [快速开始](GETTING-STARTED.md) → [接口约定](API.md) → [贡献指南](../CONTRIBUTING.md) |
| 独立部署 / 运维 | [部署手册](DEPLOYMENT.md) → [安全政策](../SECURITY.md) → [凭据加固](verification/security/CF-ENV-SECURITY.md) |
| 数据模型讨论 | [架构索引](architecture/README.md) → [组织 ADR](architecture/ADR-0001-school-organization.md) → [周课表 ADR](architecture/ADR-0002-weekly-timetable.md) |
| 继续开发 | [路线图](ROADMAP.md) → [更新记录](../CHANGELOG.md) → [贡献指南](../CONTRIBUTING.md) |

## 当前实现的专题说明

- [组织链、兼任与任教资格 v15](verification/organization/README.md)：A 老师同时任班主任与学科组成员，B 负责人查询可协调教师。
- [教研室共享与审批 v14](verification/schedule-sharing/README.md)：可见范围、撤回、审批、冲突和生效后的共享变化。
- [TiDB 迁移](verification/tidb/README.md)：结构映射、外键、检查规则、HTTPS 驱动与实验性事务的限制。
- [TiDB 业务回归](verification/tidb/FUNCTIONAL-TESTS.md)：真实 Worker 链路发现的缺陷及其修复。
- [CF Secret 与密码保护](verification/security/CF-ENV-SECURITY.md)：旧摘要迁移、严格策略、密钥恢复和日志边界。
- [认证与加载可靠性](verification/reliability/README.md)：数据库故障、重试及图标 / 加载处理。
- [1.0Sakura CSS 规范](DESIGN-sakuraedu-1.0Sakura.md)：主题、背景、圆角、动效及减少动态效果规则。

## 如何看历史材料

`BUSINESS-*`、`SQLITE-*`、`CLOUDFLARE-DEPLOYMENT.md` 及多数截图保留了演进过程。例如旧本地验收曾允许 SQLite 控制台读取，而当前公共业务入口已禁止 SQL 查询、备份下载和重置；早期 Cloudflare 文档介绍 Durable Object SQLite，生产现已迁移 TiDB。

判断功能时，优先看本索引链接的当前指南、源码和带 `testedAt` 的具体证据。架构 ADR 中的目标表、Key 流程、学生 / 家长端和完整多租户仍应按 [路线图](ROADMAP.md) 区分设计与交付。
