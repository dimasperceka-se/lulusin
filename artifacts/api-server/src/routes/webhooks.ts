import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { markOrderPaid } from "./orders";

const router = Router();

router.post("/webhooks/qris", async (req, res): Promise<void> => {
  logger.info({ body: req.body, headers: req.headers }, "[QRIS Webhook] payload received");

  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const invoiceId = String(
      body.qris_invoiceid ??
      body.invoice_id ??
      body.invoiceid ??
      body.invid ??
      (body.data as Record<string, unknown> | undefined)?.qris_invoiceid ??
      ""
    );
    const orderCode = String(
      body.cliTrxNumber ??
      body.order_code ??
      body.merchant_order_id ??
      (body.data as Record<string, unknown> | undefined)?.cliTrxNumber ??
      ""
    );
    const rawStatus = String(
      body.status ??
      body.qris_status ??
      (body.data as Record<string, unknown> | undefined)?.qris_status ??
      ""
    ).toLowerCase();

    const isPaid = ["paid", "success", "settlement", "settled", "lunas"].includes(rawStatus);
    if (!isPaid) {
      logger.info({ rawStatus, invoiceId, orderCode }, "[QRIS Webhook] not a paid event, acknowledged");
      res.status(200).json({ message: "OK" });
      return;
    }

    let order;
    if (invoiceId) {
      [order] = await db.select().from(ordersTable).where(eq(ordersTable.qrisInvoiceId, invoiceId));
    }
    if (!order && orderCode) {
      [order] = await db.select().from(ordersTable).where(eq(ordersTable.orderCode, orderCode));
    }

    if (!order) {
      logger.warn({ invoiceId, orderCode }, "[QRIS Webhook] order not found");
      res.status(200).json({ message: "OK (order not found)" });
      return;
    }

    const paidAtRaw = String(
      body.paid_at ??
      body.qris_paid_at ??
      (body.data as Record<string, unknown> | undefined)?.qris_paid_at ??
      ""
    );
    const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();

    await markOrderPaid(order.id, isNaN(paidAt.getTime()) ? undefined : paidAt);
    logger.info({ orderId: order.id, orderCode: order.orderCode }, "[QRIS Webhook] order marked PAID");

    res.status(200).json({ message: "OK" });
  } catch (e) {
    logger.error({ err: e, body: req.body }, "[QRIS Webhook] processing error");
    res.status(200).json({ message: "OK (error logged)" });
  }
});

export default router;
