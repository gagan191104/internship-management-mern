import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function InternshipList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(initialQ);
  const [type, setType] = useState(searchParams.get("type") || "");

  const query = useMemo(() => ({ search: search || undefined, type: type || undefined }), [search, type]);

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (type) p.set("type", type);
    setSearchParams(p, { replace: true });
  }, [search, type, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/internships", { params: query });
        if (!cancelled) setItems(data.internships || []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load internships");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query.search, query.type]);

  return (
    <div className="container">
      <h1 className="page-title">Internship list</h1>
      <p className="page-sub">Explore open roles. Sign in to apply.</p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="grid-2" style={{ alignItems: "end" }}>
          <div>
            <label className="label" htmlFor="search">
              Search title or company
            </label>
            <input id="search" className="input" placeholder="e.g. React, Nexus" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="type">
              Work mode
            </label>
            <select id="type" className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No internships match your filters.</p>
      ) : (
        <div className="grid-2">
          {items.map((j) => (
            <article key={j._id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", margin: "0 0 0.25rem" }}>{j.title}</h2>
                <p style={{ margin: 0, color: "var(--primary)", fontWeight: 600 }}>{j.company}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span className="badge badge-reviewing">{j.type}</span>
                {j.location && <span>{j.location}</span>}
                {j.stipend && <span>{j.stipend}</span>}
                {j.duration && <span>{j.duration}</span>}
                {j.eligibilityCriteria?.minGpa != null && j.eligibilityCriteria.minGpa > 0 && (
                  <span className="badge badge-applied">Min GPA {j.eligibilityCriteria.minGpa}</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {j.description || "No description provided."}
              </p>
              {j.deadline && (
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--accent)" }}>
                  Apply by {new Date(j.deadline).toLocaleDateString()}
                </p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {user ? (
                  user.role === "student" ? (
                    user.isVerified ? (
                      <Link to={`/apply/${j._id}`} className="btn btn-primary" style={{ textDecoration: "none" }}>
                        Apply
                      </Link>
                    ) : (
                      <Link to="/pending-approval" className="btn btn-ghost" style={{ textDecoration: "none" }}>
                        Awaiting approval
                      </Link>
                    )
                  ) : user.role === "employer" ? (
                    <span className="badge badge-pending">Employer — post &amp; review in your panel</span>
                  ) : (
                    <span className="badge badge-pending">Admin — use panel to manage</span>
                  )
                ) : (
                  <Link to="/login" state={{ from: { pathname: `/apply/${j._id}` } }} className="btn btn-primary" style={{ textDecoration: "none" }}>
                    Login to apply
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
