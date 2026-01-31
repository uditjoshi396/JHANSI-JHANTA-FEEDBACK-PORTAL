import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function FastResolution() {
  const [workflowSteps, setWorkflowSteps] = useState([
    { id: 1, name: 'Submission Received', status: 'completed', time: '2 min ago', duration: '30s' },
    { id: 2, name: 'AI Categorization', status: 'completed', time: '1 min ago', duration: '15s' },
    { id: 3, name: 'Priority Assessment', status: 'completed', time: '1 min ago', duration: '10s' },
    { id: 4, name: 'Department Assignment', status: 'in-progress', time: '30s ago', duration: '45s' },
    { id: 5, name: 'Initial Response', status: 'pending', time: 'Pending', duration: '2 min' },
    { id: 6, name: 'Resolution', status: 'pending', time: 'Pending', duration: '1-3 days' }
  ]);

  const [stats, setStats] = useState({
    avgResolutionTime: '2.3 hours',
    successRate: 94,
    activeWorkflows: 156,
    urgentCases: 12
  });

  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate workflow progression
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflowSteps(prev => prev.map(step => {
        if (step.status === 'in-progress' && Math.random() < 0.3) {
          const nextIndex = prev.findIndex(s => s.id === step.id) + 1;
          if (nextIndex < prev.length) {
            return { ...step, status: 'completed' };
          }
        }
        return step;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const simulateNewGrievance = () => {
    setIsProcessing(true);
    setWorkflowSteps(prev => prev.map(step => ({
      ...step,
      status: step.id === 1 ? 'in-progress' : 'pending',
      time: step.id === 1 ? 'Just now' : 'Pending'
    })));

    // Simulate processing
    setTimeout(() => {
      setWorkflowSteps(prev => prev.map(step => {
        if (step.id <= 3) return { ...step, status: 'completed' };
        if (step.id === 4) return { ...step, status: 'in-progress' };
        return step;
      }));
      setIsProcessing(false);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#ffc107';
      case 'pending': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <Navigation variant="default" />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="section-header">
          <h1>⚡ Fast Resolution</h1>
          <p className="section-subtitle">
            Experience lightning-fast grievance processing with our automated workflow system.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="feature-card" style={{ textAlign: 'center' }}>
            <h3>🕐 Avg Resolution</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{stats.avgResolutionTime}</div>
          </div>
          <div className="feature-card" style={{ textAlign: 'center' }}>
            <h3>📊 Success Rate</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.successRate}%</div>
          </div>
          <div className="feature-card" style={{ textAlign: 'center' }}>
            <h3>🔄 Active Workflows</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.activeWorkflows}</div>
          </div>
          <div className="feature-card" style={{ textAlign: 'center' }}>
            <h3>🚨 Urgent Cases</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>{stats.urgentCases}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Priority Selection & Demo */}
          <div className="feature-card">
            <h3>🎯 Priority Selection</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Priority Level:</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>

              <div style={{
                padding: '0.75rem',
                backgroundColor: getPriorityColor(selectedPriority),
                color: 'white',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {selectedPriority.toUpperCase()} PRIORITY
              </div>
            </div>

            <button
              onClick={simulateNewGrievance}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isProcessing ? '#6c757d' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isProcessing ? 'Processing...' : 'Simulate New Grievance'}
            </button>

            <div>
              <h4>⚡ Fast Track Benefits</h4>
              <ul style={{ fontSize: '0.8rem' }}>
                <li>Urgent:  1 hour response</li>
                <li>High:  4 hours response</li>
                <li>Medium:  24 hours response</li>
                <li>Low:  48 hours response</li>
              </ul>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div>
            <div className="feature-card">
              <h3>🔄 Live Workflow Demo</h3>

              <div style={{ position: 'relative' }}>
                {workflowSteps.map((step, index) => (
                  <div key={step.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    position: 'relative'
                  }}>
                    {/* Timeline line */}
                    {index < workflowSteps.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '40px',
                        width: '3px',
                        height: '50px',
                        backgroundColor: step.status === 'completed' ? '#28a745' : '#e9ecef',
                        zIndex: 1
                      }}></div>
                    )}

                    {/* Timeline dot */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(step.status),
                      border: `4px solid ${getStatusColor(step.status)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      zIndex: 2,
                      position: 'relative',
                      animation: step.status === 'in-progress' ? 'pulse 2s infinite' : 'none'
                    }}>
                      {getStatusIcon(step.status)}
                    </div>

                    {/* Timeline content */}
                    <div style={{ marginLeft: '1rem', flex: 1 }}>
                      <div style={{
                        fontWeight: step.status === 'completed' ? 'bold' : 'normal',
                        color: step.status === 'completed' ? '#28a745' :
                               step.status === 'in-progress' ? '#ffc107' : '#666'
                      }}>
                        {step.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>
                        {step.time} • Est. {step.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>🚀 Automation Features</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>🤖</div>
                  <h4>AI Routing</h4>
                  <p>Smart assignment</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>⚡</div>
                  <h4>Auto Escalation</h4>
                  <p>SLA enforcement</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>📊</div>
                  <h4>Progress Tracking</h4>
                  <p>Real-time updates</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>🎯</div>
                  <h4>Priority Queue</h4>
                  <p>Fast-track urgent cases</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">Experience Fast Resolution</Link>
        </div>
      </div>
    </div>
  );
}
