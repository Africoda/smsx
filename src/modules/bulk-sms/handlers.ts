import type { Context } from "hono";

import { getContactIdByPhone, insertMessageToDb, sendToMNotify } from "./service";

/**
 * Sends bulk SMS and logs to DB.
 */
export async function sendBulkSmsHandler(c: Context) {
  const body = await c.req.json();
  const { sender, message, recipients } = body;

  let totalSent = 0;
  let totalFailed = 0;

  for (const phone of recipients) {
    try {
      const response = await sendToMNotify(sender, phone, message);

      const contactId = await getContactIdByPhone(phone);

      await insertMessageToDb({
        phone,
        contactId,
        message,
        status: "sent",
        response,
      });

      totalSent++;
    } catch (err) {
      totalFailed++;
    }
  }

  return c.json({
    status: "success",
    totalSent,
    totalFailed,
  });
}
