import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateNotificationRoute } from "./routes";

import NotificationService from "./service";

export const create: AppRouteHandler<CreateNotificationRoute> = async (c) => {
  const data = c.req.valid("json");
  const notification = await NotificationService.createNotification(data);
  return c.json(notification, HttpStatusCodes.CREATED);
};
