import ProtectedRoute from "./ProtectedRoute";

/**
 * Role-aware route guard (alias used in developer spec).
 * @example <PrivateRoute role="admin"><AdminPanel /></PrivateRoute>
 * @example <PrivateRoute role={['student']} requireVerified><Apply /></PrivateRoute>
 */
export default function PrivateRoute({ role, roles, children, requireVerified }) {
  const allowedRoles = roles || (role ? (Array.isArray(role) ? role : [role]) : null);
  return (
    <ProtectedRoute allowedRoles={allowedRoles} requireVerified={requireVerified}>
      {children}
    </ProtectedRoute>
  );
}
