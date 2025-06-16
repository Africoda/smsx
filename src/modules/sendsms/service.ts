import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Message, NewMessage } from "@/db/schema/schema";
import db from "@/db";
import { messages } from "@/db/schema/schema";
import { AppError } from "@/utils/error";

export const smsService = {
  async sendSms(data: Omit<NewMessage, "id" | "status" | "providerResponse">): Promise<Message> {
    try {
      const [message] = await db
        .insert(messages)
        .values({
          ...data,
          status: "pending",
        })
        .returning();

      // TODO: Add actual SMS provider integration here
      // For now, simulate successful sending
      const [sentMessage] = await db
        .update(messages)
        .set({
          status: "sent",
          providerResponse: "Message sent successfully",
        })
        .where(eq(messages.id, message.id))
        .returning();

      return sentMessage;
    } catch (error) {
      throw new AppError(
        "Failed to send SMS",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
};

export default smsService;