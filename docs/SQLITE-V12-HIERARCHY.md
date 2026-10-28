# SQLite v12：组织、身份与对象绑定

> 本文描述 v12 的结构边界。后续 [v14 课表共享](verification/schedule-sharing/README.md) 已为排课模块增加明确的任职范围授权；[v15 组织与兼任](verification/organization/README.md) 已实现语义组织链、人员关联、班级归属和资格目录。[学校架构目标](architecture/ADR-0001-school-organization.md) 中其余部分仍待分阶段实施。

本次为增量结构升级，保留 v1–v11 历史校验和和业务数据。新增 9 张元数据表，不自动把旧管理员、教师、学生归入新组织，也不根据姓名推断亲属或上下级。新的表不提供业务访问授权；完整用户隔离、首位 root 初始化与 Key 上报流程仍按 `USER-ISOLATION-DESIGN.md` 后续实施。

## 组合身份

内部 `id` 是稳定关联键，工号、学号等放在 `external_id`。唯一身份由 `institution_id + identity_kind + external_id` 组成，其中身份类型为 staff/student/guardian。同一学校工号 001 与学号 001 可共存；不同学校可使用相同编号。编号比较不区分英文字母大小写，创建后不能修改其组织、身份类型或编号。姓名选填；登录账号通过可选 `account_id` 与既有账号表关联，一名账号可以在不同组织或身份类型下拥有身份。

组织关系描述学校的行政结构，任职关系描述某人担任某岗位，直属汇报关系描述岗位上的上下级。这些关系都不自动授予读取私人内容的权限。系统 root 是独立的平台管理职责，不作为默认的业务上级岗位导入。

## 新增表

| 表 | 用途与组合约束 |
| --- | --- |
| institutions | 学校/机构命名空间，机构代码唯一 |
| organization_units | 校级、校区、处室、部门、年级、班级、小组；机构内单位代码唯一，父子必须同机构 |
| identity_registry | 工号/学号/监护人编号及可选登录账号映射；机构＋类型＋编号唯一 |
| identity_roles | 主任、辅导员、导师、教师、学生、监护人身份类别；不包含数据访问能力 |
| organization_positions | 单位下的岗位、岗位代码和 hierarchy_level；数字越小层级越高 |
| identity_appointments | 身份担任岗位的起止日期及状态；同一身份同一岗位只允许一条 active 记录 |
| identity_reporting_lines | 任职间的直属上级；同机构、高于下级、属于本单位或祖先单位；单个任职仅一个 active 直属上级 |
| identity_objects | 对业务对象建立元数据登记：机构＋对象类型＋source_ref 唯一，记录同机构所有者身份 |
| identity_object_bindings | 身份＋对象＋关系＋period_key 的组合绑定；支持教学、辅导、监护、本人档案、上报等关系与 pending/confirmed/revoked 状态 |

可用组织父子关系：school → campus/division/department/grade；campus → division/department/grade；division → division/department/grade；grade → class；department/class → group。任职和岗位允许行政与教学身份并存；学生和家长可以拥有相应身份岗位，但不能加入行政职工直属汇报链。辅导或监护关系通过对象绑定描述。

机构、单位、身份、任职、对象、绑定通过复合外键限定同一机构，不接受只凭一个工号、学号或对象 ID 跨机构关联。组织每个机构只能有一个根；父子类型、自指、循环、反向岗位层级和跨部门越级汇报均被约束或触发器拒绝。组织的父节点与类型、岗位定义及任职身份定义固定；组织调整需建立新定义并结束旧任职，保留历史，不直接改写既有树。

## 对象绑定示例

- 学生身份：`学校 A + student + 20260001`。
- 该学生的档案登记：`学校 A + student + 原学生记录 ID`，所有者为学生身份。
- 监护人身份：`学校 A + guardian + G0001`。
- 绑定：`监护人身份 ID + 档案登记 ID + guardian_of + 2026学期`；初始为 pending。
- 确认记录要求对象所有者为 created_by、接收身份为 confirmed_by，并携带 64 位小写十六进制 Key 哈希；没有确认者或证明摘要不能进入 confirmed。监护人类型不能伪装教师关系，职工类型不能建立 guardian_of 关系。

这些字段只提供完整性约束，不能证明操作者已经登录或 Key 的真实性。后续服务端必须从会话取得操作者，验证 Key 的来源、用途、期限、单次核销和双向确认，不能信任请求自行提交 created_by/confirmed_by。哈希字段不是明文 Key，也不能用来代替完整授权流程。

`identity_objects.source_ref` 当前是业务对象登记标识，不是指向所有旧业务表的多态外键；创建登记时仍需专用服务按对象类型校验实际业务记录与数据域。绑定不会自动开放旧业务 API。任职、身份停用或关系撤销后，授权服务需每次校验当前状态；本次迁移不自动重写历史关系或生成授权。

## 迁移与验证

本地 `migrateDatabase` 增加 v12，迁移前生成 `migration-backups/before-v12-*.sqlite`，DDL 和迁移账本在事务中写入，失败回滚。重复迁移检查校验和，不重复建表，不导入身份数据。

Cloudflare 保留原 v11 空结构快照，旧库和新库都在初始化后显式应用同一 v12 语句；不覆盖原快照，不修改原校验和。SQLite API 已被本地共享认证中间件禁止，新增结构通过内部迁移执行；不需要恢复任意 SQL 控制台。

测试：`npm run test:hierarchy` 覆盖组织与身份组合、错误角色、跨机构外键、岗位与直属上级、循环及反向层级、对象绑定证明和重复迁移。`npm run test:migrations` 检查历史数据、备份恢复、幂等性和迁移校验。结果记录在 `docs/verification/hierarchy/results.json`。

本次仅升级结构及 Cloudflare 适配代码，尚未部署到正式云端；结构验收不能等同于用户内容隔离验收。
