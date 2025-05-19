import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { insertNotificationSchema, selectNotificationSchema } from "@/db/schema/notifications";
import { badRequestSchema } from "@/lib/constants";

// Create notification route
export const createNotification = createRoute({
  path: "/notifications",
  method: "post",
  tags: ["Notifications"],
  request: {
    body: jsonContentRequired(insertNotificationSchema, "Notification data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectNotificationSchema,
      "The created notification",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
  },
});

export type CreateNotificationRoute = typeof createNotification;
