import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function statusBadge(status) {
  const map = {
    applied: "applied",
    shortlisted: "shortlisted",
    accepted: "accepted",
    rejected: "rejected",
  };
  const cls = map[status] || "applied";
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const { user, isAdmin, isEmployer } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin || isEmployer) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/applications/mine");
        if (!cancelled) setApplications(data.applications || []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load applications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isEmployer]);

  if (isAdmin) {
    return (
      <div className="container">
        <h1 className="page-title">Admin workspace</h1>
        <p className="page-sub">Manage internships and candidate pipelines from the admin panel.</p>
        <Link to="/admin" className="btn btn-primary">
          Open admin panel
        </Link>
      </div>
    );
  }

  if (isEmployer) {
    return (
      <div className="container">
        <h1 className="page-title">Employer workspace</h1>
        <p className="page-sub">Publish internships and review applicants tied to your company profile.</p>
        <Link to="/employer" className="btn btn-primary">
          Open employer panel
        </Link>
      </div>
    );
  }

  const applied = applications.filter((a) => a.status === "applied").length;
  const inProgress = applications.filter((a) => a.status === "shortlisted").length;
  const closed = applications.filter((a) => ["rejected", "hired"].includes(a.status)).length;

  return (
    <div className="container">
      <h1 className="page-title">Hi, {user?.name?.split(" ")[0] || "there"}</h1>
      <p className="page-sub">Your application pipeline and quick links.</p>

      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{applied}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Applied</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)" }}>{inProgress}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Shortlisted</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-muted)" }}>{closed}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Decided</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Link to="/internships" className="btn btn-primary">
          Find internships
        </Link>
        <Link to="/profile" className="btn btn-ghost">
          Edit profile
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Application tracking</h2>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Track your internship applications and their status.
          </p>
        </div>
        {error && (
          <div style={{ padding: "1rem 1.5rem" }}>
            <div className="alert alert-error">{error}</div>
          </div>
        )}
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading applications…</div>
        ) : applications.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            You have not applied yet.{" "}
            <Link to="/internships">Browse internships</Link>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <Link to={`/internships?q=${encodeURIComponent(a.internship?.title || "")}`}>{a.internship?.title}</Link>
                    </td>
                    <td>{a.internship?.company}</td>
                    <td>{a.internship?.type}</td>
                    <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
                    <td>{statusBadge(a.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
