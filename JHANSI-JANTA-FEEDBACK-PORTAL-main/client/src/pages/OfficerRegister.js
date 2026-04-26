import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminAuth.css';

function OfficerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
    registrationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
    hasUpperCase: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if officer is already logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'officer') {
      navigate('/officer');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update password requirements
    if (name === 'password') {
      setPasswordRequirements({
        minLength: value.length >= 6,
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*]/.test(value),
        hasUpperCase: /[A-Z]/.test(value)
      });
    }
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
      setError('Invalid email address');
      return false;
    }

    if (!formData.department.trim()) {
      setError('Department is required');
      return false;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10 digits');
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

    if (!formData.registrationCode.trim()) {
      setError('Registration code is required');
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        role: 'officer',
        department: formData.department,
        registrationCode: formData.registrationCode
      });

      if (response.data) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          password: '',
          confirmPassword: '',
          registrationCode: ''
        });

        setTimeout(() => {
          navigate('/officer-login');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
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
            <span className="auth-icon">👮‍♀️</span>
            <h1>Officer Registration</h1>
            <p className="auth-subtitle">Create your officer account</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <span className="success-icon">✅</span>
                Registration successful! Redirecting to login...
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">Select Department</option>
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Health & Hygiene">Health & Hygiene</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create strong password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>

            {formData.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password Requirements:</p>
                <ul>
                  <li className={passwordRequirements.minLength ? 'met' : ''}>
                    {passwordRequirements.minLength ? '✓' : '○'} At least 6 characters
                  </li>
                  <li className={passwordRequirements.hasNumber ? 'met' : ''}>
                    {passwordRequirements.hasNumber ? '✓' : '○'} Contains a number
                  </li>
                  <li className={passwordRequirements.hasUpperCase ? 'met' : ''}>
                    {passwordRequirements.hasUpperCase ? '✓' : '○'} Contains uppercase letter
                  </li>
                  <li className={passwordRequirements.hasSpecial ? 'met' : ''}>
                    {passwordRequirements.hasSpecial ? '✓' : '○'} Contains special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="registrationCode">Registration Code</label>
              <input
                id="registrationCode"
                type="password"
                name="registrationCode"
                placeholder="Enter officer registration code"
                value={formData.registrationCode}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>
                Contact your administrator for the registration code
              </small>
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
                '📝 Create Account'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <div className="auth-links">
            <a href="/officer-login" className="link-primary">
              Login to Officer Account
            </a>
            <a href="/login" className="link-secondary">
              Citizen Login
            </a>
          </div>
        </div>

        <div className="auth-side-info">
          <div className="info-card">
            <h3>🛡️ Secure Registration</h3>
            <p>
              Your registration requires an officer code for security. This ensures only authorized personnel can create officer accounts in the system.
            </p>
          </div>

          <div className="info-card">
            <h3>📋 Department Assignment</h3>
            <p>
              Select your department during registration. This helps route grievances to the appropriate officers for faster resolution.
            </p>
          </div>

          <div className="info-card">
            <h3>🔔 Instant Notifications</h3>
            <p>
              Once registered, start receiving notifications for new grievances assigned to you. Respond promptly and track their resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerRegister;
