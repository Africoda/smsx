import { eq } from "drizzle-orm";

import db from "@/db";
import { contacts, messages } from "@/db/schema/schema";

/**
 * Sends an SMS via MNotify API v1.
 */
export async function sendToMNotify(sender: string, phone: string, content: string): Promise<string> {
  const apiKey = "TmHZe1PVdJBluCv6edcX325N6";
  const url = `https://apps.mnotify.net/smsapi?key=${apiKey}&to=${encodeURIComponent(phone)}&msg=${encodeURIComponent(content)}&sender_id=${encodeURIComponent(sender)}`;

  const response = await fetch(url);
  const text = await response.text();

  return text;
}

/**
 * Finds a contact's ID by phone number.
 */
export async function getContactIdByPhone(phone: string): Promise<string | null> {
  const contact = await db.select().from(contacts).where(eq(contacts.phone_number, phone)).limit(1);
  return contact.length > 0 ? contact[0].id : null;
}

/**
 * Inserts a message into the database.
 */
export async function insertMessageToDb({
  phone,
  contactId,
  message,
  status,
  response,
}: {
  phone: string;
  contactId: string | null;
  message: string;
  status: "sent" | "failed";
  response: string;
}): Promise<void> {
  await db.insert(messages).values({
    contactId: contactId ?? null,
    userId: "some-user-id", // replace with real user from token/session
    content: message,
    status,
    providerResponse: response,
  });
}
