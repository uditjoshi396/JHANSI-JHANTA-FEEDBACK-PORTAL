import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const navigate = useNavigate();

  // Security: Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
    navigate('/dashboard');
    }
  }, [navigate]);

  // Security: Rate limiting for registration
  useEffect(() => {
    if (registrationAttempts >= 3) {
      alert('Too many registration attempts. Please try again later.');
      setTimeout(() => setRegistrationAttempts(0), 300000); // 5 minutes cooldown
    }
  }, [registrationAttempts]);

  // Security: Input sanitization
  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '').trim();
  };

  // Security: Name validation
  const isValidName = (name) => {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
  };

  // Security: Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  // Security: Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Security: Password validation
  const isValidPassword = (password) => {
    return password.length >= 8 &&
           password.length <= 128 &&
           checkPasswordStrength(password) >= 3;
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: case 1: return '#dc3545';
      case 2: return '#ffc107';
      case 3: return '#17a2b8';
      case 4: case 5: return '#28a745';
      default: return '#6c757d';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);

    if (!isValidName(sanitizedName)) {
      newErrors.name = 'Name must be 2-50 characters and contain only letters and spaces';
    }

    if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isValidPassword(password)) {
      newErrors.password = 'Password must be 8-128 characters with at least 3 of: uppercase, lowercase, numbers, special characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function submit(e) {
    e.preventDefault();

    if (registrationAttempts >= 3) {
      alert('Too many registration attempts. Please try again later.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setRegistrationAttempts(prev => prev + 1);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        password: password
      }, {
        timeout: 15000, // Security: Prevent hanging requests
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Security: Prevent CSRF
        }
      });

      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 429) {
        alert('Too many registration attempts. Please try again later.');
      } else if (err.response?.status === 409) {
        alert('Email already exists. Please use a different email.');
      } else if (err.code === 'ECONNABORTED') {
        alert('Request timed out. Please check your connection and try again.');
      } else {
        alert(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Security: Clear sensitive data on unmount
  useEffect(() => {
    return () => {
      setPassword('');
      setConfirmPassword('');
    };
  }, []);

  return (
    <div className="auth-page">
      {/* Header */}
      <header className="header">
        <nav className="container nav">
          <Link to="/" className="logo-link">
            <Logo />
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Join Us Today</h1>
            <p>Create your account to start sharing your feedback</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <span className="input-icon">👤</span>
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span className="input-icon">📧</span>
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password (8+ characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span
                    className="strength-text"
                    style={{ color: getPasswordStrengthColor() }}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">🆓</span>
                <span>Free to Join</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Easy Registration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <span>Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2025 Janata Feedback Portal. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
