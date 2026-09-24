import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my'
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isStudent = currentUser?.role === "student";

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    }
  };

  const fetchMyApplications = async () => {
    if (!currentUser || !isStudent) return;
    try {
      const res = await API.get("/applications/my");
      setMyApplications(res.data);
    } catch (err) {
      console.error("Failed to load my applications", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchJobs(), fetchMyApplications()]).finally(() => setLoading(false));
  }, []);

  const appliedJobIds = new Set(myApplications.map((app) => app.job_id));

  const apply = async (jobId) => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    if (!isStudent) {
      alert("Only students can apply for jobs. You are logged in as " + (currentUser.role || "user") + ".");
      return;
    }

    setApplyingId(jobId);
    setMessage(null);

    try {
      await API.post("/applications/apply", { job_id: jobId });
      setMessage({ type: "success", text: "Successfully applied for the job!" });
      await fetchMyApplications();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || err.response?.data?.message || "Failed to apply"
      });
    } finally {
      setApplyingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.title?.toLowerCase().includes(q) ||
      j.description?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem 2rem",
        color: "white",
        marginBottom: "2rem",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ maxWidth: 700 }}>
          <span style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(8px)",
            padding: "0.3rem 0.8rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "inline-block",
            marginBottom: "0.75rem"
          }}>
            🎓 2026 Campus Drive
          </span>
          <h1 style={{ fontFamily: "Outfit, sans-serif", fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "0.75rem" }}>
            Explore Career Opportunities & Placement Drives
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Browse verified job postings from top recruiters, apply with a single click, and track your interview rounds in real time.
          </p>

          {!currentUser && (
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
              <Link to="/login" className="btn btn-primary" style={{ background: "white", color: "var(--primary)" }}>
                Sign In to Apply
              </Link>
              <Link to="/signup" className="btn btn-secondary" style={{ background: "rgba(255, 255, 255, 0.15)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
                Register as Student
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Global Alert Message */}
      {message && (
        <div style={{
          padding: "0.85rem 1.25rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem",
          fontWeight: 600,
          background: message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
          color: message.type === "success" ? "var(--success)" : "var(--danger)",
          border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`
        }}>
          {message.type === "success" ? "✓ " : "⚠️ "} {message.text}
        </div>
      )}

      {/* Navigation Tabs (if Student) & Search Bar */}
      <div className="filter-bar">
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("all")}
            className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`}
          >
            All Openings ({jobs.length})
          </button>
          {isStudent && (
            <button
              onClick={() => setActiveTab("my")}
              className={`btn btn-sm ${activeTab === "my" ? "btn-primary" : "btn-secondary"}`}
            >
              My Applications ({myApplications.length})
            </button>
          )}
        </div>

        {activeTab === "all" && (
          <div className="search-input">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by job title, company, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Loading job listings...
        </div>
      ) : activeTab === "my" ? (
        /* Student Applications View */
        <div className="card">
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>
            My Job Applications
          </h3>

          {myApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>You haven't applied for any jobs yet.</p>
              <button onClick={() => setActiveTab("all")} className="btn btn-primary btn-sm">
                Browse Available Jobs
              </button>
            </div>
          ) : (
            <div className="app-table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Application Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong style={{ display: "block", color: "var(--text-main)" }}>{app.title}</strong>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {app.description?.slice(0, 80)}...
                        </span>
                      </td>
                      <td>
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        }) : "Recent"}
                      </td>
                      <td>
                        <span className={`status-badge status-${app.status}`}>
                          {app.status === "shortlisted" && "🟢 "}
                          {app.status === "applied" && "🟡 "}
                          {app.status === "rejected" && "🔴 "}
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* All Jobs Grid */
        <div>
          {filteredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              No jobs matching your search criteria.
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((j) => {
                const hasApplied = appliedJobIds.has(j.id);
                return (
                  <div key={j.id} className="job-card">
                    <div>
                      <div className="job-header">
                        <h3 className="job-title">{j.title}</h3>
                        <span style={{ fontSize: "1.2rem" }}>💼</span>
                      </div>

                      <div className="job-company">
                        🏢 {j.company || "Campus Placement Partner"}
                      </div>

                      <p className="job-desc">{j.description}</p>

                      <div className="job-tags">
                        <span className="job-tag">📍 {j.location || "Hybrid"}</span>
                        <span className="job-tag">💰 {j.salary || "Best in Industry"}</span>
                        <span className="job-tag">Full-Time</span>
                      </div>
                    </div>

                    <div className="job-footer">
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        Verified Placement
                      </span>

                      {hasApplied ? (
                        <span className="status-badge status-applied">
                          ✓ Applied
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => apply(j.id)}
                          disabled={applyingId === j.id}
                        >
                          {applyingId === j.id ? "Applying..." : "Apply Now →"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
