import { Router } from "express";
import { db, attemptsTable, quizzesTable, quizQuestionsTable, tryoutsTable, tryoutQuestionsTable, questionsTable, enrollmentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";
import { SubmitAttemptBody, ListAttemptsQueryParams, RateAttemptBody } from "@workspace/api-zod";

const router = Router();
const TIER_RANK: Record<string, number> = { free: 0, basic: 1, advance: 2 };

async function getUserTierRank(userId: number, packageId: number | null | undefined): Promise<number> {
  if (packageId == null) return 0;
  const enrollments = await db.select().from(enrollmentsTable).where(
    and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.packageId, packageId), eq(enrollmentsTable.isActive, true))
  );
  if (enrollments.length === 0) return -1;
  return Math.max(...enrollments.map((e) => TIER_RANK[e.tier] ?? 0));
}

type Attempt = typeof attemptsTable.$inferSelect;
type Question = typeof questionsTable.$inferSelect;

async function loadAttemptQuestions(attempt: Attempt): Promise<{
  allQuestions: Question[];
  quizTitle: string | null;
  tryoutTitle: string | null;
  packageId: number | null;
}> {
  let allQuestions: Question[] = [];
  let quizTitle: string | null = null;
  let tryoutTitle: string | null = null;
  let packageId: number | null = null;

  if (attempt.type === "quiz" && attempt.quizId) {
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, attempt.quizId));
    quizTitle = quiz?.title ?? null;
    packageId = quiz?.packageId ?? null;
    const quizQs = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, attempt.quizId));
    allQuestions = (await Promise.all(quizQs.map(async qq => {
      const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, qq.questionId));
      return q;
    }))).filter(Boolean) as Question[];
  } else if (attempt.type === "tryout" && attempt.tryoutId) {
    const [tryout] = await db.select().from(tryoutsTable).where(eq(tryoutsTable.id, attempt.tryoutId));
    tryoutTitle = tryout?.title ?? null;
    packageId = tryout?.packageId ?? null;
    const tryoutQs = await db.select().from(tryoutQuestionsTable).where(eq(tryoutQuestionsTable.tryoutId, attempt.tryoutId));
    allQuestions = (await Promise.all(tryoutQs.map(async tq => {
      const [q] = await db.select().from(questionsTable).where(eq(questionsTable.id, tq.questionId));
      return q;
    }))).filter(Boolean) as Question[];
  }

  return { allQuestions, quizTitle, tryoutTitle, packageId };
}

function buildAnswerDetails(allQuestions: Question[], answers: Record<string, string>) {
  let correct = 0;
  const items = allQuestions.map(q => {
    const userAnswer = answers[String(q.id)] ?? null;
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;
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
  return { items, correct };
}

function computePassed(attempt: Pick<Attempt, "type" | "score" | "twkScore" | "tiuScore" | "tkpScore">): boolean {
  const { type, score, twkScore, tiuScore, tkpScore } = attempt;
  if (type === "tryout" && twkScore !== null && twkScore !== undefined) {
    return twkScore >= 65 &&
      tiuScore !== null && tiuScore !== undefined && tiuScore >= 80 &&
      tkpScore !== null && tkpScore !== undefined && tkpScore >= 83;
  }
  return (score ?? 0) >= 70;
}

router.post("/quizzes/:id/start", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const isAdmin = req.user!.role === "admin" || req.user!.role === "tutor";
  if (!isAdmin) {
    const userRank = await getUserTierRank(req.user!.userId, quiz.packageId);
    if (userRank < (TIER_RANK[quiz.tier] ?? 0)) {
      res.status(403).json({ error: `Upgrade ke tier "${quiz.tier}" untuk mengakses kuis ini.` });
      return;
    }
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
  const isAdmin = req.user!.role === "admin" || req.user!.role === "tutor";
  if (!isAdmin && tryout.packageId != null) {
    const userRank = await getUserTierRank(req.user!.userId, tryout.packageId);
    if (userRank < (TIER_RANK[tryout.tier] ?? 0)) {
      res.status(403).json({ error: `Upgrade ke tier "${tryout.tier}" untuk mengakses tryout ini.` });
      return;
    }
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

  const { allQuestions, quizTitle, tryoutTitle, packageId } = await loadAttemptQuestions(attempt);
  const { items: rawAnswerDetails, correct } = buildAnswerDetails(allQuestions, answers);
  const userTierRank = await getUserTierRank(req.user!.userId, packageId);
  const canSeePembahasan = userTierRank >= TIER_RANK.advance;
  const answerDetails = canSeePembahasan
    ? rawAnswerDetails
    : rawAnswerDetails.map((a) => ({ ...a, explanation: null }));

  let twkCorrect = 0, tiuCorrect = 0, tkpCorrect = 0;
  let twkTotal = 0, tiuTotal = 0, tkpTotal = 0;
  for (const a of answerDetails) {
    if (a.category === "TWK") { twkTotal++; if (a.isCorrect) twkCorrect++; }
    else if (a.category === "TIU") { tiuTotal++; if (a.isCorrect) tiuCorrect++; }
    else if (a.category === "TKP") { tkpTotal++; if (a.isCorrect) tkpCorrect++; }
  }

  const totalQuestions = allQuestions.length;
  const score = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  const twkScore = twkTotal > 0 ? (twkCorrect / twkTotal) * 100 : null;
  const tiuScore = tiuTotal > 0 ? (tiuCorrect / tiuTotal) * 100 : null;
  const tkpScore = tkpTotal > 0 ? (tkpCorrect / tkpTotal) * 100 : null;
  const passed = computePassed({ type: attempt.type, score, twkScore, tiuScore, tkpScore });

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
    rating: updated.rating,
    ratingComment: updated.ratingComment,
    ratedAt: updated.ratedAt,
    startedAt: updated.startedAt,
    finishedAt,
    answers: answerDetails,
    quizTitle,
    tryoutTitle,
  });
});

router.post("/attempts/:id/rate", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = RateAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [attempt] = await db.select().from(attemptsTable).where(
    and(eq(attemptsTable.id, id), eq(attemptsTable.userId, req.user!.userId))
  );
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }
  if (!attempt.finishedAt) {
    res.status(400).json({ error: "Attempt has not been submitted yet" });
    return;
  }

  const ratingComment = parsed.data.comment?.trim() || null;
  const [updated] = await db.update(attemptsTable).set({
    rating: parsed.data.rating,
    ratingComment,
    ratedAt: new Date(),
  }).where(eq(attemptsTable.id, id)).returning();

  res.json(updated);
});

router.get("/attempts/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [attempt] = await db.select().from(attemptsTable).where(and(eq(attemptsTable.id, id), eq(attemptsTable.userId, req.user!.userId)));
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  const { allQuestions, quizTitle, tryoutTitle, packageId } = await loadAttemptQuestions(attempt);
  const answersJson = (attempt.answersJson ?? {}) as Record<string, string>;
  const { items: rawAnswerDetails, correct } = buildAnswerDetails(allQuestions, answersJson);
  const passed = computePassed(attempt);
  const userTierRank = await getUserTierRank(req.user!.userId, packageId);
  const canSeePembahasan = userTierRank >= TIER_RANK.advance;
  const answerDetails = canSeePembahasan
    ? rawAnswerDetails
    : rawAnswerDetails.map((a) => ({ ...a, explanation: null }));

  res.json({
    id: attempt.id,
    userId: attempt.userId,
    quizId: attempt.quizId,
    tryoutId: attempt.tryoutId,
    type: attempt.type,
    score: attempt.score ?? 0,
    totalQuestions: allQuestions.length,
    correctAnswers: correct,
    twkScore: attempt.twkScore,
    tiuScore: attempt.tiuScore,
    tkpScore: attempt.tkpScore,
    passed,
    rating: attempt.rating,
    ratingComment: attempt.ratingComment,
    ratedAt: attempt.ratedAt,
    startedAt: attempt.startedAt,
    finishedAt: attempt.finishedAt,
    answers: answerDetails,
    quizTitle,
    tryoutTitle,
  });
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
