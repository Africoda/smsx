import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateNotificationRoute, ListNotificationsRoute, MarkNotificationReadRoute } from "./routes";

import NotificationService from "./service";

export const create: AppRouteHandler<CreateNotificationRoute> = async (c) => {
  const data = c.req.valid("json");
  const notification = await NotificationService.createNotification(data);
  return c.json(notification, HttpStatusCodes.CREATED);
};

export const list: AppRouteHandler<ListNotificationsRoute> = async (c) => {
  const userId = c.get("jwtPayload")?.userId;
  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const { page, limit, unreadOnly } = c.req.valid("query");
  const notifications = await NotificationService.listNotifications(
    userId,
    page,
    limit,
    unreadOnly === "true",
  );
  return c.json(notifications, HttpStatusCodes.OK);
};

export const markAsRead: AppRouteHandler<MarkNotificationReadRoute> = async (c) => {
  const userId = c.get("jwtPayload")?.userId;
  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const { id } = c.req.valid("param");
  const notification = await NotificationService.markAsRead(id, userId);
  if (!notification) {
    return c.json({ message: "Not Found" }, HttpStatusCodes.NOT_FOUND);
  }
  return c.json(notification, HttpStatusCodes.OK);
};
