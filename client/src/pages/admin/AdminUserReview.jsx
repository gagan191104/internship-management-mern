import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function ProfileSummary({ user }) {
  if (user.role === "student") {
    return (
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <div>{user.university}</div>
        <div>{user.degree} · Class of {user.graduationYear || "—"}</div>
        <div>CGPA: {user.gpa || "—"}</div>
      </div>
    );
  }
  return (
    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
      <div>{user.companyName || "—"}</div>
      <div>Reg#: {user.companyRegistrationNumber || "—"}</div>
      <div>{user.industry || ""} {user.website ? `· ${user.website}` : ""}</div>
    </div>
  );
}

export default function AdminUserReview({ mode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "pending-students" || mode === "pending-employers") {
        const role = mode === "pending-students" ? "student" : "employer";
        const { data } = await api.get("/admin/pending-users");
        setUsers((data.users || []).filter(u => u.role === role));
      } else {
        const role = mode === "students" ? "student" : "employer";
        const { data } = await api.get("/admin/users", { params: { role } });
        setUsers(data.users || []);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(id, role) {
    try {
      const endpoint = role === "student" ? `/admin/student/${id}/approve` : `/admin/employer/${id}/approve`;
      await api.patch(endpoint);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Approve failed");
    }
  }

  async function reject(id, role) {
    try {
      const endpoint = role === "student" ? `/admin/student/${id}/reject` : `/admin/employer/${id}/reject`;
      await api.patch(endpoint, { reason });
      setRejectId(null);
      setReason("");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Reject failed");
    }
  }

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading users…</p>;

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Details</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id || u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`badge badge-${u.status === "approved" ? "accepted" : u.status === "rejected" ? "rejected" : "applied"}`}>{u.status}</span>
                </td>
                <td>
                  {u.role === "student" ? (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <div>{u.university}</div>
                      <div>{u.degree} · {u.graduationYear || "—"}</div>
                      <div>CGPA: {u.gpa || "—"}</div>
                    </div>
                  ) : (
                    <ProfileSummary user={u} />
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
                    onClick={() => setSelectedUser(u)}
                  >
                    View & Verify
                  </button>
                  {u.status === "pending" && (
                    <>
                      <button type="button" className="btn btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", marginLeft: "0.25rem" }} onClick={() => approve(u.id || u._id, u.role)}>
                        Approve
                      </button>
                      <button type="button" className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", marginLeft: "0.25rem" }} onClick={() => setRejectId(u.id || u._id)}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p style={{ color: "var(--text-muted)" }}>No users in this view.</p>}
      {rejectId && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <label className="label">Rejection reason</label>
          <textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-danger" onClick={() => reject(rejectId, users.find(u => (u.id || u._id) === rejectId)?.role)}>
              Confirm reject
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setRejectId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: "700px", width: "90%", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", marginTop: 0 }}>
              {selectedUser.role === "student" ? "Student Profile" : "Employer Profile"}
            </h2>
            
            {selectedUser.role === "student" ? (
              <div>
                <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "var(--border)", borderRadius: "4px" }}>
                  <strong>Name:</strong> {selectedUser.name}
                  <br />
                  <strong>Email:</strong> {selectedUser.email}
                  <br />
                  <strong>Phone:</strong> {selectedUser.phone || "—"}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>University:</strong> {selectedUser.university}
                  <br />
                  <strong>Degree:</strong> {selectedUser.degree}
                  <br />
                  <strong>Branch:</strong> {selectedUser.branch}
                  <br />
                  <strong>Graduation Year:</strong> {selectedUser.graduationYear}
                  <br />
                  <strong>CGPA:</strong> {selectedUser.gpa}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>Skills:</strong> {selectedUser.skills?.join(", ") || "None"}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>Resume:</strong> {selectedUser.resume ? <a href={selectedUser.resume} target="_blank" rel="noreferrer">View Resume</a> : "Not provided"}
                </div>

                {selectedUser.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setSelectedUser(null)}>
                      Close
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => { setRejectId(selectedUser.id || selectedUser._id); setSelectedUser(null); }}>
                      Reject
                    </button>
                    <button type="button" className="btn btn-primary" onClick={async () => { await approve(selectedUser.id || selectedUser._id, "student"); setSelectedUser(null); }}>
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "var(--border)", borderRadius: "4px" }}>
                  <strong>Company Name:</strong> {selectedUser.companyName}
                  <br />
                  <strong>Email:</strong> {selectedUser.email}
                  <br />
                  <strong>Phone:</strong> {selectedUser.phone || "—"}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>Registration Number:</strong> {selectedUser.companyRegistrationNumber}
                  <br />
                  <strong>Industry:</strong> {selectedUser.industry}
                  <br />
                  <strong>Company Size:</strong> {selectedUser.companySize}
                  <br />
                  <strong>Website:</strong> {selectedUser.website ? <a href={selectedUser.website} target="_blank" rel="noreferrer">{selectedUser.website}</a> : "—"}
                  <br />
                  <strong>Address:</strong> {selectedUser.address}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <strong>Description:</strong> {selectedUser.description || "Not provided"}
                </div>

                {selectedUser.status === "pending" && (
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setSelectedUser(null)}>
                      Close
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => { setRejectId(selectedUser.id || selectedUser._id); setSelectedUser(null); }}>
                      Reject
                    </button>
                    <button type="button" className="btn btn-primary" onClick={async () => { await approve(selectedUser.id || selectedUser._id, "employer"); setSelectedUser(null); }}>
                      Approve
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedUser.status !== "pending" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedUser(null)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

