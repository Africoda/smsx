import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { z } from "zod";

export const sendBulkSms = createRoute({
  method: "post",
  path: "/send",
  tags: ["Bulk SMS", "SMS"],
  request: {
    body: jsonContentRequired(
      z.object({
        sender: z.string().min(1),
        message: z.string().min(1),
        recipients: z.array(z.string().min(1)), // List of phone numbers
      }),
      "Send Bulk SMS Request",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        status: z.literal("success"),
        totalSent: z.number(),
        totalFailed: z.number(),
      }),
      "Send Bulk SMS Response",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      "Bad Request",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      "Internal Server Error",
    ),
  },
});

export type SendBulkSmsRoute = typeof sendBulkSms;
