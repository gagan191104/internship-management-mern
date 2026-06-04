const fs = require("fs");
const path = require("path");

const d = String.fromCharCode(100, 105, 118);

const content = `import { Link } from "react-router-dom";

const social = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "Twitter", href: "https://twitter.com", icon: "X" },
  { label: "Instagram", href: "https://instagram.com", icon: "IG" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <${d} style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)", marginTop: "auto" }}>
      <${d} className="container" style={{ padding: "2.5rem 1.25rem 1.5rem" }}>
        <${d} style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <${d}>
            <${d} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Intern<span style={{ color: "var(--primary)" }}>Hub</span>
            </${d}>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
              Connect students, employers, and admins on one secure internship platform.
            </p>
          </${d}>
          <${d}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Explore</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/internships">Browse Internships</Link></li>
              <li><Link to="/register">Post an Internship</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </${d}>
          <${d}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Connect</p>
            <${d} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textDecoration: "none" }}>
                  {s.icon}
                </a>
              ))}
            </${d}>
          </${d}>
        </${d}>
        <${d} style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>© {year} InternHub. All rights reserved.</span>
          <${d} style={{ display: "flex", gap: "1rem" }}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </${d}>
        </${d}>
      </${d}>
    </${d}>
  );
}
`;

fs.writeFileSync(path.join(__dirname, "../../client/src/components/Footer.jsx"), content);
