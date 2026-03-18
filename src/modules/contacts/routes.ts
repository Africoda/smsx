import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { insertContactsSchema, selectContactsSchema } from "@/db/schema/schema";
import { badRequestSchema, unauthorizedSchema } from "@/lib/constants";

// Create contact route
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
      unauthorizedSchema,
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
  security: [{ Bearer: [] }],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectContactsSchema.array(),
      "Contacts retrieved successfully",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized",
    ),
  },
});

export type GetContactsRoute = typeof getContacts;
