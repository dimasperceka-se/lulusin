import { pgTable, text, serial, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { quizzesTable } from "./quizzes";
import { tryoutsTable } from "./tryouts";

export const attemptsTable = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  quizId: integer("quiz_id").references(() => quizzesTable.id),
  tryoutId: integer("tryout_id").references(() => tryoutsTable.id),
  type: text("type", { enum: ["quiz", "tryout"] }).notNull(),
  score: real("score"),
  twkScore: real("twk_score"),
  tiuScore: real("tiu_score"),
  tkpScore: real("tkp_score"),
  answersJson: jsonb("answers_json"),
  rating: integer("rating"),
  ratingComment: text("rating_comment"),
  ratedAt: timestamp("rated_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attemptsRelations = relations(attemptsTable, ({ one }) => ({
  user: one(usersTable, { fields: [attemptsTable.userId], references: [usersTable.id] }),
  quiz: one(quizzesTable, { fields: [attemptsTable.quizId], references: [quizzesTable.id] }),
  tryout: one(tryoutsTable, { fields: [attemptsTable.tryoutId], references: [tryoutsTable.id] }),
}));

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({ id: true, createdAt: true });
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;
