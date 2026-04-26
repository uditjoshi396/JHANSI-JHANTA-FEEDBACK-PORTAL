import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Officer.css';
import { API_BASE } from '../config';

function Officer() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({
    assignedGrievances: 0,
    resolvedGrievances: 0,
    pendingGrievances: 0,
    rejectedGrievances: 0,
    avgResolutionTime: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [officerId, setOfficerId] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    setOfficerId(user._id);

    // Check if user is officer
    if (user.role !== 'officer') {
      navigate('/dashboard');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch assigned grievances (officer view)
      const grievanceRes = await axios.get(`${API_BASE}/api/grievances/officer`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGrievances(grievanceRes.data);

      // Calculate stats
      const total = grievanceRes.data.length;
      const resolved = grievanceRes.data.filter(g => g.status === 'Resolved').length;
      const pending = grievanceRes.data.filter(g => g.status === 'Pending').length;
      const rejected = grievanceRes.data.filter(g => g.status === 'Rejected').length;
      const underProgress = grievanceRes.data.filter(g => g.status === 'Under Progress').length;

      // Calculate average rating
      const ratedGrievances = grievanceRes.data.filter(g => g.rating && g.rating > 0);
      const avgRating = ratedGrievances.length > 0
        ? (ratedGrievances.reduce((sum, g) => sum + g.rating, 0) / ratedGrievances.length).toFixed(1)
        : 0;

      setStats({
        assignedGrievances: total,
        resolvedGrievances: resolved,
        pendingGrievances: pending,
        rejectedGrievances: rejected,
        avgResolutionTime: calculateAvgResolutionTime(grievanceRes.data),
        avgRating: parseFloat(avgRating),
        underProgressGrievances: underProgress
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgResolutionTime = (grievances) => {
    const resolved = grievances.filter(g => g.status === 'Resolved' && g.updatedAt);
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
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/api/grievances/${grievanceId}/status`,
        {
          status: newStatus,
          response: responseText,
          assignedOfficer: officerId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResponseText('');
      setSelectedGrievance(null);
      setShowResponseModal(false);
      fetchData();
    } catch (error) {
      console.error('Error updating grievance:', error);
      alert('Error updating grievance status');
    }
  };

  const handleOpenResponse = (grievance) => {
    setSelectedGrievance(grievance);
    setNewStatus(grievance.status || 'Pending');
    setResponseText(grievance.officerResponse || '');
    setShowResponseModal(true);
  };

  const handleCloseResponse = () => {
    setShowResponseModal(false);
    setSelectedGrievance(null);
    setResponseText('');
  };

  const filteredGrievances = grievances.filter(g => {
    const statusMatch = filterStatus === 'all' || g.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || g.category === filterCategory;
    const searchMatch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.citizenId && g.citizenId.toString().includes(searchQuery));
    return statusMatch && categoryMatch && searchMatch;
  });

  if (loading) {
    return <div className="officer-loading">Loading officer panel...</div>;
  }

  if (userRole !== 'officer') {
    return <div className="officer-error">Access Denied. Officer privileges required.</div>;
  }

  return (
    <div className="officer-container">
      <div className="officer-header">
        <h1>👮 Officer Dashboard</h1>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }}>
          Logout
        </button>
      </div>

      <div className="officer-nav">
        <button
          className={`officer-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`officer-tab ${activeTab === 'grievances' ? 'active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          📋 My Grievances
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="officer-dashboard">
          <div className="stats-grid">
            <div className="stat-card assigned">
              <div className="stat-icon">📨</div>
              <div className="stat-content">
                <h3>Assigned Grievances</h3>
                <p className="stat-value">{stats.assignedGrievances}</p>
              </div>
            </div>

            <div className="stat-card progress">
              <div className="stat-icon">⚙️</div>
              <div className="stat-content">
                <h3>Under Progress</h3>
                <p className="stat-value">{stats.underProgressGrievances}</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending</h3>
                <p className="stat-value">{stats.pendingGrievances}</p>
              </div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Resolved</h3>
                <p className="stat-value">{stats.resolvedGrievances}</p>
              </div>
            </div>

            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>Rejected</h3>
                <p className="stat-value">{stats.rejectedGrievances}</p>
              </div>
            </div>

            <div className="stat-card rating">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Avg Rating</h3>
                <p className="stat-value">{stats.avgRating}/5</p>
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
              <h3>Status Overview</h3>
              <div className="status-distribution">
                <div className="distribution-item">
                  <span>Pending: {stats.pendingGrievances}</span>
                  <div className="bar pending">
                    <div style={{ width: `${(stats.pendingGrievances / stats.assignedGrievances) * 100 || 0}%` }}></div>
                  </div>
                </div>
                <div className="distribution-item">
                  <span>In Progress: {stats.underProgressGrievances}</span>
                  <div className="bar progress">
                    <div style={{ width: `${(stats.underProgressGrievances / stats.assignedGrievances) * 100 || 0}%` }}></div>
                  </div>
                </div>
                <div className="distribution-item">
                  <span>Resolved: {stats.resolvedGrievances}</span>
                  <div className="bar resolved">
                    <div style={{ width: `${(stats.resolvedGrievances / stats.assignedGrievances) * 100 || 0}%` }}></div>
                  </div>
                </div>
                <div className="distribution-item">
                  <span>Rejected: {stats.rejectedGrievances}</span>
                  <div className="bar rejected">
                    <div style={{ width: `${(stats.rejectedGrievances / stats.assignedGrievances) * 100 || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Recent Updates</h3>
              <div className="recent-activity">
                {grievances.slice(0, 6).map(g => (
                  <div key={g._id} className="activity-item">
                    <span className={`status-badge ${g.status.toLowerCase().replace(' ', '-')}`}>{g.status}</span>
                    <div className="activity-info">
                      <p className="activity-title">{g.title.substring(0, 40)}...</p>
                      <small>{new Date(g.updatedAt || g.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grievances Tab */}
      {activeTab === 'grievances' && (
        <div className="officer-grievances">
          <div className="grievances-controls">
            <input
              type="text"
              placeholder="🔍 Search grievances..."
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
              <option value="Under Progress">Under Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="Road">Road</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grievances-list">
            {filteredGrievances.length === 0 ? (
              <div className="no-grievances">
                <p>No grievances found</p>
              </div>
            ) : (
              filteredGrievances.map(grievance => (
                <div key={grievance._id} className="grievance-card">
                  <div className="grievance-header">
                    <div className="grievance-title-section">
                      <h3>{grievance.title}</h3>
                      <span className={`status-badge ${grievance.status.toLowerCase().replace(' ', '-')}`}>
                        {grievance.status}
                      </span>
                    </div>
                    <span className="category-badge">{grievance.category}</span>
                  </div>

                  <div className="grievance-content">
                    <p>{grievance.description}</p>
                  </div>

                  <div className="grievance-meta">
                    <span>📅 {new Date(grievance.createdAt).toLocaleDateString()}</span>
                    <span>👤 ID: {grievance.citizenId}</span>
                    {grievance.priority && <span>🎯 Priority: {grievance.priority}</span>}
                    {grievance.rating && <span>⭐ {grievance.rating}/5</span>}
                  </div>

                  {grievance.officerResponse && (
                    <div className="response-section">
                      <strong>Officer Response:</strong>
                      <p>{grievance.officerResponse}</p>
                    </div>
                  )}

                  <div className="grievance-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleOpenResponse(grievance)}
                    >
                      💬 {grievance.officerResponse ? 'Update' : 'Respond'}
                    </button>
                    {grievance.attachment && (
                      <a
                        href={`${API_BASE}/uploads/${grievance.attachment}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn attachment-btn"
                      >
                        📎 Attachment
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedGrievance && (
        <div className="modal-overlay" onClick={handleCloseResponse}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Respond to Grievance</h2>
              <button className="modal-close" onClick={handleCloseResponse}>✕</button>
            </div>

            <div className="modal-body">
              <div className="grievance-details">
                <p><strong>Title:</strong> {selectedGrievance.title}</p>
                <p><strong>Status:</strong> {selectedGrievance.status}</p>
                <p><strong>Category:</strong> {selectedGrievance.category}</p>
                <p><strong>Description:</strong> {selectedGrievance.description}</p>
              </div>

              <div className="form-group">
                <label>Update Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Progress">Under Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label>Officer Response:</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response here..."
                  className="form-control"
                  rows="6"
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseResponse}>
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={() => handleUpdateStatus(selectedGrievance._id)}
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Officer;
