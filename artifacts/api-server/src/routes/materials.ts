import { Router } from "express";
import { db, materialsTable, materialProgressTable, enrollmentsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateMaterialBody, UpdateMaterialBody } from "@workspace/api-zod";

const router = Router();

const TIER_RANK: Record<string, number> = { free: 0, basic: 1, advance: 2 };

router.get("/packages/:packageId/materials", authenticate, async (req, res): Promise<void> => {
  const packageId = parseInt(Array.isArray(req.params.packageId) ? req.params.packageId[0] : req.params.packageId, 10);

  const isAdmin = req.user!.role === "admin" || req.user!.role === "tutor";
  let userTierRank = Infinity;
  if (!isAdmin) {
    const enrollments = await db.select().from(enrollmentsTable).where(
      and(eq(enrollmentsTable.userId, req.user!.userId), eq(enrollmentsTable.packageId, packageId), eq(enrollmentsTable.isActive, true))
    );
    if (enrollments.length === 0) {
      res.status(403).json({ error: "Not enrolled in this package" });
      return;
    }
    userTierRank = Math.max(...enrollments.map((e) => TIER_RANK[e.tier] ?? 0));
  }

  const materials = await db.select().from(materialsTable).where(eq(materialsTable.packageId, packageId));
  const visible = materials.filter((m) => (TIER_RANK[m.tier] ?? 0) <= userTierRank);

  const enriched = await Promise.all(visible.map(async (m) => {
    const [progress] = await db.select().from(materialProgressTable).where(
      and(eq(materialProgressTable.materialId, m.id), eq(materialProgressTable.userId, req.user!.userId))
    );
    return { ...m, isRead: progress?.isRead ?? false };
  }));

  res.json(enriched.sort((a, b) => a.orderIndex - b.orderIndex));
});

router.post("/packages/:packageId/materials", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const packageId = parseInt(Array.isArray(req.params.packageId) ? req.params.packageId[0] : req.params.packageId, 10);
  const parsed = CreateMaterialBody.safeParse({ ...req.body, packageId });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [material] = await db.insert(materialsTable).values({ packageId, ...req.body }).returning();
  res.status(201).json(material);
});

router.patch("/materials/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateMaterialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [material] = await db.update(materialsTable).set(parsed.data).where(eq(materialsTable.id, id)).returning();
  if (!material) {
    res.status(404).json({ error: "Material not found" });
    return;
  }
  res.json(material);
});

router.delete("/materials/:id", authenticate, requireRole("admin", "tutor"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(materialsTable).where(eq(materialsTable.id, id));
  res.sendStatus(204);
});

router.post("/materials/:id/read", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const userId = req.user!.userId;

  const existing = await db.select().from(materialProgressTable).where(
    and(eq(materialProgressTable.materialId, id), eq(materialProgressTable.userId, userId))
  );

  if (existing.length > 0) {
    const [updated] = await db.update(materialProgressTable).set({ isRead: true, readAt: new Date() }).where(
      and(eq(materialProgressTable.materialId, id), eq(materialProgressTable.userId, userId))
    ).returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(materialProgressTable).values({
      userId,
      materialId: id,
      isRead: true,
      readAt: new Date(),
    }).returning();
    res.json(created);
  }
});

router.get("/packages/:packageId/progress", authenticate, async (req, res): Promise<void> => {
  const packageId = parseInt(Array.isArray(req.params.packageId) ? req.params.packageId[0] : req.params.packageId, 10);
  const userId = req.user!.userId;

  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(materialsTable).where(eq(materialsTable.packageId, packageId));
  const materialIds = await db.select({ id: materialsTable.id }).from(materialsTable).where(eq(materialsTable.packageId, packageId));
  const ids = materialIds.map(m => m.id);

  let read = 0;
  if (ids.length > 0) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(materialProgressTable).where(
      and(eq(materialProgressTable.userId, userId), eq(materialProgressTable.isRead, true))
    );
    read = Number(count);
  }

  const totalNum = Number(total);
  res.json({
    packageId,
    totalMaterials: totalNum,
    readMaterials: read,
    progressPercent: totalNum > 0 ? Math.round((read / totalNum) * 100) : 0,
  });
});

export default router;
