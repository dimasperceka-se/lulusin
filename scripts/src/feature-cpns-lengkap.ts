import { db, packagesTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";

async function main(): Promise<void> {
  const TARGET_NAME = "Paket CPNS Lengkap 2026";
  const NEW_PRICE = 249000;
  const NEW_SORT_ORDER = 100;

  const result = await db.update(packagesTable)
    .set({ price: NEW_PRICE, sortOrder: NEW_SORT_ORDER })
    .where(eq(packagesTable.name, TARGET_NAME))
    .returning({ id: packagesTable.id, name: packagesTable.name, price: packagesTable.price, sortOrder: packagesTable.sortOrder });

  if (result.length === 0) {
    console.error(`Package "${TARGET_NAME}" not found.`);
    process.exit(1);
  }
  console.log(`✓ Updated:`, result[0]);

  const all = await db.select({ id: packagesTable.id, name: packagesTable.name, price: packagesTable.price, sortOrder: packagesTable.sortOrder })
    .from(packagesTable)
    .orderBy(desc(packagesTable.sortOrder), asc(packagesTable.id));
  console.log("\nCurrent order:");
  for (const p of all) console.log(`  [${p.sortOrder}] id=${p.id} ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
