// tests for notifications module
import { describe, expect, it } from "vitest";

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
});
