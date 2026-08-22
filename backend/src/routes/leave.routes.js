import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// POST /api/leave — apply for leave
router.post("/", async (req, res) => {
  const { type, startDate, endDate, remarks } = req.body;
  if (!type || !startDate || !endDate) {
    return res.status(400).json({ error: "type, startDate and endDate are required" });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: "End date can't be before the start date" });
  }

  const leave = await prisma.leaveRequest.create({
    data: { userId: req.user.id, type, startDate: new Date(startDate), endDate: new Date(endDate), remarks },
  });
  res.status(201).json({ leave });
});

// GET /api/leave/me
router.get("/me", async (req, res) => {
  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ leaves });
});

// GET /api/leave — admin only, filter by status (defaults to PENDING)
router.get("/", requireRole("ADMIN"), async (req, res) => {
  const status = req.query.status || "PENDING";
  const leaves = await prisma.leaveRequest.findMany({
    where: { status },
    include: { user: { select: { id: true, name: true, employeeId: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ leaves });
});

// PATCH /api/leave/:id — admin approves or rejects, with an optional comment
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { status, comment } = req.body;
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Status must be APPROVED or REJECTED" });
  }

  const leave = await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status, comment, reviewedBy: req.user.id },
  });

  // Reflect approved leave in attendance for each day in range.
  if (status === "APPROVED") {
    const days = [];
    let cursor = new Date(leave.startDate);
    while (cursor <= leave.endDate) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    await Promise.all(
      days.map((date) =>
        prisma.attendance.upsert({
          where: { userId_date: { userId: leave.userId, date } },
          update: { status: "LEAVE" },
          create: { userId: leave.userId, date, status: "LEAVE" },
        })
      )
    );
  }

  res.json({ leave });
});

export default router;
