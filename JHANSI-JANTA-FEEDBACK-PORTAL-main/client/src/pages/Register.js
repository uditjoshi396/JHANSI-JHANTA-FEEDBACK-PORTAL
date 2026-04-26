import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import Toast from '../components/Toast';
import TermsModal from '../components/TermsModal';
import {
import { API_BASE } from '../config';
  sanitizeInput,
  isValidName,
  isValidEmail,
  isValidPhone,
  checkPasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  isValidPassword,
  passwordsMatch,
  getAuthErrorMessage,
  generateDeviceFingerprint,
  logLoginAttempt
} from '../utils/authUtils';

export default function Register() {
  const hasGoogleAuth = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Step 3: Verification
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);
  const navigate = useNavigate();

  // Initialize device fingerprint
  useEffect(() => {
    const initDevice = async () => {
      const fingerprint = await generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
    };
    initDevice();
  }, []);

  // Check existing session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Rate limiting
  useEffect(() => {
    if (registrationAttempts >= 3) {
      setToast({
        message: 'Too many registration attempts. Please try again later.',
        type: 'error'
      });
      setTimeout(() => setRegistrationAttempts(0), 300000); // 5 min cooldown
    }
  }, [registrationAttempts]);

  // Monitor password strength
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  // Email availability check with debounce
  useEffect(() => {
    if (!email || !isValidEmail(email)) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailVerifying(true);
      try {
        const response = await axios.post(
          `${API_BASE}/api/auth/check-email`,
          { email: email.toLowerCase() },
          { timeout: 5000 }
        );
        setEmailAvailable(response.data.available);
      } catch (err) {
        console.error('Email check error:', err);
        setEmailAvailable(null);
      } finally {
        setEmailVerifying(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [email]);

  const validateStep1 = () => {
    const newErrors = {};
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);

    if (!isValidName(sanitizedName)) {
      newErrors.name = 'Name must be 2-50 characters (letters and spaces only)';
    }

    if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (emailAvailable === false) {
      newErrors.email = 'Email already registered. Try logging in or use a different email';
    }

    if (phone && !isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!isValidPassword(password)) {
      newErrors.password =
        'Password: min 8 chars, needs uppercase, lowercase, number & symbol';
    }

    if (!passwordsMatch(password, confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!termsAccepted) {
      newErrors.terms = 'Please accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setTermsModalOpen(false);
    setErrors({ ...errors, terms: undefined });
  };

  async function handleRegister(e) {
    e.preventDefault();

    if (registrationAttempts >= 3) {
      setToast({
        message: 'Too many registration attempts. Please try again later.',
        type: 'error'
      });
      return;
    }

    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setRegistrationAttempts((prev) => prev + 1);

    try {
      const sanitizedData = {
        name: sanitizeInput(name),
        email: sanitizeInput(email).toLowerCase(),
        phone: phone ? sanitizeInput(phone) : undefined,
        password,
        deviceFingerprint,
        marketingOptIn
      };

      await axios.post(`${API_BASE}/api/auth/register`, sanitizedData, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      setToast({
        message: 'Registration successful! Please check your email to verify your account.',
        type: 'success'
      });

      // Log successful registration
      await logLoginAttempt(sanitizedData.email, true, 'New registration');

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setToast({ message, type: 'error' });

      // Log failed registration attempt
      await logLoginAttempt(email, false, err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  // Clear sensitive data on unmount
  useEffect(() => {
    return () => {
      setPassword('');
      setConfirmPassword('');
    };
  }, []);

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
            <div className="auth-icon">✨</div>
            <h1>Join Our Community</h1>
            <p>Create your account in {3 - currentStep === 0 ? 0 : 3 - currentStep} more step{3 - currentStep !== 1 ? 's' : ''}</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
            </div>
            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                <span>1</span>
                <label>Info</label>
              </div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                <span>2</span>
                <label>Password</label>
              </div>
              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                <span>3</span>
                <label>Confirm</label>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <div className="input-wrapper">
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <span className="input-icon">👤</span>
                  </div>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      disabled={loading}
                      required
                    />
                    <span className="input-icon">
                      {emailVerifying ? '⏳' : emailAvailable === true ? '✓' : emailAvailable === false ? '✕' : '📧'}
                    </span>
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                  {emailAvailable === true && (
                    <span className="success-message">✓ Email available</span>
                  )}
                </div>

                {hasGoogleAuth && (
                  <>
                    <div className="auth-divider">
                      <span>or continue with</span>
                    </div>
                    <div className="social-auth-buttons">
                      <button
                        type="button"
                        className="social-auth-btn google-btn"
                        onClick={() =>
                          (window.location.href = `${API_BASE}/api/auth/google`)
                        }
                        disabled={loading}
                      >
                        <img
                          src="https://developers.google.com/identity/images/g-logo.png"
                          alt="Google"
                          className="social-icon"
                        />
                        Google
                      </button>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-wrapper">
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                    <span className="input-icon">📱</span>
                  </div>
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                  <small className="form-help">Optional - helps us contact you about important updates</small>
                </div>
              </div>
            )}

            {/* Step 2: Password */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
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
                            backgroundColor: getPasswordStrengthColor(passwordStrength)
                          }}
                        ></div>
                      </div>
                      <span
                        className="strength-text"
                        style={{ color: getPasswordStrengthColor(passwordStrength) }}
                      >
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                  )}

                  <div className="password-requirements">
                    <small>Requirements:</small>
                    <ul>
                      <li className={password.length >= 8 ? 'met' : ''}>
                        {password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'met' : ''}>
                        {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase letter
                      </li>
                      <li className={/[a-z]/.test(password) ? 'met' : ''}>
                        {/[a-z]/.test(password) ? '✓' : '○'} Lowercase letter
                      </li>
                      <li className={/[0-9]/.test(password) ? 'met' : ''}>
                        {/[0-9]/.test(password) ? '✓' : '○'} Number
                      </li>
                      <li className={/[^A-Za-z0-9]/.test(password) ? 'met' : ''}>
                        {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} Special character
                      </li>
                    </ul>
                  </div>

                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <span className="success-message">✓ Passwords match</span>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="form-step">
                <div className="review-section">
                  <h3>Review Your Information</h3>
                  <div className="review-item">
                    <strong>Name:</strong>
                    <span>{name}</span>
                  </div>
                  <div className="review-item">
                    <strong>Email:</strong>
                    <span>{email}</span>
                  </div>
                  {phone && (
                    <div className="review-item">
                      <strong>Phone:</strong>
                      <span>{phone}</span>
                    </div>
                  )}
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      disabled={loading}
                      required
                    />
                    <span>
                      I agree to the{' '}
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => setTermsModalOpen(true)}
                      >
                        Terms &amp; Conditions
                      </button>
                    </span>
                  </label>
                  {errors.terms && <span className="error-message">{errors.terms}</span>}
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Subscribe to updates and news (optional)</span>
                  </label>
                </div>

                <div className="form-help-text">
                  We'll send a verification email to <strong>{email}</strong>. Please verify your
                  email to complete registration.
                </div>
              </div>
            )}

            {/* Navigation and Submit */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePreviousStep}
                  disabled={loading}
                >
                  ← Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={loading}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !termsAccepted}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              )}
            </div>

          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">🆓</span>
                <span>Free</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Easy</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <span>Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}

      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={handleTermsAccept}
      />
    </div>
  );
}
