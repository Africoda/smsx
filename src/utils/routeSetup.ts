import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

import type { AppRouteHandler } from "@/lib/types";

import { createRouter } from "@/lib/create-app";

type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options"
  | "trace";

export function setupRoute(config: {
  method: Method;
  path: string;
  controller: AppRouteHandler<any>;
  responseSchema: any;
  tags?: string[];
}) {
  const router = createRouter();
  router.openapi(
    createRoute({
      tags: config.tags || ["Default"],
      method: config.method,
      path: config.path,
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          config.responseSchema,
          `Response for ${config.path}`,
        ),
      },
    }),
    config.controller,
  );
  return router;
}
