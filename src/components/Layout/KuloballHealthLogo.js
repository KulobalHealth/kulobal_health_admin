import React from 'react';
import './KuloballHealthLogo.css';

const KuloballHealthLogo = ({ className = '' }) => {
  return (
    <div className={`kuloball-logo ${className}`}>
      {/* Stylized K Symbol - Two interlocking curved elements with circular cutout */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-symbol"
      >
        {/* Left curved element (top to center) */}
        <path
          d="M6 2C6 2 2 6 2 14C2 18 3 20 4 22"
          stroke="#00A170"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Left curved element (center to bottom) */}
        <path
          d="M4 22C5 24 6 26 6 28"
          stroke="#00A170"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Right curved element (top to center) */}
        <path
          d="M6 2C6 2 10 6 10 14C10 18 9 20 8 22"
          stroke="#00A170"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Right curved element (center to bottom) */}
        <path
          d="M8 22C7 24 6 26 6 28"
          stroke="#00A170"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Circular cutout in center */}
        <circle cx="6" cy="14" r="3.5" fill="#ffffff" />
        <circle cx="6" cy="14" r="3" stroke="#00A170" strokeWidth="0.5" fill="none" />
      </svg>
      
      {/* KuloballHealth Text */}
      <span className="logo-text">KuloballHealth</span>
    </div>
  );
};

export default KuloballHealthLogo;

