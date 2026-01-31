import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navigation({ variant = 'default' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Auth pages (login/register) have different navigation
  if (variant === 'auth') {
    return (
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <Logo />
          </Link>
          <ul className="nav-links">
            <li><Link to="/" onClick={closeMenu}>Home</Link></li>
            <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
          </ul>
        </nav>
      </header>
    );
  }

  // Dashboard navigation
  if (variant === 'dashboard') {
    return (
      <header className="dashboard-header">
        <div className="nav">
          <Link to="/" className="logo-link">
            <Logo />
          </Link>
          <div className="header-actions">
            <button
              className="new-grievance-btn"
              onClick={() => navigate('/dashboard')}
            >
              📝 New Grievance
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Default navigation for public pages
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Mobile menu button */}
        <button
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop navigation */}
        <ul className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link
              to="/"
              className={isActive('/') && !location.hash ? 'active' : ''}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <a
              href="#features"
              className={isActive('/') && location.hash === '#features' ? 'active' : ''}
              onClick={closeMenu}
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#stats"
              className={isActive('/') && location.hash === '#stats' ? 'active' : ''}
              onClick={closeMenu}
            >
              Statistics
            </a>
          </li>
          <li>
            <Link
              to="/contact"
              className={isActive('/contact') ? 'active' : ''}
              onClick={closeMenu}
            >
              Contact
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className={isActive('/dashboard') ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link
                    to="/statistics"
                    className={isActive('/statistics') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    Statistics
                  </Link>
                </li>
              )}
              <li>
                <button
                  className="logout-link"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={isActive('/login') ? 'active' : ''}
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={`cta-link ${isActive('/register') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
