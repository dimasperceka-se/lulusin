import { Router } from "express";
import { db, ordersTable, enrollmentsTable, packagesTable, bankAccountsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateOrderBody, UploadPaymentProofBody, VerifyOrderBody, ListOrdersQueryParams } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

function generateOrderCode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${date}-${random}`;
}

function generateUniqueAmount(baseAmount: number): number {
  const suffix = Math.floor(100 + Math.random() * 900);
  return baseAmount + suffix;
}

router.get("/orders", authenticate, async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  const query = params.success ? params.data : {};
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  const offset = (page - 1) * limit;

  const isAdmin = req.user!.role === "admin" || req.user!.role === "tutor";
  const userId = req.user!.userId;

  const conditions = [];
  if (!isAdmin) conditions.push(eq(ordersTable.userId, userId));
  if (query.status) conditions.push(eq(ordersTable.status, query.status as "PENDING" | "WAITING_VERIFICATION" | "PAID" | "EXPIRED" | "REJECTED"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(whereClause);

  const rows = await db.select().from(ordersTable).where(whereClause).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

  const ordersWithPackage = await Promise.all(rows.map(async (order) => {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, order.packageId));
    const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
    return { ...order, package: pkg, bankAccounts };
  }));

  res.json({ orders: ordersWithPackage, total: Number(count), page, limit });
});

router.post("/orders", authenticate, requireRole("student"), async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, parsed.data.packageId));
  if (!pkg) {
    res.status(404).json({ error: "Package not found" });
    return;
  }

  const existing = await db.select().from(enrollmentsTable).where(
    and(eq(enrollmentsTable.userId, req.user!.userId), eq(enrollmentsTable.packageId, parsed.data.packageId))
  );
  if (existing.length > 0) {
    res.status(400).json({ error: "Already enrolled in this package" });
    return;
  }

  const expiredAt = new Date();
  expiredAt.setHours(expiredAt.getHours() + 24);

  const [order] = await db.insert(ordersTable).values({
    userId: req.user!.userId,
    packageId: parsed.data.packageId,
    orderCode: generateOrderCode(),
    amount: pkg.price,
    uniqueAmount: generateUniqueAmount(pkg.price),
    status: "PENDING",
    expiredAt,
  }).returning();

  const [pkgData] = await db.select().from(packagesTable).where(eq(packagesTable.id, order.packageId));
  const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));

  res.status(201).json({ ...order, package: pkgData, bankAccounts });
});

router.get("/orders/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const isAdmin = req.user!.role === "admin";
  if (!isAdmin && order.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, order.packageId));
  const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
  res.json({ ...order, package: pkg, bankAccounts });
});

router.post("/orders/:id/upload-proof", authenticate, requireRole("student"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UploadPaymentProofBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, id), eq(ordersTable.userId, req.user!.userId)));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.status !== "PENDING") {
    res.status(400).json({ error: "Order is not in PENDING status" });
    return;
  }

  const [updated] = await db.update(ordersTable).set({
    paymentProof: parsed.data.paymentProof,
    status: "WAITING_VERIFICATION",
  }).where(eq(ordersTable.id, id)).returning();

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, updated.packageId));
  const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
  res.json({ ...updated, package: pkg, bankAccounts });
});

router.post("/orders/:id/verify", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = VerifyOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (parsed.data.action === "approve") {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, order.packageId));
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + (pkg?.durationDays ?? 30));

    const [updated] = await db.update(ordersTable).set({
      status: "PAID",
      paidAt: new Date(),
      verifiedBy: req.user!.userId,
    }).where(eq(ordersTable.id, id)).returning();

    await db.insert(enrollmentsTable).values({
      userId: order.userId,
      packageId: order.packageId,
      startedAt: new Date(),
      expiredAt,
      isActive: true,
    }).onConflictDoNothing();

    logger.info({ orderId: id, userId: order.userId }, "Order approved, enrollment created");

    const [pkgData] = await db.select().from(packagesTable).where(eq(packagesTable.id, updated.packageId));
    const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
    res.json({ ...updated, package: pkgData, bankAccounts });
  } else {
    const [updated] = await db.update(ordersTable).set({
      status: "REJECTED",
      rejectionReason: parsed.data.rejectionReason,
      verifiedBy: req.user!.userId,
    }).where(eq(ordersTable.id, id)).returning();

    logger.info({ orderId: id }, "Order rejected");

    const [pkgData] = await db.select().from(packagesTable).where(eq(packagesTable.id, updated.packageId));
    const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
    res.json({ ...updated, package: pkgData, bankAccounts });
  }
});

export default router;
