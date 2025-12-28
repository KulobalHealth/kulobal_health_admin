import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  UserGroup02Icon,
  Building01Icon,
  ShoppingCart01Icon,
  TruckIcon,
  Package01Icon,
  CreditCardIcon,
  Chart01Icon,
  Settings01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { logout } from '../../utils/authService';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout to clear server-side cookie and local storage
      await logout();
      // Navigate to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout endpoint fails
      navigate('/');
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home01Icon },
    { path: '/patients-care', label: 'Care Data', icon: UserGroup02Icon },
    { path: '/pharmacies', label: 'Pharmacies', icon: Building01Icon },
    { path: '/orders', label: 'Orders', icon: ShoppingCart01Icon },
    { path: '/suppliers', label: 'Suppliers', icon: TruckIcon },
    { path: '/products', label: 'Products', icon: Package01Icon },
    { path: '/transactions', label: 'Transactions', icon: CreditCardIcon },
    { path: '/analytics', label: 'Analytics', icon: Chart01Icon },
    { path: '/settings', label: 'Settings', icon: Settings01Icon },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">
                <HugeiconsIcon icon={item.icon} size={22} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-logout-button" onClick={handleLogout}>
          <span className="sidebar-icon">
            <HugeiconsIcon icon={Logout01Icon} size={22} />
          </span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;