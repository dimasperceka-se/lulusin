import { eq } from "drizzle-orm";
import {
  db,
  usersTable,
  enrollmentsTable,
  attemptsTable,
  materialProgressTable,
  ordersTable,
  commissionsTable,
  referralCodesTable,
} from "@workspace/db";

const emails = process.argv.slice(2).map((e) => e.trim().toLowerCase()).filter(Boolean);

if (emails.length === 0) {
  console.error("usage: pnpm --filter @workspace/scripts delete-student <email> [email...]");
  process.exit(1);
}

async function deleteByEmail(email: string): Promise<void> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    console.log(`[skip] ${email} — not found`);
    return;
  }

  if (user.role === "admin" || user.role === "tutor") {
    console.error(`[abort] ${email} (id=${user.id}) has role=${user.role} — refusing to delete privileged account`);
    return;
  }

  const orders = await db.select({ id: ordersTable.id }).from(ordersTable).where(eq(ordersTable.userId, user.id));
  if (orders.length > 0) {
    console.error(`[abort] ${email} (id=${user.id}) has ${orders.length} order(s) — refusing to hard-delete financial records`);
    return;
  }

  const refCodes = await db.select({ id: referralCodesTable.id }).from(referralCodesTable).where(eq(referralCodesTable.holderUserId, user.id));
  if (refCodes.length > 0) {
    console.error(`[abort] ${email} is a referral partner with ${refCodes.length} code(s) — refusing`);
    return;
  }

  const commissionsAsReferee = await db.select({ id: commissionsTable.id }).from(commissionsTable).where(eq(commissionsTable.refereeUserId, user.id));
  if (commissionsAsReferee.length > 0) {
    console.error(`[abort] ${email} has ${commissionsAsReferee.length} commission record(s) — refusing`);
    return;
  }

  await db.transaction(async (tx) => {
    const att = await tx.delete(attemptsTable).where(eq(attemptsTable.userId, user.id)).returning({ id: attemptsTable.id });
    const prog = await tx.delete(materialProgressTable).where(eq(materialProgressTable.userId, user.id)).returning({ id: materialProgressTable.id });
    const enr = await tx.delete(enrollmentsTable).where(eq(enrollmentsTable.userId, user.id)).returning({ id: enrollmentsTable.id });
    await tx.delete(usersTable).where(eq(usersTable.id, user.id));
    console.log(`[ok] deleted ${email} (id=${user.id}) — ${att.length} attempts, ${prog.length} progress, ${enr.length} enrollments`);
  });
}

async function main(): Promise<void> {
  for (const email of emails) {
    try {
      await deleteByEmail(email);
    } catch (err) {
      console.error(`[error] ${email}:`, err);
    }
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
