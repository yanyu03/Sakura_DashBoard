import {
  ParentChatThread,
  StudentAcademicProfile,
  StudentSubmission,
  WorkspaceTab,
} from './sakura';

/**
 * 标准 RESTful / RPC 统一返回包装器
 */
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  traceId: string;
  timestamp: string;
  sqlExecuted?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 后端服务配置契约 (默认开启本地 SQLite 引擎 + Express 网关，断网/静态环境自动平滑降级)
 */
export interface SakuraBackendConfig {
  baseUrl: string;
  useRemoteBackend: boolean;
  authToken?: string;
  timeoutMs: number;
}

/**
 * 开源 svg-captcha 验证码挑战返回契约
 */
export type CaptchaMode = 'graphic' | 'math' | 'slider';

export interface CaptchaChallengeDTO {
  captchaId: string;
  mode: CaptchaMode;
  svg: string;
  sliderTargetX: number | null;
  demoHint: string;
  expiresAt: string;
  provider: string;
}

/**
 * 本地 SQLite 备件库运行状态与表统计契约
 */
export interface SqliteStatusDTO {
  engine: string;
  dbPath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  journalMode: string;
  lastModified: string;
  totalTables: number;
  tableCounts: Record<string, number>;
  recentAuditLogs: {
    id: number;
    trace_id: string;
    fn_name: string;
    http_method: string;
    endpoint: string;
    sql_text: string;
    created_at: string;
  }[];
}

export interface SqliteQueryResultDTO {
  mode: 'SELECT' | 'MUTATION';
  rowCount?: number;
  rows?: Record<string, unknown>[];
  changes?: number;
  lastInsertRowid?: number | string;
}

/**
 * API 路由端点元数据定义 (供后端网关对接与前端架构蓝图检视)
 */
export interface ApiEndpointSpec {
  id: string;
  module: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  functionName: string;
  summary: string;
  boundTable: string;
  requestSchema: string;
  responseSchema: string;
}

export interface FacultyLoginPayload {
  facultyId: string;
  password?: string;
  captchaId?: string;
  captchaAnswer?: string;
  loginType: 'account' | 'qrcode' | 'phone' | 'sso';
  keepOnline?: boolean;
}

export interface FacultyDefaultProfileDTO {
  teacherId: string;
  facultyCode: string;
  password: string;
  fullName: string;
  titleRole: string;
  department: string;
  defaultTab: WorkspaceTab;
  defaultTheme: 'awesome-green' | 'matcha-bamboo' | 'sakura-classic';
  defaultClassName: string;
  semesterLabel: string;
  dndEnabled: boolean;
  dndStartTime: string;
}

export interface FacultySessionDTO {
  teacherId: string;
  facultyCode: string;
  fullName: string;
  titleRole: string;
  department: string;
  token: string;
  defaultTab: WorkspaceTab;
  defaultTheme?: 'awesome-green' | 'matcha-bamboo' | 'sakura-classic';
  defaultClassName?: string;
  semesterLabel?: string;
  dndEnabled?: boolean;
  dndStartTime?: string;
}

export interface CourseSwapPayload {
  applicantTeacherId: string;
  targetTeacherName: string;
  sourcePeriodDesc: string;
  targetPeriodDesc: string;
  reason: string;
}

export interface GradeSubmissionPayload {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  score: number;
  stamp?: '妙笔生花' | '见解独到' | null;
  brushNote?: string;
}

export interface SaveLessonPlanPayload {
  lessonId?: string;
  unitCode: 'u1' | 'u2' | 'u3';
  title: string;
  description: string;
  authorName: string;
}

export interface SendParentMessagePayload {
  threadId: string;
  content: string;
  withSakuraMedal?: boolean;
}

export const SAKURA_API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: 'security-captcha',
    module: '安全验证码引擎',
    method: 'GET',
    path: '/api/v1/security/captcha',
    functionName: 'sakuraApi.security.generateCaptcha(mode)',
    summary: '基于开源 svg-captcha 生成图形噪点/算术矢量/滑块轨迹验证码并写入本地 SQLite',
    boundTable: 'security_captchas',
    requestSchema: '?mode=graphic|math|slider',
    responseSchema: 'ApiResponse<CaptchaChallengeDTO>',
  },
  {
    id: 'auth-login',
    module: '教师统一认证',
    method: 'POST',
    path: '/api/v1/auth/faculty-login',
    functionName: 'sakuraApi.auth.loginWithCredentials(payload)',
    summary: '核验 SQLite 验证码票据与教师工号凭证，签发 JWT 会话',
    boundTable: 'faculty_users, security_captchas',
    requestSchema: '{ facultyId: string; captchaId?: string; captchaAnswer?: string; loginType: "account"|"qrcode"|"phone" }',
    responseSchema: 'ApiResponse<FacultySessionDTO>',
  },
  {
    id: 'sqlite-status',
    module: '本地SQLite备件库',
    method: 'GET',
    path: '/api/v1/sqlite/status',
    functionName: 'sakuraApi.sqlite.getStatus()',
    summary: '检视纯本地 data/sakura_edu.sqlite 备件文件大小、WAL模式及14张表实时行数',
    boundTable: 'sqlite_master, sql_audit_logs',
    requestSchema: 'None',
    responseSchema: 'ApiResponse<SqliteStatusDTO>',
  },
  {
    id: 'schedule-matrix',
    module: '课表与排课',
    method: 'GET',
    path: '/api/v1/schedules/weekly-matrix',
    functionName: 'sakuraApi.schedule.getWeeklyTimetable(weekNum, filter)',
    summary: '拉取指定教学周排课网格矩阵与教室实时温湿度遥测',
    boundTable: 'timetable_schedules',
    requestSchema: '?semester=2024-SPRING&weekNum=12&viewFilter=my-schedule',
    responseSchema: 'ApiResponse<{ weekNum: number; conflictFree: boolean; rows: TimetableRow[] }>',
  },
  {
    id: 'schedule-swap',
    module: '课表与排课',
    method: 'POST',
    path: '/api/v1/schedules/swap-requests',
    functionName: 'sakuraApi.schedule.submitCourseSwap(payload)',
    summary: '提交调代课申请并持久化至本地 SQLite 调代课审批表',
    boundTable: 'course_swap_requests',
    requestSchema: 'CourseSwapPayload',
    responseSchema: 'ApiResponse<{ requestId: string; approvalStatus: "APPROVED" }>',
  },
  {
    id: 'homework-list',
    module: '作业批改中心',
    method: 'GET',
    path: '/api/v1/homework/submissions',
    functionName: 'sakuraApi.homework.getClassSubmissions(className, status)',
    summary: '从本地 SQLite 查询班级学生答卷列表及AI切片诊断摘要',
    boundTable: 'homework_submissions',
    requestSchema: '?className=高二(1)班&status=all',
    responseSchema: 'ApiResponse<StudentSubmission[]>',
  },
  {
    id: 'homework-grade',
    module: '作业批改中心',
    method: 'PATCH',
    path: '/api/v1/homework/submissions/:id/grade',
    functionName: 'sakuraApi.homework.submitGrade(payload)',
    summary: '保存教师终核分数、红笔批注、樱花鼓励印章并更新 SQLite',
    boundTable: 'homework_submissions',
    requestSchema: 'GradeSubmissionPayload',
    responseSchema: 'ApiResponse<{ submissionId: string; finalScore: number }>',
  },
  {
    id: 'student-panorama',
    module: '学生学情档案',
    method: 'GET',
    path: '/api/v1/students',
    functionName: 'sakuraApi.student.getStudentProfiles(classId, tag)',
    summary: '从本地 SQLite 获取学生 360° 全景学情、五维能力雷达、大考走势与面批手账',
    boundTable: 'student_profiles, coaching_journals',
    requestSchema: '?classId=G2-201&tag=all',
    responseSchema: 'ApiResponse<StudentAcademicProfile[]>',
  },
  {
    id: 'student-journal',
    module: '学生学情档案',
    method: 'POST',
    path: '/api/v1/students/:id/coaching-journals',
    functionName: 'sakuraApi.student.addCoachingJournal(studentId, name, content)',
    summary: '新增教师面批手账备忘录并写入本地 SQLite',
    boundTable: 'coaching_journals',
    requestSchema: '{ studentName: string; content: string }',
    responseSchema: 'ApiResponse<{ journalId: string; dateTitle: string }>',
  },
  {
    id: 'lesson-save',
    module: '备课教案库',
    method: 'PUT',
    path: '/api/v1/lessons/unit-plans',
    functionName: 'sakuraApi.lesson.saveLessonPlan(payload)',
    summary: '创建或更新大单元情境化教案并写入本地 SQLite 备件库',
    boundTable: 'lesson_plans',
    requestSchema: 'SaveLessonPlanPayload',
    responseSchema: 'ApiResponse<{ lessonId: string; updatedAt: string }>',
  },
  {
    id: 'exam-slices',
    module: '考务与成绩分析',
    method: 'GET',
    path: '/api/v1/exams/analytics',
    functionName: 'sakuraApi.exam.getBatchAnalytics(examTitle)',
    summary: '从 SQLite 查询大题得分率切片、分数段正态阶梯及临界/拔尖焦点生矩阵',
    boundTable: 'exam_analytics_batches',
    requestSchema: '?title=2023-2024高二期中联考',
    responseSchema: 'ApiResponse<ExamAnalyticsBatchDTO>',
  },
  {
    id: 'comm-message',
    module: '家校沟通社区',
    method: 'POST',
    path: '/api/v1/home-school/threads/:threadId/messages',
    functionName: 'sakuraApi.comm.sendParentMessage(payload)',
    summary: '发送家校协同私信并持久化至本地 SQLite 消息表',
    boundTable: 'home_school_messages',
    requestSchema: 'SendParentMessagePayload',
    responseSchema: 'ApiResponse<{ messageId: string; sentTime: string }>',
  },
];

export type { StudentSubmission, StudentAcademicProfile, ParentChatThread };
