import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import { AppError } from "@/utils/error";

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

    // Always store the campaign attempt
    await messageService.createCampaignWithHistory(
      {
        userId: c.get("jwtPayload").userId,
        name: `Bulk SMS - ${new Date().toISOString()}`,
        description: `Bulk SMS ${response.status === "success" ? "sent" : "failed"} on ${new Date().toISOString()}`,
      },
      {
        status: response.status === "success" ? "sent" : "failed",
        recipient_contacts: recipients,
        content: message,
        providerResponse: response.message,
      },
    );

    if (response.status === "success") {
      totalSent = recipients.length;
    }
    else {
      totalFailed = recipients.length;
      return c.json(
        { error: response.message || "Failed to send bulk SMS" },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
  catch (error: any) {
    totalFailed = recipients.length;

    // Store failed campaign due to system error
    try {
      await messageService.createCampaignWithHistory(
        {
          userId: c.get("jwtPayload").userId,
          name: `Bulk SMS - ${new Date().toISOString()}`,
          description: `Bulk SMS failed due to system error on ${new Date().toISOString()}`,
        },
        {
          status: "failed",
          recipient_contacts: recipients,
          content: message,
          providerResponse: error.message || "Unknown error",
        },
      );
    }
    catch (dbError) {
      console.error("Failed to log campaign history:", dbError);
      throw new AppError(
        "Failed to log campaign history",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: dbError },
      );
    }
  }
  if (totalFailed > 0) {
    await messageService.createMessageHistory({
      campaignId: "", // No campaign created if failed
      status: "failed",
      recipient_contacts: recipients,
      content: message,
      providerResponse: "Failed to send bulk SMS",
    });
    return c.json(
      {
        error: "Failed to send bulk SMS",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
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
