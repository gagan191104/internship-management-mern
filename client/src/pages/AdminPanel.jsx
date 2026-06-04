import { useEffect, useState } from "react";
import api from "../services/api";
import AdminUserReview from "./admin/AdminUserReview";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "Remote",
  duration: "",
  stipend: "",
  description: "",
  requirements: "",
  eligibilityMinCgpa: "",
  eligibilitySkills: "",
  eligibilityMinMatch: "",
  eligibilityDegreeRequired: "",
  eligibilityBranchPreferred: "",
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

export default function AdminPanel() {
  const [tab, setTab] = useState("pending-users");
  const [subTab, setSubTab] = useState("students");

  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  async function loadInternships() {
    await loadListings();
  }

  async function loadApplications() {
    const { data } = await api.get("/admin/applications");
    setApplications(data.applications || []);
  }

  async function loadListings() {
    const { data } = await api.get("/admin/listings");
    setInternships(data.internships || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await loadListings();
        await loadApplications();
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Failed to load admin data");
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
      eligibilityMinCgpa: ec.minCgpa != null && ec.minCgpa !== "" ? String(ec.minCgpa) : "",
      eligibilitySkills: Array.isArray(ec.requiredSkills) ? ec.requiredSkills.join(", ") : "",
      eligibilityMinMatch: ec.minSkillMatchCount != null ? String(ec.minSkillMatchCount) : "",
      eligibilityDegreeRequired: ec.degreeRequired || "",
      eligibilityBranchPreferred: ec.branchPreferred || "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      isActive: job.isActive !== false,
    });
    setTab("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSaveJob(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
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
          minCgpa: form.eligibilityMinCgpa === "" ? null : Number(form.eligibilityMinCgpa),
          degreeRequired: form.eligibilityDegreeRequired,
          branchPreferred: form.eligibilityBranchPreferred,
          requiredSkills: form.eligibilitySkills
            .split(/[,;\n]/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
          minSkillMatchCount: form.eligibilityMinMatch === "" ? null : Math.max(1, Number(form.eligibilityMinMatch)),
        },
      };
      if (editId) {
        await api.put(`/internships/${editId}`, payload);
      } else {
        await api.post("/internships", payload);
      }
      await loadListings();
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
      await loadListings();
      await loadApplications();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  }

  async function updateApplication(id, patch) {
    try {
      await api.patch(`/admin/application/${id}/status`, patch);
      await loadApplications();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    }
  }

  async function updateApplicationEligibility(id, patch) {
    try {
      await api.patch(`/admin/application/${id}/eligibility`, patch);
      await loadApplications();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed");
    }
  }

  function eligibilityBadge(eligible) {
    if (eligible === "pending") return <span className="badge" style={{ backgroundColor: "#fbbf24", color: "white" }}>Pending Review</span>;
    if (eligible === "eligible") return <span className="badge badge-accepted">Eligible</span>;
    return <span className="badge badge-rejected">Not Eligible</span>;
  }

  return (
    <div className="container">
      <h1 className="page-title">Admin panel</h1>
      <p className="page-sub">Create and edit internships, then move candidate applications through the pipeline.</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          ["pending-users", "Pending Users"],
          ["applications", "All Applications"],
          ["listings", "All Listings"],
          ["all-students", "All Students"],
          ["all-employers", "All Employers"],
        ].map(([key, label]) => (
          <button key={key} type="button" className={`btn ${tab === key ? "btn-primary" : "btn-ghost"}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "pending-users" && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button type="button" className={`btn ${subTab === "students" ? "btn-primary" : "btn-ghost"}`} onClick={() => setSubTab("students")}>
            Students
          </button>
          <button type="button" className={`btn ${subTab === "employers" ? "btn-primary" : "btn-ghost"}`} onClick={() => setSubTab("employers")}>
            Employers
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading && ["listings", "applications"].includes(tab) ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : tab === "pending-users" ? (
        <AdminUserReview mode={subTab === "students" ? "pending-students" : "pending-employers"} />
      ) : tab === "all-students" ? (
        <AdminUserReview mode="students" />
      ) : tab === "all-employers" ? (
        <AdminUserReview mode="employers" />
      ) : tab === "listings" ? (
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <h2 style={{ fontSize: "1.1rem", marginTop: 0 }}>{editId ? "Edit internship" : "New internship"}</h2>
            <form onSubmit={handleSaveJob}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Title</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Company</label>
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
                  <label className="label">Min CGPA (10.0 scale, optional)</label>
                  <input className="input" type="number" step="0.01" min="0" max="10" value={form.eligibilityMinCgpa} onChange={(e) => setForm({ ...form, eligibilityMinCgpa: e.target.value })} />
                </div>
                <div>
                  <label className="label">Min skill matches (optional)</label>
                  <input className="input" type="number" min="1" placeholder="Defaults to all required" value={form.eligibilityMinMatch} onChange={(e) => setForm({ ...form, eligibilityMinMatch: e.target.value })} />
                </div>
              </div>
              <div className="grid-2" style={{ marginBottom: "0.75rem" }}>
                <div>
                  <label className="label">Degree Required (optional)</label>
                  <input className="input" placeholder="e.g. Computer Science" value={form.eligibilityDegreeRequired} onChange={(e) => setForm({ ...form, eligibilityDegreeRequired: e.target.value })} />
                </div>
                <div>
                  <label className="label">Branch Preferred (optional)</label>
                  <input className="input" placeholder="e.g. Computer Science" value={form.eligibilityBranchPreferred} onChange={(e) => setForm({ ...form, eligibilityBranchPreferred: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label className="label">Required skills (comma-separated)</label>
                <input className="input" placeholder="e.g. javascript, react, sql" value={form.eligibilitySkills} onChange={(e) => setForm({ ...form, eligibilitySkills: e.target.value })} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Listing active (visible to students)
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editId ? "Update" : "Create"}
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
              <h2 style={{ fontSize: "1.1rem", margin: 0 }}>All listings</h2>
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
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Application pipeline</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>Verify eligibility first, then update status. Shortlist/Hire only allowed for eligible students.</p>
          </div>
          <div className="table-wrap" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Internship</th>
                  <th>Eligibility</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                    <td>{eligibilityBadge(a.eligible)}</td>
                    <td>
                      <select
                        className="select"
                        style={{ maxWidth: "150px", padding: "0.35rem" }}
                        value={a.status}
                        onChange={(e) => updateApplication(a._id, { status: e.target.value })}
                        disabled={["shortlisted", "hired"].includes(a.status) && a.eligible !== "eligible"}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div style={{ marginTop: "0.35rem" }}>{statusBadge(a.status)}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
                        onClick={() => setSelectedApplication(a)}
                      >
                        Verify Eligibility
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {applications.length === 0 && <p style={{ padding: "1.5rem", color: "var(--text-muted)", margin: 0 }}>No applications yet.</p>}
        </div>
      )}

      {selectedApplication && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "800px", width: "90%", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0 }}>Verify Eligibility</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <strong>Student:</strong> {selectedApplication.user?.name}
                <br />
                <strong>Email:</strong> {selectedApplication.user?.email}
              </div>
              <div>
                <strong>University:</strong> {selectedApplication.user?.university}
                <br />
                <strong>Degree:</strong> {selectedApplication.user?.degree}
                <br />
                <strong>Branch:</strong> {selectedApplication.user?.branch}
                <br />
                <strong>CGPA:</strong> {selectedApplication.user?.gpa}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Skills:</strong> {selectedApplication.user?.skills?.join(", ") || "None"}
            </div>

            <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "var(--border)", borderRadius: "4px" }}>
              <strong>Applied For:</strong> {selectedApplication.internship?.title} at {selectedApplication.internship?.company}
              <br />
              <strong>Requirements:</strong> CGPA ≥ {selectedApplication.internship?.eligibilityCriteria?.minCgpa || "N/A"}
              {selectedApplication.internship?.eligibilityCriteria?.degreeRequired && `, Degree: ${selectedApplication.internship.eligibilityCriteria.degreeRequired}`}
              {selectedApplication.internship?.eligibilityCriteria?.branchPreferred && `, Branch: ${selectedApplication.internship.eligibilityCriteria.branchPreferred}`}
              <br />
              <strong>Required Skills:</strong> {selectedApplication.internship?.eligibilityCriteria?.requiredSkills?.join(", ") || "None"}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label className="label">Eligibility Note (optional)</label>
              <textarea
                className="textarea"
                style={{ minHeight: "80px" }}
                defaultValue={selectedApplication.eligibilityNote || ""}
                onChange={(e) => setSelectedApplication({ ...selectedApplication, eligibilityNote: e.target.value })}
                placeholder="Admin's reason for eligibility decision"
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSelectedApplication(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  await updateApplicationEligibility(selectedApplication._id, { eligible: "not_eligible", eligibilityNote: selectedApplication.eligibilityNote });
                  setSelectedApplication(null);
                }}
              >
                Mark Not Eligible
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  await updateApplicationEligibility(selectedApplication._id, { eligible: "eligible", eligibilityNote: selectedApplication.eligibilityNote });
                  setSelectedApplication(null);
                }}
              >
                Mark Eligible
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
