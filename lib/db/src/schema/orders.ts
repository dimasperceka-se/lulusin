import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { packagesTable } from "./packages";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  orderCode: text("order_code").notNull().unique(),
  amount: integer("amount").notNull(),
  uniqueAmount: integer("unique_amount").notNull(),
  status: text("status", { enum: ["PENDING", "WAITING_VERIFICATION", "PAID", "EXPIRED", "REJECTED"] }).notNull().default("PENDING"),
  paymentMethod: text("payment_method", { enum: ["BANK_TRANSFER", "QRIS"] }).notNull().default("BANK_TRANSFER"),
  paymentProof: text("payment_proof"),
  qrisContent: text("qris_content"),
  qrisInvoiceId: text("qris_invoice_id"),
  qrisNmid: text("qris_nmid"),
  qrisGeneratedAt: timestamp("qris_generated_at", { withTimezone: true }),
  expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  verifiedBy: integer("verified_by").references(() => usersTable.id),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ordersRelations = relations(ordersTable, ({ one }) => ({
  user: one(usersTable, { fields: [ordersTable.userId], references: [usersTable.id] }),
  package: one(packagesTable, { fields: [ordersTable.packageId], references: [packagesTable.id] }),
}));

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
