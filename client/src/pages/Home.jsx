import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section
        className="container"
        style={{
          padding: "3rem 1.25rem 4rem",
          textAlign: "center",
          background: "linear-gradient(165deg, var(--primary-soft) 0%, transparent 55%)",
          borderRadius: "var(--radius)",
          margin: "0 1rem",
          maxWidth: "calc(1120px - 2rem)",
        }}
      >
        <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 1rem" }}>
          Internship management, simplified
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.85rem)", lineHeight: 1.15, marginBottom: "1rem", maxWidth: "720px", margin: "0 auto 1rem" }}>
          Discover roles, apply in minutes, track every application.
        </h1>
        <p className="page-sub" style={{ maxWidth: "560px", margin: "0 auto 1.75rem" }}>
          InternFlow connects students, employers, and admins with structured listings, JWT-secured APIs, and clear application statuses from applied to accepted.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/internships" className="btn btn-primary">
            Browse internships
          </Link>
          {!user ? (
            <Link to="/register" className="btn btn-ghost">
              Create account
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-ghost">
              Go to dashboard
            </Link>
          )}
        </div>
      </section>

      <section className="container" style={{ marginTop: "3rem" }}>
        <h2 style={{ marginBottom: "0.35rem", textAlign: "center" }}>Why InternFlow?</h2>
        <p className="page-sub" style={{ textAlign: "center", maxWidth: "520px", margin: "0 auto 2rem" }}>
          Built as a MERN reference app — MongoDB persistence, JWT auth, and CRUD APIs you can extend.
        </p>
        <div className="grid-3">
          {[
            { title: "Curated listings", body: "Filter by work mode and skim stipend, deadline, and fit at a glance." },
            { title: "Fast applications", body: "Attach a cover note and résumé link — one submission per internship." },
            { title: "Real tracking", body: "Statuses from applied → shortlisted → accepted or rejected, plus automatic eligibility flags for reviewers." },
          ].map((c) => (
            <div key={c.title} className="card">
              <h3 style={{ fontSize: "1.05rem", marginBottom: "0.5rem", color: "var(--primary)" }}>{c.title}</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
