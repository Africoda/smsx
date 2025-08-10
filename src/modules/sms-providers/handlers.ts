import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type {
  CreateProviderRoute,
  CreateSystemConfigRoute,
  CreateUserConfigRoute,
  DeleteProviderRoute,
  DeleteSystemConfigRoute,
  DeleteUserConfigRoute,
  GetAllProvidersRoute,
  GetAllSystemConfigsRoute,
  GetProviderByIdRoute,
  GetUserConfigsRoute,
  GetUserDefaultProviderRoute,
  RemoveUserDefaultProviderRoute,
  SetUserDefaultProviderRoute,
  UpdateProviderRoute,
  UpdateSystemConfigRoute,
  UpdateUserConfigRoute,
} from "./routes";

import {
  smsProviderService,
  systemConfigService,
  userDefaultProviderService,
  userSmsConfigService,
} from "./service";

// ========== SMS PROVIDERS HANDLERS ==========

export const createProvider: AppRouteHandler<CreateProviderRoute> = async (c) => {
  const data = c.req.valid("json");

  const provider = await smsProviderService.createProvider(data);

  return c.json(provider, HttpStatusCodes.CREATED);
};

export const getAllProviders: AppRouteHandler<GetAllProvidersRoute> = async (c) => {
  const providers = await smsProviderService.getAllProviders();

  return c.json(providers, HttpStatusCodes.OK);
};

export const getProviderById: AppRouteHandler<GetProviderByIdRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const provider = await smsProviderService.getProviderById(id);

  if (!provider) {
    return c.json(
      { message: "SMS Provider not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(provider, HttpStatusCodes.OK);
};

export const updateProvider: AppRouteHandler<UpdateProviderRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const data = c.req.valid("json");

  const provider = await smsProviderService.updateProvider(id, data);

  return c.json(provider, HttpStatusCodes.OK);
};

export const deleteProvider: AppRouteHandler<DeleteProviderRoute> = async (c) => {
  const { id } = c.req.valid("param");

  await smsProviderService.deleteProvider(id);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

// ========== USER SMS CONFIGURATIONS HANDLERS ==========

export const createUserConfig: AppRouteHandler<CreateUserConfigRoute> = async (c) => {
  const data = c.req.valid("json");
  const userId = c.get("jwtPayload")?.userId;

  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const configData = {
    ...data,
    userId,
  };

  const config = await userSmsConfigService.createUserConfig(configData);

  return c.json(config, HttpStatusCodes.CREATED);
};

export const getUserConfigs: AppRouteHandler<GetUserConfigsRoute> = async (c) => {
  const userId = c.get("jwtPayload")?.userId;

  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const configs = await userSmsConfigService.getUserConfigWithProvider(userId);

  return c.json(configs, HttpStatusCodes.OK);
};

export const updateUserConfig: AppRouteHandler<UpdateUserConfigRoute> = async (c) => {
  const { configId } = c.req.valid("param");
  const data = c.req.valid("json");

  const config = await userSmsConfigService.updateUserConfig(configId, data);

  return c.json(config, HttpStatusCodes.OK);
};

export const deleteUserConfig: AppRouteHandler<DeleteUserConfigRoute> = async (c) => {
  const { configId } = c.req.valid("param");

  await userSmsConfigService.deleteUserConfig(configId);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

// ========== USER DEFAULT PROVIDER HANDLERS ==========

export const setUserDefaultProvider: AppRouteHandler<SetUserDefaultProviderRoute> = async (c) => {
  const data = c.req.valid("json");
  const userId = c.get("jwtPayload")?.userId;

  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const defaultProviderData = {
    ...data,
    userId,
  };

  const defaultProvider = await userDefaultProviderService.setDefaultProvider(defaultProviderData);

  return c.json(defaultProvider, HttpStatusCodes.CREATED);
};

export const getUserDefaultProvider: AppRouteHandler<GetUserDefaultProviderRoute> = async (c) => {
  const userId = c.get("jwtPayload")?.userId;

  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const defaultProvider = await userDefaultProviderService.getUserDefaultWithProvider(userId);

  if (!defaultProvider) {
    return c.json(
      { message: "User Default Provider not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(defaultProvider, HttpStatusCodes.OK);
};

export const removeUserDefaultProvider: AppRouteHandler<RemoveUserDefaultProviderRoute> = async (c) => {
  const userId = c.get("jwtPayload")?.userId;

  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }

  await userDefaultProviderService.removeUserDefault(userId);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

// ========== SYSTEM CONFIGURATIONS HANDLERS ==========

export const createSystemConfig: AppRouteHandler<CreateSystemConfigRoute> = async (c) => {
  const data = c.req.valid("json");

  const config = await systemConfigService.createSystemConfig(data);

  return c.json(config, HttpStatusCodes.CREATED);
};

export const getAllSystemConfigs: AppRouteHandler<GetAllSystemConfigsRoute> = async (c) => {
  const configs = await systemConfigService.getSystemConfigsWithProvider();

  return c.json(configs, HttpStatusCodes.OK);
};

export const updateSystemConfig: AppRouteHandler<UpdateSystemConfigRoute> = async (c) => {
  const { configId } = c.req.valid("param");
  const data = c.req.valid("json");

  const config = await systemConfigService.updateSystemConfig(configId, data);

  return c.json(config, HttpStatusCodes.OK);
};

export const deleteSystemConfig: AppRouteHandler<DeleteSystemConfigRoute> = async (c) => {
  const { configId } = c.req.valid("param");

  await systemConfigService.deleteSystemConfig(configId);

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
