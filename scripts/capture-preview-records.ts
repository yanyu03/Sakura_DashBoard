import Database from "better-sqlite3";
import fs from "node:fs";
import { createHash } from "node:crypto";
const db = new Database(".local-data/sakura_edu.sqlite", { readonly: true });
const core = [
  "faculty_users",
  "academic_classes",
  "student_profiles",
  "homework_assignments",
  "homework_submissions",
  "lesson_plans",
  "exam_analytics_batches",
  "timetable_schedules",
  "course_swap_requests",
  "coaching_journals",
  "home_school_threads",
  "home_school_messages",
];
const snapshot = Object.fromEntries(
  core.map((table) => [
    table,
    (
      db.prepare(`SELECT id FROM ${table} ORDER BY id`).all() as {
        id: string;
      }[]
    ).map((r) => r.id),
  ]),
);
const digest = createHash("sha256")
  .update(JSON.stringify(snapshot))
  .digest("hex");
if (process.argv.includes("--verify")) {
  const before = JSON.parse(
    fs.readFileSync(".local-data/pre-delivery-records.json", "utf-8"),
  );
  if (before.digest !== digest)
    throw new Error("Original preview record IDs changed");
  const fixtureCount = Object.values(snapshot)
    .flat()
    .filter((id) => id.startsWith("fixture-")).length;
  const migrations = db
    .prepare("SELECT version,name FROM schema_migrations ORDER BY version")
    .all();
  const evidence = {
    checkedAt: new Date().toISOString(),
    originalCoreRecords: Object.values(snapshot).reduce(
      (n, ids) => n + ids.length,
      0,
    ),
    originalIdsPreserved: true,
    fixtureCount,
    migrations,
    integrity: db.pragma("integrity_check", { simple: true }),
    foreignKeyViolations: db.pragma("foreign_key_check"),
    digest,
  };
  fs.writeFileSync(
    "docs/verification/business/preview-upgrade.json",
    JSON.stringify(evidence, null, 2),
  );
  console.log(JSON.stringify(evidence));
} else
  fs.writeFileSync(
    ".local-data/pre-delivery-records.json",
    JSON.stringify({ snapshot, digest }, null, 2),
  );
console.log(
  JSON.stringify({
    tables: core.length,
    totalRecords: Object.values(snapshot).reduce((n, ids) => n + ids.length, 0),
    digest,
  }),
);
db.close();
