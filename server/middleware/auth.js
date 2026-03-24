import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

export function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Forbidden" });
  }
  next();
}