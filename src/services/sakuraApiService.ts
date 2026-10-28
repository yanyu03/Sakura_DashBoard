import { INITIAL_SUBMISSIONS, PARENT_CHAT_THREADS, STUDENT_PROFILES } from '../data/mockData';
import {
  ApiResponse,
  CaptchaChallengeDTO,
  CaptchaMode,
  CourseSwapPayload,
  FacultyDefaultProfileDTO,
  FacultyLoginPayload,
  FacultySessionDTO,
  GradeSubmissionPayload,
  SakuraBackendConfig,
  SaveLessonPlanPayload,
  SendParentMessagePayload,
  SqliteQueryResultDTO,
  SqliteStatusDTO,
} from '../types/api';
import {
  ParentChatThread,
  StudentAcademicProfile,
  StudentSubmission,
} from '../types/sakura';

/**
 * SakuraEdu 统一后端接口与本地 SQLite 备件库服务层 (Service & Repository Layer)
 * - 默认开启 useRemoteBackend: true，直连本地 Express + better-sqlite3 (`data/sakura_edu.sqlite`) 纯本地备件库与 `svg-captcha` 开源安全验证码系统。
 * - 真实模式必须取得服务端响应；内存示例只在显式关闭远程模式时使用。
 */
class SakuraApiService {
  constructor(){try{localStorage.removeItem('sakura_default_profile');}catch{/* Node tests have no browser storage. */}}
  private csrfToken='';
  private config: SakuraBackendConfig = {
    baseUrl: '/api/v1',
    useRemoteBackend: true,
    timeoutMs: 8000,
  };

  private callLogs: {
    id: string;
    time: string;
    fn: string;
    method: string;
    endpoint: string;
    sql: string;
    engine?: string;
  }[] = [];

  public configure(nextConfig: Partial<SakuraBackendConfig>): void {
    this.config = { ...this.config, ...nextConfig };
  }

  public getConfig(): Readonly<SakuraBackendConfig> {
    return this.config;
  }

  public getRecentCallLogs() {
    return this.callLogs;
  }

  private recordLog(
    traceId: string,
    meta: { fn: string; method: string; endpoint: string; sql: string; engine?: string }
  ) {
    const timeStr = new Date().toTimeString().slice(0, 8);
    this.callLogs = [
      { id: traceId, time: timeStr, ...meta },
      ...this.callLogs.slice(0, 29),
    ];
  }

  private wrapFallbackResponse<T>(
    data: T,
    message: string,
    meta: { fn: string; method: string; endpoint: string; sql: string }
  ): ApiResponse<T> {
    const now = new Date();
    const traceId = `fallback-${Date.now().toString(36)}`;
    this.recordLog(traceId, { ...meta, engine: 'Memory-Fallback' });
    return {
      code: 200,
      success: true,
      message,
      data,
      traceId,
      timestamp: now.toISOString(),
      sqlExecuted: meta.sql,
    };
  }

  private async requestSqliteApi<T>(
    path: string,
    options: RequestInit,
    meta: { fn: string; method: string; endpoint: string; fallbackSql: string },
    fallbackData: (() => T) | null,
    fallbackMsg: string
  ): Promise<ApiResponse<T>> {
    if (this.config.useRemoteBackend) {
      try {
        const res = await fetch(`${this.config.baseUrl}${path}`, {
          ...options,
          signal: options.signal || AbortSignal.timeout(this.config.timeoutMs),
          headers: {
            'Content-Type': 'application/json',
            ...(this.csrfToken ? {'X-CSRF-Token':this.csrfToken} : {}),
            ...(options.headers || {}),
          },
        });
        const json = (await res.json()) as ApiResponse<T>;
        if (json && typeof json.code === 'number') {
          if(json.code===401&&typeof window!=='undefined'&& !['/auth/default-profile','/auth/faculty-login'].includes(path))window.dispatchEvent(new Event('sakura-session-expired'));
          if(json.data&&typeof json.data==='object'&&'csrfToken' in json.data)this.csrfToken=String(json.data.csrfToken);
          this.recordLog(json.traceId || `sqlite-${Date.now().toString(36)}`, {
            fn: meta.fn,
            method: meta.method,
            endpoint: meta.endpoint,
            sql: json.sqlExecuted || meta.fallbackSql,
            engine: 'SQLite3 (local API)',
          });
          return json;
        }
      } catch {
        // Smooth fallback if offline
      }
    }
    // Runtime requests must never turn transport failure into a successful demo write.
    // Fallback data is available only when a caller explicitly selects memory/demo mode.
    if (fallbackData === null || this.config.useRemoteBackend) {
      return {
        code: 503,
        success: false,
        message: '未获得本地 SQLite 的有效响应，请检查服务后确认操作结果。',
        data: null,
        traceId: `sqlite-unavailable-${Date.now().toString(36)}`,
        timestamp: new Date().toISOString(),
      };
    }
    return this.wrapFallbackResponse(fallbackData(), fallbackMsg, {
      fn: meta.fn,
      method: meta.method,
      endpoint: meta.endpoint,
      sql: meta.fallbackSql,
    });
  }

  // ===========================================================================
  // 0. 开源安全验证码系统 (svg-captcha + SQLite 核销)
  // ===========================================================================
  public security = {
    generateCaptcha: async (
      mode: CaptchaMode = 'graphic'
    ): Promise<ApiResponse<CaptchaChallengeDTO>> => {
      const fallbackCode = mode === 'math' ? '11' : mode === 'slider' ? '168' : '7K9M';
      const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="136" height="42" viewBox="0 0 136 42"><rect width="136" height="42" rx="4" fill="#f1f8f4"/><path d="M8 32 Q65 8 128 28" stroke="#166534" stroke-width="1.5" fill="none" opacity="0.35"/><text x="68" y="27" font-family="monospace" font-size="18" font-weight="bold" fill="#143323" text-anchor="middle">${
        mode === 'math' ? '8 + 3 = ?' : fallbackCode
      }</text></svg>`;

      return this.requestSqliteApi<CaptchaChallengeDTO>(
        `/security/captcha?mode=${mode}`,
        { method: 'GET' },
        {
          fn: 'sakuraApi.security.generateCaptcha',
          method: 'GET',
          endpoint: `/api/v1/security/captcha?mode=${mode}`,
          fallbackSql: `INSERT INTO security_captchas (captcha_id, mode, answer_hash, expires_at) VALUES ('cap-local', '${mode}', '${fallbackCode}', datetime('now', '+5 minutes'));`,
        },
        () => ({
          captchaId: `cap-fallback-${Date.now()}`,
          mode,
          svg: fallbackSvg,
          sliderTargetX: mode === 'slider' ? 168 : null,
          demoHint: fallbackCode,
          expiresAt: new Date(Date.now() + 300_000).toISOString(),
          provider: 'svg-captcha (Open Source Vector Security Engine)',
        }),
        '已生成安全验证码挑战'
      );
    },

    verifyCaptcha: async (
      captchaId: string,
      answer: string,
      mode: CaptchaMode = 'graphic'
    ): Promise<ApiResponse<{ verified: boolean; captchaId: string }>> => {
      return this.requestSqliteApi<{ verified: boolean; captchaId: string }>(
        '/security/captcha/verify',
        {
          method: 'POST',
          body: JSON.stringify({ captchaId, answer, mode }),
        },
        {
          fn: 'sakuraApi.security.verifyCaptcha',
          method: 'POST',
          endpoint: '/api/v1/security/captcha/verify',
          fallbackSql: `UPDATE security_captchas SET verified = 1 WHERE captcha_id = '${captchaId}';`,
        },
        () => ({ verified: true, captchaId }),
        '安全验证码核验通过'
      );
    },
  };

  // ===========================================================================
  // 0.5 纯本地 SQLite 备件库管理与实时 SQL 终端 (sqlite)
  // ===========================================================================
  public sqlite = {
    getStatus: async (): Promise<ApiResponse<SqliteStatusDTO>> => {
      return this.requestSqliteApi<SqliteStatusDTO>(
        '/sqlite/status',
        { method: 'GET' },
        {
          fn: 'sakuraApi.sqlite.getStatus',
          method: 'GET',
          endpoint: '/api/v1/sqlite/status',
          fallbackSql: `SELECT name FROM sqlite_master WHERE type='table';`,
        },
        null,
        '本地 SQLite 备件库运行正常'
      );
    },

    executeQuery: async (sql: string): Promise<ApiResponse<SqliteQueryResultDTO>> => {
      return this.requestSqliteApi<SqliteQueryResultDTO>(
        '/sqlite/query',
        {
          method: 'POST',
          body: JSON.stringify({ sql }),
        },
        {
          fn: 'sakuraApi.sqlite.executeQuery',
          method: 'POST',
          endpoint: '/api/v1/sqlite/query',
          fallbackSql: sql,
        },
        null,
        'SQL 执行完成'
      );
    },

    reseedDatabase: async (): Promise<
      ApiResponse<{ reseeded: boolean; tableCounts: Record<string, number> }>
    > => {
      return this.requestSqliteApi<{ reseeded: boolean; tableCounts: Record<string, number> }>(
        '/sqlite/reseed',
        { method: 'POST' },
        {
          fn: 'sakuraApi.sqlite.reseedDatabase',
          method: 'POST',
          endpoint: '/api/v1/sqlite/reseed',
          fallbackSql: 'BEGIN TRANSACTION; -- Reseed all 14 local SQLite tables; COMMIT;',
        },
        null,
        '本地 SQLite 备件库已一键恢复出厂基准数据'
      );
    },

    getBackupDownloadUrl: (): string => {
      return `${this.config.baseUrl}/sqlite/backup-download`;
    },
  };

  // ===========================================================================
  // 1. 教师统一认证与默认用户组配置模块函数集 (auth)
  // ===========================================================================
  public auth = {
    register: async (payload: {facultyCode:string;email:string;fullName:string;password:string;confirmPassword:string;captchaId:string;captchaAnswer:string}) => this.requestSqliteApi<{facultyCode:string}>('/auth/register', {method:'POST',body:JSON.stringify(payload)}, {fn:'register',method:'POST',endpoint:'/api/v1/auth/register',fallbackSql:''}, null, ''),
    logout: async () => {
      const result=await this.requestSqliteApi<{loggedOut:boolean}>('/auth/logout',{method:'POST'},{fn:'logout',method:'POST',endpoint:'/api/v1/auth/logout',fallbackSql:''},null,'');
      if(result.success)this.csrfToken='';
      return result;
    },
    getDefaultProfile: async (): Promise<ApiResponse<FacultyDefaultProfileDTO>> => {
      const sql = `SELECT * FROM faculty_users WHERE id = 'fac-admin' LIMIT 1;`;
      return this.requestSqliteApi<FacultyDefaultProfileDTO>(
        '/auth/default-profile',
        { method: 'GET' },
        {
          fn: 'sakuraApi.auth.getDefaultProfile',
          method: 'GET',
          endpoint: '/api/v1/auth/default-profile',
          fallbackSql: sql,
        },
        () => {
          return {
            teacherId: 'fac-admin',
            facultyCode: 'admin',
            password: '',
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
        },
        '已加载默认登录与用户组基准配置'
      );
    },

    saveDefaultProfile: async (
      payload: Partial<FacultyDefaultProfileDTO>
    ): Promise<ApiResponse<FacultyDefaultProfileDTO>> => {
      const sql = `UPDATE faculty_users SET faculty_code = '${payload.facultyCode || 'admin'}', full_name = '${payload.fullName || '林知夏 老师'}', title_role = '${payload.titleRole || ''}', department = '${payload.department || ''}', default_tab = '${payload.defaultTab || 'homework-center'}', default_theme = '${payload.defaultTheme || 'awesome-green'}' WHERE id = 'fac-admin';`;
      return this.requestSqliteApi<FacultyDefaultProfileDTO>(
        '/auth/default-profile',
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
        {
          fn: 'sakuraApi.auth.saveDefaultProfile',
          method: 'PUT',
          endpoint: '/api/v1/auth/default-profile',
          fallbackSql: sql,
        },
        () => ({
          teacherId: 'fac-admin',
          facultyCode: payload.facultyCode || 'admin',
          password: '',
          fullName: payload.fullName || '林知夏 老师',
          titleRole: payload.titleRole || '高二(3)班班主任 · 语文组',
          department: payload.department || '高中语文教研组',
          defaultTab: payload.defaultTab || 'homework-center',
          defaultTheme: payload.defaultTheme || 'awesome-green',
          defaultClassName: payload.defaultClassName || '高二(1)班',
          semesterLabel: payload.semesterLabel || '2024 春季学期 · 第 12 周',
          dndEnabled: payload.dndEnabled ?? true,
          dndStartTime: payload.dndStartTime || '20:30',
        }),
        '已更新默认信息并覆盖用户组默认值，下次登录将以此为准'
      );
    },

    loginWithCredentials: async (
      payload: FacultyLoginPayload
    ): Promise<ApiResponse<FacultySessionDTO>> => {
      const sql = `SELECT id, faculty_code, full_name, title_role, department FROM faculty_users WHERE (faculty_code = '${payload.facultyId}' OR email = '${payload.facultyId}') AND status = 'ACTIVE' LIMIT 1;`;
      return this.requestSqliteApi<FacultySessionDTO>(
        '/auth/faculty-login',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        {
          fn: 'sakuraApi.auth.loginWithCredentials',
          method: 'POST',
          endpoint: '/api/v1/auth/faculty-login',
          fallbackSql: sql,
        },
        () => ({
          teacherId: 'fac-admin',
          facultyCode: payload.facultyId || 'admin',
          fullName: '林知夏 老师',
          titleRole: '高二(3)班班主任 · 语文组',
          department: '高中语文教研组',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sakura_v4_2',
          defaultTab: 'homework-center',
          defaultTheme: 'awesome-green',
          defaultClassName: '高二(1)班',
          semesterLabel: '2024 春季学期 · 第 12 周',
          dndEnabled: true,
          dndStartTime: '20:30',
        }),
        '欢迎回来，身份认证已通过'
      );
    },

    checkTerminalEnvironment: async (): Promise<
      ApiResponse<{
        gatewayLatencyMs: number;
        ocrDriverVersion: string;
        caValid: boolean;
        sqliteBackupReady?: boolean;
        sqliteSize?: string;
        captchaEngine?: string;
      }>
    > => {
      const sql = `SELECT COUNT(*) AS tables_ready FROM sqlite_master WHERE type='table';`;
      return this.requestSqliteApi(
        '/auth/env-check',
        { method: 'GET' },
        {
          fn: 'sakuraApi.auth.checkTerminalEnvironment',
          method: 'GET',
          endpoint: '/api/v1/auth/env-check',
          fallbackSql: sql,
        },
        () => ({
          gatewayLatencyMs: 6,
          ocrDriverVersion: 'v4.2',
          caValid: true,
        }),
        '终端环境自检通过'
      );
    },
  };

  public business = {
    request: async (resource:string,method='GET',payload?:Record<string,unknown>) => this.requestSqliteApi<any>(resource,{method,...(payload?{body:JSON.stringify(payload)}:{})},{fn:'business.request',method,endpoint:`/api/v1${resource}`,fallbackSql:''},null,''),
  };

  public academic = {
    list: async (resource:string,query='') => this.requestSqliteApi<any>(`/academic/${resource}${query?`?${query}`:''}`,{method:'GET'},{fn:'academic.list',method:'GET',endpoint:`/api/v1/academic/${resource}`,fallbackSql:''},null,''),
    save: async (resource:string,payload:Record<string,unknown>,id?:string) => this.requestSqliteApi<any>(`/academic/${resource}${id?`/${encodeURIComponent(id)}`:''}`,{method:id?'PATCH':'POST',body:JSON.stringify(payload)},{fn:'academic.save',method:id?'PATCH':'POST',endpoint:`/api/v1/academic/${resource}`,fallbackSql:''},null,''),
  };

  // ===========================================================================
  // 2. 课表与排课管理模块函数集 (schedule)
  // ===========================================================================
  public schedule = {
    getWeeklyTimetable: async (
      weekNum: number,
      viewFilter: string
    ): Promise<ApiResponse<{ weekNum: number; viewFilter: string; conflictFree: boolean }>> => {
      const sql = `SELECT * FROM timetable_schedules WHERE teacher_id = 'fac-lin-zhixia' AND semester = '2024-SPRING' AND week_num = ${weekNum} ORDER BY period_id, day_of_week;`;
      return this.requestSqliteApi(
        `/schedules/weekly-matrix?weekNum=${weekNum}&filter=${encodeURIComponent(viewFilter)}`,
        { method: 'GET' },
        {
          fn: 'sakuraApi.schedule.getWeeklyTimetable',
          method: 'GET',
          endpoint: `/api/v1/schedules/weekly-matrix?weekNum=${weekNum}&filter=${viewFilter}`,
          fallbackSql: sql,
        },
        () => ({ weekNum, viewFilter, conflictFree: true }),
        `已加载第 ${weekNum} 周排课表 (${viewFilter})`
      );
    },

    submitCourseSwap: async (
      payload: CourseSwapPayload
    ): Promise<ApiResponse<{ requestId: string; approvalStatus: string }>> => {
      const sql = `INSERT INTO course_swap_requests (id, applicant_teacher_id, target_teacher_name, source_period_desc, target_period_desc, reason, approval_status) VALUES ('swap-${Date.now()}', '${payload.applicantTeacherId}', '${payload.targetTeacherName}', '${payload.sourcePeriodDesc}', '${payload.targetPeriodDesc}', '${payload.reason}', 'APPROVED');`;
      return this.requestSqliteApi(
        '/schedules/swap-requests',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        {
          fn: 'sakuraApi.schedule.submitCourseSwap',
          method: 'POST',
          endpoint: '/api/v1/schedules/swap-requests',
          fallbackSql: sql,
        },
        () => ({ requestId: `swap-${Date.now()}`, approvalStatus: 'APPROVED' }),
        '已提交调代课申请并同步课表'
      );
    },

    syncCalendarToDevice: async (
      weekNum: number
    ): Promise<ApiResponse<{ syncedEvents: number }>> => {
      const sql = `SELECT course_title, time_range, room_name FROM timetable_schedules WHERE teacher_id = 'fac-lin-zhixia' AND week_num = ${weekNum};`;
      return this.requestSqliteApi(
        '/schedules/sync-caldav',
        {
          method: 'POST',
          body: JSON.stringify({ weekNum }),
        },
        {
          fn: 'sakuraApi.schedule.syncCalendarToDevice',
          method: 'POST',
          endpoint: '/api/v1/schedules/sync-caldav',
          fallbackSql: sql,
        },
        () => ({ syncedEvents: 1 }),
        `已将第 ${weekNum} 周任教日程同步至移动日历`
      );
    },
  };

  // ===========================================================================
  // 3. 作业批改中心模块函数集 (homework)
  // ===========================================================================
  public homework = {
    getClassSubmissions: async (
      className: string,
      statusFilter: string
    ): Promise<ApiResponse<StudentSubmission[]>> => {
      const sql = `SELECT * FROM homework_submissions WHERE assignment_id = 'assign-chibifu-04' AND ('${statusFilter}' = 'all' OR status = '${statusFilter}') ORDER BY submitted_at DESC;`;
      return this.requestSqliteApi<StudentSubmission[]>(
        `/homework/submissions?className=${encodeURIComponent(className)}&status=${statusFilter}`,
        { method: 'GET' },
        {
          fn: 'sakuraApi.homework.getClassSubmissions',
          method: 'GET',
          endpoint: `/api/v1/homework/submissions?className=${encodeURIComponent(className)}&status=${statusFilter}`,
          fallbackSql: sql,
        },
        () => INITIAL_SUBMISSIONS,
        `已加载 ${className} 作业批阅池`
      );
    },

    submitGrade: async (
      payload: GradeSubmissionPayload
    ): Promise<ApiResponse<{ submissionId: string; finalScore: number }>> => {
      const sql = `UPDATE homework_submissions SET total_score = ${payload.score}, status = 'graded', graded_at = CURRENT_TIMESTAMP WHERE id = '${payload.submissionId}';`;
      return this.requestSqliteApi(
        `/homework/submissions/${payload.submissionId}/grade`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
        {
          fn: 'sakuraApi.homework.submitGrade',
          method: 'PATCH',
          endpoint: `/api/v1/homework/submissions/${payload.submissionId}/grade`,
          fallbackSql: sql,
        },
        () => ({ submissionId: payload.submissionId, finalScore: payload.score }),
        `分数 (${payload.score}分) 已保存归档`
      );
    },

    applySakuraStamp: async (
      submissionId: string,
      studentName: string,
      stamp: '妙笔生花' | '见解独到' | null
    ): Promise<ApiResponse<{ stamp: string | null }>> => {
      const sql = `UPDATE homework_submissions SET stamp_type = ${
        stamp ? `'${stamp}'` : 'NULL'
      } WHERE id = '${submissionId}';`;
      return this.requestSqliteApi(
        `/homework/submissions/${submissionId}/stamp`,
        {
          method: 'PATCH',
          body: JSON.stringify({ studentName, stamp }),
        },
        {
          fn: 'sakuraApi.homework.applySakuraStamp',
          method: 'PATCH',
          endpoint: `/api/v1/homework/submissions/${submissionId}/stamp`,
          fallbackSql: sql,
        },
        () => ({ stamp }),
        stamp
          ? `已为 ${studentName} 的答卷加盖「${stamp}」印章`
          : `已移除 ${studentName} 答卷上的印章`
      );
    },
  };

  // ===========================================================================
  // 4. 学生学情档案模块函数集 (student)
  // ===========================================================================
  public student = {
    getStudentProfiles: async (
      classId = 'G2-201',
      tagCategory = 'all'
    ): Promise<ApiResponse<StudentAcademicProfile[]>> => {
      const sql = `SELECT * FROM student_profiles WHERE class_id = '${classId}' ${
        tagCategory !== 'all' ? `AND tag_category = '${tagCategory}'` : ''
      } ORDER BY student_no ASC;`;
      return this.requestSqliteApi<StudentAcademicProfile[]>(
        `/students?classId=${encodeURIComponent(classId)}&tag=${encodeURIComponent(tagCategory)}`,
        { method: 'GET' },
        {
          fn: 'sakuraApi.student.getStudentProfiles',
          method: 'GET',
          endpoint: `/api/v1/students?classId=${classId}&tag=${tagCategory}`,
          fallbackSql: sql,
        },
        () => STUDENT_PROFILES,
        '已获取班级学生五维全景档案'
      );
    },

    addCoachingJournal: async (
      studentId: string,
      studentName: string,
      content: string
    ): Promise<ApiResponse<{ journalId: string; dateTitle: string }>> => {
      const journalId = `j-${Date.now()}`;
      const sql = `INSERT INTO coaching_journals (id, student_id, teacher_id, date_title, tag, content) VALUES ('${journalId}', '${studentId}', 'fac-lin-zhixia', '5月16日 · 随堂面批手账', '最新批注', '${content.replace(
        /'/g,
        "''"
      )}');`;
      return this.requestSqliteApi(
        `/students/${studentId}/coaching-journals`,
        {
          method: 'POST',
          body: JSON.stringify({ studentName, content }),
        },
        {
          fn: 'sakuraApi.student.addCoachingJournal',
          method: 'POST',
          endpoint: `/api/v1/students/${studentId}/coaching-journals`,
          fallbackSql: sql,
        },
        () => ({ journalId, dateTitle: '5月16日 · 随堂面批手账' }),
        `已为 ${studentName} 添加面批手账记录`
      );
    },
  };

  // ===========================================================================
  // 5. 备课教案库模块函数集 (lesson)
  // ===========================================================================
  public lesson = {
    getLessonPlans: async (): Promise<
      ApiResponse<
        {
          id: string;
          unitCode: string;
          title: string;
          summary: string;
          authorName: string;
          badgeText: string;
          slidesCount: number;
          citationCount: number;
          tags: string[];
          updatedAt: string;
        }[]
      >
    > => {
      const sql = `SELECT * FROM lesson_plans ORDER BY updated_at DESC;`;
      return this.requestSqliteApi(
        '/lessons/unit-plans',
        { method: 'GET' },
        {
          fn: 'sakuraApi.lesson.getLessonPlans',
          method: 'GET',
          endpoint: '/api/v1/lessons/unit-plans',
          fallbackSql: sql,
        },
        () => [
          {
            id: 'lp-leiyu-01',
            unitCode: 'u2',
            title: '《雷雨》四幕戏结构深度剖析与话语潜台词',
            summary:
              '聚焦周朴园与鲁侍萍重逢场景，设计“舞台走位复盘”与“核心潜台词戏剧张力”双线探究任务单，融入微课情境演练。',
            authorName: '林知夏',
            badgeText: '樱花教研特优',
            slidesCount: 45,
            citationCount: 238,
            tags: ['# 核心素养·审美鉴赏', '# 任务驱动型导学', '基准示范教案'],
            updatedAt: '基准教案',
          },
        ],
        '已同步备课教案列表'
      );
    },

    saveLessonPlan: async (
      payload: SaveLessonPlanPayload
    ): Promise<ApiResponse<{ lessonId: string; updatedAt: string }>> => {
      const lessonId = payload.lessonId || `lp-${Date.now()}`;
      const sql = `INSERT INTO lesson_plans (id, unit_code, title, summary, author_name, updated_at) VALUES ('${lessonId}', '${payload.unitCode}', '${payload.title}', '${payload.description}', '${payload.authorName}', CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET title = excluded.title, summary = excluded.summary, updated_at = CURRENT_TIMESTAMP;`;
      return this.requestSqliteApi(
        '/lessons/unit-plans',
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
        {
          fn: 'sakuraApi.lesson.saveLessonPlan',
          method: 'PUT',
          endpoint: '/api/v1/lessons/unit-plans',
          fallbackSql: sql,
        },
        () => ({ lessonId, updatedAt: '刚刚' }),
        `已保存《${payload.title}》并同步备课组`
      );
    },
  };

  // ===========================================================================
  // 6. 考务与成绩分析模块函数集 (exam)
  // ===========================================================================
  public exam = {
    getBatchAnalytics: async (
      examTitle: string
    ): Promise<ApiResponse<{ examTitle: string; classAvg: number; gradeAvg: number }>> => {
      const sql = `SELECT * FROM exam_analytics_batches WHERE exam_title = '${examTitle}' AND class_id = 'G2-201' LIMIT 1;`;
      return this.requestSqliteApi(
        `/exams/analytics?title=${encodeURIComponent(examTitle)}`,
        { method: 'GET' },
        {
          fn: 'sakuraApi.exam.getBatchAnalytics',
          method: 'GET',
          endpoint: `/api/v1/exams/analytics?title=${encodeURIComponent(examTitle)}`,
          fallbackSql: sql,
        },
        () => ({ examTitle, classAvg: 108.6, gradeAvg: 104.4 }),
        `已切换考务场次：${examTitle}`
      );
    },
  };

  // ===========================================================================
  // 7. 家校沟通社区模块函数集 (comm)
  // ===========================================================================
  public comm = {
    getThreads: async (): Promise<ApiResponse<ParentChatThread[]>> => {
      const sql = `SELECT * FROM home_school_threads WHERE class_name = '高二(1)班' ORDER BY updated_at DESC;`;
      return this.requestSqliteApi<ParentChatThread[]>(
        '/home-school/threads',
        { method: 'GET' },
        {
          fn: 'sakuraApi.comm.getThreads',
          method: 'GET',
          endpoint: '/api/v1/home-school/threads',
          fallbackSql: sql,
        },
        () => PARENT_CHAT_THREADS,
        '已同步家校协同会话列表'
      );
    },

    sendParentMessage: async (
      payload: SendParentMessagePayload
    ): Promise<ApiResponse<{ messageId: string; sentTime: string }>> => {
      const msgId = `msg-${Date.now()}`;
      const sql = `INSERT INTO home_school_messages (id, thread_id, sender_role, sender_name, content, medal_attached_json, sent_time_label) VALUES ('${msgId}', '${payload.threadId}', 'teacher', '林知夏 老师', '${payload.content.replace(
        /'/g,
        "''"
      )}', ${payload.withSakuraMedal ? `'{"badge":"樱花飞扬"}'` : 'NULL'}, '刚刚');`;
      return this.requestSqliteApi(
        `/home-school/threads/${payload.threadId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        {
          fn: 'sakuraApi.comm.sendParentMessage',
          method: 'POST',
          endpoint: `/api/v1/home-school/threads/${payload.threadId}/messages`,
          fallbackSql: sql,
        },
        () => ({ messageId: msgId, sentTime: '刚刚' }),
        '家校协同消息已加密送达'
      );
    },
  };
}

export const sakuraApi = new SakuraApiService();

