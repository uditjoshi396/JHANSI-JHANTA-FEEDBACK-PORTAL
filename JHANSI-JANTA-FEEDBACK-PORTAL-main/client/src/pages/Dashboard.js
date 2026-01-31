import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIChatbot from '../components/AIChatbot';

function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Low'
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0
  });
  const [userRole, setUserRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrievances();
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
  }, []);

  const fetchGrievances = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/grievances/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrievances(response.data);

      // Calculate stats
      const total = response.data.length;
      const pending = response.data.filter(g => g.status === 'Pending').length;
      const resolved = response.data.filter(g => g.status === 'Resolved').length;
      const rejected = response.data.filter(g => g.status === 'Rejected').length;

      setStats({ total, pending, resolved, rejected });
    } catch (error) {
      console.error('Error fetching grievances:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/grievances/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'General',
        priority: 'Low'
      });

      // Close form and refresh grievances
      setShowForm(false);
      fetchGrievances();

      // Show success message
      alert('Grievance submitted successfully!');
    } catch (error) {
      console.error('Error submitting grievance:', error);
      alert('Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Assigned': return 'info';
      case 'Resolved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const filteredGrievances = grievances.filter(grievance => {
    if (filterStatus === 'all') return true;
    return grievance.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent': return '🚨';
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Infrastructure': return '🏗️';
      case 'Health': return '🏥';
      case 'Education': return '🎓';
      case 'Environment': return '🌱';
      case 'General': return '📋';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">🗳️ Janata Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's your grievance overview.</p>
        </div>
        <div className="header-actions">
          <button
            className="new-grievance-btn"
            onClick={() => setShowForm(true)}
          >
            📝 New Grievance
          </button>
          {userRole === 'admin' && (
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate('/statistics')}
            >
              📊 Statistics
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card total">
          <div className="stats-icon">📊</div>
          <h3 className="stats-number">{stats.total}</h3>
          <p className="stats-label">Total Grievances</p>
        </div>
        <div className="stats-card pending">
          <div className="stats-icon">⏳</div>
          <h3 className="stats-number">{stats.pending}</h3>
          <p className="stats-label">Pending</p>
        </div>
        <div className="stats-card resolved">
          <div className="stats-icon">✅</div>
          <h3 className="stats-number">{stats.resolved}</h3>
          <p className="stats-label">Resolved</p>
        </div>
        <div className="stats-card rejected">
          <div className="stats-icon">❌</div>
          <h3 className="stats-number">{stats.rejected}</h3>
          <p className="stats-label">Rejected</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="overview-section">
          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h5>🚀 Quick Actions</h5>
            <div className="action-btn-grid">
              <button
                className="action-btn"
                onClick={() => setShowForm(true)}
              >
                📝 Submit Grievance
              </button>
              <button
                className="action-btn"
                onClick={() => setActiveTab('grievances')}
              >
                📊 View All Grievances
              </button>
              {userRole === 'admin' && (
                <button
                  className="action-btn"
                  onClick={() => navigate('/statistics')}
                >
                  📈 System Statistics
                </button>
              )}
              <button
                className="action-btn"
                onClick={() => window.location.href = '/contact'}
              >
                📞 Contact Support
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-card">
            <h5>📈 Recent Activity</h5>
            {grievances.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h6>No grievances yet</h6>
                <p>Your submitted grievances will appear here</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Submit Your First Grievance
                </button>
              </div>
            ) : (
              <div className="activity-list">
                {grievances.slice(0, 5).map((grievance) => (
                  <div key={grievance._id} className="activity-item">
                    <div className="activity-icon">
                      {getCategoryIcon(grievance.category)}
                    </div>
                    <div className="activity-content">
                      <h6 className="activity-title">{grievance.title}</h6>
                      <p className="activity-meta">
                        {grievance.category} • {new Date(grievance.createdAt).toLocaleDateString()} •
                        <span className={`status-${grievance.status.toLowerCase()}`}>
                          {grievance.status}
                        </span>
                      </p>
                    </div>
                    <div className="activity-priority">
                      {getPriorityIcon(grievance.priority)}
                    </div>
                  </div>
                ))}
                {grievances.length > 5 && (
                  <div className="text-center mt-3">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => setActiveTab('grievances')}
                    >
                      View All Grievances ({grievances.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'grievances' && (
        <div className="grievances-section">
          {/* Filter Controls */}
          <div className="grievance-filter-card">
            <h5>📝 My Grievances</h5>
            <div className="filter-controls">
              <div>
                <span className="text-muted">
                  {filteredGrievances.length} of {grievances.length} grievances
                </span>
              </div>
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Grievances Grid */}
          {filteredGrievances.length === 0 ? (
            <div className="empty-grievances">
              <div className="empty-state-icon">🔍</div>
              <h6>No grievances found</h6>
              <p>
                {filterStatus === 'all'
                  ? "You haven't submitted any grievances yet."
                  : `No grievances with status "${filterStatus}".`
                }
              </p>
              {filterStatus !== 'all' && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setFilterStatus('all')}
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grievance-grid">
              {filteredGrievances.map((grievance) => (
                <div key={grievance._id} className="grievance-card">
                  <div className="grievance-header">
                    <div className="category-badge">
                      {getCategoryIcon(grievance.category)} {grievance.category}
                    </div>
                    <div className="status-priority">
                      <span className="priority-icon">{getPriorityIcon(grievance.priority)}</span>
                      <span className={`status-badge status-${grievance.status.toLowerCase()}`}>
                        {grievance.status}
                      </span>
                    </div>
                  </div>
                  <div className="grievance-body">
                    <h6 className="grievance-title">{grievance.title}</h6>
                    <p className="grievance-description">{grievance.description}</p>
                    <div className="grievance-meta">
                      <span>
                        📅 Submitted: {new Date(grievance.createdAt).toLocaleDateString()}
                      </span>
                      {grievance.updatedAt !== grievance.createdAt && (
                        <span>
                          🔄 Updated: {new Date(grievance.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {grievance.response && (
                      <div className="response-section">
                        <h6 className="response-title">
                          📋 Official Response:
                        </h6>
                        <div className="response-content">
                          {grievance.response}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Form for New Grievance */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>📝 Submit New Grievance</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="modal-form-group">
                  <label htmlFor="title" className="modal-label">Title *</label>
                  <input
                    type="text"
                    className="modal-input"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief title for your grievance"
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="description" className="modal-label">Description *</label>
                  <textarea
                    className="modal-textarea"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of your grievance"
                    required
                  ></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="modal-form-group">
                    <label htmlFor="category" className="modal-label">Category</label>
                    <select
                      className="modal-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="General">📋 General</option>
                      <option value="Infrastructure">🏗️ Infrastructure</option>
                      <option value="Health">🏥 Health</option>
                      <option value="Education">🎓 Education</option>
                      <option value="Environment">🌱 Environment</option>
                      <option value="Other">📄 Other</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label htmlFor="priority" className="modal-label">Priority</label>
                    <select
                      className="modal-select"
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🔴 High</option>
                      <option value="Urgent">🚨 Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-btn modal-btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-btn modal-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? '🚀 Submitting...' : '📤 Submit Grievance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

export default Dashboard;
