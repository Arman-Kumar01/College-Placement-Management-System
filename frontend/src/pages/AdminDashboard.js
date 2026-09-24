import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "Bangalore / Hybrid",
    salary: "₹8 - 12 LPA",
    description: ""
  });
  const [submittingJob, setSubmittingJob] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/applications")
      ]);
      setStats(statsRes.data);
      setApps(appsRes.data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/applications/${id}/status`, { status });
      setApps(apps.map((a) => (a.id === id ? { ...a, status } : a)));
      // Also refresh stats
      API.get("/admin/stats").then((r) => setStats(r.data));
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmittingJob(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await API.post("/jobs", {
        title: newJob.title,
        description: newJob.description + (newJob.salary ? ` | Package: ${newJob.salary}` : "") + (newJob.location ? ` | Location: ${newJob.location}` : ""),
        recruiter_id: user.id || 1
      });
      alert("Job posted successfully!");
      setNewJob({
        title: "",
        company: "",
        location: "Bangalore / Hybrid",
        salary: "₹8 - 12 LPA",
        description: ""
      });
      setShowPostJob(false);
      loadData();
    } catch (err) {
      alert("Failed to post job: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingJob(false);
    }
  };

  const filteredApps = apps.filter((a) => {
    if (filterStatus === "all") return true;
    return a.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: "center", padding: "3rem" }}>
        Loading placement administration dashboard...
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.85rem", fontWeight: 700 }}>
            Placement Management Portal
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Monitor key metrics, publish recruitment drives, and evaluate candidate applications.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowPostJob(!showPostJob)}
        >
          {showPostJob ? "✕ Close Form" : "＋ Post New Job"}
        </button>
      </div>

      {/* Post Job Form (Collapsible) */}
      {showPostJob && (
        <div className="card" style={{ marginBottom: "2rem", border: "1px solid var(--border-focus)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", color: "var(--primary)" }}>
            Post a New Campus Placement Drive
          </h3>
          <form onSubmit={handlePostJob}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Associate Software Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Microsoft / Accenture"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bangalore / Remote"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Salary Package</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ₹9 - 14 LPA"
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description & Eligibility Criteria *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Key responsibilities, required skills (React, Node, SQL), eligibility CGPA, batch..."
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPostJob(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submittingJob}
              >
                {submittingJob ? "Publishing Job..." : "Publish Job Opening"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
              💼
            </div>
            <div>
              <div className="stat-val">{stats.total_jobs || 0}</div>
              <div className="stat-label">Active Job Openings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
              👥
            </div>
            <div>
              <div className="stat-val">{stats.total_users || 0}</div>
              <div className="stat-label">Registered Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#f0f9ff", color: "#0284c7" }}>
              📝
            </div>
            <div>
              <div className="stat-val">{stats.total_applications || 0}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
              ⏳
            </div>
            <div>
              <div className="stat-val">{stats.pending || 0}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Section */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Candidate Applications</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              Review applicants, update hiring status, and shortlist for subsequent rounds.
            </p>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["all", "applied", "shortlisted", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm ${filterStatus === st ? "btn-primary" : "btn-secondary"}`}
                style={{ textTransform: "capitalize" }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No applications found matching the selected filter.
          </div>
        ) : (
          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Job Position</th>
                  <th>Application Date</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>{a.student_name || "Student #" + a.student_id}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{a.job_title}</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {a.applied_at ? new Date(a.applied_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      }) : "Recent"}
                    </td>
                    <td>
                      <span className={`status-badge status-${a.status}`}>
                        {a.status === "shortlisted" && "🟢 "}
                        {a.status === "applied" && "🟡 "}
                        {a.status === "rejected" && "🔴 "}
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => updateStatus(a.id, "shortlisted")}
                          disabled={a.status === "shortlisted"}
                        >
                          ✓ Shortlist
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(a.id, "rejected")}
                          disabled={a.status === "rejected"}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
