import { randomUUID } from "node:crypto";
import { asyncSome, type DatabaseConnection } from "./asyncDatabase";
import { HttpError } from "./http";
export type OrgRow = Record<string, any>;
export const schoolToday = () =>
  new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
export async function organizationScope(
  db: DatabaseConnection,
  accountId: string,
) {
  const units = (await db
    .prepare(
      `SELECT u.*,COALESCE(p.unit_type,u.kind) unit_type,p.subject_id,t.label type_label,s.name subject_name
    FROM organization_units u LEFT JOIN organization_unit_profiles p ON p.unit_id=u.id
    LEFT JOIN organization_unit_types t ON t.code=COALESCE(p.unit_type,u.kind) LEFT JOIN school_subjects s ON s.id=p.subject_id`,
    )
    .all()) as OrgRow[];
  const byId = new Map(units.map((u) => [u.id, u]));
  const ancestors = (id: string) => {
    const result: string[] = [];
    let node = byId.get(id);
    while (node) {
      if (node.status !== "active" || result.includes(node.id)) return [];
      result.push(node.id);
      node = node.parent_id ? byId.get(node.parent_id) : undefined;
    }
    return result;
  };
  const activeAppointments = (
    await activeStaffAppointments(db, accountId)
  ).filter((a) => ancestors(a.unit_id).length);
  const member = (id: string) =>
    activeAppointments.some((a) => a.unit_id === id);
  const manages = (id: string) => {
    const chain = ancestors(id);
    return activeAppointments.some(
      (a) => a.role_code === "director" && chain.includes(a.unit_id),
    );
  };
  const path = (id: string) =>
    ancestors(id)
      .reverse()
      .map((key) => byId.get(key)!.name)
      .join(" / ");
  return {
    units,
    byId,
    ancestors,
    activeAppointments,
    member,
    manages,
    path,
    descendants: (id: string) =>
      units.filter((u) => ancestors(u.id).includes(id)).map((u) => u.id),
    visibleUnits: units
      .filter((u) => ancestors(u.id).length && (member(u.id) || manages(u.id)))
      .map<OrgRow>((u) => ({
        ...u,
        path: path(u.id),
        canManage: manages(u.id),
      })),
  };
}
export async function activeStaffAppointments(
  db: DatabaseConnection,
  accountId?: string,
): Promise<Awaited<OrgRow[]>> {
  const today = schoolToday();
  return (await db
    .prepare(
      `SELECT a.id appointment_id,a.institution_id,a.starts_on,a.ends_on,i.id identity_id,i.account_id,p.unit_id,p.role_code,p.code position_code,
    f.faculty_code,f.full_name,l.person_id,COALESCE(r.unit_type,u.kind) unit_type,r.subject_id,u.name unit_name
    FROM identity_appointments a JOIN identity_registry i ON i.id=a.identity_id AND i.institution_id=a.institution_id
    JOIN organization_positions p ON p.id=a.position_id AND p.institution_id=a.institution_id JOIN organization_units u ON u.id=p.unit_id
    JOIN faculty_users f ON f.id=i.account_id LEFT JOIN identity_person_links l ON l.identity_id=i.id
    LEFT JOIN school_people person ON person.id=l.person_id LEFT JOIN organization_unit_profiles r ON r.unit_id=u.id
    WHERE a.status='active' AND i.identity_kind='staff' AND i.status='active' AND f.status='ACTIVE' AND u.status='active'
    AND (person.id IS NULL OR person.status='active') AND a.starts_on<=? AND (a.ends_on IS NULL OR a.ends_on>=?)
    ${accountId ? "AND i.account_id=?" : ""} ORDER BY a.id`,
    )
    .all(today, today, ...(accountId ? [accountId] : []))) as OrgRow[];
}
export async function ensureStaffIdentity(
  db: DatabaseConnection,
  institutionId: string,
  accountId: string,
) {
  const account = (await db
    .prepare(
      "SELECT id,faculty_code,full_name FROM faculty_users WHERE id=? AND status='ACTIVE'",
    )
    .get(accountId)) as OrgRow | undefined;
  if (!account) throw new HttpError(422, "账号不存在或已停用");
  let identity = (await db
    .prepare(
      "SELECT id,status FROM identity_registry WHERE institution_id=? AND account_id=? AND identity_kind='staff'",
    )
    .get(institutionId, accountId)) as OrgRow | undefined;
  if (identity && identity.status !== "active")
    throw new HttpError(409, "职工身份已停用");
  if (!identity) {
    identity = { id: randomUUID() };
    await db
      .prepare(
        "INSERT INTO identity_registry(id,institution_id,account_id,identity_kind,external_id,display_name) VALUES (?,?,?,'staff',?,?)",
      )
      .run(
        identity.id,
        institutionId,
        accountId,
        account.faculty_code,
        account.full_name,
      );
  }
  let person = (await db
    .prepare(
      "SELECT person_id FROM person_account_links WHERE institution_id=? AND account_id=?",
    )
    .get(institutionId, accountId)) as
    | {
        person_id: string;
      }
    | undefined;
  if (!person) {
    person = { person_id: randomUUID() };
    await db
      .prepare(
        "INSERT INTO school_people(id,institution_id,display_name) VALUES (?,?,?)",
      )
      .run(person.person_id, institutionId, account.full_name);
    await db
      .prepare("INSERT INTO person_account_links VALUES (?,?,?)")
      .run(institutionId, person.person_id, accountId);
  }
  const state = (await db
    .prepare("SELECT status FROM school_people WHERE id=?")
    .get(person.person_id)) as {
    status: string;
  };
  if (state.status !== "active") throw new HttpError(409, "校内人员身份已停用");
  await db
    .prepare("INSERT OR IGNORE INTO identity_person_links VALUES (?,?,?)")
    .run(identity.id, institutionId, person.person_id);
  return { identityId: identity.id, personId: person.person_id };
}
export async function ensureUnitProfile(
  db: DatabaseConnection,
  unitId: string,
) {
  if (
    await db
      .prepare("SELECT 1 FROM organization_unit_profiles WHERE unit_id=?")
      .get(unitId)
  )
    return;
  await db
    .prepare(
      "INSERT OR IGNORE INTO organization_unit_profiles(unit_id,institution_id,unit_type) SELECT id,institution_id,kind FROM organization_units WHERE id=?",
    )
    .run(unitId);
}
export async function headTeacherClassIds(
  db: DatabaseConnection,
  accountId: string,
) {
  const heads = await organizationClassHeads(db, accountId);
  const legacy = (await db
    .prepare(
      "SELECT c.id FROM academic_classes c WHERE c.head_teacher_id=? AND NOT EXISTS(SELECT 1 FROM organization_class_links l WHERE l.class_id=c.id)",
    )
    .all(accountId)) as {
    id: string;
  }[];
  return new Set([
    ...legacy.map((c) => c.id),
    ...[...heads]
      .filter(([, head]) => head === accountId)
      .map(([classId]) => classId),
  ]);
}
export async function organizationClassHeads(
  db: DatabaseConnection,
  contextAccountId: string,
) {
  const scope = await organizationScope(db, contextAccountId),
    heads = (await activeStaffAppointments(db)).filter(
      (a) =>
        a.role_code === "homeroom_teacher" && scope.ancestors(a.unit_id).length,
    );
  const links = (await db
    .prepare("SELECT class_id,unit_id FROM organization_class_links")
    .all()) as OrgRow[];
  return new Map<string, string | null>(
    links.map((link) => [
      link.class_id,
      heads.find((a) => a.unit_id === link.unit_id)?.account_id || null,
    ]),
  );
}
export async function coursesForAppointment(
  db: DatabaseConnection,
  appointment: OrgRow,
): Promise<Awaited<OrgRow[]>> {
  if (
    appointment.unit_type !== "subject_group" ||
    !["subject_member", "teacher", "mentor", "director"].includes(
      appointment.role_code,
    )
  )
    return [];
  const today = schoolToday();
  return (await db
    .prepare(
      `SELECT c.id,c.name,
    CASE WHEN EXISTS(SELECT 1 FROM staff_course_qualifications q WHERE q.appointment_id=? AND q.course_id=c.id AND q.status='active' AND q.starts_on<=? AND (q.ends_on IS NULL OR q.ends_on>=?)) THEN 'confirmed' ELSE 'current_teaching' END evidence
    FROM subject_courses sc JOIN courses c ON c.id=sc.course_id JOIN school_subjects s ON s.id=sc.subject_id
    WHERE sc.subject_id=? AND sc.institution_id=? AND s.status='active' AND c.archived_at IS NULL AND
    (EXISTS(SELECT 1 FROM staff_course_qualifications q WHERE q.appointment_id=? AND q.course_id=c.id AND q.status='active' AND q.starts_on<=? AND (q.ends_on IS NULL OR q.ends_on>=?))
    OR EXISTS(SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN organization_class_links l ON l.class_id=a.class_id
      WHERE a.teacher_id=? AND a.course_id=c.id AND a.archived_at IS NULL AND t.archived_at IS NULL AND t.starts_on<=? AND t.ends_on>=? AND l.institution_id=sc.institution_id)) ORDER BY c.name`,
    )
    .all(
      appointment.appointment_id,
      today,
      today,
      appointment.subject_id,
      appointment.institution_id,
      appointment.appointment_id,
      today,
      today,
      appointment.account_id,
      today,
      today,
    )) as OrgRow[];
}
export async function assertUnitCourse(
  db: DatabaseConnection,
  unitId: string,
  courseId: string,
) {
  const group = (await db
    .prepare(
      "SELECT p.subject_id FROM organization_unit_profiles p WHERE p.unit_id=? AND p.unit_type='subject_group'",
    )
    .get(unitId)) as
    | {
        subject_id: string;
      }
    | undefined;
  if (
    group &&
    !(await db
      .prepare(
        "SELECT 1 FROM subject_courses c JOIN school_subjects s ON s.id=c.subject_id WHERE c.subject_id=? AND c.course_id=? AND s.status='active'",
      )
      .get(group.subject_id, courseId))
  )
    throw new HttpError(403, "该课程不属于所选学科组");
}
export async function assertSubstituteQualification(
  db: DatabaseConnection,
  accountId: string,
  unitId: string,
  courseId: string,
) {
  await assertUnitCourse(db, unitId, courseId);
  const profile = await db
    .prepare(
      "SELECT 1 FROM organization_unit_profiles WHERE unit_id=? AND unit_type='subject_group'",
    )
    .get(unitId);
  if (
    profile &&
    !(await asyncSome(
      (await organizationScope(db, accountId)).activeAppointments,
      async (a) =>
        a.unit_id === unitId &&
        (await coursesForAppointment(db, a)).some((c) => c.id === courseId),
    ))
  )
    throw new HttpError(403, "代课教师在该学科组尚无有效任教资格");
}
export async function sameSchoolPerson(
  db: DatabaseConnection,
  first: string,
  second: string,
  unitId: string | null | undefined,
) {
  if (first === second) return true;
  if (!unitId) return false;
  return !!(await db
    .prepare(
      `SELECT 1 FROM person_account_links a JOIN person_account_links b ON b.institution_id=a.institution_id AND b.person_id=a.person_id
    JOIN organization_units u ON u.institution_id=a.institution_id WHERE a.account_id=? AND b.account_id=? AND u.id=?`,
    )
    .get(first, second, unitId));
}
export async function classOrganizationActive(
  db: DatabaseConnection,
  classId: string,
) {
  const link = (await db
    .prepare("SELECT unit_id FROM organization_class_links WHERE class_id=?")
    .get(classId)) as
    | {
        unit_id: string;
      }
    | undefined;
  if (!link) return true;
  const chain = (await db
    .prepare(
      `WITH RECURSIVE chain(id,parent_id,status) AS (SELECT id,parent_id,status FROM organization_units WHERE id=? UNION SELECT u.id,u.parent_id,u.status FROM organization_units u JOIN chain c ON u.id=c.parent_id) SELECT status FROM chain`,
    )
    .all(link.unit_id)) as {
    status: string;
  }[];
  return chain.length > 0 && chain.every((u) => u.status === "active");
}
