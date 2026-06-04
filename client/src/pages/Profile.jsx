import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, refreshUser, updateLocalUser, isStudent, isEmployer, isAdmin } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [gpa, setGpa] = useState("");
  const [skills, setSkills] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setPhone(user.phone || "");
    setUniversity(user.university || "");
    setMajor(user.major || "");
    setBio(user.bio || "");
    setGpa(user.gpa != null && user.gpa !== "" ? String(user.gpa) : "");
    setSkills(Array.isArray(user.skills) ? user.skills.join(", ") : "");
    setCompanyName(user.companyName || "");
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage(null);
    setBusy(true);
    try {
      const body = {
        name,
        phone,
        university,
        major,
        bio,
      };
      if (isStudent) {
        body.gpa = gpa === "" ? null : Number(gpa);
        body.skills = skills
          .split(/[,;\n]/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
      }
      if (isEmployer) {
        body.companyName = companyName;
      }
      const { data } = await api.patch("/users/profile", body);
      updateLocalUser(data.user);
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "560px" }}>
      <h1 className="page-title">Your profile</h1>
      <p className="page-sub">
        {isStudent && "GPA and skills power automatic eligibility checks when you apply."}
        {isEmployer && "Your company name is used as the default employer on new listings."}
        {isAdmin && "Admin profile for platform oversight."}
      </p>

      <div className="card">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: 0 }}>
          Signed in as <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
          {user?.role === "admin" && (
            <span className="badge badge-reviewing" style={{ marginLeft: "0.5rem" }}>
              Admin
            </span>
          )}
          {user?.role === "employer" && (
            <span className="badge badge-shortlisted" style={{ marginLeft: "0.5rem" }}>
              Employer
            </span>
          )}
          {user?.role === "student" && (
            <span className="badge badge-applied" style={{ marginLeft: "0.5rem" }}>
              Student
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="phone">
              Phone
            </label>
            <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {isEmployer && (
            <div style={{ marginBottom: "1rem" }}>
              <label className="label" htmlFor="companyName">
                Company name
              </label>
              <input id="companyName" className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
          )}
          {isStudent && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label" htmlFor="university">
                  University / college
                </label>
                <input id="university" className="input" value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label" htmlFor="major">
                  Major / field
                </label>
                <input id="major" className="input" value={major} onChange={(e) => setMajor(e.target.value)} />
              </div>
              <div className="grid-2" style={{ marginBottom: "1rem" }}>
                <div>
                  <label className="label" htmlFor="gpa">
                    GPA (4.0 scale)
                  </label>
                  <input id="gpa" className="input" type="number" step="0.01" min="0" max="4" placeholder="e.g. 3.5" value={gpa} onChange={(e) => setGpa(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="skills">
                    Skills (comma-separated)
                  </label>
                  <input id="skills" className="input" placeholder="javascript, react, sql" value={skills} onChange={(e) => setSkills(e.target.value)} />
                </div>
              </div>
            </>
          )}
          {!isStudent && !isEmployer && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label" htmlFor="university">
                  University / college
                </label>
                <input id="university" className="input" value={university} onChange={(e) => setUniversity(e.target.value)} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label" htmlFor="major">
                  Major / field
                </label>
                <input id="major" className="input" value={major} onChange={(e) => setMajor(e.target.value)} />
              </div>
            </>
          )}
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="label" htmlFor="bio">
              Short bio
            </label>
            <textarea id="bio" className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
