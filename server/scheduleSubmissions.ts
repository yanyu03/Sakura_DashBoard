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
  const assertOwnClass = async (owner: string, classId: string) => {
    if (!(await classOrganizationActive(db, classId)))
      throw new HttpError(403, "班级的组织归属已归档");
    if (
      !(await db
        .prepare(
          "SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN academic_classes c ON c.id=a.class_id WHERE a.teacher_id=? AND a.class_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL AND c.archived_at IS NULL LIMIT 1",
        )
        .get(owner, classId))
    )
      throw new HttpError(403, "默认班级只能选择本人有效任课的班级");
  };
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
  app.get("/api/v1/schedules/default-class", async (_req, res) => {
    const row = (await db
      .prepare(
        "SELECT class_id FROM faculty_class_defaults WHERE account_id=?",
      )
      .get(res.locals.user.id)) as Row | undefined;
    const classId = row?.class_id ?? null;
    const valid = classId
      ? await db
          .prepare(
            "SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN academic_classes c ON c.id=a.class_id WHERE a.teacher_id=? AND a.class_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL AND c.archived_at IS NULL LIMIT 1",
          )
          .get(res.locals.user.id, classId)
      : null;
    reply(res, {
      class_id:
        valid && (await classOrganizationActive(db, classId)) ? classId : null,
    });
  });
  app.put("/api/v1/schedules/default-class", async (req, res) =>
    await mutate(
      req,
      res,
      db,
      async () => {
        const accountId = res.locals.user.id;
        const classId = req.body.class_id
          ? text(req.body.class_id, "默认班级", { max: 128 })
          : null;
        if (classId) await assertOwnClass(accountId, classId);
        await db
          .prepare(
            `INSERT INTO faculty_class_defaults(account_id,class_id,updated_at) VALUES (?,?,?)
             ON CONFLICT(account_id) DO UPDATE SET class_id=excluded.class_id,updated_at=excluded.updated_at`,
          )
          .run(accountId, classId, new Date().toISOString());
        return { class_id: classId };
      },
      "默认班级已更新",
    ),
  );
  app.get("/api/v1/schedules/task-pool", async (_req, res) => {
    const rows = await db
      .prepare(
        "SELECT p.*,c.class_name preferred_class_name FROM schedule_task_pool p LEFT JOIN academic_classes c ON c.id=p.preferred_class_id WHERE p.owner_id=? AND p.status='open' ORDER BY p.updated_at DESC,p.id LIMIT 200",
      )
      .all(res.locals.user.id);
    reply(res, rows);
  });
  app.post("/api/v1/schedules/task-pool", async (req, res) =>
    await mutate(
      req,
      res,
      db,
      async () => {
        const ownerId = res.locals.user.id;
        const title = text(req.body.title, "任务标题", { max: 120 });
        const note = text(req.body.note ?? "", "任务说明", {
          max: 1000,
          optional: true,
        });
        const defaultRow = (await db
          .prepare("SELECT class_id FROM faculty_class_defaults WHERE account_id=?")
          .get(ownerId)) as Row | undefined;
        const classId = req.body.preferred_class_id
          ? text(req.body.preferred_class_id, "预选班级", { max: 128 })
          : defaultRow?.class_id ?? null;
        if (req.body.preferred_class_id && classId)
          await assertOwnClass(ownerId, classId);
        const hasCurrentAssignment = classId
          ? await db
              .prepare(
                "SELECT 1 FROM teaching_assignments a JOIN academic_terms t ON t.id=a.term_id JOIN academic_classes c ON c.id=a.class_id WHERE a.teacher_id=? AND a.class_id=? AND a.archived_at IS NULL AND t.archived_at IS NULL AND c.archived_at IS NULL LIMIT 1",
              )
              .get(ownerId, classId)
          : null;
        const preferredClassId =
          hasCurrentAssignment &&
          classId &&
          (await classOrganizationActive(db, classId))
            ? classId
            : null;
        const pendingCount = (await db
          .prepare(
            "SELECT COUNT(*) AS count FROM schedule_task_pool WHERE owner_id=? AND status='open'",
          )
          .get(ownerId)) as { count: number };
        if (pendingCount.count >= 200)
          throw new HttpError(409, "个人排课任务池已满，请先处理现有任务");
        const id = randomUUID();
        const now = new Date().toISOString();
        await db
          .prepare(
            "INSERT INTO schedule_task_pool(id,owner_id,title,note,preferred_class_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
          )
          .run(id, ownerId, title, note, preferredClassId, now, now);
        return {
          id,
          owner_id: ownerId,
          title,
          note,
          preferred_class_id: preferredClassId,
          status: "open",
          version: 1,
          created_at: now,
          updated_at: now,
        };
      },
      "任务已加入你的排课中间池，仅你本人可见",
    ),
  );
  app.patch("/api/v1/schedules/task-pool/:id", async (req, res) =>
    await mutate(
      req,
      res,
      db,
      async () => {
        const row = (await db
          .prepare("SELECT * FROM schedule_task_pool WHERE id=? AND owner_id=?")
          .get(req.params.id, res.locals.user.id)) as Row | undefined;
        if (!row) throw new HttpError(404, "任务不存在");
        version(req.body, row);
        if (row.status !== "open")
          throw new HttpError(409, "该任务已绑定排课或已关闭");
        if (req.body.action === "cancel") {
          await db
            .prepare(
              "UPDATE schedule_task_pool SET status='cancelled',updated_at=?,version=version+1 WHERE id=? AND owner_id=?",
            )
            .run(new Date().toISOString(), row.id, res.locals.user.id);
          return { ...row, status: "cancelled", version: row.version + 1 };
        }
        const title = text(req.body.title ?? row.title, "任务标题", { max: 120 });
        const note = text(req.body.note ?? row.note, "任务说明", {
          max: 1000,
          optional: true,
        });
        const classId =
          req.body.preferred_class_id === undefined
            ? row.preferred_class_id
            : req.body.preferred_class_id || null;
        if (classId) await assertOwnClass(res.locals.user.id, classId);
        const now = new Date().toISOString();
        await db
          .prepare(
            "UPDATE schedule_task_pool SET title=?,note=?,preferred_class_id=?,updated_at=?,version=version+1 WHERE id=? AND owner_id=?",
          )
          .run(title, note, classId, now, row.id, res.locals.user.id);
        return {
          ...row,
          title,
          note,
          preferred_class_id: classId,
          updated_at: now,
          version: row.version + 1,
        };
      },
      "任务池已更新",
    ),
  );
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
          const poolTaskId = req.body.pool_task_id
            ? text(req.body.pool_task_id, "中间池任务", { max: 128 })
            : null;
          if (poolTaskId) {
            const poolTask = await db
              .prepare(
                "SELECT id,status FROM schedule_task_pool WHERE id=? AND owner_id=?",
              )
              .get(poolTaskId, owner);
            if (!poolTask || (poolTask as Row).status !== "open")
              throw new HttpError(409, "中间池任务不存在或已被处理");
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
          if (poolTaskId) {
            const linked = await db
              .prepare(
                "UPDATE schedule_task_pool SET status='linked',submission_id=?,updated_at=?,version=version+1 WHERE id=? AND owner_id=? AND status='open'",
              )
              .run(id, now, poolTaskId, owner);
            if (linked.changes !== 1)
              throw new HttpError(409, "中间池任务已被处理，请刷新后重试");
          }
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
