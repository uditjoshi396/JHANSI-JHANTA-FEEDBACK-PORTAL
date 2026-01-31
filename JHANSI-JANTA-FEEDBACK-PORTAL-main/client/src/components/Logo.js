import React from 'react';

const Logo = ({ className = '' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 280 60"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '280px', height: '60px' }}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="fortGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF6B35', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#F7931E', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFD23F', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="jhansiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#FF9933', stopOpacity: 1 }} />
          <stop offset="33%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
          <stop offset="66%" style={{ stopColor: '#128807', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#000080', stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#FFD23F', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#FF6B35', stopOpacity: 0.2 }} />
        </radialGradient>
      </defs>

      {/* Jhansi Fort silhouette with interactive glow */}
      <g className="fort-group">
        {/* Main fort structure */}
        <path
          d="M10 35 L10 45 L15 50 L20 45 L20 35 L25 30 L30 35 L30 45 L35 50 L40 45 L40 35 L45 30 L50 35 L50 45 L55 50 L60 45 L60 35 Z"
          fill="url(#fortGradient)"
          stroke="#8B4513"
          strokeWidth="1"
        />

        {/* Fort towers */}
        <rect x="12" y="25" width="6" height="15" rx="1" fill="url(#fortGradient)" stroke="#8B4513" />
        <rect x="22" y="20" width="6" height="20" rx="1" fill="url(#fortGradient)" stroke="#8B4513" />
        <rect x="32" y="25" width="6" height="15" rx="1" fill="url(#fortGradient)" stroke="#8B4513" />
        <rect x="42" y="20" width="6" height="20" rx="1" fill="url(#fortGradient)" stroke="#8B4513" />
        <rect x="52" y="25" width="6" height="15" rx="1" fill="url(#fortGradient)" stroke="#8B4513" />

        {/* Battlements on towers */}
        <rect x="13" y="22" width="2" height="3" fill="#654321" />
        <rect x="16" y="22" width="2" height="3" fill="#654321" />
        <rect x="23" y="17" width="2" height="3" fill="#654321" />
        <rect x="26" y="17" width="2" height="3" fill="#654321" />
        <rect x="33" y="22" width="2" height="3" fill="#654321" />
        <rect x="36" y="22" width="2" height="3" fill="#654321" />
        <rect x="43" y="17" width="2" height="3" fill="#654321" />
        <rect x="46" y="17" width="2" height="3" fill="#654321" />
        <rect x="53" y="22" width="2" height="3" fill="#654321" />
        <rect x="56" y="22" width="2" height="3" fill="#654321" />

        {/* Flag on central tower */}
        <rect x="24" y="15" width="1" height="5" fill="#8B4513" />
        <polygon points="24,15 28,17 24,19" fill="#FF0000" className="flag-wave" />
      </g>

      {/* Speech bubbles representing citizen feedback */}
      <g className="speech-bubbles">
        {/* Left bubble */}
        <ellipse cx="75" cy="20" rx="8" ry="5" fill="#E3F2FD" stroke="#2196F3" strokeWidth="1" />
        <text x="75" y="23" textAnchor="middle" fontSize="6" fill="#1976D2">सुनो</text>

        {/* Right bubble */}
        <ellipse cx="85" cy="25" rx="10" ry="6" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1" />
        <text x="85" y="28" textAnchor="middle" fontSize="7" fill="#E65100">Feedback</text>

        {/* Bottom bubble */}
        <ellipse cx="80" cy="35" rx="12" ry="7" fill="#E8F5E8" stroke="#4CAF50" strokeWidth="1" />
        <text x="80" y="38" textAnchor="middle" fontSize="8" fill="#2E7D32">सुझाव</text>
      </g>

      {/* Connecting lines with animation */}
      <line x1="30" y1="35" x2="75" y2="20" stroke="#FF6B35" strokeWidth="2" className="connecting-line" />
      <line x1="30" y1="35" x2="85" y2="25" stroke="#F7931E" strokeWidth="2" className="connecting-line" />
      <line x1="30" y1="35" x2="80" y2="35" stroke="#FFD23F" strokeWidth="2" className="connecting-line" />

      {/* Text */}
      <text x="110" y="20" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="url(#jhansiGradient)">
        JHANSI
      </text>
      <text x="110" y="35" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#FF6B35">
        JANATA
      </text>
      <text x="110" y="48" fontFamily="Arial, sans-serif" fontSize="10" fill="#666">
        FEEDBACK PORTAL
      </text>

      {/* Interactive elements - pulsing dots */}
      <circle cx="250" cy="15" r="3" fill="#FF6B35" className="pulse-dot" />
      <circle cx="265" cy="20" r="2.5" fill="#F7931E" className="pulse-dot" />
      <circle cx="255" cy="30" r="3.5" fill="#FFD23F" className="pulse-dot" />
      <circle cx="270" cy="35" r="2" fill="#FF6B35" className="pulse-dot" />

      {/* Glow effect on hover */}
      <rect x="0" y="0" width="280" height="60" fill="url(#glowGradient)" opacity="0" className="logo-glow" />
    </svg>
  );
};

export default Logo;
