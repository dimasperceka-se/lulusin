import { Router } from "express";
import { db, attemptsTable, quizzesTable, quizQuestionsTable, tryoutsTable, tryoutQuestionsTable, questionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { SubmitAttemptBody, ListAttemptsQueryParams } from "@workspace/api-zod";

const router = Router();

router.post("/quizzes/:id/start", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const [attempt] = await db.insert(attemptsTable).values({
    userId: req.user!.userId,
    quizId: id,
    type: "quiz",
    startedAt: new Date(),
  }).returning();
  res.status(201).json({ ...attempt, quizTitle: quiz.title });
});

router.post("/tryouts/:id/start", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [tryout] = await db.select().from(tryoutsTable).where(eq(tryoutsTable.id, id));
  if (!tryout) {
    res.status(404).json({ error: "Tryout not found" });
    return;
  }
  const [attempt] = await db.insert(attemptsTable).values({
    userId: req.user!.userId,
    tryoutId: id,
    type: "tryout",
    startedAt: new Date(),
  }).returning();
  res.status(201).json({ ...attempt, tryoutTitle: tryout.title });
});

router.post("/attempts/:id/submit", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = SubmitAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [attempt] = await db.select().from(attemptsTable).where(and(eq(attemptsTable.id, id), eq(attemptsTable.userId, req.user!.userId)));
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }
  if (attempt.finishedAt) {
    res.status(400).json({ error: "Attempt already submitted" });
    return;
  }

  const answers = parsed.data.answers as Record<string, string>;
  const finishedAt = new Date();

  let allQuestions: typeof questionsTable.$inferSelect[] = [];
  let quizTitle: string | null = null;
  let tryoutTitle: string | null = null;

  if (attempt.type === "quiz" && attempt.quizId) {
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, attempt.quizId));
    quizTitle = quiz?.title ?? null;
    const quizQs = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, attempt.quizId));
    allQuestions = (await Promise.all(quizQs.map(async qq => {
      const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, qq.questionId));
      return q;
    }))).filter(Boolean) as typeof questionsTable.$inferSelect[];
  } else if (attempt.type === "tryout" && attempt.tryoutId) {
    const [tryout] = await db.select().from(tryoutsTable).where(eq(tryoutsTable.id, attempt.tryoutId));
    tryoutTitle = tryout?.title ?? null;
    const tryoutQs = await db.select().from(tryoutQuestionsTable).where(eq(tryoutQuestionsTable.tryoutId, attempt.tryoutId));
    allQuestions = (await Promise.all(tryoutQs.map(async tq => {
      const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, tq.questionId));
      return q;
    }))).filter(Boolean) as typeof questionsTable.$inferSelect[];
  }

  let correct = 0;
  let twkCorrect = 0, tiuCorrect = 0, tkpCorrect = 0;
  let twkTotal = 0, tiuTotal = 0, tkpTotal = 0;

  const answerDetails = allQuestions.map(q => {
    const userAnswer = answers[String(q.id)] ?? null;
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;

    if (q.category === "TWK") { twkTotal++; if (isCorrect) twkCorrect++; }
    else if (q.category === "TIU") { tiuTotal++; if (isCorrect) tiuCorrect++; }
    else if (q.category === "TKP") { tkpTotal++; if (isCorrect) tkpCorrect++; }

    return {
      questionId: q.id,
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      optionE: q.optionE,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      category: q.category,
    };
  });

  const totalQuestions = allQuestions.length;
  const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

  // CPNS TWK/TIU/TKP scoring (TKP uses weighted scoring: 5 for correct, 1-4 for others, 0 for unanswered)
  const twkScore = twkTotal > 0 ? (twkCorrect / twkTotal) * 100 : null;
  const tiuScore = tiuTotal > 0 ? (tiuCorrect / tiuTotal) * 100 : null;
  const tkpScore = tkpTotal > 0 ? (tkpCorrect / tkpTotal) * 100 : null;

  const passed = attempt.type === "tryout" && twkScore !== null
    ? (twkScore >= 65 && tiuScore !== null && tiuScore >= 80 && tkpScore !== null && tkpScore >= 83)
    : score >= 70;

  const [updated] = await db.update(attemptsTable).set({
    score,
    twkScore: twkScore ?? undefined,
    tiuScore: tiuScore ?? undefined,
    tkpScore: tkpScore ?? undefined,
    answersJson: answers,
    finishedAt,
  }).where(eq(attemptsTable.id, id)).returning();

  res.json({
    id: updated.id,
    userId: updated.userId,
    quizId: updated.quizId,
    tryoutId: updated.tryoutId,
    type: updated.type,
    score,
    totalQuestions,
    correctAnswers: correct,
    twkScore,
    tiuScore,
    tkpScore,
    passed,
    startedAt: updated.startedAt,
    finishedAt,
    answers: answerDetails,
    quizTitle,
    tryoutTitle,
  });
});

router.get("/attempts/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [attempt] = await db.select().from(attemptsTable).where(and(eq(attemptsTable.id, id), eq(attemptsTable.userId, req.user!.userId)));
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }
  res.json(attempt);
});

router.get("/attempts", authenticate, async (req, res): Promise<void> => {
  const params = ListAttemptsQueryParams.safeParse(req.query);
  const query = params.success ? params.data : {};
  const userId = req.user!.userId;

  const conditions = [eq(attemptsTable.userId, userId)];
  if (query.type) conditions.push(eq(attemptsTable.type, query.type as "quiz" | "tryout"));
  if (query.quizId) conditions.push(eq(attemptsTable.quizId, query.quizId as number));
  if (query.tryoutId) conditions.push(eq(attemptsTable.tryoutId, query.tryoutId as number));

  const attempts = await db.select().from(attemptsTable).where(and(...conditions)).orderBy(desc(attemptsTable.createdAt));

  const enriched = await Promise.all(attempts.map(async (a) => {
    let quizTitle = null;
    let tryoutTitle = null;
    if (a.quizId) {
      const [quiz] = await db.select({ title: quizzesTable.title }).from(quizzesTable).where(eq(quizzesTable.id, a.quizId));
      quizTitle = quiz?.title ?? null;
    }
    if (a.tryoutId) {
      const [tryout] = await db.select({ title: tryoutsTable.title }).from(tryoutsTable).where(eq(tryoutsTable.id, a.tryoutId));
      tryoutTitle = tryout?.title ?? null;
    }
    return { ...a, quizTitle, tryoutTitle };
  }));

  res.json(enriched);
});

export default router;
