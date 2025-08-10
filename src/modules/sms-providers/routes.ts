import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import {
  insertSmsProvidersSchema,
  insertSystemSmsProviderConfigsSchema,
  insertUserDefaultSmsProvidersSchema,
  insertUserSmsProviderConfigsSchema,
  selectSmsProvidersSchema,
  selectSystemSmsProviderConfigsSchema,
  selectUserDefaultSmsProvidersSchema,
  selectUserSmsProviderConfigsSchema,
} from "@/db/schema/schema";
import { badRequestSchema } from "@/lib/constants";

// Common response schemas
const userConfigWithProviderSchema = z.object({
  configId: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  apiKey: z.string(),
  senderId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

const userDefaultWithProviderSchema = z.object({
  defaultId: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  providerDescription: z.string().nullable(),
  createdAt: z.string().datetime(),
});

const systemConfigWithProviderSchema = z.object({
  configId: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  providerDescription: z.string().nullable(),
  apiKey: z.string(),
  senderId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

// ========== SMS PROVIDERS ROUTES ==========

// Create SMS Provider
export const createProvider = createRoute({
  path: "/providers",
  method: "post",
  tags: ["SMS Providers"],
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(insertSmsProvidersSchema, "SMS Provider data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectSmsProvidersSchema,
      "SMS Provider created successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Get All SMS Providers
export const getAllProviders = createRoute({
  path: "/providers",
  method: "get",
  tags: ["SMS Providers"],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSmsProvidersSchema.array(),
      "SMS Providers retrieved successfully",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Get SMS Provider by ID
export const getProviderById = createRoute({
  path: "/providers/{id}",
  method: "get",
  tags: ["SMS Providers"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSmsProvidersSchema,
      "SMS Provider retrieved successfully",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "SMS Provider not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Update SMS Provider
export const updateProvider = createRoute({
  path: "/providers/{id}",
  method: "put",
  tags: ["SMS Providers"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
    body: jsonContentRequired(insertSmsProvidersSchema.partial(), "SMS Provider update data"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSmsProvidersSchema,
      "SMS Provider updated successfully",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "SMS Provider not found",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Delete SMS Provider
export const deleteProvider = createRoute({
  path: "/providers/{id}",
  method: "delete",
  tags: ["SMS Providers"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "SMS Provider deleted successfully",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "SMS Provider not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// ========== USER SMS CONFIGURATIONS ROUTES ==========

// Create User SMS Configuration
export const createUserConfig = createRoute({
  path: "/user-configs",
  method: "post",
  tags: ["User SMS Configurations"],
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(
      insertUserSmsProviderConfigsSchema.omit({ userId: true }),
      "User SMS Configuration data",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectUserSmsProviderConfigsSchema,
      "User SMS Configuration created successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Get User SMS Configurations
export const getUserConfigs = createRoute({
  path: "/user-configs",
  method: "get",
  tags: ["User SMS Configurations"],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      userConfigWithProviderSchema.array(),
      "User SMS Configurations retrieved successfully",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Update User SMS Configuration
export const updateUserConfig = createRoute({
  path: "/user-configs/{configId}",
  method: "put",
  tags: ["User SMS Configurations"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      configId: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
    body: jsonContentRequired(
      insertUserSmsProviderConfigsSchema.omit({ userId: true }).partial(),
      "User SMS Configuration update data",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectUserSmsProviderConfigsSchema,
      "User SMS Configuration updated successfully",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "User SMS Configuration not found",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Delete User SMS Configuration
export const deleteUserConfig = createRoute({
  path: "/user-configs/{configId}",
  method: "delete",
  tags: ["User SMS Configurations"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      configId: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "User SMS Configuration deleted successfully",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "User SMS Configuration not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// ========== USER DEFAULT PROVIDER ROUTES ==========

// Set User Default Provider
export const setUserDefaultProvider = createRoute({
  path: "/user-default",
  method: "post",
  tags: ["User Default Provider"],
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(
      insertUserDefaultSmsProvidersSchema.omit({ userId: true }),
      "User Default Provider data",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectUserDefaultSmsProvidersSchema,
      "User Default Provider set successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Get User Default Provider
export const getUserDefaultProvider = createRoute({
  path: "/user-default",
  method: "get",
  tags: ["User Default Provider"],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      userDefaultWithProviderSchema,
      "User Default Provider retrieved successfully",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "User Default Provider not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Remove User Default Provider
export const removeUserDefaultProvider = createRoute({
  path: "/user-default",
  method: "delete",
  tags: ["User Default Provider"],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "User Default Provider removed successfully",
    },
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// ========== SYSTEM CONFIGURATIONS ROUTES ==========

// Create System SMS Configuration
export const createSystemConfig = createRoute({
  path: "/system-configs",
  method: "post",
  tags: ["System SMS Configurations"],
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(insertSystemSmsProviderConfigsSchema, "System SMS Configuration data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectSystemSmsProviderConfigsSchema,
      "System SMS Configuration created successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Get All System SMS Configurations
export const getAllSystemConfigs = createRoute({
  path: "/system-configs",
  method: "get",
  tags: ["System SMS Configurations"],
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      systemConfigWithProviderSchema.array(),
      "System SMS Configurations retrieved successfully",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Update System SMS Configuration
export const updateSystemConfig = createRoute({
  path: "/system-configs/{configId}",
  method: "put",
  tags: ["System SMS Configurations"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      configId: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
    body: jsonContentRequired(insertSystemSmsProviderConfigsSchema.partial(), "System SMS Configuration update data"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectSystemSmsProviderConfigsSchema,
      "System SMS Configuration updated successfully",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "System SMS Configuration not found",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Delete System SMS Configuration
export const deleteSystemConfig = createRoute({
  path: "/system-configs/{configId}",
  method: "delete",
  tags: ["System SMS Configurations"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      configId: z.string().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "System SMS Configuration deleted successfully",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      badRequestSchema,
      "System SMS Configuration not found",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized",
    ),
  },
});

// Export route types
export type CreateProviderRoute = typeof createProvider;
export type GetAllProvidersRoute = typeof getAllProviders;
export type GetProviderByIdRoute = typeof getProviderById;
export type UpdateProviderRoute = typeof updateProvider;
export type DeleteProviderRoute = typeof deleteProvider;

export type CreateUserConfigRoute = typeof createUserConfig;
export type GetUserConfigsRoute = typeof getUserConfigs;
export type UpdateUserConfigRoute = typeof updateUserConfig;
export type DeleteUserConfigRoute = typeof deleteUserConfig;

export type SetUserDefaultProviderRoute = typeof setUserDefaultProvider;
export type GetUserDefaultProviderRoute = typeof getUserDefaultProvider;
export type RemoveUserDefaultProviderRoute = typeof removeUserDefaultProvider;

export type CreateSystemConfigRoute = typeof createSystemConfig;
export type GetAllSystemConfigsRoute = typeof getAllSystemConfigs;
export type UpdateSystemConfigRoute = typeof updateSystemConfig;
export type DeleteSystemConfigRoute = typeof deleteSystemConfig;
