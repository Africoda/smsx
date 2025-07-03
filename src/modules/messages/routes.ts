import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { insertMessagesSchema, selectMessagesSchema } from "@/db/schema/schema";
import { badRequestSchema } from "@/lib/constants";

// Create notification route
export const createMessage = createRoute({
  path: "/bulk-messages",
  method: "post",
  tags: ["Bulk-Messages"],
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: jsonContentRequired(insertMessagesSchema, "Message data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectMessagesSchema,
      "Message created successfully",
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

export type CreateContactRoute = typeof createContact;

// Get all contacts route
export const getContacts = createRoute({
  path: "/contacts",
  method: "get",
  tags: ["Contacts"],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectContactsSchema.array(),
      "Contacts retrieved successfully",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request data",
    ),
  },
});

export type GetContactsRoute = typeof getContacts;
