import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo";
import "../styles/UnifiedAuth.css";

export default function UnifiedAuth() {
  const [currentMode, setCurrentMode] = useState("login"); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState("user"); // 'user', 'admin', 'officer'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const hasGoogleAuth = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  // Form states for login
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Form states for register
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
    employeeId: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Security: Check for existing session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (token) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "officer") navigate("/officer");
      else navigate("/dashboard");
    }
  }, [navigate]);

  // Handle OAuth callback (Google)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get("token");
    const authProvider = urlParams.has("google")
      ? "Google"
      : urlParams.has("facebook")
        ? "Facebook"
        : urlParams.has("twitter")
          ? "Twitter"
          : urlParams.has("instagram")
            ? "Instagram"
            : null;

    if (oauthToken && authProvider) {
      try {
        const payload = JSON.parse(atob(oauthToken.split(".")[1]));
        if (payload && payload.id) {
          localStorage.setItem("token", oauthToken);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: payload.id,
              name: payload.name,
              email: payload.email,
              role: payload.role,
            }),
          );
          localStorage.setItem(
            "tokenExpiry",
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          );

          setMessage({
            type: "success",
            text: `✅ Logged in with ${authProvider}. Redirecting...`,
          });

          setTimeout(() => {
            if (payload.role === "admin") navigate("/admin");
            else if (payload.role === "officer") navigate("/officer");
            else navigate("/dashboard");
          }, 1500);
        } else {
          setMessage({
            type: "error",
            text: "Authentication failed. Please try again.",
          });
        }
      } catch (error) {
        console.error(`${authProvider} auth error:`, error);
        setMessage({
          type: "error",
          text: `${authProvider} authentication failed. Please try again.`,
        });
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // Account lockout logic
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      setLockoutTime(300);
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

  // Password strength checker
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
    setPasswordStrength(checkPasswordStrength(registerForm.password));
  }, [registerForm.password]);

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "#dc3545";
      case 2:
        return "#ffc107";
      case 3:
        return "#17a2b8";
      case 4:
      case 5:
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, "").trim();
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const isValidName = (name) => {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
  };

  const isValidPassword = (password) => {
    return (
      password.length >= 8 &&
      password.length <= 128 &&
      checkPasswordStrength(password) >= 3
    );
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLoginForm = () => {
    const errors = [];

    if (!loginForm.email.trim()) {
      errors.push("Email is required");
    } else if (!isValidEmail(loginForm.email)) {
      errors.push("Please enter a valid email");
    }

    if (!loginForm.password) {
      errors.push("Password is required");
    }

    if (errors.length > 0) {
      setMessage({ type: "error", text: errors[0] });
      return false;
    }
    return true;
  };

  const validateRegisterForm = () => {
    const errors = [];
    const sanitizedName = sanitizeInput(registerForm.name);

    if (!sanitizedName) {
      errors.push("Name is required");
    } else if (!isValidName(sanitizedName)) {
      errors.push("Name must contain only letters and spaces");
    }

    if (!registerForm.email.trim()) {
      errors.push("Email is required");
    } else if (!isValidEmail(registerForm.email)) {
      errors.push("Please enter a valid email");
    }

    if (!isValidPassword(registerForm.password)) {
      errors.push(
        "Password must be at least 8 characters with mixed case, numbers, and symbols",
      );
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (selectedRole === "admin" && !registerForm.adminCode.trim()) {
      errors.push("Admin code is required");
    }

    if (selectedRole === "officer") {
      if (registerForm.phone && !/^\d{10}$/.test(registerForm.phone)) {
        errors.push("Phone number must be 10 digits");
      }
      if (!registerForm.employeeId.trim()) {
        errors.push("Employee ID is required");
      }
    }

    if (errors.length > 0) {
      setMessage({ type: "error", text: errors[0] });
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (isLocked) {
      setMessage({
        type: "error",
        text: `Too many attempts. Try again in ${lockoutTime} seconds`,
      });
      return;
    }

    if (!validateLoginForm()) return;

    setLoading(true);

    try {
      const endpoint =
        selectedRole === "admin"
          ? "http://localhost:5000/api/auth/admin-login"
          : selectedRole === "officer"
            ? "http://localhost:5000/api/auth/officer-login"
            : "http://localhost:5000/api/auth/login";

      const response = await axios.post(endpoint, {
        email: sanitizeInput(loginForm.email.toLowerCase()),
        password: loginForm.password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(
          "tokenExpiry",
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        setMessage({
          type: "success",
          text: "✅ Login successful! Redirecting...",
        });

        setTimeout(() => {
          if (response.data.user.role === "admin") navigate("/admin");
          else if (response.data.user.role === "officer") navigate("/officer");
          else navigate("/dashboard");
        }, 1500);
      }
    } catch (error) {
      setLoginAttempts((prev) => prev + 1);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Login failed. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateRegisterForm()) return;

    setLoading(true);

    try {
      const registerData = {
        name: sanitizeInput(registerForm.name),
        email: sanitizeInput(registerForm.email.toLowerCase()),
        password: registerForm.password,
        role: selectedRole,
      };

      if (selectedRole === "admin") {
        registerData.adminCode = registerForm.adminCode;
      } else if (selectedRole === "officer") {
        registerData.phone = registerForm.phone;
        registerData.employeeId = registerForm.employeeId;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        registerData,
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "✅ Registration successful! Switching to login...",
        });

        setTimeout(() => {
          setCurrentMode("login");
          setLoginForm({ email: registerForm.email, password: "" });
          setRegisterForm({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            adminCode: "",
            employeeId: "",
          });
          setMessage({ type: "", text: "" });
        }, 2000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setCurrentMode(currentMode === "login" ? "register" : "login");
    setMessage({ type: "", text: "" });
    setLoginForm({ email: "", password: "" });
    setRegisterForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      adminCode: "",
      employeeId: "",
    });
    setPasswordStrength(0);
  };

  return (
    <div className="unified-auth-container">
      <div className="unified-auth-box">
        <Logo />

        {/* Role Selection */}
        <div className="role-selector">
          <h2>
            {currentMode === "login"
              ? "Select Role to Login"
              : "Select Role to Register"}
          </h2>
          <div className="role-buttons">
            <button
              className={`role-btn ${selectedRole === "user" ? "active" : ""}`}
              onClick={() => setSelectedRole("user")}
            >
              👤 User
            </button>
            <button
              className={`role-btn ${selectedRole === "admin" ? "active" : ""}`}
              onClick={() => setSelectedRole("admin")}
            >
              🔐 Admin
            </button>
            <button
              className={`role-btn ${selectedRole === "officer" ? "active" : ""}`}
              onClick={() => setSelectedRole("officer")}
            >
              👮 Officer
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message-box ${message.type}`}>{message.text}</div>
        )}

        {/* Login Form */}
        {currentMode === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <h3>
              Login as{" "}
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </h3>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                disabled={loading || isLocked}
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  placeholder="Enter your password"
                  disabled={loading || isLocked}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isLocked}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading || isLocked}
            >
              {loading
                ? "Logging in..."
                : isLocked
                  ? `Locked (${lockoutTime}s)`
                  : "Login"}
            </button>

            {hasGoogleAuth && selectedRole === "user" && (
              <>
                <div className="auth-divider">
                  <span>or continue with</span>
                </div>
                <div className="social-auth-buttons">
                  <button
                    type="button"
                    className="social-auth-btn google-btn"
                    onClick={() =>
                      (window.location.href = "http://localhost:5000/api/auth/google")
                    }
                    disabled={loading || isLocked}
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
          </form>
        )}

        {/* Register Form */}
        {currentMode === "register" && (
          <form onSubmit={handleRegister} className="auth-form">
            <h3>
              Register as{" "}
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </h3>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            {selectedRole === "officer" && (
              <>
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={registerForm.employeeId}
                    onChange={handleRegisterChange}
                    placeholder="Enter your employee ID"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    placeholder="Enter 10-digit phone number"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {selectedRole === "admin" && (
              <div className="form-group">
                <label>Admin Code</label>
                <input
                  type="password"
                  name="adminCode"
                  value={registerForm.adminCode}
                  onChange={handleRegisterChange}
                  placeholder="Enter admin verification code"
                  disabled={loading}
                />
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  placeholder="Create a strong password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              {registerForm.password && (
                <div className="password-strength">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    }}
                  />
                  <span style={{ color: getPasswordStrengthColor() }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            {hasGoogleAuth && selectedRole === "user" && (
              <>
                <div className="auth-divider">
                  <span>or continue with</span>
                </div>
                <div className="social-auth-buttons">
                  <button
                    type="button"
                    className="social-auth-btn google-btn"
                    onClick={() =>
                      (window.location.href = "http://localhost:5000/api/auth/google")
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
          </form>
        )}

        {/* Mode Switch */}
        <div className="mode-switch">
          <p>
            {currentMode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="switch-button"
            >
              {currentMode === "login" ? "Register" : "Login"}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="back-to-home">
          <a href="/">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
