import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { packagesTable } from "./packages";

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  expiredAt: timestamp("expired_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enrollmentsRelations = relations(enrollmentsTable, ({ one }) => ({
  user: one(usersTable, { fields: [enrollmentsTable.userId], references: [usersTable.id] }),
  package: one(packagesTable, { fields: [enrollmentsTable.packageId], references: [packagesTable.id] }),
}));

export const insertEnrollmentSchema = createInsertSchema(enrollmentsTable).omit({ id: true, createdAt: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollmentsTable.$inferSelect;
