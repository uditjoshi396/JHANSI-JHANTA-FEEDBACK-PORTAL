import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function PrivacyPolicy() {
  return (
    <div>
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

      {/* Privacy Policy Content */}
      <section className="policy-section">
        <div className="container">
          <div className="policy-content">
            <h1>Privacy Policy</h1>
            <p className="policy-date">Last updated: December 2024</p>

            <div className="policy-body">
              <section>
                <h2>1. Introduction</h2>
                <p>
                  Welcome to Janata Feedback Portal ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our grievance management platform.
                </p>
              </section>

              <section>
                <h2>2. Information We Collect</h2>
                <h3>2.1 Personal Information</h3>
                <p>We may collect the following personal information:</p>
                <ul>
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information you provide</li>
                  <li>Grievance submissions and related communications</li>
                </ul>

                <h3>2.2 Usage Information</h3>
                <p>We automatically collect certain information when you use our platform:</p>
                <ul>
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Usage patterns and preferences</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2>3. How We Use Your Information</h2>
                <p>We use the collected information for the following purposes:</p>
                <ul>
                  <li>To provide and maintain our grievance management services</li>
                  <li>To process and respond to your grievance submissions</li>
                  <li>To communicate with you about your account and grievances</li>
                  <li>To improve our platform and develop new features</li>
                  <li>To ensure security and prevent fraud</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2>4. Information Sharing and Disclosure</h2>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
                <ul>
                  <li>With your explicit consent</li>
                  <li>To government authorities when required by law</li>
                  <li>To service providers who assist in our operations (under strict confidentiality agreements)</li>
                  <li>In connection with a merger, acquisition, or sale of assets</li>
                  <li>To protect our rights, property, or safety</li>
                </ul>
              </section>

              <section>
                <h2>5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                </p>
              </section>

              <section>
                <h2>6. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account and associated data at any time.
                </p>
              </section>

              <section>
                <h2>7. Your Rights</h2>
                <p>You have the following rights regarding your personal information:</p>
                <ul>
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data</li>
                  <li><strong>Objection:</strong> Object to processing of your personal information</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                </ul>
              </section>

              <section>
                <h2>8. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2>9. Third-Party Services</h2>
                <p>
                  Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these external services. We encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2>10. Children's Privacy</h2>
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
                </p>
              </section>

              <section>
                <h2>11. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
                </p>
              </section>

              <section>
                <h2>12. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2>13. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="contact-info">
                  <p><strong>Email:</strong> privacy@janataportal.gov.in</p>
                  <p><strong>Phone:</strong> +91 1800-XXX-XXXX</p>
                  <p><strong>Address:</strong> Ministry of Citizen Services, Rajaji Bhavan, Besant Nagar, Chennai - 600090, Tamil Nadu</p>
                </div>
              </section>
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
