import type { Context, Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { notFound, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "@/middlewares/pino-logger";
import { standardRateLimit } from "@/middlewares/rate-limiter";
import { errorHandler } from "@/utils/error";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export function onError(err: Error, c: Context) {
  const logger = c.get("logger");
  logger.error({ err }, "Unhandled application error");
  return errorHandler(err, c);
}

export default function createApp() {
  const app = createRouter();
  app.use(requestId())
    .use(serveEmojiFavicon("📝"))
    .use(cors({
      origin: "*", // In production, configure specific origins
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
      maxAge: 86400,
      credentials: true,
    }))
    .use(standardRateLimit)
    .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
