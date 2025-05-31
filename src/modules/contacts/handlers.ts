import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateContactRoute } from "./routes";

import contactService from "./service";

export const create: AppRouteHandler<CreateContactRoute> = async (c) => {
  const data = c.req.valid("json");
  const userId = c.get("jwt").jwtPayload?.userId;
  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const contactData = {
    ...data,
    userId,
  };
  const contact = await contactService.createContact(contactData);
  if (!contact) {
    return c.json({ message: "Failed to create contact" }, HttpStatusCodes.BAD_REQUEST);
  }

  return c.json(contact, HttpStatusCodes.CREATED);
};
