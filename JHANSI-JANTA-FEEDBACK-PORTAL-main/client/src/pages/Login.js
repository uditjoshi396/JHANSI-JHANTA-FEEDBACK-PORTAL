import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import Logo from "../components/Logo";
import Toast from "../components/Toast";
import TwoFactorAuth from "../components/TwoFactorAuth";
import {
  sanitizeInput,
  isValidEmail,
  isValidPassword,
  getAuthErrorMessage,
  generateDeviceFingerprint,
  saveAuthData,
  getAuthData,
  logLoginAttempt,
} from "../utils/authUtils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [toast, setToast] = useState(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(null);
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

  // Security: Check for existing session on component mount
  useEffect(() => {
    const authData = getAuthData();
    if (authData) {
      navigate("/dashboard");
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get("token");
    const authProvider =
      urlParams.get("google") ||
      urlParams.get("facebook") ||
      urlParams.get("twitter") ||
      urlParams.get("instagram");

    if (oauthToken && authProvider) {
      try {
        const payload = JSON.parse(atob(oauthToken.split(".")[1]));
        if (payload && payload.id) {
          saveAuthData(oauthToken, {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
          });
          setToast({
            message: `Successfully logged in with ${authProvider}`,
            type: "success",
          });
          setTimeout(() => navigate("/dashboard"), 1500);
        }
      } catch (error) {
        console.error(`${authProvider} auth error:`, error);
        setToast({
          message: `${authProvider.charAt(0).toUpperCase() + authProvider.slice(1)} authentication failed.`,
          type: "error",
        });
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // Security: Rate limiting and account lockout
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      setLockoutTime(300); // 5 minutes
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loginAttempts]);

  // Security: Session timeout warning
  useEffect(() => {
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(
        () => {
          setSessionTimeout(true);
        },
        15 * 60 * 1000,
      ); // 15 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      clearTimeout(inactivityTimer);
    };
  }, []);

  // Security: Clear sensitive data on unmount
  useEffect(() => {
    return () => {
      setPassword("");
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    if (isLocked) {
      setToast({
        message: `Account locked. Try again in ${Math.floor(lockoutTime / 60)}:${(
          lockoutTime % 60
        )
          .toString()
          .padStart(2, "0")}`,
        type: "warning",
      });
      return;
    }

    const sanitizedEmail = sanitizeInput(email);

    // Validation
    if (!isValidEmail(sanitizedEmail)) {
      setToast({
        message: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    if (!isValidPassword(password)) {
      setToast({
        message: "Password must be 8-128 characters",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login`,
        {
          email: sanitizedEmail,
          password,
          deviceFingerprint,
          rememberMe,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );

      // Check if 2FA is required
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setTempEmail(sanitizedEmail);
        setToast({ message: "Verify your identity with 2FA", type: "info" });
      } else {
        // Validate response
        if (!res.data.token || !res.data.user) {
          throw new Error("Invalid response from server");
        }

        saveAuthData(res.data.token, res.data.user);
        setLoginAttempts(0);

        // Log successful login
        await logLoginAttempt(sanitizedEmail, true);

        setToast({ message: "Login successful!", type: "success" });
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setToast({ message, type: "error" });
      setLoginAttempts((prev) => prev + 1);

      // Log failed login attempt
      await logLoginAttempt(
        email,
        false,
        err.response?.data?.error || err.message,
      );
    } finally {
      setLoading(false);
    }
  }

  const handle2FAVerified = (data) => {
    if (!data.token || !data.user) {
      setToast({ message: "Invalid response from server", type: "error" });
      return;
    }

    saveAuthData(data.token, data.user);
    setLoginAttempts(0);
    setToast({ message: "2FA verified! Redirecting...", type: "success" });
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  const handle2FACancel = () => {
    setRequires2FA(false);
    setTempEmail("");
  };

  // Two-Factor Authentication view
  if (requires2FA) {
    return (
      <TwoFactorAuth
        email={tempEmail}
        onVerified={handle2FAVerified}
        onCancel={handle2FACancel}
      />
    );
  }

  return (
    <div className="auth-page">
      {/* Header */}
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
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
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
                  disabled={loading}
                  autoComplete="email"
                />
                <span className="input-icon">📧</span>
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || isLocked}
            >
              {isLocked ? (
                `Locked (${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60)
                  .toString()
                  .padStart(2, "0")})`
              ) : loading ? (
                <>
                  <span className="spinner"></span> Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-auth-buttons">
            {process.env.REACT_APP_GOOGLE_CLIENT_ID && (
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
            )}

            {process.env.REACT_APP_FACEBOOK_APP_ID && (
              <button
                type="button"
                className="social-auth-btn facebook-btn"
                onClick={() =>
                  (window.location.href = `${API_BASE}/api/auth/facebook`)
                }
                disabled={loading}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                  alt="Facebook"
                  className="social-icon"
                />
                Facebook
              </button>
            )}

            {process.env.REACT_APP_TWITTER_CONSUMER_KEY && (
              <button
                type="button"
                className="social-auth-btn twitter-btn"
                onClick={() =>
                  (window.location.href = `${API_BASE}/api/auth/twitter`)
                }
                disabled={loading}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg"
                  alt="Twitter"
                  className="social-icon"
                />
                X
              </button>
            )}
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Create one here
              </Link>
            </p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Fast</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span>Protected</span>
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

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}

      {/* Session Timeout Warning */}
      {sessionTimeout && (
        <div className="session-timeout-modal">
          <div className="session-timeout-content">
            <h3>⏰ Session Timeout</h3>
            <p>Your session will expire due to inactivity.</p>
            <button
              onClick={() => {
                setSessionTimeout(false);
                // Reset inactivity timer
              }}
              className="timeout-btn"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
