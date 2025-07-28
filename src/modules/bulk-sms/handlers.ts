import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { SendBulkSmsRoute } from "./routes";

import { messageService, sendBulkSMS } from "./service";

/**
 * Sends bulk SMS and logs to DB.
 */

export const sendBulkSms: AppRouteHandler<SendBulkSmsRoute> = async (c) => {
  const body = c.req.valid("json");
  const { sender, message, recipients } = body;

  let totalSent = 0;
  let totalFailed = 0;

  try {
    const response = await sendBulkSMS(sender, message, recipients);

    const campaignData = await messageService.createCampaign({
      userId: c.get("jwtPayload")?.userId,
      name: `Bulk SMS - ${new Date().toISOString()}`,
      description: `Bulk SMS sent on ${new Date().toISOString()}`,
    });

    await messageService.createMessageHistory({
      campaignId: campaignData.id,
      status: "sent",
      recipient_contacts: recipients,
      content: message,
      providerResponse: response.message,
    });

    totalSent = recipients.length;
  }
  catch (err) {
    console.error("Failed to send bulk SMS:", err);
    totalFailed = recipients.length;
  }

  return c.json(
    {
      status: "success",
      totalSent,
      totalFailed,
    },
    HttpStatusCodes.OK,
  );
};
