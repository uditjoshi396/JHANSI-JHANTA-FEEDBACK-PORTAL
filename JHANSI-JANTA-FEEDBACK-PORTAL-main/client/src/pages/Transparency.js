import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Transparency.css';

function Transparency() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    type: 'my-activities', // my-activities, all, by-role, by-action
    role: 'user',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState(null);
  const [grievanceTrail, setGrievanceTrail] = useState(null);
  const [grievanceId, setGrievanceId] = useState('');
  const [activeTab, setActiveTab] = useState('activities'); // activities, stats, grievance-trail

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/transparency/my-activities';
      const params = new URLSearchParams();

      switch (filter.type) {
        case 'all':
          url = 'http://localhost:5000/api/transparency/all';
          if (filter.action) params.append('action', filter.action);
          if (filter.role) params.append('role', filter.role);
          if (filter.startDate) params.append('startDate', filter.startDate);
          if (filter.endDate) params.append('endDate', filter.endDate);
          break;
        case 'by-role':
          url = `http://localhost:5000/api/transparency/role/${filter.role}`;
          if (filter.action) params.append('action', filter.action);
          break;
        case 'by-action':
          url = `http://localhost:5000/api/transparency/by-action/${filter.action}`;
          break;
        default:
          break;
      }

      const queryString = params.toString();
      const finalUrl = queryString ? `${url}?${queryString}` : url;

      const response = await axios.get(finalUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      alert('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await axios.get(
        `http://localhost:5000/api/transparency/stats/dashboard?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrievanceTrail = async () => {
    if (!grievanceId) {
      alert('Please enter a grievance ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/transparency/grievance/${grievanceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGrievanceTrail(response.data.trail);
    } catch (error) {
      console.error('Error fetching grievance trail:', error);
      alert('Grievance not found or error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activities') {
      fetchActivities();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [filter, activeTab]);

  const getActionBadgeColor = (action) => {
    const colors = {
      'LOGIN': '#4CAF50',
      'LOGOUT': '#FF9800',
      'GRIEVANCE_SUBMITTED': '#2196F3',
      'GRIEVANCE_ASSIGNED': '#FF6B6B',
      'GRIEVANCE_RESOLVED': '#4CAF50',
      'STATUS_CHANGED': '#9C27B0',
      'COMMENT_ADDED': '#00BCD4',
      'GRIEVANCE_CLOSED': '#FF5722',
      'REGISTER': '#2196F3'
    };
    return colors[action] || '#666';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'user': '#3F51B5',
      'admin': '#F44336',
      'officer': '#FF9800'
    };
    return colors[role] || '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="transparency-container">
      <div className="transparency-header">
        <h1>Transparency & Audit Log</h1>
        <p>Monitor all activities between users, admins, and government officers</p>
      </div>

      {/* Tabs */}
      <div className="transparency-tabs">
        <button
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          📋 Activities
        </button>
        {user.role === 'admin' && (
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
        )}
        <button
          className={`tab-btn ${activeTab === 'grievance-trail' ? 'active' : ''}`}
          onClick={() => setActiveTab('grievance-trail')}
        >
          🔍 Grievance Trail
        </button>
      </div>

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="transparency-section">
          <div className="filter-section">
            <div className="filter-group">
              <label>View Type:</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="my-activities">My Activities</option>
                {user.role === 'admin' && <option value="all">All Activities</option>}
                {user.role === 'admin' && <option value="by-role">By Role</option>}
                {user.role === 'admin' && <option value="by-action">By Action</option>}
              </select>
            </div>

            {(filter.type === 'all' || filter.type === 'by-role') && (
              <div className="filter-group">
                <label>Role:</label>
                <select
                  value={filter.role}
                  onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="officer">Officer</option>
                </select>
              </div>
            )}

            {filter.type === 'all' && (
              <div className="filter-group">
                <label>Action:</label>
                <select
                  value={filter.action}
                  onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                >
                  <option value="">All Actions</option>
                  <option value="LOGIN">Login</option>
                  <option value="GRIEVANCE_SUBMITTED">Grievance Submitted</option>
                  <option value="GRIEVANCE_ASSIGNED">Grievance Assigned</option>
                  <option value="STATUS_CHANGED">Status Changed</option>
                  <option value="GRIEVANCE_RESOLVED">Grievance Resolved</option>
                </select>
              </div>
            )}

            {filter.type === 'all' && (
              <>
                <div className="filter-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={filter.startDate}
                    onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                  />
                </div>
                <div className="filter-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={filter.endDate}
                    onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                  />
                </div>
              </>
            )}

            <button className="refresh-btn" onClick={fetchActivities} disabled={loading}>
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          <div className="activities-list">
            {loading ? (
              <div className="loading">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="no-data">No activities found</div>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="activity-card">
                  <div className="activity-header">
                    <div className="activity-action">
                      <span
                        className="action-badge"
                        style={{ backgroundColor: getActionBadgeColor(activity.action) }}
                      >
                        {activity.action}
                      </span>
                    </div>
                    <div className="activity-time">{formatDate(activity.timestamp)}</div>
                  </div>

                  <div className="activity-body">
                    <div className="actor">
                      <strong>By:</strong>
                      <span className="name">{activity.performedBy.name}</span>
                      <span
                        className="role-badge"
                        style={{ backgroundColor: getRoleBadgeColor(activity.performedBy.role) }}
                      >
                        {activity.performedBy.role}
                      </span>
                    </div>

                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="details">
                        <strong>Details:</strong>
                        <ul>
                          {Object.entries(activity.details).map(([key, value]) => (
                            <li key={key}>
                              <em>{key}:</em> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activity.notes && (
                      <div className="notes">
                        <strong>Notes:</strong> {activity.notes}
                      </div>
                    )}
                  </div>

                  <div className="activity-footer">
                    <span className="visibility-badge">{activity.visibility}</span>
                    <span className="severity-badge" style={{
                      color: activity.severity === 'critical' ? '#F44336' : activity.severity === 'warning' ? '#FF9800' : '#4CAF50'
                    }}>
                      {activity.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && user.role === 'admin' && (
        <div className="transparency-section">
          <div className="filter-section">
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              />
            </div>
            <button className="refresh-btn" onClick={fetchStats} disabled={loading}>
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Activities</h3>
                <p className="stat-value">{stats.totalActivities}</p>
              </div>

              <div className="stat-card">
                <h3>By Role</h3>
                <ul>
                  {stats.byRole.map((item) => (
                    <li key={item._id}>
                      <span className="role-name">{item._id || 'Unknown'}:</span>
                      <span className="stat-value">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="stat-card">
                <h3>Top Actions</h3>
                <ul>
                  {stats.byAction.slice(0, 5).map((item) => (
                    <li key={item._id}>
                      <span className="action-name">{item._id}:</span>
                      <span className="stat-value">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="stat-card">
                <h3>Top Active Users</h3>
                <ul>
                  {stats.topUsers.slice(0, 5).map((item, idx) => (
                    <li key={idx}>
                      <span className="user-name">{item.user.name}:</span>
                      <span className="stat-value">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {stats.criticalActivities && stats.criticalActivities.length > 0 && (
                <div className="stat-card critical">
                  <h3>🚨 Critical Activities</h3>
                  <ul>
                    {stats.criticalActivities.slice(0, 5).map((item) => (
                      <li key={item._id}>
                        <span className="action-name">{item.action}</span>
                        <span className="time">{formatDate(item.timestamp)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grievance Trail Tab */}
      {activeTab === 'grievance-trail' && (
        <div className="transparency-section">
          <div className="grievance-input-section">
            <input
              type="text"
              placeholder="Enter Grievance ID"
              value={grievanceId}
              onChange={(e) => setGrievanceId(e.target.value)}
              className="grievance-input"
            />
            <button
              className="search-btn"
              onClick={fetchGrievanceTrail}
              disabled={loading}
            >
              {loading ? '🔄 Searching...' : '🔍 Search'}
            </button>
          </div>

          {grievanceTrail && (
            <div className="grievance-trail">
              <h3>Activity Trail for Grievance: {grievanceId}</h3>
              <div className="timeline">
                {grievanceTrail.map((activity, index) => (
                  <div key={activity._id} className="timeline-item">
                    <div className="timeline-marker">{index + 1}</div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span
                          className="action-badge"
                          style={{ backgroundColor: getActionBadgeColor(activity.action) }}
                        >
                          {activity.action}
                        </span>
                        <span className="time">{formatDate(activity.timestamp)}</span>
                      </div>
                      <div className="timeline-body">
                        <p>
                          <strong>{activity.performedBy.name}</strong> ({activity.performedBy.role})
                        </p>
                        {activity.details && (
                          <div className="details-list">
                            {Object.entries(activity.details).map(([key, value]) => (
                              value && (
                                <p key={key}>
                                  <em>{key}:</em> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </p>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Transparency;
