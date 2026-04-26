import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Admin.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [grievances, setGrievances] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalGrievances: 0,
    totalUsers: 0,
    resolvedGrievances: 0,
    pendingGrievances: 0,
    rejectedGrievances: 0,
    avgResolutionTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role);

    // Check if user is admin
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all grievances (admin view)
      const grievanceRes = await axios.get(
        "http://localhost:5000/api/grievances/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Fetch all users (admin view)
      const usersRes = await axios.get("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Admin users API response:", usersRes.data);

      setGrievances(grievanceRes.data);
      // Defensive: ensure users is array
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      // Calculate stats
      const total = grievanceRes.data.length;
      const resolved = grievanceRes.data.filter(
        (g) => g.status === "Resolved",
      ).length;
      const pending = grievanceRes.data.filter(
        (g) => g.status === "Pending",
      ).length;
      const rejected = grievanceRes.data.filter(
        (g) => g.status === "Rejected",
      ).length;

      setStats({
        totalGrievances: total,
        totalUsers: usersRes.data?.length || 0,
        resolvedGrievances: resolved,
        pendingGrievances: pending,
        rejectedGrievances: rejected,
        avgResolutionTime: calculateAvgResolutionTime(grievanceRes.data),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgResolutionTime = (grievances) => {
    const resolved = grievances.filter(
      (g) => g.status === "Resolved" && g.updatedAt,
    );
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, g) => {
      const createdDate = new Date(g.createdAt);
      const updatedDate = new Date(g.updatedAt);
      return sum + (updatedDate - createdDate);
    }, 0);

    return Math.round(totalTime / resolved.length / (1000 * 60 * 60 * 24)); // days
  };

  const handleUpdateStatus = async (grievanceId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/grievances/${grievanceId}/status`,
        {
          status: newStatus,
          response: responseText,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Refresh data
      setResponseText("");
      setSelectedGrievance(null);
      fetchData();
    } catch (error) {
      console.error("Error updating grievance:", error);
      alert("Error updating grievance status");
    }
  };

  const handleDeleteGrievance = async (grievanceId) => {
    if (window.confirm("Are you sure you want to delete this grievance?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/grievances/${grievanceId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        fetchData();
      } catch (error) {
        console.error("Error deleting grievance:", error);
        alert("Error deleting grievance");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      }
    }
  };

  const filteredGrievances = grievances.filter((g) => {
    const statusMatch = filterStatus === "all" || g.status === filterStatus;
    const categoryMatch =
      filterCategory === "all" || g.category === filterCategory;
    const searchMatch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.citizenId.toString().includes(searchQuery);
    return statusMatch && categoryMatch && searchMatch;
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  if (userRole !== "admin") {
    return (
      <div className="admin-error">
        Access Denied. Admin privileges required.
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div className="admin-nav">
        <button
          className={`admin-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === "grievances" ? "active" : ""}`}
          onClick={() => setActiveTab("grievances")}
        >
          📋 Grievances
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="admin-dashboard">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Total Grievances</h3>
                <p className="stat-value">{stats.totalGrievances}</p>
              </div>
            </div>

            <div className="stat-card users">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Resolved</h3>
                <p className="stat-value">{stats.resolvedGrievances}</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending</h3>
                <p className="stat-value">{stats.pendingGrievances}</p>
              </div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>Rejected</h3>
                <p className="stat-value">{stats.rejectedGrievances}</p>
              </div>
            </div>

            <div className="stat-card time">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h3>Avg Resolution</h3>
                <p className="stat-value">{stats.avgResolutionTime} days</p>
              </div>
            </div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Status Distribution</h3>
              <div className="status-distribution">
                <div className="distribution-item">
                  <span>Pending: {stats.pendingGrievances}</span>
                  <div className="bar pending">
                    <div
                      style={{
                        width: `${(stats.pendingGrievances / stats.totalGrievances) * 100 || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="distribution-item">
                  <span>Resolved: {stats.resolvedGrievances}</span>
                  <div className="bar resolved">
                    <div
                      style={{
                        width: `${(stats.resolvedGrievances / stats.totalGrievances) * 100 || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="distribution-item">
                  <span>Rejected: {stats.rejectedGrievances}</span>
                  <div className="bar rejected">
                    <div
                      style={{
                        width: `${(stats.rejectedGrievances / stats.totalGrievances) * 100 || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Recent Activity</h3>
              <div className="recent-activity">
                {grievances.slice(0, 5).map((g) => (
                  <div key={g._id} className="activity-item">
                    <span className={`status-badge ${g.status.toLowerCase()}`}>
                      {g.status}
                    </span>
                    <div className="activity-info">
                      <p className="activity-title">
                        {g.title.substring(0, 40)}...
                      </p>
                      <small>
                        {new Date(g.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grievances Tab */}
      {activeTab === "grievances" && (
        <div className="admin-grievances">
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Search by title, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {selectedGrievance ? (
            <div className="grievance-detail">
              <button
                className="back-btn"
                onClick={() => {
                  setSelectedGrievance(null);
                  setResponseText("");
                }}
              >
                ← Back to List
              </button>

              <div className="detail-header">
                <h2>{selectedGrievance.title}</h2>
                <span
                  className={`status-badge ${selectedGrievance.status.toLowerCase()}`}
                >
                  {selectedGrievance.status}
                </span>
              </div>

              <div className="detail-info">
                <div className="info-row">
                  <label>Citizen ID:</label>
                  <span>{selectedGrievance.citizenId}</span>
                </div>
                <div className="info-row">
                  <label>Category:</label>
                  <span>{selectedGrievance.category}</span>
                </div>
                <div className="info-row">
                  <label>Priority:</label>
                  <span className="priority">{selectedGrievance.priority}</span>
                </div>
                <div className="info-row">
                  <label>Created:</label>
                  <span>
                    {new Date(selectedGrievance.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedGrievance.description}</p>
              </div>

              {selectedGrievance.attachment && (
                <div className="detail-section">
                  <h3>Attachment</h3>
                  <a
                    href={selectedGrievance.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📎 View Attachment
                  </a>
                </div>
              )}

              {selectedGrievance.aiSuggestions && (
                <div className="detail-section ai-suggestions">
                  <h3>🤖 AI Suggestions</h3>
                  <ul>
                    {selectedGrievance.aiSuggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-section action-section">
                <h3>Update Status & Response</h3>
                <div className="action-form">
                  <div className="form-group">
                    <label>New Status:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Response/Comment:</label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Enter your response to the citizen..."
                      rows="5"
                    />
                  </div>

                  <div className="action-buttons">
                    <button
                      className="btn-submit"
                      onClick={() => handleUpdateStatus(selectedGrievance._id)}
                    >
                      ✓ Update Grievance
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        handleDeleteGrievance(selectedGrievance._id);
                        setSelectedGrievance(null);
                      }}
                    >
                      🗑️ Delete Grievance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grievances-list">
              <p className="grievances-count">
                Showing {filteredGrievances.length} of {grievances.length}{" "}
                grievances
              </p>
              {filteredGrievances.length === 0 ? (
                <div className="empty-state">No grievances found</div>
              ) : (
                <table className="grievances-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrievances.map((g) => (
                      <tr key={g._id}>
                        <td>{g._id.substring(0, 8)}...</td>
                        <td className="title-cell">
                          {g.title.substring(0, 50)}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${g.status.toLowerCase()}`}
                          >
                            {g.status}
                          </span>
                        </td>
                        <td>{g.category}</td>
                        <td>{g.priority}</td>
                        <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => {
                              setSelectedGrievance(g);
                              setNewStatus(g.status);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="admin-users">
          <div className="admin-filters">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="users-list">
            <p className="users-count">Total Users: {users.length}</p>
            {filteredUsers.length === 0 ? (
              <div className="empty-state">No users found</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => {
                    if (!u || typeof u !== "object") {
                      console.warn("Invalid user object:", u);
                      return null;
                    }
                    return (
                      <tr key={u._id || `user-${index}`}>
                        <td>{u._id ? u._id.substring(0, 8) + "..." : "N/A"}</td>
                        <td>{u.name || "N/A"}</td>
                        <td>{u.email || "N/A"}</td>
                        <td>{u.phone || "N/A"}</td>
                        <td>
                          <span
                            className={`role-badge ${u.role?.toLowerCase() || "citizen"}`}
                          >
                            {u.role || "Citizen"}
                          </span>
                        </td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="delete-btn-small"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete user"
                            disabled={!u._id}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
