import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const ADMIN_EMAIL = "dimas.perceka@hemitech.id";
const ADMIN_NAME = "Dimas Perceka";
const ADMIN_PASSWORD = "Jambrong55!!";

async function main(): Promise<void> {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL));
  if (existing) {
    if (existing.role !== "admin") {
      await db.update(usersTable).set({ role: "admin" }).where(eq(usersTable.id, existing.id));
      console.log(`Updated existing user ${ADMIN_EMAIL} role to admin.`);
    } else {
      console.log(`Admin ${ADMIN_EMAIL} already exists. No changes.`);
    }
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.insert(usersTable).values({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: "admin",
    isEmailVerified: true,
  });
  console.log(`Seeded admin ${ADMIN_EMAIL}.`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
