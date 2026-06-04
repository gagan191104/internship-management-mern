import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function EmployerDashboard() {
  const [stats, setStats] = useState(null);
  const [myPostings, setMyPostings] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/employer/dashboard");
        setStats(data.stats);
        setMyPostings(data.myPostings);
        setRecentApplications(data.recentApplications);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <h1 className="page-title">Employer Dashboard</h1>
      <p className="page-sub">Overview of your internship postings and applications</p>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Postings</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)" }}>{stats?.totalPostings || 0}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Applications</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--primary)" }}>{stats?.totalApplications || 0}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Pending</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{stats?.pending || 0}</p>
        </div>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Hired</h3>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>{stats?.hired || 0}</p>
        </div>
      </div>

      {/* My Postings Table */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>My Postings</h2>
          <Link className="btn btn-primary" to="/employer/postings" style={{ fontSize: "0.85rem" }}>
            View All
          </Link>
        </div>
        {myPostings.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No postings yet. Create your first internship posting!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Title</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Location</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Type</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Deadline</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Status</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myPostings.slice(0, 5).map((posting) => (
                  <tr key={posting._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.75rem" }}>{posting.title}</td>
                    <td style={{ padding: "0.75rem" }}>{posting.location}</td>
                    <td style={{ padding: "0.75rem" }}>{posting.type}</td>
                    <td style={{ padding: "0.75rem" }}>{posting.deadline ? new Date(posting.deadline).toLocaleDateString() : "N/A"}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          backgroundColor: posting.isActive ? "var(--success)" : "var(--text-muted)",
                          color: "white",
                        }}
                      >
                        {posting.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <Link className="btn btn-ghost" to={`/employer/applications`} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        View Applicants
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Recent Applications</h2>
          <Link className="btn btn-primary" to="/employer/applications" style={{ fontSize: "0.85rem" }}>
            View All
          </Link>
        </div>
        {recentApplications.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No applications received yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Applicant Name</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Applied For</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Date Applied</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.75rem" }}>{app.user?.name || "Unknown"}</td>
                    <td style={{ padding: "0.75rem" }}>{app.internship?.title || "Unknown"}</td>
                    <td style={{ padding: "0.75rem" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          backgroundColor:
                            app.status === "hired"
                              ? "var(--success)"
                              : app.status === "shortlisted"
                              ? "var(--accent)"
                              : app.status === "rejected"
                              ? "var(--error)"
                              : "var(--text-muted)",
                          color: "white",
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
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
