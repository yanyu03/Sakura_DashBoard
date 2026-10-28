import type { Express, Response } from "express";
import { randomUUID } from "node:crypto";
import type { DatabaseConnection } from "./dbContract";
import { HttpError, text } from "./http";
import { mutate, reply } from "./business";

export function registerScheduleDepartments(
  app: Express,
  db: DatabaseConnection,
) {
  const admin = (res: Response) => {
    if (res.locals.user.role !== "admin")
      throw new HttpError(403, "仅管理员可配置教研室任职");
  };
  app.get("/api/v1/schedules/department-admin", (_req, res) => {
    admin(res);
    reply(res, {
      institutions: db
        .prepare("SELECT id,name FROM institutions ORDER BY name")
        .all(),
      departments: db
        .prepare(
          "SELECT u.id,u.name,u.code,u.institution_id,i.code institution_code,i.name institution_name FROM organization_units u JOIN institutions i ON i.id=u.institution_id WHERE u.status='active' AND u.kind IN ('department','group') ORDER BY i.name,u.name,u.code",
        )
        .all(),
      users: db
        .prepare(
          "SELECT id,faculty_code,full_name FROM faculty_users WHERE status='ACTIVE' ORDER BY faculty_code",
        )
        .all(),
      members: db
        .prepare(
          `SELECT a.id,a.position_id,a.starts_on,a.ends_on,p.unit_id,p.role_code,u.name unit_name,u.code unit_code,school.code institution_code,f.faculty_code,f.full_name
        FROM identity_appointments a JOIN identity_registry i ON i.id=a.identity_id
        JOIN organization_positions p ON p.id=a.position_id JOIN organization_units u ON u.id=p.unit_id
        JOIN institutions school ON school.id=u.institution_id
        JOIN faculty_users f ON f.id=i.account_id WHERE a.status='active' AND i.status='active' AND p.role_code IN ('teacher','director','mentor') ORDER BY u.name,f.faculty_code`,
        )
        .all(),
    });
  });
  app.post("/api/v1/schedules/departments", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        admin(res);
        let institutionId = req.body.institution_id;
        if (!institutionId) {
          const institutions = db
            .prepare("SELECT id FROM institutions")
            .all() as { id: string }[];
          if (institutions.length > 1) throw new HttpError(422, "请选择学校");
          institutionId = institutions[0]?.id;
          if (!institutionId) {
            institutionId = randomUUID();
            db.prepare(
              "INSERT INTO institutions(id,code,name) VALUES (?,?,?)",
            ).run(institutionId, "sakura-school", "本校");
          }
        }
        if (
          !db
            .prepare("SELECT id FROM institutions WHERE id=?")
            .get(institutionId)
        )
          throw new HttpError(422, "学校不存在");
        let root = db
          .prepare(
            "SELECT id FROM organization_units WHERE institution_id=? AND parent_id IS NULL AND status='active'",
          )
          .get(institutionId) as { id: string } | undefined;
        if (!root) {
          if (
            db
              .prepare(
                "SELECT id FROM organization_units WHERE institution_id=? AND parent_id IS NULL",
              )
              .get(institutionId)
          )
            throw new HttpError(409, "学校组织已归档");
          root = { id: randomUUID() };
          db.prepare(
            "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,NULL,'school',?,?)",
          ).run(root.id, institutionId, "school-root", "学校");
        }
        const id = randomUUID();
        db.prepare(
          "INSERT INTO organization_units(id,institution_id,parent_id,kind,code,name) VALUES (?,?,?,'department',?,?)",
        ).run(
          id,
          institutionId,
          root.id,
          text(req.body.code, "教研室代码", { max: 40 }),
          text(req.body.name, "教研室名称", { max: 80 }),
        );
        return { id };
      },
      "教研室已创建",
    ),
  );
  app.post("/api/v1/schedules/departments/:id/members", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        admin(res);
        const unit = db
          .prepare(
            "SELECT * FROM organization_units WHERE id=? AND status='active' AND kind IN ('department','group')",
          )
          .get(req.params.id) as
          | { id: string; institution_id: string }
          | undefined;
        const account = db
          .prepare(
            "SELECT id,faculty_code,full_name FROM faculty_users WHERE id=? AND status='ACTIVE'",
          )
          .get(req.body.account_id) as
          | { id: string; faculty_code: string; full_name: string }
          | undefined;
        if (!unit || !account) throw new HttpError(422, "教研室或账号不存在");
        const role = req.body.role_code;
        if (!["teacher", "director"].includes(role))
          throw new HttpError(422, "请选择教师或教研室负责人");
        let identity = db
          .prepare(
            "SELECT id,status FROM identity_registry WHERE institution_id=? AND account_id=? AND identity_kind='staff'",
          )
          .get(unit.institution_id, account.id) as
          | { id: string; status: string }
          | undefined;
        if (identity && identity.status !== "active")
          throw new HttpError(409, "身份已停用，请先处理组织身份状态");
        if (!identity) {
          identity = { id: randomUUID(), status: "active" };
          db.prepare(
            "INSERT INTO identity_registry(id,institution_id,account_id,identity_kind,external_id,display_name) VALUES (?,?,?,'staff',?,?)",
          ).run(
            identity.id,
            unit.institution_id,
            account.id,
            account.faculty_code,
            account.full_name,
          );
        }
        let position = db
          .prepare(
            "SELECT id FROM organization_positions WHERE institution_id=? AND unit_id=? AND code=?",
          )
          .get(unit.institution_id, unit.id, `schedule-${role}`) as
          | { id: string }
          | undefined;
        if (!position) {
          position = { id: randomUUID() };
          db.prepare(
            "INSERT INTO organization_positions(id,institution_id,unit_id,role_code,code,hierarchy_level) VALUES (?,?,?,?,?,?)",
          ).run(
            position.id,
            unit.institution_id,
            unit.id,
            role,
            `schedule-${role}`,
            role === "director" ? 10 : 50,
          );
        }
        if (
          db
            .prepare(
              "SELECT id FROM identity_appointments WHERE identity_id=? AND position_id=? AND status='active'",
            )
            .get(identity.id, position.id)
        )
          throw new HttpError(409, "该任职已存在，请先撤销旧任职再重新配置");
        const id = randomUUID();
        db.prepare(
          "INSERT INTO identity_appointments(id,institution_id,identity_id,position_id,starts_on) VALUES (?,?,?,?,?)",
        ).run(
          id,
          unit.institution_id,
          identity.id,
          position.id,
          new Date().toISOString().slice(0, 10),
        );
        return { id };
      },
      "任职已确认，按账号 ID 绑定",
    ),
  );
  app.patch("/api/v1/schedules/appointments/:id", (req, res) =>
    mutate(
      req,
      res,
      db,
      () => {
        admin(res);
        if (req.body.revoked !== true)
          throw new HttpError(422, "仅支持撤销任职");
        if (
          !db
            .prepare("SELECT id FROM identity_appointments WHERE id=?")
            .get(req.params.id)
        )
          throw new HttpError(404, "任职不存在");
        db.prepare(
          "UPDATE identity_appointments SET status='revoked' WHERE id=?",
        ).run(req.params.id);
        // Current authorization is checked on every request; no cached entitlement remains.
        return { id: req.params.id };
      },
      "任职已撤销，共享权限立即失效",
    ),
  );
}
