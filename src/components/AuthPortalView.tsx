import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { UiThemeId } from "../data/awesomeDesignTheme";
import { sakuraApi } from "../services/sakuraApiService";
import type {
  CaptchaChallengeDTO,
  FacultyDefaultProfileDTO,
  FacultySessionDTO,
} from "../types/api";
import type { WorkspaceTab } from "../types/sakura";
import "./auth-simple.css";

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
  showToast: (message: string) => void;
}
type AuthPage = "login" | "register";
const currentPage = (): AuthPage =>
  window.location.pathname === "/register" ? "register" : "login";

export function AuthPortalView({ onLoginSuccess }: AuthPortalViewProps) {
  const [page, setPage] = useState<AuthPage>(currentPage);
  const [account, setAccount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [keepOnline, setKeepOnline] = useState(true);
  const [captcha, setCaptcha] = useState<CaptchaChallengeDTO | null>(null);
  const [answer, setAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestSequence = useRef(0);
  const registering = page === "register";
  const destination = (next: AuthPage) => {
    const url = new URL(window.location.href);
    url.pathname = `/${next}`;
    return `${url.pathname}${url.search}`;
  };
  const refreshCaptcha = useCallback(async () => {
    const sequence = ++requestSequence.current;
    setCaptchaLoading(true);
    setCaptcha(null);
    setAnswer("");
    try {
      const result = await sakuraApi.security.generateCaptcha("graphic");
      if (sequence !== requestSequence.current) return;
      if (result.success && result.data) setCaptcha(result.data);
      else setError(result.message || "验证码加载失败，请重试");
    } catch {
      if (sequence === requestSequence.current)
        setError("验证码加载失败，请重试");
    } finally {
      if (sequence === requestSequence.current) setCaptchaLoading(false);
    }
  }, []);
  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    document.title = `${page === "register" ? "注册" : "登录"} · 樱花教务云`;
    void refreshCaptcha();
    return () => {
      requestSequence.current += 1;
    };
  }, [page, refreshCaptcha]);
  useEffect(() => {
    const onPop = () => {
      setNotice("");
      setPage(currentPage());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (next: AuthPage) => {
    if (busy) return;
    window.history.pushState(null, "", destination(next));
    setPage(next);
    setNotice("");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || captchaLoading || !captcha) return;
    setError("");
    setNotice("");
    if (registering && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    setBusy(true);
    try {
      if (registering) {
        const result = await sakuraApi.auth.register({
          facultyCode: account.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          captchaId: captcha.captchaId,
          captchaAnswer: answer.trim(),
        });
        if (result.success && result.data) {
          setAccount(result.data.facultyCode);
          window.history.pushState(null, "", destination("login"));
          setPage("login");
          setNotice("注册成功，请登录。班级由管理员分配。");
        } else {
          setError(result.message);
          await refreshCaptcha();
        }
      } else {
        const result = await sakuraApi.auth.loginWithCredentials({
          facultyId: account.trim(),
          password,
          loginType: "account",
          captchaId: captcha.captchaId,
          captchaAnswer: answer.trim(),
          keepOnline,
        });
        if (result.success && result.data) onLoginSuccess(result.data);
        else {
          setError(result.message);
          await refreshCaptcha();
        }
      }
    } catch {
      setError("暂时无法连接服务，请稍后重试");
      await refreshCaptcha();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-simple">
      <section className="auth-simple-card" aria-labelledby="auth-heading">
        <a
          className="auth-simple-brand"
          href={destination("login")}
          onClick={(event) => {
            event.preventDefault();
            navigate("login");
          }}
        >
          <span aria-hidden="true">✿</span> 樱花教务云
        </a>
        <header>
          <h1 id="auth-heading">{registering ? "创建账号" : "登录"}</h1>
          <p>
            {registering
              ? "填写信息，开始使用教学空间。"
              : "欢迎回来，继续今天的教学工作。"}
          </p>
        </header>
        <nav aria-label="账号认证">
          <a
            href={destination("login")}
            aria-current={!registering ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate("login");
            }}
          >
            登录
          </a>
          <a
            href={destination("register")}
            aria-current={registering ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              navigate("register");
            }}
          >
            注册
          </a>
        </nav>
        {notice && (
          <p className="auth-simple-notice" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="auth-simple-error" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={submit} key={page} aria-busy={busy}>
          <label htmlFor="auth-account">
            {registering ? "用户名" : "用户名或邮箱"}
          </label>
          <input
            id="auth-account"
            name="username"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={registering ? 32 : 128}
            minLength={registering ? 3 : undefined}
            pattern={registering ? "[A-Za-z0-9_]{3,32}" : undefined}
            title={registering ? "3–32 位字母、数字或下划线" : undefined}
            placeholder={
              registering ? "3–32 位字母、数字或下划线" : "请输入用户名或邮箱"
            }
            disabled={busy}
          />
          {registering && (
            <>
              <label htmlFor="auth-name">姓名</label>
              <input
                id="auth-name"
                name="name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={80}
                disabled={busy}
              />
              <label htmlFor="auth-email">邮箱</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={128}
                disabled={busy}
              />
            </>
          )}
          <label htmlFor="auth-password">密码</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={registering ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={registering ? 8 : undefined}
            maxLength={128}
            placeholder={registering ? "至少 8 位" : "请输入密码"}
            disabled={busy}
          />
          {registering && (
            <>
              <label htmlFor="auth-confirm">确认密码</label>
              <input
                id="auth-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                disabled={busy}
              />
            </>
          )}
          <label htmlFor="auth-captcha">
            图形验证码 <small>点击图片可更换</small>
          </label>
          <div className="auth-simple-captcha">
            <input
              id="auth-captcha"
              name="captcha"
              inputMode="numeric"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              required
              maxLength={4}
              placeholder="输入 4 位数字"
              disabled={busy || captchaLoading}
            />
            <button
              type="button"
              aria-label="换一张验证码"
              title="看不清？点击换一张"
              disabled={busy || captchaLoading}
              onClick={() => {
                setError("");
                void refreshCaptcha();
              }}
            >
              {captchaLoading ? (
                <span>加载中…</span>
              ) : captcha ? (
                <img
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(captcha.svg)}`}
                  alt="随机四位数字图形验证码，点击换一张"
                />
              ) : (
                <span>点击重试</span>
              )}
            </button>
          </div>
          {!registering && (
            <label className="auth-simple-remember">
              <input
                type="checkbox"
                checked={keepOnline}
                onChange={(event) => setKeepOnline(event.target.checked)}
                disabled={busy}
              />
              保持登录 7 天
            </label>
          )}
          <button
            className="auth-simple-submit"
            type="submit"
            disabled={busy || captchaLoading || !captcha}
          >
            {busy ? "请稍候…" : registering ? "注册账号" : "登录"}
          </button>
        </form>
        <p className="auth-simple-footer">
          {registering ? "已有账号？" : "还没有账号？"}{" "}
          <a
            href={destination(registering ? "login" : "register")}
            onClick={(event) => {
              event.preventDefault();
              navigate(registering ? "login" : "register");
            }}
          >
            {registering ? "去登录" : "创建账号"}
          </a>
        </p>
      </section>
      <p className="auth-simple-copyright">SakuraEdu · 让教学更从容</p>
    </main>
  );
}
