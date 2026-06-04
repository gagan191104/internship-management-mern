import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function EmployerPostings() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPostings = async () => {
      try {
        setLoading(true);
        const params = { page };
        if (filter !== "all") {
          params.status = filter;
        }
        const { data } = await api.get("/employer/postings", { params });
        setPostings(data.postings);
        setTotalPages(data.pages);
      } catch (err) {
        console.error("Failed to fetch postings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostings();
  }, [filter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this posting?")) return;
    try {
      await api.delete(`/internships/${id}`);
      setPostings(postings.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed to delete posting:", err);
      alert("Failed to delete posting");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/internships/${id}`, { isActive: !currentStatus });
      setPostings(postings.map((p) => (p._id === id ? { ...p, isActive: !currentStatus } : p)));
    } catch (err) {
      console.error("Failed to update posting:", err);
      alert("Failed to update posting");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        <p>Loading postings...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title">My Postings</h1>
          <p className="page-sub">Manage your internship listings</p>
        </div>
        <Link className="btn btn-primary" to="/employer" style={{ fontSize: "0.9rem" }}>
          + Post New Internship
        </Link>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }}>
        <button
          className={`btn ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("all")}
          style={{ fontSize: "0.85rem" }}
        >
          All
        </button>
        <button
          className={`btn ${filter === "active" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("active")}
          style={{ fontSize: "0.85rem" }}
        >
          Active
        </button>
        <button
          className={`btn ${filter === "inactive" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("inactive")}
          style={{ fontSize: "0.85rem" }}
        >
          Inactive
        </button>
        <button
          className={`btn ${filter === "deadline-passed" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("deadline-passed")}
          style={{ fontSize: "0.85rem" }}
        >
          Deadline Passed
        </button>
      </div>

      {/* Postings Grid */}
      {postings.length === 0 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No postings found.</p>
          <Link className="btn btn-primary" to="/employer">
            Create Your First Posting
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {postings.map((posting) => (
            <div key={posting._id} className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>{posting.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{posting.company}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{posting.location}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{posting.type}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{posting.stipend}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Deadline: {posting.deadline ? new Date(posting.deadline).toLocaleDateString() : "N/A"}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {posting.applicantCount || 0} applicant{(posting.applicantCount || 0) !== 1 ? "s" : ""}
                </span>
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
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link className="btn btn-ghost" to="/employer/applications" style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}>
                  View Applicants
                </Link>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleToggleStatus(posting._id, posting.isActive)}
                  style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
                >
                  {posting.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleDelete(posting._id)}
                  style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", color: "var(--error)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
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
