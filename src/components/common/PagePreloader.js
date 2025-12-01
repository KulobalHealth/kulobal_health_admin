import React from 'react';
import './PagePreloader.css';

const PagePreloader = ({ message = 'Loading...' }) => {
  return (
    <div className="page-preloader">
      <div className="preloader-spinner">
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      <p className="preloader-message">{message}</p>
    </div>
  );
};

export default PagePreloader;

