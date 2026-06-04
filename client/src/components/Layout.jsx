import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Footer from "./Footer";

export default function Layout() {
  const { user, logout, isAdmin, isEmployer } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.25rem", flexWrap: "wrap" }}>
          <Link to="/" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)", textDecoration: "none" }}>
            Intern<span style={{ color: "var(--primary)" }}>Flow</span>
          </Link>

          <nav style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center", marginLeft: "auto" }}>
            {!user ? (
              <>
                <Link className="btn btn-ghost" to="/" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Home
                </Link>
                <Link className="btn btn-ghost" to="/internships" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Browse Internships
                </Link>
                <Link className="btn btn-ghost" to="/login" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register" style={{ padding: "0.35rem 0.85rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Register
                </Link>
              </>
            ) : user.role === "student" ? (
              <>
                <Link className="btn btn-ghost" to="/" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Home
                </Link>
                <Link className="btn btn-ghost" to="/internships" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Browse Internships
                </Link>
                <Link className="btn btn-ghost" to="/dashboard" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  My Applications
                </Link>
                <Link className="btn btn-ghost" to="/profile" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Profile
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem" }}
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : user.role === "employer" ? (
              <>
                <Link className="btn btn-ghost" to="/" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Home
                </Link>
                <Link className="btn btn-ghost" to="/employer/postings" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  My Postings
                </Link>
                <Link className="btn btn-ghost" to="/employer/postings" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Post New Internship
                </Link>
                <Link className="btn btn-ghost" to="/employer/applications" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Applications Received
                </Link>
                <Link className="btn btn-ghost" to="/profile" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Profile
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem" }}
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : user.role === "admin" ? (
              <>
                <Link className="btn btn-ghost" to="/" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Home
                </Link>
                <Link className="btn btn-ghost" to="/admin" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  Admin Dashboard
                </Link>
                <Link className="btn btn-ghost" to="/admin" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  All Users
                </Link>
                <Link className="btn btn-ghost" to="/admin" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  All Listings
                </Link>
                <Link className="btn btn-ghost" to="/admin" style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem", textDecoration: "none" }}>
                  All Applications
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.9rem" }}
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : null}

            <button
              type="button"
              className="btn btn-ghost"
              onClick={toggle}
              title={theme === "light" ? "Dark mode" : "Light mode"}
              aria-label="Toggle theme"
              style={{ padding: "0.35rem 0.65rem" }}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, padding: "2rem 0 3rem" }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
