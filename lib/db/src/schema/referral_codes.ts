import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const referralCodesTable = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  holderUserId: integer("holder_user_id").notNull().references(() => usersTable.id),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const referralCodesRelations = relations(referralCodesTable, ({ one }) => ({
  holder: one(usersTable, { fields: [referralCodesTable.holderUserId], references: [usersTable.id] }),
}));

export const insertReferralCodeSchema = createInsertSchema(referralCodesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type ReferralCode = typeof referralCodesTable.$inferSelect;
