import type { Express, Response } from "express";
import {
  asyncDatabase,
  asyncFilter,
  type DatabaseSource,
} from "./asyncDatabase";
import { randomUUID } from "node:crypto";
import { HttpError, text } from "./http";
import { classAccess, mutate, reply, version } from "./business";
export function registerLessons(app: Express, source: DatabaseSource) {
  const db = asyncDatabase(source);
  const get = async (id: unknown, res: Response, write = false) => {
    const row = (await db
      .prepare("SELECT * FROM lesson_plans WHERE id=?")
      .get(id)) as Record<string, any> | undefined;
    if (!row) throw new HttpError(404, "教案不存在");
    if (
      res.locals.user.role !== "admin" &&
      (write
        ? row.owner_id !== res.locals.user.id
        : row.visibility === "private" && row.owner_id !== res.locals.user.id)
    )
      throw new HttpError(403, "无权访问此教案");
    return row;
  };
  app.get(
    ["/api/v1/lessons/plans", "/api/v1/lessons/unit-plans"],
    async (req, res) => {
      const rows = (await db
        .prepare(
          `SELECT * FROM lesson_plans WHERE archived_at IS NULL AND (?='admin' OR visibility='school' OR owner_id=?) AND instr(title||summary||tags_json,?)>0 ORDER BY updated_at DESC,id`,
        )
        .all(
          res.locals.user.role,
          res.locals.user.id,
          String(req.query.q || ""),
        )) as Record<string, any>[];
      reply(
        res,
        await Promise.all(
          rows.map(async (r) => ({
            ...r,
            tags: JSON.parse(r.tags_json),
            schedules: await asyncFilter(
              (await db
                .prepare(
                  "SELECT id,class_id,starts_at FROM schedule_entries WHERE lesson_id=? AND cancelled_at IS NULL ORDER BY starts_at",
                )
                .all(r.id)) as Record<string, any>[],
              async (s) => {
                try {
                  await classAccess(db, res, s.class_id);
                  return true;
                } catch {
                  return false;
                }
              },
            ),
            canEdit:
              res.locals.user.role === "admin" ||
              r.owner_id === res.locals.user.id,
            links: (
              await asyncFilter(
                (await db
                  .prepare(
                    "SELECT l.assignment_id,a.class_id FROM lesson_homework l JOIN homework_assignments a ON a.id=l.assignment_id WHERE l.lesson_id=?",
                  )
                  .all(r.id)) as {
                  assignment_id: string;
                  class_id: string;
                }[],
                async (l) => {
                  try {
                    await classAccess(db, res, l.class_id);
                    return true;
                  } catch {
                    return false;
                  }
                },
              )
            ).map((l) => ({ assignment_id: l.assignment_id })),
          })),
        ),
      );
    },
  );
  app.post(
    "/api/v1/lessons/plans",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const id = randomUUID(),
            title = text(req.body.title, "教案标题", { max: 200 }),
            body = text(req.body.body, "教案正文", { max: 100000 });
          const visibility = req.body.visibility || "private";
          if (!["private", "school"].includes(visibility))
            throw new HttpError(422, "可见范围无效");
          const tags = validateTags(req.body.tags ?? []);
          await db
            .prepare(
              "INSERT INTO lesson_plans(id,title,summary,body,unit_code,author_name,owner_id,tags_json,visibility,citation_count,updated_at) VALUES (?,?,?,?,?,?,?,?,?,0,?)",
            )
            .run(
              id,
              title,
              body.slice(0, 200),
              body,
              String(req.body.unit_code || ""),
              res.locals.user.full_name,
              res.locals.user.id,
              JSON.stringify(tags),
              visibility,
              new Date().toISOString(),
            );
          return await get(id, res);
        },
        "教案已创建",
      ),
  );
  app.patch(
    "/api/v1/lessons/plans/:id",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const row = await get(req.params.id, res, true);
          version(req.body, row);
          if (row.archived_at && !req.body.restore)
            throw new HttpError(409, "教案已归档");
          const title = text(req.body.title ?? row.title, "教案标题", {
              max: 200,
            }),
            body = text(req.body.body ?? row.body, "教案正文", { max: 100000 });
          const visibility = req.body.visibility ?? row.visibility;
          if (!["private", "school"].includes(visibility))
            throw new HttpError(422, "可见范围无效");
          await db
            .prepare("INSERT INTO lesson_revisions VALUES (?,?,?,?,?)")
            .run(
              randomUUID(),
              row.id,
              res.locals.user.id,
              JSON.stringify(row),
              new Date().toISOString(),
            );
          await db
            .prepare(
              "UPDATE lesson_plans SET title=?,body=?,summary=?,unit_code=?,tags_json=?,visibility=?,archived_at=?,version=version+1,updated_at=? WHERE id=?",
            )
            .run(
              title,
              body,
              body.slice(0, 200),
              String(req.body.unit_code ?? row.unit_code),
              JSON.stringify(
                validateTags(req.body.tags ?? JSON.parse(row.tags_json)),
              ),
              visibility,
              req.body.archived
                ? new Date().toISOString()
                : req.body.restore
                  ? null
                  : row.archived_at,
              new Date().toISOString(),
              row.id,
            );
          return await get(row.id, res);
        },
        "教案已保存",
      ),
  );
  app.get("/api/v1/lessons/plans/:id/revisions", async (req, res) => {
    await get(req.params.id, res, true);
    reply(
      res,
      await db
        .prepare(
          "SELECT * FROM lesson_revisions WHERE lesson_id=? ORDER BY created_at DESC,id",
        )
        .all(req.params.id),
    );
  });
  app.post(
    "/api/v1/lessons/plans/:id/links",
    async (req, res) =>
      await mutate(
        req,
        res,
        db,
        async () => {
          const row = await get(req.params.id, res, true);
          version(req.body, row);
          if (row.archived_at) throw new HttpError(409, "教案已归档");
          const work = (await db
            .prepare("SELECT class_id FROM homework_assignments WHERE id=?")
            .get(req.body.assignment_id)) as
            | {
                class_id: string;
              }
            | undefined;
          if (!work) throw new HttpError(404, "作业不存在");
          await classAccess(db, res, work.class_id);
          if (req.body.remove === true)
            await db
              .prepare(
                "DELETE FROM lesson_homework WHERE lesson_id=? AND assignment_id=?",
              )
              .run(row.id, req.body.assignment_id);
          else
            await db
              .prepare("INSERT OR IGNORE INTO lesson_homework VALUES (?,?)")
              .run(row.id, req.body.assignment_id);
          await db
            .prepare("UPDATE lesson_plans SET version=version+1 WHERE id=?")
            .run(row.id);
          return await get(row.id, res);
        },
        "作业关联已保存",
      ),
  );
  // The old replacement-based writer could erase revisions and bypass version checks.
  app.put("/api/v1/lessons/unit-plans", (_req, _res, next) =>
    next(
      new HttpError(
        409,
        "旧教案写入接口已停用，请使用教案库的新建和版本化保存",
      ),
    ),
  );
}
function validateTags(value: unknown) {
  if (!Array.isArray(value) || value.length > 20)
    throw new HttpError(422, "标签最多 20 个");
  return [...new Set(value.map((v) => text(v, "标签", { max: 40 })))];
}
