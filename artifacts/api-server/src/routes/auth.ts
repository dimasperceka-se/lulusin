import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, generateToken } from "../middlewares/auth";
import { RegisterBody, LoginBody, UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password, phone, targetInstitution } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    phone: phone ?? null,
    targetInstitution: targetInstitution ?? null,
    role: "student",
  }).returning();

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, targetInstitution: user.targetInstitution, createdAt: user.createdAt },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, targetInstitution: user.targetInstitution, createdAt: user.createdAt },
  });
});

router.get("/auth/me", authenticate, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, targetInstitution: user.targetInstitution, createdAt: user.createdAt });
});

router.patch("/auth/me/profile", authenticate, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, req.user!.userId)).returning();
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, targetInstitution: user.targetInstitution, createdAt: user.createdAt });
});

export default router;
