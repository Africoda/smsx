import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type {
  NewSmsProvider,
  NewSystemSmsProviderConfig,
  NewUserDefaultSmsProvider,
  NewUserSmsProviderConfig,
  SmsProvider,
  SystemSmsProviderConfig,
  UserDefaultSmsProvider,
  UserSmsProviderConfig,
} from "@/db/schema/schema";

import db from "@/db";
import { smsProviders, systemSmsProviderConfigs, userDefaultSmsProviders, userSmsProviderConfigs } from "@/db/schema/schema";
import { AppError } from "@/utils/error";

export const smsProviderService = {
  // SMS Provider CRUD operations
  async createProvider(data: NewSmsProvider): Promise<SmsProvider> {
    try {
      const provider = await db.insert(smsProviders).values(data).returning();
      return provider[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getAllProviders(): Promise<SmsProvider[]> {
    try {
      return await db.select().from(smsProviders);
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch SMS providers",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getProviderById(id: string): Promise<SmsProvider | null> {
    try {
      const providers = await db
        .select()
        .from(smsProviders)
        .where(eq(smsProviders.id, id))
        .limit(1);

      return providers[0] || null;
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async updateProvider(id: string, data: Partial<NewSmsProvider>): Promise<SmsProvider> {
    try {
      const updatedProvider = await db
        .update(smsProviders)
        .set(data)
        .where(eq(smsProviders.id, id))
        .returning();

      if (updatedProvider.length === 0) {
        throw new AppError(
          "SMS provider not found",
          HttpStatusCodes.NOT_FOUND,
        );
      }

      return updatedProvider[0];
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to update SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async deleteProvider(id: string): Promise<void> {
    try {
      const deleted = await db
        .delete(smsProviders)
        .where(eq(smsProviders.id, id))
        .returning();

      if (deleted.length === 0) {
        throw new AppError(
          "SMS provider not found",
          HttpStatusCodes.NOT_FOUND,
        );
      }
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to delete SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};

export const userSmsConfigService = {
  // User SMS Provider Configuration CRUD
  async createUserConfig(data: NewUserSmsProviderConfig): Promise<UserSmsProviderConfig> {
    try {
      const config = await db.insert(userSmsProviderConfigs).values(data).returning();
      return config[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create user SMS configuration",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getUserConfigs(userId: string): Promise<UserSmsProviderConfig[]> {
    try {
      return await db
        .select()
        .from(userSmsProviderConfigs)
        .where(eq(userSmsProviderConfigs.userId, userId));
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch user SMS configurations",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getUserConfigWithProvider(userId: string) {
    try {
      const result = await db
        .select({
          configId: userSmsProviderConfigs.id,
          providerId: userSmsProviderConfigs.providerId,
          providerName: smsProviders.name,
          apiKey: userSmsProviderConfigs.apiKey,
          senderId: userSmsProviderConfigs.senderId,
          createdAt: userSmsProviderConfigs.createdAt,
        })
        .from(userSmsProviderConfigs)
        .innerJoin(smsProviders, eq(userSmsProviderConfigs.providerId, smsProviders.id))
        .where(eq(userSmsProviderConfigs.userId, userId));

      // Format dates for API response
      return result.map(config => ({
        ...config,
        createdAt: config.createdAt?.toISOString() || "",
      }));
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch user SMS configurations with provider details",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async updateUserConfig(configId: string, data: Partial<NewUserSmsProviderConfig>): Promise<UserSmsProviderConfig> {
    try {
      const updated = await db
        .update(userSmsProviderConfigs)
        .set(data)
        .where(eq(userSmsProviderConfigs.id, configId))
        .returning();

      if (updated.length === 0) {
        throw new AppError(
          "User SMS configuration not found",
          HttpStatusCodes.NOT_FOUND,
        );
      }

      return updated[0];
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to update user SMS configuration",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async deleteUserConfig(configId: string): Promise<void> {
    try {
      const deleted = await db
        .delete(userSmsProviderConfigs)
        .where(eq(userSmsProviderConfigs.id, configId))
        .returning();

      if (deleted.length === 0) {
        throw new AppError(
          "User SMS configuration not found",
          HttpStatusCodes.NOT_FOUND,
        );
      }
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to delete user SMS configuration",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};

export const userDefaultProviderService = {
  // User Default Provider CRUD
  async setDefaultProvider(data: NewUserDefaultSmsProvider): Promise<UserDefaultSmsProvider> {
    try {
      // First, delete any existing default for this user
      await db
        .delete(userDefaultSmsProviders)
        .where(eq(userDefaultSmsProviders.userId, data.userId));

      // Then insert the new default
      const defaultProvider = await db.insert(userDefaultSmsProviders).values(data).returning();
      return defaultProvider[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to set default SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getUserDefault(userId: string): Promise<UserDefaultSmsProvider | null> {
    try {
      const defaults = await db
        .select()
        .from(userDefaultSmsProviders)
        .where(eq(userDefaultSmsProviders.userId, userId))
        .limit(1);

      return defaults[0] || null;
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch user default SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getUserDefaultWithProvider(userId: string) {
    try {
      const result = await db
        .select({
          defaultId: userDefaultSmsProviders.id,
          providerId: userDefaultSmsProviders.providerId,
          providerName: smsProviders.name,
          providerDescription: smsProviders.description,
          createdAt: userDefaultSmsProviders.createdAt,
        })
        .from(userDefaultSmsProviders)
        .innerJoin(smsProviders, eq(userDefaultSmsProviders.providerId, smsProviders.id))
        .where(eq(userDefaultSmsProviders.userId, userId))
        .limit(1);

      const defaultProvider = result[0];
      if (!defaultProvider) {
        return null;
      }

      return {
        ...defaultProvider,
        createdAt: defaultProvider.createdAt?.toISOString() || "",
      };
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch user default SMS provider with details",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async removeUserDefault(userId: string): Promise<void> {
    try {
      await db
        .delete(userDefaultSmsProviders)
        .where(eq(userDefaultSmsProviders.userId, userId));
    }
    catch (error) {
      throw new AppError(
        "Failed to remove user default SMS provider",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};

export const systemConfigService = {
  // System SMS Provider Configuration CRUD
  async createSystemConfig(data: NewSystemSmsProviderConfig): Promise<SystemSmsProviderConfig> {
    try {
      const config = await db.insert(systemSmsProviderConfigs).values(data).returning();
      return config[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create system SMS configuration",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getAllSystemConfigs(): Promise<SystemSmsProviderConfig[]> {
    try {
      return await db.select().from(systemSmsProviderConfigs);
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch system SMS configurations",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async getSystemConfigsWithProvider() {
    try {
      const result = await db
        .select({
          configId: systemSmsProviderConfigs.id,
          providerId: systemSmsProviderConfigs.providerId,
          providerName: smsProviders.name,
          providerDescription: smsProviders.description,
          apiKey: systemSmsProviderConfigs.apiKey,
          senderId: systemSmsProviderConfigs.senderId,
          createdAt: systemSmsProviderConfigs.createdAt,
        })
        .from(systemSmsProviderConfigs)
        .innerJoin(smsProviders, eq(systemSmsProviderConfigs.providerId, smsProviders.id));

      // Format dates for API response
      return result.map(config => ({
        ...config,
        createdAt: config.createdAt?.toISOString() || "",
      }));
    }
    catch (error) {
      throw new AppError(
        "Failed to fetch system SMS configurations with provider details",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async updateSystemConfig(configId: string, data: Partial<NewSystemSmsProviderConfig>): Promise<SystemSmsProviderConfig> {
    try {
      const updated = await db
        .update(systemSmsProviderConfigs)
        .set(data)
        .where(eq(systemSmsProviderConfigs.id, configId))
        .returning();

      if (updated.length === 0) {
        throw new AppError(
          "System SMS configuration not found",
          HttpStatusCodes.NOT_FOUND,
        );
      }

      return updated[0];
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to update system SMS configuration",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },

  async deleteSystemConfig(configId: string): Promise<void> {
    try {
      const deleted = await db
        .delete(systemSmsProviderConfigs)
        .where(eq(systemSmsProviderConfigs.id, configId))
        .returning();

      if (deleted.length === 0) {
        throw new AppError(
          "System SMS configuration not found",
          HttpStatusCodes.NOT_FOUND,
        );
      }
    }
    catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        "Failed to delete system SMS configuration",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  },
};
