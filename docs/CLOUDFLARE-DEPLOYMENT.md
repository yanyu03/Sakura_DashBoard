# SakuraEdu 1.0Sakura · Cloudflare

部署地址：https://sakura.250221.xyz/?design=1.0Sakura

域名已绑定到 Worker，HTTPS 可用。按用户最终要求，WAF 保留原有策略，临时添加的 Sakura 例外已撤回；非白名单访问仍可能受到站点现有挑战或拦截。`workers.dev` 入口返回 1101，最小诊断程序也复现，当前以自定义域名为入口。

前端由 Workers Static Assets 提供，`/api/*` 转发到 `SakuraSchool` Durable Object。云端使用其持久化 SQLite，复用本地的权限、作业、排课、成绩、关怀和工作台业务逻辑。当前一个实例对应一所学校。

## 首次登录

账号为 `admin`。随机初始密码保存在部署电脑的 `.local-data/cloudflare-initial-admin.txt`，不会提交 Git。云端不使用本地演示密码。初始数据库只有管理员，需先维护教师、班级、科目和学生。不会上传本地 SQLite 或演示数据。

## 开发与发布

```sh
npm ci
npx tsx scripts/prepare-cloudflare-admin.ts
npm run build
npm run cf:check
npm run cf:dev
```

本地 Workers 验证：`npm run test:cloudflare`。普通 Node 开发仍使用 `npm run dev`，本地数据库与云端独立。

正式部署使用 `npm run cf:deploy`，并通过 Wrangler secret 设置 `SAKURA_ADMIN_PASSWORD_HASH`；值来自私有的 `.local-data/cloudflare-admin-hash.txt`，不要写入配置或日志。仅初次创建数据库时使用该哈希，更新 secret 不会重置已有账号。首次部署在 secret 配置完成前会拒绝数据请求。

公网只读验证：

```sh
npx tsx scripts/verify-cloudflare.ts https://sakura.250221.xyz --read-only
```

验证脚本私下读取本机初始密码，不打印凭据；公网模式仅检查资源、登录、数据库结构和退出，不创建业务样本。

Windows 代理拒绝 Node TLS 时，可设置 `SAKURA_VERIFY_CURL=true` 使用系统 curl 验证；凭据通过 stdin 传递。此次公网测试在临时 WAF 例外存在期间通过资源、登录/CSRF、数据库结构和只读限制三组检查，退出检查遭遇本机代理 TLS 连接失败，整组验收尚未全部通过。随后已按要求恢复 WAF 原状。

## 数据与维护

- `cloudflare/schema.json` 是不含业务数据的结构快照，对应本地迁移 1–11。重复发布不会重建数据库。版本或校验和不符时拒绝启动，未来结构变更必须增加显式云端迁移，不能直接重新生成快照覆盖现有库。
- 云端控制台只允许单条 SELECT 或限定的结构检查 PRAGMA；写入必须经过业务 API。
- 云端备份下载为可恢复的 `.sql` 文件，包含建表和数据；不是本地 `.sqlite` 二进制文件。单次最多 10,000 行，更多数据应通过 Cloudflare 数据恢复工具维护。
- 验证码及登录入口受速率限制；正式环境不返回验证码提示。会话使用 Secure / HttpOnly Cookie 和 CSRF 校验。
- Worker 的 JSON 解析仅接受 UTF-8，保留中文及 emoji。字体文件依赖由云端 SVG 验证码实现替代。
- `.dev.vars`、`.wrangler`、本地数据库、初始密码与哈希均被 Git 忽略。

本地验证记录见 `docs/verification/cloudflare/local.json`；公网发布验证记录见同目录 `remote.json`。
