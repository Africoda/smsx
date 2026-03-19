import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

import { insertNotificationSchema, selectNotificationSchema } from "@/db/schema/notifications";
import { badRequestSchema, notFoundSchema, unauthorizedSchema } from "@/lib/constants";

// Schema for creating a notification via the API (omit server-managed fields)
const createNotificationBodySchema = insertNotificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
});

// Create notification route
export const createNotification = createRoute({
  path: "/notifications",
  method: "post",
  tags: ["Notifications"],
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(createNotificationBodySchema, "Notification data"),
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
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
  },
});

export type CreateNotificationRoute = typeof createNotification;

// List notifications route
export const listNotifications = createRoute({
  path: "/notifications",
  method: "get",
  tags: ["Notifications"],
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      page: z.coerce.number().min(1).optional().default(1),
      limit: z.coerce.number().min(1).max(100).optional().default(10),
      unreadOnly: z.enum(["true", "false"]).optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectNotificationSchema.array(),
      "List of notifications",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
  },
});

export type ListNotificationsRoute = typeof listNotifications;

// Mark notification as read route
export const markNotificationRead = createRoute({
  path: "/notifications/:id/read",
  method: "patch",
  tags: ["Notifications"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectNotificationSchema,
      "The updated notification",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Notification not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
  },
});

export type MarkNotificationReadRoute = typeof markNotificationRead;
