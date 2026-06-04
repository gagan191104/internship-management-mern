const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../../client/src/pages/admin/AdminUserReview.jsx");
let s = fs.readFileSync(p, "utf8");

const studentFn = `  if (user.role === "student") {
    return (
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <motionPlaceholder>{user.university}</motionPlaceholder>
        <motionPlaceholder>{pd.degree} · Class of {pd.graduationYear || "—"}</motionPlaceholder>
        {pd.resumeUrl ? <a href={pd.resumeUrl} target="_blank" rel="noreferrer">Resume</a> : null}
      </motionPlaceholder>
    );
  }`;

s = s.replace(/if \(user\.role === "student"\) \{[\s\S]*?\n  \}/, studentFn.split("motionPlaceholder").join("div"));

const tableStudent = `                  {u.role === "student" ? (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <motionPlaceholder>{u.university}</motionPlaceholder>
                      <motionPlaceholder>{u.profileData?.degree} · {u.profileData?.graduationYear || "—"}</motionPlaceholder>
                      {u.profileData?.resumeUrl ? (
                        <a href={u.profileData.resumeUrl} target="_blank" rel="noreferrer">Resume</a>
                      ) : null}
                    </motionPlaceholder>
                  ) : (`;

s = s.replace(
  /\{u\.role === "student" \? \([\s\S]*?\) : \(/,
  tableStudent.split("motionPlaceholder").join("motionPlaceholder").split("motionPlaceholder").join("div")
);

fs.writeFileSync(p, s.split("motionPlaceholder").join("div"));
