import { Router } from "express";
import { db, packagesTable, materialsTable, quizzesTable, tryoutsTable } from "@workspace/db";
import { eq, sql, ilike, and, isNull } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreatePackageBody, UpdatePackageBody, ListPackagesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/packages", async (req, res): Promise<void> => {
  const params = ListPackagesQueryParams.safeParse(req.query);
  const query = params.success ? params.data : {};

  let conditions: ReturnType<typeof eq>[] = [];
  if (query.category) conditions.push(eq(packagesTable.category, query.category as "CPNS" | "SD" | "SMP" | "SMA"));
  if (query.isActive !== undefined) conditions.push(eq(packagesTable.isActive, query.isActive as boolean));

  const rows = await db.select({
    id: packagesTable.id,
    name: packagesTable.name,
    description: packagesTable.description,
    price: packagesTable.price,
    durationDays: packagesTable.durationDays,
    category: packagesTable.category,
    thumbnail: packagesTable.thumbnail,
    isActive: packagesTable.isActive,
    createdAt: packagesTable.createdAt,
    materialCount: sql<number>`(SELECT count(*) FROM materials WHERE package_id = ${packagesTable.id})`,
    quizCount: sql<number>`(SELECT count(*) FROM quizzes WHERE package_id = ${packagesTable.id})`,
    tryoutCount: sql<number>`(SELECT count(*) FROM tryouts WHERE package_id = ${packagesTable.id})`,
  }).from(packagesTable).where(conditions.length > 0 ? and(...conditions) : undefined);

  const filtered = query.search
    ? rows.filter(p => p.name.toLowerCase().includes((query.search as string).toLowerCase()))
    : rows;

  res.json(filtered);
});

router.post("/packages", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [pkg] = await db.insert(packagesTable).values(parsed.data).returning();
  res.status(201).json(pkg);
});

router.get("/packages/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, id));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  const materials = await db.select().from(materialsTable).where(eq(materialsTable.packageId, id));
  const quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.packageId, id));
  const tryouts = await db.select().from(tryoutsTable).where(eq(tryoutsTable.packageId, id));
  res.json({ ...pkg, materials, quizzes, tryouts });
});

router.patch("/packages/:id", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, ...rest } = parsed.data;
  const [pkg] = await db.update(packagesTable).set({
    ...rest,
    ...(category !== undefined && { category: category as "CPNS" | "SD" | "SMP" | "SMA" }),
  }).where(eq(packagesTable.id, id)).returning();
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json(pkg);
});

router.delete("/packages/:id", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(packagesTable).where(eq(packagesTable.id, id));
  res.sendStatus(204);
});

export default router;
