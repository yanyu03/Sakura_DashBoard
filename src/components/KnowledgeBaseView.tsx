import React, { useState } from 'react';

interface KnowledgeBaseViewProps {
  onReturnToWorkspace: () => void;
  onOpenSqlBlueprint?: () => void;
  showToast: (msg: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onReturnToWorkspace,
  onOpenSqlBlueprint,
  showToast,
}) => {
  const [topTab, setTopTab] = useState<'kb-home' | 'doc-categories' | 'grading-standards' | 'faculty-qa'>('kb-home');
  const [activeDoc, setActiveDoc] = useState<string>('ai-grading-sop');
  const [likeCount, setLikeCount] = useState(248);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnchor, setActiveAnchor] = useState<'flow-overview' | 'stamp-incentive' | 'faq-section'>('flow-overview');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpQuestion, setHelpQuestion] = useState('');

  const scrollToSection = (id: 'flow-overview' | 'stamp-incentive' | 'faq-section') => {
    setActiveAnchor(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-surface text-on-surface h-screen w-screen overflow-y-auto flex flex-col select-none">
      {/* Top Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(131,24,67,0.05)]">
        <div className="h-16 sm:h-20 w-full px-4 sm:px-margin-desktop flex items-center justify-between gap-2 sm:gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div
              onClick={onReturnToWorkspace}
              className="flex items-center gap-space-sm cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-inverse-surface">
                <span className="material-symbols-outlined text-[24px]">
                  local_florist
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface leading-none">
                  SakuraEdu
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">
                  樱花教务云 · 知识库
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                版本
              </span>
              <div className="flex items-center gap-1 text-on-surface font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container">
                <span className="font-semibold">v4.2 LTS</span>
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </div>
            </div>

            <nav className="hidden xl:flex items-center gap-space-xs p-1 bg-surface-container-low rounded-full">
              {[
                { id: 'kb-home', label: '知识中心' },
                { id: 'doc-categories', label: '教务手册' },
                { id: 'grading-standards', label: '教学考评规范' },
                { id: 'faculty-qa', label: '教师答疑社区' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTopTab(item.id as typeof topTab);
                    showToast(`已切换至「${item.label}」频道`);
                  }}
                  className={`px-space-md py-1.5 rounded-full transition-all font-label-md text-label-md cursor-pointer ${
                    topTab === item.id
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden md:flex items-center bg-surface-container-lowest px-space-md py-2 rounded-full shadow-[0_2px_12px_rgba(131,24,67,0.04)] w-64 lg:w-80">
              <span className="material-symbols-outlined text-outline text-[20px] mr-space-xs">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant"
                placeholder="检索教务规范、排课指南、评分细则..."
                type="text"
              />
              <kbd className="font-label-sm text-label-sm bg-surface-container-low text-on-surface-variant px-space-xs py-0.5 rounded-full">
                ⌘K
              </kbd>
            </div>

            <button
              type="button"
              onClick={onReturnToWorkspace}
              className="flex items-center gap-1.5 px-3 sm:px-space-md py-1.5 sm:py-2 rounded-full bg-surface-container-high text-on-surface hover:bg-secondary-fixed transition-colors font-label-md text-xs sm:text-label-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                dashboard
              </span>
              <span>返回教务台</span>
            </button>

            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                help_outline
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 sm:pt-20 bg-surface flex-grow">
        <div className="flex flex-col w-full lg:h-[calc(100vh-5rem)] lg:overflow-hidden bg-surface text-on-surface">
          {/* 顶部二级状态指示与快捷操作栏 */}
          <div className="py-2.5 px-4 sm:px-margin flex flex-wrap items-center justify-between gap-2 bg-surface-container-low shrink-0 shadow-sm relative z-20">
            <div className="flex items-center gap-2 sm:gap-space-md flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <h1 className="font-headline-sm text-sm sm:text-headline-sm text-on-surface tracking-tight font-bold">
                  文档与业务说明中心
                </h1>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-secondary-container text-xs font-label-sm">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  verified
                </span>
                <span>V4.2.0 春季教务版更新指引</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex relative items-center bg-surface-container-lowest px-space-md py-1.5 rounded-full shadow-sm w-64">
                <span className="material-symbols-outlined text-outline text-[18px] mr-2">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline-variant"
                  placeholder="全库速查知识点、业务规范..."
                  type="text"
                />
              </div>
              <button
                type="button"
                onClick={onReturnToWorkspace}
                className="px-3.5 py-1.5 rounded-full bg-primary-container text-inverse-surface hover:bg-secondary-container transition-all flex items-center gap-1.5 font-label-md text-xs shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  space_dashboard
                </span>
                <span>返回工作台</span>
              </button>
            </div>
          </div>

          {/* 视口核心三栏布局 (移动端单栏阅读，桌面端三栏) */}
          <div className="flex flex-col lg:flex-row flex-1 w-full lg:overflow-hidden">
            {/* 左栏：目录树导航 (桌面端显示) */}
            <aside className="hidden lg:flex w-[280px] shrink-0 bg-surface-container-lowest flex-col justify-between overflow-y-auto p-4 shadow-sm z-10">
              <div className="space-y-4">
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    教务规范导航体系
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container font-label-sm text-[11px]">
                    共 28 篇
                  </span>
                </div>

                <nav className="space-y-1 font-body-sm text-body-sm">
                  {/* 分组 1: 入门指引 */}
                  <div className="rounded-xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          wb_sunny
                        </span>
                        <span>入门指引</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        expand_more
                      </span>
                    </button>
                    <div className="pl-7 pr-2 py-1 space-y-0.5 text-on-surface-variant">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDoc('new-teacher-guide');
                          showToast('已切换阅读：《新教师3分钟上手手账》');
                        }}
                        className={`w-full text-left block py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                          activeDoc === 'new-teacher-guide'
                            ? 'text-secondary font-semibold bg-surface-container-low'
                            : 'hover:text-secondary hover:bg-surface-container-low'
                        }`}
                      >
                        新教师3分钟上手手账
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDoc('workspace-map');
                          showToast('已切换阅读：《工作台功能速览大图》');
                        }}
                        className={`w-full text-left block py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                          activeDoc === 'workspace-map'
                            ? 'text-secondary font-semibold bg-surface-container-low'
                            : 'hover:text-secondary hover:bg-surface-container-low'
                        }`}
                      >
                        工作台功能速览大图
                      </button>
                    </div>
                  </div>

                  {/* 分组 2: 日常教学 */}
                  <div className="rounded-xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          calendar_month
                        </span>
                        <span>日常教学与排课</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        expand_more
                      </span>
                    </button>
                    <div className="pl-7 pr-2 py-1 space-y-0.5 text-on-surface-variant">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDoc('schedule-rules');
                          showToast('已切换阅读：《课表弹性避让编排准则》');
                        }}
                        className="w-full text-left block py-1.5 px-2 rounded-lg hover:text-secondary hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        课表弹性避让编排准则
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDoc('unit-lesson-sync');
                          showToast('已切换阅读：《大单元备课教案同步规范》');
                        }}
                        className="w-full text-left block py-1.5 px-2 rounded-lg hover:text-secondary hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        大单元备课教案同步规范
                      </button>
                    </div>
                  </div>

                  {/* 分组 3: 作业与批改 (当前激活模块) */}
                  <div className="bg-surface-container-low/70 rounded-2xl p-1.5 space-y-1">
                    <div className="flex items-center justify-between px-2.5 py-1 font-label-md text-secondary">
                      <span className="flex items-center gap-2 font-bold">
                        <span className="material-symbols-outlined text-[18px]">
                          stylus_note
                        </span>
                        <span>作业与批改中心</span>
                      </span>
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDoc('ai-grading-sop');
                          scrollToSection('flow-overview');
                        }}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-primary-container text-on-primary-container font-semibold shadow-sm text-[13px] cursor-pointer"
                      >
                        <span className="truncate">AI智能批阅与诊断指南</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_right
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection('stamp-incentive')}
                        className="w-full text-left block py-1.5 px-3 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface transition-colors text-[13px] cursor-pointer"
                      >
                        樱花激励印章与评语配置
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection('faq-section')}
                        className="w-full text-left block py-1.5 px-3 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface transition-colors text-[13px] cursor-pointer"
                      >
                        错题自动归卷汇编导出
                      </button>
                    </div>
                  </div>

                  {/* 分组 4-6 */}
                  {[
                    { icon: 'analytics', label: '考务与成绩赋分' },
                    { icon: 'family_restroom', label: '家校共育与隐私' },
                    { icon: 'contact_support', label: '故障诊断与工单支持' },
                  ].map((g) => (
                    <div key={g.label} className="rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => showToast(`已展开「${g.label}」章节目录`)}
                        className="w-full flex items-center justify-between px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors rounded-xl font-label-md cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-tertiary">
                            {g.icon}
                          </span>
                          <span>{g.label}</span>
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  ))}
                </nav>
              </div>

              {/* 侧栏底部小组件 */}
              <div className="p-3 bg-surface-container rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-container text-inverse-surface flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">
                    auto_stories
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                    2024春季教研全书
                  </p>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">
                    已更新至修订第3版
                  </p>
                </div>
              </div>
            </aside>

            {/* 中间栏：核心阅读区 */}
            <main className="flex-1 bg-surface lg:overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 flex justify-center">
              <article className="w-full max-w-[890px] space-y-6 pb-12">
                {/* 文章标题与元数据头卡片 */}
                <header className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-primary-fixed-dim/40 blur-2xl pointer-events-none"></div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                      核心业务规范
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      作业编号: SOP-EDU-2024
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight font-bold">
                    AI智能批改与大题切片诊断操作规范（2024春季修订版）
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-on-surface-variant font-body-sm text-body-sm">
                    <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">
                        folder_special
                      </span>
                      <div>
                        <span className="block text-[11px] text-outline">
                          所属模块
                        </span>
                        <span className="font-semibold text-on-surface">
                          作业与批阅中心
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">
                        school
                      </span>
                      <div>
                        <span className="block text-[11px] text-outline">
                          适用范围
                        </span>
                        <span className="font-semibold text-on-surface">
                          高中部 / 初中部
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">
                        update
                      </span>
                      <div>
                        <span className="block text-[11px] text-outline">
                          最后修订
                        </span>
                        <span className="font-semibold text-on-surface">
                          2024-04-12
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">
                        verified_user
                      </span>
                      <div>
                        <span className="block text-[11px] text-outline">
                          编制部门
                        </span>
                        <span className="font-semibold text-on-surface">
                          教务处保障组
                        </span>
                      </div>
                    </div>
                  </div>
                </header>

                {/* 章节 01：核心流程概览 */}
                <section
                  className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm space-y-4"
                  id="flow-overview"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-headline-sm flex items-center justify-center font-bold text-sm">
                        01
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                        核心流程概览
                      </h3>
                    </div>
                    <span className="text-label-sm font-label-sm text-secondary bg-surface-container px-3 py-1 rounded-full">
                      四步标准化作业
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    在进行日常周测及大单元阶段测试批改时，系统支持通过高清手持扫描仪或平板原装摄像头采集纸质作业。借助
                    OCR 大模型视觉感知，自动分割主观题作答区域，极大压缩传统阅卷时长。
                  </p>

                  {/* 4 步步骤流指示卡片 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {[
                      {
                        step: '1',
                        icon: 'document_scanner',
                        title: '上传试卷原稿',
                        desc: '支持批量 PDF / 高清拍照',
                      },
                      {
                        step: '2',
                        icon: 'crop_free',
                        title: '框选大题考点',
                        desc: '切片定位赋分锚点区块',
                      },
                      {
                        step: '3',
                        icon: 'rule_folder',
                        title: '设定赋分细则',
                        desc: '配置采分点与关键词权重',
                      },
                      {
                        step: '4',
                        icon: 'task_alt',
                        title: 'AI预批+教师复核',
                        desc: '一键批量落款专属评语',
                      },
                    ].map((s) => (
                      <div
                        key={s.step}
                        onClick={() =>
                          showToast(`步骤 ${s.step}：${s.title} — ${s.desc}`)
                        }
                        className="p-3.5 rounded-2xl bg-surface-container-low relative flex flex-col justify-between h-32 group hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold text-xs flex items-center justify-center">
                            {s.step}
                          </span>
                          <span className="material-symbols-outlined text-secondary text-[20px]">
                            {s.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md font-semibold text-on-surface">
                            {s.title}
                          </p>
                          <p className="text-[11px] text-outline mt-0.5">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 视觉嵌入：模拟切片诊断效果图 */}
                  <div className="p-4 rounded-2xl bg-surface-container flex items-center justify-between gap-4 mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-secondary font-label-md">
                        <span className="material-symbols-outlined text-[18px]">
                          lightbulb
                        </span>
                        <span className="font-semibold">切片算法容差建议</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        当学生书写超出答题卡边框 1.5cm
                        以内时，算法引擎会自动启动弹性向外膨胀感知，无需手动重新裁切。
                      </p>
                    </div>
                    <div className="w-28 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center font-label-sm text-secondary font-bold shrink-0 shadow-sm">
                      容差阈值: 98.4%
                    </div>
                  </div>
                </section>

                {/* 章节 02：智能印章与激励机制 */}
                <section
                  className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm space-y-4"
                  id="stamp-incentive"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-headline-sm flex items-center justify-center font-bold text-sm">
                        02
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                        智能印章与鼓励机制使用技巧
                      </h3>
                    </div>
                    <span className="text-label-sm font-label-sm text-on-secondary-container bg-secondary-fixed px-3 py-1 rounded-full font-semibold">
                      少女心教研印章库
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    为消除学生在面对错题解析时的焦虑感，樱花教务云独家设计了“触感拟真印章”体系。教师在复核作答时，双击右侧工具栏即可快速给与鼓励标签，同步推送到学生端手账式家校通知。
                  </p>

                  {/* 2款精选印章样式卡片展示 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-2xl bg-surface-container-low flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary-container/80 flex items-center justify-center text-inverse-surface shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[32px]">
                          edit_note
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            「妙笔生花」印章
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-bold">
                            推荐指数 ★★★★★
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          适用场景：语文作文立意新颖、英语短文语法优美、解题思路跳出框架时使用。附带
                          +5 颗学术樱花积分。
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-container-low flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[32px]">
                          psychology_alt
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            「见解独到」印章
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[11px] font-bold">
                            初高通适
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          适用场景：理科综合多解法尝试、文史小论文思辨性突出。学生端将触发专属春季樱花雨动效反馈。
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 章节 03：常见问题 (FAQ) 速查 */}
                <section
                  className="p-6 rounded-2xl bg-surface-container-lowest shadow-sm space-y-4"
                  id="faq-section"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-headline-sm flex items-center justify-center font-bold text-sm">
                        03
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                        教师操作常见问题（FAQ）速查
                      </h3>
                    </div>
                    <span className="material-symbols-outlined text-outline">
                      help
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-surface-container-low space-y-1.5">
                      <div className="flex items-center gap-2 text-on-surface font-semibold font-label-md">
                        <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-xs flex items-center justify-center">
                          Q
                        </span>
                        <span>
                          手写卷面字迹潦草或笔迹偏浅时，如何提高 OCR 识别准确率？
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pl-7">
                        答：在步骤 1 上传时，勾选“暗光与铅笔笔迹增强模式”；系统将自动施加
                        120% 动态对比度增益滤镜，提升连笔草书的语义推断能力。
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low space-y-1.5">
                      <div className="flex items-center gap-2 text-on-surface font-semibold font-label-md">
                        <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-xs flex items-center justify-center">
                          Q
                        </span>
                        <span>
                          文言文断句符号（如斜杠 / 或圈号）如何配置专属评分扣分法则？
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pl-7">
                        答：在步骤 3
                        赋分细则中，切换题型为“古代诗文断句”，在规则面板录入正确标点序列（如：A
                        / B / C），每错一处或漏断一处扣 1 分。
                      </p>
                    </div>
                  </div>
                </section>

                {/* 底部互动与协作区域 */}
                <footer className="p-6 rounded-2xl bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      这篇业务指引对您有帮助吗？
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLiked(!liked);
                          setLikeCount((c) => (liked ? c - 1 : c + 1));
                          showToast(liked ? '已取消点赞' : '感谢您的超赞樱花心反馈 🌸');
                        }}
                        className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-label-sm text-label-sm shadow-sm active:scale-95 cursor-pointer ${
                          liked
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-lowest hover:bg-primary-container text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          favorite
                        </span>
                        <span>超赞樱花心 ({likeCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookmarked(!bookmarked);
                          showToast(
                            bookmarked ? '已移出常用收藏' : '已加入林知夏老师的常用教研收藏夹'
                          );
                        }}
                        className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-label-sm text-label-sm shadow-sm active:scale-95 cursor-pointer ${
                          bookmarked
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          bookmark
                        </span>
                        <span>{bookmarked ? '已收藏至教研夹' : '加入常用教研收藏'}</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('正在生成《SOP-EDU-2024 AI批改规范》高清 PDF 手册...')
                    }
                    className="px-4 py-2 rounded-full bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      picture_as_pdf
                    </span>
                    <span>导出为 PDF 教研手册</span>
                  </button>
                </footer>
              </article>
            </main>

            {/* 右栏：大纲与辅助面板 (桌面端 xl 显示) */}
            <aside className="hidden xl:flex w-[320px] shrink-0 bg-surface-container-lowest p-5 flex-col justify-between overflow-y-auto shadow-sm z-10 space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
                      本文目录导航
                    </span>
                    <span className="material-symbols-outlined text-outline text-[18px]">
                      format_list_bulleted
                    </span>
                  </div>
                  <div className="space-y-1 font-label-sm text-label-sm">
                    {[
                      { id: 'flow-overview', label: '01 核心流程概览 (四步法)' },
                      { id: 'stamp-incentive', label: '02 智能印章与激励机制' },
                      { id: 'faq-section', label: '03 教师操作常见问题 (FAQ)' },
                    ].map((toc) => (
                      <button
                        key={toc.id}
                        type="button"
                        onClick={() =>
                          scrollToSection(toc.id as typeof activeAnchor)
                        }
                        className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                          activeAnchor === toc.id
                            ? 'bg-surface-container-low text-secondary font-semibold'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activeAnchor === toc.id
                              ? 'bg-secondary'
                              : 'bg-outline-variant'
                          }`}
                        ></span>
                        <span>{toc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 相关推荐文档 */}
                <div className="space-y-3 pt-2">
                  <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider block">
                    相关业务手册推荐
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        showToast('正在打开《期中联考赋分换算对照表》...')
                      }
                      className="w-full text-left p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                        calculate
                      </span>
                      <div>
                        <p className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-secondary transition-colors">
                          期中联考赋分换算对照表
                        </p>
                        <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                          等级赋分五级九等模型操作说明
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        showToast('正在打开《家校沟通防骚扰模式白皮书》...')
                      }
                      className="w-full text-left p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                        shield_person
                      </span>
                      <div>
                        <p className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-secondary transition-colors">
                          家校沟通防骚扰模式白皮书
                        </p>
                        <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                          虚拟隐私电话与免打扰时段设定
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 快捷通道卡片 */}
              <div className="p-4 rounded-2xl bg-primary-fixed/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
                    <span className="material-symbols-outlined text-[18px]">
                      support_agent
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md font-bold text-on-primary-fixed">
                      Sakura-Help 助手
                    </p>
                    <p className="text-[11px] text-on-primary-fixed-variant">
                      教务工程师实时在线中
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setHelpModalOpen(true)}
                    className="py-2 px-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:text-secondary text-label-sm font-label-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      chat
                    </span>
                    <span>提问小助手</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast('已为您创建高优先级教务保障工单 #TK-20240516')
                    }
                    className="py-2 px-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:text-secondary text-label-sm font-label-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      bug_report
                    </span>
                    <span>提交业务工单</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast('已开始下载《2024春季教师全景手账 PDF (42.8MB)》')
                  }
                  className="w-full py-2 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high text-on-secondary-container text-label-sm font-label-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    download
                  </span>
                  <span>下载《教师全景手账 PDF》</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg pb-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-inverse-surface">
                <span className="material-symbols-outlined text-[20px]">
                  local_florist
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  SakuraEdu 樱花教务云
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  教师专属知识库与协作支援平台
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-md">
              <button
                type="button"
                onClick={() => showToast('已跳转至教务手册目录')}
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                教务手册目录
              </button>
              <button
                type="button"
                onClick={() => showToast('已跳转至评分标准体系')}
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                评分标准体系
              </button>
              <button
                type="button"
                onClick={() => showToast('已跳转至教师交流社群')}
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                教师交流社群
              </button>
              <button
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                技术支持工单
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-md">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              © 2024 SakuraEdu Academic Systems. 保留所有权利。服务于各级学院与学术带头人。
            </span>
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-surface-container px-space-sm py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                教学云服务正常运行中
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sakura-Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">
                    support_agent
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    Sakura-Help 教务小助手
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    预留问答服务接口 · 7×24h 教务规范速查
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="p-3 rounded-2xl bg-surface-container-low text-xs text-on-surface leading-relaxed">
              林老师您好！您可以询问关于主观题 OCR 切片容差、等级赋分换算、调代课审批流或家校防打扰模式的操作细节。
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={helpQuestion}
                onChange={(e) => setHelpQuestion(e.target.value)}
                placeholder="输入您的教务操作疑问..."
                className="flex-1 px-4 py-2.5 rounded-full bg-surface-container-low text-xs text-on-surface outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!helpQuestion.trim()) return;
                  showToast('已收到提问，教务知识库已为您匹配对应章节规范');
                  setHelpQuestion('');
                  setHelpModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-full bg-secondary text-on-secondary font-label-sm text-xs"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
