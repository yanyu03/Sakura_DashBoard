import type { DatabaseConnection } from "./dbContract";
import { HttpError } from "./http";
import type { Response } from "express";

type Appointment = { unit_id: string; role_code: string };
type Unit = {
  id: string;
  parent_id: string | null;
  institution_id: string;
  name: string;
  code: string;
  kind: string;
  status: string;
};
export function scheduleAccess(db: DatabaseConnection, accountId: string) {
  const units = db.prepare("SELECT * FROM organization_units").all() as Unit[];
  const byId = new Map(units.map((u) => [u.id, u]));
  const institutions = new Map(
    (
      db.prepare("SELECT id,code FROM institutions").all() as {
        id: string;
        code: string;
      }[]
    ).map((i) => [i.id, i.code]),
  );
  const today = new Date().toISOString().slice(0, 10);
  const appointments = db
    .prepare(
      `SELECT p.unit_id,p.role_code FROM identity_appointments a
    JOIN identity_registry i ON i.id=a.identity_id AND i.institution_id=a.institution_id
    JOIN organization_positions p ON p.id=a.position_id AND p.institution_id=a.institution_id
    JOIN faculty_users f ON f.id=i.account_id
    WHERE i.account_id=? AND i.identity_kind='staff' AND i.status='active' AND f.status='ACTIVE'
      AND a.status='active' AND a.starts_on<=? AND (a.ends_on IS NULL OR a.ends_on>=?)
      AND p.role_code IN ('teacher','mentor','director')`,
    )
    .all(accountId, today, today) as Appointment[];
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
  const valid = appointments.filter((a) => ancestors(a.unit_id).length);
  const member = (unitId: string) => valid.some((a) => a.unit_id === unitId);
  const manages = (unitId: string) => {
    const chain = ancestors(unitId);
    return valid.some(
      (a) => a.role_code === "director" && chain.includes(a.unit_id),
    );
  };
  const departments = units
    .filter(
      (u) =>
        ["department", "group"].includes(u.kind) &&
        ancestors(u.id).length &&
        (member(u.id) || manages(u.id)),
    )
    .map((u) => ({
      id: u.id,
      name: u.name,
      code: u.code,
      label: `${u.name} (${institutions.get(u.institution_id)}/${u.code})`,
      institution_id: u.institution_id,
      canSubmit: member(u.id),
      canManage: manages(u.id),
    }));
  return {
    member,
    manages,
    departments,
    visible: (unitId: string | null | undefined) =>
      !!unitId && (member(unitId) || manages(unitId)),
    requireMember(unitId: string) {
      if (!departments.some((u) => u.id === unitId && u.canSubmit))
        throw new HttpError(
          403,
          "需要该教研室的有效任职，不能自行指定共享范围",
        );
    },
    requireManager(unitId: string | null | undefined) {
      if (!unitId || !manages(unitId))
        throw new HttpError(403, "需要该教研室或其上级负责人的有效任职");
    },
  };
}

/** Authorization cache lives for one HTTP request only, never across sessions. */
export function requestScheduleAccess(
  db: DatabaseConnection,
  res: Response,
): ReturnType<typeof scheduleAccess> {
  return (res.locals.scheduleAccess ??= scheduleAccess(db, res.locals.user.id));
}
