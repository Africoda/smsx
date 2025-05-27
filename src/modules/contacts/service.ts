import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Contact, NewContact } from "@/db/schema/schema";

import db from "@/db";
import { contacts } from "@/db/schema/schema";
import { AppError } from "@/utils/error";

export const contactService = {
  async createContact(data: NewContact): Promise<Contact> {
    try {
      const contact = await db.insert(contacts).values(data).returning();
      return contact[0];
    }
    catch (error) {
      throw new AppError(
        "Failed to create contact",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  },
};
export default contactService;
