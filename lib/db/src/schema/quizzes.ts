import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { packagesTable } from "./packages";
import { questionsTable } from "./questions";

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").notNull().references(() => packagesTable.id),
  title: text("title").notNull(),
  description: text("description"),
  timeLimit: integer("time_limit").notNull().default(30),
  passingScore: integer("passing_score").notNull().default(70),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  questionId: integer("question_id").notNull().references(() => questionsTable.id),
  orderIndex: integer("order_index").notNull().default(0),
});

export const quizzesRelations = relations(quizzesTable, ({ one, many }) => ({
  package: one(packagesTable, { fields: [quizzesTable.packageId], references: [packagesTable.id] }),
  quizQuestions: many(quizQuestionsTable),
}));

export const quizQuestionsRelations = relations(quizQuestionsTable, ({ one }) => ({
  quiz: one(quizzesTable, { fields: [quizQuestionsTable.quizId], references: [quizzesTable.id] }),
  question: one(questionsTable, { fields: [quizQuestionsTable.questionId], references: [questionsTable.id] }),
}));

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;
