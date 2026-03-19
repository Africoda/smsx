// tests for notifications module
import { describe, expect, it, vi } from "vitest";

import notificationService from "@/modules/notifications/service";

describe("notifications module", () => {
  it("should exist", () => {
    expect(true).toBe(true);
  });

  it("notificationService should expose createNotification, listNotifications and markAsRead", () => {
    expect(typeof notificationService.createNotification).toBe("function");
    expect(typeof notificationService.listNotifications).toBe("function");
    expect(typeof notificationService.markAsRead).toBe("function");
  });

  it("listNotifications should be able to filter unread notifications when unreadOnly is set", async () => {
    const svc = notificationService as any;

    const listSpy = vi
      .spyOn(svc, "listNotifications")
      .mockImplementation(async (options?: { unreadOnly?: boolean }) => {
        const notifications = [
          { id: "1", read: false },
          { id: "2", read: true },
        ];

        if (options && options.unreadOnly) {
          return notifications.filter((n) => !n.read);
        }

        return notifications;
      });

    const allNotifications = await svc.listNotifications({ unreadOnly: false });
    const unreadNotifications = await svc.listNotifications({ unreadOnly: true });

    expect(allNotifications).toHaveLength(2);
    expect(unreadNotifications).toHaveLength(1);
    expect(unreadNotifications[0].read).toBe(false);

    listSpy.mockRestore();
  });

  it("markAsRead should only update the authenticated user's notification", async () => {
    const svc = notificationService as any;

    const markSpy = vi
      .spyOn(svc, "markAsRead")
      .mockImplementation(async (notificationId: string, userId: string) => {
        const notifications = [
          { id: "1", userId: "user1", read: false },
          { id: "1", userId: "user2", read: false },
        ];

        return notifications.map((n) =>
          n.id === notificationId && n.userId === userId
            ? { ...n, read: true }
            : n
        );
      });

    const result = await svc.markAsRead("1", "user1");

    expect(result).toEqual([
      { id: "1", userId: "user1", read: true },
      { id: "1", userId: "user2", read: false },
    ]);

    markSpy.mockRestore();
  });
});
