import { useEffect, useState } from "react";
import api from "../../services/api";

export default function EmployerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [internshipFilter, setInternshipFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const params = { page };
        if (filter !== "all") {
          params.status = filter;
        }
        if (internshipFilter) {
          params.internshipId = internshipFilter;
        }
        const { data } = await api.get("/employer/applications", { params });
        setApplications(data.applications);
        setTotalPages(data.pages);
        
        // Extract unique internships for filter
        const uniqueInternships = [...new Set(data.applications.map(app => app.internship?._id))];
        const internshipDetails = uniqueInternships.map(id => {
          const app = data.applications.find(a => a.internship?._id === id);
          return { _id: id, title: app.internship?.title || "Unknown" };
        });
        setInternships(internshipDetails);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filter, internshipFilter, page]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.patch(`/employer/application/${applicationId}/status`, { status: newStatus });
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Applications Received</h1>
        <p className="page-sub">Manage applications for your internship postings</p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("all")}
            style={{ fontSize: "0.85rem" }}
          >
            All Status
          </button>
          <button
            className={`btn ${filter === "applied" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("applied")}
            style={{ fontSize: "0.85rem" }}
          >
            Applied
          </button>
          <button
            className={`btn ${filter === "shortlisted" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("shortlisted")}
            style={{ fontSize: "0.85rem" }}
          >
            Shortlisted
          </button>
          <button
            className={`btn ${filter === "rejected" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("rejected")}
            style={{ fontSize: "0.85rem" }}
          >
            Rejected
          </button>
          <button
            className={`btn ${filter === "hired" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("hired")}
            style={{ fontSize: "0.85rem" }}
          >
            Hired
          </button>
        </div>
        
        <select
          value={internshipFilter}
          onChange={(e) => setInternshipFilter(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)", fontSize: "0.85rem" }}
        >
          <option value="">All Internships</option>
          {internships.map((internship) => (
            <option key={internship._id} value={internship._id}>
              {internship.title}
            </option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>No applications found.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Student Name</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>University</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Skills</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Applied For</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Date Applied</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Resume</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.75rem" }}>{app.user?.name || "Unknown"}</td>
                  <td style={{ padding: "0.75rem" }}>{app.user?.university || "N/A"}</td>
                  <td style={{ padding: "0.75rem" }}>
                    {app.user?.skills?.length > 0 ? (
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {app.user.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              backgroundColor: "var(--bg-elevated)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {app.user.skills.length > 3 && (
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            +{app.user.skills.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{app.internship?.title || "Unknown"}</td>
                  <td style={{ padding: "0.75rem" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "0.75rem" }}>
                    {app.resumeLink ? (
                      <a
                        href={app.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.85rem", color: "var(--primary)" }}
                      >
                        Download
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
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
                  <td style={{ padding: "0.75rem" }}>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid var(--border)",
                        fontSize: "0.8rem",
                      }}
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ fontSize: "0.85rem" }}
          >
            Previous
          </button>
          <span style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ fontSize: "0.85rem" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
