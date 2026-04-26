import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/TransparencyDashboard.css";
import { API_BASE } from "../config";

const TransparencyDashboard = () => {
  const normalizeRole = (role) => {
    if (role === "user" || role === "citizen") return "citizen";
    if (role === "admin" || role === "officer") return role;
    return "citizen";
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGrievanceId, setSelectedGrievanceId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [interactionStats, setInteractionStats] = useState(null);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [interactionVisibility, setInteractionVisibility] = useState("public");
  const [currentUserId, setCurrentUserId] = useState("");
  const [postingInteraction, setPostingInteraction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("citizen");
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const normalized = normalizeRole(user.role || "citizen");
      setUserRole(normalized);
      setCurrentUserId(user._id || user.id || "");
      setInteractionVisibility(normalized === "citizen" ? "public" : "staff");
    } catch (err) {
      setUserRole("citizen");
      setCurrentUserId("");
      setInteractionVisibility("public");
    }
  }, []);

  const isInteractionRead = (interaction) => {
    const receipts = interaction?.readReceipts || [];
    return receipts.some(
      (receipt) =>
        (currentUserId && String(receipt.userId) === String(currentUserId)) ||
        normalizeRole(receipt.role) === userRole,
    );
  };

  const handleLoadSelectedGrievance = () => {
    if (activeTab === "report") {
      fetchReport(selectedGrievanceId);
      return;
    }

    if (activeTab === "analytics") {
      fetchAnalytics(selectedGrievanceId);
      return;
    }

    if (activeTab === "interactions") {
      fetchInteractions(selectedGrievanceId);
      return;
    }

    fetchTimeline(selectedGrievanceId);
  };

  const getLoadButtonLabel = () => {
    if (loading) return "Loading...";
    if (activeTab === "report") return "Generate Report";
    if (activeTab === "analytics") return "Generate Analytics";
    if (activeTab === "interactions") return "Load Interactions";
    return "Load Timeline";
  };

  const fetchTimeline = async (grievanceId) => {
    if (!grievanceId) {
      setError("Please select a grievance");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        userRole === "citizen"
          ? `${API_BASE}/api/transparency/user-timeline/${grievanceId}`
          : `${API_BASE}/api/transparency/timeline/${grievanceId}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTimeline(response.data.timelineEvents);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch timeline");
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractions = async (grievanceId) => {
    if (!grievanceId) {
      setError("Please select a grievance");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/transparency/interactions/${grievanceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setInteractions(response.data.interactions || []);
      setInteractionStats(response.data.stats || null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch interactions");
    } finally {
      setLoading(false);
    }
  };

  const markInteractionAsRead = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE}/api/transparency/interactions/${eventId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedReceipts = response?.data?.readReceipts || [];
      setInteractions((prev) =>
        prev.map((item) =>
          item._id === eventId
            ? { ...item, readReceipts: updatedReceipts }
            : item,
        ),
      );
      setInteractionStats((prev) => {
        if (!prev || prev.unread <= 0) return prev;
        return { ...prev, unread: Math.max(0, prev.unread - 1) };
      });
    } catch (err) {
      console.warn(
        "Read receipt update failed:",
        err.response?.data?.error || err.message,
      );
    }
  };

  const postInteraction = async () => {
    if (!selectedGrievanceId) {
      setError("Please select a grievance");
      return;
    }

    const message = interactionMessage.trim();
    if (!message) {
      setError("Interaction message cannot be empty");
      return;
    }

    setPostingInteraction(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/transparency/interactions/${selectedGrievanceId}`,
        {
          message,
          visibility: interactionVisibility,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setInteractionMessage("");
      setInteractionVisibility(userRole === "citizen" ? "public" : "staff");
      setError("");
      await fetchInteractions(selectedGrievanceId);
      await fetchTimeline(selectedGrievanceId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post interaction");
    } finally {
      setPostingInteraction(false);
    }
  };

  const fetchReport = async (grievanceId) => {
    if (!grievanceId) {
      setError("Please select a grievance");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/transparency/report/${grievanceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setReport(response.data.report);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (grievanceId) => {
    if (!grievanceId) {
      setError("Please select a grievance");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/transparency/analytics/grievance/${grievanceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAnalytics(response.data.analytics);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    if (userRole !== "admin") {
      setError("Only admins can access dashboard");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/transparency/dashboard/roles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setStats(response.data.dashboard);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = "json") => {
    if (!selectedGrievanceId) {
      setError("Please select a grievance");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/transparency/export/${selectedGrievanceId}?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: format === "csv" ? "blob" : "json",
        },
      );

      if (format === "csv") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `grievance-${selectedGrievanceId}-report.csv`,
        );
        document.body.appendChild(link);
        link.click();
      } else {
        console.log("Report exported:", response.data);
      }
    } catch (err) {
      setError("Failed to export report");
    }
  };

  const getEventColor = (eventType) => {
    const colors = {
      SUBMITTED: "#4CAF50",
      ACKNOWLEDGED: "#2196F3",
      ASSIGNED_TO_OFFICER: "#FF9800",
      STATUS_UPDATED: "#2196F3",
      PROGRESS_UPDATE: "#9C27B0",
      RESOLUTION_PROVIDED: "#4CAF50",
      CLOSED: "#607D8B",
      REJECTED: "#F44336",
      COMMENT_ADDED: "#00BCD4",
      ESCALATED: "#F44336",
      USER_MESSAGE: "#3F51B5",
      ADMIN_MESSAGE: "#6A1B9A",
      OFFICER_MESSAGE: "#00897B",
    };
    return colors[eventType] || "#757575";
  };

  const getEventIcon = (eventType) => {
    const icons = {
      SUBMITTED: "📤",
      ACKNOWLEDGED: "✅",
      ASSIGNED_TO_OFFICER: "👤",
      STATUS_UPDATED: "📝",
      PROGRESS_UPDATE: "⏳",
      RESOLUTION_PROVIDED: "✔️",
      CLOSED: "🔒",
      REJECTED: "❌",
      COMMENT_ADDED: "💬",
      ESCALATED: "⚠️",
      USER_MESSAGE: "🙋",
      ADMIN_MESSAGE: "🛡️",
      OFFICER_MESSAGE: "👮",
    };
    return icons[eventType] || "📌";
  };

  return (
    <div className="transparency-dashboard">
      <div className="transparency-header">
        <h1>📊 Transparency Center</h1>
        <p>Track the journey of your grievance with complete transparency</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div className="transparency-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          Timeline
        </button>
        <button
          className={`tab-button ${activeTab === "interactions" ? "active" : ""}`}
          onClick={() => setActiveTab("interactions")}
        >
          Interactions
        </button>
        <button
          className={`tab-button ${activeTab === "report" ? "active" : ""}`}
          onClick={() => setActiveTab("report")}
        >
          Report
        </button>
        <button
          className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        {userRole === "admin" && (
          <button
            className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Admin Dashboard
          </button>
        )}
      </div>

      <div className="transparency-content">
        {/* Grievance Selector */}
        {activeTab !== "dashboard" && (
          <div className="grievance-selector">
            <input
              type="text"
              placeholder="Enter Grievance ID"
              value={selectedGrievanceId}
              onChange={(e) => setSelectedGrievanceId(e.target.value)}
              className="input-field"
            />
            <button
              className="primary-btn"
              onClick={handleLoadSelectedGrievance}
              disabled={loading}
            >
              {getLoadButtonLabel()}
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="info-box">
              <h3>What is Transparency Center?</h3>
              <p>
                The Transparency Center provides a complete, real-time view of
                your grievance journey from submission to resolution. Track
                every step, every update, and every interaction between you, our
                admin team, and government officers.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">👁️</div>
                <h4>Real-time Tracking</h4>
                <p>
                  See every update instantly as your grievance progresses
                  through the system
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔄</div>
                <h4>Complete Timeline</h4>
                <p>
                  View all changes, assignments, and communications in
                  chronological order
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h4>Role Transparency</h4>
                <p>
                  See who is handling your grievance - admins, officers, and
                  their departments
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Analytics</h4>
                <p>
                  Get insights into resolution time, status changes, and
                  participation metrics
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📥</div>
                <h4>Export Reports</h4>
                <p>
                  Download your complete grievance history in CSV or JSON format
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h4>Privacy Protected</h4>
                <p>
                  Only see information relevant to you based on your role and
                  permissions
                </p>
              </div>
            </div>

            <div className="getting-started">
              <h3>Getting Started</h3>
              <ol>
                <li>Enter your Grievance ID in the field above</li>
                <li>Click "Load Timeline" to see the full history</li>
                <li>
                  Switch to different tabs to view timelines, reports, and
                  analytics
                </li>
                <li>Use export to download your complete grievance record</li>
              </ol>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="timeline-section">
            {loading ? (
              <div className="loading">Loading timeline...</div>
            ) : timeline.length > 0 ? (
              <div className="timeline-container">
                {timeline.map((event, index) => (
                  <div key={event._id || index} className="timeline-item">
                    <div
                      className="timeline-marker"
                      style={{
                        backgroundColor: getEventColor(event.eventType),
                      }}
                    >
                      {getEventIcon(event.eventType)}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{event.eventType.replace(/_/g, " ")}</h4>
                        <span
                          className="role-badge"
                          style={{
                            backgroundColor: getEventColor(event.eventType),
                          }}
                        >
                          {event.performedBy.role}
                        </span>
                      </div>
                      <p className="timeline-actor">
                        By: <strong>{event.performedBy.name}</strong> (
                        {event.performedBy.email})
                      </p>
                      <p className="timeline-message">
                        {event.eventDescription?.message}
                      </p>
                      {event.publicMessage && (
                        <div className="public-message">
                          <strong>Public Update:</strong> {event.publicMessage}
                        </div>
                      )}
                      <p className="timeline-timestamp">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.statusTransition && (
                        <div className="status-transition">
                          <span className="status-from">
                            {event.statusTransition.from}
                          </span>
                          <span className="transition-arrow">→</span>
                          <span className="status-to">
                            {event.statusTransition.to}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>
                  No timeline data available. Select a grievance to view its
                  timeline.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === "interactions" && (
          <div className="interactions-section">
            <div className="interactions-toolbar">
              <div className="interaction-stat">
                <span>Total Messages</span>
                <strong>
                  {interactionStats?.total || interactions.length || 0}
                </strong>
              </div>
              <div className="interaction-stat">
                <span>Unread</span>
                <strong>{interactionStats?.unread || 0}</strong>
              </div>
              <div className="interaction-stat">
                <span>Citizen</span>
                <strong>{interactionStats?.byRole?.citizen || 0}</strong>
              </div>
              <div className="interaction-stat">
                <span>Admin</span>
                <strong>{interactionStats?.byRole?.admin || 0}</strong>
              </div>
              <div className="interaction-stat">
                <span>Officer</span>
                <strong>{interactionStats?.byRole?.officer || 0}</strong>
              </div>
            </div>

            <div className="interaction-composer">
              <h4>Post Transparent Message</h4>
              <textarea
                value={interactionMessage}
                onChange={(e) => setInteractionMessage(e.target.value)}
                placeholder="Share update, clarification, or response..."
                maxLength={2000}
                className="interaction-textarea"
              />
              <div className="composer-actions">
                {userRole === "citizen" ? (
                  <div className="visibility-note">
                    Visibility: Public (citizen messages are always public)
                  </div>
                ) : (
                  <select
                    value={interactionVisibility}
                    onChange={(e) => setInteractionVisibility(e.target.value)}
                    className="visibility-select"
                  >
                    <option value="public">Public</option>
                    <option value="staff">Staff (admin + officer)</option>
                    {userRole === "admin" && (
                      <option value="admin-only">Admin Only</option>
                    )}
                  </select>
                )}
                <button
                  className="primary-btn"
                  onClick={postInteraction}
                  disabled={postingInteraction || !interactionMessage.trim()}
                >
                  {postingInteraction ? "Posting..." : "Post Message"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading interactions...</div>
            ) : interactions.length > 0 ? (
              <div className="interactions-list">
                {interactions.map((interaction, index) => {
                  const normalizedRole = normalizeRole(
                    interaction?.performedBy?.role,
                  );
                  const read = isInteractionRead(interaction);
                  const visibility = interaction?.visibility || "public";
                  return (
                    <div
                      key={interaction._id || index}
                      className={`interaction-entry ${read ? "read" : "unread"}`}
                    >
                      <div className="interaction-entry-header">
                        <span className={`role-chip role-${normalizedRole}`}>
                          {normalizedRole.toUpperCase()}
                        </span>
                        <span className="event-chip">
                          {(interaction.eventType || "MESSAGE").replace(
                            /_/g,
                            " ",
                          )}
                        </span>
                        <span
                          className={`visibility-chip visibility-${visibility}`}
                        >
                          {visibility}
                        </span>
                      </div>
                      <p className="interaction-message">
                        {interaction.eventDescription?.message ||
                          interaction.publicMessage ||
                          "No message"}
                      </p>
                      <div className="interaction-meta">
                        <span>
                          By {interaction?.performedBy?.name || "Unknown"} (
                          {interaction?.performedBy?.email || "N/A"})
                        </span>
                        <span>
                          {new Date(interaction.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {!read && interaction._id && (
                        <button
                          className="read-btn"
                          onClick={() => markInteractionAsRead(interaction._id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">
                <p>
                  No interactions yet. Start the conversation to improve
                  transparency.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
          <div className="report-section">
            <button
              className="secondary-btn"
              onClick={() => fetchReport(selectedGrievanceId)}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            {report && (
              <div className="report-container">
                <div className="report-header">
                  <h3>{report.grievanceDetails.title}</h3>
                  <div className="report-metadata">
                    <span className="badge">
                      {report.grievanceDetails.category}
                    </span>
                    <span className="badge badge-status">
                      {report.grievanceDetails.status}
                    </span>
                    <span className="badge badge-priority">
                      {report.grievanceDetails.priority}
                    </span>
                  </div>
                </div>

                <div className="report-stats">
                  <div className="stat-card">
                    <h5>Total Events</h5>
                    <p className="stat-value">
                      {report.statistics.totalEvents}
                    </p>
                  </div>
                  <div className="stat-card">
                    <h5>Last Update</h5>
                    <p className="stat-value">
                      {new Date(
                        report.statistics.lastUpdate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {report.slaMetrics.firstResponseTime && (
                    <div className="stat-card">
                      <h5>First Response</h5>
                      <p className="stat-value">
                        {new Date(
                          report.slaMetrics.firstResponseTime,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="report-breakdown">
                  <div className="breakdown-section">
                    <h4>Events by Type</h4>
                    <ul>
                      {Object.entries(report.statistics.eventsByType).map(
                        ([type, count]) => (
                          <li key={type}>
                            <span>{type}</span>
                            <span className="count">{count}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div className="breakdown-section">
                    <h4>Participation by Role</h4>
                    <ul>
                      {Object.entries(report.statistics.eventsByRole).map(
                        ([role, count]) => (
                          <li key={role}>
                            <span className="role-label">{role}</span>
                            <span className="count">{count}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>

                <div className="report-actions">
                  <button
                    className="export-btn"
                    onClick={() => exportReport("json")}
                  >
                    📥 Export as JSON
                  </button>
                  <button
                    className="export-btn"
                    onClick={() => exportReport("csv")}
                  >
                    📊 Export as CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="analytics-section">
            <button
              className="secondary-btn"
              onClick={() => fetchAnalytics(selectedGrievanceId)}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Generate Analytics"}
            </button>

            {analytics && (
              <div className="analytics-container">
                <div className="analytics-lifecycle">
                  <h4>Grievance Lifecycle</h4>
                  <div className="lifecycle-info">
                    <div className="lifecycle-item">
                      <span>Submitted:</span>
                      <strong>
                        {new Date(
                          analytics.lifecycle.submittedAt,
                        ).toLocaleDateString()}
                      </strong>
                    </div>
                    <div className="lifecycle-item">
                      <span>Last Updated:</span>
                      <strong>
                        {new Date(
                          analytics.lifecycle.lastUpdatedAt,
                        ).toLocaleDateString()}
                      </strong>
                    </div>
                    <div className="lifecycle-item">
                      <span>Days in System:</span>
                      <strong>
                        {analytics.lifecycle.totalDaysInSystem} days
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="analytics-interactions">
                  <h4>Role Interactions</h4>
                  {Object.entries(analytics.roleInteractions).map(
                    ([role, data]) => (
                      <div key={role} className="interaction-card">
                        <h5>{role.toUpperCase()}</h5>
                        <p>
                          <strong>Interactions:</strong> {data.count}
                        </p>
                        <p>
                          <strong>First:</strong>{" "}
                          {new Date(data.firstInteraction).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Last:</strong>{" "}
                          {new Date(data.lastInteraction).toLocaleDateString()}
                        </p>
                        <div className="event-tags">
                          {[...new Set(data.events)].map((event) => (
                            <span key={event} className="event-tag">
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="analytics-milestones">
                  <h4>Key Milestones</h4>
                  <ul className="milestones-list">
                    {analytics.keyMilestones.map((milestone, index) => (
                      <li key={index}>
                        <strong>{milestone.eventType}</strong> -{" "}
                        {new Date(milestone.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Dashboard */}
        {activeTab === "dashboard" && userRole === "admin" && (
          <div className="admin-dashboard-section">
            <button
              className="secondary-btn"
              onClick={fetchDashboard}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load Dashboard"}
            </button>

            {stats.summary && (
              <div className="dashboard-container">
                <div className="dashboard-summary">
                  <h3>
                    System Activity - Last {stats.period?.days || 30} Days
                  </h3>
                  <div className="summary-grid">
                    <div className="summary-card">
                      <h5>Total Activities</h5>
                      <p className="summary-value">
                        {stats.summary.totalActivities}
                      </p>
                    </div>
                    {Object.entries(stats.summary.byRole).map(
                      ([role, count]) => (
                        <div key={role} className="summary-card">
                          <h5>{role.toUpperCase()}</h5>
                          <p className="summary-value">{count}</p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="dashboard-analysis">
                  <h3>Role-wise Analysis</h3>
                  <div className="role-analysis-grid">
                    {Object.entries(stats.roleAnalysis).map(([role, data]) => (
                      <div key={role} className="role-card">
                        <h4>{role.toUpperCase()}</h4>
                        <p>
                          <strong>Total Activities:</strong>{" "}
                          {data.totalActivities}
                        </p>
                        <p>
                          <strong>Avg/Day:</strong> {data.averageActivityPerDay}
                        </p>
                        <div className="event-breakdown">
                          {Object.entries(data.eventTypes)
                            .slice(0, 3)
                            .map(([event, count]) => (
                              <span key={event} className="event-stat">
                                {event}: {count}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransparencyDashboard;
