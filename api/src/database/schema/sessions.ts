import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { InferSelectModel, relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

const baseSchema = createInsertSchema(sessions, {
  token: val => val.min(1, { message: "Token is required" }),
  userId: val => val.min(1, { message: "User ID is required" }),
  ipAddress: val => val.optional(),
  userAgent: val => val.optional(),
  expiresAt: val => val.min(new Date(), { message: "Please provide a valid expiration date" }),
  createdAt: val => val.optional(),
  updatedAt: val => val.optional(),
});

export const sessionsSchema = z.union([
  z.object({
    mode: z.literal("create"),
    token: baseSchema.shape.token,
    userId: baseSchema.shape.userId,
    ipAddress: baseSchema.shape.ipAddress,
    userAgent: baseSchema.shape.userAgent,
    expiresAt: baseSchema.shape.expiresAt,
  }),
  z.object({
    mode: z.literal("update"),
    id: baseSchema.shape.id,
    expiresAt: baseSchema.shape.expiresAt,
  }),
  z.object({
    mode: z.literal("delete"),
    id: baseSchema.shape.id,
  }),
]);

export type Session = InferSelectModel<typeof sessions>;
export type SessionSchema = z.infer<typeof sessionsSchema>;
