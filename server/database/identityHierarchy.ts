import { createHash } from "node:crypto";
import type { DatabaseConnection } from "../dbContract";

/** Metadata only: roles and reporting lines never grant access to private content. */
export const hierarchyStatements = [
  `CREATE TABLE institutions(id TEXT PRIMARY KEY,code TEXT NOT NULL UNIQUE CHECK(length(trim(code))>0),name TEXT NOT NULL CHECK(length(trim(name))>0))`,
  `CREATE TABLE organization_units(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),parent_id TEXT,
 kind TEXT NOT NULL CHECK(kind IN ('school','campus','division','department','grade','class','group')),
 code TEXT NOT NULL CHECK(length(trim(code))>0),name TEXT NOT NULL CHECK(length(trim(name))>0),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),
 UNIQUE(id,institution_id),UNIQUE(institution_id,code),
 FOREIGN KEY(parent_id,institution_id) REFERENCES organization_units(id,institution_id),
 CHECK((kind='school' AND parent_id IS NULL) OR (kind<>'school' AND parent_id IS NOT NULL)),CHECK(parent_id IS NULL OR parent_id<>id))`,
  `CREATE UNIQUE INDEX organization_one_root ON organization_units(institution_id) WHERE parent_id IS NULL`,
  `CREATE TABLE identity_registry(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),account_id TEXT REFERENCES faculty_users(id),
 identity_kind TEXT NOT NULL CHECK(identity_kind IN ('staff','student','guardian')),
 external_id TEXT NOT NULL COLLATE NOCASE CHECK(length(trim(external_id))>0 AND external_id=trim(external_id)),
 display_name TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','archived')),
 UNIQUE(id,institution_id),UNIQUE(institution_id,identity_kind,external_id),UNIQUE(account_id,institution_id,identity_kind))`,
  `CREATE TABLE identity_roles(code TEXT PRIMARY KEY,identity_kind TEXT NOT NULL CHECK(identity_kind IN ('staff','student','guardian')),label TEXT NOT NULL)`,
  `INSERT INTO identity_roles VALUES ('director','staff','主任'),('counselor','staff','辅导员'),('mentor','staff','导师'),('teacher','staff','教师'),('student','student','学生'),('guardian','guardian','家长或监护人')`,
  `CREATE TABLE organization_positions(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),unit_id TEXT NOT NULL,role_code TEXT NOT NULL REFERENCES identity_roles(code),code TEXT NOT NULL,
 hierarchy_level INTEGER NOT NULL CHECK(hierarchy_level BETWEEN 1 AND 100),
 UNIQUE(id,institution_id),UNIQUE(institution_id,unit_id,code),FOREIGN KEY(unit_id,institution_id) REFERENCES organization_units(id,institution_id))`,
  `CREATE TABLE identity_appointments(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),identity_id TEXT NOT NULL,position_id TEXT NOT NULL,
 starts_on TEXT NOT NULL CHECK(date(starts_on) IS NOT NULL AND date(starts_on)=starts_on),
 ends_on TEXT CHECK(ends_on IS NULL OR (date(ends_on) IS NOT NULL AND date(ends_on)=ends_on AND ends_on>=starts_on)),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','ended','revoked')),
 UNIQUE(id,institution_id),FOREIGN KEY(identity_id,institution_id) REFERENCES identity_registry(id,institution_id),
 FOREIGN KEY(position_id,institution_id) REFERENCES organization_positions(id,institution_id))`,
  `CREATE UNIQUE INDEX identity_active_position ON identity_appointments(identity_id,position_id) WHERE status='active'`,
  `CREATE TABLE identity_reporting_lines(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),subordinate_id TEXT NOT NULL,supervisor_id TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','ended','revoked')),CHECK(subordinate_id<>supervisor_id),
 FOREIGN KEY(subordinate_id,institution_id) REFERENCES identity_appointments(id,institution_id),
 FOREIGN KEY(supervisor_id,institution_id) REFERENCES identity_appointments(id,institution_id))`,
  `CREATE UNIQUE INDEX reporting_one_supervisor ON identity_reporting_lines(subordinate_id) WHERE status='active'`,
  `CREATE TABLE identity_objects(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),owner_identity_id TEXT NOT NULL,
 object_kind TEXT NOT NULL CHECK(object_kind IN ('student','class','course','term','homework','lesson','exam','report','attachment')),
 source_ref TEXT NOT NULL CHECK(length(trim(source_ref))>0),UNIQUE(id,institution_id),UNIQUE(institution_id,object_kind,source_ref),
 FOREIGN KEY(owner_identity_id,institution_id) REFERENCES identity_registry(id,institution_id))`,
  `CREATE TABLE identity_object_bindings(
 id TEXT PRIMARY KEY,institution_id TEXT NOT NULL REFERENCES institutions(id),identity_id TEXT NOT NULL,object_id TEXT NOT NULL,
 relation TEXT NOT NULL CHECK(relation IN ('member','teaches','mentors','counsels','guardian_of','self_record','reports_to')),
 period_key TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','revoked')),
 created_by TEXT NOT NULL,confirmed_by TEXT,proof_key_hash TEXT CHECK(proof_key_hash IS NULL OR (length(proof_key_hash)=64 AND proof_key_hash NOT GLOB '*[^0-9a-f]*')),
 CHECK(status<>'confirmed' OR (confirmed_by IS NOT NULL AND proof_key_hash IS NOT NULL)),
 UNIQUE(institution_id,identity_id,object_id,relation,period_key),
 FOREIGN KEY(identity_id,institution_id) REFERENCES identity_registry(id,institution_id),
 FOREIGN KEY(object_id,institution_id) REFERENCES identity_objects(id,institution_id),
 FOREIGN KEY(created_by,institution_id) REFERENCES identity_registry(id,institution_id),
 FOREIGN KEY(confirmed_by,institution_id) REFERENCES identity_registry(id,institution_id))`,
  `CREATE INDEX identity_bindings_object ON identity_object_bindings(institution_id,object_id,status)`,
  `CREATE INDEX identity_appointments_scope ON identity_appointments(institution_id,identity_id,status)`,
  `CREATE TRIGGER identity_number_immutable BEFORE UPDATE OF institution_id,identity_kind,external_id ON identity_registry
 WHEN NEW.institution_id<>OLD.institution_id OR NEW.identity_kind<>OLD.identity_kind OR NEW.external_id<>OLD.external_id
 BEGIN SELECT RAISE(ABORT,'identity composite number is immutable'); END`,
  `CREATE TRIGGER organization_scope_immutable BEFORE UPDATE OF institution_id,kind ON organization_units WHEN NEW.institution_id<>OLD.institution_id OR NEW.kind<>OLD.kind BEGIN SELECT RAISE(ABORT,'organization scope and kind are immutable'); END`,
  ...(["INSERT", "UPDATE"] as const).flatMap((event) => [
    `CREATE TRIGGER organization_parent_${event.toLowerCase()} BEFORE ${event} ON organization_units WHEN NEW.parent_id IS NOT NULL BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM organization_units p WHERE p.id=NEW.parent_id AND p.institution_id=NEW.institution_id AND p.status='active' AND
 ((NEW.kind='campus' AND p.kind='school') OR (NEW.kind IN ('division','department','grade') AND p.kind IN ('school','campus','division')) OR (NEW.kind='class' AND p.kind='grade') OR (NEW.kind='group' AND p.kind IN ('department','class')))) THEN RAISE(ABORT,'invalid organization parent') END;
 SELECT CASE WHEN EXISTS(WITH RECURSIVE ancestors(id) AS (SELECT NEW.parent_id UNION SELECT u.parent_id FROM organization_units u JOIN ancestors a ON u.id=a.id WHERE u.parent_id IS NOT NULL) SELECT 1 FROM ancestors WHERE id=NEW.id) THEN RAISE(ABORT,'organization hierarchy cycle') END; END`,
    `CREATE TRIGGER appointment_role_${event.toLowerCase()} BEFORE ${event} ON identity_appointments BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_registry i JOIN organization_positions p ON p.id=NEW.position_id AND p.institution_id=NEW.institution_id JOIN identity_roles r ON r.code=p.role_code JOIN organization_units u ON u.id=p.unit_id WHERE i.id=NEW.identity_id AND i.institution_id=NEW.institution_id AND i.identity_kind=r.identity_kind AND (NEW.status<>'active' OR (i.status='active' AND u.status='active'))) THEN RAISE(ABORT,'identity does not match position role') END; END`,
    `CREATE TRIGGER reporting_cycle_${event.toLowerCase()} BEFORE ${event} ON identity_reporting_lines WHEN NEW.status='active' BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN identity_registry i ON i.id=a.identity_id JOIN identity_registry j ON j.id=b.identity_id WHERE a.id=NEW.subordinate_id AND a.institution_id=NEW.institution_id AND b.institution_id=NEW.institution_id AND a.status='active' AND b.status='active' AND i.status='active' AND j.status='active' AND i.identity_kind='staff' AND j.identity_kind='staff' AND a.identity_id<>b.identity_id) THEN RAISE(ABORT,'invalid active reporting identities') END;
 SELECT CASE WHEN EXISTS(WITH RECURSIVE chain(id) AS (SELECT NEW.supervisor_id UNION SELECT r.supervisor_id FROM identity_reporting_lines r JOIN chain c ON r.subordinate_id=c.id WHERE r.status='active' AND r.id<>NEW.id) SELECT 1 FROM chain WHERE id=NEW.subordinate_id) THEN RAISE(ABORT,'reporting hierarchy cycle') END; END`,
  ]),
  // Changing a referenced position/identity must not invalidate existing appointments.
  `CREATE TRIGGER role_kind_immutable BEFORE UPDATE OF identity_kind ON identity_roles WHEN NEW.identity_kind<>OLD.identity_kind BEGIN SELECT RAISE(ABORT,'role kind is immutable'); END`,
  `CREATE TRIGGER position_definition_immutable BEFORE UPDATE OF institution_id,unit_id,role_code,hierarchy_level ON organization_positions WHEN NEW.institution_id<>OLD.institution_id OR NEW.unit_id<>OLD.unit_id OR NEW.role_code<>OLD.role_code OR NEW.hierarchy_level<>OLD.hierarchy_level BEGIN SELECT RAISE(ABORT,'position definition is immutable'); END`,
  `CREATE TRIGGER appointment_definition_immutable BEFORE UPDATE OF identity_id,position_id,institution_id ON identity_appointments WHEN NEW.identity_id<>OLD.identity_id OR NEW.position_id<>OLD.position_id OR NEW.institution_id<>OLD.institution_id BEGIN SELECT RAISE(ABORT,'appointment definition is immutable'); END`,
  `CREATE TRIGGER organization_parent_immutable BEFORE UPDATE OF parent_id ON organization_units WHEN NEW.parent_id IS NOT OLD.parent_id BEGIN SELECT RAISE(ABORT,'create a new organization unit to change its parent'); END`,
  ...(["INSERT", "UPDATE"] as const).map(
    (
      event,
    ) => `CREATE TRIGGER binding_identity_${event.toLowerCase()} BEFORE ${event} ON identity_object_bindings BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_registry i JOIN identity_objects o ON o.id=NEW.object_id AND o.institution_id=NEW.institution_id WHERE i.id=NEW.identity_id AND i.institution_id=NEW.institution_id AND (NEW.status<>'confirmed' OR i.status='active') AND
 ((NEW.relation='guardian_of' AND i.identity_kind='guardian' AND o.object_kind='student') OR (NEW.relation='self_record' AND i.identity_kind='student' AND o.object_kind='student' AND o.owner_identity_id=i.id) OR (NEW.relation IN ('teaches','mentors','counsels') AND i.identity_kind='staff') OR NEW.relation IN ('member','reports_to')))
 THEN RAISE(ABORT,'binding identity or object kind mismatch') END;
 SELECT CASE WHEN NEW.status='confirmed' AND NOT EXISTS(SELECT 1 FROM identity_objects o WHERE o.id=NEW.object_id AND o.owner_identity_id=NEW.created_by AND NEW.confirmed_by=NEW.identity_id) THEN RAISE(ABORT,'object owner and recipient must confirm binding') END; END`,
  ),
  ...(["INSERT", "UPDATE"] as const).map(
    (
      event,
    ) => `CREATE TRIGGER reporting_scope_${event.toLowerCase()} BEFORE ${event} ON identity_reporting_lines WHEN NEW.status='active' BEGIN
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN identity_appointments b ON b.id=NEW.supervisor_id JOIN organization_positions q ON q.id=b.position_id WHERE a.id=NEW.subordinate_id AND q.hierarchy_level<p.hierarchy_level AND q.unit_id IN (WITH RECURSIVE ancestors(id) AS (SELECT p.unit_id UNION SELECT u.parent_id FROM organization_units u JOIN ancestors x ON u.id=x.id WHERE u.parent_id IS NOT NULL) SELECT id FROM ancestors)) THEN RAISE(ABORT,'supervisor must be higher in the organization hierarchy') END; END`,
  ),
];
export const hierarchyChecksum = createHash("sha256")
  .update(JSON.stringify(hierarchyStatements))
  .digest("hex");
export function applyIdentityHierarchy(db: DatabaseConnection): void {
  const old = db
    .prepare("SELECT checksum FROM schema_migrations WHERE version=12")
    .get() as { checksum: string } | undefined;
  if (old) {
    if (old.checksum !== hierarchyChecksum)
      throw new Error("Migration 12 checksum mismatch");
    return;
  }
  db.transaction(() => {
    for (const statement of hierarchyStatements) db.prepare(statement).run();
    db.prepare(
      "INSERT INTO schema_migrations(version,name,checksum) VALUES(12,?,?)",
    ).run("identity-organization-object-bindings", hierarchyChecksum);
  })();
}
