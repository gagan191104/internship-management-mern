import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [gpa, setGpa] = useState("");
  const [skills, setSkills] = useState("");
  const [resume, setResume] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] =
    useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("email", email.trim().toLowerCase());
    fd.append("password", password.trim());
    fd.append("phone", phone.trim());
    fd.append("role", role);
    if (role === "student") {
      fd.append("university", university.trim());
      fd.append("degree", degree.trim());
      fd.append("branch", branch.trim());
      if (graduationYear) fd.append("graduationYear", graduationYear);
      if (gpa) fd.append("gpa", gpa);
      if (skills) fd.append("skills", skills);
      if (resume) fd.append("resume", resume);
      if (profilePhoto) fd.append("profilePhoto", profilePhoto);
    } else {
      fd.append("companyName", companyName.trim());
      fd.append("companyRegistrationNumber", companyRegistrationNumber.trim());
      fd.append("industry", industry.trim());
      fd.append("companySize", companySize.trim());
      fd.append("website", website.trim());
      fd.append("address", address.trim());
      if (companyLogo) fd.append("companyLogo", companyLogo);
      if (description) fd.append("description", description.trim());
    }
    setBusy(true);
    try {
      const user = await register(fd);
      navigate(user.isVerified ? "/dashboard" : "/pending-approval", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "520px" }}>
      <h1 className="page-title">Create your account</h1>
      <p className="page-sub">
        Students and employers register here. Admins are created via npm run
        seed:admin only.
      </p>
      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">I am a</label>
            <select
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Full name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Password (min 6)</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Phone</label>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          {role === "student" ? (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">University</label>
                <input
                  className="input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Degree</label>
                <input
                  className="input"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Branch</label>
                <input
                  className="input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Graduation year</label>
                <input
                  className="input"
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">CGPA (on 10.0 scale)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Skills (comma-separated)</label>
                <input
                  className="input"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="javascript, react, sql"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Resume (PDF)</label>
                <input
                  className="input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Profile Photo</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Company name</label>
                <input
                  className="input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Company registration number</label>
                <input
                  className="input"
                  value={companyRegistrationNumber}
                  onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Industry</label>
                <input
                  className="input"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Company size</label>
                <input
                  className="input"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  placeholder="e.g. 51-200 employees"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Website</label>
                <input
                  className="input"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Address</label>
                <input
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Company Logo</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCompanyLogo(e.target.files?.[0] || null)}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your company..."
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={busy}
          >
            {busy ? "Submitting…" : "Submit for approval"}
          </button>
        </form>
      </div>
    </div>
  );
}
