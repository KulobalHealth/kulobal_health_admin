import React, { useState } from 'react';
import './DaterRangerFilter.css';

const DateRangeFilter = ({ selectedRange, onRangeChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateRanges = [
    { value: '12 months', label: '12 months' },
    { value: '30 days', label: '30 days' },
    { value: '7 days', label: '7 days' },
    { value: '24 hours', label: '24 hours' },
  ];

  return (
    <div className="date-filter-container">
      <div className="date-range-tabs">
        {dateRanges.map((range) => (
          <button
            key={range.value}
            className={`date-range-tab ${
              selectedRange === range.value ? 'active' : ''
            }`}
            onClick={() => onRangeChange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>
      <button
        className="date-picker-button"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 2V6M14 2V6M3 10H17M5 4H15C16.1046 4 17 4.89543 17 6V16C17 17.1046 16.1046 18 15 18H5C3.89543 18 3 17.1046 3 16V6C3 4.89543 3.89543 4 5 4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Select Dates</span>
      </button>
    </div>
  );
};

export default DateRangeFilter;