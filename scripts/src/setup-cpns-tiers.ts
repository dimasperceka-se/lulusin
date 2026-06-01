import {
  db,
  packagesTable,
  materialsTable,
  quizzesTable,
  tryoutsTable,
} from "@workspace/db";
import { eq, sql, asc } from "drizzle-orm";

const CPNS_PACKAGE_ID = 1;

const FREE_PRICE = 0;
const BASIC_PRICE = 79_000;
const ADVANCE_PRICE = 149_000;

// Free tier always gets exactly this many items (fixed by spec).
const FREE_MATERIALS = 3;
const FREE_QUIZZES = 3;
const FREE_TRYOUTS = 1;

type TierName = "free" | "basic" | "advance";

// Split N items into tiers such that:
//   - first `freeCount` items → tier "free"
//   - items [freeCount, basicVisibleCount) → tier "basic"  (Basic users see free+basic items)
//   - rest                                  → tier "advance"
//   Basic users end up seeing ceil(total/2) items in total.
function planTiers(total: number, freeCount: number): TierName[] {
  const basicVisibleTotal = Math.max(freeCount, Math.ceil(total / 2));
  const out: TierName[] = [];
  for (let i = 0; i < total; i++) {
    if (i < freeCount) out.push("free");
    else if (i < basicVisibleTotal) out.push("basic");
    else out.push("advance");
  }
  return out;
}

async function assignTiers<T extends { id: number }>(
  rows: T[],
  freeCount: number,
  setTier: (id: number, tier: TierName) => Promise<void>,
  label: string,
): Promise<void> {
  const plan = planTiers(rows.length, freeCount);
  const counts: Record<TierName, number> = { free: 0, basic: 0, advance: 0 };
  for (let i = 0; i < rows.length; i++) {
    const tier = plan[i];
    await setTier(rows[i].id, tier);
    counts[tier]++;
  }
  const total = rows.length;
  console.log(
    `  ${label.padEnd(10)} total=${total}  ` +
    `tags: free=${counts.free} basic=${counts.basic} advance=${counts.advance}  ` +
    `→ user sees: free=${counts.free}, basic=${counts.free + counts.basic}, advance=${total}`,
  );
}

async function main(): Promise<void> {
  console.log("→ Setting CPNS package prices (0 / 79k / 149k)...");
  const [pkg] = await db.update(packagesTable)
    .set({ price: FREE_PRICE, priceBasic: BASIC_PRICE, priceAdvance: ADVANCE_PRICE })
    .where(eq(packagesTable.id, CPNS_PACKAGE_ID))
    .returning();

  if (!pkg) {
    console.error(`✗ CPNS package id=${CPNS_PACKAGE_ID} not found.`);
    process.exit(1);
  }
  console.log(`✓ ${pkg.name}: price=${pkg.price}, basic=${pkg.priceBasic}, advance=${pkg.priceAdvance}`);

  console.log("\n→ Distributing tiers...");

  const materials = await db.select({ id: materialsTable.id })
    .from(materialsTable)
    .where(eq(materialsTable.packageId, CPNS_PACKAGE_ID))
    .orderBy(asc(materialsTable.id));
  await assignTiers(materials, FREE_MATERIALS,
    (id, tier) => db.update(materialsTable).set({ tier }).where(eq(materialsTable.id, id)).then(() => undefined),
    "materials",
  );

  const quizzes = await db.select({ id: quizzesTable.id })
    .from(quizzesTable)
    .where(eq(quizzesTable.packageId, CPNS_PACKAGE_ID))
    .orderBy(asc(quizzesTable.id));
  await assignTiers(quizzes, FREE_QUIZZES,
    (id, tier) => db.update(quizzesTable).set({ tier }).where(eq(quizzesTable.id, id)).then(() => undefined),
    "quizzes",
  );

  const tryouts = await db.select({ id: tryoutsTable.id })
    .from(tryoutsTable)
    .where(eq(tryoutsTable.packageId, CPNS_PACKAGE_ID))
    .orderBy(asc(tryoutsTable.id));
  await assignTiers(tryouts, FREE_TRYOUTS,
    (id, tier) => db.update(tryoutsTable).set({ tier }).where(eq(tryoutsTable.id, id)).then(() => undefined),
    "tryouts",
  );

  const summary = await db.execute(sql`
    SELECT 'material' AS kind, tier, count(*) AS n FROM materials WHERE package_id = ${CPNS_PACKAGE_ID} GROUP BY tier
    UNION ALL
    SELECT 'quiz' AS kind, tier, count(*) AS n FROM quizzes WHERE package_id = ${CPNS_PACKAGE_ID} GROUP BY tier
    UNION ALL
    SELECT 'tryout' AS kind, tier, count(*) AS n FROM tryouts WHERE package_id = ${CPNS_PACKAGE_ID} GROUP BY tier
    ORDER BY kind, tier
  `);

  console.log("\n=== Final tag distribution ===");
  for (const row of summary.rows as { kind: string; tier: string; n: string }[]) {
    console.log(`   ${row.kind.padEnd(10)} ${row.tier.padEnd(8)} ${row.n}`);
  }
  console.log("\n✓ Done.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
