import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getRoleHomePath, useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      const dest = from || getRoleHomePath(u.role);
      if (!u.isVerified && u.role !== "admin") {
        navigate("/pending-approval", { replace: true });
      } else {
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "420px" }}>
      <h1 className="page-title">Welcome back</h1>
      <p className="page-sub">Sign in to apply and track your internships.</p>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center" }}>
          No account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
