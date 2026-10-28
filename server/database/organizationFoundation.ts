import { createHash, randomUUID } from "node:crypto";
import type { DatabaseConnection } from "../dbContract";

export const organizationTypes = [
  ["school", "学校", "school"],
  ["campus", "校区", "campus"],
  ["party_committee", "校党委", "division"],
  ["academic_affairs", "教务处", "division"],
  ["grade_department", "年级部", "division"],
  ["grade_office", "年级办公室", "grade"],
  ["homeroom", "行政班", "class"],
  ["subject_group", "学科组 / 教研室", "department"],
  ["division", "通用处室", "division"],
  ["department", "通用部门", "department"],
  ["grade", "原年级单位", "grade"],
  ["class", "原班级单位", "class"],
  ["group", "工作小组", "group"],
] as const;
const parentRules = [
  ["school", "campus"],
  ["school", "party_committee"],
  ["campus", "party_committee"],
  ["party_committee", "academic_affairs"],
  ["school", "academic_affairs"],
  ["campus", "academic_affairs"],
  ["academic_affairs", "grade_department"],
  ["grade_department", "grade_office"],
  ["grade_office", "homeroom"],
  ["grade_department", "subject_group"],
  ["academic_affairs", "subject_group"],
  ...[
    "school",
    "campus",
    "division",
    "party_committee",
    "academic_affairs",
    "grade_department",
  ].flatMap((p) => ["division", "department", "grade"].map((c) => [p, c])),
  ["grade", "class"],
  ["department", "group"],
  ["class", "group"],
  ["subject_group", "group"],
  ["homeroom", "group"],
];
const statements = [
  `CREATE TABLE school_people(id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),display_name TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','archived')),UNIQUE(id,institution_id))`,
  `CREATE TABLE person_account_links(institution_id TEXT NOT NULL,person_id TEXT NOT NULL,account_id TEXT NOT NULL REFERENCES faculty_users(id),PRIMARY KEY(institution_id,account_id),FOREIGN KEY(person_id,institution_id) REFERENCES school_people(id,institution_id))`,
  `CREATE TABLE identity_person_links(identity_id TEXT PRIMARY KEY,institution_id TEXT NOT NULL,person_id TEXT NOT NULL,FOREIGN KEY(identity_id,institution_id) REFERENCES identity_registry(id,institution_id),FOREIGN KEY(person_id,institution_id) REFERENCES school_people(id,institution_id))`,
  `CREATE TABLE organization_unit_types(code TEXT PRIMARY KEY,label TEXT NOT NULL,structural_kind TEXT NOT NULL)`,
  `CREATE TABLE organization_parent_rules(parent_type TEXT NOT NULL REFERENCES organization_unit_types(code),child_type TEXT NOT NULL REFERENCES organization_unit_types(code),PRIMARY KEY(parent_type,child_type))`,
  `CREATE TABLE school_subjects(id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),code TEXT NOT NULL,name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),UNIQUE(id,institution_id),UNIQUE(institution_id,code))`,
  `CREATE TABLE subject_courses(institution_id TEXT NOT NULL,subject_id TEXT NOT NULL,course_id TEXT NOT NULL REFERENCES courses(id),PRIMARY KEY(subject_id,course_id),UNIQUE(subject_id,institution_id,course_id),FOREIGN KEY(subject_id,institution_id) REFERENCES school_subjects(id,institution_id))`,
  `CREATE TABLE organization_unit_profiles(unit_id TEXT PRIMARY KEY,institution_id TEXT NOT NULL,unit_type TEXT NOT NULL REFERENCES organization_unit_types(code),subject_id TEXT,UNIQUE(unit_id,institution_id),FOREIGN KEY(unit_id,institution_id) REFERENCES organization_units(id,institution_id),FOREIGN KEY(subject_id,institution_id) REFERENCES school_subjects(id,institution_id),CHECK((unit_type='subject_group' AND subject_id IS NOT NULL) OR (unit_type<>'subject_group' AND subject_id IS NULL)))`,
  `CREATE TABLE organization_class_links(class_id TEXT PRIMARY KEY REFERENCES academic_classes(id),institution_id TEXT NOT NULL,unit_id TEXT NOT NULL UNIQUE,FOREIGN KEY(unit_id,institution_id) REFERENCES organization_unit_profiles(unit_id,institution_id))`,
  `CREATE TABLE staff_course_qualifications(id TEXT PRIMARY KEY,institution_id TEXT NOT NULL,appointment_id TEXT NOT NULL,subject_id TEXT NOT NULL,course_id TEXT NOT NULL,
    starts_on TEXT NOT NULL CHECK(date(starts_on) IS NOT NULL AND date(starts_on)=starts_on),ends_on TEXT CHECK(ends_on IS NULL OR (date(ends_on) IS NOT NULL AND date(ends_on)=ends_on AND ends_on>=starts_on)),status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),version INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(appointment_id,institution_id) REFERENCES identity_appointments(id,institution_id),FOREIGN KEY(subject_id,institution_id,course_id) REFERENCES subject_courses(subject_id,institution_id,course_id))`,
  `CREATE UNIQUE INDEX qualification_one_active ON staff_course_qualifications(appointment_id,course_id) WHERE status='active'`,
  `CREATE INDEX people_identity_scope ON identity_person_links(institution_id,person_id)`,
  `CREATE INDEX qualification_scope ON staff_course_qualifications(institution_id,course_id,status)`,
];
const triggers = [
  ...["INSERT", "UPDATE"].map(
    (event) =>
      `CREATE TRIGGER reporting_person_${event.toLowerCase()} BEFORE ${event} ON identity_reporting_lines WHEN NEW.status='active' BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_appointments a JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN identity_person_links x ON x.identity_id=a.identity_id JOIN identity_person_links y ON y.identity_id=b.identity_id WHERE a.id=NEW.subordinate_id AND x.institution_id=y.institution_id AND x.person_id=y.person_id) THEN RAISE(ABORT,'a person cannot supervise their other account') END; END`,
  ),
  `CREATE TRIGGER org_profile_insert BEFORE INSERT ON organization_unit_profiles BEGIN
    SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_units u JOIN organization_unit_types t ON t.code=NEW.unit_type WHERE u.id=NEW.unit_id AND u.institution_id=NEW.institution_id AND u.kind=t.structural_kind) THEN RAISE(ABORT,'organization type does not match structural kind') END;
    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_units u WHERE u.id=NEW.unit_id AND u.parent_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM organization_units p LEFT JOIN organization_unit_profiles f ON f.unit_id=p.id JOIN organization_parent_rules r ON r.parent_type=COALESCE(f.unit_type,p.kind) AND r.child_type=NEW.unit_type WHERE p.id=u.parent_id AND p.status='active')) THEN RAISE(ABORT,'invalid semantic organization parent') END;
    END`,
  `CREATE TRIGGER org_profile_immutable BEFORE UPDATE ON organization_unit_profiles BEGIN SELECT RAISE(ABORT,'create a new organization definition instead of rewriting history'); END`,
  `CREATE TRIGGER org_profile_keep BEFORE DELETE ON organization_unit_profiles BEGIN SELECT RAISE(ABORT,'organization profiles must be retained'); END`,
  `CREATE TRIGGER person_account_scope BEFORE INSERT ON person_account_links BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_person_links p JOIN identity_registry i ON i.id=p.identity_id WHERE i.institution_id=NEW.institution_id AND i.account_id=NEW.account_id AND p.person_id<>NEW.person_id) THEN RAISE(ABORT,'account already belongs to another person') END; END`,
  `CREATE TRIGGER identity_person_scope BEFORE INSERT ON identity_person_links BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM identity_registry i WHERE i.id=NEW.identity_id AND i.account_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM person_account_links a WHERE a.institution_id=i.institution_id AND a.account_id=i.account_id AND a.person_id=NEW.person_id)) THEN RAISE(ABORT,'identity person does not match linked account') END; END`,
  ...["INSERT", "UPDATE"].map(
    (event) =>
      `CREATE TRIGGER class_org_${event.toLowerCase()} BEFORE ${event} ON organization_class_links BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_unit_profiles p JOIN organization_units u ON u.id=p.unit_id WHERE p.unit_id=NEW.unit_id AND p.institution_id=NEW.institution_id AND p.unit_type IN ('homeroom','class') AND u.status='active') THEN RAISE(ABORT,'academic class must bind to a homeroom unit') END; END`,
  ),
  ...["INSERT", "UPDATE"].map(
    (event) =>
      `CREATE TRIGGER qualification_${event.toLowerCase()} BEFORE ${event} ON staff_course_qualifications BEGIN SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN organization_unit_profiles p ON p.unit_id=(SELECT unit_id FROM organization_positions WHERE id=a.position_id) WHERE a.id=NEW.appointment_id AND a.institution_id=NEW.institution_id AND p.unit_type='subject_group' AND p.subject_id=NEW.subject_id) THEN RAISE(ABORT,'qualification must match the appointed subject group') END; END`,
  ),
  `CREATE TRIGGER identity_person_immutable BEFORE UPDATE ON identity_person_links BEGIN SELECT RAISE(ABORT,'person identity links require a reviewed migration to change'); END`,
  `CREATE TRIGGER account_person_immutable BEFORE UPDATE ON person_account_links BEGIN SELECT RAISE(ABORT,'account person links require a reviewed migration to change'); END`,
  `CREATE TRIGGER identity_account_immutable BEFORE UPDATE OF account_id ON identity_registry WHEN NEW.account_id IS NOT OLD.account_id AND EXISTS(SELECT 1 FROM identity_person_links WHERE identity_id=OLD.id) BEGIN SELECT RAISE(ABORT,'linked identity account cannot be replaced'); END`,
  `CREATE TRIGGER identity_person_keep BEFORE DELETE ON identity_person_links BEGIN SELECT RAISE(ABORT,'retain identity person history'); END`,
  `CREATE TRIGGER account_person_keep BEFORE DELETE ON person_account_links BEGIN SELECT RAISE(ABORT,'retain account person history'); END`,
  ...["INSERT", "UPDATE"].map(
    (
      event,
    ) => `CREATE TRIGGER homeroom_role_${event.toLowerCase()} BEFORE ${event} ON identity_appointments WHEN NEW.status='active' BEGIN
    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p WHERE p.id=NEW.position_id AND p.role_code='homeroom_teacher' AND NOT EXISTS(SELECT 1 FROM organization_units u LEFT JOIN organization_unit_profiles f ON f.unit_id=u.id WHERE u.id=p.unit_id AND COALESCE(f.unit_type,u.kind) IN ('homeroom','class'))) THEN RAISE(ABORT,'homeroom teacher requires a class unit') END;
    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p WHERE p.id=NEW.position_id AND p.role_code='subject_member' AND NOT EXISTS(SELECT 1 FROM organization_unit_profiles f WHERE f.unit_id=p.unit_id AND f.unit_type='subject_group')) THEN RAISE(ABORT,'subject member requires a subject group') END;
    SELECT CASE WHEN EXISTS(SELECT 1 FROM organization_positions p JOIN organization_positions q ON q.unit_id=p.unit_id AND q.role_code='homeroom_teacher' JOIN identity_appointments a ON a.position_id=q.id WHERE p.id=NEW.position_id AND p.role_code='homeroom_teacher' AND a.id<>NEW.id AND a.status='active' AND a.starts_on<=COALESCE(NEW.ends_on,'9999-12-31') AND NEW.starts_on<=COALESCE(a.ends_on,'9999-12-31')) THEN RAISE(ABORT,'overlapping primary homeroom teacher appointments') END;
    END`,
  ),
];
const checksum = createHash("sha256")
  .update(
    JSON.stringify({ organizationTypes, parentRules, statements, triggers }),
  )
  .digest("hex");
export function applyOrganizationFoundation(db: DatabaseConnection) {
  const old = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=15")
    .get() as { checksum: string } | undefined;
  if (old) {
    if (old.checksum !== checksum)
      throw Error("Migration 15 checksum mismatch");
    return;
  }
  db.transaction(() => {
    for (const sql of statements) db.prepare(sql).run();
    for (const row of organizationTypes)
      db.prepare("INSERT INTO organization_unit_types VALUES (?,?,?)").run(
        ...row,
      );
    for (const row of parentRules)
      db.prepare(
        "INSERT OR IGNORE INTO organization_parent_rules VALUES (?,?)",
      ).run(...row);
    db.prepare(
      "INSERT INTO identity_roles VALUES ('homeroom_teacher','staff','班主任'),('subject_member','staff','学科组成员')",
    ).run();
    db.prepare(
      "INSERT INTO organization_unit_profiles(unit_id,institution_id,unit_type) SELECT id,institution_id,kind FROM organization_units",
    ).run();
    const identities = db
      .prepare(
        "SELECT i.*,f.full_name FROM identity_registry i LEFT JOIN faculty_users f ON f.id=i.account_id ORDER BY i.id",
      )
      .all() as Record<string, any>[];
    for (const identity of identities) {
      let person = identity.account_id
        ? (db
            .prepare(
              "SELECT person_id FROM person_account_links WHERE institution_id=? AND account_id=?",
            )
            .get(identity.institution_id, identity.account_id) as
            | { person_id: string }
            | undefined)
        : undefined;
      if (!person) {
        person = { person_id: randomUUID() };
        db.prepare(
          "INSERT INTO school_people(id,institution_id,display_name) VALUES (?,?,?)",
        ).run(
          person.person_id,
          identity.institution_id,
          identity.full_name || identity.display_name || "",
        );
        if (identity.account_id)
          db.prepare("INSERT INTO person_account_links VALUES (?,?,?)").run(
            identity.institution_id,
            person.person_id,
            identity.account_id,
          );
      }
      db.prepare("INSERT INTO identity_person_links VALUES (?,?,?)").run(
        identity.id,
        identity.institution_id,
        person.person_id,
      );
    }
    for (const sql of triggers) {
      try {
        db.prepare(sql).run();
      } catch (error) {
        throw new Error(
          `Organization migration trigger ${sql.match(/TRIGGER (\w+)/)?.[1]} failed`,
          { cause: error },
        );
      }
    }
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(15,?,?)",
    ).run("school-people-organization-multiple-appointments", checksum);
  })();
}
