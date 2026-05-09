import { Router } from "express";
import { db, tryoutsTable, tryoutQuestionsTable, questionsTable, attemptsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateTryoutBody, UpdateTryoutBody, AddTryoutQuestionBody, ListTryoutsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/tryouts", authenticate, async (req, res): Promise<void> => {
  const params = ListTryoutsQueryParams.safeParse(req.query);
  const query = params.success ? params.data : {} as Record<string, unknown>;

  const conditions = [];
  if (query.packageId) conditions.push(eq(tryoutsTable.packageId, query.packageId as number));
  if (query.type) conditions.push(eq(tryoutsTable.type, query.type as "CPNS_SKD" | "UTBK" | "CUSTOM"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const tryouts = await db.select().from(tryoutsTable).where(whereClause);
  res.json(tryouts);
});

router.post("/tryouts", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const parsed = CreateTryoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tryout] = await db.insert(tryoutsTable).values(parsed.data).returning();
  res.status(201).json(tryout);
});

router.get("/tryouts/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [tryout] = await db.select().from(tryoutsTable).where(eq(tryoutsTable.id, id));
  if (!tryout) {
    res.status(404).json({ error: "Tryout not found" });
    return;
  }
  const tryoutQs = await db.select().from(tryoutQuestionsTable).where(eq(tryoutQuestionsTable.tryoutId, id));
  const questions = await Promise.all(tryoutQs.map(async (tq) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, tq.questionId));
    return q ? {
      id: q.id, questionText: q.questionText, imageUrl: q.imageUrl,
      optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, optionE: q.optionE,
      category: q.category, subCategory: tq.subCategory,
    } : null;
  }));
  res.json({ ...tryout, questions: questions.filter(Boolean) });
});

router.patch("/tryouts/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateTryoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tryout] = await db.update(tryoutsTable).set(parsed.data).where(eq(tryoutsTable.id, id)).returning();
  if (!tryout) {
    res.status(404).json({ error: "Tryout not found" });
    return;
  }
  res.json(tryout);
});

router.delete("/tryouts/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(tryoutsTable).where(eq(tryoutsTable.id, id));
  res.sendStatus(204);
});

router.post("/tryouts/:id/questions", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = AddTryoutQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [tryout] = await db.select().from(tryoutsTable).where(eq(tryoutsTable.id, id));
  if (!tryout) {
    res.status(404).json({ error: "Tryout not found" });
    return;
  }
  await db.insert(tryoutQuestionsTable).values({ tryoutId: id, questionId: parsed.data.questionId, subCategory: parsed.data.subCategory ?? null }).onConflictDoNothing();
  const tryoutQs = await db.select().from(tryoutQuestionsTable).where(eq(tryoutQuestionsTable.tryoutId, id));
  const questions = await Promise.all(tryoutQs.map(async (tq) => {
    const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, tq.questionId));
    return q ? { id: q.id, questionText: q.questionText, imageUrl: q.imageUrl, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, optionE: q.optionE, category: q.category, subCategory: tq.subCategory } : null;
  }));
  res.status(201).json({ ...tryout, questions: questions.filter(Boolean) });
});

router.get("/tryouts/:id/ranking", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const userId = req.user!.userId;

  const attempts = await db.select({
    id: attemptsTable.id,
    userId: attemptsTable.userId,
    score: attemptsTable.score,
  }).from(attemptsTable).where(
    and(eq(attemptsTable.tryoutId, id), sql`${attemptsTable.finishedAt} IS NOT NULL`)
  ).orderBy(desc(attemptsTable.score));

  const uniqueMap = new Map<number, { userId: number; score: number }>();
  for (const a of attempts) {
    if (!uniqueMap.has(a.userId) || (a.score ?? 0) > (uniqueMap.get(a.userId)?.score ?? 0)) {
      uniqueMap.set(a.userId, { userId: a.userId, score: a.score ?? 0 });
    }
  }

  const sorted = Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);
  const { db: dbInstance, usersTable } = await import("@workspace/db");
  const ranking = await Promise.all(sorted.map(async (entry, idx) => {
    const [user] = await dbInstance.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, entry.userId));
    return { rank: idx + 1, userId: entry.userId, name: user?.name ?? "Unknown", score: entry.score, isCurrentUser: entry.userId === userId };
  }));

  res.json(ranking);
});

export default router;
