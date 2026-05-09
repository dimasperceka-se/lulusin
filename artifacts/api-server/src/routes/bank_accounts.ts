import { Router } from "express";
import { db, bankAccountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";
import { CreateBankAccountBody, UpdateBankAccountBody } from "@workspace/api-zod";

const router = Router();

router.get("/bank-accounts", async (_req, res): Promise<void> => {
  const accounts = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.isActive, true));
  res.json(accounts);
});

router.post("/bank-accounts", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateBankAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [account] = await db.insert(bankAccountsTable).values(parsed.data).returning();
  res.status(201).json(account);
});

router.patch("/bank-accounts/:id", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateBankAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [account] = await db.update(bankAccountsTable).set(parsed.data).where(eq(bankAccountsTable.id, id)).returning();
  if (!account) {
    res.status(404).json({ error: "Bank account not found" });
    return;
  }
  res.json(account);
});

router.delete("/bank-accounts/:id", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(bankAccountsTable).where(eq(bankAccountsTable.id, id));
  res.sendStatus(204);
});

export default router;
