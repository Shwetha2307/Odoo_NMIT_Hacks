import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/attendance/checkin
router.post("/checkin", async (req, res) => {
  const date = todayDate();
  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: req.user.id, date } },
  });
  if (existing?.checkIn) {
    return res.status(409).json({ error: "You've already checked in today" });
  }

  const record = await prisma.attendance.upsert({
    where: { userId_date: { userId: req.user.id, date } },
    update: { checkIn: new Date(), status: "PRESENT" },
    create: { userId: req.user.id, date, checkIn: new Date(), status: "PRESENT" },
  });
  res.json({ record });
});

// POST /api/attendance/checkout
router.post("/checkout", async (req, res) => {
  const date = todayDate();
  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: req.user.id, date } },
  });
  if (!existing?.checkIn) {
    return res.status(400).json({ error: "Check in before checking out" });
  }

  const hoursWorked = (Date.now() - new Date(existing.checkIn).getTime()) / 3_600_000;
  const status = hoursWorked < 4 ? "HALF_DAY" : "PRESENT";

  const record = await prisma.attendance.update({
    where: { userId_date: { userId: req.user.id, date } },
    data: { checkOut: new Date(), status },
  });
  res.json({ record });
});

// GET /api/attendance/me?from=2026-08-01&to=2026-08-22
router.get("/me", async (req, res) => {
  const { from, to } = req.query;
  const records = await prisma.attendance.findMany({
    where: {
      userId: req.user.id,
      ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
    },
    orderBy: { date: "desc" },
  });
  res.json({ records });
});

// GET /api/attendance — admin only, everyone's attendance for a given date
router.get("/", requireRole("ADMIN"), async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : todayDate();
  const records = await prisma.attendance.findMany({
    where: { date },
    include: { user: { select: { id: true, name: true, employeeId: true, jobTitle: true } } },
  });
  res.json({ records });
});

export default router;
