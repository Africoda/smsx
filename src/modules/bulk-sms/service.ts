import { eq } from "drizzle-orm";
import { MNotify } from "mnotify-ts-sdk";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Campaign, Message, MessageHistory, NewCampaign, NewMessage, NewMessageHistory } from "@/db/schema/schema";

import db from "@/db";
import { campaigns, contacts, messageHistory, messages } from "@/db/schema/schema";
import env from "@/env";
import { AppError } from "@/utils/error";

export const messageService = {
  async createMessage(data: NewMessage): Promise<Message> {
    try {
      const message = await db.insert(messages).values(data).returning();
      return message[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create message",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
  async createCampaign(
    data: NewCampaign,
  ): Promise<Campaign> {
    try {
      const campaign = await db.insert(campaigns).values(data).returning();
      return campaign[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create campaign",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },

  async createMessageHistory(data: NewMessageHistory): Promise<MessageHistory> {
    try {
      const history = await db.insert(messageHistory).values(data).returning();
      return history[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create message history",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
  async getMessagesByUserId(userId: string): Promise<Message[]> {
    try {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.userId, userId));
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch messages",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
};

/*
  * Get contactid by phone.
  */
export async function getContactIdByPhone(phone: string): Promise<string | null> {
  const contact = await db
    .select()
    .from(contacts)
    .where(eq(contacts.phone_number, phone))
    .limit(1)
    .execute();

  return contact[0]?.id || null;
}

/**
 * grab user
 */
export const contactService = {
  async getContactsByUserId(userId: string) {
    try {
      const userContacts = await db
        .select()
        .from(contacts)
        .where(eq(contacts.userId, userId));

      return userContacts;
    }
    catch (error) {
      console.error("Error fetching contacts:", error);
      throw new Error("Could not fetch contacts");
    }
  },
};

/**
 * Sends an SMS via MNotify API v1.
 */
export async function sendBulkSMS(
  sender: string,
  message: string,
  phone: string | string[],
) {
  const mnotify = new MNotify({
    apiKey: env.MNOTIFY_API_KEY || "",
  });

  try {
    const response = await mnotify.sms.sendQuickBulkSMS({
      recipient: phone,
      sender,
      message,
    });
    return response;
  }
  catch (error) {
    throw new AppError(
      "Failed to send SMS",
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      { cause: error },
    );
  }
}
