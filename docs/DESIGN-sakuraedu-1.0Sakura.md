---
version: 1.0Sakura
name: SakuraEdu-design-system
description: 樱花教务云设计规范：桌面优先的教学管理工作台，浅粉白画布、深色正文、微圆角与柔和阴影；包含七套语义主题、组件与状态令牌，以及完整单文件 CSS。
colors:
  primary-50: '#fff1f2'
  primary-100: '#ffe4e8'
  primary-200: '#fecdd3'
  primary-300: '#fda4af'
  primary-400: '#fb7185'
  primary-500: '#f43f5e'
  primary-600: '#e11d48'
  primary-700: '#be123c'
  primary-800: '#9f1239'
  primary-900: '#881337'
  surface-canvas: '#fff7fa'
  surface-card: '#ffffff'
  surface-muted: '#fff0f3'
  surface-accent: '#ffe9ed'
  surface-glass: rgba(255, 255, 255, 0.85)
  text-primary: '#2b141e'
  text-secondary: '#633b4d'
  text-muted: '#9c7888'
  text-inverse: '#ffffff'
  text-brand: '#e11d48'
  border-subtle: '#ffeef1'
  border-default: '#ffe4e8'
  border-hover: '#fecdd3'
  border-focus: '#fda4af'
  success: '#10b981'
  success-bg: '#ecfdf5'
  warning: '#f59e0b'
  warning-bg: '#fffbeb'
  danger: '#f43f5e'
  danger-bg: '#fff1f2'
  info: '#0ea5e9'
  info-bg: '#f0f9ff'
  button-primary-bg: '#e11d48'
  button-primary-text: '#ffffff'
  focus-ring: '#fb7185'
  text-link: '#e11d48'
  surface-control: '#fff0f3'
typography:
  font-sans: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif
  xs:
    fontFamily: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif
    fontWeight: 400
    fontSize: 12px
    lineHeight: 1.5
    letterSpacing: 0px
  sm:
    fontFamily: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif
    fontWeight: 400
    fontSize: 14px
    lineHeight: 1.5
    letterSpacing: 0px
  base:
    fontFamily: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif
    fontWeight: 400
    fontSize: 16px
    lineHeight: 1.5
    letterSpacing: 0px
  lg:
    fontFamily: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif
    fontWeight: 600
    fontSize: 18px
    lineHeight: 1.4
    letterSpacing: 0px
  heading:
    fontFamily: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif
    fontWeight: 700
    fontSize: 20px
    lineHeight: 1.3
    letterSpacing: 0px
  font-regular: 400
  font-medium: 500
  font-semibold: 600
  font-bold: 700
  rules:
  - 支持中文系统字体回退；字号和字重为补充定义
  - '数字/日期建议 font-variant-numeric: tabular-nums'
  - 禁用将非正文的浅色占位色用作普通小字号正文
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  content-gap: 16px
  content-padding: 16px
  header-horizontal: 24px
  card-padding: 16px 20px
  tag-padding: 2px 8px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 48px
  control-height: 38px
  touch-target: 44px
shadows:
  sm: 0 1px 2px 0 rgba(244, 63, 94, 0.05)
  md: 0 4px 12px -2px rgba(244, 63, 94, 0.08), 0 2px 4px -2px rgba(43, 20, 30, 0.02)
  lg: 0 10px 24px -4px rgba(244, 63, 94, 0.12), 0 4px 8px -2px rgba(43, 20, 30, 0.04)
  btn: 0 2px 8px 0 rgba(244, 63, 94, 0.25)
  inner: inset 0 2px 4px 0 rgba(244, 63, 94, 0.04)
layout:
  target-viewport: 1920x1080
  header-height: 64px
  sidebar-width: 240px
  left-column-width: 340px
  center-column: flex 1 1 auto; min-width 0
  right-column-width: 400px
  main-height: calc(100vh - 64px)
  scroll-policy: 'desktop: window hidden / panels auto; mobile: document auto'
  box-sizing: border-box
  app-shell: flex column; min-height 100dvh
  desktop-min: 1280
  safe-area: env(safe-area-inset-bottom)
  breakpoints:
    compact-phone: 'max-width: 479px'
    phone: 'max-width: 767px'
    tablet: 768px to 1279px
    desktop: 'min-width: 1280px'
  z-index:
    base: 0
    sticky: 20
    header: 40
    overlay: 100
    dialog: 200
    toast: 300
components:
  badge-fixed:
    flex-shrink: 0 !important
    white-space: nowrap
    purpose: 在横向弹性排列中，徽章、时间戳、图标等必须锁定绝对宽度与禁止换行，坚决杜绝因右侧长文本膨胀导致的变形或竖排挤压。
  meta-time:
    flex-shrink: 0 !important
    white-space: nowrap
    purpose: 在横向弹性排列中，徽章、时间戳、图标等必须锁定绝对宽度与禁止换行，坚决杜绝因右侧长文本膨胀导致的变形或竖排挤压。
  icon-fixed:
    flex-shrink: 0 !important
    white-space: nowrap
    purpose: 在横向弹性排列中，徽章、时间戳、图标等必须锁定绝对宽度与禁止换行，坚决杜绝因右侧长文本膨胀导致的变形或竖排挤压。
  avatar:
    flex-shrink: 0 !important
    white-space: nowrap
    purpose: 在横向弹性排列中，徽章、时间戳、图标等必须锁定绝对宽度与禁止换行，坚决杜绝因右侧长文本膨胀导致的变形或竖排挤压。
  text-truncate:
    flex: 1 1 auto
    min-width: 0 !important
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap
    purpose: '解决 Flex 布局中子元素文字溢出或挤压同级元素的最关键规则——必须重置浏览器的 `min-width: 0 !important`，并结合省略号。'
  clamp-2:
    display: -webkit-box
    -webkit-line-clamp: '2'
    -webkit-box-orient: vertical
    overflow: hidden
    line-height: '1.5'
    word-break: break-word
    purpose: 用于学生评语、教案简要描述、备课反思手账卡片，超过两行时自动优雅截断并展示省略号。
  clamp-3:
    display: -webkit-box
    -webkit-line-clamp: '3'
    -webkit-box-orient: vertical
    overflow: hidden
    line-height: '1.5'
    word-break: break-word
    purpose: 用于教案考点解读与大单元教学目标卡片，三行截断保障不同字数卡片的视觉底线整齐划一。
  tag:
    display: inline-flex
    align-items: center
    gap: 4px
    padding: 2px 8px
    border-radius: '{rounded.xs}'
    font-size: '{typography.xs.fontSize}'
    font-weight: '{typography.font-medium}'
    line-height: '1.4'
    white-space: nowrap
    flex-shrink: '0'
    purpose: 微圆角 4px 标签，保障水平方向至少 8px 内边距，彻底杜绝圆角弧度切掉汉字首字或尾字。
  app-header:
    height: 64px
    flex-shrink: '0'
    background: '{colors.surface-card}'
    border-bottom: 1px solid {colors.border-default}
    display: flex
    align-items: center
    justify-content: space-between
    padding: 0 24px
    z-index: '40'
    purpose: '64px 顶部导航；常驻行为依赖工作台容器布局，当前 CSS 使用 position: relative。'
  app-sidebar:
    width: 240px
    height: calc(100vh - 64px)
    flex-shrink: '0'
    background: '{colors.surface-card}'
    border-right: 1px solid {colors.border-default}
    overflow-y: auto
    display: flex
    flex-direction: column
    purpose: 固定宽度 240px，自适应屏幕净高（calc(100vh - 64px)），内部独立滚动，承载 7 大教学子系统入口。
  app-content:
    flex: 1 1 auto
    height: calc(100vh - 64px)
    overflow: hidden
    display: flex
    padding: 16px
    gap: 16px
    purpose: 占满剩余宽高，通过 Flex 布局实现左、中、右三栏流式联动，四周预留 16px 呼吸间距。
  col-left:
    width: 340px
    flex-shrink: '0'
    height: 100%
    overflow-y: auto
    purpose: 固定宽度 340px，高频承载班级名册、作业试卷流、学生关怀名录或教案章节树，内部纵向滚动。
  col-center:
    flex: 1 1 auto
    min-width: '0'
    height: 100%
    overflow-y: auto
    purpose: '主视线焦点，自适应拉伸占满中央剩余区域（flex-1），设置 min-width: 0 避免宽表格撑破视口，内部滚动。'
  col-right:
    width: 400px
    flex-shrink: '0'
    height: 100%
    overflow-y: auto
    purpose: 固定宽度 400px，专用于 Sakura-AI 学情诊断、分数段柱图、家庭360°画像、备课手账或目录导览。
  card:
    background: '{colors.surface-card}'
    border: 1px solid {colors.border-default}
    border-radius: '{rounded.lg}'
    box-shadow: '{shadows.md}'
    padding: 16px 20px
    display: flex
    flex-direction: column
    position: relative
    transition: border-color 0.2s ease, box-shadow 0.2s ease
    purpose: 内容承载的核心骨干。严格 12px 严谨圆角，粉色微柔和投影，鼠标悬浮时细腻浮升。
  card-hover:
    border-color: '{colors.border-hover}'
    box-shadow: '{shadows.lg}'
  card-header:
    display: flex
    align-items: center
    justify-content: space-between
    margin-bottom: 12px
    flex-shrink: '0'
    purpose: 卡片顶部的标题与操作按扭区，使用弹性两端对齐，锁定高度避免内容挤压。
  card-title:
    font-size: '{typography.base.fontSize}'
    font-weight: '{typography.font-bold}'
    color: '{colors.text-primary}'
    display: flex
    align-items: center
    gap: 8px
    purpose: 卡片主标题，采用 16px 加粗深紫红黑色字，左侧可容纳专属樱花图标。
  btn:
    display: inline-flex
    align-items: center
    justify-content: center
    gap: 8px
    font-size: '{typography.sm.fontSize}'
    font-weight: '{typography.font-medium}'
    height: 38px
    padding: 0 16px
    border-radius: '{rounded.sm}'
    cursor: pointer
    border: 1px solid transparent
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)
    white-space: nowrap
    flex-shrink: '0'
    purpose: 所有按钮的基础框架，统一 38px 高度，严谨的 6px 微圆角，坚决杜绝 rounded-full 胶囊化。
  btn-primary:
    background: '{colors.button-primary-bg}'
    color: '{colors.button-primary-text}'
    border-color: transparent
    box-shadow: '{shadows.btn}'
    purpose: 主要操作按钮；最终生效样式为主题语义纯色，并保留柔和阴影。
  btn-primary-hover:
    background: '{colors.primary-700}'
    transform: translateY(-1px)
    theme-overrides:
      midnight-cyan: '#155e75'
  btn-primary-active:
    transform: translateY(0)
  btn-secondary:
    background: '{colors.primary-50}'
    color: '{colors.text-brand}'
    border-color: '{colors.border-default}'
    purpose: 用于取消、重置、返回等辅助操作，浅粉底与深红字搭配，保持温和克制。
  btn-secondary-hover:
    background: '{colors.surface-accent}'
    border-color: '{colors.border-hover}'
  btn-ghost:
    background: transparent
    color: '{colors.text-secondary}'
    purpose: 用于表格行内快捷操作或卡片右上角图标按键，默认透明底，悬停时呈现浅粉微光。
  btn-ghost-hover:
    background: '{colors.primary-50}'
    color: '{colors.primary-600}'
  input-wrapper:
    position: relative
    display: flex
    align-items: center
    width: 100%
    purpose: 带搜索图标或右侧清除图标的表单输入外层定位容器。
  input:
    width: 100%
    height: 38px
    background: '{colors.surface-muted}'
    border: 1px solid {colors.border-default}
    border-radius: '{rounded.sm}'
    padding: 0 12px
    font-size: '{typography.sm.fontSize}'
    color: '{colors.text-primary}'
    outline: none
    transition: all 0.2s ease
    purpose: 标准输入框，38px 高度，6px 微圆角，获取焦点时散发柔和樱花粉光环聚焦（Focus Ring）。
  input--placeholder:
    color: '{colors.text-muted}'
  input-focus:
    background: '{colors.surface-card}'
    border-color: '{colors.primary-400}'
    box-shadow: 0 0 0 3px color-mix(in srgb, {colors.border-focus} 30%, transparent)
  input-icon:
    position: absolute
    left: 12px
    color: '{colors.text-muted}'
    pointer-events: none
    flex-shrink: '0'
    purpose: 输入框左侧搜索放大镜或锁头图标，锁定绝对定位与防穿透事件。
  badge:
    display: inline-flex
    align-items: center
    gap: 4px
    padding: 2px 8px
    border-radius: '{rounded.xs}'
    font-size: '{typography.xs.fontSize}'
    font-weight: '{typography.font-semibold}'
    white-space: nowrap
    flex-shrink: '0'
    purpose: 小巧紧凑的状态标签，4px 圆角，水平内边距保护，杜绝长短不一或字形换行。
  badge-primary:
    background: '{colors.primary-100}'
    color: '{colors.text-brand}'
    border: 1px solid {colors.primary-200}
    purpose: 用于高亮教案、班主任推荐、AI智能批阅完成等品牌属性标签。
  badge-success:
    background: '{colors.success-bg}'
    color: '{colors.success}'
    border: 1px solid rgba(16, 185, 129, 0.2)
    purpose: 用于全勤、进步之星、审核通过等正向业务标签。
  badge-warning:
    background: '{colors.warning-bg}'
    color: '{colors.warning}'
    border: 1px solid rgba(245, 158, 11, 0.2)
    purpose: 用于临界生关注、调代课待审、待确认通知等预警标签。
  badge-danger:
    background: '{colors.danger-bg}'
    color: '{colors.danger}'
    border: 1px solid rgba(244, 63, 94, 0.2)
    purpose: 用于高频错题失分点、重点需面批、紧急家校留言等警示标签。
  scrollbar---webkit-scrollbar:
    width: 6px
    height: 6px
  scrollbar---webkit-scrollbar-track:
    background: transparent
  scrollbar---webkit-scrollbar-thumb:
    background-color: '{colors.primary-200}'
    border-radius: '{rounded.xs}'
  scrollbar---webkit-scrollbar-thumb-hover:
    background-color: '{colors.primary-300}'
theme-system:
  default: sakura-milk
  switch-attribute: data-theme
  categories:
    soft-pastel:
    - sakura-milk
    clean-enterprise:
    - ocean-blue
    natural-calm:
    - forest-tea
    warm-editorial:
    - amber-paper
    creative-soft:
    - lavender-mist
    neutral-professional:
    - graphite-mono
    dark-technical:
    - midnight-cyan
  rules:
  - colors.* 是可换肤语义令牌；rounded、spacing、layout 和 components 保持共享。
  - 默认主题与原始 CSS 设计一致；其余主题为新增设计提案。
  - dark 模式需要独立验证文本、按钮及图表对比度。
  - 保证组件引用 {colors.*}，禁止在业务组件写死主题色。
themes:
  sakura-milk:
    name: 樱花奶昔
    category: soft-pastel
    mode: light
    description: 原始樱花品牌配色；当前主按钮采用语义纯色，原始渐变定义保留于 legacy 层。
    colors:
      primary-50: '#fff1f2'
      primary-100: '#ffe4e8'
      primary-200: '#fecdd3'
      primary-300: '#fda4af'
      primary-400: '#fb7185'
      primary-500: '#f43f5e'
      primary-600: '#e11d48'
      primary-700: '#be123c'
      primary-800: '#9f1239'
      primary-900: '#881337'
      surface-canvas: '#fff7fa'
      surface-card: '#ffffff'
      surface-muted: '#fff0f3'
      surface-accent: '#ffe9ed'
      surface-glass: rgba(255, 255, 255, 0.85)
      text-primary: '#2b141e'
      text-secondary: '#633b4d'
      text-muted: '#9c7888'
      text-inverse: '#ffffff'
      text-brand: '#e11d48'
      border-subtle: '#ffeef1'
      border-default: '#ffe4e8'
      border-hover: '#fecdd3'
      border-focus: '#fda4af'
      success: '#10b981'
      success-bg: '#ecfdf5'
      warning: '#f59e0b'
      warning-bg: '#fffbeb'
      danger: '#f43f5e'
      danger-bg: '#fff1f2'
      info: '#0ea5e9'
      info-bg: '#f0f9ff'
      button-primary-bg: '#e11d48'
      button-primary-text: '#ffffff'
      focus-ring: '#fb7185'
      text-link: '#e11d48'
      surface-control: '#fff0f3'
    shadow-tint: rgba(244,63,94,0.12)
  ocean-blue:
    name: 海盐晴空
    category: clean-enterprise
    mode: light
    description: 蓝白理性，适合数据与教务后台。
    colors:
      primary-50: '#f2f6fe'
      primary-100: '#dee8fc'
      primary-200: '#c4d5fa'
      primary-300: '#96b4f5'
      primary-400: '#628ff1'
      primary-500: '#2563eb'
      primary-600: '#2157cf'
      primary-700: '#1c4bb3'
      primary-800: '#183f96'
      primary-900: '#13337a'
      surface-canvas: '#f5f9ff'
      surface-card: '#ffffff'
      surface-muted: '#eef4ff'
      surface-accent: '#f2f6fe'
      surface-glass: rgba(255,255,255,0.85)
      text-primary: '#13233d'
      text-secondary: '#415575'
      text-muted: '#7c8ba3'
      text-inverse: '#ffffff'
      text-brand: '#1d4ed8'
      border-subtle: '#366fed'
      border-default: '#4a7eef'
      border-hover: '#6e98f2'
      border-focus: '#2563eb'
      success: '#10b981'
      success-bg: '#ecfdf5'
      warning: '#b45309'
      warning-bg: '#fffbeb'
      danger: '#e11d48'
      danger-bg: '#fff1f2'
      info: '#0284c7'
      info-bg: '#f0f9ff'
      button-primary-bg: '#1c4bb3'
      button-primary-text: '#ffffff'
      focus-ring: '#628ff1'
      text-link: '#1d4ed8'
      surface-control: '#eef4ff'
    shadow-tint: rgba(37,99,235,0.12)
  forest-tea:
    name: 抹茶森林
    category: natural-calm
    mode: light
    description: 绿白低刺激，适合长时阅读与教研。
    colors:
      primary-50: '#f1f7f3'
      primary-100: '#dcece2'
      primary-200: '#c0ddcb'
      primary-300: '#8fc2a2'
      primary-400: '#57a473'
      primary-500: '#15803d'
      primary-600: '#127136'
      primary-700: '#10612e'
      primary-800: '#0d5227'
      primary-900: '#0b4320'
      surface-canvas: '#f6faf5'
      surface-card: '#ffffff'
      surface-muted: '#eaf5eb'
      surface-accent: '#f1f7f3'
      surface-glass: rgba(255,255,255,0.85)
      text-primary: '#183225'
      text-secondary: '#48614e'
      text-muted: '#819385'
      text-inverse: '#ffffff'
      text-brand: '#166534'
      border-subtle: '#278a4c'
      border-default: '#3e965e'
      border-hover: '#64ab7d'
      border-focus: '#15803d'
      success: '#10b981'
      success-bg: '#ecfdf5'
      warning: '#b45309'
      warning-bg: '#fffbeb'
      danger: '#e11d48'
      danger-bg: '#fff1f2'
      info: '#0284c7'
      info-bg: '#f0f9ff'
      button-primary-bg: '#10612e'
      button-primary-text: '#ffffff'
      focus-ring: '#57a473'
      text-link: '#166534'
      surface-control: '#eaf5eb'
    shadow-tint: rgba(21,128,61,0.12)
  amber-paper:
    name: 琥珀纸张
    category: warm-editorial
    mode: light
    description: 米白暖橙，适合阅读、档案与教案。
    colors:
      primary-50: '#faf5f0'
      primary-100: '#f4e5da'
      primary-200: '#ebd1bd'
      primary-300: '#dbac89'
      primary-400: '#c9834e'
      primary-500: '#b45309'
      primary-600: '#9e4908'
      primary-700: '#893f07'
      primary-800: '#733506'
      primary-900: '#5e2b05'
      surface-canvas: '#fffbf4'
      surface-card: '#ffffff'
      surface-muted: '#fff2dd'
      surface-accent: '#faf5f0'
      surface-glass: rgba(255,255,255,0.85)
      text-primary: '#3a2715'
      text-secondary: '#69513a'
      text-muted: '#9a8977'
      text-inverse: '#ffffff'
      text-brand: '#92400e'
      border-subtle: '#ba601c'
      border-default: '#c27133'
      border-hover: '#ce8e5b'
      border-focus: '#b45309'
      success: '#10b981'
      success-bg: '#ecfdf5'
      warning: '#b45309'
      warning-bg: '#fffbeb'
      danger: '#e11d48'
      danger-bg: '#fff1f2'
      info: '#0284c7'
      info-bg: '#f0f9ff'
      button-primary-bg: '#893f07'
      button-primary-text: '#ffffff'
      focus-ring: '#c9834e'
      text-link: '#92400e'
      surface-control: '#fff2dd'
    shadow-tint: rgba(180,83,9,0.12)
  lavender-mist:
    name: 薰衣草雾
    category: creative-soft
    mode: light
    description: 紫白柔和，适合创意及辅助智能模块。
    colors:
      primary-50: '#f7f3fe'
      primary-100: '#ebe1fc'
      primary-200: '#dccafa'
      primary-300: '#c0a0f6'
      primary-400: '#a171f2'
      primary-500: '#7c3aed'
      primary-600: '#6d33d1'
      primary-700: '#5e2cb4'
      primary-800: '#4f2598'
      primary-900: '#401e7b'
      surface-canvas: '#faf7ff'
      surface-card: '#ffffff'
      surface-muted: '#f2ebff'
      surface-accent: '#f7f3fe'
      surface-glass: rgba(255,255,255,0.85)
      text-primary: '#2d1b47'
      text-secondary: '#58456d'
      text-muted: '#8d809d'
      text-inverse: '#ffffff'
      text-brand: '#6d28d9'
      border-subtle: '#8649ee'
      border-default: '#935cf0'
      border-hover: '#a87cf3'
      border-focus: '#7c3aed'
      success: '#10b981'
      success-bg: '#ecfdf5'
      warning: '#b45309'
      warning-bg: '#fffbeb'
      danger: '#e11d48'
      danger-bg: '#fff1f2'
      info: '#0284c7'
      info-bg: '#f0f9ff'
      button-primary-bg: '#5e2cb4'
      button-primary-text: '#ffffff'
      focus-ring: '#a171f2'
      text-link: '#6d28d9'
      surface-control: '#f2ebff'
    shadow-tint: rgba(124,58,237,0.12)
  graphite-mono:
    name: 石墨极简
    category: neutral-professional
    mode: light
    description: 中性灰蓝，适合企业级高密度工作台。
    colors:
      primary-50: '#f3f4f5'
      primary-100: '#e0e2e6'
      primary-200: '#c8ccd1'
      primary-300: '#9da4ad'
      primary-400: '#6c7685'
      primary-500: '#334155'
      primary-600: '#2d394b'
      primary-700: '#273141'
      primary-800: '#212a36'
      primary-900: '#1b222c'
      surface-canvas: '#f8fafc'
      surface-card: '#ffffff'
      surface-muted: '#f0f3f7'
      surface-accent: '#f3f4f5'
      surface-glass: rgba(255,255,255,0.85)
      text-primary: '#18212f'
      text-secondary: '#526071'
      text-muted: '#89939f'
      text-inverse: '#ffffff'
      text-brand: '#1e293b'
      border-subtle: '#435062'
      border-default: '#566273'
      border-hover: '#78828f'
      border-focus: '#334155'
      success: '#10b981'
      success-bg: '#ecfdf5'
      warning: '#b45309'
      warning-bg: '#fffbeb'
      danger: '#e11d48'
      danger-bg: '#fff1f2'
      info: '#0284c7'
      info-bg: '#f0f9ff'
      button-primary-bg: '#273141'
      button-primary-text: '#ffffff'
      focus-ring: '#6c7685'
      text-link: '#1e293b'
      surface-control: '#f0f3f7'
    shadow-tint: rgba(51,65,85,0.12)
  midnight-cyan:
    name: 午夜青蓝
    category: dark-technical
    mode: dark
    description: 深色高对比，用于夜间或控制中心；需单独适配按钮与文本。
    colors:
      primary-50: '#f2fcfe'
      primary-100: '#def8fc'
      primary-200: '#c3f3fa'
      primary-300: '#95eaf7'
      primary-400: '#60dff3'
      primary-500: '#22d3ee'
      primary-600: '#1ebad1'
      primary-700: '#1aa0b5'
      primary-800: '#168798'
      primary-900: '#126e7c'
      surface-canvas: '#0b1220'
      surface-card: '#121d2c'
      surface-muted: '#18273b'
      surface-accent: '#203e51'
      surface-glass: rgba(18,29,44,0.88)
      text-primary: '#e8f4fc'
      text-secondary: '#aec4d8'
      text-muted: '#a9bbc9'
      text-inverse: '#061320'
      text-brand: '#67e8f9'
      border-subtle: '#26394e'
      border-default: '#34475f'
      border-hover: '#4d657e'
      border-focus: '#22d3ee'
      success: '#6ee7b7'
      success-bg: '#10352d'
      warning: '#fbbf24'
      warning-bg: '#3e311b'
      danger: '#fda4af'
      danger-bg: '#421d30'
      info: '#7dd3fc'
      info-bg: '#132d45'
      button-primary-bg: '#0e7490'
      button-primary-text: '#ffffff'
      focus-ring: '#60dff3'
      text-link: '#67e8f9'
      surface-control: '#18273b'
    shadow-tint: rgba(34,211,238,0.16)
states:
  focus-visible: '2px solid var(--sakura-focus-ring); outline-offset: 2px'
  disabled: 'native :disabled; cursor: not-allowed; opacity: 0.55'
  invalid: input[aria-invalid="true"] changes border to danger
  loading: aria-busy marks pending state; optional sakura-spinner and status text; application prevents duplicate
    actions
  pressed: 'transform: translateY(0); no separate active background override'
  selected: recommended surface-accent + text-primary; no generic selected selector provided
  motion-reduced: Sakura motion utilities stop animations; global legacy transitions remain shortened to 0.01ms
accessibility:
  body-contrast: WCAG AA >=4.5:1 target
  large-text-contrast: WCAG AA >=3:1 target
  focus-indicator: visibly perceptible without depending on color alone
  touch-target: 44px recommended where practical
  validation-status: each theme requires browser verification; no blanket AAA claim
format-standard: DESIGN-apple.md：YAML 令牌 + Markdown 分类说明；视觉规则沿用 SakuraEdu。
implementation: 'CSS layers: base, legacy, themes, components, motion, responsive, accessibility'
stylesheet: SakuraEdu_1.0Sakura.css
motion:
  duration:
    instant: 0ms
    fast: 120ms
    normal: 180ms
    enter: 240ms
    exit: 160ms
    loading: 900ms
    skeleton: 1400ms
  easing:
    standard: cubic-bezier(0.4, 0, 0.2, 1)
    enter: cubic-bezier(0, 0, 0.2, 1)
    exit: cubic-bezier(0.4, 0, 1, 1)
    linear: linear
  distance:
    hover: 1px
    enter: 8px
    exit: 4px
  stagger:
    step: 40ms
    max: 160ms
  layer: motion; after components, before responsive and accessibility
  state-attribute: 'data-state: entering | entered | leaving'
  reduced-motion: disable Sakura animations and transforms; retain explicit final opacity and loading text
  rules:
  - Prefer opacity and transform; never animate layout dimensions in shared utilities.
  - Only loading indicators may loop while a request is pending.
  - Exit lifecycle, focus, inert and DOM removal belong to application code.
  - Use a wrapper when a component already owns transform.
motion-components:
  motion-fade:
    class: sakura-motion sakura-motion-fade
    purpose: 淡入淡出，用于内容替换与遮罩
  motion-rise:
    class: sakura-motion sakura-motion-rise
    purpose: 小幅上移进入，用于菜单、浮层和新增卡片
  motion-stagger:
    class: sakura-motion-stagger
    purpose: 前五个子项以 40ms 递增，最大延迟 160ms；其余同时进入
  spinner:
    class: sakura-spinner
    purpose: currentColor 圆环；仅在实际请求期间挂载，需可读状态文字
  skeleton:
    class: sakura-skeleton
    purpose: 语义色占位块；保留实际内容几何尺寸，完成后移除
product-reference:
  repository: https://github.com/yanyu03/Sakura_DashBoard
  branch: main
  observed-head: 7394d49cb5a49f2e372b5106f544872194e2ea12
  review-date: '2026-10-27'
  scope: Static review of index.css, theme metadata, App.tsx and all current view/component TSX files; no browser
    execution or history audit.
  relationship: Earlier product reference; current main differs from the standalone 1.0Sakura CSS and is not a drop-in
    consumer.
  implementation: React + Tailwind CSS @theme; --color-* variables; utility classes
  themes:
  - awesome-green
  - matcha-bamboo
  - sakura-pink
  default-theme: awesome-green
integration:
  tailwind-layer-order: theme, base, legacy, themes, components, motion, responsive, utilities, accessibility
  tailwind-adapter: Map --color-* to --sakura-* in a scoped host selector; do not rename core tokens.
---

## Overview

SakuraEdu（樱花教务云）是一套面向教学管理场景的桌面优先设计系统。浅粉白画布、深紫红正文、微圆角与柔和阴影构成默认视觉语言；固定导航、侧栏与三栏内容区用于组织名册、教学任务、批阅内容和辅助分析。

**版本：`1.0Sakura`。** 本文参照 `DESIGN-apple.md` 的文档结构：前置 YAML 声明机器可读令牌，正文解释设计语言与组件用途。Apple 的颜色、字体、胶囊按钮和产品展示布局不作为 Sakura 的视觉规则。

**来源边界：** 根据提供的材料，初始设计由 Google Stitch 创建，后续整理为 SakuraEdu CSS。字体级别、断点、状态补丁及其余六套主题属于整理阶段的补充设计，不能视为对原始页面的实测结果。

**Key Characteristics:**

- 七套语义配色共用组件与布局，通过 `data-theme` 切换。
- 普通按钮与输入框采用 6px 圆角，内容卡片采用 12px 圆角。
- 桌面控件高 38px；手机端按钮与输入框最小高度为 44px。
- 长文本容器允许收缩，徽章、时间和图标禁止被挤压。
- 桌面分区滚动，手机切换为单列与文档自然滚动。

YAML 中的 `{colors.*}`、`{typography.*}`、`{rounded.*}`、`{spacing.*}` 引用对应同名字段；正文 `{component.*}` 对应 YAML `components`。CSS 使用 `var(--sakura-*)`。文末完整 CSS 与独立样式表内容一致。

## Colors

### Brand & Accent

默认品牌色阶为 `{colors.primary-50}` 至 `{colors.primary-900}`，从浅粉衬底到深红强调色。`{colors.text-brand}` 用于品牌文字；`{colors.button-primary-bg}` 与 `{colors.button-primary-text}` 专用于主按钮，避免深色主题沿用不合适的文字配对。

### Surface & Text

| 角色 | 默认令牌 | 默认值 | 用途 |
| --- | --- | --- | --- |
| 页面画布 | `{colors.surface-canvas}` | #fff7fa | 全局底色 |
| 内容表面 | `{colors.surface-card}` | #ffffff | 卡片、顶部导航和侧栏 |
| 弱化表面 | `{colors.surface-muted}` | #fff0f3 | 输入框及辅助内容衬底 |
| 强调表面 | `{colors.surface-accent}` | #ffe9ed | 建议用于选中或强调区域 |
| 透明表面 | `{colors.surface-glass}` | rgba(255,255,255,0.85) | 可供扩展使用；不自动启用模糊 |
| 主要正文 | `{colors.text-primary}` | #2b141e | 标题与正文 |
| 次级正文 | `{colors.text-secondary}` | #633b4d | 元数据与辅助说明 |
| 弱提示 | `{colors.text-muted}` | #9c7888 | 占位与弱提示，避免用于主要正文 |

### Borders & Feedback

`border-subtle`、`border-default`、`border-hover`、`border-focus` 分别表达分割、默认边框、悬停和聚焦。`success`、`warning`、`danger`、`info` 与各自 `-bg` 组成业务反馈配色。颜色需要配合文字或图标表达状态。

### Theme System

| Theme ID | 名称 | 模式 | 主按钮背景 |
| --- | --- | --- | --- |
| `sakura-milk` | 樱花奶昔 | light | #e11d48 |
| `ocean-blue` | 海盐晴空 | light | #1c4bb3 |
| `forest-tea` | 抹茶森林 | light | #10612e |
| `amber-paper` | 琥珀纸张 | light | #893f07 |
| `lavender-mist` | 薰衣草雾 | light | #5e2cb4 |
| `graphite-mono` | 石墨极简 | light | #273141 |
| `midnight-cyan` | 午夜青蓝 | dark | #0e7490 |

默认主题为 `sakura-milk`。其余主题覆盖颜色与阴影，不改变字号、圆角、组件尺寸与信息结构。完整主题值见 YAML `themes`。

### Brand Gradient

初始主按钮使用 135° 粉红渐变，该定义保留在 `legacy` 层。`1.0Sakura` 以更后的 `components` 层为最终实现：所有主题的主按钮使用纯色语义变量。因此，保留原始渐变代码不代表当前页面显示渐变。

## Typography

### Font Family

使用 `system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`，优先使用设备系统字体并提供中文回退。默认正文为 16px，行高建议 1.5；具体组件按适用场景设置。

### Hierarchy

| Token | 字号 | 字重 | 行高 | 用途 |
| --- | --- | --- | --- | --- |
| `{typography.xs}` | 12px | 400 | 1.5 | 标签与辅助说明 |
| `{typography.sm}` | 14px | 400 | 1.5 | 控件文字与紧凑信息 |
| `{typography.base}` | 16px | 400 | 1.5 | 正文与卡片标题基础字号 |
| `{typography.lg}` | 18px | 600 | 1.4 | 分组标题 |
| `{typography.heading}` | 20px | 700 | 1.3 | 页面标题 |

### Principles

- 字重使用 400 / 500 / 600 / 700；卡片标题为 16px / 700，按钮为 14px / 500。
- 排版级别是补充设计令牌，CSS 已提供字号与字重变量；未提供每一级的独立排版工具类。
- 行高与字距属于排版约定，当前 CSS 未完整绑定所有排版级别。业务层使用时需显式应用相应值。
- 数字和日期建议使用 `font-variant-numeric: tabular-nums`，当前未全局强制启用。

## Layout

### Spacing System

间距阶梯为 4 / 8 / 12 / 16 / 20 / 24 / 32px，章节留白为 48px。默认内容区内边距与列间距均为 16px；卡片内边距为 16px 20px；标签内边距为 2px 8px。

### Desktop Workbench

| 区域 | 默认尺寸 | 行为 |
| --- | --- | --- |
| 顶部导航 | 高 64px | 不收缩；当前定位为 relative |
| 侧栏 | 宽 240px | 内部纵向滚动 |
| 左栏 | 宽 340px | 名册、任务流或章节树 |
| 中栏 | 剩余宽度 | `flex: 1 1 auto; min-width: 0` |
| 右栏 | 宽 400px | 学情分析与辅助信息 |

1920×1080 是设计参考尺寸。桌面内容区高度为 `calc(100vh - 64px)`，外部页面禁止滚动，各内容分区内部滚动。实际 DOM 需提供顶部导航下方的横向布局容器；CSS 未提供完整应用外壳类。

1280px 起沿用完整桌面列宽，但中心栏可用空间取决于侧栏、两侧内容及间距；此断点不代表所有高密度页面均已验证可用。

### Overflow & Layering

长标题使用 `.sakura-text-truncate`，摘要使用 `.sakura-clamp-2` 或 `.sakura-clamp-3`。徽章、时间、图标和头像使用防收缩规则。层级预留为 sticky 20、header 40、overlay 100、dialog 200、toast 300；预留层级不表示已实现对应组件。

## Elevation & Depth

使用 `{shadows.sm}`、`{shadows.md}`、`{shadows.lg}`、`{shadows.btn}` 与 `{shadows.inner}`。默认卡片采用 md 阴影，悬停切换为 lg；主按钮使用 btn 阴影。衍生主题覆盖阴影色偏，深色表面同时依靠边框区分区域。

## Shapes

| Token | 数值 | 用途 |
| --- | --- | --- |
| `{rounded.xs}` | 4px | 标签与徽章 |
| `{rounded.sm}` | 6px | 按钮与输入框 |
| `{rounded.md}` | 8px | 复合控件扩展 |
| `{rounded.lg}` | 12px | 内容卡片 |
| `{rounded.xl}` | 16px | 顶层容器扩展 |
| `{rounded.full}` | 9999px | 头像与纯图标圆形控件扩展 |

普通业务按钮保持微圆角。头像规则仅提供防收缩和居中，具体尺寸、裁切与圆形外观需要应用层设置。

## Components

YAML `components` 保留 40 个规范条目，包含基础组件、状态变体、布局工具和滚动条伪元素，并非 40 个独立 UI 组件。组件默认态、悬停态与按压态均按现有 Sakura CSS 记录。

### Navigation & Containers

**`app-header` / `app-sidebar`**：白色或主题卡片表面，使用默认边框分隔导航与工作区。顶部导航采用横向两端对齐；侧栏采用纵向排列和内部滚动。

**`app-content` / `col-left` / `col-center` / `col-right`**：承载三栏工作台。中央列允许收缩；两侧列固定宽度，平板缩窄，手机堆叠。

**`card` / `card-header` / `card-title`**：12px 圆角卡片，内部纵向排列。标题区两端对齐，标题 16px / 700。悬停增强边框与阴影；当前 CSS 对所有卡片生效。

### Buttons

**`btn`**：基础按钮采用 inline-flex，间距 8px，高 38px，水平内边距 16px，6px 圆角，14px / 500。需与变体类组合使用。

**`btn-primary`**：语义纯色主按钮，使用主题主按钮文字色与按钮阴影。悬停使用 `primary-700` 并上移 1px；深色主题悬停色为 #155e75。按压恢复原位，不另设按压背景色。

**`btn-secondary`**：`primary-50` 衬底与 `text-brand` 文字，带默认边框。**`btn-ghost`**：透明底和次级文字，适合次要与行内操作。

### Inputs & Forms

**`input-wrapper` / `input` / `input-icon`**：全宽输入框，高 38px，6px 圆角，水平内边距 12px；图标绝对定位于左侧 12px。使用前置图标时，应用层需增加输入框左内边距以避免文字重叠。

聚焦时切换卡片表面与品牌边框，并显示语义色光环；键盘聚焦增加独立轮廓。`aria-invalid="true"` 设置危险色边框。错误说明、关联标签及验证逻辑由应用层提供。

### Tags, Badges & Text Utilities

**`tag` / `badge`**：12px 文字、4px 圆角、2px 8px 内边距，禁止换行和收缩；tag 字重 500，badge 字重 600。徽章提供 primary、success、warning、danger 变体。

**`badge-fixed` / `meta-time` / `icon-fixed` / `avatar`**：锁定收缩行为。**`text-truncate`**：单行省略。**`clamp-2` / `clamp-3`**：两行与三行截断。

### Interaction & Accessibility

原生禁用按钮与输入框使用 `:disabled`，降低透明度并改变光标；`aria-busy="true"` 提供忙碌光标，可组合 Motion & Animation 章节的加载圆环。系统偏好减少动态时停止新增动效，并缩短其余旧动画与过渡；强制颜色模式下为按钮、输入框和卡片提供系统色边框。

## Motion & Animation

### Design Intent

动效用于说明操作反馈、内容出现与请求进行中。遵循现有 `.sakura-*` 类名、`--sakura-*` 变量与 `@layer` 层叠体系；七套主题共用同一动效规则，颜色继承语义令牌。此章节为 `1.0Sakura` 新增设计，不属于原始 Stitch 页面实测结果。

不增加装饰性飘落樱花、持续浮动、弹跳或视差背景。普通内容出现一次即可，只有真实加载指示器可在请求期间循环。

### Motion Tokens

| 令牌 / CSS 变量后缀 | 值 | 用途 |
| --- | --- | --- |
| duration-instant | 0ms | 无动态反馈 |
| duration-fast | 120ms | 按钮颜色与 1px 悬停位移 |
| duration-normal | 180ms | 输入框和卡片状态过渡 |
| duration-enter | 240ms | 内容进入 |
| duration-exit | 160ms | 内容退出 |
| duration-loading | 900ms | 加载圆环一周 |
| duration-skeleton | 1400ms | 骨架透明度循环 |
| ease-standard | cubic-bezier(0.4,0,0.2,1) | 通用状态变化 |
| ease-enter | cubic-bezier(0,0,0.2,1) | 进入时减速 |
| ease-exit | cubic-bezier(0.4,0,1,1) | 退出时加速 |
| motion-hover / enter / exit | 1px / 8px / 4px | 小幅位移 |
| stagger-step / max | 40ms / 160ms | 列表错峰间隔与延迟上限 |

CSS 变量统一加 `--sakura-` 前缀，例如 `--sakura-duration-enter`。YAML `motion` 按 duration、easing、distance 与 stagger 分类记录相同值。

### Component Feedback

- **按钮**：显式过渡背景色、文字、边框、阴影与 transform，时长 120ms；仅支持悬停的精确指针设备启用主按钮上移 1px。按压恢复原位，禁用与忙碌时取消位移。
- **输入框**：背景、边框与阴影过渡 180ms；焦点轮廓立即可见，不延迟键盘定位反馈。
- **卡片**：边框与阴影过渡 180ms；不改变卡片几何尺寸，不默认增加浮动位移。
- **状态颜色**：由组件语义色控制，不用摇晃或闪烁替代错误说明。`aria-disabled` 与 `aria-busy` 本身不会阻止点击，交互约束由应用层实现。

### Enter & Exit

基础类 `.sakura-motion` 与 `.sakura-motion-fade` 或 `.sakura-motion-rise` 组合。使用 `data-state="entering"` 进入，`entered` 稳定显示，`leaving` 退出。淡入淡出仅改变透明度；rise 进入从下方 8px 回到原位，退出向上 4px 并淡出。

```html
<div class="sakura-motion sakura-motion-rise" data-state="entering">
  <section class="sakura-card">新增教学任务</section>
</div>
```

动效类应用于外包装，避免覆盖按钮、拖拽元素或定位组件已有的 transform。进入采用 backwards 填充，完成后不持续占用 transform；稳定后应用层可将状态改为 `entered`。同一元素再次播放需重新挂载或重新触发状态。

**退出生命周期**：应用层先把焦点移到合理位置，为退出内容设置 `inert`，再切换至 `leaving`。CSS 只负责透明度、动画与指针事件；`pointer-events: none` 无法阻止键盘聚焦。完成后通过过滤目标元素的 `animationend` 或超时兜底移除 DOM；启用减少动态效果时立即移除，不依赖动画事件。业务操作结果不应等待动画结束才生效。

通用动效类不处理 `display:none`、原生 dialog 的 top layer、弹层定位、焦点陷阱和遮罩点击；这些由实际组件完成。

### List Stagger

`.sakura-motion-stagger` 作用于其直接子元素 `.sakura-motion`。前五项延迟依次为 0 / 40 / 80 / 120 / 160ms，其余均为 160ms；退出不延迟。建议只用于首次展示的小型列表，不用于表格行更新或每次筛选。

```html
<div class="sakura-motion-stagger">
  <div class="sakura-motion sakura-motion-rise" data-state="entering">第一项</div>
  <div class="sakura-motion sakura-motion-rise" data-state="entering">第二项</div>
</div>
```

### Loading Elements

**`.sakura-spinner`**：1em 圆环，继承 currentColor，以 900ms 匀速旋转。仅在实际请求期间挂载，完成或失败后移除；减少动态效果时显示静态圆环，并保留可读状态文字。

```html
<div>
  <button class="sakura-btn sakura-btn-primary" type="button" aria-busy="true" disabled>
    <span class="sakura-spinner" aria-hidden="true"></span>
    正在保存
  </button>
  <p role="status">正在保存，请稍候。</p>
</div>
```

状态播报位于 busy 按钮外，应用应在请求前建立状态区域，并在请求完成或失败时更新文字；加载图标本身不重复播报。需要稳定按钮宽度时，由应用按实际文案设置最小宽度。

**`.sakura-skeleton`**：语义弱表面与微弱边框构成占位，透明度在 1 与 0.6 之间缓慢循环，不使用高亮扫光。应用显式提供与最终内容接近的宽高，避免替换时布局跳动；骨架设置 `aria-hidden="true"`，加载容器设置 `aria-busy="true"`，状态说明放在容器外。

### Accessibility & Performance

- 动效层位于 components 之后、responsive 与 accessibility 之前；最后一层拥有减少动态效果的覆盖权。
- `prefers-reduced-motion: reduce` 下停止新动效与循环，取消按钮位移和组件过渡；进入直接可见，退出保持透明，骨架保持静态。
- 强制颜色模式下骨架使用系统色边框并停止循环；状态信息继续通过文字提供。
- 位移和进出场仅使用 transform 与 opacity；避免动画 width、height、margin、padding、top、left 或 blur。
- 边框、背景色与轻阴影过渡保留在小范围组件内；不为大型工作区做阴影动画。
- 不全局设置 `will-change`，不对整张长表同时启动进场动画。循环效果仅在加载内容可见且请求仍进行时保留，应用应控制挂载或暂停。

### Verification Scope

本版完成令牌、类名、CSS 变量和附录一致性的静态检查。仍需在真实页面验证快速重复操作、进入中退出、请求失败、键盘焦点、触屏、七主题与系统减少动态效果；不宣称已完成浏览器视觉验收。

## Do's and Don'ts

### Do

- 使用语义变量表达主题色，新增主题补全相同颜色键。
- 让长文本容器收缩，保护徽章与图标宽度。
- 保持焦点可见，并使用原生 disabled 与合适的 ARIA 状态。
- 按真实 DOM、文本长度、屏幕尺寸和主题验证页面。

### Don't

- 不把 Apple 的视觉数值套用到 Sakura。
- 不把 legacy 层的原始声明当成最终生效样式。
- 不把设计建议、预留令牌或状态属性写成已实现的完整交互。
- 不在未经测试时宣称全主题已通过 AA / AAA 验收。

## Responsive Behavior

### Breakpoints

| 范围 | 行为 |
| --- | --- |
| ≥1280px | 保留桌面默认三栏与分区滚动 |
| 768–1279px | 间距与内边距改为 12px；左栏 min(280px,28vw)，右栏 min(320px,30vw) |
| ≤767px | 内容改为单列；页面自然滚动；侧栏全宽，最大高度 30dvh |
| ≤479px | 内容内边距和间距改为 8px；卡片内边距 12px |

### Touch Targets

≤767px 时按钮与输入框最小高度为 44px。44×44px 是触控建议，当前 CSS 未统一保证最小宽度。手机顶部导航允许换行，高度自适应；应用外层也需要响应式调整布局方向。

## Iteration Guide

1. 先修改 YAML 中对应令牌或组件，再同步正文与 CSS；三者需保持一致。
2. 新主题只覆盖颜色与阴影，组件结构和布局继续共享。
3. 新增状态需写明选择器、实际效果及应用层职责。
4. CSS 层顺序固定为 base、legacy、themes、components、motion、responsive、accessibility；后层覆盖前层。
5. 发布时检查 YAML 解析、令牌引用、CSS 变量覆盖及真实页面效果；版本标识统一为 `1.0Sakura`。

## Known Gaps

- 七主题对比度、浏览器兼容性与多屏视觉效果尚未进行完整页面验收。
- 部分浅色主题边框颜色较浓，保留原值，需在页面中判断是否调整。
- CSS 未实现完整应用外壳、弹窗、表格、图表、完整加载交互和通用选中态。
- 排版行高、字距、部分间距及布局令牌尚未全部由 CSS 变量驱动；存在固定数值。
- 深色主题部分次要控件仍使用浅色品牌色阶，需结合真实内容检查。
- 个别业务状态边框与深色主按钮悬停色仍为字面量，尚未完全语义化。
- 基础视觉结构沿用现有 CSS；本次新增 motion 层统一过渡并提供可选动效，尚未完成浏览器视觉验收。

## Product Reference — Sakura_DashBoard

早期产品仓库：[yanyu03/Sakura_DashBoard](https://github.com/yanyu03/Sakura_DashBoard)。本次读取 `main`，观察到分支头为 `7394d49cb5a49f2e372b5106f544872194e2ea12`。以下记录当前源码依据；未追溯提交历史，也未运行浏览器，不能据此还原最初发布版本。

### Framework & Visual Differences

| 项目 | 当前仓库代码 | 本文 1.0Sakura |
| --- | --- | --- |
| 样式组织 | Tailwind CSS，`@theme` 和工具类 | 独立 CSS、显式层叠、`.sakura-*` 组件类 |
| 颜色变量 | `--color-primary`、`--color-on-surface` 等 | `--sakura-primary-*`、`--sakura-text-*` 等 |
| 主题 | awesome-green / matcha-bamboo / sakura-pink | 七套主题，ID 与产品不相同 |
| 默认主题 | awesome-green，主色 #0d7a5f | sakura-milk，主按钮 #e11d48 |
| 樱花主色 | sakura-pink 的 #8f4953 | sakura-milk 的品牌色阶 |
| 圆角 | CSS 令牌 2–8px，并压缩旧胶囊样式 | 4 / 6 / 8 / 12 / 16px |
| 移动导航 | 移动抽屉、底部导航和部分业务面板切换 | 通用侧栏全宽、内容单列堆叠 |
| 滚动条 | 全局隐藏 | 提供可见的 6px 滚动条样式 |

来源：[全局样式](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/index.css)、[主题元数据](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/data/awesomeDesignTheme.ts)、[应用外壳](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/App.tsx)。仓库说明中的第三方设计来源为作者自述，本次未另行核验其上游来源。

### Existing Motion Evidence

| 源码位置 | 已有行为 | 对本规范的处理 |
| --- | --- | --- |
| AuthPortalView.tsx:234 | 快捷入口图标 group-hover:scale-105 | 作为已有 1.05 倍缩放记录；当前框架未新增通用放大类 |
| AuthPortalView.tsx:568 | 验证码请求中的 animate-spin | 对应 `.sakura-spinner`，新增统一时长和静态替代 |
| HomeworkCenterView.tsx:263 | 批量操作 active:scale-95 | 记录已有 0.95 倍按压；1.0Sakura 标准按钮采用恢复位移的按压反馈 |
| HomeworkCenterView.tsx:415 | 选中学生 scale-[1.01] 与颜色、阴影变化 | 记录已有选中反馈；不自动扩展到所有列表 |
| DashboardOverviewView.tsx:310 | 日程状态点 animate-ping | 属于持续状态提示；新规范建议改为静态状态点和文字 |
| LessonPlansView.tsx:255、489 | 同步状态与 AI 图标 animate-pulse | 新规范仅允许真实请求期间循环，已同步状态采用静态反馈 |
| App.tsx:1164 附近 | Toast 条件渲染，3200ms 后清除 | 原实现未声明进出场动画；淡入淡出及退出生命周期为本次新增规范 |

来源：[登录入口](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/components/AuthPortalView.tsx)、[作业中心](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/components/views/HomeworkCenterView.tsx)、[概览](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/components/views/DashboardOverviewView.tsx)、[教案库](https://github.com/yanyu03/Sakura_DashBoard/blob/7394d49cb5a49f2e372b5106f544872194e2ea12/src/components/views/LessonPlansView.tsx)。

受检文件广泛使用 `transition-all`、`transition-colors` 与 `transition-transform`，但未形成本文的统一时长令牌。package.json 声明了 `motion` 依赖；本次读取的 App 与组件文件中未见 Motion API 的使用，因此不将依赖声明视为已实现的进出场系统。所读全局 CSS 未见减少动态效果的媒体查询，组件中未见相应 Motion hook 或 Tailwind motion-reduce 工具类。

### Integration Boundary

本仓库提供产品场景、交互与源码证据，本文提供整理后的框架设计。新增进出场、错峰、骨架屏、统一时长和减少动态效果属于 `1.0Sakura` 的补充规则，不宣称仓库已具备。

后续接入需要先明确主题映射、颜色变量与圆角取舍，再逐组件加入 `.sakura-*` 类和状态生命周期。当前 CSS 对 html、body、#root 及基础表单有全局规则，而 Tailwind 也使用 CSS 层叠；不能直接叠加两个全局样式文件并假定无冲突。新规范与产品原有缩放行为的差异应按具体组件评审。

## Usage & Theme Switching

将同目录的 `SakuraEdu_1.0Sakura.css` 引入页面。不要重复加载旧版 CSS；无需 JavaScript 即可显示默认樱花主题。

```html
<html lang="zh-CN" data-theme="sakura-milk">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="SakuraEdu_1.0Sakura.css">
  </head>
  <body>
    <button class="sakura-btn sakura-btn-primary" type="button">保存</button>
  </body>
</html>
```

```js
document.documentElement.dataset.theme = 'ocean-blue';
```

### Tailwind Host Integration

与 Tailwind 同页使用时，必须在首次导入 Tailwind 前登记共同层顺序。CSS 层顺序由首次注册决定，后加载标准文件无法重新排列已经注册的 components 层；否则 legacy 中的 outline: none 等规则可能覆盖组件焦点补丁。

```css
@layer theme, base, legacy, themes, components, motion, responsive, utilities, accessibility;
@import "tailwindcss";
```

宿主应用继续使用工具类布局，通过局部适配层把 --color-* 映射到 --sakura-*，并为标准组件显式添加 .sakura-* 类。避免把标准的固定三栏容器尺寸直接套到已有网格布局。动画只由一个系统控制，同一属性不同时交给旧工具类与新动效类。

Sakura_DashBoard 本地验证中，已确认七主题的代表性主按钮配色、38px/44px 控件、12px 卡片圆角、120ms 按钮过渡、键盘焦点、加载圆环与进出场可应用；这不是所有业务控件或全主题对比度验收。运行步骤与范围见仓库本地 docs/VERIFICATION-1.0Sakura.md。

## CSS Implementation — Full Source

以下八段代码按顺序拼接，即为配套独立样式表；motion 是本次新增动效层，accessibility 最后覆盖。

### CSS · 文件头与层叠声明

```css
@charset "UTF-8";
/* SakuraEdu 1.0Sakura — standalone stylesheet */
@layer base, legacy, themes, components, motion, responsive, accessibility;
```

### CSS · base

```css
@layer base {
:root {
  color-scheme: light;
  --sakura-button-primary-bg: #e11d48; --sakura-button-primary-text: #ffffff; --sakura-focus-ring: #fb7185; --sakura-text-link: #e11d48; --sakura-surface-control: #fff0f3;
  --sakura-font-sans: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
  --sakura-text-xs: 12px; --sakura-text-sm: 14px; --sakura-text-base: 16px; --sakura-text-lg: 18px; --sakura-text-heading: 20px;
  --sakura-font-regular: 400; --sakura-font-medium: 500; --sakura-font-semibold: 600; --sakura-font-bold: 700;
  --sakura-space-xxs: 4px; --sakura-space-xs: 8px; --sakura-space-sm: 12px; --sakura-space-md: 16px; --sakura-space-lg: 20px; --sakura-space-xl: 24px; --sakura-space-xxl: 32px;
  --sakura-control-height: 38px; --sakura-touch-target: 44px;
  --sakura-header-height: 64px; --sakura-sidebar-width: 240px; --sakura-left-width: 340px; --sakura-right-width: 400px;
  --sakura-z-sticky: 20; --sakura-z-header: 40; --sakura-z-overlay: 100; --sakura-z-dialog: 200; --sakura-z-toast: 300;
}
*, *::before, *::after { box-sizing: border-box; }
button,input,select,textarea { font: inherit; }
button { -webkit-tap-highlight-color: transparent; }
}
```

### CSS · legacy

```css
@layer legacy {
:root {
  --sakura-primary-50:    #fff1f2;  /* 极浅粉背景 / 悬浮状态衬底 */
  --sakura-primary-100:   #ffe4e8;  /* 边框默认色 / 浅底微高亮 */
  --sakura-primary-200:   #fecdd3;  /* 交互描边 / 获得焦点时的外发光边线 */
  --sakura-primary-300:   #fda4af;  /* 樱花主标识 / 柔和次级强调色 */
  --sakura-primary-400:   #fb7185;  /* 浅绯红图标 / 活跃选项状态 */
  --sakura-primary-500:   #f43f5e;  /* 行动主色 (Primary Action Brand Color) */
  --sakura-primary-600:   #e11d48;  /* 悬停加深色 (Hover State) */
  --sakura-primary-700:   #be123c;  /* 激活下压色 (Active/Pressed State) */
  --sakura-primary-800:   #9f1239;  /* 重点深强调色 (深色徽章、文字链接) */
  --sakura-primary-900:   #881337;  /* 特级深红 (超高对比度边线与图表高亮) */
}
:root {
  --sakura-surface-canvas:      #fff7fa;  /* 全局视窗底色 (草莓奶昔粉白) */
  --sakura-surface-card:        #ffffff;  /* 核心白板卡片背景 (纯白高透) */
  --sakura-surface-muted:       #fff0f3;  /* 浅色衬底 / 输入框与表格底色 */
  --sakura-surface-accent:      #ffe9ed;  /* 选中态 / 高亮卡片背景 */
  --sakura-surface-glass:       rgba(255, 255, 255, 0.85); /* 顶部与侧边栏毛玻璃拟态底色 */
}
:root {
  --sakura-text-primary:        #2b141e;  /* 主正文字色；对比度需结合实际背景与字号验收 */
  --sakura-text-secondary:      #633b4d;  /* 次级文本；用于副标题、元数据 */
  --sakura-text-muted:          #9c7888;  /* 失效 / 占位符 (灰调粉褐，用于 Placeholder 与弱提示) */
  --sakura-text-inverse:        #ffffff;  /* 反色纯白 (用于深色与渐变主按钮) */
  --sakura-text-brand:          #e11d48;  /* 品牌文字聚焦色 (用于高亮链接、关键数字) */
}
:root {
  --sakura-border-subtle:       #ffeef1;  /* 微弱分割线 (列表内部分隔) */
  --sakura-border-default:      #ffe4e8;  /* 标配卡片边框 (标准容器边缘) */
  --sakura-border-hover:        #fecdd3;  /* 鼠标悬浮边框 (交互反馈) */
  --sakura-border-focus:        #fda4af;  /* 获得焦点边框 (表单控件激活态) */
}
:root {
  --sakura-success:             #10b981;  /* 进步之星 / 全勤出勤 / 正常状态 */
  --sakura-success-bg:          #ecfdf5;  /* 成功状态浅绿衬底 */
  --sakura-warning:             #f59e0b;  /* 临界生预警 / 调代课待审 */
  --sakura-warning-bg:          #fffbeb;  /* 警告状态淡黄衬底 */
  --sakura-danger:              #f43f5e;  /* 错题失分点 / 需重点面批 */
  --sakura-danger-bg:           #fff1f2;  /* 危险/高预警浅粉衬底 */
  --sakura-info:                #0ea5e9;  /* 智慧教室联控 / 系统广播 */
  --sakura-info-bg:             #f0f9ff;  /* 信息提示浅蓝衬底 */
}
:root {
  --sakura-radius-xs:    4px;   /* 基础微圆角：表格高亮单元格、行内状态小圆点、<kbd> 快捷键 */
  --sakura-radius-sm:    6px;   /* 控件与按钮：输入框、下拉框、标准按钮、小型徽章 Badge */
  --sakura-radius-md:    8px;   /* 复合控件：大尺寸主按钮、筛选标签 Tag、弹窗内小面板 */
  --sakura-radius-lg:    12px;  /* 内容卡片：教学卡片、批改卷面视窗、图表仪表盘面板 */
  --sakura-radius-xl:    16px;  /* 主框架上限：登录主视窗底板、三栏式主工作区域白板 */
  --sakura-radius-full:  9999px;/* 严格限定：仅限头像 Avatar、纯图标圆形按钮 (32x32px) */
}
:root {
  --sakura-shadow-sm:   0 1px 2px 0 rgba(244, 63, 94, 0.05);
  --sakura-shadow-md:   0 4px 12px -2px rgba(244, 63, 94, 0.08), 0 2px 4px -2px rgba(43, 20, 30, 0.02);
  --sakura-shadow-lg:   0 10px 24px -4px rgba(244, 63, 94, 0.12), 0 4px 8px -2px rgba(43, 20, 30, 0.04);
  --sakura-shadow-btn:  0 2px 8px 0 rgba(244, 63, 94, 0.25);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(244, 63, 94, 0.04);
}
.sakura-badge-fixed,
.sakura-meta-time,
.sakura-icon-fixed,
.sakura-avatar {
  flex-shrink: 0 !important;
  white-space: nowrap;
}
.sakura-text-truncate {
  flex: 1 1 auto;
  min-width: 0 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sakura-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  word-break: break-word;
}
.sakura-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  word-break: break-word;
}
.sakura-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--sakura-radius-xs);
  font-size: var(--sakura-text-xs);
  font-weight: var(--sakura-font-medium);
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
}
html, body, #root {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--sakura-surface-canvas);
  font-family: var(--sakura-font-sans);
  color: var(--sakura-text-primary);
  -webkit-font-smoothing: antialiased;
}
.sakura-app-header {
  height: 64px;
  flex-shrink: 0;
  background: var(--sakura-surface-card);
  border-bottom: 1px solid var(--sakura-border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 40;
}
.sakura-app-sidebar {
  width: 240px;
  height: calc(100vh - 64px);
  flex-shrink: 0;
  background: var(--sakura-surface-card);
  border-right: 1px solid var(--sakura-border-default);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.sakura-app-content {
  flex: 1 1 auto;
  height: calc(100vh - 64px);
  overflow: hidden;
  display: flex;
  padding: 16px;
  gap: 16px;
}
.sakura-col-left {
  width: 340px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}
.sakura-col-center {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
}
.sakura-col-right {
  width: 400px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}
.sakura-card {
  background: var(--sakura-surface-card);
  border: 1px solid var(--sakura-border-default);
  border-radius: var(--sakura-radius-lg);
  box-shadow: var(--sakura-shadow-md);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sakura-card:hover {
  border-color: var(--sakura-border-hover);
  box-shadow: var(--sakura-shadow-lg);
}
.sakura-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.sakura-card-title {
  font-size: var(--sakura-text-base);
  font-weight: var(--sakura-font-bold);
  color: var(--sakura-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.sakura-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: var(--sakura-text-sm);
  font-weight: var(--sakura-font-medium);
  height: 38px;
  padding: 0 16px;
  border-radius: var(--sakura-radius-sm);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  flex-shrink: 0;
}
.sakura-btn-primary {
  background: linear-gradient(135deg, var(--sakura-primary-500) 0%, var(--sakura-primary-600) 100%);
  color: var(--sakura-text-inverse);
  border-color: transparent;
  box-shadow: var(--sakura-shadow-btn);
}

.sakura-btn-primary:hover {
  background: linear-gradient(135deg, var(--sakura-primary-600) 0%, var(--sakura-primary-700) 100%);
  transform: translateY(-1px);
}

.sakura-btn-primary:active {
  transform: translateY(0);
}
.sakura-btn-secondary {
  background: var(--sakura-primary-50);
  color: var(--sakura-primary-800);
  border-color: var(--sakura-border-default);
}

.sakura-btn-secondary:hover {
  background: var(--sakura-surface-accent);
  border-color: var(--sakura-border-hover);
}
.sakura-btn-ghost {
  background: transparent;
  color: var(--sakura-text-secondary);
}

.sakura-btn-ghost:hover {
  background: var(--sakura-primary-50);
  color: var(--sakura-primary-600);
}
.sakura-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.sakura-input {
  width: 100%;
  height: 38px;
  background: var(--sakura-surface-muted);
  border: 1px solid var(--sakura-border-default);
  border-radius: var(--sakura-radius-sm);
  padding: 0 12px;
  font-size: var(--sakura-text-sm);
  color: var(--sakura-text-primary);
  outline: none;
  transition: all 0.2s ease;
}

.sakura-input::placeholder {
  color: var(--sakura-text-muted);
}

.sakura-input:focus {
  background: var(--sakura-surface-card);
  border-color: var(--sakura-primary-400);
  box-shadow: 0 0 0 3px rgba(253, 164, 175, 0.25);
}
.sakura-input-icon {
  position: absolute;
  left: 12px;
  color: var(--sakura-text-muted);
  pointer-events: none;
  flex-shrink: 0;
}
.sakura-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--sakura-radius-xs);
  font-size: var(--sakura-text-xs);
  font-weight: var(--sakura-font-semibold);
  white-space: nowrap;
  flex-shrink: 0;
}
.sakura-badge-primary {
  background: var(--sakura-primary-100);
  color: var(--sakura-primary-800);
  border: 1px solid var(--sakura-primary-200);
}
.sakura-badge-success {
  background: var(--sakura-success-bg);
  color: var(--sakura-success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.sakura-badge-warning {
  background: var(--sakura-warning-bg);
  color: var(--sakura-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.sakura-badge-danger {
  background: var(--sakura-danger-bg);
  color: var(--sakura-danger);
  border: 1px solid rgba(244, 63, 94, 0.2);
}
.sakura-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sakura-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.sakura-scrollbar::-webkit-scrollbar-thumb {
  background-color: #ffd1dc;
  border-radius: var(--sakura-radius-xs);
}

.sakura-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--sakura-primary-300);
}
}
```

### CSS · themes

```css
@layer themes {
:root[data-theme="sakura-milk"], [data-theme="sakura-milk"] {
  --sakura-primary-50: #fff1f2;
  --sakura-primary-100: #ffe4e8;
  --sakura-primary-200: #fecdd3;
  --sakura-primary-300: #fda4af;
  --sakura-primary-400: #fb7185;
  --sakura-primary-500: #f43f5e;
  --sakura-primary-600: #e11d48;
  --sakura-primary-700: #be123c;
  --sakura-primary-800: #9f1239;
  --sakura-primary-900: #881337;
  --sakura-surface-canvas: #fff7fa;
  --sakura-surface-card: #ffffff;
  --sakura-surface-muted: #fff0f3;
  --sakura-surface-accent: #ffe9ed;
  --sakura-surface-glass: rgba(255, 255, 255, 0.85);
  --sakura-text-primary: #2b141e;
  --sakura-text-secondary: #633b4d;
  --sakura-text-muted: #9c7888;
  --sakura-text-inverse: #ffffff;
  --sakura-text-brand: #e11d48;
  --sakura-border-subtle: #ffeef1;
  --sakura-border-default: #ffe4e8;
  --sakura-border-hover: #fecdd3;
  --sakura-border-focus: #fda4af;
  --sakura-success: #10b981;
  --sakura-success-bg: #ecfdf5;
  --sakura-warning: #f59e0b;
  --sakura-warning-bg: #fffbeb;
  --sakura-danger: #f43f5e;
  --sakura-danger-bg: #fff1f2;
  --sakura-info: #0ea5e9;
  --sakura-info-bg: #f0f9ff;
  --sakura-button-primary-bg: #e11d48;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #fb7185;
  --sakura-text-link: #e11d48;
  --sakura-surface-control: #fff0f3;
  color-scheme: light;
}
:root[data-theme="ocean-blue"], [data-theme="ocean-blue"] {
  --sakura-primary-50: #f2f6fe;
  --sakura-primary-100: #dee8fc;
  --sakura-primary-200: #c4d5fa;
  --sakura-primary-300: #96b4f5;
  --sakura-primary-400: #628ff1;
  --sakura-primary-500: #2563eb;
  --sakura-primary-600: #2157cf;
  --sakura-primary-700: #1c4bb3;
  --sakura-primary-800: #183f96;
  --sakura-primary-900: #13337a;
  --sakura-surface-canvas: #f5f9ff;
  --sakura-surface-card: #ffffff;
  --sakura-surface-muted: #eef4ff;
  --sakura-surface-accent: #f2f6fe;
  --sakura-surface-glass: rgba(255,255,255,0.85);
  --sakura-text-primary: #13233d;
  --sakura-text-secondary: #415575;
  --sakura-text-muted: #7c8ba3;
  --sakura-text-inverse: #ffffff;
  --sakura-text-brand: #1d4ed8;
  --sakura-border-subtle: #366fed;
  --sakura-border-default: #4a7eef;
  --sakura-border-hover: #6e98f2;
  --sakura-border-focus: #2563eb;
  --sakura-success: #10b981;
  --sakura-success-bg: #ecfdf5;
  --sakura-warning: #b45309;
  --sakura-warning-bg: #fffbeb;
  --sakura-danger: #e11d48;
  --sakura-danger-bg: #fff1f2;
  --sakura-info: #0284c7;
  --sakura-info-bg: #f0f9ff;
  --sakura-button-primary-bg: #1c4bb3;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #628ff1;
  --sakura-text-link: #1d4ed8;
  --sakura-surface-control: #eef4ff;
  color-scheme: light;
  --sakura-shadow-sm: 0 1px 2px 0 rgba(37,99,235,0.12);
  --sakura-shadow-md: 0 4px 12px -2px rgba(37,99,235,0.12);
  --sakura-shadow-lg: 0 10px 24px -4px rgba(37,99,235,0.12);
  --sakura-shadow-btn: 0 2px 8px 0 rgba(37,99,235,0.12);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(37,99,235,0.12);
}
:root[data-theme="forest-tea"], [data-theme="forest-tea"] {
  --sakura-primary-50: #f1f7f3;
  --sakura-primary-100: #dcece2;
  --sakura-primary-200: #c0ddcb;
  --sakura-primary-300: #8fc2a2;
  --sakura-primary-400: #57a473;
  --sakura-primary-500: #15803d;
  --sakura-primary-600: #127136;
  --sakura-primary-700: #10612e;
  --sakura-primary-800: #0d5227;
  --sakura-primary-900: #0b4320;
  --sakura-surface-canvas: #f6faf5;
  --sakura-surface-card: #ffffff;
  --sakura-surface-muted: #eaf5eb;
  --sakura-surface-accent: #f1f7f3;
  --sakura-surface-glass: rgba(255,255,255,0.85);
  --sakura-text-primary: #183225;
  --sakura-text-secondary: #48614e;
  --sakura-text-muted: #819385;
  --sakura-text-inverse: #ffffff;
  --sakura-text-brand: #166534;
  --sakura-border-subtle: #278a4c;
  --sakura-border-default: #3e965e;
  --sakura-border-hover: #64ab7d;
  --sakura-border-focus: #15803d;
  --sakura-success: #10b981;
  --sakura-success-bg: #ecfdf5;
  --sakura-warning: #b45309;
  --sakura-warning-bg: #fffbeb;
  --sakura-danger: #e11d48;
  --sakura-danger-bg: #fff1f2;
  --sakura-info: #0284c7;
  --sakura-info-bg: #f0f9ff;
  --sakura-button-primary-bg: #10612e;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #57a473;
  --sakura-text-link: #166534;
  --sakura-surface-control: #eaf5eb;
  color-scheme: light;
  --sakura-shadow-sm: 0 1px 2px 0 rgba(21,128,61,0.12);
  --sakura-shadow-md: 0 4px 12px -2px rgba(21,128,61,0.12);
  --sakura-shadow-lg: 0 10px 24px -4px rgba(21,128,61,0.12);
  --sakura-shadow-btn: 0 2px 8px 0 rgba(21,128,61,0.12);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(21,128,61,0.12);
}
:root[data-theme="amber-paper"], [data-theme="amber-paper"] {
  --sakura-primary-50: #faf5f0;
  --sakura-primary-100: #f4e5da;
  --sakura-primary-200: #ebd1bd;
  --sakura-primary-300: #dbac89;
  --sakura-primary-400: #c9834e;
  --sakura-primary-500: #b45309;
  --sakura-primary-600: #9e4908;
  --sakura-primary-700: #893f07;
  --sakura-primary-800: #733506;
  --sakura-primary-900: #5e2b05;
  --sakura-surface-canvas: #fffbf4;
  --sakura-surface-card: #ffffff;
  --sakura-surface-muted: #fff2dd;
  --sakura-surface-accent: #faf5f0;
  --sakura-surface-glass: rgba(255,255,255,0.85);
  --sakura-text-primary: #3a2715;
  --sakura-text-secondary: #69513a;
  --sakura-text-muted: #9a8977;
  --sakura-text-inverse: #ffffff;
  --sakura-text-brand: #92400e;
  --sakura-border-subtle: #ba601c;
  --sakura-border-default: #c27133;
  --sakura-border-hover: #ce8e5b;
  --sakura-border-focus: #b45309;
  --sakura-success: #10b981;
  --sakura-success-bg: #ecfdf5;
  --sakura-warning: #b45309;
  --sakura-warning-bg: #fffbeb;
  --sakura-danger: #e11d48;
  --sakura-danger-bg: #fff1f2;
  --sakura-info: #0284c7;
  --sakura-info-bg: #f0f9ff;
  --sakura-button-primary-bg: #893f07;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #c9834e;
  --sakura-text-link: #92400e;
  --sakura-surface-control: #fff2dd;
  color-scheme: light;
  --sakura-shadow-sm: 0 1px 2px 0 rgba(180,83,9,0.12);
  --sakura-shadow-md: 0 4px 12px -2px rgba(180,83,9,0.12);
  --sakura-shadow-lg: 0 10px 24px -4px rgba(180,83,9,0.12);
  --sakura-shadow-btn: 0 2px 8px 0 rgba(180,83,9,0.12);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(180,83,9,0.12);
}
:root[data-theme="lavender-mist"], [data-theme="lavender-mist"] {
  --sakura-primary-50: #f7f3fe;
  --sakura-primary-100: #ebe1fc;
  --sakura-primary-200: #dccafa;
  --sakura-primary-300: #c0a0f6;
  --sakura-primary-400: #a171f2;
  --sakura-primary-500: #7c3aed;
  --sakura-primary-600: #6d33d1;
  --sakura-primary-700: #5e2cb4;
  --sakura-primary-800: #4f2598;
  --sakura-primary-900: #401e7b;
  --sakura-surface-canvas: #faf7ff;
  --sakura-surface-card: #ffffff;
  --sakura-surface-muted: #f2ebff;
  --sakura-surface-accent: #f7f3fe;
  --sakura-surface-glass: rgba(255,255,255,0.85);
  --sakura-text-primary: #2d1b47;
  --sakura-text-secondary: #58456d;
  --sakura-text-muted: #8d809d;
  --sakura-text-inverse: #ffffff;
  --sakura-text-brand: #6d28d9;
  --sakura-border-subtle: #8649ee;
  --sakura-border-default: #935cf0;
  --sakura-border-hover: #a87cf3;
  --sakura-border-focus: #7c3aed;
  --sakura-success: #10b981;
  --sakura-success-bg: #ecfdf5;
  --sakura-warning: #b45309;
  --sakura-warning-bg: #fffbeb;
  --sakura-danger: #e11d48;
  --sakura-danger-bg: #fff1f2;
  --sakura-info: #0284c7;
  --sakura-info-bg: #f0f9ff;
  --sakura-button-primary-bg: #5e2cb4;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #a171f2;
  --sakura-text-link: #6d28d9;
  --sakura-surface-control: #f2ebff;
  color-scheme: light;
  --sakura-shadow-sm: 0 1px 2px 0 rgba(124,58,237,0.12);
  --sakura-shadow-md: 0 4px 12px -2px rgba(124,58,237,0.12);
  --sakura-shadow-lg: 0 10px 24px -4px rgba(124,58,237,0.12);
  --sakura-shadow-btn: 0 2px 8px 0 rgba(124,58,237,0.12);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(124,58,237,0.12);
}
:root[data-theme="graphite-mono"], [data-theme="graphite-mono"] {
  --sakura-primary-50: #f3f4f5;
  --sakura-primary-100: #e0e2e6;
  --sakura-primary-200: #c8ccd1;
  --sakura-primary-300: #9da4ad;
  --sakura-primary-400: #6c7685;
  --sakura-primary-500: #334155;
  --sakura-primary-600: #2d394b;
  --sakura-primary-700: #273141;
  --sakura-primary-800: #212a36;
  --sakura-primary-900: #1b222c;
  --sakura-surface-canvas: #f8fafc;
  --sakura-surface-card: #ffffff;
  --sakura-surface-muted: #f0f3f7;
  --sakura-surface-accent: #f3f4f5;
  --sakura-surface-glass: rgba(255,255,255,0.85);
  --sakura-text-primary: #18212f;
  --sakura-text-secondary: #526071;
  --sakura-text-muted: #89939f;
  --sakura-text-inverse: #ffffff;
  --sakura-text-brand: #1e293b;
  --sakura-border-subtle: #435062;
  --sakura-border-default: #566273;
  --sakura-border-hover: #78828f;
  --sakura-border-focus: #334155;
  --sakura-success: #10b981;
  --sakura-success-bg: #ecfdf5;
  --sakura-warning: #b45309;
  --sakura-warning-bg: #fffbeb;
  --sakura-danger: #e11d48;
  --sakura-danger-bg: #fff1f2;
  --sakura-info: #0284c7;
  --sakura-info-bg: #f0f9ff;
  --sakura-button-primary-bg: #273141;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #6c7685;
  --sakura-text-link: #1e293b;
  --sakura-surface-control: #f0f3f7;
  color-scheme: light;
  --sakura-shadow-sm: 0 1px 2px 0 rgba(51,65,85,0.12);
  --sakura-shadow-md: 0 4px 12px -2px rgba(51,65,85,0.12);
  --sakura-shadow-lg: 0 10px 24px -4px rgba(51,65,85,0.12);
  --sakura-shadow-btn: 0 2px 8px 0 rgba(51,65,85,0.12);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(51,65,85,0.12);
}
:root[data-theme="midnight-cyan"], [data-theme="midnight-cyan"] {
  --sakura-primary-50: #f2fcfe;
  --sakura-primary-100: #def8fc;
  --sakura-primary-200: #c3f3fa;
  --sakura-primary-300: #95eaf7;
  --sakura-primary-400: #60dff3;
  --sakura-primary-500: #22d3ee;
  --sakura-primary-600: #1ebad1;
  --sakura-primary-700: #1aa0b5;
  --sakura-primary-800: #168798;
  --sakura-primary-900: #126e7c;
  --sakura-surface-canvas: #0b1220;
  --sakura-surface-card: #121d2c;
  --sakura-surface-muted: #18273b;
  --sakura-surface-accent: #203e51;
  --sakura-surface-glass: rgba(18,29,44,0.88);
  --sakura-text-primary: #e8f4fc;
  --sakura-text-secondary: #aec4d8;
  --sakura-text-muted: #a9bbc9;
  --sakura-text-inverse: #061320;
  --sakura-text-brand: #67e8f9;
  --sakura-border-subtle: #26394e;
  --sakura-border-default: #34475f;
  --sakura-border-hover: #4d657e;
  --sakura-border-focus: #22d3ee;
  --sakura-success: #6ee7b7;
  --sakura-success-bg: #10352d;
  --sakura-warning: #fbbf24;
  --sakura-warning-bg: #3e311b;
  --sakura-danger: #fda4af;
  --sakura-danger-bg: #421d30;
  --sakura-info: #7dd3fc;
  --sakura-info-bg: #132d45;
  --sakura-button-primary-bg: #0e7490;
  --sakura-button-primary-text: #ffffff;
  --sakura-focus-ring: #60dff3;
  --sakura-text-link: #67e8f9;
  --sakura-surface-control: #18273b;
  color-scheme: dark;
  --sakura-shadow-sm: 0 1px 2px 0 rgba(34,211,238,0.16);
  --sakura-shadow-md: 0 4px 12px -2px rgba(34,211,238,0.16);
  --sakura-shadow-lg: 0 10px 24px -4px rgba(34,211,238,0.16);
  --sakura-shadow-btn: 0 2px 8px 0 rgba(34,211,238,0.16);
  --sakura-shadow-inner: inset 0 2px 4px 0 rgba(34,211,238,0.16);
}
}
```

### CSS · components

```css
@layer components {
/* Explicit semantic overrides remove hardcoded brand assumptions in source */
.sakura-btn-primary { background: var(--sakura-button-primary-bg); color: var(--sakura-button-primary-text); }
.sakura-btn-primary:hover { background: var(--sakura-primary-700); }
[data-theme="midnight-cyan"] .sakura-btn-primary:hover { background: #155e75; }
.sakura-btn-secondary { color: var(--sakura-text-brand); }
.sakura-badge-primary { color: var(--sakura-text-brand); }
.sakura-input:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--sakura-border-focus) 30%, transparent); }
.sakura-scrollbar::-webkit-scrollbar-thumb { background: var(--sakura-primary-200); }
.sakura-card, .sakura-app-header, .sakura-app-sidebar, .sakura-app-content, .sakura-input { min-width: 0; }
.sakura-app-content > * { min-width: 0; }
.sakura-app-header { position: relative; z-index: var(--sakura-z-header); }
.sakura-btn:disabled, .sakura-input:disabled { cursor: not-allowed; opacity: .55; }
.sakura-btn:focus-visible, .sakura-input:focus-visible { outline: 2px solid var(--sakura-focus-ring); outline-offset: 2px; }
.sakura-input[aria-invalid="true"] { border-color: var(--sakura-danger); }
.sakura-btn[aria-busy="true"] { cursor: progress; }
.sakura-btn:active { transform: translateY(0); }
.sakura-card-title { min-width: 0; overflow-wrap: anywhere; }
.sakura-icon-fixed, .sakura-avatar { display: inline-flex; align-items: center; justify-content: center; }
.sakura-app-content { min-height: 0; }
.sakura-col-left, .sakura-col-center, .sakura-col-right { min-height: 0; }
}
```

### CSS · motion

```css
@layer motion {
:root {
  --sakura-duration-instant: 0ms;
  --sakura-duration-fast: 120ms;
  --sakura-duration-normal: 180ms;
  --sakura-duration-enter: 240ms;
  --sakura-duration-exit: 160ms;
  --sakura-duration-loading: 900ms;
  --sakura-duration-skeleton: 1400ms;
  --sakura-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --sakura-ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --sakura-ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --sakura-ease-linear: linear;
  --sakura-motion-hover: 1px;
  --sakura-motion-enter: 8px;
  --sakura-motion-exit: 4px;
  --sakura-stagger-step: 40ms;
  --sakura-stagger-max: 160ms;
}
.sakura-btn {
  transition-property: background-color, color, border-color, box-shadow, transform;
  transition-duration: var(--sakura-duration-fast);
  transition-timing-function: var(--sakura-ease-standard);
}
.sakura-input {
  transition-property: background-color, border-color, box-shadow;
  transition-duration: var(--sakura-duration-normal);
  transition-timing-function: var(--sakura-ease-standard);
}
.sakura-card {
  transition-property: border-color, box-shadow;
  transition-duration: var(--sakura-duration-normal);
  transition-timing-function: var(--sakura-ease-standard);
}
/* Lift is limited to a fine pointer and hover-capable device. */
.sakura-btn-primary:hover { transform: none; }
@media (hover: hover) and (pointer: fine) {
  .sakura-btn-primary:not(:disabled):not([aria-disabled="true"]):not([aria-busy="true"]):hover {
    transform: translateY(calc(-1 * var(--sakura-motion-hover)));
  }
}
.sakura-btn:active,
.sakura-btn:disabled,
.sakura-btn[aria-disabled="true"],
.sakura-btn[aria-busy="true"] { transform: none !important; }
/* Put these utilities on a wrapper when a child owns transform. */
.sakura-motion { opacity: 1; }
.sakura-motion[data-state="entering"] {
  animation-duration: var(--sakura-duration-enter);
  animation-timing-function: var(--sakura-ease-enter);
  animation-delay: clamp(0ms, var(--sakura-motion-delay, 0ms), var(--sakura-stagger-max));
  animation-iteration-count: 1;
  animation-fill-mode: backwards;
}
.sakura-motion[data-state="leaving"] {
  opacity: 0;
  pointer-events: none;
  animation-duration: var(--sakura-duration-exit);
  animation-timing-function: var(--sakura-ease-exit);
  animation-delay: 0ms;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}
.sakura-motion-fade[data-state="entering"] { animation-name: sakura-fade-in; }
.sakura-motion-fade[data-state="leaving"] { animation-name: sakura-fade-out; }
.sakura-motion-rise[data-state="entering"] { animation-name: sakura-rise-in; }
.sakura-motion-rise[data-state="leaving"] { animation-name: sakura-rise-out; }
.sakura-motion-stagger > .sakura-motion { --sakura-motion-delay: var(--sakura-stagger-max); }
.sakura-motion-stagger > .sakura-motion:nth-child(1) { --sakura-motion-delay: 0ms; }
.sakura-motion-stagger > .sakura-motion:nth-child(2) { --sakura-motion-delay: var(--sakura-stagger-step); }
.sakura-motion-stagger > .sakura-motion:nth-child(3) { --sakura-motion-delay: calc(2 * var(--sakura-stagger-step)); }
.sakura-motion-stagger > .sakura-motion:nth-child(4) { --sakura-motion-delay: calc(3 * var(--sakura-stagger-step)); }
.sakura-spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--sakura-radius-full);
  animation: sakura-spin var(--sakura-duration-loading) var(--sakura-ease-linear) infinite;
}
.sakura-skeleton {
  background: var(--sakura-surface-muted);
  border: 1px solid var(--sakura-border-subtle);
  border-radius: var(--sakura-radius-sm);
  animation: sakura-skeleton-pulse var(--sakura-duration-skeleton) var(--sakura-ease-standard) infinite;
}
@keyframes sakura-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sakura-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes sakura-rise-in {
  from { opacity: 0; transform: translateY(var(--sakura-motion-enter)); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sakura-rise-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(calc(-1 * var(--sakura-motion-exit))); }
}
@keyframes sakura-spin { to { transform: rotate(360deg); } }
@keyframes sakura-skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
}
```

### CSS · responsive

```css
@layer responsive {
/* Desktop shell remains a 1920×1080 reference, not a mandatory viewport lock */
@media (min-width: 1280px) {
.sakura-app-content { min-width: 0; }
}
@media (max-width: 1279px) {
.sakura-app-content { gap: 12px; padding: 12px; }
.sakura-col-left { width: min(280px, 28vw); }
.sakura-col-right { width: min(320px, 30vw); }
}
@media (max-width: 767px) {
html, body, #root { width: 100%; min-height: 100%; height: auto; overflow-x: hidden; overflow-y: auto; }
.sakura-app-header { min-height: 56px; height: auto; padding: 8px 16px; gap: 8px; flex-wrap: wrap; }
.sakura-app-sidebar { width: 100%; height: auto; max-height: 30dvh; overflow-y: auto; border-right: 0; border-bottom: 1px solid var(--sakura-border-default); }
.sakura-app-content { width: 100%; height: auto; overflow: visible; display: flex; flex-direction: column; padding: 12px; gap: 12px; }
.sakura-col-left, .sakura-col-center, .sakura-col-right { width: 100%; max-width: 100%; height: auto; overflow: visible; }
.sakura-card { padding: 14px 16px; }
.sakura-btn { min-height: 44px; height: auto; }
.sakura-input { min-height: 44px; height: auto; }
}
@media (max-width: 479px) {
.sakura-app-content { padding: 8px; gap: 8px; }
.sakura-card { padding: 12px; }
}
}
```

### CSS · accessibility

```css
@layer accessibility {

@media (prefers-reduced-motion: reduce) {
  .sakura-motion, .sakura-spinner, .sakura-skeleton {
    animation: none !important;
    transform: none !important;
  }
  .sakura-btn, .sakura-input, .sakura-card { transition: none !important; }
  .sakura-btn { transform: none !important; }
  .sakura-motion[data-state="entering"], .sakura-skeleton { opacity: 1; }
  .sakura-motion[data-state="leaving"] { opacity: 0; }
}
@media (forced-colors: active) {
  .sakura-skeleton { background: Canvas; border-color: CanvasText; animation: none; }
}

@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }
@media (forced-colors: active) { .sakura-btn, .sakura-input, .sakura-card { border: 1px solid CanvasText; } }
}
```

