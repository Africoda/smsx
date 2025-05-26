import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { contacts, users } from "./schema";

export const messagesHistorySchema = pgTable("message_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  contactId: uuid("contact_id").notNull().references(() => contacts.id),
  messageConent: varchar("message_content", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  sent_at: timestamp("sent_at").defaultNow(),
});

export const messagesHistorySelectSchema = createSelectSchema(messagesHistorySchema);
export const messagesHistoryInsertSchema = createInsertSchema(messagesHistorySchema).omit({
  id: true,
  sent_at: true,
});

export type MessagesHistory = typeof messagesHistorySchema.$inferSelect;
export type NewMessagesHistory = typeof messagesHistorySchema.$inferInsert;
