import type { Express, Request, Response, NextFunction } from "express";
import {
  asyncDatabase,
  installAsyncRoutes,
  asyncFilter,
  type DatabaseSource,
} from "./asyncDatabase";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { CaptchaProvider } from "./dbContract";
import { HttpError, text } from "./http";
import {
  hashPassword,
  verifyPassword,
  passwordNeedsUpgrade,
  type PasswordPolicy,
} from "./passwords";
import { withAuthProtection } from "./authProtection";
import {
  headTeacherClassIds,
  classOrganizationActive,
} from "./organizationCore";
export type AuthUser = {
  id: string;
  faculty_code: string;
  full_name: string;
  title_role: string;
  department: string;
  role: "admin" | "teacher";
  default_tab: string;
  default_theme: string;
  default_class_name: string;
  semester_label: string;
  dnd_enabled: number;
  dnd_start_time: string;
  status: string;
};
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const publicProfile = (user: AuthUser) => ({
  demoMode:
    process.env.SAKURA_DEMO_MODE === "true" &&
    process.env.NODE_ENV !== "production",
  teacherId: user.id,
  facultyCode: user.faculty_code,
  fullName: user.full_name,
  titleRole: user.title_role,
  department: user.department,
  role: user.role,
  defaultTab: user.default_tab,
  defaultTheme: user.default_theme,
  defaultClassName: user.default_class_name,
  semesterLabel: user.semester_label,
  dndEnabled: !!user.dnd_enabled,
  dndStartTime: user.dnd_start_time,
});
const reply = (res: Response, data: unknown, message = "操作成功") =>
  res.json({
    code: 200,
    success: true,
    data,
    message,
    traceId: res.locals.requestId,
    timestamp: new Date().toISOString(),
  });
const cookieName = "sakura_session";
const cookieValue = (req: Request) =>
  (req.headers.cookie || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1) || "";
const sessionCookie = (token: string, maxAge: number) =>
  `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.COOKIE_SECURE === "true" ? "; Secure" : ""}`;
const mutations = new Set(["POST", "PUT", "PATCH", "DELETE"]);
export function registerAuth(
  app: Express,
  source: DatabaseSource,
  svgCaptcha: CaptchaProvider,
  options: {
    trustCloudflare?: boolean;
    passwordPolicy?: PasswordPolicy;
  } = {},
) {
  const db = asyncDatabase(source);
  installAsyncRoutes(app);
  app.use("/api/v1", (req, _res, next) => {
    try {
      if (
        mutations.has(req.method) &&
        req.headers.origin &&
        new URL(req.headers.origin).host !== req.headers.host
      )
        throw new HttpError(403, "请求来源无效");
      next();
    } catch (error) {
      next(error);
    }
  });
  const session = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hash = digest(cookieValue(req));
      const record = (await db
        .prepare(
          "SELECT s.csrf_token,s.expires_at,u.* FROM auth_sessions s JOIN faculty_users u ON u.id=s.user_id WHERE s.token_hash=?",
        )
        .get(hash)) as
        | (AuthUser & {
            csrf_token: string;
            expires_at: number;
          })
        | undefined;
      if (
        !record ||
        record.expires_at <= Date.now() ||
        record.status !== "ACTIVE"
      )
        throw new HttpError(401, "请先登录或重新验证会话");
      if (mutations.has(req.method)) {
        if (
          req.headers.origin &&
          new URL(req.headers.origin).host !== req.headers.host
        )
          throw new HttpError(403, "请求来源无效");
        if (req.headers["x-csrf-token"] !== record.csrf_token)
          throw new HttpError(403, "请求校验失败，请刷新页面");
      }
      res.locals.user = record;
      res.locals.sessionHash = hash;
      res.locals.csrfToken = record.csrf_token;
      next();
    } catch (error) {
      next(error);
    }
  };
  app.get("/api/v1/security/captcha", async (req, res) => {
    const mode = String(req.query.mode || "graphic");
    if (!["graphic", "math"].includes(mode))
      throw new HttpError(422, "该验证方式尚未开通，请使用图形或算术验证");
    const captcha =
      mode === "math"
        ? svgCaptcha.createMathExpr({
            size: 2,
            noise: 1,
            width: 132,
            height: 40,
          })
        : svgCaptcha.create({
            size: 4,
            noise: 1,
            width: 132,
            height: 40,
            ignoreChars: "0o1ilIO",
            charPreset: "23456789",
          });
    const id = `cap-${randomUUID()}`,
      answer = String(captcha.text).trim().toLowerCase(),
      expires = new Date(Date.now() + 300000).toISOString();
    await db
      .prepare(
        "INSERT INTO security_captchas(captcha_id,mode,captcha_mode,answer_hash,answer_text,svg_markup,expires_at) VALUES (?,?,?,?,?,?,?)",
      )
      .run(id, mode, mode, digest(answer), "", captcha.data, expires);
    reply(
      res,
      {
        captchaId: id,
        mode,
        svg: captcha.data,
        sliderTargetX: null,
        demoHint:
          process.env.SAKURA_DEMO_MODE === "true" &&
          process.env.NODE_ENV !== "production"
            ? captcha.text
            : "",
        expiresAt: expires,
        provider: "svg-captcha",
      },
      "验证码已生成",
    );
  });
  app.post(
    "/api/v1/auth/register",
    withAuthProtection(
      db,
      "register",
      async (req, res) => {
        const account = text(req.body.facultyCode, "用户名", {
          max: 32,
        }).toLowerCase();
        const email = text(req.body.email, "邮箱", { max: 128 }).toLowerCase();
        const fullName =
          text(req.body.fullName, "姓名", { max: 80, optional: true }) ||
          account;
        const password = text(req.body.password, "密码", { max: 128 });
        if (!/^[a-z0-9_]{3,32}$/.test(account))
          throw new HttpError(422, "用户名为 3–32 位字母、数字或下划线");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new HttpError(422, "请输入有效邮箱");
        if (password.length < 8) throw new HttpError(422, "密码至少 8 位");
        if (password !== req.body.confirmPassword)
          throw new HttpError(422, "两次输入的密码不一致");
        const key = `register:${req.get("cf-connecting-ip") || req.ip || "local"}`;
        await db
          .prepare(
            "INSERT INTO login_attempts(account,attempted_at,succeeded) VALUES (?,?,0)",
          )
          .run(key, Date.now());
        await db.transaction(async () => {
          const cap = (await db
            .prepare(
              "SELECT answer_hash,expires_at,verified,mode FROM security_captchas WHERE captcha_id=?",
            )
            .get(req.body.captchaId || "")) as
            | {
                answer_hash: string;
                expires_at: string;
                verified: number;
                mode: string;
              }
            | undefined;
          if (
            !cap ||
            cap.mode !== "graphic" ||
            cap.verified ||
            Date.parse(cap.expires_at) <= Date.now() ||
            cap.answer_hash !==
              digest(
                String(req.body.captchaAnswer || "")
                  .trim()
                  .toLowerCase(),
              )
          )
            throw new HttpError(422, "验证码不正确或已过期，请换一张重试");
          const used = await db
            .prepare(
              "SELECT id FROM faculty_users WHERE faculty_code=? COLLATE NOCASE OR email=? COLLATE NOCASE",
            )
            .get(account, email);
          if (used) throw new HttpError(409, "用户名或邮箱已被使用");
          // The transaction serializes the empty-installation check with account creation.
          const firstAccount = !(await db
            .prepare("SELECT 1 FROM faculty_users LIMIT 1")
            .get());
          if (
            (
              await db
                .prepare(
                  "UPDATE security_captchas SET verified=1 WHERE captcha_id=? AND verified=0",
                )
                .run(req.body.captchaId)
            ).changes !== 1
          )
            throw new HttpError(422, "验证码已被使用");
          await db
            .prepare(
              "INSERT INTO faculty_users(id,faculty_code,email,password_hash,full_name,title_role,department,role,default_tab,default_theme,default_class_name,semester_label,dnd_enabled) VALUES (?,?,?,?,?,?,'未设置',?,'dashboard-overview','forest-tea','尚未分配班级','尚未设置学期',0)",
            )
            .run(
              randomUUID(),
              account,
              email,
              hashPassword(password, options.passwordPolicy),
              fullName,
              firstAccount ? "系统管理员" : "教师",
              firstAccount ? "admin" : "teacher",
            );
          await res.locals.authProtectionSuccess?.();
        })();
        reply(
          res,
          { facultyCode: account },
          "注册成功，请登录；班级由管理员分配",
        );
      },
      options.trustCloudflare,
    ),
  );
  app.post(
    "/api/v1/auth/faculty-login",
    withAuthProtection(
      db,
      "login",
      async (req, res) => {
        if (req.body.loginType !== "account")
          throw new HttpError(501, "该登录方式尚未开通，请使用账号登录");
        const account = text(req.body.facultyId, "账号", { max: 128 }),
          password = text(req.body.password, "密码", { max: 256 });
        const cap = (await db
          .prepare(
            "SELECT answer_hash,expires_at,verified FROM security_captchas WHERE captcha_id=?",
          )
          .get(req.body.captchaId || "")) as
          | {
              answer_hash: string;
              expires_at: string;
              verified: number;
            }
          | undefined;
        const validCaptcha =
          cap &&
          !cap.verified &&
          Date.parse(cap.expires_at) > Date.now() &&
          cap.answer_hash ===
            digest(
              String(req.body.captchaAnswer || "")
                .trim()
                .toLowerCase(),
            );
        if (!validCaptcha)
          throw new HttpError(422, "验证码无效、已使用或已过期");
        const user = (await db
          .prepare(
            "SELECT * FROM faculty_users WHERE faculty_code=? OR email=? OR phone=?",
          )
          .get(account, account, account)) as
          | (AuthUser & {
              password_hash: string;
            })
          | undefined;
        const valid =
          user &&
          user.status === "ACTIVE" &&
          verifyPassword(password, user.password_hash, options.passwordPolicy);
        await db
          .prepare(
            "INSERT INTO login_attempts(account,attempted_at,succeeded) VALUES (?,?,?)",
          )
          .run(account, Date.now(), valid ? 1 : 0);
        // Consume on both success and credential failure; a challenge is single-use.
        if (
          (
            await db
              .prepare(
                "UPDATE security_captchas SET verified=1 WHERE captcha_id=? AND verified=0",
              )
              .run(req.body.captchaId)
          ).changes !== 1
        )
          throw new HttpError(422, "验证码已被使用");
        if (!valid) throw new HttpError(401, "账号或密码不正确");
        const token = randomBytes(32).toString("hex"),
          csrf = randomBytes(24).toString("hex"),
          seconds = req.body.keepOnline ? 7 * 86400 : 8 * 3600;
        await db.transaction(async () => {
          if (
            passwordNeedsUpgrade(user.password_hash, options.passwordPolicy)
          ) {
            const upgraded = hashPassword(password, options.passwordPolicy);
            const saved = await db
              .prepare(
                "UPDATE faculty_users SET password_hash=? WHERE id=? AND password_hash=? AND status='ACTIVE'",
              )
              .run(upgraded, user.id, user.password_hash);
            if (saved.changes !== 1)
              throw new HttpError(409, "账号凭据已更新，请重新登录");
          }
          await db
            .prepare("DELETE FROM auth_sessions WHERE expires_at<=?")
            .run(Date.now());
          await db
            .prepare(
              "INSERT INTO auth_sessions(token_hash,user_id,csrf_token,expires_at,created_at) VALUES (?,?,?,?,?)",
            )
            .run(
              digest(token),
              user.id,
              csrf,
              Date.now() + seconds * 1000,
              Date.now(),
            );
          await res.locals.authProtectionSuccess?.();
        })();
        res.setHeader("Set-Cookie", sessionCookie(token, seconds));
        reply(
          res,
          { ...publicProfile(user), token: "", csrfToken: csrf },
          `欢迎回来，${user.full_name}`,
        );
      },
      options.trustCloudflare,
    ),
  );
  app.get("/api/v1/auth/session", session, (_req, res) =>
    reply(res, {
      ...publicProfile(res.locals.user),
      token: "",
      csrfToken: res.locals.csrfToken,
    }),
  );
  app.get("/api/v1/auth/default-profile", session, (_req, res) =>
    reply(res, {
      ...publicProfile(res.locals.user),
      csrfToken: res.locals.csrfToken,
    }),
  );
  app.post("/api/v1/auth/logout", session, async (_req, res) => {
    await db
      .prepare("DELETE FROM auth_sessions WHERE token_hash=?")
      .run(res.locals.sessionHash);
    res.setHeader("Set-Cookie", sessionCookie("", 0));
    reply(res, { loggedOut: true });
  });
  app.put("/api/v1/auth/default-profile", session, async (req, res) => {
    const user = res.locals.user as AuthUser;
    // Identity, password and role are never editable via a preferences endpoint.
    if (
      (req.body.facultyCode && req.body.facultyCode !== user.faculty_code) ||
      (req.body.role && req.body.role !== user.role) ||
      req.body.password
    )
      throw new HttpError(403, "账号凭据与角色不能通过偏好设置修改");
    const fullName = text(req.body.fullName, "显示姓名", { max: 80 }),
      title = text(req.body.titleRole, "职务", { max: 100 }),
      department = text(req.body.department, "部门", { max: 100 });
    const tabs = [
      "dashboard-overview",
      "homework-center",
      "student-profiles",
      "schedule-management",
      "lesson-plans",
      "exam-analytics",
      "school-home-communication",
    ];
    if (!tabs.includes(req.body.defaultTab))
      throw new HttpError(422, "默认页面无效");
    const dnd = String(req.body.dndStartTime || user.dnd_start_time);
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(dnd) || Number(dnd.slice(0, 2)) < 8)
      throw new HttpError(
        422,
        "免打扰开始时间须为 08:00 至 23:59，次日 08:00 结束",
      );
    const theme = String(req.body.defaultTheme || user.default_theme);
    if (
      ![
        "awesome-green",
        "matcha-bamboo",
        "sakura-pink",
        "sakura-classic",
        "sakura-milk",
        "ocean-blue",
        "forest-tea",
        "amber-paper",
        "lavender-mist",
        "graphite-mono",
        "midnight-cyan",
      ].includes(theme)
    )
      throw new HttpError(422, "主题无效");
    await db
      .prepare(
        "UPDATE faculty_users SET full_name=?,title_role=?,department=?,default_tab=?,default_theme=?,dnd_enabled=?,dnd_start_time=?,default_class_name=?,semester_label=? WHERE id=?",
      )
      .run(
        fullName,
        title,
        department,
        req.body.defaultTab,
        theme,
        req.body.dndEnabled ? 1 : 0,
        dnd,
        text(
          req.body.defaultClassName || user.default_class_name,
          "默认班级显示名",
          { max: 80 },
        ),
        text(req.body.semesterLabel || user.semester_label, "学期显示说明", {
          max: 100,
        }),
        user.id,
      );
    reply(
      res,
      publicProfile(
        (await db
          .prepare("SELECT * FROM faculty_users WHERE id=?")
          .get(user.id)) as AuthUser,
      ),
      "个人偏好已保存",
    );
  });
  app.get("/api/v1/auth/env-check", async (_req, res) =>
    reply(res, {
      gatewayLatencyMs: 0,
      ocrDriverVersion: "未连接",
      tablesReady: (
        (await db
          .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table'")
          .get()) as {
          n: number;
        }
      ).n,
    }),
  );
  app.use("/api/v1", session);
  app.use("/api/v1/sqlite", (req, res, next) => {
    return next(new HttpError(403, "数据库管理接口已停用"));
  });
  app.use("/api/v1", async (req, res, next) => {
    if (res.locals.user.role === "admin") return next();
    if (req.path.startsWith("/academic/")) return next();
    // Modules without ownership models stay closed until their planned migration.
    if (
      req.path.startsWith("/lessons/") ||
      req.path.startsWith("/schedules/") ||
      req.path.startsWith("/exams/") ||
      req.path.startsWith("/care/") ||
      req.path.startsWith("/workspace/") ||
      req.path.startsWith("/organization/")
    )
      return next();
    if (!req.path.startsWith("/students") && !req.path.startsWith("/homework"))
      return next(new HttpError(403, "该操作尚未向教师开放"));
    const owned = (await db
      .prepare(
        "SELECT DISTINCT class_id FROM teaching_assignments WHERE teacher_id=? AND archived_at IS NULL",
      )
      .all(res.locals.user.id)) as {
      class_id: string;
    }[];
    const allowed = await asyncFilter(
      [
        ...new Set([
          ...owned.map((row) => row.class_id),
          ...(await headTeacherClassIds(db, res.locals.user.id)),
        ]),
      ],
      async (id) => await classOrganizationActive(db, id),
    );
    if (!allowed.length) return next(new HttpError(403, "尚未分配任教班级"));
    const studentMatch = req.path.match(/^\/students\/([^/]+)/),
      submissionMatch = req.path.match(/^\/homework\/submissions\/([^/]+)/);
    if (studentMatch) {
      const row = (await db
        .prepare("SELECT class_id FROM student_profiles WHERE id=?")
        .get(studentMatch[1])) as
        | {
            class_id: string;
          }
        | undefined;
      if (row && !allowed.includes(row.class_id))
        return next(new HttpError(403, "无权访问该学生"));
    }
    if (submissionMatch) {
      const row = (await db
        .prepare(
          "SELECT a.class_id FROM homework_submissions s JOIN homework_assignments a ON a.id=s.assignment_id WHERE s.id=?",
        )
        .get(submissionMatch[1])) as
        | {
            class_id: string;
          }
        | undefined;
      if (row && !allowed.includes(row.class_id))
        return next(new HttpError(403, "无权访问该作业"));
    }
    res.locals.classScope = allowed;
    next();
  });
}
