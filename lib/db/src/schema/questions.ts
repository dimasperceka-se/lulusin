import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  imageUrl: text("image_url"),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  optionE: text("option_e").notNull(),
  correctAnswer: text("correct_answer", { enum: ["A", "B", "C", "D", "E"] }).notNull(),
  explanation: text("explanation"),
  category: text("category").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull().default("medium"),
  tags: text("tags"),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const questionsRelations = relations(questionsTable, ({ one }) => ({
  creator: one(usersTable, { fields: [questionsTable.createdBy], references: [usersTable.id] }),
}));

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
