// Non-destructive importer for the 15 TIU materi markdown files
// (Verbal/Numerik/Figural) under attached_assets/materi_TIU/.
//
// Idempotent: cleans its own prior insertions before re-inserting, using
// a reserved orderIndex window (ORDER_MIN..ORDER_MAX) within the CPNS
// package + TIU category.
//
// CAVEAT: import-belajarbro.ts currently runs
//   DELETE FROM materials WHERE package_id = 1 AND content IS NOT NULL;
// which would wipe these materi too. Run import-materi-tiu AFTER any
// import-belajarbro run, not before.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql, and, eq, between } from "drizzle-orm";
import { db, materialsTable } from "@workspace/db";

const CPNS_PACKAGE_ID = 1;
const CATEGORY = "TIU";

// Reserved orderIndex range for this importer so it doesn't collide with
// seed materials (1..10) or import-belajarbro materials (100, 200, 300+).
const ORDER_BASE: Record<Subcat, number> = {
  Verbal: 500,
  Numerik: 510,
  Figural: 520,
};
const ORDER_MIN = 500;
const ORDER_MAX = 599;

type Subcat = "Verbal" | "Numerik" | "Figural";
const SUBCATS: Subcat[] = ["Verbal", "Numerik", "Figural"];

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MATERI_ROOT = path.join(REPO_ROOT, "attached_assets/materi_TIU/materi_TIU");

type LoadedMateri = {
  subcat: Subcat;
  fileNum: number;
  title: string;
  description: string | null;
  content: string;
};

function extractDescription(raw: string): string | null {
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    if (t.startsWith(">")) continue;
    if (t.startsWith("|")) continue;
    if (t.startsWith("---")) continue;
    if (t.startsWith("```")) continue;
    let desc = t.replace(/[*_`[\]]/g, "");
    if (desc.length > 200) desc = desc.slice(0, 197) + "...";
    return desc;
  }
  return null;
}

async function loadAll(): Promise<LoadedMateri[]> {
  const out: LoadedMateri[] = [];

  for (const subcat of SUBCATS) {
    const dir = path.join(MATERI_ROOT, subcat);
    let files: string[];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
    } catch {
      console.warn(`     ! folder not found: ${dir} — skipping ${subcat}`);
      continue;
    }

    for (const file of files) {
      const match = file.match(/^(\d+)-(.+)\.md$/);
      if (!match) {
        console.warn(`     ! skipping (unexpected name): ${file}`);
        continue;
      }
      const fileNum = Number(match[1]);
      const titleRaw = match[2].replace(/-/g, " ").trim();
      const title = `${subcat} — ${titleRaw}`;

      const full = path.join(dir, file);
      const content = (await readFile(full, "utf-8")).trim() + "\n";
      const description = extractDescription(content);

      out.push({ subcat, fileNum, title, description, content });
    }
  }

  return out;
}

async function main() {
  console.log("=".repeat(70));
  console.log(`  IMPORT MATERI TIU → package id=${CPNS_PACKAGE_ID} (category=${CATEGORY})`);
  console.log("=".repeat(70));

  // Step 0: idempotent cleanup of any prior run of THIS importer
  // (matches by reserved orderIndex range so we don't touch seed/belajarbro materials).
  console.log("\n[0/2] Cleanup previous tiu-materi import (if any)...");
  await db.execute(sql`
    DELETE FROM material_progress
    WHERE material_id IN (
      SELECT id FROM materials
      WHERE package_id = ${CPNS_PACKAGE_ID}
        AND category = ${CATEGORY}
        AND order_index BETWEEN ${ORDER_MIN} AND ${ORDER_MAX}
    )
  `);
  const deleted = await db
    .delete(materialsTable)
    .where(
      and(
        eq(materialsTable.packageId, CPNS_PACKAGE_ID),
        eq(materialsTable.category, CATEGORY),
        between(materialsTable.orderIndex, ORDER_MIN, ORDER_MAX),
      ),
    )
    .returning({ id: materialsTable.id });
  console.log(`     ✓ removed ${deleted.length} prior materi rows`);

  // Step 1: load all .md files.
  console.log(`\n[1/2] Loading markdown files from ${path.relative(REPO_ROOT, MATERI_ROOT)}...`);
  const items = await loadAll();
  const byCat = items.reduce<Record<string, number>>((a, m) => {
    a[m.subcat] = (a[m.subcat] ?? 0) + 1;
    return a;
  }, {});
  for (const [k, n] of Object.entries(byCat)) console.log(`     • ${k}: ${n} materi`);
  console.log(`     total: ${items.length} materi`);

  if (items.length === 0) {
    console.log("\nNo materi to insert. Done.");
    process.exit(0);
  }

  // Step 2: insert.
  console.log("\n[2/2] Inserting materi...");
  const rows = items.map((m) => ({
    packageId: CPNS_PACKAGE_ID,
    title: m.title,
    description: m.description,
    fileUrl: null,
    content: m.content,
    category: CATEGORY,
    orderIndex: ORDER_BASE[m.subcat] + m.fileNum,
  }));
  const inserted = await db.insert(materialsTable).values(rows).returning({ id: materialsTable.id });
  console.log(`     ✓ inserted ${inserted.length} materi rows`);

  console.log("\n" + "=".repeat(70));
  console.log("  SELESAI");
  console.log("=".repeat(70));
  console.log(`  Materi inserted        : ${inserted.length}`);
  console.log(`  Package id             : ${CPNS_PACKAGE_ID}`);
  console.log(`  Category               : ${CATEGORY}`);
  console.log(`  orderIndex range used  : ${ORDER_MIN}..${ORDER_MAX}`);
  console.log("=".repeat(70));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
