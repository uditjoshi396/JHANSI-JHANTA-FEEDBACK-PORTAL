/**
 * Auto-Generation Admin Panel Component
 * React component for auto-generating admin and officer accounts
 */

import React, { useState } from 'react';
import './AutoGeneration.css';
import { API_BASE } from '../config';

const AutoGeneration = ({ authToken, apiUrl }) => {
  // State management
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [successCount, setSuccessCount] = useState(0);

  // Form states
  const [singleForm, setSingleForm] = useState({
    name: '',
    email: '',
    role: 'officer',
    department: ''
  });

  const [bulkForm, setBulkForm] = useState({
    accounts: [{ name: '', email: '', role: 'officer', department: '' }]
  });

  const [emailListForm, setEmailListForm] = useState({
    emails: '',
    role: 'officer',
    department: ''
  });

  const [csvData, setCsvData] = useState('');

  // API functions
  const createAutoHeaders = () => ({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Single Account Creation
  const handleCreateSingle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/generate-account`, {
        method: 'POST',
        headers: createAutoHeaders(),
        body: JSON.stringify(singleForm)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', `✅ Account created for ${data.user.email}`);
        setSuccessCount(successCount + 1);
        setSingleForm({ name: '', email: '', role: 'officer', department: '' });
      } else {
        showMessage('error', `❌ Error: ${data.error}`);
      }
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk Account Creation
  const handleAddBulkRow = () => {
    setBulkForm({
      accounts: [...bulkForm.accounts, { name: '', email: '', role: 'officer', department: '' }]
    });
  };

  const handleRemoveBulkRow = (index) => {
    const newAccounts = bulkForm.accounts.filter((_, i) => i !== index);
    setBulkForm({ accounts: newAccounts });
  };

  const handleBulkChange = (index, field, value) => {
    const newAccounts = [...bulkForm.accounts];
    newAccounts[index][field] = value;
    setBulkForm({ accounts: newAccounts });
  };

  const handleCreateBulk = async (e) => {
    e.preventDefault();
    
    if (bulkForm.accounts.some(acc => !acc.name || !acc.email)) {
      showMessage('error', '❌ All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/generate-bulk`, {
        method: 'POST',
        headers: createAutoHeaders(),
        body: JSON.stringify(bulkForm)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 
          `✅ Created ${data.summary.created} accounts, ${data.summary.emailsSent} emails sent`
        );
        setSuccessCount(successCount + data.summary.created);
        setBulkForm({ accounts: [{ name: '', email: '', role: 'officer', department: '' }] });
      } else {
        showMessage('error', `❌ Error: ${data.error}`);
      }
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Email List Creation
  const handleCreateFromEmails = async (e) => {
    e.preventDefault();

    const emails = emailListForm.emails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      showMessage('error', '❌ Please enter valid email addresses');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/generate-from-emails`, {
        method: 'POST',
        headers: createAutoHeaders(),
        body: JSON.stringify({
          emails,
          role: emailListForm.role,
          department: emailListForm.department
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success',
          `✅ Created ${data.summary.created} accounts from ${emails.length} emails`
        );
        setSuccessCount(successCount + data.summary.created);
        setEmailListForm({ emails: '', role: 'officer', department: '' });
      } else {
        showMessage('error', `❌ Error: ${data.error}`);
      }
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CSV Creation
  const handleCreateFromCSV = async (e) => {
    e.preventDefault();

    if (!csvData.trim()) {
      showMessage('error', '❌ Please paste CSV data');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/generate-from-csv`, {
        method: 'POST',
        headers: createAutoHeaders(),
        body: JSON.stringify({ csvData })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success',
          `✅ Created ${data.summary.created} accounts from CSV`
        );
        setSuccessCount(successCount + data.summary.created);
        setCsvData('');
      } else {
        showMessage('error', `❌ Error: ${data.error}`);
      }
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download Template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/generate-template`, {
        headers: createAutoHeaders()
      });

      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accounts-template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="auto-generation-container">
      <div className="auto-generation-header">
        <h2>🔐 Auto-Generate Admin & Officer Accounts</h2>
        <p>Quickly create and email login credentials to government officials</p>
        {successCount > 0 && (
          <div className="success-badge">
            ✅ {successCount} account{successCount !== 1 ? 's' : ''} created this session
          </div>
        )}
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`message-alert message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          👤 Single Account
        </button>
        <button
          className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          👥 Bulk Accounts
        </button>
        <button
          className={`tab-button ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          📧 Email List
        </button>
        <button
          className={`tab-button ${activeTab === 'csv' ? 'active' : ''}`}
          onClick={() => setActiveTab('csv')}
        >
          📄 CSV Upload
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Single Account Tab */}
        {activeTab === 'single' && (
          <form onSubmit={handleCreateSingle} className="form-section">
            <h3>Create Single Account</h3>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g., Rajesh Kumar"
                value={singleForm.name}
                onChange={(e) => setSingleForm({ ...singleForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="e.g., rajesh@government.in"
                value={singleForm.email}
                onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={singleForm.role}
                  onChange={(e) => setSingleForm({ ...singleForm, role: e.target.value })}
                >
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  placeholder="e.g., Police Department"
                  value={singleForm.department}
                  onChange={(e) => setSingleForm({ ...singleForm, department: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '✅ Create Account & Send Email'}
            </button>
          </form>
        )}

        {/* Bulk Accounts Tab */}
        {activeTab === 'bulk' && (
          <form onSubmit={handleCreateBulk} className="form-section">
            <h3>Create Multiple Accounts</h3>

            <div className="bulk-table">
              <div className="table-header">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Department</div>
                <div>Action</div>
              </div>

              {bulkForm.accounts.map((account, index) => (
                <div key={index} className="table-row">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={account.name}
                    onChange={(e) => handleBulkChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={account.email}
                    onChange={(e) => handleBulkChange(index, 'email', e.target.value)}
                    required
                  />
                  <select
                    value={account.role}
                    onChange={(e) => handleBulkChange(index, 'role', e.target.value)}
                  >
                    <option value="officer">Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Department"
                    value={account.department}
                    onChange={(e) => handleBulkChange(index, 'department', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => handleRemoveBulkRow(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-secondary" onClick={handleAddBulkRow}>
              ➕ Add Another Account
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : `✅ Create ${bulkForm.accounts.length} Accounts`}
            </button>
          </form>
        )}

        {/* Email List Tab */}
        {activeTab === 'emails' && (
          <form onSubmit={handleCreateFromEmails} className="form-section">
            <h3>Create from Email List</h3>

            <div className="form-group">
              <label>Email Addresses (One per line) *</label>
              <textarea
                placeholder="officer1@gov.in&#10;officer2@gov.in&#10;officer3@gov.in"
                value={emailListForm.emails}
                onChange={(e) => setEmailListForm({ ...emailListForm, emails: e.target.value })}
                rows="6"
                required
              />
              <small>Paste one email address per line</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={emailListForm.role}
                  onChange={(e) => setEmailListForm({ ...emailListForm, role: e.target.value })}
                >
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  placeholder="e.g., Police Department"
                  value={emailListForm.department}
                  onChange={(e) => setEmailListForm({ ...emailListForm, department: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '✅ Create from Email List'}
            </button>
          </form>
        )}

        {/* CSV Upload Tab */}
        {activeTab === 'csv' && (
          <form onSubmit={handleCreateFromCSV} className="form-section">
            <h3>Create from CSV</h3>

            <div className="csv-instructions">
              <p>Format: <code>name,email,role,department</code></p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownloadTemplate}
              >
                📥 Download CSV Template
              </button>
            </div>

            <div className="form-group">
              <label>CSV Data (paste content) *</label>
              <textarea
                placeholder="name,email,role,department&#10;Rajesh Kumar,rajesh@gov.in,admin,Administration&#10;Priya Sharma,priya@gov.in,officer,Police"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows="8"
                required
              />
              <small>Include header row</small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : '✅ Create from CSV'}
            </button>
          </form>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <h4>ℹ️ How It Works</h4>
        <ul>
          <li>Enter account details in any format above</li>
          <li>System generates random secure password</li>
          <li>Creates unique username for each officer</li>
          <li>Sends login credentials via Gmail email</li>
          <li>Officer logs in immediately with credentials</li>
          <li>Can change password on first login</li>
        </ul>
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <h4>🔒 Security Notice</h4>
        <ul>
          <li>Passwords are securely hashed and never stored in plain text</li>
          <li>Each officer receives unique random password via email</li>
          <li>Email addresses must be unique in the system</li>
          <li>All account creation is logged for audit purposes</li>
          <li>Only admin users can create accounts</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoGeneration;
