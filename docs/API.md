# API 使用与边界

本文列出稳定的调用约定和主要资源入口，供阅读源码与本地验证使用；不是已经生成的完整 OpenAPI 规范。准确字段和状态转换以对应路由实现为准。

## 基本约定

前缀为 `/api/v1`。浏览器使用同源请求和 Cookie，JSON 写入使用 `Content-Type: application/json`。生产要求 HTTPS，不允许通过查询参数携带密码、Token 或数据库连接描述。

成功响应通常包含：

```json
{"code":200,"success":true,"message":"已加载","data":{},"traceId":"request-id","timestamp":"ISO-8601"}
```

错误响应的 `data` 为 `null`，HTTP 状态与业务类别对应。不是所有成功响应都同时包含 timestamp，调用方应按需要读取字段，不依赖 SQL 文本或底层数据库错误。

## 登录与会话顺序

1. `GET /security/captcha?mode=graphic` 获取 `captchaId` 与 SVG；图像答案由使用者输入，生产不返回测试提示。
2. `POST /auth/register` 使用 `facultyCode`、`email`、`password`、`confirmPassword`、`fullName`（可空）、`captchaId`、`captchaAnswer`。公开注册不接受指定管理员角色。
3. 登录前获取新的验证码，`POST /auth/faculty-login` 提交 `facultyId`、`password`、`loginType: "account"`、验证码字段，可选 `keepOnline`。
4. 登录返回 HttpOnly Cookie 及供写操作使用的 `csrfToken`。读取 `GET /auth/session` 恢复当前用户和会话状态。
5. 后续写操作携带同源 `Origin`、Cookie 与 `X-CSRF-Token`；`POST /auth/logout` 撤销会话。

验证码一次性消费，过期或复用会失败。五次错误后进入分级冷却，429 使用 `Retry-After` / `retryAfterSeconds` 告知等待时间。不要依赖 `facultyId`、前端显示角色或自传人员 ID 来授权资源。

## 主要资源

| 资源 / 路径示例 | 内容与实现 |
| --- | --- |
| `/auth/default-profile` | 读取 / 更新偏好，账号用户名与角色不能通过该入口修改；`server/auth.ts` |
| `/academic/*` | 学期、课程、班级、任教和基础资料；`server/academic.ts` |
| `/organization/admin`、`/organization/scope` | 配置元数据与当前组织范围；`server/organization.ts` |
| `/organization/dispatchable-teachers` | 按负责范围、课程资格返回可协调人员；不返回私人资料或保证空闲 |
| `/schedules/options`、`/schedules/submissions` | 排课选项、草稿与提交；`server/scheduleSharing.ts` |
| `/schedules/entries`、`/schedules/changes` | 正式课时与调代课申请；`server/schedules.ts` |
| `/schedules/entries/:id/sharing` | 调整正式课时共享范围，不能扩大其他业务授权 |
| `/schedules/calendar.ics` | 权限范围内日历导出 |
| `/homework/*`、`/lessons/*`、`/exams/*` | 作业、文本教案、考试与 CSV 业务；对应模块源码 |
| `/students`、`/homework/submissions` | 保留的兼容读取，仍按班级和草稿所有者过滤；`server/legacyViews.ts` |
| `/health/tidb` | 生产固定参数化只读探测，匿名 GET、独立限速、不暴露连接资料 |
| `/sqlite/*` | 当前公共业务入口一律禁止 SQL、备份下载和重置，返回 403 |

日期课表使用实际日期和时间范围，不是周模板。列表的日期 / 分页上限应按对应模块校验；不要把某个接口返回的前 20 / 500 条当作所有数据。

## 状态、并发与失败

| HTTP | 处理方式 |
| --- | --- |
| 400 / 422 | JSON、字段、验证码或业务约束不合法，修正输入 |
| 401 | 未认证 / 会话无效，重新登录 |
| 403 | 当前资源或操作不在权限范围，不能通过换 ID 绕过 |
| 404 | API 或资源不存在；未知 API 不回落到 SPA HTML |
| 409 | 旧 version、冲突、重复关联或当前工作流禁止；先刷新并核对 |
| 413 | 请求超过体积上限 |
| 429 | 认证 / 边缘限速，按 Retry-After 等待 |
| 503 | 数据服务暂不可用；保留会话，先确认前次保存结果 |

更新通常要求提交最近读取的 `version`。提交、审批和正式课时的修改是不同操作；不能直接调用旧的正式课时创建路径跳过审批。考试导入等模块有独立幂等规则，但这不代表所有 API 都支持任意重试。

排查使用 `traceId`、脱敏错误代码和明确的复现步骤，不提交 Cookie、密码、CSRF 值、真实学生姓名或完整数据库错误。测试分层和独立库要求见 [TESTING](TESTING.md)。
