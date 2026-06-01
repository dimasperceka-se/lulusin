import { Router } from "express";
import { db, quizzesTable, quizQuestionsTable, questionsTable, enrollmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateQuizBody, UpdateQuizBody, AddQuizQuestionBody } from "@workspace/api-zod";

const router = Router();
const TIER_RANK: Record<string, number> = { free: 0, basic: 1, advance: 2 };

router.get("/packages/:packageId/quizzes", authenticate, async (req, res): Promise<void> => {
  const packageId = parseInt(Array.isArray(req.params.packageId) ? req.params.packageId[0] : req.params.packageId, 10);
  const isAdmin = req.user!.role === "admin" || req.user!.role === "tutor";
  let userTierRank = Infinity;
  if (!isAdmin) {
    const enrollments = await db.select().from(enrollmentsTable).where(
      and(eq(enrollmentsTable.userId, req.user!.userId), eq(enrollmentsTable.packageId, packageId), eq(enrollmentsTable.isActive, true))
    );
    userTierRank = enrollments.length === 0 ? -1 : Math.max(...enrollments.map((e) => TIER_RANK[e.tier] ?? 0));
  }
  const quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.packageId, packageId));
  const visible = quizzes.filter((q) => (TIER_RANK[q.tier] ?? 0) <= userTierRank);
  res.json(visible);
});

router.post("/packages/:packageId/quizzes", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const packageId = parseInt(Array.isArray(req.params.packageId) ? req.params.packageId[0] : req.params.packageId, 10);
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db.insert(quizzesTable).values({ ...parsed.data, packageId }).returning();
  res.status(201).json(quiz);
});

router.get("/quizzes/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const quizQs = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, id));
  const questions = await Promise.all(quizQs.map(async (qq) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, qq.questionId));
    return q;
  }));
  res.json({ ...quiz, questions: questions.filter(Boolean) });
});

router.patch("/quizzes/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db.update(quizzesTable).set(parsed.data).where(eq(quizzesTable.id, id)).returning();
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  res.json(quiz);
});

router.delete("/quizzes/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(quizzesTable).where(eq(quizzesTable.id, id));
  res.sendStatus(204);
});

router.post("/quizzes/:id/questions", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = AddQuizQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  await db.insert(quizQuestionsTable).values({ quizId: id, questionId: parsed.data.questionId, orderIndex: parsed.data.orderIndex ?? 0 }).onConflictDoNothing();
  const quizQs = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, id));
  const questions = await Promise.all(quizQs.map(async (qq) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, qq.questionId));
    return q;
  }));
  res.status(201).json({ ...quiz, questions: questions.filter(Boolean) });
});

export default router;
