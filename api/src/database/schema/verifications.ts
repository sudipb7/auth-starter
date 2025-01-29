import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const verifications = pgTable("verifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const baseSchema = createInsertSchema(verifications, {
  identifier: val => val.min(1, { message: "Identifier is required" }),
  token: val => val.min(1, { message: "Token is required" }),
  expiresAt: val => val.min(new Date(), { message: "Please provide a valid expiration date" }),
  createdAt: val => val.optional(),
  updatedAt: val => val.optional(),
});

export const verificationsSchema = z.union([
  z.object({
    mode: z.literal("create"),
    identifier: baseSchema.shape.identifier,
    token: baseSchema.shape.token,
    expiresAt: baseSchema.shape.expiresAt,
  }),
  z.object({
    mode: z.literal("delete"),
    id: baseSchema.shape.id,
  }),
]);

export type Verification = InferSelectModel<typeof verifications>;
export type VerificationSchema = z.infer<typeof verificationsSchema>;
