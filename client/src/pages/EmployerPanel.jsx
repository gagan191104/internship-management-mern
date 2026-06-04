import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "Remote",
  duration: "",
  stipend: "",
  description: "",
  requirements: "",
  eligibilityMinGpa: "",
  eligibilitySkills: "",
  eligibilityMinMatch: "",
  deadline: "",
  isActive: true,
};

const STATUSES = ["applied", "shortlisted", "rejected", "hired"];

function statusBadge(status) {
  const map = {
    applied: "applied",
    shortlisted: "shortlisted",
    hired: "accepted",
    rejected: "rejected",
  };
  const cls = map[status] || "applied";
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export default function EmployerPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState("listings");

  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadInternships() {
    const { data } = await api.get("/internships/employer/listings");
    setInternships(data.internships || []);
  }

  async function loadApplications() {
    const { data } = await api.get("/applications/manage");
    setApplications(data.applications || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await loadInternships();
        await loadApplications();
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load employer data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function startEdit(job) {
    setEditId(job._id);
    const ec = job.eligibilityCriteria || {};
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      type: job.type || "Remote",
      duration: job.duration || "",
      stipend: job.stipend || "",
      description: job.description || "",
      requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : job.requirements || "",
      eligibilityMinGpa: ec.minGpa != null && ec.minGpa !== "" ? String(ec.minGpa) : "",
      eligibilitySkills: Array.isArray(ec.requiredSkills) ? ec.requiredSkills.join(", ") : "",
      eligibilityMinMatch: ec.minSkillMatchCount != null ? String(ec.minSkillMatchCount) : "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      isActive: job.isActive !== false,
    });
    setTab("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm({
      ...emptyForm,
      company: user?.companyName || "",
    });
  }

  function buildPayload() {
    return {
      title: form.title,
      company: form.company,
      location: form.location,
      type: form.type,
      duration: form.duration,
      stipend: form.stipend,
      description: form.description,
      requirements: form.requirements,
      deadline: form.deadline ? new Date(form.deadline) : undefined,
      isActive: form.isActive,
      eligibilityCriteria: {
        minGpa: form.eligibilityMinGpa === "" ? null : Number(form.eligibilityMinGpa),
        requiredSkills: form.eligibilitySkills
          .split(/[,;\n]/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        minSkillMatchCount: form.eligibilityMinMatch === "" ? null : Math.max(1, Number(form.eligibilityMinMatch)),
      },
    };
  }

  async function handleSaveJob(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      if (editId) {
        await api.put(`/internships/${editId}`, payload);
      } else {
        await api.post("/internships", payload);
      }
      await loadInternships();
      resetForm();
    } catch (e) {
      setError(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteJob(id) {
    if (!confirm("Delete this internship and its applications?")) return;
    try {
      await api.delete(`/internships/${id}`);
      await loadInternships();
      await loadApplications();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  }

  async function updateApplication(id, patch) {
    try {
      await api.patch(`/applications/${id}`, patch);
      await loadApplications();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Employer workspace</h1>
      <p className="page-sub">Post internships for your organization and review applicants for your listings.</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button type="button" className={`btn ${tab === "listings" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("listings")}>
          My listings
        </button>
        <button type="button" className={`btn ${tab === "applications" ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab("applications")}>
          Applications
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : tab === "listings" ? (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>{editId ? "Edit listing" : "New listing"}</h2>
            <form onSubmit={handleSaveJob}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Company (defaults to your profile company name)</label>
                <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              </div>
              <div className="grid-2" style={{ marginBottom: "0.75rem" }}>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{ marginBottom: "0.75rem" }}>
                <div>
                  <label className="label">Duration</label>
                  <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div>
                  <label className="label">Stipend</label>
                  <input className="input" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Deadline</label>
                <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Description</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Requirements (one per line)</label>
                <textarea className="textarea" style={{ minHeight: "80px" }} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
              </div>
              <div className="grid-2" style={{ marginBottom: "0.75rem" }}>
                <div>
                  <label className="label">Min GPA (4.0 scale, optional)</label>
                  <input className="input" type="number" step="0.01" min="0" max="4" value={form.eligibilityMinGpa} onChange={(e) => setForm({ ...form, eligibilityMinGpa: e.target.value })} />
                </div>
                <div>
                  <label className="label">Min skill matches (optional)</label>
                  <input className="input" type="number" min="1" placeholder="Defaults to all required" value={form.eligibilityMinMatch} onChange={(e) => setForm({ ...form, eligibilityMinMatch: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Required skills (comma-separated; matched to student profile tags)</label>
                <input className="input" placeholder="e.g. javascript, react, sql" value={form.eligibilitySkills} onChange={(e) => setForm({ ...form, eligibilitySkills: e.target.value })} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Listing active (visible to students)
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editId ? "Update" : "Publish"}
                </button>
                {editId && (
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Your postings</h2>
            </div>
            <div className="table-wrap" style={{ border: "none" }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {internships.map((j) => (
                    <tr key={j._id}>
                      <td>
                        <strong>{j.title}</strong>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{j.company}</div>
                      </td>
                      <td>{j.isActive ? "Yes" : "No"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button type="button" className="btn btn-ghost" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }} onClick={() => startEdit(j)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", marginLeft: "0.25rem" }} onClick={() => handleDeleteJob(j._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {internships.length === 0 && <p style={{ padding: "1.5rem", color: "var(--text-muted)", margin: 0 }}>No listings yet — create one on the left.</p>}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Applications to your roles</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>Update status as you review candidates.</p>
          </div>
          <div className="table-wrap" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Internship</th>
                  <th>Eligible</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div>{a.user?.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.user?.email}</div>
                    </td>
                    <td>
                      <div>{a.internship?.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.internship?.company}</div>
                    </td>
                    <td>
                      <span className={`badge ${a.eligibilityStatus ? "badge-accepted" : "badge-rejected"}`}>{a.eligibilityStatus ? "Yes" : "No"}</span>
                      {!a.eligibilityStatus && a.eligibilityNotes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", maxWidth: "200px" }}>{a.eligibilityNotes}</div>
                      )}
                    </td>
                    <td>
                      <select
                        className="select"
                        style={{ maxWidth: "160px", padding: "0.35rem" }}
                        value={a.status}
                        onChange={(e) => updateApplication(a._id, { status: e.target.value })}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div style={{ marginTop: "0.35rem" }}>{statusBadge(a.status)}</div>
                    </td>
                    <td style={{ minWidth: "200px" }}>
                      <textarea
                        className="textarea"
                        style={{ minHeight: "64px", fontSize: "0.85rem" }}
                        defaultValue={a.notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (a.notes || "")) updateApplication(a._id, { notes: e.target.value });
                        }}
                        placeholder="Internal notes"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {applications.length === 0 && <p style={{ padding: "1.5rem", color: "var(--text-muted)", margin: 0 }}>No applications yet.</p>}
        </div>
      )}
    </div>
  );
}
