import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const PUBLIC_FIELDS = {
  id: true,
  employeeId: true,
  email: true,
  name: true,
  role: true,
  jobTitle: true,
  phone: true,
  address: true,
  profilePicture: true,
  baseSalary: true,
  allowances: true,
  deductions: true,
  createdAt: true,
};

// GET /api/employees/me
router.get("/me", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: PUBLIC_FIELDS,
  });
  res.json({ user });
});

// PATCH /api/employees/me — employees can only touch a limited set of fields
router.patch("/me", async (req, res) => {
  const { phone, address, profilePicture } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { phone, address, profilePicture },
    select: PUBLIC_FIELDS,
  });
  res.json({ user });
});

// GET /api/employees — admin only, list all employees
router.get("/", requireRole("ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { ...PUBLIC_FIELDS, baseSalary: false }, // keep salary out of the list view
    orderBy: { name: "asc" },
  });
  res.json({ users });
});

// GET /api/employees/:id — admin only
router.get("/:id", requireRole("ADMIN"), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: PUBLIC_FIELDS,
  });
  if (!user) return res.status(404).json({ error: "Employee not found" });
  res.json({ user });
});

// PATCH /api/employees/:id — admin can edit any field, including salary
router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { name, jobTitle, phone, address, profilePicture, baseSalary, allowances, deductions, role } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, jobTitle, phone, address, profilePicture, baseSalary, allowances, deductions, role },
    select: PUBLIC_FIELDS,
  });
  res.json({ user });
});

export default router;
