import { eq } from "drizzle-orm";
import { MNotify } from "mnotify-ts-sdk";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Campaign, Message, MessageHistory, NewCampaign, NewMessage, NewMessageHistory } from "@/db/schema/schema";

import db from "@/db";
import { campaigns, contacts, messageHistory, messages, smsProviders, systemSmsProviderConfigs, userDefaultSmsProviders, userSmsProviderConfigs } from "@/db/schema/schema";
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

  async createCampaignWithHistory(
    campaignData: NewCampaign,
    historyData: Omit<NewMessageHistory, "campaignId">,
  ): Promise<{ campaign: Campaign; history: MessageHistory }> {
    try {
      const result = await db.transaction(async (tx) => {
        const [campaign] = await tx.insert(campaigns).values(campaignData).returning();
        const [history] = await tx.insert(messageHistory).values({
          ...historyData,
          campaignId: campaign.id,
        }).returning();

        return { campaign, history };
      });

      return result;
    }
    catch (error) {
      throw new AppError(
        "Failed to create campaign with history",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
};

export const selectProvider = {
  /**
   * Gets the best available SMS provider for a user based on priority:
   * 1. User's default provider (if set)
   * 2. Random user provider with sufficient credits
   * 3. System default provider
   */
  async chooseProvider(userId: string) {
    try {
      // Step 1: Check if user has a default provider
      const defaultProvider = await db
        .select({
          providerId: userDefaultSmsProviders.providerId,
          providerName: smsProviders.name,
          apiKey: userSmsProviderConfigs.apiKey,
          senderId: userSmsProviderConfigs.senderId,
        })
        .from(userDefaultSmsProviders)
        .innerJoin(smsProviders, eq(userDefaultSmsProviders.providerId, smsProviders.id))
        .innerJoin(userSmsProviderConfigs, eq(userDefaultSmsProviders.providerId, userSmsProviderConfigs.providerId))
        .where(eq(userDefaultSmsProviders.userId, userId))
        .limit(1);

      if (defaultProvider.length > 0) {
        return {
          type: "user_default",
          provider: defaultProvider[0],
        };
      }

      // Step 2: Get any user provider (randomly selected)
      const userProviders = await db
        .select({
          providerId: userSmsProviderConfigs.providerId,
          providerName: smsProviders.name,
          apiKey: userSmsProviderConfigs.apiKey,
          senderId: userSmsProviderConfigs.senderId,
        })
        .from(userSmsProviderConfigs)
        .innerJoin(smsProviders, eq(userSmsProviderConfigs.providerId, smsProviders.id))
        .where(eq(userSmsProviderConfigs.userId, userId));

      if (userProviders.length > 0) {
        // Select random provider from user's providers
        const randomProvider = userProviders[Math.floor(Math.random() * userProviders.length)];
        return {
          type: "user_random",
          provider: randomProvider,
        };
      }

      // Step 3: Fallback to system default providers
      const systemProviders = await db
        .select({
          providerId: systemSmsProviderConfigs.providerId,
          providerName: smsProviders.name,
          apiKey: systemSmsProviderConfigs.apiKey,
          senderId: systemSmsProviderConfigs.senderId,
        })
        .from(systemSmsProviderConfigs)
        .innerJoin(smsProviders, eq(systemSmsProviderConfigs.providerId, smsProviders.id));

      if (systemProviders.length > 0) {
        // Select random system provider
        const randomSystemProvider = systemProviders[Math.floor(Math.random() * systemProviders.length)];
        return {
          type: "system_default",
          provider: randomSystemProvider,
        };
      }

      throw new AppError(
        "No SMS providers available",
        HttpStatusCodes.SERVICE_UNAVAILABLE,
      );
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to select SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },

  /**
   * Send SMS using the selected provider
   */
  async sendSMS(providerConfig: any, sender: string, message: string, phone: string | string[]) {
    try {
      switch (providerConfig.providerName.toLowerCase()) {
        case "mnotify":
          return await this.sendViaMNotify(providerConfig.apiKey, sender, message, phone);

        case "twilio":
          return await this.sendViaTwilio(providerConfig.apiKey, sender, message, phone);

        // Add more providers as needed
        default:
          throw new AppError(
            `Unsupported SMS provider: ${providerConfig.providerName}`,
            HttpStatusCodes.BAD_REQUEST,
          );
      }
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to send SMS",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },

  /**
   * Send SMS via MNotify
   */
  async sendViaMNotify(apiKey: string, sender: string, message: string, phone: string | string[]) {
    const mnotify = new MNotify({
      apiKey,
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
        "Failed to send SMS via MNotify",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  /**
   * Send SMS via Twilio (placeholder - implement based on Twilio SDK)
   */
  async sendViaTwilio(_apiKey: string, _sender: string, _message: string, _phone: string | string[]) {
    // TODO: Implement Twilio SMS sending
    throw new AppError(
      "Twilio provider not yet implemented",
      HttpStatusCodes.NOT_IMPLEMENTED,
    );
  },
};

/**
 * Complete SMS sending workflow - selects provider and sends SMS
 */
export async function sendSMSWithProviderSelection(
  userId: string,
  message: string,
  phone: string | string[],
  customSender?: string,
) {
  try {
    // Step 1: Select the best provider for the user
    const selectedProvider = await selectProvider.chooseProvider(userId);

    // Step 2: Use the provider's sender ID or fallback to custom/default
    const sender = customSender || selectedProvider.provider.senderId || "SMS_SENDER";

    // Step 3: Send SMS using the selected provider
    const result = await selectProvider.sendSMS(
      selectedProvider.provider,
      sender,
      message,
      phone,
    );

    return {
      success: true,
      providerType: selectedProvider.type,
      providerName: selectedProvider.provider.providerName,
      result,
    };
  }
  catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Failed to send SMS with provider selection",
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      {
        cause: error,
      },
    );
  }
}
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
      throw new AppError(
        "Failed to fetch contacts",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};

/**
 * Complete Bulk SMS sending workflow - the main function that handles everything
 * This function combines provider selection and SMS sending into one comprehensive solution
 */
export async function sendBulkSMS(
  userId: string,
  sender: string,
  message: string,
  phone: string | string[],
) {
  try {
    // Step 1: Select the best provider for the user
    const selectedProvider = await selectProvider.chooseProvider(userId);

    // Step 2: Use the provided sender or fallback to provider's sender ID
    const finalSender = sender || selectedProvider.provider.senderId || "SMS_SENDER";

    // Step 3: Send SMS using the selected provider
    const result = await selectProvider.sendSMS(
      selectedProvider.provider,
      finalSender,
      message,
      phone,
    );

    return {
      success: true,
      providerType: selectedProvider.type,
      providerName: selectedProvider.provider.providerName,
      sender: finalSender,
      result,
    };
  }
  catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Failed to send bulk SMS",
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      { cause: error },
    );
  }
}
