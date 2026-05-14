import { db, commissionsTable, ordersTable, type Order } from "@workspace/db";
import { logger } from "./logger";

const COMMISSION_RATE = 0.20;
export const REFERRAL_DISCOUNT_RATE = 0.10;

export function calcCommission(paidAmount: number): number {
  return Math.round(paidAmount * COMMISSION_RATE);
}

export function calcDiscount(price: number): number {
  return Math.round(price * REFERRAL_DISCOUNT_RATE);
}

export async function createCommissionIfMissing(order: Order): Promise<void> {
  if (!order.referralCode || !order.referralHolderId) return;

  const paidAmount = order.amount;
  const commissionAmount = calcCommission(paidAmount);

  await db.insert(commissionsTable).values({
    orderId: order.id,
    holderUserId: order.referralHolderId,
    refereeUserId: order.userId,
    referralCode: order.referralCode,
    paidAmount,
    commissionAmount,
    status: "PENDING",
  }).onConflictDoNothing();

  logger.info({ orderId: order.id, holderUserId: order.referralHolderId, commissionAmount }, "Commission recorded for referral order");
}
