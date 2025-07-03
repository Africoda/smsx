import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

import { sendBulkSmsHandler } from "./handlers";

export const sendBulkSmsRoute = createRoute({
  method: "post",
  path: "/send-bulk-sms",
  tags: ["Bulk SMS"],
  request: {
    body: jsonContentRequired(
      z.object({
        sender: z.string().min(1),
        message: z.string().min(1),
        recipients: z.array(z.string().min(10)), // List of phone numbers
      }),
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        status: z.literal("success"),
        totalSent: z.number(),
        totalFailed: z.number(),
      }),
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
    ),
  },
  handler: sendBulkSmsHandler,
});
