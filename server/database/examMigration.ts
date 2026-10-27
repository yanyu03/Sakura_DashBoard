import type Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
const sql = `
CREATE TABLE assessment_exams(id TEXT PRIMARY KEY,title TEXT NOT NULL,exam_date TEXT NOT NULL,class_id TEXT NOT NULL REFERENCES academic_classes(id),course_id TEXT NOT NULL REFERENCES courses(id),owner_id TEXT NOT NULL REFERENCES faculty_users(id),max_score REAL NOT NULL CHECK(max_score>0),pass_ratio REAL NOT NULL CHECK(pass_ratio>=0 AND pass_ratio<=1),excellent_ratio REAL NOT NULL CHECK(excellent_ratio>=pass_ratio AND excellent_ratio<=1),roster_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,archived_at TEXT);
CREATE TABLE assessment_questions(id TEXT PRIMARY KEY,exam_id TEXT NOT NULL REFERENCES assessment_exams(id),title TEXT NOT NULL,max_score REAL NOT NULL CHECK(max_score>0),ordinal INTEGER NOT NULL,UNIQUE(exam_id,ordinal));
CREATE TABLE assessment_results(exam_id TEXT NOT NULL REFERENCES assessment_exams(id),student_id TEXT NOT NULL REFERENCES student_profiles(id),status TEXT NOT NULL CHECK(status IN ('scored','absent','ungraded')),PRIMARY KEY(exam_id,student_id));
CREATE TABLE assessment_marks(exam_id TEXT NOT NULL,student_id TEXT NOT NULL,question_id TEXT NOT NULL REFERENCES assessment_questions(id),score REAL NOT NULL CHECK(score>=0),PRIMARY KEY(exam_id,student_id,question_id),FOREIGN KEY(exam_id,student_id) REFERENCES assessment_results(exam_id,student_id));
CREATE TABLE assessment_imports(actor_id TEXT NOT NULL REFERENCES faculty_users(id),request_key TEXT NOT NULL,exam_id TEXT NOT NULL REFERENCES assessment_exams(id),payload_hash TEXT NOT NULL,result_json TEXT NOT NULL,PRIMARY KEY(actor_id,request_key));
`;
export function migrateExams(db: Database.Database, file: string) {
  const checksum = createHash("sha256").update(sql).digest("hex"),
    row = db
      .prepare("SELECT checksum FROM schema_migrations WHERE version=8")
      .get() as { checksum: string } | undefined;
  if (row) {
    if (row.checksum !== checksum)
      throw new Error("Migration 8 checksum mismatch");
    return;
  }
  db.prepare("VACUUM INTO ?").run(
    path.join(
      path.dirname(file),
      "migration-backups",
      `before-v8-${randomUUID()}.sqlite`,
    ),
  );
  db.transaction(() => {
    db.exec(sql);
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(8,?,?)",
    ).run("assessment-scores-and-imports", checksum);
  })();
}
