import React, { useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend route is /api/auth/login
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      if (onLoginSuccess) {
        onLoginSuccess(res.data.user);
      }

      if (res.data.user.role === "admin" || res.data.user.role === "recruiter") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div className="nav-brand-badge" style={{ margin: "0 auto 0.75rem auto", width: 44, height: 44, fontSize: "1.3rem" }}>
            🎓
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.6rem", fontWeight: 700 }}>
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Sign in to access your placement portal
          </p>
        </div>

        {error && (
          <div style={{
            background: "var(--danger-bg)",
            color: "var(--danger)",
            border: "1px solid #fecaca",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.88rem",
            marginBottom: "1.25rem",
            fontWeight: 500
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. student@placement.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Create account</Link>
        </div>

        {/* Quick Demo Credentials */}
        <div className="demo-pills">
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ⚡ Instant Demo Login
          </div>
          <button
            type="button"
            className="demo-btn"
            onClick={() => fillAndLogin("student@placement.com", "student123")}
          >
            <span>🎓 Student: <strong>student@placement.com</strong></span>
            <span>Autofill</span>
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => fillAndLogin("admin@placement.com", "admin123")}
          >
            <span>🛡️ Admin: <strong>admin@placement.com</strong></span>
            <span>Autofill</span>
          </button>
          <button
            type="button"
            className="demo-btn"
            onClick={() => fillAndLogin("recruiter@placement.com", "recruiter123")}
          >
            <span>💼 Recruiter: <strong>recruiter@placement.com</strong></span>
            <span>Autofill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
