import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db, usersTable, packagesTable, enrollmentsTable } from "@workspace/db";

const [, , emailArg, passwordArg, nameArg, packageIdArg] = process.argv;

const email = (emailArg ?? "asih@hemitech.id").trim().toLowerCase();
const password = passwordArg ?? "testing009";
const name = nameArg ?? "Asih";
const packageId = Number(packageIdArg ?? "1");

async function main(): Promise<void> {
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  if (!pkg) throw new Error(`Package ${packageId} not found`);

  const hashed = await bcrypt.hash(password, 12);

  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (user) {
    [user] = await db.update(usersTable).set({
      password: hashed,
      name,
      isEmailVerified: true,
    }).where(eq(usersTable.id, user.id)).returning();
    console.log(`Updated user ${email} (id=${user.id}) — password reset, email verified.`);
  } else {
    [user] = await db.insert(usersTable).values({
      name,
      email,
      password: hashed,
      role: "student",
      isEmailVerified: true,
    }).returning();
    console.log(`Created user ${email} (id=${user.id}).`);
  }

  const startedAt = new Date();
  const expiredAt = new Date(startedAt.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

  const [existing] = await db.select().from(enrollmentsTable).where(
    and(eq(enrollmentsTable.userId, user.id), eq(enrollmentsTable.packageId, packageId))
  );

  if (existing) {
    await db.update(enrollmentsTable).set({
      isActive: true,
      startedAt,
      expiredAt,
    }).where(eq(enrollmentsTable.id, existing.id));
    console.log(`Renewed enrollment id=${existing.id} → "${pkg.name}" until ${expiredAt.toISOString()}.`);
  } else {
    const [enrollment] = await db.insert(enrollmentsTable).values({
      userId: user.id,
      packageId,
      startedAt,
      expiredAt,
      isActive: true,
    }).returning();
    console.log(`Created enrollment id=${enrollment.id} → "${pkg.name}" until ${expiredAt.toISOString()}.`);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
