import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { insertMessagesSchema, selectMessagesSchema } from "@/db/schema/schema";
import { badRequestSchema } from "@/lib/constants";

export const sendSms = createRoute({
  path: "/send-sms",
  method: "post",
  tags: ["SMS"],
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(
      insertMessagesSchema.pick({
        contactId: true,
        content: true,
      }),
      "SMS data"
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      selectMessagesSchema,
      "SMS sent successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      badRequestSchema,
      "Invalid request"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      badRequestSchema,
      "Unauthorized"
    ),
  },
});

export type SendSmsRoute = typeof sendSms;