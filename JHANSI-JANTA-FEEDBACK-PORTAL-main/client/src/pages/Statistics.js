import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/grievances/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to load statistics. Please try again.');
      }
    } finally {
      setLoading(false);
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
      case 'Pending': return '#ffc107';
      case 'Assigned': return '#17a2b8';
      case 'In Progress': return '#007bff';
      case 'Resolved': return '#28a745';
      case 'Closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return '#28a745';
      case 'Medium': return '#ffc107';
      case 'High': return '#dc3545';
      default: return '#6c757d';
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👑';
      case 'officer': return '👮';
      case 'citizen': return '👤';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h6>Error Loading Statistics</h6>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchStatistics}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">📊 System Statistics</h1>
          <p className="dashboard-subtitle">Comprehensive overview of the grievance management system.</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stats-card total">
          <div className="stats-icon">📝</div>
          <h3 className="stats-number">{stats.grievances.total}</h3>
          <p className="stats-label">Total Grievances</p>
        </div>
        <div className="stats-card users">
          <div className="stats-icon">👥</div>
          <h3 className="stats-number">{stats.users.total}</h3>
          <p className="stats-label">Total Users</p>
        </div>
        <div className="stats-card recent">
          <div className="stats-icon">📈</div>
          <h3 className="stats-number">{stats.grievances.recent}</h3>
          <p className="stats-label">Recent Grievances (30d)</p>
        </div>
        <div className="stats-card sentiment">
          <div className="stats-icon">😊</div>
          <h3 className="stats-number">{stats.sentiment.avgSentiment.toFixed(2)}</h3>
          <p className="stats-label">Avg Sentiment Score</p>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="stats-section">
        {/* Grievance Status Distribution */}
        <div className="stats-card-full">
          <h5>📊 Grievance Status Distribution</h5>
          <div className="chart-container">
            {stats.grievances.byStatus.map((item) => (
              <div key={item._id} className="chart-item">
                <div className="chart-label">
                  <span className="status-dot" style={{ backgroundColor: getStatusColor(item._id) }}></span>
                  {item._id}
                </div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${(item.count / stats.grievances.total) * 100}%`,
                      backgroundColor: getStatusColor(item._id)
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grievance Categories */}
        <div className="stats-card-full">
          <h5>🏷️ Grievance Categories</h5>
          <div className="chart-container">
            {stats.grievances.byCategory.map((item) => (
              <div key={item._id} className="chart-item">
                <div className="chart-label">
                  <span className="category-icon">{getCategoryIcon(item._id)}</span>
                  {item._id}
                </div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${(item.count / stats.grievances.total) * 100}%`,
                      backgroundColor: '#007bff'
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="stats-card-full">
          <h5>🚨 Priority Distribution</h5>
          <div className="chart-container">
            {stats.grievances.byPriority.map((item) => (
              <div key={item._id} className="chart-item">
                <div className="chart-label">
                  <span className="priority-dot" style={{ backgroundColor: getPriorityColor(item._id) }}></span>
                  {item._id} Priority
                </div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${(item.count / stats.grievances.total) * 100}%`,
                      backgroundColor: getPriorityColor(item._id)
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles Distribution */}
        <div className="stats-card-full">
          <h5>👥 User Roles Distribution</h5>
          <div className="chart-container">
            {stats.users.byRole.map((item) => (
              <div key={item._id} className="chart-item">
                <div className="chart-label">
                  <span className="role-icon">{getRoleIcon(item._id)}</span>
                  {item._id.charAt(0).toUpperCase() + item._id.slice(1)}s
                </div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{
                      width: `${(item.count / stats.users.total) * 100}%`,
                      backgroundColor: '#28a745'
                    }}
                  ></div>
                </div>
                <div className="chart-value">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="stats-summary-card">
          <h5>📈 Recent Activity Summary (Last 30 Days)</h5>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-icon">📝</div>
              <div className="summary-content">
                <h6>{stats.grievances.recent}</h6>
                <p>New Grievances</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">👤</div>
              <div className="summary-content">
                <h6>{stats.users.recent}</h6>
                <p>New Users</p>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">😊</div>
              <div className="summary-content">
                <h6>{stats.sentiment.avgSentiment.toFixed(2)}</h6>
                <p>Avg Sentiment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
