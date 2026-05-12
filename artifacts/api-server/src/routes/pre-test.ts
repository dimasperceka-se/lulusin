import { Router } from "express";
import { db, questionsTable } from "@workspace/db";
import { eq, sql, inArray } from "drizzle-orm";
import { SubmitPreTestBody } from "@workspace/api-zod";

const router = Router();

const CATEGORIES = ["TWK", "TIU", "TKP"] as const;
const PER_CATEGORY = 5;

router.get("/pre-test/questions", async (_req, res): Promise<void> => {
  const out: Array<{
    id: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    category: string;
  }> = [];

  for (const cat of CATEGORIES) {
    const rows = await db
      .select({
        id: questionsTable.id,
        questionText: questionsTable.questionText,
        optionA: questionsTable.optionA,
        optionB: questionsTable.optionB,
        optionC: questionsTable.optionC,
        optionD: questionsTable.optionD,
        optionE: questionsTable.optionE,
        category: questionsTable.category,
      })
      .from(questionsTable)
      .where(eq(questionsTable.category, cat))
      .orderBy(sql`random()`)
      .limit(PER_CATEGORY);
    out.push(...rows);
  }

  res.json(out);
});

router.post("/pre-test/submit", async (req, res): Promise<void> => {
  const parsed = SubmitPreTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const answers = parsed.data.answers;
  if (answers.length === 0) {
    res.status(400).json({ error: "Tidak ada jawaban" });
    return;
  }

  const ids = answers.map((a) => a.questionId);
  const rows = await db
    .select({
      id: questionsTable.id,
      correctAnswer: questionsTable.correctAnswer,
      category: questionsTable.category,
    })
    .from(questionsTable)
    .where(inArray(questionsTable.id, ids));

  const byId = new Map(rows.map((r) => [r.id, r]));

  const counts: Record<string, { correct: number; total: number }> = {
    TWK: { correct: 0, total: 0 },
    TIU: { correct: 0, total: 0 },
    TKP: { correct: 0, total: 0 },
  };

  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (!q) continue;
    const bucket = counts[q.category];
    if (!bucket) continue;
    bucket.total += 1;
    if (a.answer.toUpperCase() === q.correctAnswer) bucket.correct += 1;
  }

  const totalCorrect = counts.TWK.correct + counts.TIU.correct + counts.TKP.correct;
  const totalQuestions = counts.TWK.total + counts.TIU.total + counts.TKP.total;
  const percent = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  // Heuristic estimates — tuned to be encouraging but realistic
  let monthsWithoutCourse: number;
  let monthsWithCourse: number;
  let probabilityWithoutCourse: number;
  let probabilityWithCourse: number;
  let recommendation: string;

  if (percent >= 85) {
    monthsWithoutCourse = 1;
    monthsWithCourse = 0.5;
    probabilityWithoutCourse = 70;
    probabilityWithCourse = 95;
    recommendation =
      "Skor Anda sangat tinggi — sudah mendekati standar kelulusan SKD. Dengan polishing 2 minggu pakai paket Lulusin, peluang lolos Anda mendekati 95%.";
  } else if (percent >= 65) {
    monthsWithoutCourse = 3;
    monthsWithCourse = 1.5;
    probabilityWithoutCourse = 40;
    probabilityWithCourse = 85;
    recommendation =
      "Skor Anda di atas rata-rata. Dengan paket Lulusin selama 1,5 bulan, Anda bisa konsisten lewat passing grade dan boost peluang lolos ke 85%.";
  } else if (percent >= 45) {
    monthsWithoutCourse = 6;
    monthsWithCourse = 3;
    probabilityWithoutCourse = 18;
    probabilityWithCourse = 70;
    recommendation =
      "Skor Anda menunjukkan ada beberapa konsep dasar yang perlu diperkuat. Paket Lulusin akan membantu menutup gap kelemahan dan mempercepat persiapan dari 6 bulan jadi 3 bulan saja.";
  } else if (percent >= 25) {
    monthsWithoutCourse = 9;
    monthsWithCourse = 4.5;
    probabilityWithoutCourse = 8;
    probabilityWithCourse = 55;
    recommendation =
      "Persiapan Anda masih awal. Tanpa bimbingan terstruktur, butuh sekitar 9 bulan untuk siap SKD. Paket Lulusin memotong waktu jadi 4,5 bulan dengan materi lengkap + tryout terjadwal.";
  } else {
    monthsWithoutCourse = 12;
    monthsWithCourse = 6;
    probabilityWithoutCourse = 3;
    probabilityWithCourse = 40;
    recommendation =
      "Anda baru memulai — itu wajar! Tanpa kursus, dibutuhkan persiapan setahun penuh. Paket Lulusin merancang jalur belajar terbimbing yang memotong waktu hingga setengahnya dan boost peluang lolos secara signifikan.";
  }

  res.json({
    totalCorrect,
    totalQuestions,
    breakdown: {
      TWK: counts.TWK,
      TIU: counts.TIU,
      TKP: counts.TKP,
    },
    monthsWithoutCourse,
    monthsWithCourse,
    probabilityWithoutCourse,
    probabilityWithCourse,
    recommendation,
  });
});

export default router;
