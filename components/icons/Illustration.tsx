import React from 'react';

export const Illustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 512 341.33" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#334155', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect width="512" height="341.33" rx="20" ry="20" fill="url(#grad2)" />
    
    {/* Robot */}
    <g transform="translate(80, 100)">
      <rect x="0" y="50" width="80" height="90" rx="10" ry="10" fill="#475569" />
      <rect x="15" y="0" width="50" height="60" rx="25" ry="25" fill="#475569" />
      <circle cx="40" cy="25" r="15" fill="url(#grad1)" />
      <circle cx="30" cy="25" r="3" fill="#f8fafc" />
      <rect x="35" y="100" width="10" height="30" fill="#334155" />
      <rect x="-10" y="60" width="10" height="40" rx="5" ry="5" fill="#334155" />
      <rect x="80" y="60" width="10" height="40" rx="5" ry="5" fill="#334155" />
    </g>

    {/* Human */}
    <g transform="translate(350, 110)">
        <circle cx="40" cy="20" r="20" fill="#64748b" />
        <path d="M 0 100 C 0 60, 80 60, 80 100 Z" fill="#64748b" />
    </g>
    
    {/* Chat bubbles */}
    <g transform="translate(180, 80)">
      <path d="M10,0 C4.477,0 0,4.477 0,10 L0,30 C0,35.523 4.477,40 10,40 L60,40 C65.523,40 70,35.523 70,30 L70,10 C70,4.477 65.523,0 60,0 Z M 15 50 L 25 40 L 35 50 Z" fill="#0f172a" stroke="url(#grad1)" strokeWidth="2"/>
      <text x="35" y="25" fontFamily="Inter, sans-serif" fontSize="12" fill="#e2e8f0" textAnchor="middle">Hello!</text>
    </g>

    <g transform="translate(260, 150)">
      <path d="M60,0 C65.523,0 70,4.477 70,10 L70,30 C70,35.523 65.523,40 60,40 L10,40 C4.477,40 0,35.523 0,30 L0,10 C0,4.477 4.477,0 10,0 Z M 55 50 L 45 40 L 35 50 Z" fill="#0f172a" stroke="#64748b" strokeWidth="2"/>
       <text x="35" y="25" fontFamily="Inter, sans-serif" fontSize="12" fill="#e2e8f0" textAnchor="middle">I'm ready...</text>
    </g>
  </svg>
);
