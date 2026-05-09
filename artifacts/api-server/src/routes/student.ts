import { Router } from "express";
import { db, enrollmentsTable, packagesTable, attemptsTable, materialProgressTable, quizzesTable, tryoutsTable } from "@workspace/db";
import { eq, and, sql, desc, avg } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/student/dashboard", authenticate, requireRole("student"), async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  const enrollments = await db.select().from(enrollmentsTable).where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.isActive, true)));
  const activeEnrollments = await Promise.all(enrollments.map(async (e) => {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, e.packageId));
    return { ...e, package: pkg, progressPercent: 0 };
  }));

  const [{ totalQuizzesTaken }] = await db.select({ totalQuizzesTaken: sql<number>`count(*)` }).from(attemptsTable).where(
    and(eq(attemptsTable.userId, userId), eq(attemptsTable.type, "quiz"), sql`${attemptsTable.finishedAt} IS NOT NULL`)
  );

  const [avgResult] = await db.select({ avg: avg(attemptsTable.score) }).from(attemptsTable).where(
    and(eq(attemptsTable.userId, userId), sql`${attemptsTable.finishedAt} IS NOT NULL`)
  );

  const [lastTryout] = await db.select({ score: attemptsTable.score }).from(attemptsTable).where(
    and(eq(attemptsTable.userId, userId), eq(attemptsTable.type, "tryout"), sql`${attemptsTable.finishedAt} IS NOT NULL`)
  ).orderBy(desc(attemptsTable.finishedAt)).limit(1);

  const recentAttempts = await db.select().from(attemptsTable).where(
    and(eq(attemptsTable.userId, userId), sql`${attemptsTable.finishedAt} IS NOT NULL`)
  ).orderBy(desc(attemptsTable.createdAt)).limit(5);

  const enrichedAttempts = await Promise.all(recentAttempts.map(async (a) => {
    let quizTitle = null, tryoutTitle = null;
    if (a.quizId) {
      const [q] = await db.select({ title: quizzesTable.title }).from(quizzesTable).where(eq(quizzesTable.id, a.quizId));
      quizTitle = q?.title ?? null;
    }
    if (a.tryoutId) {
      const [t] = await db.select({ title: tryoutsTable.title }).from(tryoutsTable).where(eq(tryoutsTable.id, a.tryoutId));
      tryoutTitle = t?.title ?? null;
    }
    return { ...a, quizTitle, tryoutTitle };
  }));

  res.json({
    activeEnrollments,
    totalQuizzesTaken: Number(totalQuizzesTaken),
    averageScore: Number(avgResult?.avg ?? 0),
    latestTryoutScore: lastTryout?.score ?? null,
    recentAttempts: enrichedAttempts,
  });
});

router.get("/student/score-history", authenticate, requireRole("student"), async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const attempts = await db.select().from(attemptsTable).where(
    and(eq(attemptsTable.userId, userId), sql`${attemptsTable.finishedAt} IS NOT NULL`)
  ).orderBy(attemptsTable.finishedAt).limit(20);

  const enriched = await Promise.all(attempts.map(async (a) => {
    let title = "Untitled";
    if (a.quizId) {
      const [q] = await db.select({ title: quizzesTable.title }).from(quizzesTable).where(eq(quizzesTable.id, a.quizId));
      title = q?.title ?? "Quiz";
    }
    if (a.tryoutId) {
      const [t] = await db.select({ title: tryoutsTable.title }).from(tryoutsTable).where(eq(tryoutsTable.id, a.tryoutId));
      title = t?.title ?? "Tryout";
    }
    return {
      date: (a.finishedAt ?? a.createdAt).toISOString().slice(0, 10),
      score: a.score ?? 0,
      type: a.type,
      title,
    };
  }));

  res.json(enriched);
});

export default router;
