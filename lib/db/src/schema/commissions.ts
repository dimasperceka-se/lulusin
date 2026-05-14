import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const commissionsTable = pgTable("commissions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique().references(() => ordersTable.id),
  holderUserId: integer("holder_user_id").notNull().references(() => usersTable.id),
  refereeUserId: integer("referee_user_id").notNull().references(() => usersTable.id),
  referralCode: text("referral_code").notNull(),
  paidAmount: integer("paid_amount").notNull(),
  commissionAmount: integer("commission_amount").notNull(),
  status: text("status", { enum: ["PENDING", "PAID"] }).notNull().default("PENDING"),
  payoutAt: timestamp("payout_at", { withTimezone: true }),
  payoutBy: integer("payout_by").references(() => usersTable.id),
  payoutNote: text("payout_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const commissionsRelations = relations(commissionsTable, ({ one }) => ({
  order: one(ordersTable, { fields: [commissionsTable.orderId], references: [ordersTable.id] }),
  holder: one(usersTable, { fields: [commissionsTable.holderUserId], references: [usersTable.id], relationName: "commissionHolder" }),
  referee: one(usersTable, { fields: [commissionsTable.refereeUserId], references: [usersTable.id], relationName: "commissionReferee" }),
}));

export const insertCommissionSchema = createInsertSchema(commissionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissionsTable.$inferSelect;
