import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { createRouter } from "@/lib/create-app";

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        status: z.literal("ok"),
        timestamp: z.string(),
        uptime: z.number(),
        database: z.enum(["connected", "disconnected"]),
      }),
      "Health Check Response",
    ),
    [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
      z.object({
        status: z.literal("error"),
        timestamp: z.string(),
        database: z.enum(["connected", "disconnected"]),
        message: z.string(),
      }),
      "Service Unavailable",
    ),
  },
});

const healthHandler: AppRouteHandler<typeof healthRoute> = async (c) => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  // Check database connection
  let dbStatus: "connected" | "disconnected" = "disconnected";
  try {
    // Simple database check - try to query
    await db.execute("SELECT 1" as any);
    dbStatus = "connected";
  }
  catch (error) {
    console.error("Database health check failed:", error);
  }

  if (dbStatus === "disconnected") {
    return c.json(
      {
        status: "error",
        timestamp,
        database: dbStatus,
        message: "Database connection failed",
      },
      HttpStatusCodes.SERVICE_UNAVAILABLE,
    );
  }

  return c.json(
    {
      status: "ok",
      timestamp,
      uptime,
      database: dbStatus,
    },
    HttpStatusCodes.OK,
  );
};

const router = createRouter();
router.openapi(healthRoute, healthHandler);

export default router;
