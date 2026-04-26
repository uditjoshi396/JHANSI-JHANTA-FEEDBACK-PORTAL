import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import "../styles/AdminAuth.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in and is admin
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (token && user.role === "admin") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: email.toLowerCase(),
        password,
      });

      if (response.data.user.role !== "admin") {
        setError("This account does not have admin privileges");
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Calculate expiry time (7 days)
      const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("tokenExpiry", expiryTime.toString());

      // Redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError("Invalid credentials");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="auth-background">
        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>
        <div className="auth-blob auth-blob-3"></div>
      </div>

      <div className="auth-content">
        <div className="auth-card login-card">
          <div className="auth-header">
            <div className="auth-icon">🛡️</div>
            <h1>Admin Login</h1>
            <p className="auth-subtitle">Access the Admin Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <span>🔓</span> Login to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have admin access?</span>
          </div>

          <p className="auth-footer-text">
            If you believe you should have admin access, contact your system
            administrator.
          </p>

          <div className="auth-links">
            <Link to="/login" className="link-secondary">
              ← Back to Regular Login
            </Link>
          </div>

          <div className="auth-info-box">
            <p className="info-title">⚡ Quick Access</p>
            <p className="info-text">
              This page is for administrators only. If you don't have an admin
              account, please use the regular login.
            </p>
          </div>
        </div>

        <div className="auth-side-info">
          <div className="info-card">
            <h3>🛡️ Admin Dashboard</h3>
            <p>
              Manage grievances, monitor statistics, and oversee all system
              operations
            </p>
          </div>

          <div className="info-card">
            <h3>🔐 Secure Access</h3>
            <p>
              Enterprise-grade security with JWT authentication and role-based
              access control
            </p>
          </div>

          <div className="info-card">
            <h3>📊 Full Control</h3>
            <p>
              Complete control over grievances, users, and system configuration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
