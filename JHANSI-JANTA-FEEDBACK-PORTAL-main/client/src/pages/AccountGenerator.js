import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AccountGenerator.css";
import { API_BASE } from '../config';

const AccountGenerator = () => {
  const [activeTab, setActiveTab] = useState("single"); // single, bulk, view
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Single account form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "officer",
    department: "",
    sendEmail: true,
  });

  // Bulk upload
  const [csvData, setCsvData] = useState("");
  const [generatedAccounts, setGeneratedAccounts] = useState([]);
  const [existingAccounts, setExistingAccounts] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch existing accounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/admin/accounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setExistingAccounts(response.data.accounts);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generateSingleAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!formData.name || !formData.email || !formData.role) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE}/api/admin/generate-account`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setMessage(`✅ Account created successfully!\n\n
Name: ${response.data.user.name}
Email: ${response.data.user.email}
Username: ${response.data.user.username}
Role: ${response.data.user.role}
Department: ${response.data.user.department}

${response.data.email.sent ? "✅ Credentials sent to " + formData.email : "⚠️ Email not sent"}
        `);

        setFormData({
          name: "",
          email: "",
          role: "officer",
          department: "",
          sendEmail: true,
        });

        fetchAccounts();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error creating account");
    }

    setLoading(false);
  };

  const generateBulkAccounts = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!csvData.trim()) {
        setError("Please paste CSV data");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE}/api/admin/generate-accounts-csv`,
        { csvData, sendEmails: true },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setMessage(`✅ Bulk account generation completed!

Created: ${response.data.summary.created}
Failed: ${response.data.summary.failed}
Emails Sent: ${response.data.summary.emailsSent}
Emails Failed: ${response.data.summary.emailsFailed}
        `);

        setGeneratedAccounts(response.data.created);
        setCsvData("");
        fetchAccounts();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error generating accounts");
    }

    setLoading(false);
  };

  const downloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/admin/accounts/template`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const element = document.createElement("a");
      const file = new Blob([response.data], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = "account-template.csv";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError("Error downloading template");
    }
  };

  const resendCredentials = async (userId, email) => {
    if (!window.confirm(`Resend credentials to ${email}?`)) return;

    try {
      const response = await axios.post(
        `${API_BASE}/api/admin/resend-credentials/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setMessage(`✅ New credentials sent to ${email}`);
      } else {
        setError(`Failed to send credentials: ${response.data.message}`);
      }
    } catch (err) {
      setError("Error resending credentials");
    }
  };

  return (
    <div className="account-generator">
      <div className="generator-container">
        <h1>🔐 Account Manager</h1>
        <p className="subtitle">
          Generate and manage admin and officer accounts automatically
        </p>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "single" ? "active" : ""}`}
            onClick={() => setActiveTab("single")}
          >
            👤 Single Account
          </button>
          <button
            className={`tab ${activeTab === "bulk" ? "active" : ""}`}
            onClick={() => setActiveTab("bulk")}
          >
            📊 Bulk Upload
          </button>
          <button
            className={`tab ${activeTab === "view" ? "active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            👥 Manage Accounts
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="message success">
            <pre>{message}</pre>
            <button onClick={() => setMessage("")}>✕</button>
          </div>
        )}
        {error && (
          <div className="message error">
            {error}
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* Single Account Tab */}
        {activeTab === "single" && (
          <div className="tab-content">
            <h2>Create Single Account</h2>
            <form onSubmit={generateSingleAccount} className="form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Rajesh Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., rajesh@government.in"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="officer">Government Officer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Police, Public Works"
                  />
                </div>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="sendEmail"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleInputChange}
                />
                <label htmlFor="sendEmail">Send credentials via email</label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Creating..." : "✨ Create Account"}
              </button>
            </form>

            <div className="info-box">
              <h3>ℹ️ What happens next:</h3>
              <ul>
                <li>✅ Account is created with auto-generated password</li>
                <li>✅ Email sent with login credentials</li>
                <li>✅ User instructed to change password on first login</li>
                <li>✅ User can immediately start using the portal</li>
              </ul>
            </div>
          </div>
        )}

        {/* Bulk Upload Tab */}
        {activeTab === "bulk" && (
          <div className="tab-content">
            <h2>Bulk Account Generation</h2>

            <div className="bulk-instructions">
              <h3>📋 Steps:</h3>
              <ol>
                <li>Download the CSV template below</li>
                <li>Fill in account details (Name, Email, Role, Department)</li>
                <li>Paste the CSV data into the text area</li>
                <li>Click "Generate Accounts"</li>
              </ol>
            </div>

            <button className="btn btn-secondary" onClick={downloadTemplate}>
              📥 Download CSV Template
            </button>

            <div className="csv-section">
              <label>CSV Data (Paste your data here):</label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Name,Email,Role,Department&#10;Rajesh Kumar,rajesh@gov.in,admin,Administration&#10;Priya Sharma,priya@police.gov.in,officer,Police"
                rows="8"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={generateBulkAccounts}
              disabled={loading || !csvData.trim()}
            >
              {loading ? "⏳ Generating..." : "✨ Generate Accounts from CSV"}
            </button>

            <div className="csv-format-info">
              <h3>📝 CSV Format:</h3>
              <pre>
                {`Name,Email,Role,Department
Rajesh Kumar,rajesh@government.in,admin,Administration
Priya Sharma,priya@police.gov.in,officer,Police Department
Amit Singh,amit@public-works.gov.in,officer,Public Works
Neha Patel,neha@health.gov.in,officer,Health Department`}
              </pre>
              <p>
                <strong>Rules:</strong>
              </p>
              <ul>
                <li>First line is header (Name, Email, Role, Department)</li>
                <li>Role must be: admin or officer</li>
                <li>Department is optional</li>
                <li>Email must be valid and unique</li>
                <li>One account per line</li>
              </ul>
            </div>

            {generatedAccounts.length > 0 && (
              <div className="generated-list">
                <h3>✅ Generated Accounts ({generatedAccounts.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedAccounts.map((acc, idx) => (
                      <tr key={idx}>
                        <td>{acc.name}</td>
                        <td>{acc.email}</td>
                        <td>
                          <span className="badge">{acc.role}</span>
                        </td>
                        <td>{acc.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View/Manage Accounts Tab */}
        {activeTab === "view" && (
          <div className="tab-content">
            <h2>Manage Accounts ({existingAccounts.length})</h2>

            {existingAccounts.length === 0 ? (
              <div className="empty-state">
                <p>No admin or officer accounts found</p>
              </div>
            ) : (
              <div className="accounts-table-container">
                <table className="accounts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingAccounts.map((account, index) => (
                      <tr key={account?._id || `account-${index}`}>
                        <td>{account?.name || "N/A"}</td>
                        <td>{account?.email || "N/A"}</td>
                        <td>
                          <code>{account?.username || "N/A"}</code>
                        </td>
                        <td>
                          <span className="badge">
                            {account?.role || "N/A"}
                          </span>
                        </td>
                        <td>{account?.department || "-"}</td>
                        <td>
                          {account?.createdAt
                            ? new Date(account.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="btn-small btn-resend"
                            onClick={() =>
                              resendCredentials(account?._id, account?.email)
                            }
                            disabled={!account?._id}
                          >
                            📧 Resend
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountGenerator;
