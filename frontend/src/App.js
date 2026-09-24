import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import JobList from "./components/JobList";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading stored user:", e);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <BrowserRouter>
      {/* Modern Navigation Header */}
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="nav-brand-badge">🎓</span>
            <span>PlacementPortal</span>
          </Link>

          <nav className="nav-links">
            <Link to="/" className="nav-link">
              Browse Jobs
            </Link>

            {user && (user.role === "admin" || user.role === "recruiter") && (
              <Link to="/admin" className="nav-link">
                Admin Dashboard
              </Link>
            )}

            {!user ? (
              <>
                <Link to="/login" className="nav-link">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            ) : (
              <div className="nav-user">
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: "0.25rem" }}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/signup"
            element={<Signup onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/admin"
            element={
              user && (user.role === "admin" || user.role === "recruiter") ? (
                <AdminDashboard />
              ) : user ? (
                <div className="page-container">
                  <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <h2>Access Denied</h2>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      This page is only accessible to Administrators and Recruiters. You are currently logged in as a <strong>{user.role}</strong>.
                    </p>
                    <div style={{ marginTop: "1rem" }}>
                      <Link to="/" className="btn btn-primary">Return to Jobs</Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
