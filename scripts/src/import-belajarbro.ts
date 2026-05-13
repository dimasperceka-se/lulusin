import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import { sql } from "drizzle-orm";
import {
  db,
  questionsTable,
  materialsTable,
  quizzesTable,
  quizQuestionsTable,
} from "@workspace/db";

const CPNS_PACKAGE_ID = 1;
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CRAWLING_DIR = path.join(REPO_ROOT, "attached_assets/crawling_result");
const MATERI_DIR = path.join(CRAWLING_DIR, "materi_belajarbro");

function stripBelajarbro(text: string): string {
  return text.replace(/\bbelajarbro(?:\.id)?\b/gi, "").replace(/\s{2,}/g, " ").trim();
}

type Category = "TWK" | "TIU" | "TKP";

type ImportedQuestion = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string | null;
  category: Category;
  tags: string;
  difficulty: "medium";
};

function loadExcelBySubcategory(
  filePath: string,
  category: Category,
): Map<string, ImportedQuestion[]> {
  const wb = XLSX.read(readFileSync(filePath), { type: "buffer" });
  const result = new Map<string, ImportedQuestion[]>();

  for (const sheetName of wb.SheetNames) {
    if (sheetName === "Ringkasan") continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
    const questions: ImportedQuestion[] = [];

    // Layout per crawler scripts: row 0 title, row 1 subtitle, row 2 empty,
    // row 3 headers, row 4+ data. Columns: [No, Paket, Soal, A, B, C, D, E, Jawaban, Pembahasan]
    for (let i = 4; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      const [, , soal, a, b, c, d, e, jawaban, pembahasan] = r as (string | number | null)[];
      if (!soal || !jawaban) continue;

      const correct = String(jawaban).trim().toUpperCase().charAt(0);
      if (!["A", "B", "C", "D", "E"].includes(correct)) continue;

      const opt = (v: string | number | null) => String(v ?? "").trim();
      const optA = opt(a), optB = opt(b), optC = opt(c), optD = opt(d), optE = opt(e);
      if (!optA || !optB || !optC || !optD || !optE) continue;

      questions.push({
        questionText: stripBelajarbro(String(soal).trim()),
        optionA: stripBelajarbro(optA),
        optionB: stripBelajarbro(optB),
        optionC: stripBelajarbro(optC),
        optionD: stripBelajarbro(optD),
        optionE: stripBelajarbro(optE),
        correctAnswer: correct as ImportedQuestion["correctAnswer"],
        explanation: pembahasan ? stripBelajarbro(String(pembahasan).trim()) : null,
        category,
        tags: `belajarbro:${sheetName}`,
        difficulty: "medium",
      });
    }

    result.set(sheetName, questions);
  }

  return result;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function insertQuestionsBatched(
  questions: ImportedQuestion[],
  batchSize = 500,
): Promise<number[]> {
  const ids: number[] = [];
  for (const batch of chunk(questions, batchSize)) {
    const rows = await db.insert(questionsTable).values(batch).returning({ id: questionsTable.id });
    ids.push(...rows.map((r) => r.id));
  }
  return ids;
}

function quizTimeLimit(count: number): number {
  return Math.max(15, Math.min(90, count));
}

async function readMateri(): Promise<
  Array<{ category: Category; orderIndex: number; title: string; description: string; content: string }>
> {
  const out: Array<{ category: Category; orderIndex: number; title: string; description: string; content: string }> = [];
  const offsets: Record<Category, number> = { TWK: 100, TIU: 200, TKP: 300 };

  for (const cat of ["TWK", "TIU", "TKP"] as const) {
    const dir = path.join(MATERI_DIR, cat);
    let files: string[];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
    } catch {
      continue;
    }

    for (const file of files) {
      const full = path.join(dir, file);
      let raw = await readFile(full, "utf-8");

      // Strip crawler metadata header (>Kategori/Sumber/Diambil + horizontal rule).
      raw = raw.replace(
        /> \*\*Kategori\*\*:[^\n]*\r?\n> \*\*Sumber\*\*:[^\n]*\r?\n> \*\*Diambil\*\*:[^\n]*\r?\n\r?\n---\r?\n\r?\n/g,
        "",
      );
      // Strip image refs that point to belajarbro.id (forum avatars, etc).
      raw = raw.replace(/!\[[^\]]*\]\(https?:\/\/belajarbro\.id[^)]*\)\r?\n?/gi, "");
      // Catch-all: any remaining line that mentions "belajarbro" (attribution footer,
      // inline references, source URLs left over). The original belajarbro source attribution
      // is preserved in attached_assets/, this just removes it from rendered content.
      raw = raw.replace(/^[^\n]*belajarbro[^\n]*\r?\n?/gim, "");
      // Collapse 3+ consecutive blank lines into 2 and trim trailing whitespace.
      raw = raw.replace(/(\r?\n){3,}/g, "\n\n").trim() + "\n";

      const prefixMatch = file.match(/^(\d+)-(.+)\.md$/);
      const prefix = prefixMatch ? Number(prefixMatch[1]) : 0;
      const titleRaw = prefixMatch ? prefixMatch[2] : path.basename(file, ".md");
      const title = titleRaw.replace(/-/g, " ").replace(/\s+/g, " ").trim();

      // Description = first non-trivial paragraph
      let description = "";
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        if (t.startsWith("#")) continue;
        if (t.startsWith(">")) continue;
        if (t.startsWith("|")) continue;
        if (t.startsWith("---")) continue;
        description = t.replace(/[*_`[\]]/g, "");
        if (description.length > 200) description = description.slice(0, 197) + "...";
        break;
      }

      out.push({
        category: cat,
        orderIndex: offsets[cat] + prefix,
        title,
        description,
        content: raw,
      });
    }
  }

  return out;
}

async function main() {
  console.log("=".repeat(70));
  console.log("  IMPORT BELAJARBRO CONTENT → PAKET CPNS LENGKAP 2026 (id=" + CPNS_PACKAGE_ID + ")");
  console.log("=".repeat(70));

  // ── Step 0: cleanup previous belajarbro import (idempotent) ──
  console.log("\n[0/4] Cleanup previous belajarbro import (if any)...");
  await db.execute(sql`DELETE FROM quiz_questions WHERE question_id IN (SELECT id FROM questions WHERE tags LIKE 'belajarbro:%')`);
  await db.execute(sql`DELETE FROM tryout_questions WHERE question_id IN (SELECT id FROM questions WHERE tags LIKE 'belajarbro:%')`);
  await db.execute(sql`DELETE FROM questions WHERE tags LIKE 'belajarbro:%'`);
  await db.execute(sql`DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE description LIKE '%belajarbro.id%')`);
  await db.execute(sql`DELETE FROM quizzes WHERE description LIKE '%belajarbro.id%'`);
  await db.execute(sql`DELETE FROM material_progress WHERE material_id IN (SELECT id FROM materials WHERE package_id = ${CPNS_PACKAGE_ID} AND content IS NOT NULL)`);
  await db.execute(sql`DELETE FROM materials WHERE package_id = ${CPNS_PACKAGE_ID} AND content IS NOT NULL`);
  console.log("     ✓ cleanup done");

  // ── Step 1: load TWK from SKD-script output ──
  // (run1 dropped: same kategori counts but only ~9% answer coverage vs SKD's 97%)
  console.log("\n[1/4] Loading TWK...");
  const twkBySubcat = loadExcelBySubcategory(
    path.join(CRAWLING_DIR, "Soal_TWK_Belajarbro.xlsx"),
    "TWK",
  );
  let twkTotal = 0;
  for (const [s, qs] of twkBySubcat) {
    console.log(`     • TWK / ${s}: ${qs.length} soal`);
    twkTotal += qs.length;
  }
  console.log(`     TWK total: ${twkTotal}`);

  // ── Step 2: load TIU + TKP ──
  console.log("\n[2/4] Loading TIU + TKP...");
  const tiuBySubcat = loadExcelBySubcategory(
    path.join(CRAWLING_DIR, "Soal_TIU_Belajarbro.xlsx"),
    "TIU",
  );
  let tiuTotal = 0;
  for (const [s, qs] of tiuBySubcat) {
    console.log(`     • TIU / ${s}: ${qs.length} soal`);
    tiuTotal += qs.length;
  }
  console.log(`     TIU total: ${tiuTotal}`);

  const tkpPath = path.join(CRAWLING_DIR, "Soal_TKP_Belajarbro.xlsx");
  const tkpBySubcat = loadExcelBySubcategory(tkpPath, "TKP");
  let tkpTotal = 0;
  for (const [s, qs] of tkpBySubcat) {
    console.log(`     • TKP / ${s}: ${qs.length} soal`);
    tkpTotal += qs.length;
  }
  console.log(`     TKP total: ${tkpTotal}`);

  // ── Step 3: insert questions + create per-subcategory quizzes ──
  console.log("\n[3/4] Inserting questions + creating quizzes...");
  const all: Array<[Category, string, ImportedQuestion[]]> = [];
  for (const [s, qs] of twkBySubcat) all.push(["TWK", s, qs]);
  for (const [s, qs] of tiuBySubcat) all.push(["TIU", s, qs]);
  for (const [s, qs] of tkpBySubcat) all.push(["TKP", s, qs]);

  let totalInserted = 0;
  let totalQuizzes = 0;
  for (const [cat, subcat, qs] of all) {
    if (qs.length === 0) continue;
    const ids = await insertQuestionsBatched(qs);
    totalInserted += ids.length;

    const [quiz] = await db.insert(quizzesTable).values({
      packageId: CPNS_PACKAGE_ID,
      title: `${cat} - ${subcat}`,
      description: `Bank soal ${cat} kategori ${subcat} dari belajarbro.id (${ids.length} soal).`,
      timeLimit: quizTimeLimit(ids.length),
      passingScore: 70,
    }).returning({ id: quizzesTable.id });

    const links = ids.map((qid, i) => ({
      quizId: quiz.id,
      questionId: qid,
      orderIndex: i + 1,
    }));
    for (const batch of chunk(links, 500)) {
      await db.insert(quizQuestionsTable).values(batch);
    }
    totalQuizzes++;
    console.log(`     ✓ ${cat} / ${subcat}: ${ids.length} soal → quiz id=${quiz.id}`);
  }

  // ── Step 4: insert materi ──
  console.log("\n[4/4] Importing materi (markdown)...");
  const materi = await readMateri();
  if (materi.length > 0) {
    const rows = materi.map((m) => ({
      packageId: CPNS_PACKAGE_ID,
      title: m.title,
      description: m.description || null,
      fileUrl: null,
      content: m.content,
      category: m.category,
      orderIndex: m.orderIndex,
    }));
    await db.insert(materialsTable).values(rows);
    const byCat = materi.reduce<Record<string, number>>((a, m) => {
      a[m.category] = (a[m.category] ?? 0) + 1;
      return a;
    }, {});
    for (const [c, n] of Object.entries(byCat)) {
      console.log(`     ✓ ${c}: ${n} materi`);
    }
  } else {
    console.log("     (tidak ada materi ditemukan)");
  }

  console.log("\n" + "=".repeat(70));
  console.log("  SELESAI");
  console.log("=".repeat(70));
  console.log(`  Total questions inserted : ${totalInserted}`);
  console.log(`  Total quizzes created    : ${totalQuizzes}`);
  console.log(`  Total materi inserted    : ${materi.length}`);
  console.log(`  Target package           : id=${CPNS_PACKAGE_ID}`);
  console.log("=".repeat(70));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
