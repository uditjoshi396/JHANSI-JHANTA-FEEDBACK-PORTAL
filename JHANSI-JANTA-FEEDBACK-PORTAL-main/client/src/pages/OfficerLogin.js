import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminAuth.css';
import { API_BASE } from '../config';

function OfficerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if officer is already logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'officer') {
      navigate('/officer');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: email.toLowerCase(),
        password
      });

      if (response.data.user.role !== 'officer') {
        setError('This account does not have officer privileges');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      navigate('/officer');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Invalid email or password');
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
            <span className="auth-icon">👮</span>
            <h1>Officer Login</h1>
            <p className="auth-subtitle">Manage assigned grievances</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
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
                '🔓 Login'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <div className="auth-links">
            <a href="/officer-register" className="link-primary">
              Create Officer Account
            </a>
            <a href="/login" className="link-secondary">
              Citizen Login
            </a>
          </div>

          <div className="auth-info-box">
            <p className="info-title">📌 Officer Portal</p>
            <p className="info-text">
              Access this portal with your officer credentials to manage and respond to assigned grievances. Your account will be created by administrators.
            </p>
          </div>
        </div>

        <div className="auth-side-info">
          <div className="info-card">
            <h3>👮 Officer Dashboard</h3>
            <p>
              View all assigned grievances, track their status, and manage resolutions from one unified platform. Get real-time updates and notifications.
            </p>
          </div>

          <div className="info-card">
            <h3>📊 Performance Metrics</h3>
            <p>
              Monitor your resolution performance, average resolution time, and citizen ratings. Track your productivity and improvement areas.
            </p>
          </div>

          <div className="info-card">
            <h3>💬 Communication Hub</h3>
            <p>
              Respond directly to grievances with detailed updates. Provide feedback and resolution details to keep citizens informed throughout the process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerLogin;
