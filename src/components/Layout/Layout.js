import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/authService';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  // Protect routes - redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="layout-container">
      <Header />
      <div className="layout-main">
        <Sidebar />
        <main className="layout-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;