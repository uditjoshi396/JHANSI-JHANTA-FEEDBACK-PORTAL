import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

export default function MobileOptimized() {
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('landscape');
  const [touchEvents, setTouchEvents] = useState([]);
  const [isResponsive, setIsResponsive] = useState(true);

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
      } else if (width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateDeviceType();
    updateOrientation();

    window.addEventListener('resize', updateDeviceType);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  const handleTouchStart = (e) => {
    setTouchEvents(prev => [...prev.slice(-4), {
      type: 'touchstart',
      touches: e.touches.length,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const handleTouchEnd = (e) => {
    setTouchEvents(prev => [...prev.slice(-4), {
      type: 'touchend',
      touches: e.changedTouches.length,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      default: return '💻';
    }
  };

  const getResponsiveScore = () => {
    let score = 100;
    if (deviceType === 'mobile' && orientation === 'portrait') score = 95;
    if (deviceType === 'tablet') score = 98;
    return score;
  };

  return (
    <div>
      <Navigation variant="default" />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="section-header">
          <h1>📱 Mobile Optimized</h1>
          <p className="section-subtitle">
            Experience our fully responsive design that adapts perfectly to any device and screen size.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Device Detection */}
          <div className="feature-card">
            <h3>📊 Device Detection</h3>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Current Device</h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <span style={{ fontSize: '2rem' }}>{getDeviceIcon()}</span>
                <div>
                  <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {deviceType}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {orientation} • {window.innerWidth}x{window.innerHeight}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4>Responsive Score</h4>
              <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e9ecef',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  width: `${getResponsiveScore()}%`,
                  height: '100%',
                  backgroundColor: '#28a745',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#28a745' }}>
                {getResponsiveScore()}% Optimized
              </div>
            </div>
          </div>

          {/* Interactive Demo */}
          <div>
            <div className="feature-card">
              <h3>🎮 Touch Interaction Demo</h3>

              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  height: '200px',
                  border: '2px dashed #667eea',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9ff',
                  marginBottom: '1rem',
                  touchAction: 'none'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👆</div>
                  <div style={{ fontWeight: 'bold' }}>Touch Here!</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    Try tapping, swiping, or multi-touch gestures
                  </div>
                </div>
              </div>

              <div>
                <h4>Touch Events Log</h4>
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  {touchEvents.length === 0 ? (
                    <div style={{ color: '#666', textAlign: 'center' }}>
                      No touch events yet. Try interacting above!
                    </div>
                  ) : (
                    touchEvents.map((event, index) => (
                      <div key={index} style={{ marginBottom: '0.25rem' }}>
                        <span style={{ color: '#667eea' }}>{event.time}</span> -
                        <span style={{ color: event.type === 'touchstart' ? '#28a745' : '#dc3545' }}>
                          {' '}{event.type}
                        </span>
                        {' '}({event.touches} touch{event.touches !== 1 ? 'es' : ''})
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>📱 Mobile Features</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>👆</div>
                  <h4>Touch Optimized</h4>
                  <p>Large touch targets</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>📐</div>
                  <h4>Responsive Layout</h4>
                  <p>Adapts to any screen</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>🎙️</div>
                  <h4>Voice Input</h4>
                  <p>Speech-to-text support</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem' }}>⚡</div>
                  <h4>Fast Loading</h4>
                  <p>Optimized performance</p>
                </div>
              </div>
            </div>

            <div className="feature-card" style={{ marginTop: '1rem' }}>
              <h3>🔧 Technical Specs</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4>Breakpoints</h4>
                  <ul style={{ fontSize: '0.8rem' }}>
                    <li>Mobile: ≤768px</li>
                    <li>Tablet: 769-1024px</li>
                    <li>Desktop: 1024px</li>
                  </ul>
                </div>
                <div>
                  <h4>Features</h4>
                  <ul style={{ fontSize: '0.8rem' }}>
                    <li>CSS Grid & Flexbox</li>
                    <li>Media Queries</li>
                    <li>Touch Events</li>
                    <li>Orientation Detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/register" className="btn btn-primary">Experience Mobile Optimization</Link>
        </div>
      </div>
    </div>
  );
}
