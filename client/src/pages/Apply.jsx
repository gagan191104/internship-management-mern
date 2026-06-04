import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/internships/${id}`);
        if (!cancelled) setInternship(data.internship);
      } catch {
        if (!cancelled) setError("Internship not found or unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const { data } = await api.post("/applications", {
        internshipId: id,
        coverLetter,
        resumeLink,
      });
      setSuccess("Application submitted successfully.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{ color: "var(--text-muted)" }}>Loading internship…</p>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || "Not found"}</div>
        <Link to="/internships">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "640px" }}>
      <h1 className="page-title">Apply</h1>
      <p className="page-sub">
        {internship.title} · <span style={{ color: "var(--primary)", fontWeight: 600 }}>{internship.company}</span>
      </p>

      <div className="card">
        <p style={{ marginTop: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {internship.type}
          {internship.location ? ` · ${internship.location}` : ""}
          {internship.stipend ? ` · ${internship.stipend}` : ""}
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="cover">
              Cover letter / note
            </label>
            <textarea id="cover" className="textarea" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Why you fit this role..." />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="label" htmlFor="resume">
              Résumé link (Google Drive, portfolio, etc.)
            </label>
            <input id="resume" className="input" type="url" placeholder="https://..." value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "Submitting…" : "Submit application"}
            </button>
            <Link to="/internships" className="btn btn-ghost" style={{ textDecoration: "none" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
