import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import { sql, eq, and } from "drizzle-orm";
import {
  db,
  questionsTable,
  quizzesTable,
  quizQuestionsTable,
} from "@workspace/db";

const CPNS_PACKAGE_ID = 1;
const QUIZ_TITLE = "Latihan TIU Verbal dan Numerik";
const TAG_PREFIX = "tiu-100:";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const XLSX_PATH = path.join(REPO_ROOT, "attached_assets/100_Soal_TIU_CPNS.xlsx");

const VALID_ANSWERS = new Set(["A", "B", "C", "D", "E"]);

type Row = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  category: "TIU";
  tags: string;
  difficulty: "medium";
};

function loadRows(): Row[] {
  const wb = XLSX.read(readFileSync(XLSX_PATH), { type: "buffer" });
  const out: Row[] = [];

  for (const sheetName of wb.SheetNames) {
    if (sheetName === "Ringkasan") continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });

    // Columns: [No, Subtes, Soal, A, B, C, D, E, Jawaban, Pembahasan]; data from row index 4
    for (let i = 4; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r[2] == null) continue;
      const [, , soal, a, b, c, d, e, jawaban, pembahasan] = r as (string | number | null)[];
      if (!soal || !jawaban) continue;
      const answer = String(jawaban).trim().toUpperCase().charAt(0);
      if (!VALID_ANSWERS.has(answer)) continue;
      const opt = (v: string | number | null) => String(v ?? "").trim();
      const optA = opt(a), optB = opt(b), optC = opt(c), optD = opt(d), optE = opt(e);
      if (!optA || !optB || !optC || !optD || !optE) continue;

      out.push({
        questionText: String(soal).trim(),
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        optionE: optE,
        correctAnswer: answer as Row["correctAnswer"],
        explanation: pembahasan ? String(pembahasan).trim() : null,
        category: "TIU",
        tags: `${TAG_PREFIX}${sheetName}`,
        difficulty: "medium",
      });
    }
  }

  return out;
}

async function main() {
  console.log("=".repeat(70));
  console.log(`  IMPORT 100 SOAL TIU → "${QUIZ_TITLE}" (package id=${CPNS_PACKAGE_ID})`);
  console.log("=".repeat(70));

  // Step 0: idempotent cleanup of any prior run.
  console.log("\n[0/3] Cleanup previous tiu-100 import (if any)...");
  await db.execute(sql`DELETE FROM quiz_questions WHERE question_id IN (SELECT id FROM questions WHERE tags LIKE ${TAG_PREFIX + "%"})`);
  await db.execute(sql`DELETE FROM tryout_questions WHERE question_id IN (SELECT id FROM questions WHERE tags LIKE ${TAG_PREFIX + "%"})`);
  await db.execute(sql`DELETE FROM questions WHERE tags LIKE ${TAG_PREFIX + "%"}`);
  console.log("     ✓ cleanup done");

  // Step 1: load + insert questions.
  console.log("\n[1/3] Loading rows from " + path.relative(REPO_ROOT, XLSX_PATH));
  const rows = loadRows();
  const bySheet = rows.reduce<Record<string, number>>((a, r) => {
    const k = r.tags.replace(TAG_PREFIX, "");
    a[k] = (a[k] ?? 0) + 1;
    return a;
  }, {});
  for (const [k, n] of Object.entries(bySheet)) console.log(`     • ${k}: ${n} soal`);
  console.log(`     total: ${rows.length} soal`);

  if (rows.length === 0) {
    console.log("\nNo rows to insert. Done.");
    process.exit(0);
  }

  const inserted = await db.insert(questionsTable).values(rows).returning({ id: questionsTable.id });
  console.log(`     ✓ inserted ${inserted.length} questions`);

  // Step 2: find the target quiz.
  console.log(`\n[2/3] Locating quiz "${QUIZ_TITLE}" in package ${CPNS_PACKAGE_ID}...`);
  const [quiz] = await db
    .select({ id: quizzesTable.id })
    .from(quizzesTable)
    .where(and(eq(quizzesTable.packageId, CPNS_PACKAGE_ID), eq(quizzesTable.title, QUIZ_TITLE)))
    .limit(1);

  if (!quiz) {
    console.error(`     ✗ quiz not found. Run seed.ts first, or adjust QUIZ_TITLE in this script.`);
    process.exit(1);
  }
  console.log(`     ✓ quiz id=${quiz.id}`);

  // Step 3: wire questions into the quiz, appending after any existing questions.
  console.log(`\n[3/3] Wiring ${inserted.length} questions into quiz ${quiz.id}...`);
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${quizQuestionsTable.orderIndex}), 0)` })
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id));

  const startOrder = Number(maxOrder) || 0;
  await db.insert(quizQuestionsTable).values(
    inserted.map((q, i) => ({
      quizId: quiz.id,
      questionId: q.id,
      orderIndex: startOrder + i + 1,
    })),
  );
  console.log(`     ✓ appended at orderIndex ${startOrder + 1}..${startOrder + inserted.length}`);

  console.log("\n" + "=".repeat(70));
  console.log("  SELESAI");
  console.log("=".repeat(70));
  console.log(`  Questions inserted     : ${inserted.length}`);
  console.log(`  Wired into quiz id     : ${quiz.id} ("${QUIZ_TITLE}")`);
  console.log("=".repeat(70));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
