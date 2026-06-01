import { Router } from "express";
import { db, enrollmentsTable, packagesTable, materialProgressTable, materialsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { EnrollFreeTierBody } from "@workspace/api-zod";
import { upsertEnrollment } from "./orders";

const router = Router();

router.post("/enrollments/free", authenticate, requireRole("student"), async (req, res): Promise<void> => {
  const parsed = EnrollFreeTierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, parsed.data.packageId));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + pkg.durationDays);
  await upsertEnrollment(req.user!.userId, parsed.data.packageId, "free", expiredAt);
  const [enrollment] = await db.select().from(enrollmentsTable).where(
    and(eq(enrollmentsTable.userId, req.user!.userId), eq(enrollmentsTable.packageId, parsed.data.packageId))
  );
  res.status(201).json({ ...enrollment, package: pkg });
});

router.get("/enrollments", authenticate, async (req, res): Promise<void> => {
  const isAdmin = req.user!.role === "admin";
  const userId = req.user!.userId;

  const conditions = isAdmin ? [] : [eq(enrollmentsTable.userId, userId)];
  const rows = await db.select().from(enrollmentsTable).where(conditions.length > 0 ? and(...conditions) : undefined);

  const enriched = await Promise.all(rows.map(async (enrollment) => {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, enrollment.packageId));
    const totalMaterials = await db.select({ count: sql<number>`count(*)` }).from(materialsTable).where(eq(materialsTable.packageId, enrollment.packageId));
    const readMaterials = await db.select({ count: sql<number>`count(*)` }).from(materialProgressTable).where(
      and(eq(materialProgressTable.userId, enrollment.userId), eq(materialProgressTable.isRead, true))
    );
    const total = Number(totalMaterials[0]?.count ?? 0);
    const read = Number(readMaterials[0]?.count ?? 0);
    const progressPercent = total > 0 ? Math.round((read / total) * 100) : 0;
    return { ...enrollment, package: pkg, progressPercent };
  }));

  res.json(enriched);
});

router.get("/enrollments/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [enrollment] = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.id, id));
  if (!enrollment) {
    res.status(404).json({ error: "Enrollment not found" });
    return;
  }
  const isAdmin = req.user!.role === "admin";
  if (!isAdmin && enrollment.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, enrollment.packageId));
  res.json({ ...enrollment, package: pkg });
});

export default router;
