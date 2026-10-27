import {
  ParentChatThread,
  StudentAcademicProfile,
  StudentSubmission,
  WorkspaceTab,
} from "./sakura";
import type { UiThemeId } from "../data/awesomeDesignTheme";

/**
 * 标准 RESTful / RPC 统一返回包装器
 */
export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T | null;
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
export type CaptchaMode = "graphic" | "math" | "slider";

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
  walSizeBytes?: number;
  shmSizeBytes?: number;
  totalSizeBytes?: number;
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
  mode: "SELECT" | "MUTATION";
  returnsRows?: boolean;
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
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
  loginType: "account" | "qrcode" | "phone" | "sso";
  keepOnline?: boolean;
}

export interface FacultyDefaultProfileDTO {
  demoMode?: boolean;
  role?: "admin" | "teacher";
  teacherId: string;
  facultyCode: string;
  password?: string;
  fullName: string;
  titleRole: string;
  department: string;
  defaultTab: WorkspaceTab;
  defaultTheme: UiThemeId;
  defaultClassName: string;
  semesterLabel: string;
  dndEnabled: boolean;
  dndStartTime: string;
}

export interface FacultySessionDTO {
  demoMode?: boolean;
  role?: "admin" | "teacher";
  csrfToken?: string;
  teacherId: string;
  facultyCode: string;
  fullName: string;
  titleRole: string;
  department: string;
  token: string;
  defaultTab: WorkspaceTab;
  defaultTheme?: UiThemeId;
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
  stamp?: "妙笔生花" | "见解独到" | null;
  brushNote?: string;
}

export interface SaveLessonPlanPayload {
  lessonId?: string;
  unitCode: "u1" | "u2" | "u3";
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
  [
    "auth-login",
    "教师认证",
    "POST",
    "/api/v1/auth/faculty-login",
    "核验密码与一次性验证码；签发可撤销的 HttpOnly 会话",
    "faculty_users,auth_sessions",
    "facultyId,password,captchaId,captchaAnswer",
  ],
  [
    "academic",
    "基础资料",
    "GET",
    "/api/v1/academic/students",
    "按任教范围搜索分页；新建与版本化编辑另有 POST/PATCH 端点",
    "student_profiles,class_enrollments",
    "classId,q,page,pageSize",
  ],
  [
    "homework",
    "作业批阅",
    "POST",
    "/api/v1/homework/assignments",
    "创建草稿；发布时锁定名单",
    "homework_assignments",
    "class_id,title,max_score,instructions,due_at?",
  ],
  [
    "grade",
    "作业批阅",
    "PATCH",
    "/api/v1/homework/submissions/:id/grade",
    "版本校验后保存分数、批注与印章；同时保留历史",
    "homework_submissions,homework_history",
    "version,score,feedback?,stampType?",
  ],
  [
    "lessons",
    "教案库",
    "POST",
    "/api/v1/lessons/plans",
    "保存文本教案与作者；PATCH 编辑时校验 version",
    "lesson_plans,lesson_revisions",
    "title,body,tags,visibility",
  ],
  [
    "schedule",
    "课表",
    "GET",
    "/api/v1/schedules/entries",
    "按具体日期读取真实课时；管理员 POST 建立课时",
    "schedule_entries",
    "from,to（结束日不含）",
  ],
  [
    "schedule-approve",
    "调代课",
    "PATCH",
    "/api/v1/schedules/changes/:id",
    "审批时再次校验教师、班级、教室冲突；申请人不能自批",
    "schedule_changes,schedule_entries",
    "version,status,review_note?",
  ],
  [
    "exam-preview",
    "考试成绩",
    "POST",
    "/api/v1/exams/batches/:id/import-preview",
    "校验名册、状态和逐题分数，不写入成绩",
    "assessment_exams,assessment_questions",
    "version,rows",
  ],
  [
    "exam-import",
    "考试成绩",
    "POST",
    "/api/v1/exams/batches/:id/import",
    "预览校验后事务导入；同一请求标识不重复写入",
    "assessment_results,assessment_marks,assessment_imports",
    "version,rows,previewHash,request_key",
  ],
  [
    "care",
    "家校记录",
    "POST",
    "/api/v1/care/threads/:id/messages",
    "保存站内记录或待发送内容；未连接外部投递",
    "care_messages,care_threads",
    "content,kind,request_key",
  ],
  [
    "overview",
    "工作台",
    "GET",
    "/api/v1/workspace/overview",
    "读取权限内的实际待批、名单、课表、关怀与未读记录",
    "业务规范表",
    "None",
  ],
  [
    "search",
    "全局搜索",
    "GET",
    "/api/v1/workspace/search",
    "查询学生、作业、教案和考试并返回资源 ID",
    "业务规范表",
    "q",
  ],
  [
    "sqlite-status",
    "SQLite 管理",
    "GET",
    "/api/v1/sqlite/status",
    "仅管理员；返回实际路径、WAL 状态与应用表计数",
    "sqlite_master",
    "None",
  ],
  [
    "sqlite-backup",
    "SQLite 管理",
    "GET",
    "/api/v1/sqlite/backup-download",
    "仅管理员；在线快照包含已提交的 WAL 数据",
    "SQLite backup API",
    "None",
  ],
].map(([id, module, method, path, summary, boundTable, requestSchema]) => ({
  id,
  module,
  method: method as ApiEndpointSpec["method"],
  path,
  functionName: "sakuraApi.business.request / auth / sqlite",
  summary,
  boundTable,
  requestSchema,
  responseSchema: "ApiResponse<T>（失败含 traceId）",
}));
