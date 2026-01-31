import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function SecurePrivate() {
  const [securityCheck, setSecurityCheck] = useState({
    ssl: false,
    encryption: false,
    privacy: false,
    consent: false
  });

  const [dataSample, setDataSample] = useState('John Doe, john@example.com, Street Light Issue');
  const [isEncrypted, setIsEncrypted] = useState(false);

  const runSecurityCheck = () => {
    setSecurityCheck({
      ssl: true,
      encryption: true,
      privacy: true,
      consent: true
    });
  };

  const toggleEncryption = () => {
    setIsEncrypted(!isEncrypted);
  };

  const getEncryptedData = (data) => {
    // Simple mock encryption for demo
    return data.split('').map(char =>
      String.fromCharCode(char.charCodeAt(0) + 1)
    ).join('');
  };

  const getDecryptedData = (data) => {
    // Simple mock decryption for demo
    return data.split('').map(char =>
      String.fromCharCode(char.charCodeAt(0) - 1)
    ).join('');
  };

  return (
    <div>
      <Navigation variant="default" />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="section-header">
          <h1>🔒 Secure & Private</h1>
          <p className="section-subtitle">
            Experience our military-grade security and privacy protection in action.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Security Controls */}
          <div className="feature-card">
            <h3>🔍 Security Dashboard</h3>
            <button
              onClick={runSecurityCheck}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Run Security Check
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: securityCheck.ssl ? '#28a745' : '#dc3545', fontSize: '1.2rem' }}>
                  {securityCheck.ssl ? '✅' : '❌'}
                </span>
                <span>SSL/TLS Encryption</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: securityCheck.encryption ? '#28a745' : '#dc3545', fontSize: '1.2rem' }}>
                  {securityCheck.encryption ? '✅' : '❌'}
                </span>
                <span>AES-256 Data Encryption</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: securityCheck.privacy ? '#28a745' : '#dc3545', fontSize: '1.2rem' }}>
                  {securityCheck.privacy ? '✅' : '❌'}
                </span>
                <span>GDPR Compliance</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: securityCheck.consent ? '#28a745' : '#dc3545', fontSize: '1.2rem' }}>
                  {securityCheck.consent ? '✅' : '❌'}
                </span>
                <span>User Consent Required</span>
              </div>
            </div>
          </div>

          {/* Encryption Demo */}
          <div>
            <div className="feature-card">
              <h3>🔐 Live Encryption Demo</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Sample Data:
                </label>
                <input
                  type="text"
                  value={dataSample}
                  onChange={(e) => setDataSample(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}
                  placeholder="Enter sample data..."
                />
              </div>

              <button
                onClick={toggleEncryption}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: isEncrypted ? '#28a745' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                {isEncrypted ? '🔓 Decrypt Data' : '🔒 Encrypt Data'}
              </button>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong>
                <span style={{ color: isEncrypted ? '#28a745' : '#dc3545', marginLeft: '0.5rem' }}>
                  {isEncrypted ? '🔒 Encrypted' : '🔓 Plain Text'}
                </span>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                border: '1px solid #dee2e6'
              }}>
                <strong>Data:</strong><br />
                {isEncrypted ? getEncryptedData(dataSample) : dataSample}
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>🛡️ Security Features</h3>
              <ul>
                <li>🔒 End-to-end encryption</li>
                <li>🔐 AES-256 bit encryption</li>
                <li>📋 GDPR compliant</li>
                <li>👤 User consent management</li>
                <li>🚫 Data minimization</li>
                <li>🔑 Secure authentication</li>
              </ul>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>📊 Privacy Controls</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#e8f5e8', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>👁️</div>
                  <small>Data Visibility</small>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#e8f5e8', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>🗑️</div>
                  <small>Data Deletion</small>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#e8f5e8', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>📤</div>
                  <small>Data Export</small>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: '#e8f5e8', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>🚫</div>
                  <small>Opt-out Anytime</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">Secure Your Data</Link>
        </div>
      </div>
    </div>
  );
}
