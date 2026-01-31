import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const navigate = useNavigate();

  // Security: Check for existing session on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (token && tokenExpiry) {
      // Check if token is expired
      if (Date.now() > parseInt(tokenExpiry)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        return;
      }

      // Verify token validity with server
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: 'Bearer ' + token }
      }).then(() => {
        navigate('/dashboard');
      }).catch(() => {
        // Token invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
      });
    }

    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const authProvider = urlParams.get('google') || urlParams.get('facebook') || urlParams.get('twitter') || urlParams.get('instagram');

    if (oauthToken && authProvider) {
      // Handle OAuth login
      try {
        // Decode and validate token (basic check)
        const payload = JSON.parse(atob(oauthToken.split('.')[1]));
        if (payload && payload.id) {
          localStorage.setItem('token', oauthToken);
          localStorage.setItem('user', JSON.stringify({
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role
          }));
          localStorage.setItem('tokenExpiry', Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
          navigate('/dashboard');
        }
      } catch (error) {
        console.error(`${authProvider} auth error:`, error);
        alert(`${authProvider.charAt(0).toUpperCase() + authProvider.slice(1)} authentication failed. Please try again.`);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  // Security: Rate limiting and account lockout
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      setLockoutTime(300); // 5 minutes lockout
      const timer = setInterval(() => {
        setLockoutTime(prev => {
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

  // Security: Input sanitization
  const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '').trim();
  };

  // Security: Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  // Security: Password validation
  const isValidPassword = (password) => {
    return password.length >= 8 && password.length <= 128;
  };

  async function submit(e) {
    e.preventDefault();

    if (isLocked) {
      alert('Account temporarily locked due to too many failed attempts. Please try again later.');
      return;
    }

    const sanitizedEmail = sanitizeInput(email);

    // Security: Client-side validation
    if (!isValidEmail(sanitizedEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      alert('Password must be between 8 and 128 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: sanitizedEmail,
        password: password
      }, {
        timeout: 10000, // Security: Prevent hanging requests
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Security: Prevent CSRF
        }
      });

      // Security: Validate response structure
      if (!res.data.token || !res.data.user) {
        throw new Error('Invalid response from server');
      }

      // Security: Secure localStorage handling with expiry
      try {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('tokenExpiry', Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      } catch (storageError) {
        alert('Unable to save session. Please check your browser settings.');
        return;
      }

      setLoginAttempts(0); // Reset attempts on success
      navigate('/dashboard');
    } catch (err) {
      setLoginAttempts(prev => prev + 1);

      if (err.response?.status === 429) {
        alert('Too many login attempts. Please try again later.');
      } else if (err.response?.status === 401) {
        alert('Invalid email or password');
      } else if (err.code === 'ECONNABORTED') {
        alert('Request timed out. Please check your connection and try again.');
      } else {
        alert(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Security: Clear sensitive data on unmount
  useEffect(() => {
    return () => {
      setPassword('');
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
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={submit} className="auth-form">
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
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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
            </div>

            <button type="submit" className="auth-btn" disabled={loading || isLocked}>
              {isLocked
                ? `Locked (${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')})`
                : loading
                  ? 'Signing In...'
                  : 'Sign In'
              }
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-auth-buttons">
            {process.env.REACT_APP_GOOGLE_CLIENT_ID && (
              <button
                type="button"
                className="social-auth-btn google-btn"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="social-icon" />
                Continue with Google
              </button>
            )}

            {process.env.REACT_APP_FACEBOOK_APP_ID && (
              <button
                type="button"
                className="social-auth-btn facebook-btn"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/facebook'}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="social-icon" />
                Continue with Facebook
              </button>
            )}

            {process.env.REACT_APP_TWITTER_CONSUMER_KEY && (
              <button
                type="button"
                className="social-auth-btn twitter-btn"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/twitter'}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="Twitter" className="social-icon" />
                Continue with Twitter
              </button>
            )}

            {process.env.REACT_APP_INSTAGRAM_CLIENT_ID && (
              <button
                type="button"
                className="social-auth-btn instagram-btn"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/instagram'}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="social-icon" />
                Continue with Instagram
              </button>
            )}
          </div>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Create one here</Link></p>
            <div className="auth-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure Login</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Fast Access</span>
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
    </div>
  );
}
