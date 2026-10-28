import { migrateLessonSchedules } from "./lessonScheduleMigration";
import { migrateIdentityHierarchy } from './identityHierarchyMigration';
import {migrateAuthProtection} from './authProtectionMigration';
import { migrateWorkspace } from "./workspaceMigration";
import { migrateCare } from "./careMigration";
import { migrateExams } from "./examMigration";
import { migrateSchedules } from "./scheduleMigration";
import { migrateLessons } from "./lessonMigration";
import { migrateWorkflow } from "./workflowMigration";
import type Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { hashPassword } from "../passwords";

const relationships: Record<string, [string, string, string][]> = {
  academic_classes: [["head_teacher_id", "faculty_users", "id"]],
  student_profiles: [["class_id", "academic_classes", "id"]],
  timetable_schedules: [["teacher_id", "faculty_users", "id"]],
  course_swap_requests: [["applicant_teacher_id", "faculty_users", "id"]],
  homework_assignments: [["class_id", "academic_classes", "id"]],
  homework_submissions: [
    ["assignment_id", "homework_assignments", "id"],
    ["student_id", "student_profiles", "id"],
  ],
  exam_analytics_batches: [["class_id", "academic_classes", "id"]],
  coaching_journals: [
    ["student_id", "student_profiles", "id"],
    ["teacher_id", "faculty_users", "id"],
  ],
  home_school_threads: [["student_id", "student_profiles", "id"]],
  home_school_messages: [["thread_id", "home_school_threads", "id"]],
};
const checks: Record<string, string[]> = {
  homework_assignments: ["max_score > 0", "total_students >= 0"],
  homework_submissions: [
    "total_score IS NULL OR total_score >= 0",
    "question_score >= 0",
  ],
  home_school_threads: ["unread_count >= 0"],
  timetable_schedules: ["day_of_week BETWEEN 1 AND 7"],
};
const foundationSql = `
CREATE TABLE academic_terms (
  id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  starts_on TEXT NOT NULL, ends_on TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1)), CHECK(starts_on <= ends_on)
);
CREATE TABLE courses (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL);
CREATE TABLE teaching_assignments (
  teacher_id TEXT NOT NULL REFERENCES faculty_users(id),
  class_id TEXT NOT NULL REFERENCES academic_classes(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  term_id TEXT NOT NULL REFERENCES academic_terms(id),
  PRIMARY KEY(teacher_id,class_id,course_id,term_id)
);
CREATE TABLE class_enrollments (
  student_id TEXT NOT NULL REFERENCES student_profiles(id),
  class_id TEXT NOT NULL REFERENCES academic_classes(id),
  term_id TEXT NOT NULL REFERENCES academic_terms(id),
  PRIMARY KEY(student_id,term_id)
);
CREATE INDEX idx_student_class_category ON student_profiles(class_id,tag_category);
CREATE INDEX idx_schedule_teacher_week ON timetable_schedules(teacher_id,semester,week_num,day_of_week,period_id);
CREATE INDEX idx_submission_assignment_status ON homework_submissions(assignment_id,status,submitted_at,id);
CREATE INDEX idx_submission_student ON homework_submissions(student_id);
CREATE INDEX idx_assignment_class ON homework_assignments(class_id);
CREATE INDEX idx_exam_class_date ON exam_analytics_batches(class_id,exam_date);
CREATE INDEX idx_journal_student ON coaching_journals(student_id,created_at);
CREATE INDEX idx_thread_student ON home_school_threads(student_id);
CREATE INDEX idx_message_thread ON home_school_messages(thread_id,created_at,id);
CREATE INDEX idx_teaching_class ON teaching_assignments(class_id,teacher_id);
CREATE INDEX idx_enrollment_class ON class_enrollments(class_id,term_id);
CREATE INDEX idx_audit_trace ON sql_audit_logs(trace_id);
`;
const fingerprint = createHash("sha256")
  .update(JSON.stringify({ relationships, checks, foundationSql }))
  .digest("hex");

function migrateRelationalFoundation(
  db: Database.Database,
  databasePath: string,
): void {
  db.exec(
    `CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, name TEXT NOT NULL, checksum TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))`,
  );
  const existing = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=1")
    .get() as { checksum: string } | undefined;
  if (existing) {
    if (existing.checksum !== fingerprint)
      throw new Error(
        "Migration 1 checksum mismatch; create a new migration instead of modifying applied history.",
      );
    return;
  }
  const violations: { table: string; column: string; count: number }[] = [];
  for (const [table, refs] of Object.entries(relationships))
    for (const [column, parent, key] of refs) {
      const { n } = db
        .prepare(
          `SELECT COUNT(*) AS n FROM ${table} c LEFT JOIN ${parent} p ON c.${column}=p.${key} WHERE c.${column} IS NOT NULL AND p.${key} IS NULL`,
        )
        .get() as { n: number };
      if (n) violations.push({ table, column, count: n });
    }
  for (const [table, rules] of Object.entries(checks))
    for (const rule of rules) {
      const { n } = db
        .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE NOT (${rule})`)
        .get() as { n: number };
      if (n) violations.push({ table, column: rule, count: n });
    }
  if (violations.length)
    throw new Error(
      `Migration blocked; existing data preserved. Repair orphan/invalid rows first: ${JSON.stringify(violations)}`,
    );
  const backupDir = path.join(path.dirname(databasePath), "migration-backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backup = path.join(backupDir, `before-v1-${randomUUID()}.sqlite`);
  db.prepare("VACUUM INTO ?").run(backup);
  // Rebuild atomically; foreign_keys cannot be toggled inside an active transaction.
  db.pragma("foreign_keys = OFF");
  try {
    db.transaction(() => {
      for (const [table, refs] of Object.entries(relationships)) {
        const original = (
          db
            .prepare(
              "SELECT sql FROM sqlite_master WHERE type='table' AND name=?",
            )
            .get(table) as { sql: string }
        ).sql;
        const columns = (
          db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
        )
          .map((c) => `"${c.name}"`)
          .join(",");
        const temporary = `__v1_${table}`;
        const constraints = [
          ...refs.map(
            ([column, parent, key]) =>
              `FOREIGN KEY (${column}) REFERENCES ${parent}(${key}) ON DELETE RESTRICT`,
          ),
          ...(checks[table] || []).map((rule) => `CHECK (${rule})`),
        ];
        const create = original
          .replace(
            /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["`\[]?\w+["`\]]?/i,
            `CREATE TABLE ${temporary}`,
          )
          .replace(/\)\s*$/, `, ${constraints.join(", ")}\n)`);
        db.exec(create);
        db.exec(
          `INSERT INTO ${temporary} (${columns}) SELECT ${columns} FROM ${table}; DROP TABLE ${table}; ALTER TABLE ${temporary} RENAME TO ${table};`,
        );
      }
      db.exec(foundationSql);
      const invalid = db.pragma("foreign_key_check") as unknown[];
      if (invalid.length)
        throw new Error(
          `Foreign-key validation failed: ${JSON.stringify(invalid)}`,
        );
      db.prepare(
        "INSERT INTO schema_migrations(version,name,checksum) VALUES (1,?,?)",
      ).run("relational-foundation", fingerprint);
    })();
  } finally {
    db.pragma("foreign_keys = ON");
  }
}

function migrateAccounts(db: Database.Database, databasePath: string): void {
  const checksum = createHash("sha256")
    .update("v2:roles-admin-teacher,scrypt64,sessions-sha256,login-attempts")
    .digest("hex");
  const existing = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=2")
    .get() as { checksum: string } | undefined;
  if (existing) {
    if (existing.checksum !== checksum)
      throw new Error("Migration 2 checksum mismatch");
    return;
  }
  const backup = path.join(
    path.dirname(databasePath),
    "migration-backups",
    `before-v2-${randomUUID()}.sqlite`,
  );
  db.prepare("VACUUM INTO ?").run(backup);
  db.transaction(() => {
    db.exec(
      "ALTER TABLE faculty_users ADD COLUMN role TEXT NOT NULL DEFAULT 'teacher' CHECK(role IN ('admin','teacher'))",
    );
    for (const row of db
      .prepare("SELECT id,password_hash FROM faculty_users")
      .all() as { id: string; password_hash: string }[]) {
      if (!row.password_hash.startsWith("scrypt$"))
        db.prepare("UPDATE faculty_users SET password_hash=? WHERE id=?").run(
          hashPassword(row.password_hash),
          row.id,
        );
    }
    db.prepare(
      "UPDATE faculty_users SET role='admin' WHERE id='fac-admin'",
    ).run();
    db.exec(`CREATE TABLE auth_sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES faculty_users(id) ON DELETE CASCADE,
      csrf_token TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL
    ); CREATE INDEX idx_sessions_user_expiry ON auth_sessions(user_id,expires_at);
    CREATE TABLE login_attempts(id INTEGER PRIMARY KEY, account TEXT NOT NULL, attempted_at INTEGER NOT NULL, succeeded INTEGER NOT NULL CHECK(succeeded IN (0,1)));
    CREATE INDEX idx_login_account_time ON login_attempts(account,attempted_at);`);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES (2,?,?)",
    ).run("accounts-and-sessions", checksum);
  })();
}

function migrateAcademic(db: Database.Database, databasePath: string): void {
  const checksum = createHash("sha256")
    .update("v3:class-student-archive-and-version")
    .digest("hex");
  const existing = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=3")
    .get() as { checksum: string } | undefined;
  if (existing) {
    if (existing.checksum !== checksum)
      throw new Error("Migration 3 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(databasePath),
      "migration-backups",
      `before-v3-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    for (const table of ["academic_classes", "student_profiles"])
      db.exec(
        `ALTER TABLE ${table} ADD COLUMN archived_at TEXT; ALTER TABLE ${table} ADD COLUMN version INTEGER NOT NULL DEFAULT 1`,
      );
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES (3,?,?)",
    ).run("academic-master-data", checksum);
  })();
}

function migrateThroughAcademic(
  db: Database.Database,
  databasePath: string,
): void {
  migrateRelationalFoundation(db, databasePath);
  migrateAccounts(db, databasePath);
  migrateAcademic(db, databasePath);
  const checksum = createHash("sha256")
    .update("v4:master-record-versions-and-teaching-archive")
    .digest("hex");
  const existing = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=4")
    .get() as { checksum: string } | undefined;
  if (existing) {
    if (existing.checksum !== checksum)
      throw new Error("Migration 4 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(databasePath),
      "migration-backups",
      `before-v4-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    for (const table of ["academic_terms", "courses"])
      db.exec(
        `ALTER TABLE ${table} ADD COLUMN archived_at TEXT; ALTER TABLE ${table} ADD COLUMN version INTEGER NOT NULL DEFAULT 1`,
      );
    db.exec(
      "ALTER TABLE faculty_users ADD COLUMN version INTEGER NOT NULL DEFAULT 1",
    );
    db.exec(`CREATE TABLE teaching_assignments_v4 (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      teacher_id TEXT NOT NULL REFERENCES faculty_users(id), class_id TEXT NOT NULL REFERENCES academic_classes(id),
      course_id TEXT NOT NULL REFERENCES courses(id), term_id TEXT NOT NULL REFERENCES academic_terms(id),
      archived_at TEXT, version INTEGER NOT NULL DEFAULT 1, UNIQUE(teacher_id,class_id,course_id,term_id)
    ); INSERT INTO teaching_assignments_v4(teacher_id,class_id,course_id,term_id) SELECT teacher_id,class_id,course_id,term_id FROM teaching_assignments;
    DROP TABLE teaching_assignments; ALTER TABLE teaching_assignments_v4 RENAME TO teaching_assignments;
    CREATE INDEX idx_teaching_class ON teaching_assignments(class_id,teacher_id);`);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES (4,?,?)",
    ).run("versioned-master-records", checksum);
  })();
}

/** Only the explicit demo seed calls this; real data is never guessed from display labels. */
export function seedBaselineRelationships(db: Database.Database): void {
  db.transaction(() => {
    db.prepare(
      "INSERT OR IGNORE INTO academic_terms(id,code,name,starts_on,ends_on,active) VALUES (?,?,?,?,?,1)",
    ).run(
      "term-2024-spring",
      "2024-SPRING",
      "2024 春季学期",
      "2024-02-01",
      "2024-07-31",
    );
    db.prepare(
      "INSERT OR IGNORE INTO courses(id,code,name) VALUES (?,?,?)",
    ).run("course-chinese", "CHINESE", "语文");
    db.prepare(
      "INSERT OR IGNORE INTO teaching_assignments(teacher_id,class_id,course_id,term_id) SELECT head_teacher_id,id,?,? FROM academic_classes WHERE head_teacher_id IS NOT NULL",
    ).run("course-chinese", "term-2024-spring");
    db.prepare(
      "INSERT OR IGNORE INTO class_enrollments(student_id,class_id,term_id) SELECT id,class_id,? FROM student_profiles",
    ).run("term-2024-spring");
  })();
}

export function migrateDatabase(
  db: Database.Database,
  databasePath: string,
): void {
  migrateThroughAcademic(db, databasePath);
  migrateWorkflow(db, databasePath);
  migrateLessons(db, databasePath);
  migrateSchedules(db, databasePath);
  migrateExams(db, databasePath);
  migrateCare(db, databasePath);
  migrateWorkspace(db, databasePath);
  migrateLessonSchedules(db, databasePath);
  migrateIdentityHierarchy(db, databasePath);
  migrateAuthProtection(db, databasePath);
}
