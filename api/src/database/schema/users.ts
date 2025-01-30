import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { InferSelectModel, relations } from "drizzle-orm";
import { text, timestamp, pgTable } from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { sessions } from "./sessions";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  image: text("image"),
  emailVerified: timestamp("email_verified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

const baseSchema = createInsertSchema(users, {
  id: val => val.min(1, { message: "ID is required" }),
  name: val =>
    val
      .min(3, { message: "Name must be at least 3 characters" })
      .max(64, { message: "Name must be at most 64 characters" }),
  email: val =>
    val.min(1, { message: "Email is required" }).email({ message: "Please provide a valid email" }),
  emailVerified: val => val.optional(),
  image: val => val.url({ message: "Please provide a valid image URL" }).optional(),
  createdAt: val => val.optional(),
  updatedAt: val => val.optional(),
});

export const userSchema = z.union([
  z.object({
    mode: z.literal("emailSignUp"),
    name: baseSchema.shape.name,
    email: baseSchema.shape.email,
    image: baseSchema.shape.image,
  }),
  z.object({
    mode: z.literal("emailSignIn"),
    email: baseSchema.shape.email,
  }),
  z.object({
    mode: z.literal("oauthSignIn"),
    name: baseSchema.shape.name,
    email: baseSchema.shape.email,
    emailVerified: z.date({ message: "Please provide a valid date" }),
    image: baseSchema.shape.image,
  }),
  z.object({
    mode: z.literal("update"),
    id: baseSchema.shape.id,
    name: baseSchema.shape.name,
    image: baseSchema.shape.image,
    emailVerified: z.date({ message: "Please provide a valid date" }).optional(),
  }),
]);

export type User = InferSelectModel<typeof users>;
export type UserSchema = z.infer<typeof userSchema>;
