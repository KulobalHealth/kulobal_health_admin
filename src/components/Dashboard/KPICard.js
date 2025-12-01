import React from 'react';
import './KPICard.css';

const KPICard = ({ title, value, change, showChange }) => {
  return (
    <div className="kpi-card">
      <h3 className="kpi-title">{title}</h3>
      <div className="kpi-content">
        <p className="kpi-value">{value}</p>
        {showChange && change && (
          <div className="kpi-change">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 2L10 6H7V10H5V6H2L6 2Z"
                fill="#00A170"
              />
            </svg>
            <span className="kpi-change-text">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;