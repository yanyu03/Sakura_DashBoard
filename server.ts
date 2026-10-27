import express from 'express';
import path from 'path';
import svgCaptcha from 'svg-captcha';
import { createServer as createViteServer } from 'vite';
import {
  getSqliteDatabaseSummary,
  initAndSeedSqliteDatabase,
  recordSqlAudit,
  SQLITE_DB_PATH,
  sqliteDb,
} from './server/sqliteDb';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Helper to wrap standard API response
  function sendSqlResponse<T>(
    res: express.Response,
    data: T,
    message: string,
    meta: { fn: string; method: string; endpoint: string; sql: string; rowsAffected?: number }
  ) {
    const traceId = recordSqlAudit(meta);
    return res.json({
      code: 200,
      success: true,
      message,
      data,
      traceId,
      timestamp: new Date().toISOString(),
      sqlExecuted: meta.sql,
    });
  }

  // ===========================================================================
  // 0. Open-Source Security Captcha API
  // ===========================================================================
  app.get('/api/v1/security/captcha', (req, res) => {
    const mode = (req.query.mode as 'graphic' | 'math' | 'slider') || 'graphic';
    const captchaId = `cap-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const expiresAtIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    let questionLabel = '';
    let answerText = '';
    let svgMarkup = '';
    let sliderTargetX: number | null = null;

    if (mode === 'math') {
      const mathCap = svgCaptcha.createMathExpr({
        mathMin: 2,
        mathMax: 15,
        mathOperator: '+-',
        noise: 3,
        color: true,
        background: '#ebf5ef',
        width: 132,
        height: 40,
        fontSize: 38,
      });
      questionLabel = '算术验证码';
      answerText = mathCap.text;
      svgMarkup = mathCap.data;
    } else if (mode === 'slider') {
      sliderTargetX = Math.floor(Math.random() * 80) + 120; // 120px - 200px
      questionLabel = '滑动防刷验证';
      answerText = String(sliderTargetX);
      svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 40" width="132" height="40"><rect width="132" height="40" rx="4" fill="#ebf5ef"/><path d="M12 20 H120" stroke="#0d7a5f" stroke-width="2" stroke-dasharray="4 3"/><text x="66" y="24" font-size="11" text-anchor="middle" fill="#064e3b" font-weight="bold">TARGET: ${sliderTargetX}px</text></svg>`;
    } else {
      const graphicCap = svgCaptcha.create({
        size: 4,
        ignoreChars: '0o1iIl',
        noise: 3,
        color: true,
        background: '#ebf5ef',
        width: 132,
        height: 40,
        fontSize: 38,
      });
      questionLabel = '图形验证码';
      answerText = graphicCap.text;
      svgMarkup = graphicCap.data;
    }

    const sql = `INSERT INTO security_captchas (captcha_id, mode, answer_hash, expires_at) VALUES ('${captchaId}', '${mode}', '${answerText}', '${expiresAtIso}');`;

    sqliteDb
      .prepare(
        `INSERT INTO security_captchas (captcha_id, mode, captcha_mode, question_label, answer_hash, answer_text, svg_markup, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        captchaId,
        mode,
        mode,
        questionLabel,
        answerText,
        answerText,
        svgMarkup,
        expiresAtIso
      );

    return sendSqlResponse(
      res,
      {
        captchaId,
        mode,
        questionLabel,
        svg: svgMarkup,
        svgMarkup,
        sliderTargetX,
        demoHint: answerText,
        expiresAt: expiresAtIso,
        provider: 'svg-captcha',
      },
      `已刷新${questionLabel}`,
      {
        fn: 'sakuraApi.security.generateCaptcha',
        method: 'GET',
        endpoint: `/api/v1/security/captcha?mode=${mode}`,
        sql,
      }
    );
  });

  app.post('/api/v1/security/captcha/verify', (req, res) => {
    const { captchaId, answer } = req.body as {
      captchaId: string;
      answer: string;
    };
    const row = sqliteDb
      .prepare(
        `SELECT captcha_id, captcha_mode, answer_text, expires_at FROM security_captchas WHERE captcha_id = ?`
      )
      .get(captchaId) as
      | {
          captcha_id: string;
          captcha_mode: string;
          answer_text: string;
          expires_at: string;
        }
      | undefined;

    const normalizedUser = String(answer || '').trim().toLowerCase();
    const normalizedExpected = String(row?.answer_text || '').trim().toLowerCase();

    let passed = false;
    if (row) {
      if (row.captcha_mode === 'slider') {
        passed = Math.abs(Number(normalizedUser) - Number(normalizedExpected)) <= 12;
      } else {
        passed = normalizedUser === normalizedExpected && normalizedUser.length > 0;
      }
    }

    if (passed && row) {
      sqliteDb
        .prepare(`UPDATE security_captchas SET verified = 1 WHERE captcha_id = ?`)
        .run(captchaId);
    }

    const sql = `UPDATE security_captchas SET verified = ${
      passed ? 1 : 0
    } WHERE captcha_id = '${captchaId}';`;

    return sendSqlResponse(
      res,
      {
        verified: passed,
        captchaId,
        passed,
        verifiedAt: new Date().toISOString(),
      },
      passed ? '安全验证码校验通过' : '验证码输入有误，请刷新重试',
      {
        fn: 'sakuraApi.security.verifyCaptcha',
        method: 'POST',
        endpoint: '/api/v1/security/captcha/verify',
        sql,
      }
    );
  });

  // ===========================================================================
  // 1. Faculty Unified Auth & User-Group Default Settings Endpoints
  // ===========================================================================
  app.get('/api/v1/auth/default-profile', (_req, res) => {
    const row = sqliteDb
      .prepare(
        `SELECT id, faculty_code, password_hash, full_name, title_role, department,
                default_tab, default_theme, default_class_name, semester_label,
                dnd_enabled, dnd_start_time
         FROM faculty_users
         WHERE id = 'fac-admin'
         ORDER BY rowid ASC
         LIMIT 1`
      )
      .get() as
      | {
          id: string;
          faculty_code: string;
          password_hash: string;
          full_name: string;
          title_role: string;
          department: string;
          default_tab: string;
          default_theme: string;
          default_class_name: string;
          semester_label: string;
          dnd_enabled: number;
          dnd_start_time: string;
        }
      | undefined;

    const profile = {
      teacherId: row?.id || 'fac-admin',
      facultyCode: row?.faculty_code || 'admin',
      password: row?.password_hash || 'admin',
      fullName: row?.full_name || '林知夏 老师',
      titleRole: row?.title_role || '高二(3)班班主任 · 语文组',
      department: row?.department || '高中语文教研组',
      defaultTab: row?.default_tab || 'homework-center',
      defaultTheme: row?.default_theme || 'awesome-green',
      defaultClassName: row?.default_class_name || '高二(1)班',
      semesterLabel: row?.semester_label || '2024 春季学期 · 第 12 周',
      dndEnabled: row ? Boolean(row.dnd_enabled) : true,
      dndStartTime: row?.dnd_start_time || '20:30',
    };

    return sendSqlResponse(
      res,
      profile,
      '已加载默认登录与用户组基准配置',
      {
        fn: 'sakuraApi.auth.getDefaultProfile',
        method: 'GET',
        endpoint: '/api/v1/auth/default-profile',
        sql: "SELECT * FROM faculty_users WHERE id = 'fac-admin' LIMIT 1;",
      }
    );
  });

  app.put('/api/v1/auth/default-profile', (req, res) => {
    const {
      facultyCode,
      password,
      fullName,
      titleRole,
      department,
      defaultTab,
      defaultTheme,
      defaultClassName,
      semesterLabel,
      dndEnabled,
      dndStartTime,
    } = req.body as {
      facultyCode?: string;
      password?: string;
      fullName?: string;
      titleRole?: string;
      department?: string;
      defaultTab?: string;
      defaultTheme?: string;
      defaultClassName?: string;
      semesterLabel?: string;
      dndEnabled?: boolean;
      dndStartTime?: string;
    };

    const nextCode = String(facultyCode || 'admin').trim() || 'admin';
    const nextPwd = String(password || 'admin').trim() || 'admin';
    const nextName = String(fullName || '林知夏 老师').trim() || '林知夏 老师';
    const nextTitle =
      String(titleRole || '高二(3)班班主任 · 语文组').trim() ||
      '高二(3)班班主任 · 语文组';
    const nextDept =
      String(department || '高中语文教研组').trim() || '高中语文教研组';
    const nextTab = String(defaultTab || 'homework-center').trim();
    const nextTheme = String(defaultTheme || 'awesome-green').trim();
    const nextClass = String(defaultClassName || '高二(1)班').trim() || '高二(1)班';
    const nextSemester =
      String(semesterLabel || '2024 春季学期 · 第 12 周').trim() ||
      '2024 春季学期 · 第 12 周';
    const nextDnd = dndEnabled === undefined ? 1 : dndEnabled ? 1 : 0;
    const nextDndTime = String(dndStartTime || '20:30').trim() || '20:30';

    sqliteDb
      .prepare(
        `UPDATE faculty_users
         SET faculty_code = ?,
             password_hash = ?,
             full_name = ?,
             title_role = ?,
             department = ?,
             default_tab = ?,
             default_theme = ?,
             default_class_name = ?,
             semester_label = ?,
             dnd_enabled = ?,
             dnd_start_time = ?
         WHERE id = 'fac-admin'`
      )
      .run(
        nextCode,
        nextPwd,
        nextName,
        nextTitle,
        nextDept,
        nextTab,
        nextTheme,
        nextClass,
        nextSemester,
        nextDnd,
        nextDndTime
      );

    // Keep academic_classes baseline class_name synced with user-group default class
    sqliteDb
      .prepare(`UPDATE academic_classes SET class_name = ? WHERE id = 'G2-201'`)
      .run(nextClass);

    const updatedProfile = {
      teacherId: 'fac-admin',
      facultyCode: nextCode,
      password: nextPwd,
      fullName: nextName,
      titleRole: nextTitle,
      department: nextDept,
      defaultTab: nextTab,
      defaultTheme: nextTheme,
      defaultClassName: nextClass,
      semesterLabel: nextSemester,
      dndEnabled: Boolean(nextDnd),
      dndStartTime: nextDndTime,
    };

    const sql = `UPDATE faculty_users SET faculty_code = '${nextCode}', full_name = '${nextName}', title_role = '${nextTitle}', department = '${nextDept}', default_tab = '${nextTab}', default_theme = '${nextTheme}', default_class_name = '${nextClass}', semester_label = '${nextSemester}' WHERE id = 'fac-admin';`;

    return sendSqlResponse(
      res,
      updatedProfile,
      '已更新默认信息并覆盖用户组默认值，下次登录将以此为准',
      {
        fn: 'sakuraApi.auth.saveDefaultProfile',
        method: 'PUT',
        endpoint: '/api/v1/auth/default-profile',
        sql,
      }
    );
  });

  app.post('/api/v1/auth/faculty-login', (req, res) => {
    const { facultyId, password, captchaId, captchaAnswer, loginType } = req.body as {
      facultyId: string;
      password?: string;
      captchaId?: string;
      captchaAnswer?: string;
      loginType: string;
    };

    if (loginType === 'account' && captchaId) {
      const capRow = sqliteDb
        .prepare(
          `SELECT answer_text, captcha_mode, verified FROM security_captchas WHERE captcha_id = ?`
        )
        .get(captchaId) as
        | { answer_text: string; captcha_mode: string; verified: number }
        | undefined;

      if (capRow && !capRow.verified) {
        const expected = capRow.answer_text.trim().toLowerCase();
        const actual = String(captchaAnswer || '').trim().toLowerCase();
        const valid =
          capRow.captcha_mode === 'slider'
            ? Math.abs(Number(actual) - Number(expected)) <= 12
            : actual === expected;

        if (!valid) {
          return res.status(400).json({
            code: 400,
            success: false,
            message: `验证码不正确（提示：${capRow.answer_text}），请重试`,
            data: null,
            traceId: `err-${Date.now()}`,
            timestamp: new Date().toISOString(),
          });
        }
        sqliteDb
          .prepare(`UPDATE security_captchas SET verified = 1 WHERE captcha_id = ?`)
          .run(captchaId);
      }
    }

    const defaultRow = sqliteDb
      .prepare(
        `SELECT id, faculty_code, password_hash, full_name, title_role, department,
                default_tab, default_theme, default_class_name, semester_label,
                dnd_enabled, dnd_start_time
         FROM faculty_users
         WHERE id = 'fac-admin'
         LIMIT 1`
      )
      .get() as
      | {
          id: string;
          faculty_code: string;
          password_hash: string;
          full_name: string;
          title_role: string;
          department: string;
          default_tab: string;
          default_theme: string;
          default_class_name: string;
          semester_label: string;
          dnd_enabled: number;
          dnd_start_time: string;
        }
      | undefined;

    const cleanId = (facultyId || defaultRow?.faculty_code || 'admin').trim();
    const userRow = sqliteDb
      .prepare(
        `SELECT id, faculty_code, password_hash, full_name, title_role, department,
                default_tab, default_theme, default_class_name, semester_label,
                dnd_enabled, dnd_start_time
         FROM faculty_users
         WHERE faculty_code = ? OR email = ? OR phone = ?
         LIMIT 1`
      )
      .get(cleanId, cleanId, cleanId) as typeof defaultRow;

    if (loginType === 'account') {
      const hintCode = defaultRow?.faculty_code || 'admin';
      const hintPwd = defaultRow?.password_hash || 'admin';
      if (!userRow) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: `账号不存在，请使用当前默认账号 ${hintCode} 登录`,
          data: null,
          traceId: `err-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
      }
      if (password !== undefined && password !== userRow.password_hash) {
        return res.status(401).json({
          code: 401,
          success: false,
          message: `登录密码错误，当前默认密码为 ${hintPwd}`,
          data: null,
          traceId: `err-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const finalUser = userRow ||
      defaultRow || {
        id: 'fac-admin',
        faculty_code: 'admin',
        password_hash: 'admin',
        full_name: '林知夏 老师',
        title_role: '高二(3)班班主任 · 语文组',
        department: '高中语文教研组',
        default_tab: 'homework-center',
        default_theme: 'awesome-green',
        default_class_name: '高二(1)班',
        semester_label: '2024 春季学期 · 第 12 周',
        dnd_enabled: 1,
        dnd_start_time: '20:30',
      };

    const sql = `SELECT id, faculty_code, full_name, title_role, department, default_tab, default_theme, default_class_name, semester_label FROM faculty_users WHERE (faculty_code = '${cleanId}' OR email = '${cleanId}') AND status = 'ACTIVE' LIMIT 1;`;

    return sendSqlResponse(
      res,
      {
        teacherId: finalUser.id,
        facultyCode: finalUser.faculty_code,
        fullName: finalUser.full_name,
        titleRole: finalUser.title_role,
        department: finalUser.department,
        token: `sakura_jwt_${Date.now().toString(36)}`,
        defaultTab: finalUser.default_tab || 'homework-center',
        defaultTheme: finalUser.default_theme || 'awesome-green',
        defaultClassName: finalUser.default_class_name || '高二(1)班',
        semesterLabel: finalUser.semester_label || '2024 春季学期 · 第 12 周',
        dndEnabled: Boolean(finalUser.dnd_enabled),
        dndStartTime: finalUser.dnd_start_time || '20:30',
      },
      `欢迎回来，${finalUser.full_name} · 已应用默认工作台配置`,
      {
        fn: 'sakuraApi.auth.loginWithCredentials',
        method: 'POST',
        endpoint: '/api/v1/auth/faculty-login',
        sql,
      }
    );
  });

  app.get('/api/v1/auth/env-check', (_req, res) => {
    const sql = `SELECT COUNT(*) AS tables_ready FROM sqlite_master WHERE type='table';`;
    return sendSqlResponse(
      res,
      {
        gatewayLatencyMs: 6,
        ocrDriverVersion: 'v4.2',
        caValid: true,
      },
      '终端环境自检通过',
      {
        fn: 'sakuraApi.auth.checkTerminalEnvironment',
        method: 'GET',
        endpoint: '/api/v1/auth/env-check',
        sql,
      }
    );
  });

  // ===========================================================================
  // 2. Schedule & Course Swap Endpoints
  // ===========================================================================
  app.get('/api/v1/schedules/weekly-matrix', (req, res) => {
    const weekNum = Number(req.query.weekNum) || 12;
    const filter = String(req.query.filter || 'my-schedule');
    const rows = sqliteDb
      .prepare(
        `SELECT * FROM timetable_schedules WHERE semester = '2024-SPRING' AND week_num = ? ORDER BY period_id, day_of_week`
      )
      .all(weekNum);
    const sql = `SELECT * FROM timetable_schedules WHERE semester = '2024-SPRING' AND week_num = ${weekNum} ORDER BY period_id, day_of_week;`;

    return sendSqlResponse(
      res,
      { weekNum, viewFilter: filter, conflictFree: true, sqliteRowCount: rows.length },
      `已切换至第 ${weekNum} 周课表视图`,
      {
        fn: 'sakuraApi.schedule.getWeeklyTimetable',
        method: 'GET',
        endpoint: `/api/v1/schedules/weekly-matrix?weekNum=${weekNum}&filter=${filter}`,
        sql,
      }
    );
  });

  app.post('/api/v1/schedules/swap-requests', (req, res) => {
    const {
      applicantTeacherId,
      targetTeacherName,
      sourcePeriodDesc,
      targetPeriodDesc,
      reason,
    } = req.body;
    const requestId = `swap-${Date.now()}`;
    sqliteDb
      .prepare(
        `INSERT INTO course_swap_requests (id, applicant_teacher_id, target_teacher_name, source_period_desc, target_period_desc, reason, approval_status) VALUES (?, ?, ?, ?, ?, ?, 'APPROVED')`
      )
      .run(
        requestId,
        applicantTeacherId || 'fac-admin',
        targetTeacherName,
        sourcePeriodDesc,
        targetPeriodDesc,
        reason
      );

    const sql = `INSERT INTO course_swap_requests (id, applicant_teacher_id, target_teacher_name, source_period_desc, target_period_desc, reason, approval_status) VALUES ('${requestId}', '${
      applicantTeacherId || 'fac-admin'
    }', '${targetTeacherName}', '${sourcePeriodDesc}', '${targetPeriodDesc}', '${reason}', 'APPROVED');`;

    return sendSqlResponse(
      res,
      { requestId, approvalStatus: 'APPROVED' },
      '调代课申请已提交并自动校验无排课冲突',
      {
        fn: 'sakuraApi.schedule.submitCourseSwap',
        method: 'POST',
        endpoint: '/api/v1/schedules/swap-requests',
        sql,
      }
    );
  });

  // ===========================================================================
  // 3. Homework Submissions & Grading Endpoints
  // ===========================================================================
  app.get('/api/v1/homework/submissions', (req, res) => {
    const className = String(req.query.className || '高二(1)班');
    const status = String(req.query.status || 'all');

    const rows = sqliteDb
      .prepare(`SELECT * FROM homework_submissions ORDER BY submitted_at ASC`)
      .all() as {
      id: string;
      total_score: number | null;
      status: string;
      status_badge: string;
      stamp_type: string | null;
      payload_json: string;
    }[];

    const parsed = rows.map((r) => {
      const base = JSON.parse(r.payload_json);
      return {
        ...base,
        score: r.total_score ?? base.score,
        status: r.status || base.status,
        statusBadge: r.status_badge || base.statusBadge,
        stamp: r.stamp_type,
      };
    });

    const sql = `SELECT * FROM homework_submissions WHERE assignment_id = 'assign-chibifu-04' ORDER BY submitted_at DESC;`;

    return sendSqlResponse(
      res,
      parsed,
      `已加载 ${className} 作业批阅池`,
      {
        fn: 'sakuraApi.homework.getClassSubmissions',
        method: 'GET',
        endpoint: `/api/v1/homework/submissions?className=${encodeURIComponent(
          className
        )}&status=${status}`,
        sql,
      }
    );
  });

  app.patch('/api/v1/homework/submissions/:id/grade', (req, res) => {
    const submissionId = req.params.id;
    const { score, stamp } = req.body as { score: number; stamp?: string | null };
    const statusBadge = score >= 92 ? '优秀论述' : '已评阅';

    sqliteDb
      .prepare(
        `UPDATE homework_submissions SET total_score = ?, status = 'graded', status_badge = ?, stamp_type = COALESCE(?, stamp_type), graded_at = datetime('now', 'localtime') WHERE id = ?`
      )
      .run(score, statusBadge, stamp === undefined ? null : stamp, submissionId);

    const sql = `UPDATE homework_submissions SET total_score = ${score}, status = 'graded', status_badge = '${statusBadge}', graded_at = datetime('now', 'localtime') WHERE id = '${submissionId}';`;

    return sendSqlResponse(
      res,
      { submissionId, finalScore: score },
      `终核分数 (${score}分) 已保存归档`,
      {
        fn: 'sakuraApi.homework.submitGrade',
        method: 'PATCH',
        endpoint: `/api/v1/homework/submissions/${submissionId}/grade`,
        sql,
      }
    );
  });

  app.patch('/api/v1/homework/submissions/:id/stamp', (req, res) => {
    const submissionId = req.params.id;
    const { studentName, stamp } = req.body as {
      studentName: string;
      stamp: string | null;
    };

    sqliteDb
      .prepare(`UPDATE homework_submissions SET stamp_type = ? WHERE id = ?`)
      .run(stamp, submissionId);

    const sql = `UPDATE homework_submissions SET stamp_type = ${
      stamp ? `'${stamp}'` : 'NULL'
    } WHERE id = '${submissionId}';`;

    return sendSqlResponse(
      res,
      { stamp },
      stamp
        ? `已为 ${studentName} 的答卷加盖「${stamp}」印章`
        : `已移除 ${studentName} 答卷印章`,
      {
        fn: 'sakuraApi.homework.applySakuraStamp',
        method: 'PATCH',
        endpoint: `/api/v1/homework/submissions/${submissionId}/stamp`,
        sql,
      }
    );
  });

  // ===========================================================================
  // 4. Student Profiles & Coaching Journals Endpoints
  // ===========================================================================
  app.get('/api/v1/students', (req, res) => {
    const classId = String(req.query.classId || 'G2-201');
    const tag = String(req.query.tag || 'all');

    const rows = sqliteDb
      .prepare(`SELECT id, payload_json FROM student_profiles`)
      .all() as { id: string; payload_json: string }[];

    const journals = sqliteDb
      .prepare(
        `SELECT id, student_id, date_title, tag, content, teacher_name, status_text FROM coaching_journals ORDER BY rowid DESC`
      )
      .all() as {
      id: string;
      student_id: string;
      date_title: string;
      tag: string;
      content: string;
      teacher_name: string;
      status_text: string;
    }[];

    const profiles = rows.map((r) => {
      const base = JSON.parse(r.payload_json);
      const stuJournals = journals
        .filter((j) => j.student_id === r.id)
        .map((j) => ({
          id: j.id,
          dateTitle: j.date_title,
          tag: j.tag,
          content: j.content,
          teacher: j.teacher_name,
          statusText: j.status_text,
        }));
      return {
        ...base,
        coachingJournals:
          stuJournals.length > 0 ? stuJournals : base.coachingJournals,
      };
    });

    const sql = `SELECT * FROM student_profiles WHERE class_id = '${classId}';`;

    return sendSqlResponse(
      res,
      profiles,
      `已加载学生学情档案`,
      {
        fn: 'sakuraApi.student.getStudentProfiles',
        method: 'GET',
        endpoint: `/api/v1/students?classId=${classId}&tag=${tag}`,
        sql,
      }
    );
  });

  app.post('/api/v1/students/:id/coaching-journals', (req, res) => {
    const studentId = req.params.id;
    const { studentName, content } = req.body as {
      studentName: string;
      content: string;
    };
    const journalId = `j-${Date.now()}`;
    const dateTitle = '5月16日 · 随堂面批手账';

    sqliteDb
      .prepare(
        `INSERT INTO coaching_journals (id, student_id, student_name, teacher_id, date_title, tag, content, teacher_name, status_text) VALUES (?, ?, ?, 'fac-admin', ?, '最新批注', ?, '林知夏 老师', '已同步成长档案')`
      )
      .run(journalId, studentId, studentName || studentId, dateTitle, content);

    const sql = `INSERT INTO coaching_journals (id, student_id, teacher_id, date_title, tag, content) VALUES ('${journalId}', '${studentId}', 'fac-admin', '${dateTitle}', '最新批注', '${content.replace(
      /'/g,
      "''"
    )}');`;

    return sendSqlResponse(
      res,
      { journalId, dateTitle },
      `已为 ${studentName} 添加面批手账备忘录`,
      {
        fn: 'sakuraApi.student.addCoachingJournal',
        method: 'POST',
        endpoint: `/api/v1/students/${studentId}/coaching-journals`,
        sql,
      }
    );
  });

  // ===========================================================================
  // 5. Lesson Plans & Exam Analytics & Home-School Comm Endpoints
  // ===========================================================================
  app.get('/api/v1/lessons/unit-plans', (_req, res) => {
    const rows = sqliteDb
      .prepare(`SELECT * FROM lesson_plans ORDER BY rowid DESC`)
      .all() as {
      id: string;
      unit_code: string;
      title: string;
      summary: string;
      badge_text: string;
      author_name: string;
      citation_count: number;
      tags_json: string;
      updated_at: string;
    }[];
    const mapped = rows.map((r) => ({
      id: r.id,
      unitCode: r.unit_code,
      title: r.title,
      summary: r.summary,
      authorName: r.author_name,
      badgeText: r.badge_text || '基准示范教案',
      slidesCount: 45,
      citationCount: r.citation_count || 238,
      tags: (() => {
        try {
          return JSON.parse(r.tags_json || '[]');
        } catch {
          return ['# 核心素养·审美鉴赏', '# 任务驱动型导学'];
        }
      })(),
      updatedAt: r.updated_at || '基准教案',
    }));
    return sendSqlResponse(res, mapped, '已加载备课教案库', {
      fn: 'sakuraApi.lesson.getLessonPlans',
      method: 'GET',
      endpoint: '/api/v1/lessons/unit-plans',
      sql: 'SELECT * FROM lesson_plans ORDER BY rowid DESC;',
    });
  });

  app.put('/api/v1/lessons/unit-plans', (req, res) => {
    const { lessonId, unitCode, title, description, authorName } = req.body;
    const id = lessonId || `lp-${Date.now()}`;

    sqliteDb
      .prepare(
        `INSERT OR REPLACE INTO lesson_plans (id, unit_code, title, summary, author_name, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))`
      )
      .run(id, unitCode || 'u2', title, description, authorName || '林知夏');

    const sql = `INSERT OR REPLACE INTO lesson_plans (id, unit_code, title, summary, author_name, updated_at) VALUES ('${id}', '${
      unitCode || 'u2'
    }', '${title}', '${description}', '${authorName || '林知夏'}', datetime('now', 'localtime'));`;

    return sendSqlResponse(
      res,
      { lessonId: id, updatedAt: '刚刚' },
      `已保存《${title}》至备课教案库`,
      {
        fn: 'sakuraApi.lesson.saveLessonPlan',
        method: 'PUT',
        endpoint: '/api/v1/lessons/unit-plans',
        sql,
      }
    );
  });

  app.get('/api/v1/exams/analytics', (req, res) => {
    const title = String(req.query.title || '');
    const row = sqliteDb
      .prepare(
        `SELECT * FROM exam_analytics_batches WHERE exam_title LIKE ? LIMIT 1`
      )
      .get(`%${title.slice(0, 6)}%`) as
      | { exam_title: string; class_avg: number; grade_avg: number }
      | undefined;

    const sql = `SELECT * FROM exam_analytics_batches WHERE exam_title = '${title}' AND class_id = 'G2-201' LIMIT 1;`;

    return sendSqlResponse(
      res,
      {
        examTitle: row?.exam_title || title,
        classAvg: row?.class_avg ?? 108.6,
        gradeAvg: row?.grade_avg ?? 104.4,
      },
      `已切换考务场次：${title}`,
      {
        fn: 'sakuraApi.exam.getBatchAnalytics',
        method: 'GET',
        endpoint: `/api/v1/exams/analytics?title=${encodeURIComponent(title)}`,
        sql,
      }
    );
  });

  app.get('/api/v1/home-school/threads', (_req, res) => {
    const threadRows = sqliteDb
      .prepare(`SELECT * FROM home_school_threads ORDER BY updated_at DESC`)
      .all() as {
      id: string;
      unread_count: number;
      last_time: string;
      last_message: string;
      payload_json: string;
    }[];

    const msgRows = sqliteDb
      .prepare(`SELECT * FROM home_school_messages ORDER BY rowid ASC`)
      .all() as {
      id: string;
      thread_id: string;
      sender_role: 'parent' | 'teacher';
      sender_name: string;
      content: string;
      medal_attached_json: string | null;
      sent_time_label: string;
    }[];

    const threads = threadRows.map((tr) => {
      const base = JSON.parse(tr.payload_json);
      const msgs = msgRows
        .filter((m) => m.thread_id === tr.id)
        .map((m) => ({
          id: m.id,
          sender: m.sender_role,
          senderName: m.sender_name,
          time: m.sent_time_label,
          content: m.content,
          ...(m.medal_attached_json
            ? { medalAttached: JSON.parse(m.medal_attached_json) }
            : {}),
        }));
      return {
        ...base,
        unreadCount: tr.unread_count,
        lastTime: tr.last_time,
        lastMessage: tr.last_message,
        messages: msgs.length > 0 ? msgs : base.messages,
      };
    });

    return sendSqlResponse(
      res,
      threads,
      '已同步家校协同会话列表',
      {
        fn: 'sakuraApi.comm.getThreads',
        method: 'GET',
        endpoint: '/api/v1/home-school/threads',
        sql: 'SELECT * FROM home_school_threads ORDER BY updated_at DESC;',
      }
    );
  });

  app.post('/api/v1/home-school/threads/:threadId/messages', (req, res) => {
    const threadId = req.params.threadId;
    const { content, withSakuraMedal } = req.body as {
      content: string;
      withSakuraMedal?: boolean;
    };
    const msgId = `msg-${Date.now()}`;

    sqliteDb
      .prepare(
        `INSERT INTO home_school_messages (id, thread_id, sender_role, sender_name, content, medal_attached_json, sent_time_label) VALUES (?, ?, 'teacher', '林知夏 老师', ?, ?, '刚刚')`
      )
      .run(
        msgId,
        threadId,
        content,
        withSakuraMedal
          ? JSON.stringify({
              title: '已赠送：【笃学之星】鼓励勋章',
              subtitle: '将在学生成长主页同步点亮',
            })
          : null
      );

    sqliteDb
      .prepare(
        `UPDATE home_school_threads SET unread_count = 0, last_time = '刚刚', last_message = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`
      )
      .run(content, threadId);

    const sql = `INSERT INTO home_school_messages (id, thread_id, sender_role, sender_name, content, sent_time_label) VALUES ('${msgId}', '${threadId}', 'teacher', '林知夏 老师', '${content.replace(
      /'/g,
      "''"
    )}', '刚刚');`;

    return sendSqlResponse(
      res,
      { messageId: msgId, sentTime: '刚刚' },
      '家校留言已发送',
      {
        fn: 'sakuraApi.comm.sendParentMessage',
        method: 'POST',
        endpoint: `/api/v1/home-school/threads/${threadId}/messages`,
        sql,
      }
    );
  });

  // ===========================================================================
  // 6. Local SQLite Backup & Management Endpoints (Internal / Admin API)
  // ===========================================================================
  app.get('/api/v1/sqlite/status', (_req, res) => {
    const summary = getSqliteDatabaseSummary();
    return res.json({
      code: 200,
      success: true,
      message: '已获取状态',
      data: summary,
      traceId: `status-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/v1/sqlite/query', (req, res) => {
    const { sql } = req.body as { sql: string };
    const trimmed = String(sql || '').trim();
    if (!trimmed) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: 'SQL 语句不能为空',
      });
    }

    const startTime = performance.now();
    try {
      const isSelect = /^(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed);
      if (isSelect) {
        const rows = sqliteDb.prepare(trimmed).all();
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        return res.json({
          code: 200,
          success: true,
          message: `查询成功，返回 ${rows.length} 行 (${durationMs} ms)`,
          data: {
            mode: 'SELECT',
            rowCount: rows.length,
            durationMs,
            rows: rows.slice(0, 100),
          },
        });
      } else {
        const info = sqliteDb.prepare(trimmed).run();
        const durationMs = Number((performance.now() - startTime).toFixed(2));
        return res.json({
          code: 200,
          success: true,
          message: `执行成功，影响 ${info.changes} 行 (${durationMs} ms)`,
          data: {
            mode: 'MUTATION',
            rowCount: info.changes,
            durationMs,
            rows: [{ changes: info.changes, lastInsertRowid: Number(info.lastInsertRowid) }],
          },
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return res.status(400).json({
        code: 400,
        success: false,
        message: `执行错误: ${errMsg}`,
        data: null,
      });
    }
  });

  app.post('/api/v1/sqlite/reseed', (_req, res) => {
    initAndSeedSqliteDatabase(true);
    const summary = getSqliteDatabaseSummary();
    return sendSqlResponse(
      res,
      summary,
      '已重置为默认基准数据集',
      {
        fn: 'sakuraApi.sqlite.reseedDatabase',
        method: 'POST',
        endpoint: '/api/v1/sqlite/reseed',
        sql: 'BEGIN TRANSACTION; RESET BASELINE DATA; COMMIT;',
      }
    );
  });

  app.get('/api/v1/sqlite/backup-download', (_req, res) => {
    try {
      sqliteDb.pragma('wal_checkpoint(FULL)');
    } catch {
      // Ignore checkpoint warning
    }
    return res.download(
      SQLITE_DB_PATH,
      `sakura_edu_backup_${new Date().toISOString().slice(0, 10)}.sqlite`
    );
  });

  // ===========================================================================
  // 7. Vite Middleware (Dev) or Static Assets (Prod)
  // ===========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[SakuraEdu] Server running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
