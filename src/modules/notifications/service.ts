import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { NewNotification, Notification } from "@/db/schema/notifications";

import db from "@/db";
import { notifications } from "@/db/schema/notifications";
import { AppError } from "@/utils/error";

export const notificationService = {
  async createNotification(data: NewNotification): Promise<Notification> {
    try {
      const notification = await db.insert(notifications).values(data).returning();
      return notification[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create notification",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
  async listNotifications(
    userId: string,
  page = 1,
  limit = 10,
  ): Promise<Notification[]> {
    const offset = (page - 1) * limit;
    try {
      const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.recipientId, userId),
        limit,
        offset,
        orderBy: (
          notifications,
          { desc },
        ) => [desc(notifications.createdAt)],
      });
      return userNotifications;
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch notifications",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};
export default notificationService;
