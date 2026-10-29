import express from "express";
import { randomUUID } from "node:crypto";
import type { DatabaseSource } from "./asyncDatabase";
import type { CaptchaProvider } from "./dbContract";
import { registerAuth } from "./auth";
import { registerAcademic } from "./academic";
import { registerHomework } from "./homework";
import { registerLessons } from "./lessons";
import { registerSchedules } from "./schedules";
import { registerExams } from "./exams";
import { registerCare } from "./care";
import { registerWorkspace } from "./workspace";
import { registerLegacyViews } from "./legacyViews";
import { apiErrorHandler, HttpError } from "./http";
export function createApplication(
  db: DatabaseSource,
  captcha: CaptchaProvider,
  trustCloudflare = false,
  diagnostics = false,
) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID();
    res.setHeader("X-Request-Id", res.locals.requestId);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Sakura-Database", "TiDB");
    next();
  });
  app.use(express.json({ limit: "5mb" }));
  app.use((req, _res, next) => {
    if (["POST", "PATCH", "PUT"].includes(req.method)) {
      req.body ??= {};
      if (typeof req.body !== "object" || Array.isArray(req.body))
        return next(new HttpError(422, "请求内容必须为 JSON 对象"));
    }
    next();
  });
  registerAuth(app, db, captcha, { trustCloudflare });
  registerAcademic(app, db);
  registerHomework(app, db);
  registerLessons(app, db);
  registerSchedules(app, db);
  registerExams(app, db);
  registerCare(app, db);
  registerWorkspace(app, db);
  registerLegacyViews(app, db);
  app.use("/api/v1", (_req, _res, next) =>
    next(new HttpError(404, "接口不存在")),
  );
  if (diagnostics)
    app.use(
      (
        error: any,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        res.setHeader(
          "X-Sakura-Error-Code",
          String(
            error?.code || error?.details?.code || error?.name || "unknown",
          ),
        );
        res.setHeader(
          "X-Sakura-Error-Message",
          encodeURIComponent(String(error?.message || "").slice(0, 160)),
        );
        next(error);
      },
    );
  app.use(apiErrorHandler);
  return app;
}
