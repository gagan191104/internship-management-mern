const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * JWT auth + role guard. Returns 401 if no/invalid token, 403 if wrong role or inactive user.
 * @param {string[]} allowedRoles - e.g. ['admin'] or ['student','employer']
 * @param {{ requireVerified?: boolean }} options
 */
function protectRoute(allowedRoles = [], options = {}) {
  const { requireVerified = false } = options;

  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authorized, invalid token payload" });
      }

      const user = await User.findById(userId).select("-password");
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or deactivated" });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }

      if (requireVerified && user.role !== "admin" && !user.isVerified) {
        return res.status(403).json({
          message: "Your account is pending admin approval.",
        });
      }

      req.user = user;
      req.tokenPayload = decoded;
      next();
    } catch {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  };
}

/** Optional auth — attaches req.user when valid Bearer token present */
function auth(required = true) {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ message: "Not authorized, no token" });
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      const user = await User.findById(userId).select("-password");
      if (!user || !user.isActive) {
        if (required) return res.status(401).json({ message: "User not found" });
        req.user = null;
        return next();
      }
      req.user = user;
      next();
    } catch {
      if (required) return res.status(401).json({ message: "Not authorized, token invalid" });
      req.user = null;
      next();
    }
  };
}

const protect = auth(true);

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

function requireVerified(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "admin" && !req.user.isVerified) {
    return res.status(403).json({ message: "Your account is pending admin approval." });
  }
  next();
}

function requireAdmin(req, res, next) {
  return authorizeRoles("admin")(req, res, next);
}

module.exports = {
  protectRoute,
  auth,
  protect,
  authorizeRoles,
  requireVerified,
  requireAdmin,
};
