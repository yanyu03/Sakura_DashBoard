import { createHash } from "node:crypto";
import type { DatabaseConnection } from "../dbContract";

const statements = [
  `CREATE TABLE schedule_entry_scopes(entry_id TEXT PRIMARY KEY REFERENCES schedule_entries(id),unit_id TEXT NOT NULL REFERENCES organization_units(id),shared_by TEXT NOT NULL REFERENCES faculty_users(id))`,
  `CREATE INDEX schedule_scope_unit ON schedule_entry_scopes(unit_id)`,
  `CREATE TABLE schedule_submissions(
    id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES faculty_users(id),unit_id TEXT REFERENCES organization_units(id),
    class_id TEXT NOT NULL REFERENCES academic_classes(id),course_id TEXT NOT NULL REFERENCES courses(id),
    starts_at TEXT NOT NULL,ends_at TEXT NOT NULL,room TEXT NOT NULL,note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','approved','rejected','withdrawn')),
    reviewer_id TEXT REFERENCES faculty_users(id),review_note TEXT NOT NULL DEFAULT '',entry_id TEXT UNIQUE REFERENCES schedule_entries(id),
    shared INTEGER NOT NULL DEFAULT 1 CHECK(shared IN (0,1)),
    version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,
    CHECK(starts_at<ends_at),CHECK(status='draft' OR unit_id IS NOT NULL))`,
  `CREATE INDEX schedule_submission_owner ON schedule_submissions(owner_id,starts_at)`,
  `CREATE INDEX schedule_submission_unit ON schedule_submissions(unit_id,status,starts_at)`,
];
const checksum = createHash("sha256")
  .update(JSON.stringify(statements))
  .digest("hex");
export function applyScheduleSharing(db: DatabaseConnection) {
  const prior = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=14")
    .get() as { checksum: string } | undefined;
  if (prior) {
    if (prior.checksum !== checksum)
      throw new Error("Migration 14 checksum mismatch");
    return;
  }
  db.transaction(() => {
    for (const statement of statements) db.prepare(statement).run();
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(14,?,?)",
    ).run("department-schedule-submissions", checksum);
  })();
}
