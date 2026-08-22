import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  try {
    const payload = verifyToken(header.split(" ")[1]);
    req.user = payload; // { id, role, employeeId }
    next();
  } catch {
    return res.status(401).json({ error: "Session expired or token invalid" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You don't have access to this resource" });
    }
    next();
  };
}
