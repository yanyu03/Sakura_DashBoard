import React, { useCallback, useEffect, useState } from 'react';
import { AuthPortalView } from './components/AuthPortalView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { SqlApiArchitectureModal } from './components/SqlApiArchitectureModal';
import { DashboardOverviewView } from './components/views/DashboardOverviewView';
import { ExamAnalyticsView } from './components/views/ExamAnalyticsView';
import { HomeworkCenterView } from './components/views/HomeworkCenterView';
import { LessonPlansView } from './components/views/LessonPlansView';
import { ScheduleManagementView } from './components/views/ScheduleManagementView';
import { SchoolHomeCommView } from './components/views/SchoolHomeCommView';
import { StudentProfilesView } from './components/views/StudentProfilesView';
import { AWESOME_DESIGN_THEMES, UiThemeId } from './data/awesomeDesignTheme';
import { sakuraApi } from './services/sakuraApiService';
import { FacultyDefaultProfileDTO } from './types/api';
import { AppShell, WorkspaceTab } from './types/sakura';

const BASELINE_DEFAULT_PROFILE: FacultyDefaultProfileDTO = {
  teacherId: 'fac-admin',
  facultyCode: 'admin',
  password: 'admin',
  fullName: '林知夏 老师',
  titleRole: '高二(3)班班主任 · 语文组',
  department: '高中语文教研组',
  defaultTab: 'homework-center',
  defaultTheme: 'awesome-green',
  defaultClassName: '高二(1)班',
  semesterLabel: '2024 春季学期 · 第 12 周',
  dndEnabled: true,
  dndStartTime: '20:30',
};

export default function App() {
  // Default initial screen is the Faculty Auth Portal, then enter Workspace on login
  const [activeShell, setActiveShell] = useState<AppShell>('auth');
  const [defaultProfile, setDefaultProfile] = useState<FacultyDefaultProfileDTO>(
    BASELINE_DEFAULT_PROFILE
  );
  const [draftProfile, setDraftProfile] = useState<FacultyDefaultProfileDTO>(
    BASELINE_DEFAULT_PROFILE
  );
  const [savingDefaults, setSavingDefaults] = useState(false);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('homework-center');
  const [activeTheme, setActiveTheme] = useState<UiThemeId>('awesome-green');
  const [globalSearch, setGlobalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [classModeOpen, setClassModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sqlApiModalOpen, setSqlApiModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.clearTimeout((window as unknown as { __toastTimer?: number }).__toastTimer);
    (window as unknown as { __toastTimer?: number }).__toastTimer = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadSavedDefaultProfile = useCallback(async () => {
    const res = await sakuraApi.auth.getDefaultProfile();
    if (res.success && res.data) {
      setDefaultProfile(res.data);
      setDraftProfile(res.data);
      if (res.data.defaultTheme) {
        setActiveTheme(res.data.defaultTheme);
      }
      if (res.data.defaultTab) {
        setActiveTab(res.data.defaultTab);
      }
    }
  }, []);

  useEffect(() => {
    loadSavedDefaultProfile();
  }, [loadSavedDefaultProfile]);

  const handleOpenSettingsModal = () => {
    setDraftProfile(defaultProfile);
    setSettingsOpen(true);
  };

  const handleSaveDefaultProfile = async (logoutAfterSave = false) => {
    setSavingDefaults(true);
    try {
      const res = await sakuraApi.auth.saveDefaultProfile(draftProfile);
      if (res.success && res.data) {
        setDefaultProfile(res.data);
        setDraftProfile(res.data);
        setActiveTheme(res.data.defaultTheme);
        setActiveTab(res.data.defaultTab);
        setSettingsOpen(false);
        if (logoutAfterSave) {
          setActiveShell('auth');
          showToast(
            `已保存默认信息 (${res.data.facultyCode} / ${res.data.fullName}) 并返回登录页生效`
          );
        } else {
          showToast(res.message);
        }
      }
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleResetToFactoryDefault = async () => {
    setSavingDefaults(true);
    try {
      const res = await sakuraApi.auth.saveDefaultProfile(BASELINE_DEFAULT_PROFILE);
      if (res.success && res.data) {
        setDefaultProfile(res.data);
        setDraftProfile(res.data);
        setActiveTheme(res.data.defaultTheme);
        setActiveTab(res.data.defaultTab);
        showToast('已恢复初始基准默认信息 (admin / 林知夏 老师)');
      }
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim();
    if (!q) return;
    if (q.includes('苏') || q.includes('周') || q.includes('学情') || q.includes('档案')) {
      setActiveTab('student-profiles');
      showToast(`已为您检索并跳转至「学生学情档案」：${q}`);
    } else if (q.includes('课表') || q.includes('排课')) {
      setActiveTab('schedule-management');
      showToast(`已为您跳转至「课表与排课」：${q}`);
    } else if (q.includes('雷雨') || q.includes('教案') || q.includes('备课')) {
      setActiveTab('lesson-plans');
      showToast(`已为您检索「备课教案库」：${q}`);
    } else if (q.includes('考') || q.includes('成绩')) {
      setActiveTab('exam-analytics');
      showToast(`已为您跳转至「考务与成绩分析」：${q}`);
    } else if (q.includes('家') || q.includes('沟通')) {
      setActiveTab('school-home-communication');
      showToast(`已为您跳转至「家校沟通社区」：${q}`);
    } else {
      setActiveTab('homework-center');
      showToast(`正在「作业批改中心」检索：${q}`);
    }
  };

  const navItems: { id: WorkspaceTab; icon: string; label: string; shortLabel: string }[] = [
    { id: 'dashboard-overview', icon: 'grid_view', label: '工作台概览', shortLabel: '概览' },
    { id: 'schedule-management', icon: 'calendar_today', label: '课表与排课', shortLabel: '课表' },
    { id: 'student-profiles', icon: 'school', label: '学生学情档案', shortLabel: '学情' },
    { id: 'homework-center', icon: 'rate_review', label: '作业批改中心', shortLabel: '批阅' },
    { id: 'lesson-plans', icon: 'menu_book', label: '备课教案库', shortLabel: '备课' },
    { id: 'exam-analytics', icon: 'analytics', label: '考务与成绩分析', shortLabel: '考务' },
    {
      id: 'school-home-communication',
      icon: 'forum',
      label: '家校沟通社区',
      shortLabel: '家校',
    },
  ];

  return (
    <div data-theme={activeTheme} className="w-screen h-screen overflow-hidden relative">
      {/* Shell 1: Faculty Auth Portal */}
      {activeShell === 'auth' && (
        <AuthPortalView
          activeTheme={activeTheme}
          onChangeTheme={setActiveTheme}
          defaultProfile={defaultProfile}
          onOpenDefaultSettingsModal={handleOpenSettingsModal}
          onLoginSuccess={(session, explicitTab) => {
            setDefaultProfile((prev) => ({
              ...prev,
              facultyCode: session.facultyCode || prev.facultyCode,
              fullName: session.fullName || prev.fullName,
              titleRole: session.titleRole || prev.titleRole,
              department: session.department || prev.department,
              defaultTab: session.defaultTab || prev.defaultTab,
              defaultTheme: session.defaultTheme || prev.defaultTheme,
              defaultClassName: session.defaultClassName || prev.defaultClassName,
              semesterLabel: session.semesterLabel || prev.semesterLabel,
              dndEnabled: session.dndEnabled ?? prev.dndEnabled,
              dndStartTime: session.dndStartTime || prev.dndStartTime,
            }));
            if (session.defaultTheme) {
              setActiveTheme(session.defaultTheme);
            }
            setActiveTab(explicitTab || session.defaultTab || defaultProfile.defaultTab);
            setActiveShell('workspace');
          }}
          onOpenKnowledgeBase={() => setActiveShell('knowledge-base')}
          onOpenSqlBlueprint={() => setSqlApiModalOpen(true)}
          showToast={showToast}
        />
      )}

      {/* Shell 2: Knowledge Base & SOP Center */}
      {activeShell === 'knowledge-base' && (
        <KnowledgeBaseView
          onReturnToWorkspace={() => setActiveShell('workspace')}
          onOpenSqlBlueprint={() => setSqlApiModalOpen(true)}
          showToast={showToast}
        />
      )}

      {/* Shell 3: Main Faculty Workspace */}
      {activeShell === 'workspace' && (
        <div className="bg-background font-body-md text-on-surface w-screen h-screen overflow-hidden select-none flex flex-col">
          {/* Global Top Header */}
          <header className="h-14 w-full flex-none bg-surface/95 backdrop-blur-xl border-b border-outline-variant/35 z-50 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden w-8 h-8 rounded bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container shrink-0 cursor-pointer"
                aria-label="打开导航菜单"
              >
                <span className="material-symbols-outlined text-lg">menu</span>
              </button>

              <div
                onClick={() => setActiveTab('dashboard-overview')}
                className="flex items-center gap-2 cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary-container shadow-2xs">
                  <span className="material-symbols-outlined text-lg">
                    eco
                  </span>
                </div>
                <div>
                  <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold tracking-tight block leading-none">
                    SakuraEdu
                  </span>
                  <span className="font-label-sm text-[10px] text-secondary tracking-wider uppercase block mt-0.5">
                    樱花教务云 · {defaultProfile.department}
                  </span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('schedule-management')}
                className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/25 cursor-pointer hover:bg-surface-container transition-colors whitespace-nowrap shrink-0"
              >
                <span className="material-symbols-outlined text-primary text-sm">
                  calendar_month
                </span>
                <span className="font-label-sm text-xs text-on-surface font-semibold">
                  {defaultProfile.semesterLabel}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-body-sm text-xs text-on-surface-variant">
                  默认班级：{defaultProfile.defaultClassName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <form
                onSubmit={handleGlobalSearchSubmit}
                className="hidden md:flex relative items-center"
              >
                <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-sm">
                  search
                </span>
                <input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-40 lg:w-52 xl:w-60 pl-8 pr-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface placeholder:text-on-surface-variant/60 font-body-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="搜索学生、教案、排课表..."
                  type="text"
                />
              </form>

              {/* Awesome DESIGN.md Quick Theme Switcher in Header */}
              <div className="hidden sm:flex items-center gap-0.5 p-0.5 rounded bg-surface-container-low border border-outline-variant/30">
                {AWESOME_DESIGN_THEMES.map((t) => {
                  const isActive = activeTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveTheme(t.id);
                        showToast(`已切换主题：${t.name} (${t.sourceRef})`);
                      }}
                      className={`px-2 py-1 rounded-xs font-label-sm text-[11px] flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-primary text-on-primary font-bold shadow-2xs'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title={`${t.name} — ${t.sourceRef}`}
                    >
                      <span
                        className="w-2 h-2 rounded-xs border border-white/50 shrink-0"
                        style={{ backgroundColor: t.primaryHex }}
                      ></span>
                      <span>{t.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-8 h-8 rounded bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all relative cursor-pointer"
                title="教务通知中心"
              >
                <span className="material-symbols-outlined text-base">
                  notifications
                </span>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-secondary"></span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveShell('knowledge-base');
                  showToast('已进入「樱花教务云 · 知识库与业务说明中心」');
                }}
                className="w-8 h-8 rounded bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                title="打开文档与业务说明中心 (SOP知识库)"
              >
                <span className="material-symbols-outlined text-base">
                  assignment_turned_in
                </span>
              </button>

              <div
                onClick={handleOpenSettingsModal}
                className="flex items-center gap-2 pl-1.5 py-1 pr-2.5 rounded bg-surface-container-low border border-outline-variant/30 cursor-pointer hover:bg-surface-container transition-colors whitespace-nowrap"
                title="点击设置默认信息（取代用户组默认值）或切换主题"
              >
                <div className="w-6 h-6 rounded-xs bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-sm">
                    person
                  </span>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-label-sm text-xs text-on-surface font-semibold leading-tight">
                    {defaultProfile.fullName}
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant leading-none mt-0.5">
                    {defaultProfile.titleRole}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Workspace Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Desktop Left Sidebar Navigation (hidden on < lg) */}
            <aside className="hidden lg:flex w-52 flex-none bg-surface-container-low/85 border-r border-outline-variant/30 flex-col justify-between p-3">
              <div className="flex flex-col gap-1">
                <div className="px-2.5 py-1 mb-0.5">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant/80">
                    教务教学核心
                  </span>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded transition-all text-left whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-primary text-on-primary font-headline-sm text-xs font-bold shadow-2xs'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-xs'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base shrink-0">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex flex-col gap-2 bg-surface-container-lowest/80 p-3 rounded-xl border border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setClassModeOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs font-semibold shadow-xs hover:opacity-95 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    cast_for_education
                  </span>
                  <span>一键开启上课模式</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenSettingsModal}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all font-label-sm text-xs whitespace-nowrap cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    settings
                  </span>
                  <span>设置默认信息与偏好</span>
                </button>
              </div>
            </aside>

            {/* Mobile Slide-Over Navigation Drawer */}
            {mobileDrawerOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs"
                  onClick={() => setMobileDrawerOpen(false)}
                ></div>
                <aside className="relative w-64 max-w-[80vw] h-full bg-surface-container-lowest shadow-2xl flex flex-col justify-between p-4 z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                          <span className="material-symbols-outlined text-lg">
                            local_florist
                          </span>
                        </div>
                        <div>
                          <span className="font-headline-sm text-sm font-bold text-on-surface block">
                            {defaultProfile.fullName}
                          </span>
                          <span className="text-[10px] text-secondary">
                            {defaultProfile.semesterLabel}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-base">
                          close
                        </span>
                      </button>
                    </div>

                    <form onSubmit={handleGlobalSearchSubmit} className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-sm">
                        search
                      </span>
                      <input
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-low text-xs text-on-surface border border-outline-variant/20 focus:outline-none"
                        placeholder="搜索学生、教案、课表..."
                        type="text"
                      />
                    </form>

                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id);
                              setMobileDrawerOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                              isActive
                                ? 'bg-primary-container text-on-primary-container font-bold'
                                : 'text-on-surface-variant hover:bg-surface-container-low'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-outline-variant/20">
                    {/* Mobile Theme Switcher */}
                    <div className="p-2 rounded bg-surface-container-low space-y-1.5">
                      <span className="text-[11px] font-label-sm text-on-surface-variant block">
                        UI 主题切换 (Awesome DESIGN.md)
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        {AWESOME_DESIGN_THEMES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setActiveTheme(t.id);
                              showToast(`已切换至：${t.name}`);
                            }}
                            className={`py-1.5 px-1.5 rounded-xs text-[11px] font-label-sm flex items-center justify-center gap-1 ${
                              activeTheme === t.id
                                ? 'bg-primary text-on-primary font-bold'
                                : 'bg-surface-container-lowest text-on-surface-variant'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-xs shrink-0"
                              style={{ backgroundColor: t.primaryHex }}
                            ></span>
                            <span>{t.shortLabel}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        setClassModeOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">
                        cast_for_education
                      </span>
                      <span>一键开启上课模式</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        setActiveShell('auth');
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-xs flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">
                        logout
                      </span>
                      <span>返回教师认证门户</span>
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {/* Right Active Module Viewport (pb-14 on mobile for Bottom Tab Bar) */}
            <main className="flex-1 h-full overflow-y-auto lg:overflow-hidden bg-background relative flex flex-col pb-14 lg:pb-0">
              {activeTab === 'dashboard-overview' && (
                <DashboardOverviewView
                  onNavigateTab={(t) => setActiveTab(t)}
                  onOpenKnowledgeBase={() => setActiveShell('knowledge-base')}
                  showToast={showToast}
                />
              )}
              {activeTab === 'homework-center' && (
                <HomeworkCenterView
                  showToast={showToast}
                  onSelectStudentForProfile={() =>
                    setActiveTab('student-profiles')
                  }
                />
              )}
              {activeTab === 'student-profiles' && (
                <StudentProfilesView
                  showToast={showToast}
                  onNavigateToChat={() =>
                    setActiveTab('school-home-communication')
                  }
                />
              )}
              {activeTab === 'schedule-management' && (
                <ScheduleManagementView showToast={showToast} />
              )}
              {activeTab === 'lesson-plans' && (
                <LessonPlansView showToast={showToast} />
              )}
              {activeTab === 'exam-analytics' && (
                <ExamAnalyticsView showToast={showToast} />
              )}
              {activeTab === 'school-home-communication' && (
                <SchoolHomeCommView
                  showToast={showToast}
                  onNavigateToStudentProfile={() =>
                    setActiveTab('student-profiles')
                  }
                />
              )}
            </main>

            {/* Mobile Bottom Navigation Bar (Visible on < lg) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/25 z-40 grid grid-cols-5 px-1">
              {[
                navItems[0], // 概览
                navItems[1], // 课表
                navItems[3], // 批阅
                navItems[2], // 学情
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                      isActive
                        ? 'text-secondary font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                    <span className="text-[10px] leading-none">
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-lg">apps</span>
                <span className="text-[10px] leading-none">更多模块</span>
              </button>
            </nav>
          </div>

          {/* Notification Popover */}
          {notifOpen && (
            <div className="fixed top-15 right-3 sm:right-6 z-50 w-76 sm:w-80 bg-surface-container-lowest rounded-2xl p-4 shadow-2xl border border-secondary-fixed space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-sm text-on-surface font-bold">
                  教务实时通知 (3)
                </span>
                <button
                  type="button"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-secondary hover:underline"
                >
                  全部已读
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div
                  onClick={() => {
                    setActiveTab('homework-center');
                    setNotifOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer"
                >
                  <div className="font-semibold text-on-surface">
                    🌸 《赤壁赋》主观卷新增 2 份提交
                  </div>
                  <div className="text-on-surface-variant mt-0.5">
                    苏小萌、周子涵已完成订正并上传高清手写卷
                  </div>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('school-home-communication');
                    setNotifOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer"
                >
                  <div className="font-semibold text-on-surface">
                    💬 苏小萌妈妈发来一条新私信
                  </div>
                  <div className="text-on-surface-variant mt-0.5">
                    咨询周末全市中学生国学演讲大赛报名事宜
                  </div>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('lesson-plans');
                    setNotifOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer"
                >
                  <div className="font-semibold text-on-surface">
                    📚 高二语文组《雷雨》基准教案已同步
                  </div>
                  <div className="text-on-surface-variant mt-0.5">
                    点击前往备课教案库查阅或在线编辑配套课件
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classroom Presentation Mode Overlay ("一键开启上课模式") */}
          {classModeOpen && (
            <div className="fixed inset-0 z-50 bg-inverse-surface/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
              <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md shrink-0">
                      <span className="material-symbols-outlined text-xl sm:text-2xl">
                        cast_for_education
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-label-sm text-[11px] block truncate">
                        已连接：多媒体西阶一 / 录播教室 B204 一体机
                      </span>
                      <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-bold mt-0.5">
                        智慧课堂一键投屏与授课中心
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClassModeOpen(false)}
                    className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setClassModeOpen(false);
                      setActiveTab('homework-center');
                      showToast('已将苏小萌 98分标杆范文投屏至教室大屏');
                    }}
                    className="p-3.5 rounded-xl bg-surface-container-low hover:bg-primary-fixed/60 text-left transition-all cursor-pointer space-y-1"
                  >
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      auto_stories
                    </span>
                    <div className="font-headline-sm text-sm text-on-surface font-bold">
                      投屏优秀范文墙
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      展示《赤壁赋》苏小萌、陆天宇标杆卷与红笔批注
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClassModeOpen(false);
                      setActiveTab('lesson-plans');
                      showToast('已启动《雷雨》45页互动课件全屏讲授模式');
                    }}
                    className="p-3.5 rounded-xl bg-surface-container-low hover:bg-primary-fixed/60 text-left transition-all cursor-pointer space-y-1"
                  >
                    <span className="material-symbols-outlined text-primary text-2xl">
                      slideshow
                    </span>
                    <div className="font-headline-sm text-sm text-on-surface font-bold">
                      播放配套备课课件
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      《雷雨》四幕戏结构剖析与《长恨歌》板书
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClassModeOpen(false);
                      showToast('已启动全班45人随机樱花点名与5分钟随堂限时微测');
                    }}
                    className="p-3.5 rounded-xl bg-surface-container-low hover:bg-primary-fixed/60 text-left transition-all cursor-pointer space-y-1"
                  >
                    <span className="material-symbols-outlined text-tertiary text-2xl">
                      bolt
                    </span>
                    <div className="font-headline-sm text-sm text-on-surface font-bold">
                      随机抽签 &amp; 随堂速测
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      一键下发 2 道文言实词断句通关题至学生平板
                    </p>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container text-xs text-on-surface-variant">
                  <span>隐私保护已开启：投屏时自动隐藏教师私人备忘与家长私信</span>
                  <button
                    type="button"
                    onClick={() => setClassModeOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm cursor-pointer"
                  >
                    完成设置
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Global Default Profile & User-Group Defaults Editor Modal (accessible from both Login & Workspace) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-lg p-4 sm:p-5 max-w-xl w-full shadow-2xl border border-outline-variant/35 space-y-3.5 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-outline-variant/25">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">
                    manage_accounts
                  </span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                    设置默认信息（取代用户组默认值）
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    保存后将覆盖本地用户组基准配置，下次登录自动以此默认信息为准
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              {/* Section 1: Default Login Credentials */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">
                      key
                    </span>
                    1. 默认登录凭证与用户组身份
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToFactoryDefault}
                    disabled={savingDefaults}
                    className="text-[11px] text-secondary hover:underline cursor-pointer"
                  >
                    恢复初始基准值 (admin/admin)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      默认登录账号 (下次登录自动填充)
                    </label>
                    <input
                      type="text"
                      value={draftProfile.facultyCode}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          facultyCode: e.target.value,
                        }))
                      }
                      placeholder="例如: admin 或 T2024088"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      默认登录密码
                    </label>
                    <input
                      type="text"
                      value={draftProfile.password}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      placeholder="例如: admin"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      教师显示姓名
                    </label>
                    <input
                      type="text"
                      value={draftProfile.fullName}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      placeholder="例如: 林知夏 老师"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      所属教研组 / 部门
                    </label>
                    <input
                      type="text"
                      value={draftProfile.department}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="例如: 高中语文教研组"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      职务与用户组头衔 (取代用户组默认头衔)
                    </label>
                    <input
                      type="text"
                      value={draftProfile.titleRole}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          titleRole: e.target.value,
                        }))
                      }
                      placeholder="例如: 高二(3)班班主任 · 语文组"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Default Teaching Class, Semester & Landing Tab */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2.5">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">
                    dashboard_customize
                  </span>
                  2. 默认任教班级与登录后首页模块
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      默认绑定班级
                    </label>
                    <input
                      type="text"
                      value={draftProfile.defaultClassName}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          defaultClassName: e.target.value,
                        }))
                      }
                      placeholder="例如: 高二(1)班"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      默认学期与教学周标识
                    </label>
                    <input
                      type="text"
                      value={draftProfile.semesterLabel}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          semesterLabel: e.target.value,
                        }))
                      }
                      placeholder="例如: 2024 春季学期 · 第 12 周"
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-on-surface-variant block">
                      下次登录后默认进入的功能模块
                    </label>
                    <select
                      value={draftProfile.defaultTab}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          defaultTab: e.target.value as WorkspaceTab,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {navItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label} ({item.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Default Theme & Home-School DND */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">
                      palette
                    </span>
                    3. 默认 UI 主题与家校免打扰配置
                  </span>
                  <span className="px-1.5 py-0.5 rounded-xs bg-primary-fixed text-on-primary-fixed font-mono text-[10px]">
                    下次登录自动加载
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {AWESOME_DESIGN_THEMES.map((t) => {
                    const isSelected = draftProfile.defaultTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setDraftProfile((prev) => ({
                            ...prev,
                            defaultTheme: t.id,
                          }));
                          setActiveTheme(t.id);
                        }}
                        className={`p-2 rounded border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-container-lowest border-primary shadow-2xs'
                            : 'bg-surface/60 border-outline-variant/25 hover:bg-surface-container-lowest'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: t.primaryHex }}
                          ></span>
                          <span className="font-bold text-on-surface truncate">
                            {t.shortLabel}
                          </span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant truncate mt-0.5">
                          {t.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftProfile.dndEnabled}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          dndEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="font-semibold text-on-surface">
                      默认开启家校下班免打扰模式
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface-variant">起始时间:</span>
                    <input
                      type="time"
                      value={draftProfile.dndStartTime}
                      onChange={(e) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          dndStartTime: e.target.value,
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-outline-variant/25">
              <div className="flex items-center gap-2">
                {activeShell === 'workspace' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsOpen(false);
                      setActiveShell('auth');
                      showToast('已返回登录门户');
                    }}
                    className="py-2 px-3 rounded-lg bg-error-container text-on-error-container font-label-sm text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      logout
                    </span>
                    <span>直接退出登录</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {activeShell === 'workspace' && (
                  <button
                    type="button"
                    disabled={savingDefaults}
                    onClick={() => handleSaveDefaultProfile(true)}
                    className="py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      restart_alt
                    </span>
                    <span>保存并退出验证下次登录</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={savingDefaults}
                  onClick={() => handleSaveDefaultProfile(false)}
                  className="py-2 px-4 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-sm text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    save
                  </span>
                  <span>
                    {savingDefaults
                      ? '正在保存...'
                      : '保存为默认信息（下次登录生效）'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global SQL & API Architecture Inspector Modal */}
      <SqlApiArchitectureModal
        open={sqlApiModalOpen}
        onClose={() => setSqlApiModalOpen(false)}
        showToast={showToast}
      />

      {/* Global Floating Sakura Toast */}
      {toastMessage && (
        <div className="fixed bottom-16 lg:bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-xs shadow-2xl flex items-center gap-2 max-w-[92vw]">
          <span className="material-symbols-outlined text-primary-container text-base shrink-0">
            local_florist
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
