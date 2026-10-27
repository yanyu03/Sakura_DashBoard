import React, { useCallback, useEffect, useState } from "react";
import {
  AWESOME_DESIGN_THEMES,
  UiThemeId,
  STANDARD_PREVIEW,
} from "../data/awesomeDesignTheme";
import { sakuraApi } from "../services/sakuraApiService";
import {
  CaptchaChallengeDTO,
  CaptchaMode,
  FacultyDefaultProfileDTO,
  FacultySessionDTO,
} from "../types/api";
import { WorkspaceTab } from "../types/sakura";

interface AuthPortalViewProps {
  activeTheme: UiThemeId;
  onChangeTheme: (theme: UiThemeId) => void;
  defaultProfile: FacultyDefaultProfileDTO;
  onOpenDefaultSettingsModal: () => void;
  onLoginSuccess: (
    session: FacultySessionDTO,
    explicitTab?: WorkspaceTab,
  ) => void;
  onOpenKnowledgeBase: () => void;
  onOpenSqlBlueprint?: () => void;
  showToast: (msg: string) => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  activeTheme,
  onChangeTheme,
  defaultProfile,
  onOpenDefaultSettingsModal,
  onLoginSuccess,
  onOpenKnowledgeBase,
  showToast,
}) => {
  const [authTab, setAuthTab] = useState<"account" | "qrcode" | "phone">(
    "account",
  );
  const [facultyId, setFacultyId] = useState(
    defaultProfile.facultyCode || "admin",
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sync input fields whenever saved defaultProfile updates
  useEffect(() => {
    setFacultyId(defaultProfile.facultyCode || "admin");
  }, [defaultProfile.facultyCode]);

  // Security Captcha state
  const [captchaMode, setCaptchaMode] = useState<CaptchaMode>("graphic");
  const [captchaChallenge, setCaptchaChallenge] =
    useState<CaptchaChallengeDTO | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const [keepOnline, setKeepOnline] = useState(true);
  const [phoneNum, setPhoneNum] = useState("13800138421");
  const [smsCode, setSmsCode] = useState("829401");
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envStatusData, setEnvStatusData] = useState<{
    gatewayLatencyMs: number;
    ocrDriverVersion: string;
  }>({
    gatewayLatencyMs: 0,
    ocrDriverVersion: "未检测",
  });

  const currentThemeMeta =
    AWESOME_DESIGN_THEMES.find((t) => t.id === activeTheme) ||
    AWESOME_DESIGN_THEMES[0];

  const fetchNewCaptcha = useCallback(
    async (targetMode: CaptchaMode = captchaMode, autoFillDemo = true) => {
      setCaptchaLoading(true);
      setCaptchaError(null);
      try {
        const res = await sakuraApi.security.generateCaptcha(targetMode);
        if (res.success && res.data) {
          setCaptchaChallenge(res.data);
          if (targetMode === "slider") {
            const targetX = res.data.sliderTargetX || 168;
            setSliderValue(autoFillDemo ? targetX : 12);
            setCaptchaInput(String(autoFillDemo ? targetX : 12));
          } else {
            setCaptchaInput(autoFillDemo ? res.data.demoHint || "" : "");
          }
        } else setCaptchaError(res.message);
      } finally {
        setCaptchaLoading(false);
      }
    },
    [captchaMode],
  );

  useEffect(() => {
    fetchNewCaptcha("graphic", true);
  }, [fetchNewCaptcha]);

  const handleSwitchCaptchaMode = (nextMode: CaptchaMode) => {
    setCaptchaMode(nextMode);
    fetchNewCaptcha(nextMode, true);
  };

  const handleAccountLogin = async (explicitTab?: WorkspaceTab) => {
    if (!facultyId.trim()) {
      showToast("请输入您的在职教师工号或校园邮箱");
      return;
    }
    if (!password) {
      showToast("请输入登录密码");
      return;
    }

    if (authTab !== "account") {
      showToast("该登录方式尚未开通，请使用账号登录");
      return;
    }
    if (authTab === "account") {
      const answerToSubmit =
        captchaMode === "slider" ? String(sliderValue) : captchaInput.trim();
      if (!answerToSubmit) {
        setCaptchaError("请先完成安全验证码填写或滑块对齐");
        showToast("请完成安全验证码校验");
        return;
      }
    }

    const res = await sakuraApi.auth.loginWithCredentials({
      facultyId,
      password,
      captchaId: captchaChallenge?.captchaId,
      captchaAnswer:
        authTab === "account"
          ? captchaMode === "slider"
            ? String(sliderValue)
            : captchaInput.trim()
          : undefined,
      loginType: authTab,
      keepOnline,
    });

    if (!res.success || res.code !== 200 || !res.data) {
      setCaptchaError(res.message || "认证校验未通过，请重试");
      showToast(res.message || "认证校验未通过，请重试");
      fetchNewCaptcha(captchaMode, false);
      return;
    }

    showToast(res.message);
    onLoginSuccess(res.data, explicitTab);
  };

  const handleOpenEnvModal = async () => {
    const started = performance.now();
    const res = await sakuraApi.auth.checkTerminalEnvironment();
    if (res.success && res.data) {
      setEnvStatusData({
        gatewayLatencyMs: Math.max(1, Math.round(performance.now() - started)),
        ocrDriverVersion: res.data.ocrDriverVersion || "未连接",
      });
    }
    setEnvModalOpen(true);
  };

  const sliderTargetX = captchaChallenge?.sliderTargetX ?? 168;
  const sliderDelta = Math.abs(sliderValue - sliderTargetX);
  const sliderMatched = sliderDelta <= 8;

  return (
    <div className="bg-surface text-on-surface w-screen h-screen overflow-y-auto lg:overflow-hidden flex items-start lg:items-center justify-center p-2 sm:p-4 lg:p-5 select-none">
      <main className="w-full lg:h-full flex justify-center items-center">
        <div className="flex flex-col w-full lg:h-full lg:max-h-screen lg:overflow-hidden select-none">
          {/* Responsive Frame Envelope (Restrained 6px-8px radius) */}
          <div className="relative w-full lg:h-full flex flex-col lg:flex-row overflow-hidden bg-surface-container-low/60 rounded-lg shadow-lg border border-outline-variant/40">
            {/* Ambient Glow Spots */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[35%] w-[500px] h-[500px] rounded-full bg-secondary-fixed/35 blur-3xl pointer-events-none"></div>

            {/* LEFT PANEL: Brand Narrative & Feature Showcase */}
            <section className="relative w-full lg:w-[57%] xl:w-[59%] lg:h-full p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-surface via-surface-container-low/50 to-surface-container/30 border-b lg:border-b-0 lg:border-r border-outline-variant/35">
              {/* Brand Header & Awesome DESIGN.md Theme Switcher */}
              <header className="relative z-10 flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-lowest/95 border border-outline-variant/30">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-xs text-secondary font-semibold tracking-wider">
                      SAKURA EDU · 智慧教务平台 4.2
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xs bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px]">
                      {currentThemeMeta.badge}
                    </span>
                  </div>

                  {/* Theme Verification Switcher (Awesome DESIGN.md Green UI) */}
                  <div className="inline-flex items-center gap-1 p-1 rounded bg-surface-container-lowest border border-outline-variant/35">
                    <span className="text-[11px] text-on-surface-variant px-1.5 font-medium hidden sm:inline">
                      UI主题:
                    </span>
                    {AWESOME_DESIGN_THEMES.map((t) => {
                      const active = activeTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onChangeTheme(t.id);
                            showToast(`已切换至「${t.name}」(${t.sourceRef})`);
                          }}
                          className={`px-2 py-1 rounded-xs font-label-sm text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                            active
                              ? "bg-primary text-on-primary font-bold shadow-2xs"
                              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-xs border border-white/50 shrink-0"
                            style={{ backgroundColor: t.primaryHex }}
                          ></span>
                          <span>{t.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-0.5">
                  <h1 className="font-headline-xl text-2xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight leading-tight font-bold">
                    樱花教务云
                    <span className="inline-block text-secondary ml-2 font-headline-md text-base sm:text-xl lg:text-2xl tracking-normal font-normal">
                      / 教师端专属空间
                    </span>
                  </h1>
                  <p className="mt-1 font-body-lg text-xs sm:text-sm text-on-surface-variant flex flex-wrap items-center gap-2">
                    <span>{currentThemeMeta.description}</span>
                  </p>
                </div>
              </header>

              {/* 4 Feature Cards (Restrained 6px rounded-md) */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 lg:my-auto max-w-2xl">
                {/* Feature 1 */}
                <div
                  onClick={() => handleAccountLogin("homework-center")}
                  className="group cursor-pointer p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-xs hover:shadow-md border border-outline-variant/25 transition-all flex items-start gap-3"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      auto_fix_high
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                        人工批阅工坊
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold">
                        本地保存
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                      作业发布、提交登记、人工评分与订正历史，形成可追溯的教学记录。
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div
                  onClick={() => handleAccountLogin("student-profiles")}
                  className="group cursor-pointer p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-xs hover:shadow-md border border-outline-variant/25 transition-all flex items-start gap-3"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 group-hover:scale-105 transition-transform">
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      pie_chart
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                        学生学情档案
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                        真实档案
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                      真实名册、考试轨迹和辅导记录，按任教班级查看学生情况。
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div
                  onClick={() => handleAccountLogin("lesson-plans")}
                  className="group cursor-pointer p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-xs hover:shadow-md border border-outline-variant/25 transition-all flex items-start gap-3"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0 group-hover:scale-105 transition-transform">
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      lightbulb
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                        文本教案库
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                        版本留存
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                      保存与编辑教案正文，保留修改版本，按标签检索并关联作业。
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div
                  onClick={() =>
                    handleAccountLogin("school-home-communication")
                  }
                  className="group cursor-pointer p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-xs hover:shadow-md border border-outline-variant/25 transition-all flex items-start gap-3"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 group-hover:scale-105 transition-transform">
                    <span
                      className="material-symbols-outlined text-xl sm:text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-headline-sm text-sm sm:text-base text-on-surface font-bold">
                        温情家校共育
                      </h3>
                      <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                        站内记录
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                      记录家校交流、安排关怀待办与免打扰；外部家长投递尚未连接。
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Info Strip: Campus Compliance & Security Notice */}
              <footer className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest/95 border border-outline-variant/30 text-on-surface text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="font-semibold">
                      本地账号认证通道已就绪
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high/60 text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-primary text-sm">
                      verified_user
                    </span>
                    <span>支持多模态安全验证码防护</span>
                  </div>
                </div>
                <span className="text-[11px] text-on-surface-variant font-label-sm">
                  2024 春季学期 · 教务处认证中心
                </span>
              </footer>
            </section>

            {/* RIGHT PANEL: Dedicated Auth Flight Deck */}
            <section className="relative w-full lg:w-[43%] xl:w-[41%] lg:h-full p-5 sm:p-7 lg:p-8 flex flex-col justify-between bg-surface-container-lowest shadow-xl z-20 gap-3 overflow-y-auto">
              {/* Top Segment: Identity Header & Mode Switcher */}
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-2xs">
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_florist
                      </span>
                    </div>
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold tracking-wider uppercase">
                        FACULTY PORTAL · 教师认证门户
                      </div>
                      <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold leading-tight">
                        教师统一安全认证
                      </h2>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/25 text-on-surface-variant font-label-sm text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    校园网在线
                  </div>
                </div>

                {/* Segmented Tab Bar */}
                <div className="mt-3 p-1 bg-surface-container-low rounded-lg flex gap-1 border border-outline-variant/20">
                  {[
                    { id: "account", label: "教工号登录" },
                    { id: "qrcode", label: "企微/钉钉扫码" },
                    { id: "phone", label: "手机快捷验证" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={t.id !== "account"}
                      title={t.id !== "account" ? "尚未开通" : undefined}
                      onClick={() => setAuthTab(t.id as typeof authTab)}
                      className={`flex-1 py-1.5 px-2 rounded-md font-label-sm text-xs transition-all cursor-pointer whitespace-nowrap ${
                        authTab === t.id
                          ? "bg-surface-container-lowest text-secondary font-bold shadow-2xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle Segment: Forms Container */}
              <div className="my-auto">
                {authTab === "account" && (
                  <div className="space-y-2.5 transition-all duration-300">
                    {/* Current Saved User-Group Default Identity Strip */}
                    <div className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-primary text-base shrink-0">
                          account_circle
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-on-surface">
                            默认身份：{defaultProfile.fullName}
                          </span>
                          <span className="text-on-surface-variant ml-1.5">
                            ({defaultProfile.titleRole})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenDefaultSettingsModal}
                        className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold hover:bg-primary-container transition-colors shrink-0 cursor-pointer"
                      >
                        设置默认信息
                      </button>
                    </div>

                    {/* Input 1: Faculty ID */}
                    <div className="space-y-1">
                      <label className="font-label-sm text-xs text-on-surface font-semibold flex items-center justify-between">
                        <span>教工号 / 管理员账号</span>
                        <span className="text-on-surface-variant font-normal text-[11px]">
                          演示账号: {defaultProfile.facultyCode}
                        </span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-primary material-symbols-outlined text-lg">
                          badge
                        </span>
                        <input
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md text-sm placeholder:text-outline/70 focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary-container transition-all"
                          placeholder={`请输入账号 (默认 ${defaultProfile.facultyCode})`}
                          type="text"
                          value={facultyId}
                          onChange={(e) => setFacultyId(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Input 2: Password */}
                    <div className="space-y-1">
                      <label className="font-label-sm text-xs text-on-surface font-semibold flex items-center justify-between">
                        <span>登录密码</span>
                        <button
                          type="button"
                          onClick={onOpenDefaultSettingsModal}
                          className="text-secondary hover:underline font-label-sm text-xs cursor-pointer"
                        >
                          个人偏好设置
                        </button>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-primary material-symbols-outlined text-lg">
                          lock
                        </span>
                        <input
                          className="w-full pl-9 pr-9 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md text-sm placeholder:text-outline/70 focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary-container transition-all"
                          placeholder="请输入登录密码"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          className="absolute right-3 text-outline hover:text-secondary flex items-center cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Input 3: Multi-Mode Security Captcha */}
                    <div className="p-2.5 rounded-lg bg-surface-container-low/80 border border-outline-variant/30 space-y-2">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-primary">
                            shield_lock
                          </span>
                          <span className="font-label-sm text-xs text-on-surface font-bold">
                            安全验证码校验
                          </span>
                        </div>

                        {/* Captcha Mode Selector */}
                        <div className="inline-flex items-center gap-1 bg-surface-container-lowest p-0.5 rounded border border-outline-variant/25">
                          {[
                            { id: "graphic", label: "图形验证" },
                            { id: "math", label: "算术验证" },
                            { id: "slider", label: "滑块拼图" },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              disabled={m.id === "slider"}
                              onClick={() =>
                                handleSwitchCaptchaMode(m.id as CaptchaMode)
                              }
                              className={`px-2 py-0.5 rounded-xs text-[11px] font-label-sm cursor-pointer transition-all ${
                                captchaMode === m.id
                                  ? "bg-primary text-on-primary font-semibold"
                                  : "text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {captchaMode !== "slider" ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 flex items-center">
                            <span className="absolute left-3 text-primary material-symbols-outlined text-base">
                              verified_user
                            </span>
                            <input
                              className="w-full pl-8 pr-2.5 py-2 rounded bg-surface-container-lowest border border-outline-variant/35 text-on-surface font-mono text-sm font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder={
                                captchaMode === "math"
                                  ? "输入计算结果"
                                  : "输入4位图形码"
                              }
                              type="text"
                              value={captchaInput}
                              onChange={(e) => {
                                setCaptchaInput(e.target.value);
                                setCaptchaError(null);
                              }}
                            />
                          </div>

                          {/* Live SVG Vector Captcha Image */}
                          <div
                            onClick={() => fetchNewCaptcha(captchaMode, false)}
                            title="点击刷新开源 svg-captcha 矢量验证码"
                            className="h-[40px] w-[132px] rounded bg-surface-container-lowest border border-outline-variant/35 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 relative group"
                          >
                            {captchaLoading || !captchaChallenge ? (
                              <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                                <span
                                  aria-hidden="true"
                                  className={
                                    STANDARD_PREVIEW
                                      ? "sakura-spinner"
                                      : "material-symbols-outlined text-sm animate-spin"
                                  }
                                >
                                  {STANDARD_PREVIEW ? null : "sync"}
                                </span>
                                生成中...
                              </span>
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                                dangerouslySetInnerHTML={{
                                  __html: captchaChallenge.svg,
                                }}
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => fetchNewCaptcha(captchaMode, false)}
                            title="换一张验证码"
                            className="w-9 h-[40px] rounded bg-surface-container-lowest border border-outline-variant/35 flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer shrink-0"
                          >
                            <span className="material-symbols-outlined text-base">
                              refresh
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* Slider Trajectory Verification Mode */
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-on-surface-variant">
                              拖动滑块对齐安全靶位坐标:{" "}
                              <strong className="font-mono text-primary">
                                {sliderTargetX}px
                              </strong>
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                sliderMatched
                                  ? "text-emerald-700"
                                  : "text-secondary"
                              }`}
                            >
                              当前: {sliderValue}px{" "}
                              {sliderMatched ? "✓ 已对齐" : ""}
                            </span>
                          </div>
                          <div className="relative h-8 rounded bg-surface-container-lowest border border-outline-variant/35 flex items-center px-2">
                            {/* Target Notch Indicator */}
                            <div
                              className="absolute top-1 bottom-1 w-3 rounded-xs bg-primary/25 border border-dashed border-primary pointer-events-none"
                              style={{
                                left: `calc(${(sliderTargetX / 240) * 100}% - 6px)`,
                              }}
                            />
                            <input
                              type="range"
                              min={0}
                              max={240}
                              value={sliderValue}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSliderValue(val);
                                setCaptchaInput(String(val));
                                setCaptchaError(null);
                              }}
                              className="w-full accent-primary cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {/* Captcha Status Bar & Quick Fill Helper */}
                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        {captchaError ? (
                          <span className="text-error font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                              error
                            </span>
                            {captchaError}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            安全防护已就绪
                          </span>
                        )}

                        {captchaChallenge?.demoHint && (
                          <button
                            type="button"
                            onClick={() => {
                              if (captchaMode === "slider") {
                                const tx =
                                  captchaChallenge.sliderTargetX || 168;
                                setSliderValue(tx);
                                setCaptchaInput(String(tx));
                              } else {
                                setCaptchaInput(captchaChallenge.demoHint);
                              }
                              setCaptchaError(null);
                            }}
                            className="text-primary hover:underline font-mono cursor-pointer"
                          >
                            一键填入验证码 ({captchaChallenge.demoHint})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Auxiliary Options */}
                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          checked={keepOnline}
                          onChange={(e) => setKeepOnline(e.target.checked)}
                          className="w-4 h-4 rounded text-secondary accent-secondary focus:ring-0"
                          type="checkbox"
                        />
                        <span className="text-on-surface-variant">
                          保持 7 天教师在线状态
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={onOpenDefaultSettingsModal}
                        className="text-secondary hover:text-on-secondary-container flex items-center gap-0.5 font-semibold cursor-pointer"
                      >
                        <span>配置默认信息/用户组</span>
                        <span className="material-symbols-outlined text-xs">
                          tune
                        </span>
                      </button>
                    </div>

                    {/* Primary Hero Action CTA Button */}
                    <button
                      onClick={() => handleAccountLogin()}
                      className={`${STANDARD_PREVIEW ? "sakura-btn sakura-btn-primary " : ""}w-full mt-1 py-2.5 px-6 rounded-lg bg-primary hover:bg-secondary text-on-primary font-headline-sm text-sm sm:text-base font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">
                        login
                      </span>
                      <span>核验安全验证码并进入教学工作台</span>
                    </button>
                  </div>
                )}

                {authTab === "qrcode" && (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <div
                      onClick={() => handleAccountLogin()}
                      className="p-3 bg-surface-container-low rounded-lg shadow-inner inline-block cursor-pointer group"
                    >
                      <div className="w-40 h-40 bg-surface-container-lowest rounded-lg flex flex-col items-center justify-center relative border border-dashed border-outline-variant group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-6xl text-secondary">
                          qr_code_2
                        </span>
                        <span className="font-label-sm text-xs text-on-surface-variant mt-1">
                          点击模拟扫码快捷登录
                        </span>
                      </div>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface">
                      使用绑定教师身份的企业微信或钉钉客户端安全快捷扫码
                    </p>
                    <button
                      type="button"
                      className="font-label-sm text-xs text-secondary hover:underline cursor-pointer"
                      onClick={() => setAuthTab("account")}
                    >
                      返回教工号登录
                    </button>
                  </div>
                )}

                {authTab === "phone" && (
                  <div className="space-y-3 py-2">
                    <div className="space-y-1">
                      <label className="font-label-sm text-xs text-on-surface font-semibold">
                        教师预留手机号
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-primary material-symbols-outlined text-lg">
                          phone_iphone
                        </span>
                        <input
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/25 text-on-surface font-body-md text-sm focus:outline-none focus:bg-surface"
                          placeholder="请输入已在校办登记的手机号"
                          type="tel"
                          value={phoneNum}
                          onChange={(e) => setPhoneNum(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-sm text-xs text-on-surface font-semibold">
                        短信动态验证码
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex-1 flex items-center">
                          <span className="absolute left-3.5 text-primary material-symbols-outlined text-lg">
                            sms
                          </span>
                          <input
                            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/25 text-on-surface font-body-md text-sm focus:outline-none focus:bg-surface"
                            placeholder="6 位短信验证码"
                            type="text"
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            showToast(
                              "短信验证码已发送至 138****8421，请注意查收",
                            )
                          }
                          className="px-4 py-2.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-sm text-xs font-semibold hover:bg-primary-container transition-colors whitespace-nowrap cursor-pointer"
                        >
                          获取验证码
                        </button>
                      </div>
                    </div>
                    <button
                      disabled
                      title="尚未开通"
                      onClick={() => handleAccountLogin()}
                      className="w-full mt-2 py-2.5 px-6 rounded-lg bg-secondary text-on-secondary font-headline-sm text-base font-bold shadow-sm hover:brightness-105 transition-all cursor-pointer"
                      type="button"
                    >
                      验证并进入系统
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Segment: Third-Party Joint Auth & Compliance Links */}
              <footer className="pt-1 space-y-2.5">
                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-dashed border-outline-variant/60"></div>
                  <span className="flex-shrink mx-3 font-label-sm text-xs text-on-surface-variant font-medium">
                    其他统一身份认证方式
                  </span>
                  <div className="flex-grow border-t border-dashed border-outline-variant/60"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      icon: "forum",
                      label: "企业微信",
                      color: "text-secondary",
                    },
                    {
                      icon: "vpn_key",
                      label: "CA数字证书",
                      color: "text-primary",
                    },
                    {
                      icon: "school",
                      label: "钉钉教育版",
                      color: "text-secondary",
                    },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      disabled
                      title="尚未开通"
                      onClick={() => handleAccountLogin()}
                      className="py-1.5 px-2 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap border border-outline-variant/20"
                      type="button"
                    >
                      <span
                        className={`material-symbols-outlined ${btn.color} text-sm`}
                      >
                        {btn.icon}
                      </span>
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>

                {/* Regulatory and Diagnostics Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant pt-0.5 font-label-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenKnowledgeBase}
                      className="hover:text-secondary transition-colors cursor-pointer"
                    >
                      教师数据隐私条例
                    </button>
                    <span className="text-outline-variant">·</span>
                    <button
                      type="button"
                      onClick={onOpenKnowledgeBase}
                      className="hover:text-secondary transition-colors cursor-pointer"
                    >
                      教务协同操作手册
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-1 text-secondary hover:underline cursor-pointer"
                    onClick={handleOpenEnvModal}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-sm">
                      wifi_tethering
                    </span>
                    <span>终端环境检测 (正常)</span>
                  </button>
                </div>
              </footer>
            </section>
          </div>
        </div>
      </main>

      {/* Environment Self-Check Modal */}
      {envModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg p-5 max-w-md w-full shadow-2xl border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-secondary-fixed text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">
                    verified_user
                  </span>
                </span>
                <h3 className="font-headline-sm text-sm text-on-surface font-bold">
                  樱花教务云 · 教室终端环境检测
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnvModalOpen(false)}
                className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded bg-surface-container-low flex items-center justify-between">
                <span className="text-on-surface-variant">
                  校园内网连接状态
                </span>
                <span className="font-label-sm text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {envStatusData.gatewayLatencyMs} ms（本次请求实测）
                </span>
              </div>
              <div className="p-3 rounded bg-surface-container-low flex items-center justify-between">
                <span className="text-on-surface-variant">
                  OCR 高拍仪与手写板驱动
                </span>
                <span className="font-label-sm text-secondary bg-secondary-fixed px-2 py-0.5 rounded">
                  {envStatusData.ocrDriverVersion}
                </span>
              </div>
              <div className="p-3 rounded bg-surface-container-low flex items-center justify-between">
                <span className="text-on-surface-variant">
                  教室多媒体投屏协议
                </span>
                <span className="font-label-sm text-primary bg-primary-fixed px-2 py-0.5 rounded font-semibold">
                  支持无线一体机直连
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEnvModalOpen(false)}
              className="w-full py-2.5 rounded bg-primary text-on-primary font-label-md text-xs font-bold cursor-pointer"
            >
              确认无误
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
