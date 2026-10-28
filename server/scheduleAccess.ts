import type { DatabaseConnection } from "./dbContract";
import type { Response } from "express";
import { HttpError } from "./http";
import { organizationScope } from "./organizationCore";
export function scheduleAccess(db: DatabaseConnection, accountId: string) {
  const scope = organizationScope(db, accountId);
  const eligible = scope.activeAppointments.filter((a) =>
    ["teacher", "mentor", "director", "subject_member"].includes(a.role_code),
  );
  const member = (id: string) => eligible.some((a) => a.unit_id === id);
  const manages = scope.manages;
  const institutions = new Map(
    (
      db.prepare("SELECT id,code FROM institutions").all() as {
        id: string;
        code: string;
      }[]
    ).map((i) => [i.id, i.code]),
  );
  const departments = scope.units
    .filter(
      (u) =>
        ["department", "group"].includes(u.kind) &&
        scope.ancestors(u.id).length &&
        (member(u.id) || manages(u.id)),
    )
    .map((u) => ({
      id: u.id,
      name: u.name,
      code: u.code,
      label: `${scope.path(u.id)} (${institutions.get(u.institution_id)}/${u.code})`,
      institution_id: u.institution_id,
      canSubmit: member(u.id),
      canManage: manages(u.id),
    }));
  return {
    member,
    manages,
    departments,
    visible: (id: string | null | undefined) =>
      !!id && (member(id) || manages(id)),
    requireMember(id: string) {
      if (!departments.some((u) => u.id === id && u.canSubmit))
        throw new HttpError(
          403,
          "需要该教研室的有效任职，不能自行指定共享范围",
        );
    },
    requireManager(id: string | null | undefined) {
      if (!id || !manages(id))
        throw new HttpError(403, "需要该教研室或其上级负责人的有效任职");
    },
  };
}
export function requestScheduleAccess(
  db: DatabaseConnection,
  res: Response,
): ReturnType<typeof scheduleAccess> {
  return (res.locals.scheduleAccess ??= scheduleAccess(db, res.locals.user.id));
}
