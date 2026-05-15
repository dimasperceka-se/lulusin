import OpenAI from "openai";
import { eq, isNull, or, sql } from "drizzle-orm";
import { db, questionsTable } from "@workspace/db";

const limitArg = process.argv[2] ? Number(process.argv[2]) : Infinity;
const CONCURRENCY = 5;
const MODEL = "gpt-4o-mini";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not set in environment");
  process.exit(1);
}

const openai = new OpenAI();

type Question = typeof questionsTable.$inferSelect;

function buildPrompt(q: Question): string {
  const correctOption = q[`option${q.correctAnswer}` as `option${"A" | "B" | "C" | "D" | "E"}`];
  const category = (q.category || "").toUpperCase();

  let categoryHint = "Jelaskan singkat alasan jawaban tersebut paling tepat.";
  if (category === "TIU") categoryHint = "Jika soal numerik/logika, tunjukkan langkah perhitungan atau penalarannya secara ringkas.";
  else if (category === "TWK") categoryHint = "Sebutkan dasar konsep, pasal, atau prinsip Pancasila/UUD/NKRI yang relevan.";
  else if (category === "TKP") categoryHint = "Jelaskan nilai/perilaku yang dinilai dan mengapa jawaban tersebut paling sesuai standar ASN.";

  return `Soal kategori ${category || "umum"}:

${q.questionText}

A. ${q.optionA}
B. ${q.optionB}
C. ${q.optionC}
D. ${q.optionD}
E. ${q.optionE}

Jawaban benar: ${q.correctAnswer}. ${correctOption}

Tulis pembahasan singkat dalam Bahasa Indonesia (3-5 kalimat) yang menjelaskan mengapa jawaban tersebut benar. ${categoryHint} Bila relevan, sebutkan singkat mengapa salah satu pilihan lain yang paling sering menjebak juga salah. Jangan gunakan markdown, heading, atau bullet — cukup paragraf rapi. Mulai langsung dengan substansi, jangan dengan kalimat pembuka seperti "Pembahasan:".`;
}

async function generateExplanation(q: Question): Promise<string | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: buildPrompt(q) }],
      temperature: 0.4,
      max_tokens: 500,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch (err) {
    console.error(`  [error] question id=${q.id}:`, (err as Error).message);
    return null;
  }
}

async function main(): Promise<void> {
  const rows = await db
    .select()
    .from(questionsTable)
    .where(or(isNull(questionsTable.explanation), eq(questionsTable.explanation, "")));

  const todo = rows.slice(0, isFinite(limitArg) ? limitArg : rows.length);
  console.log(`Found ${rows.length} questions without explanation. Processing ${todo.length} (concurrency=${CONCURRENCY}, model=${MODEL}).`);

  if (todo.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let done = 0;
  let saved = 0;
  let failed = 0;

  let cursor = 0;
  async function worker(): Promise<void> {
    while (true) {
      const idx = cursor++;
      if (idx >= todo.length) return;
      const q = todo[idx];
      const explanation = await generateExplanation(q);
      if (explanation) {
        await db.update(questionsTable)
          .set({ explanation })
          .where(eq(questionsTable.id, q.id));
        saved++;
      } else {
        failed++;
      }
      done++;
      if (done % 10 === 0 || done === todo.length) {
        console.log(`  progress: ${done}/${todo.length} (saved=${saved}, failed=${failed})`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log(`\nDone. ${saved} saved, ${failed} failed out of ${todo.length}.`);

  const remaining = await db
    .select({ c: sql<number>`count(*)` })
    .from(questionsTable)
    .where(or(isNull(questionsTable.explanation), eq(questionsTable.explanation, "")));
  console.log(`Questions still without explanation: ${remaining[0].c}.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
