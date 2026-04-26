import React from 'react';
import '../styles/Modal.css';

export default function TermsModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Terms of Service & Privacy Policy</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <section>
            <h3>1. Terms of Service</h3>
            <p>By using the Janata Feedback Portal, you agree to comply with these terms and conditions. You must be at least 13 years old to use this service.</p>
            
            <h4>User Responsibilities</h4>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree not to use this platform for any illegal or harmful purposes</li>
              <li>You will not attempt to hack, reverse engineer, or damage the platform</li>
              <li>You will provide accurate and truthful information during registration</li>
            </ul>

            <h4>Content Policy</h4>
            <ul>
              <li>Your feedback must not contain hate speech, violence, or discrimination</li>
              <li>Do not share personal information of others without consent</li>
              <li>Do not spam or post misleading information</li>
              <li>We reserve the right to remove inappropriate content</li>
            </ul>

            <h3>2. Privacy Policy</h3>
            <p>We are committed to protecting your personal data and ensuring you have a positive experience on our platform.</p>

            <h4>Data Collection</h4>
            <p>We collect the following information:</p>
            <ul>
              <li>Name, email address, and phone number (during registration)</li>
              <li>Feedback and comments you submit</li>
              <li>Device information and IP address for security purposes</li>
              <li>Usage analytics to improve our service</li>
            </ul>

            <h4>Data Protection</h4>
            <ul>
              <li>Your data is encrypted both in transit and at rest</li>
              <li>We follow industry standards for data security</li>
              <li>We do not share your personal data with third parties without consent</li>
              <li>You can request data deletion at any time</li>
            </ul>

            <h4>Cookie Usage</h4>
            <p>We use cookies to enhance your experience. You can disable cookies in your browser settings, but this may affect functionality.</p>

            <h3>3. Limitation of Liability</h3>
            <p>The Janata Feedback Portal is provided "as is" without any warranties. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of this platform.</p>

            <h3>4. Changes to Terms</h3>
            <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
          </section>
        </div>

        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Decline
          </button>
          <button className="modal-btn primary" onClick={onAccept}>
            I Agree & Accept
          </button>
        </div>
      </div>
    </div>
  );
}
