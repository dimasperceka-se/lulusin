import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { packagesTable } from "./packages";
import { questionsTable } from "./questions";

export const tryoutsTable = pgTable("tryouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["CPNS_SKD", "UTBK", "CUSTOM"] }).notNull().default("CUSTOM"),
  durationMinutes: integer("duration_minutes").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  packageId: integer("package_id").references(() => packagesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const tryoutQuestionsTable = pgTable("tryout_questions", {
  id: serial("id").primaryKey(),
  tryoutId: integer("tryout_id").notNull().references(() => tryoutsTable.id),
  questionId: integer("question_id").notNull().references(() => questionsTable.id),
  subCategory: text("sub_category"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const tryoutsRelations = relations(tryoutsTable, ({ one, many }) => ({
  package: one(packagesTable, { fields: [tryoutsTable.packageId], references: [packagesTable.id] }),
  tryoutQuestions: many(tryoutQuestionsTable),
}));

export const tryoutQuestionsRelations = relations(tryoutQuestionsTable, ({ one }) => ({
  tryout: one(tryoutsTable, { fields: [tryoutQuestionsTable.tryoutId], references: [tryoutsTable.id] }),
  question: one(questionsTable, { fields: [tryoutQuestionsTable.questionId], references: [questionsTable.id] }),
}));

export const insertTryoutSchema = createInsertSchema(tryoutsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTryout = z.infer<typeof insertTryoutSchema>;
export type Tryout = typeof tryoutsTable.$inferSelect;
