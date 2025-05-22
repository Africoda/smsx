import * as HttpStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import type { CreateContactRoute } from "./routes";

import contactService from "./service";

export const create: AppRouteHandler<CreateContactRoute> = async (c) => {
  const data = c.req.valid("json");
  const contact = await contactService.createContact(data);
  return c.json(contact, HttpStatusCodes.CREATED);
};
