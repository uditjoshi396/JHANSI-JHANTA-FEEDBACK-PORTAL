import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Your Voice Matters",
      subtitle: "Submit grievances, track progress, and help us build a better community.",
      cta: "Get Started",
      link: "/register"
    },
    {
      title: "Transparent Governance",
      subtitle: "Real-time updates on grievance resolution with complete transparency.",
      cta: "Learn More",
      link: "/contact"
    },
    {
      title: "AI-Powered Assistance",
      subtitle: "Get intelligent suggestions and faster resolution with our AI chatbot.",
      cta: "Try AI Chat",
      link: "/dashboard"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <nav className="container nav">
          <Link to="/" className="logo-link">
            <Logo />
          </Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#stats">Statistics</a></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="cta-link">Register</Link></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section with Slideshow */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-slides">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="container">
                  <div className="hero-content">
                    <h1 className="fade-in-up">{slide.title}</h1>
                    <p className="fade-in-up">{slide.subtitle}</p>
                    <div className="cta-buttons fade-in-up">
                      <Link to={slide.link} className="btn btn-primary">
                        {slide.cta}
                        <span className="btn-arrow">→</span>
                      </Link>
                      <Link to="/login" className="btn btn-secondary">Sign In</Link>
                    </div>
                  </div>
                  <div className="hero-visual">
                    <div className="floating-elements">
                      <div className="floating-card card-1">
                        <span className="card-icon">📝</span>
                        <span className="card-text">Submit</span>
                      </div>
                      <div className="floating-card card-2">
                        <span className="card-icon">📊</span>
                        <span className="card-text">Track</span>
                      </div>
                      <div className="floating-card card-3">
                        <span className="card-icon">✅</span>
                        <span className="card-text">Resolve</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-indicators">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="fade-in-up">Why Choose Our Portal?</h2>
            <p className="section-subtitle fade-in-up">
              Discover the features that make citizen engagement simple, secure, and effective.
            </p>
          </div>
          <div className="features-grid">
            <Link to="/features/easy-submission" className="feature-card fade-in-up">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📝</span>
              </div>
              <h3>Easy Submission</h3>
              <p>Submit your grievances quickly and securely with our user-friendly interface and AI assistance.</p>
            </Link>
            <Link to="/features/real-time-tracking" className="feature-card fade-in-up">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📊</span>
              </div>
              <h3>Real-Time Tracking</h3>
              <p>Monitor the status of your submissions in real-time with detailed updates and progress notifications.</p>
            </Link>
            <Link to="/features/secure-private" className="feature-card fade-in-up">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🔒</span>
              </div>
              <h3>Secure & Private</h3>
              <p>Your data is protected with industry-standard security measures and privacy-first approach.</p>
            </Link>
            <Link to="/features/ai-powered-support" className="feature-card fade-in-up">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🤖</span>
              </div>
              <h3>AI-Powered Support</h3>
              <p>Get intelligent suggestions, sentiment analysis, and faster resolution with our AI chatbot.</p>
            </Link>
            <Link to="/features/mobile-optimized" className="feature-card fade-in-up">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📱</span>
              </div>
              <h3>Mobile Optimized</h3>
              <p>Access the portal from any device with our responsive design and mobile-first approach.</p>
            </Link>
            <Link to="/features/fast-resolution" className="feature-card fade-in-up">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⚡</span>
              </div>
              <h3>Fast Resolution</h3>
              <p>Experience quick response times and efficient grievance resolution with automated workflows.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats">
        <div className="container">
          <div className="section-header">
            <h2 className="fade-in-up">Our Impact</h2>
            <p className="section-subtitle fade-in-up">
              Real numbers that demonstrate our commitment to citizen satisfaction and efficient governance.
            </p>
          </div>
          <div className="stats-grid">
            <div className="stat-item fade-in-up">
              <div className="stat-icon">📋</div>
              <h3>10,000+</h3>
              <p>Grievances Resolved</p>
              <div className="stat-bar">
                <div className="stat-fill" style={{width: '85%'}}></div>
              </div>
            </div>
            <div className="stat-item fade-in-up">
              <div className="stat-icon">😊</div>
              <h3>95%</h3>
              <p>Satisfaction Rate</p>
              <div className="stat-bar">
                <div className="stat-fill" style={{width: '95%'}}></div>
              </div>
            </div>
            <div className="stat-item fade-in-up">
              <div className="stat-icon">🕐</div>
              <h3>24/7</h3>
              <p>Support Available</p>
              <div className="stat-bar">
                <div className="stat-fill" style={{width: '100%'}}></div>
              </div>
            </div>
            <div className="stat-item fade-in-up">
              <div className="stat-icon">🤝</div>
              <h3>50+</h3>
              <p>Partner Organizations</p>
              <div className="stat-bar">
                <div className="stat-fill" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="fade-in-up">What Citizens Say</h2>
            <p className="section-subtitle fade-in-up">
              Real experiences from users who have benefited from our platform.
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card fade-in-up">
              <div className="testimonial-content">
                <p>"The portal made it incredibly easy to report a street light issue in my neighborhood. It was resolved within 48 hours!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">👩‍💼</div>
                  <div className="author-info">
                    <h4>Sarah Johnson</h4>
                    <span>Citizen</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card fade-in-up">
              <div className="testimonial-content">
                <p>"The AI chatbot helped me articulate my grievance better and suggested the right department. Excellent service!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">👨‍🏫</div>
                  <div className="author-info">
                    <h4>Rajesh Kumar</h4>
                    <span>Teacher</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card fade-in-up">
              <div className="testimonial-content">
                <p>"Real-time tracking and transparent updates keep me informed. This is how governance should work."</p>
                <div className="testimonial-author">
                  <div className="author-avatar">👩‍⚖️</div>
                  <div className="author-info">
                    <h4>Dr. Priya Sharma</h4>
                    <span>Doctor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section className="get-in-touch">
        <div className="container">
          <div className="touch-content">
            <div className="touch-text">
              <h2 className="fade-in-up">Ready to Make Your Voice Heard?</h2>
              <p className="fade-in-up">
                Join thousands of citizens who are already using our platform to create positive change in their communities.
              </p>
              <div className="touch-features fade-in-up">
                <div className="touch-feature">
                  <span className="touch-icon">🚀</span>
                  <span>Quick & Easy Process</span>
                </div>
                <div className="touch-feature">
                  <span className="touch-icon">👥</span>
                  <span>Community Driven</span>
                </div>
                <div className="touch-feature">
                  <span className="touch-icon">💡</span>
                  <span>Transparent Solutions</span>
                </div>
              </div>
            </div>
            <div className="touch-actions fade-in-up">
              <Link to="/register" className="btn btn-primary touch-btn">
                Get Started Now
                <span className="btn-arrow">→</span>
              </Link>
              <Link to="/contact" className="btn btn-secondary touch-btn">
                Contact Support
                <span className="btn-arrow">📞</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2025 Janata Feedback Portal. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
