import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, usersTable, referralCodesTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, generateToken } from "../middlewares/auth";
import {
  RegisterBody,
  LoginBody,
  UpdateProfileBody,
  VerifyEmailBody,
  ResendVerificationBody,
  ForgotPasswordBody,
  ResetPasswordBody,
  RegisterReferralHolderBody,
} from "@workspace/api-zod";

const router = Router();

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;       // 1 hour

function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function publicUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    avatar: u.avatar,
    targetInstitution: u.targetInstitution,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt,
  };
}

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
  const verificationToken = randomToken();
  const verificationExpiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    phone: phone ?? null,
    targetInstitution: targetInstitution ?? null,
    role: "student",
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpiresAt: verificationExpiresAt,
  }).returning();

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: publicUser(user),
    verificationToken,
  });
});

router.post("/auth/register-referral-holder", async (req, res): Promise<void> => {
  const parsed = RegisterReferralHolderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;
  const referralCode = parsed.data.referralCode.trim().toUpperCase();

  if (!/^[A-Z0-9]{4,20}$/.test(referralCode)) {
    res.status(400).json({ error: "Kode referal harus 4-20 karakter alfanumerik (A-Z, 0-9)." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password minimal 6 karakter." });
    return;
  }

  const existingEmail = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existingEmail.length > 0) {
    res.status(400).json({ error: "Email sudah terdaftar." });
    return;
  }

  const existingCode = await db.select().from(referralCodesTable).where(eq(referralCodesTable.code, referralCode));
  if (existingCode.length > 0) {
    res.status(400).json({ error: "Kode referal sudah dipakai. Pilih kode lain." });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    role: "referral_holder",
    isEmailVerified: true,
  }).returning();

  await db.insert(referralCodesTable).values({
    holderUserId: user.id,
    code: referralCode,
    isActive: true,
  });

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user: publicUser(user) });
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
  res.json({ token, user: publicUser(user) });
});

router.get("/auth/me", authenticate, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(publicUser(user));
});

router.patch("/auth/me/profile", authenticate, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, req.user!.userId)).returning();
  res.json(publicUser(user));
});

router.post("/auth/verify-email", async (req, res): Promise<void> => {
  const parsed = VerifyEmailBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { token } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.emailVerificationToken, token));
  if (!user) {
    res.status(400).json({ error: "Token tidak valid atau sudah dipakai." });
    return;
  }
  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() < Date.now()) {
    res.status(400).json({ error: "Token sudah kedaluwarsa. Minta kirim ulang verifikasi." });
    return;
  }

  const [updated] = await db.update(usersTable).set({
    isEmailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpiresAt: null,
  }).where(eq(usersTable.id, user.id)).returning();

  res.json(publicUser(updated));
});

router.post("/auth/resend-verification", async (req, res): Promise<void> => {
  const parsed = ResendVerificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(404).json({ error: "Email tidak terdaftar." });
    return;
  }
  if (user.isEmailVerified) {
    res.status(400).json({ error: "Email sudah diverifikasi." });
    return;
  }

  const verificationToken = randomToken();
  const verificationExpiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
  await db.update(usersTable).set({
    emailVerificationToken: verificationToken,
    emailVerificationExpiresAt: verificationExpiresAt,
  }).where(eq(usersTable.id, user.id));

  res.json({ verificationToken, email: user.email, name: user.name });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(404).json({ error: "Email tidak terdaftar." });
    return;
  }

  const resetToken = randomToken();
  const resetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await db.update(usersTable).set({
    passwordResetToken: resetToken,
    passwordResetExpiresAt: resetExpiresAt,
  }).where(eq(usersTable.id, user.id));

  res.json({ resetToken, email: user.email, name: user.name });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { token, newPassword } = parsed.data;
  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password minimal 6 karakter." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.passwordResetToken, token));
  if (!user) {
    res.status(400).json({ error: "Token tidak valid atau sudah dipakai." });
    return;
  }
  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() < Date.now()) {
    res.status(400).json({ error: "Token sudah kedaluwarsa. Minta link reset baru." });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  const [updated] = await db.update(usersTable).set({
    password: hashed,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
  }).where(eq(usersTable.id, user.id)).returning();

  res.json(publicUser(updated));
});

export default router;
