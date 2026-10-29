import type { Express, Response } from "express";
import { asyncDatabase, type DatabaseSource } from "./asyncDatabase";
import { randomUUID } from "node:crypto";
import { HttpError, text } from "./http";
import { mutate, reply, version } from "./business";
import { scheduleAccess, requestScheduleAccess } from "./scheduleAccess";
import {
  assertUnitCourse,
  sameSchoolPerson,
  classOrganizationActive,
} from "./organizationCore";
type Row = Record<string, any>;
export function registerScheduleSubmissions(
  app: Express,
  source: DatabaseSource,
  helpers: {
    validate(data: Row): Promise<Row>;
    noConflict(data: Row, exclude?: string): Promise<void>;
    range(query: Record<string, unknown>): string[];
  },
) {
  const db = asyncDatabase(source);
  const access = async (res: Response) => await requestScheduleAccess(db, res);
  const canTeach = async (owner: string, data: Row) => {
    if (!(await classOrganizationActive(db, data.class_id)))
      throw new HttpError(403, "班级的组织归属已归档");
    const terms = (await db
      .prepare(
        `SELECT t.starts_on,t.ends_on FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id
      WHERE a.teacher_id=? AND a.class_id=? AND a.course_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL`,
      )
      .all(owner, data.class_id, data.course_id)) as {
      starts_on: string;
      ends_on: string;
    }[];
    if (
      !terms.some(
        (t) =>
          Date.parse(data.starts_at) >=
            Date.parse(`${t.starts_on}T00:00:00+08:00`) &&
          Date.parse(data.ends_at) <=
            Date.parse(`${t.ends_on}T00:00:00+08:00`) + 86400000,
      )
    )
      throw new HttpError(
        403,
        "只能提交有效任课学期内的班级与课程，请联系管理员分配任课",
      );
  };
  const noDuplicate = async (owner: string, data: Row, exclude = "") => {
    if (
      await db
        .prepare(
          "SELECT id FROM schedule_submissions WHERE owner_id=? AND class_id=? AND course_id=? AND starts_at=? AND ends_at=? AND status='submitted' AND id<>?",
        )
        .get(
          owner,
          data.class_id,
          data.course_id,
          data.starts_at,
          data.ends_at,
          exclude,
        )
    )
      throw new HttpError(409, "相同课时已有待审批提交");
  };
  const present = async (row: Row, res: Response) => {
    const own = row.owner_id === res.locals.user.id,
      manager = (await access(res)).manages(row.unit_id);
    return {
      ...row,
      review_note: own || manager ? row.review_note : "",
      canEdit: own && ["draft", "rejected", "withdrawn"].includes(row.status),
      canWithdraw: own && row.status === "submitted",
      canReview:
        !(await sameSchoolPerson(
          db,
          row.owner_id,
          res.locals.user.id,
          row.unit_id,
        )) &&
        manager &&
        row.status === "submitted",
    };
  };
  const read = async (id: unknown, res: Response) => {
    const row = (await db
      .prepare(
        `SELECT s.*,f.full_name,f.faculty_code,c.class_name,k.name course_name,u.name unit_name
      FROM schedule_submissions s JOIN faculty_users f ON f.id=s.owner_id JOIN academic_classes c ON c.id=s.class_id
      JOIN courses k ON k.id=s.course_id LEFT JOIN organization_units u ON u.id=s.unit_id WHERE s.id=?`,
      )
      .get(id)) as Row | undefined;
    if (
      !row ||
      (row.owner_id !== res.locals.user.id &&
        (!row.shared ||
          (!(
            row.status !== "draft" && (await access(res)).manages(row.unit_id)
          ) &&
            (!["submitted", "approved"].includes(row.status) ||
              !(await access(res)).visible(row.unit_id)))))
    )
      throw new HttpError(404, "提交记录不存在或未共享");
    return row;
  };
  const fields = async (body: Row, owner: string): Promise<Awaited<Row>> => {
    const data = await helpers.validate({ ...body, teacher_id: owner });
    await canTeach(owner, data);
    return {
      ...data,
      note: text(body.note ?? "", "排课说明", { max: 1000, optional: true }),
    };
  };
  app.get("/api/v1/schedules/submissions", async (req, res) => {
    const [from, to] = helpers.range(req.query),
      scope = await access(res),
      ids = scope.departments.map((u) => u.id),
      managed = scope.departments.filter((u) => u.canManage).map((u) => u.id);
    const rows = (await db
      .prepare(
        `SELECT s.id FROM schedule_submissions s WHERE starts_at>=? AND starts_at<? AND
      (owner_id=? ${ids.length ? `OR (shared=1 AND status IN ('submitted','approved') AND unit_id IN (${ids.map(() => "?").join(",")}))` : ""}
      ${managed.length ? `OR (shared=1 AND status<>'draft' AND unit_id IN (${managed.map(() => "?").join(",")}))` : ""})
      ORDER BY updated_at DESC,id LIMIT 500`,
      )
      .all(from, to, res.locals.user.id, ...ids, ...managed)) as {
      id: string;
    }[];
    reply(
      res,
      await Promise.all(
        rows.map(async (r) => await present(await read(r.id, res), res)),
      ),
    );
  });
  app.post(
    "/api/v1/schedules/submissions",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const action = req.body.action ?? "draft";
          if (!["draft", "submit"].includes(action))
            throw new HttpError(422, "提交操作无效");
          const owner = res.locals.user.id,
            data = await fields(req.body, owner),
            unit = req.body.unit_id || null;
          if (unit) {
            (await access(res)).requireMember(unit);
            await assertUnitCourse(db, unit, data.course_id);
          }
          if (action === "submit") {
            (await access(res)).requireMember(unit);
            await helpers.noConflict(data);
            await noDuplicate(owner, data);
          }
          const id = randomUUID(),
            now = new Date().toISOString();
          await db
            .prepare(
              "INSERT INTO schedule_submissions(id,owner_id,unit_id,class_id,course_id,starts_at,ends_at,room,note,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            )
            .run(
              id,
              owner,
              unit,
              data.class_id,
              data.course_id,
              data.starts_at,
              data.ends_at,
              data.room,
              data.note,
              action === "submit" ? "submitted" : "draft",
              now,
              now,
            );
          return await present(await read(id, res), res);
        },
        "课表提交已保存；提交到教研室后共享，审批通过后计入正式课表",
      ),
  );
  app.patch(
    "/api/v1/schedules/submissions/:id",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const row = await read(req.params.id, res);
          version(req.body, row);
          const action = req.body.action,
            own = row.owner_id === res.locals.user.id,
            now = new Date().toISOString();
          if (["save", "submit", "withdraw"].includes(action)) {
            if (!own) throw new HttpError(403, "只能修改或撤回自己的课表提交");
            if (action === "withdraw") {
              if (row.status !== "submitted")
                throw new HttpError(409, "仅待审批提交可以撤回");
              await db
                .prepare(
                  "UPDATE schedule_submissions SET status='withdrawn',updated_at=?,version=version+1 WHERE id=?",
                )
                .run(now, row.id);
            } else {
              if (!["draft", "rejected", "withdrawn"].includes(row.status))
                throw new HttpError(
                  409,
                  "请先撤回待审批提交，正式课表请使用调代课申请",
                );
              const data = await fields({ ...row, ...req.body }, row.owner_id),
                unit =
                  req.body.unit_id === undefined
                    ? row.unit_id
                    : req.body.unit_id || null;
              if (unit) {
                (await access(res)).requireMember(unit);
                await assertUnitCourse(db, unit, data.course_id);
              }
              if (action === "submit") {
                (await access(res)).requireMember(unit);
                await helpers.noConflict({ ...data, teacher_id: row.owner_id });
                await noDuplicate(row.owner_id, data, row.id);
              }
              await db
                .prepare(
                  "UPDATE schedule_submissions SET unit_id=?,class_id=?,course_id=?,starts_at=?,ends_at=?,room=?,note=?,status=?,reviewer_id=NULL,review_note='',updated_at=?,version=version+1 WHERE id=?",
                )
                .run(
                  unit,
                  data.class_id,
                  data.course_id,
                  data.starts_at,
                  data.ends_at,
                  data.room,
                  data.note,
                  action === "submit" ? "submitted" : "draft",
                  now,
                  row.id,
                );
            }
          } else if (["approve", "reject"].includes(action)) {
            (await access(res)).requireManager(row.unit_id);
            if (
              await sameSchoolPerson(
                db,
                row.owner_id,
                res.locals.user.id,
                row.unit_id,
              )
            )
              throw new HttpError(
                403,
                "不能审批自己或同一人员关联账号的课表提交",
              );
            if (row.status !== "submitted")
              throw new HttpError(409, "该提交已处理");
            const review = text(req.body.review_note ?? "", "审批意见", {
              max: 1000,
              optional: true,
            });
            let entryId = null;
            if (action === "approve") {
              (await scheduleAccess(db, row.owner_id)).requireMember(
                row.unit_id,
              );
              await assertUnitCourse(db, row.unit_id, row.course_id);
              const data = await fields(row, row.owner_id);
              await helpers.noConflict({ ...data, teacher_id: row.owner_id });
              entryId = randomUUID();
              await db
                .prepare(
                  "INSERT INTO schedule_entries(id,class_id,teacher_id,course_id,starts_at,ends_at,room) VALUES (?,?,?,?,?,?,?)",
                )
                .run(
                  entryId,
                  row.class_id,
                  row.owner_id,
                  row.course_id,
                  data.starts_at,
                  data.ends_at,
                  data.room,
                );
              await db
                .prepare(
                  "INSERT INTO schedule_entry_scopes(entry_id,unit_id,shared_by) VALUES (?,?,?)",
                )
                .run(entryId, row.unit_id, row.owner_id);
            }
            await db
              .prepare(
                "UPDATE schedule_submissions SET status=?,entry_id=?,reviewer_id=?,review_note=?,updated_at=?,version=version+1 WHERE id=?",
              )
              .run(
                action === "approve" ? "approved" : "rejected",
                entryId,
                res.locals.user.id,
                review,
                now,
                row.id,
              );
          } else throw new HttpError(422, "操作无效");
          return await present(await read(row.id, res), res);
        },
        "课表提交状态已更新",
      ),
  );
}
