import { Router } from "express";
import { db, usersTable, ordersTable, packagesTable, enrollmentsTable, attemptsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/admin/stats", authenticate, requireRole("admin"), async (_req, res): Promise<void> => {
  const [{ totalStudents }] = await db.select({ totalStudents: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "student"));
  const [{ pendingOrders }] = await db.select({ pendingOrders: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "WAITING_VERIFICATION"));
  const [{ totalPackages }] = await db.select({ totalPackages: sql<number>`count(*)` }).from(packagesTable);
  const [{ activeEnrollments }] = await db.select({ activeEnrollments: sql<number>`count(*)` }).from(enrollmentsTable).where(eq(enrollmentsTable.isActive, true));

  const [{ totalRevenue }] = await db.select({ totalRevenue: sql<number>`coalesce(sum(unique_amount), 0)` }).from(ordersTable).where(eq(ordersTable.status, "PAID"));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ revenueThisMonth }] = await db.select({ revenueThisMonth: sql<number>`coalesce(sum(unique_amount), 0)` }).from(ordersTable).where(
    and(eq(ordersTable.status, "PAID"), gte(ordersTable.paidAt, monthStart))
  );
  const [{ newStudentsThisMonth }] = await db.select({ newStudentsThisMonth: sql<number>`count(*)` }).from(usersTable).where(
    and(eq(usersTable.role, "student"), gte(usersTable.createdAt, monthStart))
  );

  res.json({
    totalStudents: Number(totalStudents),
    totalRevenue: Number(totalRevenue),
    pendingOrders: Number(pendingOrders),
    totalPackages: Number(totalPackages),
    activeEnrollments: Number(activeEnrollments),
    newStudentsThisMonth: Number(newStudentsThisMonth),
    revenueThisMonth: Number(revenueThisMonth),
  });
});

router.get("/admin/revenue", authenticate, requireRole("admin"), async (_req, res): Promise<void> => {
  const rows = await db.select({
    month: sql<string>`to_char(date_trunc('month', paid_at), 'YYYY-MM')`,
    revenue: sql<number>`sum(unique_amount)`,
    orders: sql<number>`count(*)`,
  }).from(ordersTable).where(eq(ordersTable.status, "PAID"))
    .groupBy(sql`date_trunc('month', paid_at)`)
    .orderBy(sql`date_trunc('month', paid_at)`);

  res.json(rows);
});

router.get("/users", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const offset = (page - 1) * limit;
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;

  const conditions = [];
  if (role) conditions.push(eq(usersTable.role, role as "admin" | "tutor" | "student"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(whereClause);

  let users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    role: usersTable.role,
    avatar: usersTable.avatar,
    targetInstitution: usersTable.targetInstitution,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(whereClause).limit(limit).offset(offset);

  if (search) {
    const s = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  res.json({ users, total: Number(count), page, limit });
});

router.get("/users/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [user] = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone,
    role: usersTable.role, avatar: usersTable.avatar, targetInstitution: usersTable.targetInstitution, createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, email, role, phone } = req.body;
  const [user] = await db.update(usersTable).set({ name, email, role, phone }).where(eq(usersTable.id, id)).returning({
    id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone,
    role: usersTable.role, avatar: usersTable.avatar, targetInstitution: usersTable.targetInstitution, createdAt: usersTable.createdAt,
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.delete("/users/:id", authenticate, requireRole("admin"), async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
