import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { insertContactsSchema, selectContactsSchema } from "@/db/schema/schema";
import { badRequestSchema } from "@/lib/constants";

// Create notification route
export const createContact = createRoute({
  path: "/contacts",
  method: "post",
  tags: ["Contacts"],
  security: [
    {
      Bearer: [],
    },
  ],
  request: {
    body: jsonContentRequired(insertContactsSchema, "Contact data"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectContactsSchema,
      "Contact created successfully",
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
