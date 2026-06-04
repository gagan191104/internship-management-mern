import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <div className="container" style={{ maxWidth: "560px" }}>
      <h1 className="page-title">Account under review</h1>
      <p className="page-sub">
        Your {user?.role} registration is <strong>{user?.status || "pending"}</strong>. An administrator must approve your account before you can{" "}
        {user?.role === "employer" ? "post internships" : "submit applications"}.
      </p>

      <div className="card">
        <p style={{ marginTop: 0, color: "var(--text-muted)" }}>
          You can still <Link to="/internships">browse internships</Link> while you wait.
        </p>
        {user?.status === "rejected" && user?.rejectionReason ? (
          <div className="alert alert-error" style={{ marginTop: "1rem" }}>
            <strong>Rejection reason:</strong> {user.rejectionReason}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <Link to="/internships" className="btn btn-primary" style={{ textDecoration: "none" }}>Browse internships</Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

