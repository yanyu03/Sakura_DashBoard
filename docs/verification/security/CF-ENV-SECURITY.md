# CF ENV 凭据与密码加固（1.0Sakura，2026-10-29）

本次范围是登录密码、数据库凭据和日志中的敏感信息。业务表中的姓名、成绩等字段仍保持既有格式，不宣称完成字段加密、全部角色授权验收或容量验收。

## 请求与凭据边界

浏览器通过同源 HTTPS 请求 Cloudflare Worker。Worker 从 `env.TIDB_DATABASE_URL` 读取连接描述，从 `env.AUTH_PASSWORD_PEPPERS` 读取密码保护密钥；二者均由 Wrangler **Secret** 注入，不写入明文 `vars`、前端包、接口响应或 Git。数据库使用受限运行账号，禁止 root、系统库、非 TiDB Cloud 主机与附加连接参数。

Worker 使用官方驱动，通过固定的 `https://http-<TiDB 主机>/v1beta/sql` 发送参数化查询，校验目标地址与路径。显式设置 `redirect: "manual"` 并拒绝所有 3xx，避免凭据被重定向转发。Workers 不支持 `redirect: "error"`；此限制经过实际测试确认。

认证、提交的 HTTP 请求在访问数据库前拒绝；页面 GET/HEAD 升级为 HTTPS，响应带 HSTS。浏览器配置禁止将认证请求转向其他源。凭据类 URL 参数被拒绝。用户仍应避免把秘密放入网址，因为浏览器、代理或边缘设施可能在请求到达应用前记录网址。

凭据需要在 Worker 内存中被解密使用，才能向数据库认证。数据库密码不能单向哈希后替代连接密码；这里保护的是存储、传输与暴露边界，不承诺进程内没有明文。TiDB 公网端点仍存在，持有合法管理员凭据者也能独立访问；此次没有宣称实现网络层仅允许 CF 访问，也没有修改 WAF。

## 密码格式与旧账号

- 新密码：每用户随机 16 字节盐，`scrypt(N=16384,r=8,p=5)`，64 字节输出，再使用独立 pepper 做 HMAC-SHA512。数据库只保存版本、成本、盐、密钥编号和最终摘要；pepper 保存在另一凭据边界的 CF Secret 中。
- 格式：`scrypt$v2$16384$8$<p>$<salt>$<key-id>$<digest>`。验证只接受限定成本，比较采用恒定时间函数。数据库摘要不能直接作为密码登录。
- 迁移：先部署兼容验证器，并确认原管理员成功登录。随后对未登录的旧摘要做 HMAC 包装，无须恢复或重置用户密码；这些账号暂保留 `p=1`，下次正确登录时以比较并交换方式升级到 `p=5`。密码更新与会话创建在同一事务内完成。
- 所有旧摘要保护成功后，设置 Secret 策略 `requireProtected: true`，拒绝旧格式和没有 pepper 的格式，防止降级。原账号和有效会话保持兼容。

密钥轮换必须保留仍被账号引用的旧密钥。新登录自动升级到当前密钥；所有账号迁移前不得删除旧密钥。丢失密钥时脚本默认失败，不会自行生成同编号替代密钥。`--initialize` 仅供没有现存账号的全新环境初始化。

完成哈希迁移后，**不能直接回滚到旧验证器**。恢复应使用支持 v2 的代码；如确需恢复凭据备份，必须核对迁移期间的密码变更，避免覆盖新密码。备份与 pepper 需分别保存在合适的受保护恢复介质中。

## 运维文件与日志

项目 `.local-data/` 下的运行账号、测试入口令牌、初始管理员凭据和 pepper 文件采用 Windows DPAPI CurrentUser 加密。旧项目 JSON/文本凭据读取时会原地迁移，写入后先解密比对再替换；不保留明文副本。迁移快照与旧摘要备份同样加密，公开验证报告仅含计数和校验和。

DPAPI 文件与当前 Windows 用户及其系统密钥绑定，复制到其他机器不能直接恢复。用户提供的桌面原始 JDBC 文本是项目外的输入文件，此次保留原件，不把它描述为已加密；运维初始化脚本仍可从该文件读取管理凭据。生产 Worker 不读取或部署该文件。

服务日志只保留受限错误代码、操作类别和追踪编号，不记录底层错误消息、SQL 参数、请求体、密码或连接字符串。浏览器调用历史丢弃 SQL 文本和查询值；业务审计使用路径而非完整查询网址。Worker 自动请求日志和 tracing 关闭，保留脱敏的应用事件。此策略不追溯删除历史日志，也不控制其他边缘产品的独立日志设置。

## 发布与验证

发布顺序：`backup-security-release.ts` → 部署兼容代码 → 原管理员登录冒烟 → `protect-stored-passwords.ts --apply` → `upload-password-policy.ts --require-protected` → 再次线上验证。脚本使用加密本地凭据，上传 Secret 通过 stdin；请勿将值放入命令行参数。

- `hardening.json`：11 项密码、密钥轮换、严格策略、DPAPI、目标地址、HTTPS 与日志边界测试。
- `cf-hardening.json`：隔离测试库经真实 Worker 的 6 项认证、权限与响应验证。记录的往返时间包含网络及数据库访问，不等于哈希计算时间。
- `backup.json`：发布前生产数据库加密快照的汇总凭证。
- `password-protection.json`：生产账号摘要保护和等待成本升级的数量。
- `remote.json`：严格策略下的生产登录、限速、只读业务、权限与退出冒烟。

SQLite 仅供本地测试，默认使用相同加强成本、带盐的 v2 摘要；生产 TiDB 必须配置 pepper，配置缺失时拒绝服务。SQLite 本地测试不宣称具有生产 Secret 边界。官方 TiDB HTTP 驱动及交互事务的预览状态和其他已知业务限制仍见 [TiDB 迁移说明](../tidb/README.md)。

依据：[Cloudflare Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)、[Workers Request redirect 限制](https://developers.cloudflare.com/workers/runtime-apis/request/)、[OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)。
