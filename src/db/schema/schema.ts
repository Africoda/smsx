import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// contacts
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

// messages
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  contactId: uuid("contact_id").notNull().references(() => contacts.id),
  content: text("content").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  providerResponse: text("provider_response"), // raw API response
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// campaigns
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// message History
export const messageHistory = pgTable("message_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id),
  recipient_contacts: text("recipient_contacts").array().notNull(), // Array of recipient contacts
  content: text("content").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  providerResponse: text("provider_response"), // raw API response
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 1️⃣ Master list of SMS Providers
export const smsProviders = pgTable("sms_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // e.g., "Twilio", "MNotify"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 2️⃣ User's API key for each SMS Provider
export const userSmsProviderConfigs = pgTable(
  "user_sms_provider_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    providerId: uuid("provider_id").notNull().references(() => smsProviders.id),
    apiKey: text("api_key").notNull(),
    senderId: text("sender_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // ✅ Table-level constraints go here
  table => ({
    uniqueUserSmsProvider: unique().on(table.userId, table.providerId),
  }),
);

// 3️⃣ User's default SMS Provider
export const userDefaultSmsProviders = pgTable("user_default_sms_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id), // 1 default per user
  providerId: uuid("provider_id").notNull().references(() => smsProviders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4️⃣ System-level fallback config for SMS Providers
export const systemSmsProviderConfigs = pgTable("system_sms_provider_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").notNull().unique().references(() => smsProviders.id),
  apiKey: text("api_key").notNull(),
  senderId: text("sender_id"), // Optional
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const selectMessagesSchema = createSelectSchema(messages);
export const insertMessagesSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCampaignsSchema = createSelectSchema(campaigns);
export const insertCampaignsSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const selectMessageHistorySchema = createSelectSchema(messageHistory);
export const insertMessageHistorySchema = createInsertSchema(messageHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Zod Schemas for validation
export const selectSmsProvidersSchema = createSelectSchema(smsProviders);
export const insertSmsProvidersSchema = createInsertSchema(smsProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSmsProviderConfigsSchema = createSelectSchema(userSmsProviderConfigs);
export const insertUserSmsProviderConfigsSchema = createInsertSchema(userSmsProviderConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserDefaultSmsProvidersSchema = createSelectSchema(userDefaultSmsProviders);
export const insertUserDefaultSmsProvidersSchema = createInsertSchema(userDefaultSmsProviders).omit({
  id: true,
  createdAt: true,
});

export const selectSystemSmsProviderConfigsSchema = createSelectSchema(systemSmsProviderConfigs);
export const insertSystemSmsProviderConfigsSchema = createInsertSchema(systemSmsProviderConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

export type MessageHistory = typeof messageHistory.$inferSelect;
export type NewMessageHistory = typeof messageHistory.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// TypeScript Inference
export type SmsProvider = typeof smsProviders.$inferSelect;
export type NewSmsProvider = typeof smsProviders.$inferInsert;

export type UserSmsProviderConfig = typeof userSmsProviderConfigs.$inferSelect;
export type NewUserSmsProviderConfig = typeof userSmsProviderConfigs.$inferInsert;

export type UserDefaultSmsProvider = typeof userDefaultSmsProviders.$inferSelect;
export type NewUserDefaultSmsProvider = typeof userDefaultSmsProviders.$inferInsert;

export type SystemSmsProviderConfig = typeof systemSmsProviderConfigs.$inferSelect;
export type NewSystemSmsProviderConfig = typeof systemSmsProviderConfigs.$inferInsert;
