import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function RealTimeTracking() {
  const [mockGrievances, setMockGrievances] = useState([
    {
      id: 1,
      title: "Street Light Not Working",
      status: "Pending",
      submittedDate: "2024-01-15",
      lastUpdate: "2 hours ago",
      progress: 25,
      timeline: [
        { status: "Submitted", date: "2024-01-15 10:30 AM", completed: true },
        { status: "Under Review", date: "2024-01-15 11:00 AM", completed: true },
        { status: "Assigned to Department", date: "Pending", completed: false },
        { status: "Resolution", date: "Pending", completed: false }
      ]
    },
    {
      id: 2,
      title: "Pothole on Main Road",
      status: "Assigned",
      submittedDate: "2024-01-10",
      lastUpdate: "1 day ago",
      progress: 60,
      timeline: [
        { status: "Submitted", date: "2024-01-10 09:15 AM", completed: true },
        { status: "Under Review", date: "2024-01-10 10:30 AM", completed: true },
        { status: "Assigned to Department", date: "2024-01-11 02:00 PM", completed: true },
        { status: "Resolution", date: "In Progress", completed: false }
      ]
    },
    {
      id: 3,
      title: "Water Supply Issue",
      status: "Resolved",
      submittedDate: "2024-01-05",
      lastUpdate: "3 days ago",
      progress: 100,
      timeline: [
        { status: "Submitted", date: "2024-01-05 08:45 AM", completed: true },
        { status: "Under Review", date: "2024-01-05 09:30 AM", completed: true },
        { status: "Assigned to Department", date: "2024-01-06 11:15 AM", completed: true },
        { status: "Resolution", date: "2024-01-08 04:20 PM", completed: true }
      ]
    }
  ]);

  const [selectedGrievance, setSelectedGrievance] = useState(mockGrievances[0]);
  const [notifications, setNotifications] = useState([]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update progress or status
      setMockGrievances(prev => prev.map(grievance => {
        if (Math.random() < 0.1 && grievance.progress < 100) { // 10% chance every 5 seconds
          const newProgress = Math.min(grievance.progress + Math.floor(Math.random() * 10), 100);
          const newStatus = newProgress === 100 ? "Resolved" :
                           newProgress > 50 ? "Assigned" : "Pending";

          // Add notification
          if (newProgress !== grievance.progress) {
            setNotifications(prev => [...prev.slice(-4), {
              id: Date.now(),
              message: `Progress update on "${grievance.title}"`,
              time: new Date().toLocaleTimeString()
            }]);
          }

          return {
            ...grievance,
            progress: newProgress,
            status: newStatus,
            lastUpdate: "Just now"
          };
        }
        return grievance;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffc107';
      case 'Assigned': return '#17a2b8';
      case 'Resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Assigned': return '👷';
      case 'Resolved': return '✅';
      default: return '📋';
    }
  };

  return (
    <div>
      <Navigation variant="default" />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="section-header">
          <h1>📊 Real-Time Tracking</h1>
          <p className="section-subtitle">
            Experience live updates and detailed progress tracking for your grievances.
          </p>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="feature-card" style={{ marginBottom: '2rem', backgroundColor: '#e8f5e8', border: '1px solid #28a745' }}>
            <h3>🔔 Recent Updates</h3>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {notifications.map(notification => (
                <div key={notification.id} style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  <small style={{ color: '#28a745' }}>
                    {notification.time}: {notification.message}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Grievance List */}
          <div className="feature-card">
            <h3>Your Grievances</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mockGrievances.map(grievance => (
                <div
                  key={grievance.id}
                  onClick={() => setSelectedGrievance(grievance)}
                  style={{
                    padding: '1rem',
                    border: selectedGrievance.id === grievance.id ? '2px solid #667eea' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedGrievance.id === grievance.id ? '#f8f9ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{grievance.title}</h4>
                    <span style={{
                      color: getStatusColor(grievance.status),
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {getStatusIcon(grievance.status)} {grievance.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Submitted: {grievance.submittedDate} • Updated: {grievance.lastUpdate}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${grievance.progress}%`,
                        height: '100%',
                        backgroundColor: getStatusColor(grievance.status),
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <small style={{ color: '#666' }}>{grievance.progress}% Complete</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Timeline */}
          <div>
            <div className="feature-card">
              <h3>📈 Progress Timeline</h3>
              <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>{selectedGrievance.title}</h4>

              <div style={{ position: 'relative' }}>
                {selectedGrievance.timeline.map((step, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    position: 'relative'
                  }}>
                    {/* Timeline line */}
                    {index < selectedGrievance.timeline.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '15px',
                        top: '30px',
                        width: '2px',
                        height: '40px',
                        backgroundColor: step.completed ? '#28a745' : '#e9ecef',
                        zIndex: 1
                      }}></div>
                    )}

                    {/* Timeline dot */}
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: step.completed ? '#28a745' : '#e9ecef',
                      border: `3px solid ${step.completed ? '#28a745' : '#dee2e6'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      zIndex: 2,
                      position: 'relative'
                    }}>
                      {step.completed ? '✓' : index + 1}
                    </div>

                    {/* Timeline content */}
                    <div style={{ marginLeft: '1rem', flex: 1 }}>
                      <div style={{
                        fontWeight: step.completed ? 'bold' : 'normal',
                        color: step.completed ? '#28a745' : '#666'
                      }}>
                        {step.status}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        {step.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>⚡ Live Features</h3>
              <ul>
                <li>🔄 Real-time status updates</li>
                <li>📱 Push notifications</li>
                <li>📊 Visual progress tracking</li>
                <li>📅 Detailed timeline view</li>
                <li>🎯 Department assignment tracking</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">Start Real-Time Tracking</Link>
        </div>
      </div>
    </div>
  );
}
