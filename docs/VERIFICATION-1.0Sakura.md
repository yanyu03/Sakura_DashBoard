# Sakura_DashBoard · 1.0Sakura 本地接入验证

验证日期：2026-10-27。基线：`7394d49cb5a49f2e372b5106f544872194e2ea12`。

结论：**可以接入，需要变量映射与共同层顺序。** 本地已提供原版、新标准业务页面和原生组件验证页。改动尚未提交或推送到 GitHub。

## 启动与对照

在仓库根目录执行：

```powershell
npm.cmd install --no-audit --no-fund
npm.cmd run dev:standard
```

- 原版：<http://localhost:3000/>
- 新标准：<http://localhost:3000/?design=1.0Sakura>
- 组件与动效：<http://localhost:3000/?design=1.0Sakura&components=1>

组件页不操作业务数据。业务页面使用本地 Express 与 SQLite 测试数据，登录表单使用仓库的演示账号和自动填充示例验证码。测试未更改默认账户信息或提交成绩、消息。

`dev:standard` 将数据库放在忽略目录 `.local-data`，避免测试写入仓库跟踪的 SQLite WAL。服务默认监听 127.0.0.1，可用 PORT、HOST、SAKURA_DATA_DIR 覆盖。

## 实际接入范围

1. `docs/DESIGN-sakuraedu-1.0Sakura.md` 是设计来源，八段附录 CSS 生成 `src/styles/SakuraEdu_1.0Sakura.css`。
2. `scripts/sync-design-standard.py` 从 YAML 生成七主题元数据及 Tailwind 语义适配层，需要 Python + PyYAML。普通运行不需要 Python。
3. 新标准仅在 URL 含 `design=1.0Sakura` 时加载；原版仍使用原来的三个主题。
4. 原版 Tailwind 布局保留，通过局部 `--color-* → --sakura-*` 映射应用新主题和圆角。旧绿主题偏好映射至 forest-tea，旧粉主题映射至 sakura-milk；本地预览不会自动写回偏好。
5. 业务页面加入登录主按钮、验证码加载圆环、工作区与 Toast 进入动画。骨架、原生输入框、状态徽章、错峰和退出生命周期在组件页单独验证，未批量替换全部业务控件。

## 发现并修复的问题

| 问题 | 原因 / 修复 |
| --- | --- |
| npm 安装失败 | Vite 8.3.5 需要 esbuild ^0.27 或 ^0.28，原项目声明 ^0.25；本地调整为 ^0.28.2 并生成 package-lock.json |
| 类型检查失败 | API 主题联合仍是旧 sakura-classic，且 ParentChatThread 缺少 SQLite 已使用的可选 topicTag；统一类型并兼容旧粉主题 ID |
| 焦点轮廓被覆盖 | Tailwind 提前注册 components，而后导入的 legacy 处于更高普通优先级；在 Tailwind 导入前显式登记共同层顺序 |
| 七主题挤占顶部 | 新标准业务页的桌面主题入口改为有标签的 select；手机继续使用原抽屉 |
| 动画退出后无法再次展开 | 验证页原先将隐藏面板的 leaving 状态也用于禁用按钮；现在仅退出进行中禁用，并有事件与定时器清理 |

宿主共同层顺序：

```css
@layer theme, base, legacy, themes, components, motion, responsive, utilities, accessibility;
@import "tailwindcss";
```

该兼容约定也已补回 Downloads 的设计 Markdown。独立标准 CSS 的视觉令牌保持原定义。

## 检查结果

| 验证边界 | 结果 | 证据 |
| --- | --- | --- |
| TypeScript | 通过 | npm run lint，无类型错误 |
| 生产构建 | 通过 | npm run build，生成业务与组件页及两份条件加载 CSS |
| Markdown 与 CSS | 通过 | 附录与样式表逐字一致；七主题键、CSS 语法、变量引用和层顺序校验通过 |
| 七主题代表性主按钮 | 通过 | [theme-checks.json](verification/theme-checks.json)：配色符合令牌，桌面高 38px，圆角 6px，过渡 0.12s |
| 七业务模块 | 通过渲染与导航检查 | [module-checks.json](verification/module-checks.json)：均有内容，无页面横向溢出，工作区进入动画 0.24s |
| API → SQLite → 响应 | 通过 | [api-checks.json](verification/api-checks.json)：偏好、作业、学生、教案、课表、成绩、家校与数据库状态八个端点 success=true / code=200 |
| 手机 390×844 | 通过代表性检查 | 批阅页面板、抽屉主题切换与长答卷内部滚动可用；原生按钮和输入框高 44px，无页面横向溢出 |
| 键盘焦点 | 通过 | Tab 到原生输入框时 :focus-visible=true，2px solid #fb7185 轮廓 |
| 加载状态 | 通过 | busy=true、原生 disabled、可读状态文字，圆环 sakura-spin / 0.9s；演示完成后恢复 |
| 进出场 | 通过 | 退出后 DOM 移除，显示按钮恢复可用，可再次进入；160ms 退出配合 180ms 超时兜底 |
| 骨架与错峰 | 通过样式检查 | 骨架名 sakura-skeleton-pulse；前三项延迟为 0 / 40 / 80ms |
| 生产环境 CSS | 通过 | 单独在 3001 启动构建结果，焦点、按钮背景、卡片半径和骨架样式与开发版一致；见 [production-check.json](verification/production-check.json) |
| 浏览器控制台 | 通过本次观察 | 七模块切换与组件页、生产页未记录到 error / warn |

静态复验：

```powershell
python scripts/sync-design-standard.py
python scripts/verify-design-standard.py
npm.cmd run lint
npm.cmd run build
```

静态校验脚本还需要 tinycss2。浏览器记录为本次人工驱动验证证据，并非自动重放的全量 E2E 套件。

## 验证边界与剩余工作

- 这是兼容接入与代表性验证，不等于将全部 Tailwind 业务组件重写为原生 `.sakura-*` 组件。原有网格、56px 业务导航和移动面板架构继续保留；未强制替换成标准中的固定三栏尺寸。
- 系统 prefers-reduced-motion 分支已做静态与变量检查，未在本次浏览器中切换操作系统偏好，不能宣称已完成该分支的视觉实测。
- 未完成全主题 AA / AAA 对比度审计、全部控件触控尺寸和所有移动业务模块的逐项验收。深色正文与代表性按钮可读，个别批注和图表仍有业务硬编码色。
- 构建保留上游的 Vite __dirname 迁移提示与大于 500kB 的主包提示，不影响本次构建成功。
- 外部模型接口未启用；AI 按钮依旧使用仓库原有示例服务。本次未调用付费模型或部署服务。

## 截图

- [原版登录](verification/baseline-login.png)
- [新标准登录](verification/standard-login.png)
- [桌面工作台](verification/standard-desktop.png)
- [深色桌面](verification/standard-dark-desktop.png)
- [手机批阅](verification/standard-mobile.png)
- [手机原生组件](verification/standard-components-mobile.png)
- [标准组件与键盘焦点](verification/standard-components-desktop.png)
