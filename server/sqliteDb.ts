import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import {
  migrateDatabase,
  seedBaselineRelationships,
} from "./database/migrations";
import { LEGACY_SCHEMA_SQL } from "./database/legacySchema";
import { hashPassword } from "./passwords";
import {
  INITIAL_SUBMISSIONS,
  PARENT_CHAT_THREADS,
  STUDENT_PROFILES,
} from "../src/data/mockData";

const DATA_DIR = path.resolve(
  process.cwd(),
  process.env.SAKURA_DATA_DIR || "data",
);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const SQLITE_DB_PATH = path.join(DATA_DIR, "sakura_edu.sqlite");

export const sqliteDb = new Database(SQLITE_DB_PATH);
sqliteDb.pragma("journal_mode = WAL");
sqliteDb.pragma("foreign_keys = ON");
// Bound writer contention so the API can respond before the client request times out.
sqliteDb.pragma("busy_timeout = 3000");

export function initAndSeedSqliteDatabase(forceReset = false): void {
  sqliteDb.exec(LEGACY_SCHEMA_SQL);

  // Ensure new user-group default columns exist on existing SQLite files
  const existingCols = sqliteDb
    .prepare("PRAGMA table_info(faculty_users)")
    .all() as { name: string }[];
  const colNames = new Set(existingCols.map((c) => c.name));
  if (!colNames.has("default_tab")) {
    sqliteDb.exec(
      "ALTER TABLE faculty_users ADD COLUMN default_tab TEXT NOT NULL DEFAULT 'homework-center';",
    );
  }
  if (!colNames.has("default_theme")) {
    sqliteDb.exec(
      "ALTER TABLE faculty_users ADD COLUMN default_theme TEXT NOT NULL DEFAULT 'awesome-green';",
    );
  }
  if (!colNames.has("default_class_name")) {
    sqliteDb.exec(
      "ALTER TABLE faculty_users ADD COLUMN default_class_name TEXT NOT NULL DEFAULT '高二(1)班';",
    );
  }
  if (!colNames.has("semester_label")) {
    sqliteDb.exec(
      "ALTER TABLE faculty_users ADD COLUMN semester_label TEXT NOT NULL DEFAULT '2024 春季学期 · 第 12 周';",
    );
  }

  // Existing installations may legitimately have no baseline admin/student.
  // Never interpret a missing demo record as permission to reset business data.
  const existingTables = sqliteDb
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'schema_migrations'",
    )
    .all() as { name: string }[];
  const containsRecords = existingTables.some(
    ({ name }) =>
      (
        sqliteDb.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get() as {
          n: number;
        }
      ).n > 0,
  );
  if (containsRecords && !forceReset) {
    migrateDatabase(sqliteDb, SQLITE_DB_PATH);
    return;
  }

  const seedTx = sqliteDb.transaction(() => {
    // Clear existing rows to guarantee a clean 1-baseline-per-module state
    if (
      sqliteDb
        .prepare(
          "SELECT name FROM sqlite_master WHERE name='class_enrollments'",
        )
        .get()
    ) {
      if (
        sqliteDb
          .prepare("SELECT name FROM sqlite_master WHERE name='auth_sessions'")
          .get()
      )
        sqliteDb.exec("DELETE FROM auth_sessions; DELETE FROM login_attempts;");
      for (const child of [
        "business_notifications",
        "care_messages",
        "care_threads",
        "care_contacts",
        "care_todos",
        "assessment_imports",
        "assessment_marks",
        "assessment_results",
        "assessment_questions",
        "assessment_exams",
        "schedule_changes",
        "schedule_entries",
        "lesson_homework",
      ])
        if (
          sqliteDb
            .prepare("SELECT name FROM sqlite_master WHERE name=?")
            .get(child)
        )
          sqliteDb.exec(`DELETE FROM ${child}`);
      sqliteDb.exec(
        "DELETE FROM class_enrollments; DELETE FROM teaching_assignments; DELETE FROM courses; DELETE FROM academic_terms;",
      );
    }
    const tablesToClear = [
      "business_notifications",
      "sql_audit_logs",
      "security_captchas",
      "care_messages",
      "care_threads",
      "care_contacts",
      "care_todos",
      "home_school_messages",
      "home_school_threads",
      "coaching_journals",
      "assessment_imports",
      "assessment_marks",
      "assessment_results",
      "assessment_questions",
      "assessment_exams",
      "exam_analytics_batches",
      "lesson_homework",
      "lesson_revisions",
      "lesson_plans",
      "homework_history",
      "homework_submissions",
      "homework_assignments",
      "schedule_changes",
      "schedule_entries",
      "course_swap_requests",
      "timetable_schedules",
      "student_profiles",
      "academic_classes",
      "faculty_users",
    ];
    for (const tbl of tablesToClear) {
      if (
        sqliteDb
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          )
          .get(tbl)
      )
        sqliteDb.exec(`DELETE FROM ${tbl};`);
    }

    // 0. 1 Baseline Security Captcha
    sqliteDb
      .prepare(
        `INSERT INTO security_captchas (captcha_id, mode, captcha_mode, question_label, answer_hash, answer_text, svg_markup, verified, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "cap-baseline-01",
        "graphic",
        "graphic",
        "安全验证码",
        "8A2K",
        "8A2K",
        '<svg xmlns="http://www.w3.org/2000/svg" width="132" height="40"><rect width="132" height="40" fill="#ebf5ef"/><text x="66" y="26" text-anchor="middle" fill="#143323" font-family="monospace" font-size="18" font-weight="bold">8A2K</text></svg>',
        1,
        new Date(Date.now() + 3600_000).toISOString(),
      );

    // 1. 1 Baseline Faculty User (Default username: admin, password: admin)
    sqliteDb
      .prepare(
        `INSERT INTO faculty_users (
          id, faculty_code, email, phone, password_hash, full_name, title_role, department,
          default_tab, default_theme, default_class_name, semester_label, dnd_enabled, dnd_start_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "fac-admin",
        "admin",
        "admin@sakura.edu.cn",
        "13800138000",
        hashPassword("admin"),
        "林知夏 老师",
        "高二(3)班班主任 · 语文组",
        "高中语文教研组",
        "homework-center",
        "awesome-green",
        "高二(1)班",
        "2024 春季学期 · 第 12 周",
        1,
        "20:30",
      );

    // 2. 1 Baseline Academic Class
    sqliteDb
      .prepare(
        `INSERT INTO academic_classes (id, class_code, class_name, grade_level, head_teacher_id, student_count, room_location)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "G2-201",
        "2024-G2-01",
        "高二(1)班",
        "高二",
        "fac-admin",
        45,
        "行知楼 301",
      );

    // 3. 1 Baseline Student Profile & 1 Baseline Coaching Journal
    const stu = STUDENT_PROFILES[0];
    sqliteDb
      .prepare(
        `INSERT INTO student_profiles (
          id, student_no, short_no, full_name, avatar_char, avatar_url, class_id,
          role_badge, rank_label, tag_label, badge_type, trend_text, trend_dir,
          daily_status, bio, tag_category,
          radar_classical, radar_modern, radar_writing, radar_poetry, radar_basics, composite_score,
          strength_module, potential_module, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        stu.id,
        stu.studentNo,
        stu.shortNo,
        stu.name,
        stu.avatarChar,
        stu.avatarUrl || null,
        "G2-201",
        stu.role,
        stu.rankBadge,
        stu.badgeText,
        stu.badgeType,
        stu.trendText,
        stu.trendDir,
        stu.dailyStatus,
        stu.bio,
        stu.tagCategory,
        stu.radarScores.classical,
        stu.radarScores.modern,
        stu.radarScores.writing,
        stu.radarScores.poetry,
        stu.radarScores.basics,
        stu.radarScores.overall,
        stu.strengthModule,
        stu.potentialModule,
        JSON.stringify(stu),
      );

    const j = stu.coachingJournals[0];
    sqliteDb
      .prepare(
        `INSERT INTO coaching_journals (id, student_id, student_name, teacher_id, date_title, tag, content, teacher_name, status_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        `${stu.id}-${j.id}`,
        stu.id,
        stu.name,
        "fac-admin",
        j.dateTitle,
        j.tag,
        j.content,
        j.teacher,
        j.statusText || "已下发建议书签",
      );

    // 4. 1 Baseline Homework Assignment & 1 Baseline Submission
    sqliteDb
      .prepare(
        `INSERT INTO homework_assignments (id, title, course_tag, class_id, max_score, submitted_count, total_students, graded_count, avg_score, excellent_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "assign-chibifu-04",
        "《赤壁赋》文言主旨与哲学拓展思考 · 第四课时主观卷",
        "必修下 · 文言核心课",
        "G2-201",
        100,
        1,
        1,
        1,
        98.0,
        100.0,
      );

    const sub = INITIAL_SUBMISSIONS[0];
    sqliteDb
      .prepare(
        `INSERT INTO homework_submissions (
          id, assignment_id, student_id, student_name, class_name,
          total_score, question_score, status, tag_text, status_badge, is_model_essay, stamp_type, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        sub.id,
        "assign-chibifu-04",
        sub.id,
        sub.name,
        sub.className,
        sub.score,
        sub.questionScore,
        sub.status,
        sub.statusBadge,
        sub.statusBadge,
        sub.isModelEssay ? 1 : 0,
        sub.stamp || null,
        JSON.stringify(sub),
      );

    // 5. 1 Baseline Timetable Schedule & 1 Baseline Course Swap Request
    sqliteDb
      .prepare(
        `INSERT INTO timetable_schedules (
          id, semester, week_num, day_of_week, period_id, period_name, time_range,
          teacher_id, class_group, course_title, course_subtitle, room_name, tag_label, card_type
        ) VALUES (?, '2024-SPRING', 12, ?, ?, ?, ?, 'fac-admin', ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "sch-thu-am12",
        3,
        "am-12",
        "上午 1-2 节",
        "08:30 - 10:10",
        "201",
        "高二(1)班 语文",
        "《长恨歌》艺术构思与悲剧美",
        "录播教室 B204",
        "正在进行",
        "active-now",
      );

    sqliteDb
      .prepare(
        `INSERT INTO course_swap_requests (id, applicant_teacher_id, target_teacher_name, source_period_desc, target_period_desc, reason, approval_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "swap-baseline-01",
        "fac-admin",
        "李老师 (英语组)",
        "周五 上午第 3 节 (语文)",
        "周三 上午第 4 节 (高二3班)",
        "参加市级高中语文大单元公开课教研观摩",
        "APPROVED",
      );

    // 6. 1 Baseline Lesson Plan
    sqliteDb
      .prepare(
        `INSERT INTO lesson_plans (id, unit_code, title, summary, category, badge_text, author_name, citation_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "lp-leiyu-01",
        "u2",
        "《雷雨》四幕戏结构深度剖析与话语潜台词",
        "聚焦周朴园与鲁侍萍重逢场景，设计舞台走位复盘与核心潜台词戏剧张力双线探究任务单。",
        "ppt",
        "教研特优 · 45页PPT",
        "林知夏",
        238,
      );

    // 7. 1 Baseline Exam Analytics Batch
    sqliteDb
      .prepare(
        `INSERT INTO exam_analytics_batches (id, exam_title, exam_date, class_id, class_avg, grade_avg, excellent_rate, pass_rate, ai_confidence, core_conclusion, tactical_advice)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "exam-2024-mid",
        "2023-2024学年第二学期 高二年级期中联合大考 (语文)",
        "2024-04-10",
        "G2-201",
        108.6,
        104.4,
        31.1,
        97.8,
        98.4,
        "核心结论：文言断句通假实词为最大阻滞点",
        "未来两周晨读启动《古文观止》选篇精练，每天专项训练 2 道断句与虚词通关题。",
      );

    // 8. 1 Baseline Home-School Thread & Baseline Conversation Group
    const th = PARENT_CHAT_THREADS[0];
    sqliteDb
      .prepare(
        `INSERT INTO home_school_threads (
          id, student_id, student_name, parent_name, class_name,
          role_tag, topic_tag, category, unread_count, last_time, last_message, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        th.id,
        "su-xiaomeng",
        th.studentName,
        th.parentName,
        th.className,
        th.roleTag,
        th.topicTag || "",
        th.category,
        th.unreadCount,
        th.lastTime,
        th.lastMessage,
        JSON.stringify(th),
      );

    const insertMsg = sqliteDb.prepare(
      `INSERT INTO home_school_messages (
        id, thread_id, sender_role, sender_name, content, medal_attached_json, sent_time_label
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const m of th.messages) {
      insertMsg.run(
        `${th.id}-${m.id}`,
        th.id,
        m.sender,
        m.senderName,
        m.content,
        m.medalAttached ? JSON.stringify(m.medalAttached) : null,
        m.time,
      );
    }

    // 9. 1 Baseline Audit Log
    sqliteDb
      .prepare(
        `INSERT INTO sql_audit_logs (trace_id, fn_name, http_method, endpoint, sql_text, rows_affected) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "boot-baseline",
        "initAndSeedSqliteDatabase",
        "INIT",
        "local-seed",
        "Initialized baseline reference dataset (admin/admin + 1 reference item per module)",
        1,
      );
  });

  seedTx();
  migrateDatabase(sqliteDb, SQLITE_DB_PATH);
  seedBaselineRelationships(sqliteDb);
  sqliteDb
    .prepare("UPDATE faculty_users SET role='admin' WHERE id='fac-admin'")
    .run();
}

export function recordSqlAudit(meta: {
  fn: string;
  method: string;
  endpoint: string;
  sql: string;
  rowsAffected?: number;
}): string {
  const traceId = `trace-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  try {
    sqliteDb
      .prepare(
        `INSERT INTO sql_audit_logs (trace_id, fn_name, http_method, endpoint, sql_text, rows_affected) VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        traceId,
        meta.fn,
        meta.method,
        meta.endpoint,
        meta.sql,
        meta.rowsAffected ?? 1,
      );
  } catch {
    // Ignore logging errors
  }
  return traceId;
}

export function getSqliteDatabaseSummary() {
  const tableNames = [
    "academic_terms",
    "auth_sessions",
    "login_attempts",
    "courses",
    "teaching_assignments",
    "class_enrollments",
    "security_captchas",
    "faculty_users",
    "academic_classes",
    "student_profiles",
    "timetable_schedules",
    "schedule_changes",
    "schedule_entries",
    "course_swap_requests",
    "homework_assignments",
    "homework_history",
    "homework_submissions",
    "lesson_homework",
    "lesson_revisions",
    "lesson_plans",
    "assessment_imports",
    "assessment_marks",
    "assessment_results",
    "assessment_questions",
    "assessment_exams",
    "exam_analytics_batches",
    "coaching_journals",
    "home_school_threads",
    "care_messages",
    "care_threads",
    "care_contacts",
    "care_todos",
    "home_school_messages",
    "business_notifications",
    "sql_audit_logs",
  ];

  const tableCounts: Record<string, number> = {};
  for (const tbl of tableNames) {
    try {
      const row = sqliteDb
        .prepare(`SELECT COUNT(*) as cnt FROM ${tbl}`)
        .get() as { cnt: number };
      tableCounts[tbl] = row.cnt;
    } catch {
      tableCounts[tbl] = 0;
    }
  }

  let fileSizeBytes = 0;
  let lastModified = new Date().toISOString();
  try {
    const stat = fs.statSync(SQLITE_DB_PATH);
    fileSizeBytes = stat.size;
    lastModified = stat.mtime.toISOString();
  } catch {
    fileSizeBytes = 0;
  }

  const sqliteVersionRow = sqliteDb
    .prepare("SELECT sqlite_version() AS version")
    .get() as { version: string };

  const fileSizeKB = Number((fileSizeBytes / 1024).toFixed(1));
  const walStat = fs.existsSync(`${SQLITE_DB_PATH}-wal`)
    ? fs.statSync(`${SQLITE_DB_PATH}-wal`)
    : undefined;
  const shmSizeBytes = fs.existsSync(`${SQLITE_DB_PATH}-shm`)
    ? fs.statSync(`${SQLITE_DB_PATH}-shm`).size
    : 0;
  if (walStat && walStat.mtime.toISOString() > lastModified)
    lastModified = walStat.mtime.toISOString();

  return {
    engine: `SQLite ${sqliteVersionRow.version}`,
    dbPath: path
      .relative(process.cwd(), SQLITE_DB_PATH)
      .split(path.sep)
      .join("/"),
    dbFilePath: SQLITE_DB_PATH,
    fileSizeBytes,
    fileSizeKB,
    fileSizeFormatted: `${fileSizeKB} KB`,
    walSizeBytes: walStat?.size || 0,
    shmSizeBytes,
    totalSizeBytes: fileSizeBytes + (walStat?.size || 0) + shmSizeBytes,
    journalMode: String(
      sqliteDb.pragma("journal_mode", { simple: true }),
    ).toUpperCase(),
    lastModified,
    totalTables: tableNames.length,
    tableCounts,
    recentAuditLogs: sqliteDb
      .prepare(
        "SELECT id, trace_id, fn_name, http_method, endpoint, sql_text, created_at FROM sql_audit_logs ORDER BY id DESC LIMIT 25",
      )
      .all(),
  };
}

// Initialize and seed on module load
initAndSeedSqliteDatabase(false);
