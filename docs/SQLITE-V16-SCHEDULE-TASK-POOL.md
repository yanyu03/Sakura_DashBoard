# SQLite v16：默认班级与排课中间池

版本：应用 `1.0.2-sakura`；迁移号 16。迁移不猜测或导入旧 `default_class_name` 文本，因为显示名称不是可靠的班级 ID。

## 模型

- `faculty_class_defaults`：每账号最多一个真实默认班级。设置接口只接受该账号在未归档学期、未归档班级中的有效任课班级；归属停用后读取时会忽略旧偏好。
- `schedule_task_pool`：用户自己的排课前置待办。`owner_id` 决定唯一可见账号；可先不选择班级或任课关系。该表没有负责人或管理员旁路读取权限。
- `schedule_submissions`：准备完毕后仍使用原来的正式草稿/提交流程。绑定任务时，后端再次检查所有者、任课、学期、组织单位、权限与时间冲突，并在同一业务事务中把任务标为已关联。

默认班级只作为新建任务的预填上下文，不赋予数据访问权，也不代表组织任职。`department` 或旧默认班级文字均不参与授权。没有有效任课安排的用户可以登记私有任务，但不能将其提交给教研室或写入正式课表。

## API

- `GET /api/v1/schedules/default-class`、`PUT /api/v1/schedules/default-class`
- `GET /api/v1/schedules/task-pool`、`POST /api/v1/schedules/task-pool`
- `PATCH /api/v1/schedules/task-pool/:id`，携带最新 `version`；`action: "cancel"` 关闭本人未关联任务。
- `POST /api/v1/schedules/submissions` 可携带 `pool_task_id`；成功后建立任务到排课提交的单向关联。

## 升级

原生 SQLite 启动时执行 v16，升级前创建 `migration-backups/before-v16-*.sqlite`。全新空库入口和 `cloudflare/schema.json` 已更新到 v16。

TiDB 已有库须先备份，并由维护者按 [TiDB v16 DDL](../server/tidb/migrations/016-private-schedule-task-pool.sql) 执行结构升级，再发布依赖这些表的应用代码。该 SQL 不搬运本地账号或任务；不要把本地 SQLite 任务池直接导入线上库。
