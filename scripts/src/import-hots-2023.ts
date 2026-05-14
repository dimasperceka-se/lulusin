import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import { sql, eq, and } from "drizzle-orm";
import {
  db,
  questionsTable,
  tryoutsTable,
  tryoutQuestionsTable,
} from "@workspace/db";

const CPNS_PACKAGE_ID = 1;
const TRYOUT_TITLE = "Tryout CPNS HOTS 2023";
const TRYOUT_DESCRIPTION = "Latihan SKD HOTS (Higher-Order Thinking Skills) 2023 versi parafrase: 30 TWK + 35 TIU + 45 TKP selama 100 menit.";
const TRYOUT_DURATION_MINUTES = 100;
const TAG_PREFIX = "hots-2023:";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const XLSX_PATH = path.join(REPO_ROOT, "attached_assets/HOTS_2023.xlsx");

const VALID_ANSWERS = new Set(["A", "B", "C", "D", "E"]);

type Category = "TWK" | "TIU" | "TKP";

type Row = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  category: Category;
  subCategory: string;
  tags: string;
  difficulty: "hard";
};

function loadRows(): Row[] {
  const wb = XLSX.read(readFileSync(XLSX_PATH), { type: "buffer" });
  const out: Row[] = [];

  const sheetCategories: Record<string, Category> = { TWK: "TWK", TIU: "TIU", TKP: "TKP" };

  for (const sheetName of wb.SheetNames) {
    const category = sheetCategories[sheetName];
    if (!category) continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });

    for (let i = 4; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r[2] == null) continue;
      const [, subtes, soal, a, b, c, d, e, jawaban, pembahasan] = r as (string | number | null)[];
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
        category,
        subCategory: subtes ? String(subtes).trim() : category,
        tags: `${TAG_PREFIX}${category}`,
        difficulty: "hard",
      });
    }
  }

  return out;
}

async function main() {
  console.log("=".repeat(70));
  console.log(`  IMPORT HOTS 2023 → "${TRYOUT_TITLE}" (package id=${CPNS_PACKAGE_ID})`);
  console.log("=".repeat(70));

  console.log("\n[0/4] Cleanup previous hots-2023 import (if any)...");
  const prevTryout = await db
    .select({ id: tryoutsTable.id })
    .from(tryoutsTable)
    .where(and(eq(tryoutsTable.packageId, CPNS_PACKAGE_ID), eq(tryoutsTable.title, TRYOUT_TITLE)));
  for (const t of prevTryout) {
    await db.delete(tryoutQuestionsTable).where(eq(tryoutQuestionsTable.tryoutId, t.id));
    await db.delete(tryoutsTable).where(eq(tryoutsTable.id, t.id));
  }
  await db.execute(sql`DELETE FROM quiz_questions WHERE question_id IN (SELECT id FROM questions WHERE tags LIKE ${TAG_PREFIX + "%"})`);
  await db.execute(sql`DELETE FROM tryout_questions WHERE question_id IN (SELECT id FROM questions WHERE tags LIKE ${TAG_PREFIX + "%"})`);
  await db.execute(sql`DELETE FROM questions WHERE tags LIKE ${TAG_PREFIX + "%"}`);
  console.log("     ✓ cleanup done");

  console.log("\n[1/4] Loading rows from " + path.relative(REPO_ROOT, XLSX_PATH));
  const rows = loadRows();
  const byCategory = rows.reduce<Record<string, number>>((a, r) => {
    a[r.category] = (a[r.category] ?? 0) + 1;
    return a;
  }, {});
  for (const [k, n] of Object.entries(byCategory)) console.log(`     • ${k}: ${n} soal`);
  console.log(`     total: ${rows.length} soal`);

  if (rows.length === 0) {
    console.log("\nNo rows to insert. Done.");
    process.exit(0);
  }

  console.log(`\n[2/4] Inserting ${rows.length} questions...`);
  const inserted = await db.insert(questionsTable).values(
    rows.map((r) => ({
      questionText: r.questionText,
      optionA: r.optionA,
      optionB: r.optionB,
      optionC: r.optionC,
      optionD: r.optionD,
      optionE: r.optionE,
      correctAnswer: r.correctAnswer,
      explanation: r.explanation,
      category: r.category,
      tags: r.tags,
      difficulty: r.difficulty,
    })),
  ).returning({ id: questionsTable.id });
  console.log(`     ✓ inserted ${inserted.length} questions`);

  console.log(`\n[3/4] Creating tryout "${TRYOUT_TITLE}"...`);
  const [tryout] = await db.insert(tryoutsTable).values({
    title: TRYOUT_TITLE,
    description: TRYOUT_DESCRIPTION,
    type: "CPNS_SKD",
    durationMinutes: TRYOUT_DURATION_MINUTES,
    packageId: CPNS_PACKAGE_ID,
  }).returning({ id: tryoutsTable.id });
  console.log(`     ✓ tryout id=${tryout.id}`);

  console.log(`\n[4/4] Wiring ${inserted.length} questions into tryout ${tryout.id}...`);
  await db.insert(tryoutQuestionsTable).values(
    inserted.map((q, i) => ({
      tryoutId: tryout.id,
      questionId: q.id,
      subCategory: rows[i].subCategory,
      orderIndex: i + 1,
    })),
  );
  console.log(`     ✓ wired ${inserted.length} questions in order 1..${inserted.length}`);

  console.log("\n" + "=".repeat(70));
  console.log("  SELESAI");
  console.log("=".repeat(70));
  console.log(`  Questions inserted     : ${inserted.length}`);
  console.log(`  Tryout created         : id=${tryout.id} "${TRYOUT_TITLE}"`);
  console.log(`  Package                : id=${CPNS_PACKAGE_ID}`);
  console.log(`  Duration               : ${TRYOUT_DURATION_MINUTES} menit`);
  console.log("=".repeat(70));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
