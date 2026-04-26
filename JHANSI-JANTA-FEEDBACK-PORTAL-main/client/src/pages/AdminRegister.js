import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminAuth.css';
import { API_BASE } from '../config';

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.role === 'admin') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }

    if (!formData.adminCode.trim()) {
      setError('Admin code is required');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone || '',
        password: formData.password,
        role: 'admin'
      });

      if (response.data.success) {
        setSuccess('✅ Admin account created successfully! Redirecting to login...');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          adminCode: ''
        });

        // Redirect to admin login after 2 seconds
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 400) {
        setError('Email already registered');
      } else {
        setError('Registration failed. Please try again.');
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
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1>Admin Registration</h1>
            <p className="auth-subtitle">Create your admin account</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                {success}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminCode">Admin Code</label>
                <input
                  type="password"
                  id="adminCode"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  placeholder="Enter admin code"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="password-requirements">
              <p className="requirements-title">Password Requirements:</p>
              <ul>
                <li className={formData.password.length >= 6 ? 'met' : ''}>
                  {formData.password.length >= 6 ? '✓' : '○'} At least 6 characters
                </li>
                <li className={formData.password === formData.confirmPassword && formData.password ? 'met' : ''}>
                  {formData.password === formData.confirmPassword && formData.password ? '✓' : '○'} Passwords match
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="auth-button register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  <span>➕</span> Create Admin Account
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an admin account?</span>
          </div>

          <div className="auth-links">
            <Link to="/admin-login" className="link-primary">
              Login to Admin Dashboard →
            </Link>
          </div>

          <div className="auth-info-box">
            <p className="info-title">⚠️ Admin Registration</p>
            <p className="info-text">
              This registration is restricted. You need a valid admin code provided by your system administrator to create an admin account.
            </p>
          </div>
        </div>

        <div className="auth-side-info">
          <div className="info-card">
            <h3>🔐 Secure Registration</h3>
            <p>Your account data is encrypted and securely stored in our database</p>
          </div>

          <div className="info-card">
            <h3>👤 Admin Privileges</h3>
            <p>Get full access to manage grievances, users, and system settings</p>
          </div>

          <div className="info-card">
            <h3>📊 Dashboard Access</h3>
            <p>Once registered, you can access the complete admin dashboard immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
