import type { Express, Response } from "express";
import { randomUUID } from "node:crypto";
import { asyncDatabase, type DatabaseSource } from "./asyncDatabase";
import { HttpError, text } from "./http";
import { mutate, reply, exactDate, version } from "./business";
import {
  organizationScope,
  activeStaffAppointments,
  ensureStaffIdentity,
  ensureUnitProfile,
  coursesForAppointment,
  schoolToday,
  type OrgRow,
} from "./organizationCore";
export function registerOrganization(app: Express, source: DatabaseSource) {
  const db = asyncDatabase(source);
  const admin = (res: Response) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "需要组织配置管理员权限");
  };
  const unit = async (id: unknown) => {
    const row = (await db
      .prepare(
        "SELECT u.*,COALESCE(p.unit_type,u.kind) unit_type,p.subject_id FROM organization_units u LEFT JOIN organization_unit_profiles p ON p.unit_id=u.id WHERE u.id=?",
      )
      .get(text(id, "组织 ID", { max: 128 }))) as OrgRow | undefined;
    if (!row || row.status !== "active")
      throw new HttpError(422, "组织不存在或已归档");
    return row;
  };
  const dates = (
    body: OrgRow,
    defaultStart = schoolToday(),
    defaultEnd: string | null = null,
  ) => {
    const starts = body.starts_on || defaultStart,
      ends = body.ends_on || defaultEnd;
    if (
      typeof starts !== "string" ||
      !exactDate(starts) ||
      (ends !== null &&
        (typeof ends !== "string" || !exactDate(ends) || ends < starts))
    )
      throw new HttpError(422, "任职或资格日期无效");
    return { starts, ends };
  };
  app.get("/api/v1/organization/admin", async (_req, res) => {
    admin(res);
    const scope = await organizationScope(db, res.locals.user.id);
    reply(res, {
      institutions: await db
        .prepare("SELECT id,code,name FROM institutions ORDER BY code")
        .all(),
      units: scope.units.map((u) => ({
        ...u,
        path: scope.path(u.id),
        pathActive: !!scope.ancestors(u.id).length,
      })),
      types: await db.prepare("SELECT * FROM organization_unit_types").all(),
      parentRules: await db
        .prepare("SELECT * FROM organization_parent_rules")
        .all(),
      subjects: await db
        .prepare("SELECT * FROM school_subjects ORDER BY code")
        .all(),
      subjectCourses: await db.prepare("SELECT * FROM subject_courses").all(),
      courses: await db
        .prepare(
          "SELECT id,code,name FROM courses WHERE archived_at IS NULL ORDER BY code",
        )
        .all(),
      users: await db
        .prepare(
          "SELECT id,faculty_code,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY faculty_code",
        )
        .all(),
      members: await db
        .prepare(
          `SELECT a.id,a.starts_on,a.ends_on,a.status,p.unit_id,p.role_code,f.id account_id,f.faculty_code,f.full_name,i.institution_id,l.person_id
        FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN identity_registry i ON i.id=a.identity_id
        JOIN faculty_users f ON f.id=i.account_id LEFT JOIN identity_person_links l ON l.identity_id=i.id WHERE a.status='active' ORDER BY a.id`,
        )
        .all(),
      classLinks: await db
        .prepare(
          "SELECT l.*,c.class_name FROM organization_class_links l JOIN academic_classes c ON c.id=l.class_id",
        )
        .all(),
      classes: await db
        .prepare(
          "SELECT id,class_code,class_name FROM academic_classes WHERE archived_at IS NULL ORDER BY class_code",
        )
        .all(),
      qualifications: await db
        .prepare(
          "SELECT q.*,c.name course_name FROM staff_course_qualifications q JOIN courses c ON c.id=q.course_id WHERE q.status='active'",
        )
        .all(),
    });
  });
  app.post(
    "/api/v1/organization/schools",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const id = randomUUID(),
            root = randomUUID();
          await db
            .prepare("INSERT INTO institutions(id,code,name) VALUES (?,?,?)")
            .run(
              id,
              text(req.body.code, "学校代码", { max: 40 }),
              text(req.body.name, "学校名称", { max: 80 }),
            );
          await db
            .prepare(
              "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,NULL,'school','school-root',?)",
            )
            .run(root, id, text(req.body.name, "学校名称", { max: 80 }));
          await ensureUnitProfile(db, root);
          return { id, root_id: root };
        },
        "学校组织已建立",
      ),
  );
  app.post(
    "/api/v1/organization/units",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const parent = await unit(req.body.parent_id),
            type = text(req.body.unit_type, "组织类型", { max: 40 });
          const definition = (await db
            .prepare(
              "SELECT * FROM organization_unit_types WHERE code=? AND code<>'school'",
            )
            .get(type)) as OrgRow | undefined;
          if (!definition) throw new HttpError(422, "组织类型无效");
          if (
            !(await organizationScope(db, res.locals.user.id)).ancestors(
              parent.id,
            ).length
          )
            throw new HttpError(409, "上级组织链已归档");
          if (
            !(await db
              .prepare(
                "SELECT 1 FROM organization_parent_rules WHERE parent_type=? AND child_type=?",
              )
              .get(parent.unit_type, type))
          )
            throw new HttpError(422, "所选组织类型不能设在这个上级下");
          const subject =
            type === "subject_group"
              ? text(req.body.subject_id, "学科", { max: 128 })
              : null;
          if (
            subject &&
            !(await db
              .prepare(
                "SELECT id FROM school_subjects WHERE id=? AND institution_id=? AND status='active'",
              )
              .get(subject, parent.institution_id))
          )
            throw new HttpError(422, "学科必须属于同一学校");
          const id = randomUUID();
          await db
            .prepare(
              "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,?,?,?,?)",
            )
            .run(
              id,
              parent.institution_id,
              parent.id,
              definition.structural_kind,
              text(req.body.code, "组织代码", { max: 40 }),
              text(req.body.name, "组织名称", { max: 80 }),
            );
          await db
            .prepare("INSERT INTO organization_unit_profiles VALUES (?,?,?,?)")
            .run(id, parent.institution_id, type, subject);
          return { id };
        },
        "组织节点已建立，上下级关系已校验",
      ),
  );
  app.patch(
    "/api/v1/organization/units/:id",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          if (req.body.archived !== true)
            throw new HttpError(422, "仅支持归档；重组请建立新定义以保留历史");
          const row = await unit(req.params.id);
          await db
            .prepare(
              "UPDATE organization_units SET status='archived' WHERE id=?",
            )
            .run(row.id);
          return { id: row.id };
        },
        "组织已归档，下属任职的新访问权限失效",
      ),
  );
  app.post(
    "/api/v1/organization/subjects",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const institution = text(req.body.institution_id, "学校 ID", {
            max: 128,
          });
          if (
            !(await db
              .prepare("SELECT id FROM institutions WHERE id=?")
              .get(institution))
          )
            throw new HttpError(422, "学校不存在");
          const id = randomUUID();
          await db
            .prepare(
              "INSERT INTO school_subjects(id,institution_id,code,name) VALUES (?,?,?,?)",
            )
            .run(
              id,
              institution,
              text(req.body.code, "学科代码", { max: 40 }),
              text(req.body.name, "学科名称", { max: 80 }),
            );
          return { id };
        },
        "学科已建立",
      ),
  );
  app.post(
    "/api/v1/organization/subject-courses",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const subject = (await db
            .prepare(
              "SELECT * FROM school_subjects WHERE id=? AND status='active'",
            )
            .get(text(req.body.subject_id, "学科 ID", { max: 128 }))) as
            | OrgRow
            | undefined;
          if (
            !subject ||
            !(await db
              .prepare(
                "SELECT id FROM courses WHERE id=? AND archived_at IS NULL",
              )
              .get(text(req.body.course_id, "课程 ID", { max: 128 })))
          )
            throw new HttpError(422, "学科或课程无效");
          await db
            .prepare("INSERT INTO subject_courses VALUES (?,?,?)")
            .run(subject.institution_id, subject.id, req.body.course_id);
          return { id: subject.id };
        },
        "课程已归入学科",
      ),
  );
  app.post(
    "/api/v1/organization/appointments",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const node = await unit(req.body.unit_id),
            scope = await organizationScope(db, res.locals.user.id);
          const chain = scope.ancestors(node.id);
          if (!chain.length) throw new HttpError(409, "组织链已归档");
          if (chain.length > 10) throw new HttpError(422, "组织层级最多十级");
          const role = text(req.body.role_code, "任职身份", { max: 40 });
          if (
            ![
              "teacher",
              "director",
              "homeroom_teacher",
              "subject_member",
              "mentor",
              "counselor",
            ].includes(role)
          )
            throw new HttpError(422, "任职身份无效");
          if (
            role === "homeroom_teacher" &&
            !["homeroom", "class"].includes(node.unit_type)
          )
            throw new HttpError(422, "班主任必须任职于班级节点");
          if (role === "subject_member" && node.unit_type !== "subject_group")
            throw new HttpError(422, "学科组成员必须任职于学科组");
          const identity = await ensureStaffIdentity(
              db,
              node.institution_id,
              text(req.body.account_id, "账号 ID", { max: 128 }),
            ),
            period = dates(req.body);
          const code = "org-" + role;
          let position = (await db
            .prepare(
              "SELECT id FROM organization_positions WHERE institution_id=? AND unit_id=? AND code=?",
            )
            .get(node.institution_id, node.id, code)) as
            | {
                id: string;
              }
            | undefined;
          if (!position) {
            position = { id: randomUUID() };
            await db
              .prepare(
                "INSERT INTO organization_positions(id,institution_id,unit_id,role_code,code,hierarchy_level) VALUES (?,?,?,?,?,?)",
              )
              .run(
                position.id,
                node.institution_id,
                node.id,
                role,
                code,
                (chain.length - 1) * 8 + (role === "director" ? 1 : 6),
              );
          }
          const id = randomUUID();
          await db
            .prepare(
              "INSERT INTO identity_appointments(id,institution_id,identity_id,position_id,starts_on,ends_on) VALUES (?,?,?,?,?,?)",
            )
            .run(
              id,
              node.institution_id,
              identity.identityId,
              position.id,
              period.starts,
              period.ends,
            );
          if (req.body.supervisor_appointment_id) {
            const supervisor = text(
              req.body.supervisor_appointment_id,
              "直属上级任职 ID",
              { max: 128 },
            );
            if (
              !(await activeStaffAppointments(db)).some(
                (a) =>
                  a.appointment_id === supervisor &&
                  a.institution_id === node.institution_id &&
                  scope.ancestors(a.unit_id).length,
              )
            )
              throw new HttpError(422, "直属上级任职已失效");
            await db
              .prepare(
                "INSERT INTO identity_reporting_lines(id,institution_id,subordinate_id,supervisor_id) VALUES (?,?,?,?)",
              )
              .run(randomUUID(), node.institution_id, id, supervisor);
          }
          return { id, person_id: identity.personId };
        },
        "任职已确认，可同时保留其他岗位",
      ),
  );
  app.post(
    "/api/v1/organization/class-links",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const node = await unit(req.body.unit_id),
            classId = text(req.body.class_id, "班级 ID", { max: 128 });
          if (
            !["homeroom", "class"].includes(node.unit_type) ||
            !(await db
              .prepare(
                "SELECT id FROM academic_classes WHERE id=? AND archived_at IS NULL",
              )
              .get(classId))
          )
            throw new HttpError(422, "请选择有效的班级节点和教务班级");
          if (
            !(await organizationScope(db, res.locals.user.id)).ancestors(
              node.id,
            ).length
          )
            throw new HttpError(409, "组织链已归档");
          await ensureUnitProfile(db, node.id);
          await db
            .prepare("INSERT INTO organization_class_links VALUES (?,?,?)")
            .run(classId, node.institution_id, node.id);
          return { id: classId };
        },
        "班级已绑定组织归属；班主任权限以有效任职为准",
      ),
  );
  app.post(
    "/api/v1/organization/qualifications",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const appointment = (await db
            .prepare(
              `SELECT a.*,p.unit_id,p.role_code,f.subject_id FROM identity_appointments a JOIN organization_positions p ON p.id=a.position_id JOIN organization_unit_profiles f ON f.unit_id=p.unit_id WHERE a.id=? AND a.status='active' AND f.unit_type='subject_group'`,
            )
            .get(text(req.body.appointment_id, "任职 ID", { max: 128 }))) as
            | OrgRow
            | undefined;
          if (
            !appointment ||
            !["teacher", "subject_member", "director", "mentor"].includes(
              appointment.role_code,
            )
          )
            throw new HttpError(422, "请选择有效学科组任职");
          if (
            !(await organizationScope(db, res.locals.user.id)).ancestors(
              appointment.unit_id,
            ).length
          )
            throw new HttpError(409, "组织链已归档");
          const course = text(req.body.course_id, "课程 ID", { max: 128 });
          if (
            !(await db
              .prepare(
                "SELECT 1 FROM subject_courses WHERE subject_id=? AND course_id=?",
              )
              .get(appointment.subject_id, course))
          )
            throw new HttpError(422, "课程未归入该学科");
          const period = dates(
            req.body,
            [schoolToday(), appointment.starts_on].sort().at(-1),
            appointment.ends_on,
          );
          if (
            period.starts < appointment.starts_on ||
            (appointment.ends_on &&
              (!period.ends || period.ends > appointment.ends_on))
          )
            throw new HttpError(422, "资格有效期不能超出任职期限");
          const id = randomUUID();
          await db
            .prepare(
              "INSERT INTO staff_course_qualifications(id,institution_id,appointment_id,subject_id,course_id,starts_on,ends_on) VALUES (?,?,?,?,?,?,?)",
            )
            .run(
              id,
              appointment.institution_id,
              appointment.id,
              appointment.subject_id,
              course,
              period.starts,
              period.ends,
            );
          return { id };
        },
        "任教资格已确认，不自动分配班级或开放其他业务资料",
      ),
  );
  app.patch(
    "/api/v1/organization/qualifications/:id",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          admin(res);
          const row = (await db
            .prepare("SELECT * FROM staff_course_qualifications WHERE id=?")
            .get(req.params.id)) as OrgRow | undefined;
          if (!row) throw new HttpError(404, "资格不存在");
          version(req.body, row);
          if (req.body.revoked !== true)
            throw new HttpError(422, "仅支持撤销资格");
          await db
            .prepare(
              "UPDATE staff_course_qualifications SET status='revoked',version=version+1 WHERE id=?",
            )
            .run(row.id);
          return { id: row.id };
        },
        "任教资格已撤销",
      ),
  );
  app.get("/api/v1/organization/scope", async (_req, res) => {
    const scope = await organizationScope(db, res.locals.user.id);
    const units = scope.visibleUnits;
    const subjects = (await db
      .prepare(
        "SELECT id,institution_id,code,name FROM school_subjects WHERE status='active'",
      )
      .all()) as OrgRow[];
    reply(res, {
      units,
      subjects: subjects.filter((s) =>
        units.some((u) => u.institution_id === s.institution_id),
      ),
      courses: await db
        .prepare("SELECT id,code,name FROM courses WHERE archived_at IS NULL")
        .all(),
    });
  });
  app.get("/api/v1/organization/dispatchable-teachers", async (req, res) => {
    const scope = await organizationScope(db, res.locals.user.id),
      node = await unit(req.query.unit_id);
    if (!scope.member(node.id) && !scope.manages(node.id))
      throw new HttpError(403, "只能发现本人任职或负责范围内的可协调人员");
    if (!scope.ancestors(node.id).length)
      throw new HttpError(403, "组织链已归档");
    const subject = text(req.query.subject_id, "学科 ID", {
        optional: true,
        max: 128,
      }),
      course = text(req.query.course_id, "课程 ID", {
        optional: true,
        max: 128,
      }),
      descendants = new Set(scope.descendants(node.id));
    const all = (await activeStaffAppointments(db)).filter(
      (a) =>
        a.institution_id === node.institution_id &&
        scope.ancestors(a.unit_id).length,
    );
    const candidates = new Map<string, OrgRow>();
    for (const appointment of all) {
      if (
        !descendants.has(appointment.unit_id) ||
        appointment.unit_type !== "subject_group" ||
        (subject && appointment.subject_id !== subject)
      )
        continue;
      const qualifications = (
        await coursesForAppointment(db, appointment)
      ).filter((c) => !course || c.id === course);
      if (!qualifications.length) continue;
      const key = appointment.person_id || appointment.identity_id;
      let person = candidates.get(key);
      if (!person) {
        person = {
          person_id: key,
          account_id: appointment.account_id,
          faculty_code: appointment.faculty_code,
          full_name: appointment.full_name || appointment.faculty_code,
          qualifications: [],
          appointments: all
            .filter((a) => (a.person_id || a.identity_id) === key)
            .map((a) => ({
              id: a.appointment_id,
              unit_id: a.unit_id,
              unit_name: a.unit_name,
              path: scope.path(a.unit_id),
              role_code: a.role_code,
              starts_on: a.starts_on,
              ends_on: a.ends_on,
            })),
          availability: "needs_confirmation",
        };
        candidates.set(key, person);
      }
      for (const qualification of qualifications)
        if (
          !person.qualifications.some(
            (q: OrgRow) =>
              q.course_id === qualification.id &&
              q.unit_id === appointment.unit_id,
          )
        )
          person.qualifications.push({
            course_id: qualification.id,
            course_name: qualification.name,
            unit_id: appointment.unit_id,
            unit_name: appointment.unit_name,
            evidence: qualification.evidence,
          });
    }
    reply(res, {
      teachers: [...candidates.values()].sort((a, b) =>
        a.faculty_code.localeCompare(b.faculty_code),
      ),
      note: "任教资格候选；空闲时间待本人或正式排课确认，课时仍需冲突检查和审批。",
    });
  });
}
