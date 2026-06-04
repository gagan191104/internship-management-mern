import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly, allowedRoles, requireVerified }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const roles = useMemo(() => {
    if (allowedRoles?.length) return allowedRoles;
    if (adminOnly) return ["admin"];
    return null;
  }, [adminOnly, allowedRoles]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireVerified && user.role !== "admin" && !user.isVerified) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}
