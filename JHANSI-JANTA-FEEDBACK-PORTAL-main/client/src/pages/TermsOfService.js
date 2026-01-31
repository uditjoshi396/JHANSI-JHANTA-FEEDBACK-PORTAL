import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function TermsOfService() {
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

      {/* Terms of Service Content */}
      <section className="policy-section">
        <div className="container">
          <div className="policy-content">
            <h1>Terms of Service</h1>
            <p className="policy-date">Last updated: December 2024</p>

            <div className="policy-body">
              <section>
                <h2>1. Acceptance of Terms</h2>
                <p>
                  Welcome to Janata Feedback Portal. These Terms of Service ("Terms") govern your use of our grievance management platform and services. By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
                </p>
              </section>

              <section>
                <h2>2. Description of Service</h2>
                <p>
                  Janata Feedback Portal is a digital platform that allows citizens to submit grievances, track their status, and communicate with government authorities. The platform provides AI-powered assistance, real-time updates, and secure grievance management.
                </p>
              </section>

              <section>
                <h2>3. User Accounts</h2>
                <h3>3.1 Account Creation</h3>
                <p>
                  To use certain features of our platform, you must create an account. You agree to:
                </p>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>

                <h3>3.2 Account Types</h3>
                <ul>
                  <li><strong>Citizens:</strong> Can submit and track grievances</li>
                  <li><strong>Officers:</strong> Can manage assigned grievances</li>
                  <li><strong>Administrators:</strong> Have full system access</li>
                </ul>
              </section>

              <section>
                <h2>4. User Conduct and Responsibilities</h2>
                <p>You agree not to:</p>
                <ul>
                  <li>Submit false, misleading, or harmful information</li>
                  <li>Use the platform for illegal activities</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Interfere with platform security or functionality</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Upload malicious files or code</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2>5. Grievance Submission</h2>
                <h3>5.1 Content Guidelines</h3>
                <p>When submitting grievances, you agree to:</p>
                <ul>
                  <li>Provide factual and accurate information</li>
                  <li>Use respectful and appropriate language</li>
                  <li>Include relevant details and evidence</li>
                  <li>Respect privacy and confidentiality</li>
                </ul>

                <h3>5.2 Content Ownership</h3>
                <p>
                  You retain ownership of the content you submit. By submitting content, you grant us a license to use, display, and process the information for grievance management purposes.
                </p>
              </section>

              <section>
                <h2>6. Privacy and Data Protection</h2>
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our platform, you consent to the collection and use of information as outlined in our Privacy Policy.
                </p>
              </section>

              <section>
                <h2>7. Intellectual Property</h2>
                <h3>7.1 Our Content</h3>
                <p>
                  The platform and its original content, features, and functionality are owned by Janata Feedback Portal and are protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3>7.2 User Content</h3>
                <p>
                  You retain ownership of content you submit, but grant us a license to use it for platform operations.
                </p>
              </section>

              <section>
                <h2>8. Service Availability</h2>
                <p>
                  We strive to provide continuous service but cannot guarantee uninterrupted availability. We reserve the right to modify, suspend, or discontinue the service with reasonable notice. We are not liable for any damages caused by service interruptions.
                </p>
              </section>

              <section>
                <h2>9. AI and Automated Features</h2>
                <p>
                  Our platform uses AI for sentiment analysis, categorization, and response suggestions. While we strive for accuracy, AI-generated content may not always be perfect. Users should verify important information and use their judgment.
                </p>
              </section>

              <section>
                <h2>10. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Janata Feedback Portal shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
                </p>
              </section>

              <section>
                <h2>11. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless Janata Feedback Portal from any claims, damages, losses, or expenses arising from your violation of these Terms or misuse of the platform.
                </p>
              </section>

              <section>
                <h2>12. Termination</h2>
                <p>
                  We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms.
                </p>
              </section>

              <section>
                <h2>13. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2>14. Dispute Resolution</h2>
                <p>
                  Any disputes arising from these Terms shall be resolved through negotiation. If resolution cannot be reached, disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
                </p>
              </section>

              <section>
                <h2>15. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of the platform constitutes acceptance of modified terms.
                </p>
              </section>

              <section>
                <h2>16. Severability</h2>
                <p>
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                </p>
              </section>

              <section>
                <h2>17. Contact Information</h2>
                <p>
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="contact-info">
                  <p><strong>Email:</strong> legal@janataportal.gov.in</p>
                  <p><strong>Phone:</strong> +91 1800-XXX-XXXX</p>
                  <p><strong>Address:</strong> Ministry of Citizen Services, Rajaji Bhavan, Besant Nagar, Chennai - 600090, Tamil Nadu</p>
                </div>
              </section>

              <section>
                <h2>18. Acknowledgment</h2>
                <p>
                  By using Janata Feedback Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
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
