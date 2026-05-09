import { Router } from "express";
import { db, questionsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateQuestionBody, UpdateQuestionBody, ListQuestionsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/questions", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const params = ListQuestionsQueryParams.safeParse(req.query);
  const query = params.success ? params.data : {};
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.category) conditions.push(eq(questionsTable.category, query.category as string));
  if (query.difficulty) conditions.push(eq(questionsTable.difficulty, query.difficulty as "easy" | "medium" | "hard"));
  if (query.search) conditions.push(ilike(questionsTable.questionText, `%${query.search}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(questionsTable).where(whereClause);
  const questions = await db.select().from(questionsTable).where(whereClause).limit(limit).offset(offset);

  res.json({ questions, total: Number(count), page, limit });
});

router.post("/questions", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [question] = await db.insert(questionsTable).values({ ...parsed.data, createdBy: req.user!.userId }).returning();
  res.status(201).json(question);
});

router.get("/questions/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, id));
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(question);
});

router.patch("/questions/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [question] = await db.update(questionsTable).set(parsed.data).where(eq(questionsTable.id, id)).returning();
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(question);
});

router.delete("/questions/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(questionsTable).where(eq(questionsTable.id, id));
  res.sendStatus(204);
});

export default router;
