import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          &copy; {currentYear} Property of Data Leap Technologies Ltd. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <span className="separator">•</span>
          <a href="#">Terms of Service</a>
          <span className="separator">•</span>
          <a href="#">Audits</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
