import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TwoFactor.css';
import { API_BASE } from '../config';

export default function TwoFactorAuth({ email, onVerified, onCancel }) {
  const [code, setCode] = useState('');
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(true);
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');
  const isDevMode =
    isLocalhost ||
    String(process.env.REACT_APP_MAILER_LOG_ONLY || '').toLowerCase() === 'true';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-2fa`, {
        email,
        code,
        method
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });

      onVerified(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    setResendTimer(30);

    try {
      await axios.post(`${API_BASE}/api/auth/resend-2fa`, {
        email,
        method
      }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      setCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
      setResendTimer(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-factor-container">
      <div className="two-factor-card">
        <div className="two-factor-header">
          <div className="two-factor-icon">🔐</div>
          <h2>Two-Factor Authentication</h2>
          <p>Enter the verification code sent to your {method === 'email' ? 'email' : 'phone'}</p>
          {isDevMode && <span className="dev-badge">DEV MODE</span>}
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              inputMode="numeric"
              autoComplete="one-time-code"
              className={error ? 'error' : ''}
            />
            {isDevMode && (
              <p className="dev-hint">
                Local dev: check the server console for the code (MAILER_LOG_ONLY).
              </p>
            )}
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="verify-btn" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="two-factor-footer">
          <p className="resend-text">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resendTimer > 0 || loading}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>

          <div className="method-toggle">
            <p>Try another method:</p>
            <div className="toggle-buttons">
              <button
                type="button"
                className={`method-btn ${method === 'email' ? 'active' : ''}`}
                onClick={() => setMethod('email')}
              >
                📧 Email
              </button>
              <button
                type="button"
                className={`method-btn ${method === 'phone' ? 'active' : ''}`}
                onClick={() => setMethod('phone')}
              >
                📱 SMS
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="cancel-btn" onClick={onCancel}>
          Go Back
        </button>
      </div>
    </div>
  );
}
