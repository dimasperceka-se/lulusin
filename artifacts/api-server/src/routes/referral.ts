import { Router } from "express";
import { db, usersTable, ordersTable, packagesTable, referralCodesTable, commissionsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { MarkCommissionPaidBody } from "@workspace/api-zod";
import { REFERRAL_DISCOUNT_RATE } from "../lib/referral";

const router = Router();

router.get("/referral/validate", async (req, res): Promise<void> => {
  const code = String(req.query.code ?? "").trim().toUpperCase();
  if (!code) {
    res.json({ valid: false, error: "Kode tidak boleh kosong." });
    return;
  }
  const [rc] = await db.select().from(referralCodesTable).where(
    and(eq(referralCodesTable.code, code), eq(referralCodesTable.isActive, true))
  );
  if (!rc) {
    res.json({ valid: false, error: "Kode referal tidak ditemukan." });
    return;
  }
  const [holder] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, rc.holderUserId));
  res.json({
    valid: true,
    holderName: holder?.name ?? null,
    discountPercent: Math.round(REFERRAL_DISCOUNT_RATE * 100),
  });
});

router.get("/referral/me", authenticate, requireRole("referral_holder"), async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const [rc] = await db.select().from(referralCodesTable).where(eq(referralCodesTable.holderUserId, userId));
  if (!rc) {
    res.status(404).json({ error: "Referral code not found for this holder." });
    return;
  }

  const [agg] = await db.select({
    totalReferees: sql<number>`count(*)`,
    totalEarned: sql<number>`coalesce(sum(commission_amount), 0)`,
    totalPending: sql<number>`coalesce(sum(case when status = 'PENDING' then commission_amount else 0 end), 0)`,
    totalPaid: sql<number>`coalesce(sum(case when status = 'PAID' then commission_amount else 0 end), 0)`,
  }).from(commissionsTable).where(eq(commissionsTable.holderUserId, userId));

  res.json({
    code: rc.code,
    isActive: rc.isActive,
    totalReferees: Number(agg?.totalReferees ?? 0),
    totalEarned: Number(agg?.totalEarned ?? 0),
    totalPending: Number(agg?.totalPending ?? 0),
    totalPaid: Number(agg?.totalPaid ?? 0),
  });
});

router.get("/referral/me/referees", authenticate, requireRole("referral_holder"), async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const rows = await db
    .select({
      commissionId: commissionsTable.id,
      refereeName: usersTable.name,
      refereeEmail: usersTable.email,
      packageName: packagesTable.name,
      orderCode: ordersTable.orderCode,
      paidAmount: commissionsTable.paidAmount,
      commissionAmount: commissionsTable.commissionAmount,
      status: commissionsTable.status,
      payoutAt: commissionsTable.payoutAt,
      createdAt: commissionsTable.createdAt,
    })
    .from(commissionsTable)
    .innerJoin(usersTable, eq(commissionsTable.refereeUserId, usersTable.id))
    .innerJoin(ordersTable, eq(commissionsTable.orderId, ordersTable.id))
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .where(eq(commissionsTable.holderUserId, userId))
    .orderBy(desc(commissionsTable.createdAt));

  res.json(rows);
});

router.get("/admin/referral/stats", authenticate, requireRole("admin"), async (_req, res): Promise<void> => {
  const [{ totalHolders }] = await db.select({ totalHolders: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "referral_holder"));
  const [agg] = await db.select({
    totalReferralOrders: sql<number>`count(*)`,
    totalReferralRevenue: sql<number>`coalesce(sum(paid_amount), 0)`,
    totalCommissionPending: sql<number>`coalesce(sum(case when status = 'PENDING' then commission_amount else 0 end), 0)`,
    totalCommissionPaid: sql<number>`coalesce(sum(case when status = 'PAID' then commission_amount else 0 end), 0)`,
  }).from(commissionsTable);

  res.json({
    totalHolders: Number(totalHolders),
    totalReferralOrders: Number(agg?.totalReferralOrders ?? 0),
    totalReferralRevenue: Number(agg?.totalReferralRevenue ?? 0),
    totalCommissionPending: Number(agg?.totalCommissionPending ?? 0),
    totalCommissionPaid: Number(agg?.totalCommissionPaid ?? 0),
  });
});

router.get("/admin/referral/holders", authenticate, requireRole("admin"), async (_req, res): Promise<void> => {
  const holders = await db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      joinedAt: usersTable.createdAt,
      code: referralCodesTable.code,
      isActive: referralCodesTable.isActive,
    })
    .from(usersTable)
    .leftJoin(referralCodesTable, eq(referralCodesTable.holderUserId, usersTable.id))
    .where(eq(usersTable.role, "referral_holder"))
    .orderBy(desc(usersTable.createdAt));

  const stats = await db
    .select({
      holderUserId: commissionsTable.holderUserId,
      totalReferees: sql<number>`count(*)`,
      totalCommission: sql<number>`coalesce(sum(commission_amount), 0)`,
    })
    .from(commissionsTable)
    .groupBy(commissionsTable.holderUserId);
  const statsMap = new Map(stats.map(s => [s.holderUserId, s]));

  res.json(holders.map(h => ({
    userId: h.userId,
    name: h.name,
    email: h.email,
    code: h.code ?? "",
    isActive: h.isActive ?? false,
    totalReferees: Number(statsMap.get(h.userId)?.totalReferees ?? 0),
    totalCommission: Number(statsMap.get(h.userId)?.totalCommission ?? 0),
    joinedAt: h.joinedAt,
  })));
});

router.get("/admin/referral/commissions", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const status = req.query.status as "PENDING" | "PAID" | undefined;
  const holderId = req.query.holderId ? Number(req.query.holderId) : undefined;

  const conditions = [];
  if (status === "PENDING" || status === "PAID") conditions.push(eq(commissionsTable.status, status));
  if (holderId) conditions.push(eq(commissionsTable.holderUserId, holderId));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const holderUsers = { ...usersTable };
  const refereeUsers = { ...usersTable };

  const rows = await db
    .select({
      id: commissionsTable.id,
      orderId: commissionsTable.orderId,
      orderCode: ordersTable.orderCode,
      holderUserId: commissionsTable.holderUserId,
      holderName: sql<string>`holder.name`,
      holderEmail: sql<string>`holder.email`,
      refereeUserId: commissionsTable.refereeUserId,
      refereeName: sql<string>`referee.name`,
      refereeEmail: sql<string>`referee.email`,
      packageName: packagesTable.name,
      referralCode: commissionsTable.referralCode,
      paidAmount: commissionsTable.paidAmount,
      commissionAmount: commissionsTable.commissionAmount,
      status: commissionsTable.status,
      payoutAt: commissionsTable.payoutAt,
      payoutBy: commissionsTable.payoutBy,
      payoutNote: commissionsTable.payoutNote,
      createdAt: commissionsTable.createdAt,
    })
    .from(commissionsTable)
    .innerJoin(ordersTable, eq(commissionsTable.orderId, ordersTable.id))
    .innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .innerJoin(sql`${usersTable} as holder`, sql`holder.id = ${commissionsTable.holderUserId}`)
    .innerJoin(sql`${usersTable} as referee`, sql`referee.id = ${commissionsTable.refereeUserId}`)
    .where(whereClause)
    .orderBy(desc(commissionsTable.createdAt));

  res.json(rows);
});

router.post("/admin/referral/commissions/:id/mark-paid", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = MarkCommissionPaidBody.safeParse(req.body ?? {});
  const note = parsed.success ? (parsed.data.note ?? null) : null;

  const [existing] = await db.select().from(commissionsTable).where(eq(commissionsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Commission not found" });
    return;
  }

  const [updated] = await db.update(commissionsTable).set({
    status: "PAID",
    payoutAt: new Date(),
    payoutBy: req.user!.userId,
    payoutNote: note,
  }).where(eq(commissionsTable.id, id)).returning();

  const [order] = await db.select({ orderCode: ordersTable.orderCode, packageName: packagesTable.name })
    .from(ordersTable).innerJoin(packagesTable, eq(ordersTable.packageId, packagesTable.id))
    .where(eq(ordersTable.id, updated.orderId));
  const [holder] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, updated.holderUserId));
  const [referee] = await db.select({ name: usersTable.name, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, updated.refereeUserId));

  res.json({
    id: updated.id,
    orderId: updated.orderId,
    orderCode: order?.orderCode ?? "",
    holderUserId: updated.holderUserId,
    holderName: holder?.name ?? "",
    holderEmail: holder?.email ?? "",
    refereeUserId: updated.refereeUserId,
    refereeName: referee?.name ?? "",
    refereeEmail: referee?.email ?? "",
    packageName: order?.packageName ?? "",
    referralCode: updated.referralCode,
    paidAmount: updated.paidAmount,
    commissionAmount: updated.commissionAmount,
    status: updated.status,
    payoutAt: updated.payoutAt,
    payoutBy: updated.payoutBy,
    payoutNote: updated.payoutNote,
    createdAt: updated.createdAt,
  });
});

export default router;
