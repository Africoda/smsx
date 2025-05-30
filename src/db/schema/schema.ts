import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  otherNames: text("other_names"),
  email: text("email").notNull(),
  phone_number: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  smsConsent: text("sms_consent").default("true"),
});

export const selectContactsSchema = createSelectSchema(contacts);
export const insertContactsSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const selectUsersSchema = createSelectSchema(users);
export const insertUsersSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

// messages table
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  contactId: uuid("contact_id").notNull().references(() => contacts.id),
  content: text("content").notNull(),
  status: text("status").default("pending"), 
  providerResponse: text("provider_response"), 
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


export const selectMessagesSchema = createSelectSchema(messages);
export const insertMessagesSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});


export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

