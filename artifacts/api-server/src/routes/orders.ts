import { Router } from "express";
import { db, ordersTable, enrollmentsTable, packagesTable, bankAccountsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateOrderBody, UploadPaymentProofBody, VerifyOrderBody, ListOrdersQueryParams, UpdateOrderMethodBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

const QRIS_API_URL = "https://qris.interactive.co.id/restapi/qris/show_qris.php";

function generateOrderCode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${date}-${random}`;
}

function generateUniqueAmount(): number {
  return Math.floor(100 + Math.random() * 900);
}

type QrisGenerated = {
  qrisContent: string;
  qrisInvoiceId: string;
  qrisNmid: string;
  qrisGeneratedAt: Date;
};

async function generateQris(orderCode: string, amount: number): Promise<QrisGenerated> {
  const apiKey = process.env.QRIS_INTERACTIVE_API_KEY;
  const mID = process.env.QRIS_INTERACTIVE_MID;
  if (!apiKey || !mID) {
    throw new Error("QRIS provider not configured (missing QRIS_INTERACTIVE_API_KEY or QRIS_INTERACTIVE_MID)");
  }

  const params = new URLSearchParams({
    do: "create-invoice",
    apikey: apiKey,
    mID: mID,
    cliTrxNumber: orderCode,
    cliTrxAmount: String(amount),
    useTip: "no",
  });

  const resp = await fetch(`${QRIS_API_URL}?${params.toString()}`, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`QRIS provider HTTP ${resp.status}`);
  }
  const json = await resp.json() as { status: string; data: Record<string, string> };
  if (json.status !== "success" || !json.data?.qris_content) {
    throw new Error(`QRIS provider error: ${json.data?.qris_status ?? "unknown"}`);
  }
  return {
    qrisContent: json.data.qris_content,
    qrisInvoiceId: json.data.qris_invoiceid,
    qrisNmid: json.data.qris_nmid,
    qrisGeneratedAt: new Date(),
  };
}

async function enrichOrder(order: typeof ordersTable.$inferSelect) {
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, order.packageId));
  const bankAccounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
  return { ...order, package: pkg, bankAccounts };
}

type QrisStatusResult = {
  status: "paid" | "unpaid" | "expired" | "unknown";
  paidAt?: Date | null;
  payerName?: string | null;
  paymentMethod?: string | null;
};

// Response format guessed from QRIS Interactive create-invoice pattern.
// Adjust field names after first real check-status call is logged.
async function checkQrisStatus(qrisInvoiceId: string): Promise<QrisStatusResult> {
  const apiKey = process.env.QRIS_INTERACTIVE_API_KEY;
  const mID = process.env.QRIS_INTERACTIVE_MID;
  if (!apiKey || !mID) throw new Error("QRIS provider not configured");

  const params = new URLSearchParams({
    do: "checkpaid-qris",
    apikey: apiKey,
    mID: mID,
    invid: qrisInvoiceId,
  });
  const resp = await fetch(`${QRIS_API_URL}?${params.toString()}`, { method: "GET" });
  if (!resp.ok) throw new Error(`QRIS check-status HTTP ${resp.status}`);
  const json = await resp.json() as { status?: string; data?: Record<string, string> };

  const data = json.data ?? {};
  const rawStatus = String(data.qris_status ?? data.status ?? "").toLowerCase();
  let status: QrisStatusResult["status"] = "unknown";
  if (["paid", "success", "settlement", "settled", "lunas"].includes(rawStatus)) status = "paid";
  else if (["unpaid", "pending"].includes(rawStatus)) status = "unpaid";
  else if (["expired", "cancelled", "canceled", "failed"].includes(rawStatus)) status = "expired";

  return {
    status,
    paidAt: data.qris_paid_at ? new Date(data.qris_paid_at) : null,
    payerName: data.qris_payer_name ?? data.qris_payment_customer_name ?? null,
    paymentMethod: data.qris_payment_method ?? null,
  };
}

export async function markOrderPaid(orderId: number, paidAt?: Date): Promise<void> {
  const [current] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!current || current.status === "PAID") return;

  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, current.packageId));
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + (pkg?.durationDays ?? 30));

  await db.update(ordersTable).set({
    status: "PAID",
    paidAt: paidAt ?? new Date(),
  }).where(eq(ordersTable.id, orderId));

  await db.insert(enrollmentsTable).values({
    userId: current.userId,
    packageId: current.packageId,
    startedAt: new Date(),
    expiredAt,
    isActive: true,
  }).onConflictDoNothing();

  logger.info({ orderId, userId: current.userId }, "Order auto-marked PAID, enrollment created");
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

  const orders = await Promise.all(rows.map(enrichOrder));

  res.json({ orders, total: Number(count), page, limit });
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

  const uniqueAmount = generateUniqueAmount();
  const paymentMethod = parsed.data.paymentMethod ?? "BANK_TRANSFER";
  const orderCode = generateOrderCode();

  let qrisFields: Partial<QrisGenerated> = {};
  if (paymentMethod === "QRIS") {
    try {
      qrisFields = await generateQris(orderCode, pkg.price + uniqueAmount);
    } catch (e) {
      logger.error({ err: e }, "Failed to generate QRIS at order creation");
      res.status(503).json({ error: "QRIS provider unavailable. Pilih Transfer Bank atau coba lagi." });
      return;
    }
  }

  const [order] = await db.insert(ordersTable).values({
    userId: req.user!.userId,
    packageId: parsed.data.packageId,
    orderCode,
    amount: pkg.price,
    uniqueAmount,
    paymentMethod,
    status: "PENDING",
    expiredAt,
    ...qrisFields,
  }).returning();

  res.status(201).json(await enrichOrder(order));
});

router.get("/orders/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

  let [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const isAdmin = req.user!.role === "admin";
  if (!isAdmin && order.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (order.status === "PENDING" && order.paymentMethod === "QRIS" && order.qrisInvoiceId) {
    try {
      const result = await checkQrisStatus(order.qrisInvoiceId);
      if (result.status === "paid") {
        await markOrderPaid(order.id, result.paidAt ?? undefined);
        [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
      }
    } catch (e) {
      logger.warn({ err: e, orderId: id }, "QRIS check-status failed (non-fatal)");
    }
  }

  res.json(await enrichOrder(order));
});

router.patch("/orders/:id/method", authenticate, requireRole("student"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateOrderMethodBody.safeParse(req.body);
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
    res.status(400).json({ error: "Can only change method while order is PENDING" });
    return;
  }

  let qrisFields: Partial<QrisGenerated> & { qrisContent?: string | null } = {};
  if (parsed.data.paymentMethod === "QRIS") {
    const QR_TTL_MS = 30 * 60 * 1000;
    const stale = !order.qrisContent || !order.qrisGeneratedAt || (Date.now() - new Date(order.qrisGeneratedAt).getTime() > QR_TTL_MS);
    if (stale) {
      try {
        qrisFields = await generateQris(order.orderCode, order.amount + order.uniqueAmount);
      } catch (e) {
        logger.error({ err: e, orderId: id }, "Failed to generate QRIS on method switch");
        res.status(503).json({ error: "QRIS provider unavailable. Pilih Transfer Bank atau coba lagi." });
        return;
      }
    }
  }

  const [updated] = await db.update(ordersTable).set({
    paymentMethod: parsed.data.paymentMethod,
    ...qrisFields,
  }).where(eq(ordersTable.id, id)).returning();

  res.json(await enrichOrder(updated));
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

  res.json(await enrichOrder(updated));
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

    res.json(await enrichOrder(updated));
  } else {
    const [updated] = await db.update(ordersTable).set({
      status: "REJECTED",
      rejectionReason: parsed.data.rejectionReason,
      verifiedBy: req.user!.userId,
    }).where(eq(ordersTable.id, id)).returning();

    logger.info({ orderId: id }, "Order rejected");

    res.json(await enrichOrder(updated));
  }
});

export default router;
