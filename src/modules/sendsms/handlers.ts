import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import type { SendSmsRoute } from "./routes";
import smsService from "./service";

export const send: AppRouteHandler<SendSmsRoute> = async (c) => {
  const data = c.req.valid("json");
  const userId = c.get("jwt").jwtPayload?.userId;

  if (!userId) {
    return c.json(
      { message: "Unauthorized" }, 
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const messageData = {
    ...data,
    userId,
  };

  const message = await smsService.sendSms(messageData);
  return c.json(message, HttpStatusCodes.CREATED);
  
};