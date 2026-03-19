import { and, eq } from "drizzle-orm";
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
    unreadOnly?: boolean,
  ): Promise<Notification[]> {
    const offset = (page - 1) * limit;
    try {
      const conditions = unreadOnly === true
        ? and(eq(notifications.recipientId, userId), eq(notifications.isRead, false))
        : eq(notifications.recipientId, userId);

      const userNotifications = await db.query.notifications.findMany({
        where: conditions,
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

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    try {
      const updated = await db
        .update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(and(eq(notifications.id, id), eq(notifications.recipientId, userId)))
        .returning();

      return updated[0] ?? null;
    }
    catch (error) {
      throw new AppError(
        "Failed to mark notification as read",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};
export default notificationService;
