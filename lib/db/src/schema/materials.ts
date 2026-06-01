import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { packagesTable } from "./packages";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  content: text("content"),
  category: text("category"),
  tier: text("tier", { enum: ["free", "basic", "advance"] }).notNull().default("free"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const materialProgressTable = pgTable("material_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  materialId: integer("material_id").notNull().references(() => materialsTable.id),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
});

export const materialsRelations = relations(materialsTable, ({ one, many }) => ({
  package: one(packagesTable, { fields: [materialsTable.packageId], references: [packagesTable.id] }),
  progress: many(materialProgressTable),
}));

export const materialProgressRelations = relations(materialProgressTable, ({ one }) => ({
  user: one(usersTable, { fields: [materialProgressTable.userId], references: [usersTable.id] }),
  material: one(materialsTable, { fields: [materialProgressTable.materialId], references: [materialsTable.id] }),
}));

export const insertMaterialSchema = createInsertSchema(materialsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materialsTable.$inferSelect;
export type MaterialProgress = typeof materialProgressTable.$inferSelect;
