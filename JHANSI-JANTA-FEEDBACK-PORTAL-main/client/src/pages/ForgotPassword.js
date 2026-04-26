import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import Toast from '../components/Toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');
  const isDevMode =
    isLocalhost ||
    String(process.env.REACT_APP_MAILER_LOG_ONLY || '').toLowerCase() === 'true';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '#dc3545';
      case 2:
        return '#ffc107';
      case 3:
        return '#17a2b8';
      case 4:
      case 5:
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return '';
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 8 && password.length <= 128 && checkPasswordStrength(password) >= 3;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidEmail(email)) {
      setToast({ message: 'Please enter a valid email address', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setToast({ message: 'Reset code sent to your email', type: 'success' });
      setStep(2);
      setResendTimer(30);
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to send reset code',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (code.length !== 6) {
      setToast({ message: 'Please enter a 6-digit code', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/verify-reset-code', { email, code });
      setToast({ message: 'Code verified. Enter your new password', type: 'success' });
      setStep(3);
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Invalid verification code',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidPassword(password)) {
      setToast({
        message: 'Password must be 8-128 characters with uppercase, lowercase, numbers, and symbols',
        type: 'error'
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        code,
        password
      });
      setToast({ message: 'Password reset successfully. Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to reset password',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setResendTimer(30);

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setToast({ message: 'Reset code resent to your email', type: 'success' });
      setCode('');
    } catch (err) {
      setToast({
        message: err.response?.data?.error || 'Failed to resend code',
        type: 'error'
      });
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="header">
        <nav className="container nav">
          <Link to="/" className="logo-link">
            <Logo />
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🔑 Reset Your Password</h1>
            <p>Step {step} of 3</p>
            {isDevMode && <span className="dev-badge">DEV MODE</span>}
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestReset} className="auth-form">
              <p className="step-description">Enter your email address to receive a reset code</p>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="input-icon">📧</span>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <p className="step-description">
                We sent a 6-digit code to <strong>{email}</strong>. Check your spam folder if you
                don&apos;t see it.
              </p>
              {isDevMode && (
                <p className="dev-hint">
                  Local dev: check the server console for the code (MAILER_LOG_ONLY).
                </p>
              )}
              <button
                type="button"
                className="link-btn change-email-btn"
                onClick={() => {
                  setStep(1);
                  setCode('');
                  setResendTimer(0);
                }}
                disabled={loading}
              >
                Use a different email
              </button>
              <div className="form-group">
                <label htmlFor="code">Verification Code</label>
                <input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  inputMode="numeric"
                  className="code-input"
                  required
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading || code.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="resend-section">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  className="resend-link"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <p className="step-description">Create a new strong password</p>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2025 Janata Feedback Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
