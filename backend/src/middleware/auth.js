import { verifyToken } from "../utils/jwt.js";

// Requires a valid "Authorization: Bearer <token>" header.
// On success, attaches the decoded { id, role, employeeId } to req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Session expired or invalid, please sign in again" });
  }
}

// Use after requireAuth to restrict a route to one or more roles, e.g.
// router.get("/", requireAuth, requireRole("ADMIN"), handler)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have permission to do that" });
    }
    next();
  };
}
