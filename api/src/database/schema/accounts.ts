import z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, index, pgEnum, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const providerEnum = pgEnum("providers", ["google", "github", "credentials"]);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scope: text("scope"),
    type: text("type").notNull(),
    password: text("password"),
    provider: providerEnum().notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  account => ({
    userIdx: index().on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

const baseSchema = createInsertSchema(accounts, {
  userId: val => val.min(1, { message: "User ID is required" }),
  scope: val => val.optional(),
  type: val => val.min(1, { message: "Type is required" }),
  password: val => val.min(8, { message: "Password must be at least 8 characters" }).optional(),
  provider: val => val.default("credentials"),
  providerId: val => val.min(1, { message: "Provider ID is required" }),
  accessToken: val => val.optional(),
  createdAt: val => val.optional(),
  updatedAt: val => val.optional(),
});

const accountsSchema = z.union([
  z.object({
    mode: z.literal("credentialsSignIn"),
    userId: baseSchema.shape.userId,
    type: baseSchema.shape.type,
    password: baseSchema.shape.password,
    provider: baseSchema.shape.provider,
  }),
  z.object({
    mode: z.literal("oauthSignIn"),
    userId: baseSchema.shape.userId,
    type: baseSchema.shape.type,
    provider: baseSchema.shape.provider,
    providerId: baseSchema.shape.providerId,
    accessToken: z.string().min(1, { message: "Access token is required" }),
    scope: z.string().min(1, { message: "Scope is required" }),
  }),
]);

export type Account = InferSelectModel<typeof accounts>;
export type AccountSchema = z.infer<typeof accountsSchema>;
