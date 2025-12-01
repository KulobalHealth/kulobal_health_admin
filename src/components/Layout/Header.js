import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiCheck, HiXMark } from 'react-icons/hi2';
import { logout } from '../../utils/authService';
import logoImage from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Order Received',
      message: 'Order #ORD-1234 has been placed by Pharmacy ABC',
      time: '2 minutes ago',
      read: false,
      type: 'order',
    },
    {
      id: 2,
      title: 'Payment Received',
      message: 'Payment of GHS 5,000 received from Supplier XYZ',
      time: '15 minutes ago',
      read: false,
      type: 'payment',
    },
    {
      id: 3,
      title: 'Low Stock Alert',
      message: 'Malaria Test Kit stock is running low (50 units remaining)',
      time: '1 hour ago',
      read: false,
      type: 'alert',
    },
    {
      id: 4,
      title: 'New Supplier Registered',
      message: 'Supplier Company has been registered successfully',
      time: '2 hours ago',
      read: true,
      type: 'info',
    },
    {
      id: 5,
      title: 'Order Delivered',
      message: 'Order #ORD-1230 has been delivered successfully',
      time: '3 hours ago',
      read: true,
      type: 'success',
    },
  ]);

  // Simulate real-time notifications (add new notification every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        title: 'New Notification',
        message: `This is a real-time notification at ${new Date().toLocaleTimeString()}`,
        time: 'Just now',
        read: false,
        type: 'info',
      };
      setNotifications((prev) => [newNotification, ...prev]);
    }, 30000); // Add notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !event.target.closest('.notification-button-wrapper')
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

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

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src={logoImage} alt="KuloballHealth Logo" className="logo-image" />
        </div>
      </div>
      <div className="header-right">
        {/* Notifications */}
        <div className="notification-button-wrapper">
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <>
              <div
                className="notifications-overlay"
                onClick={() => setShowNotifications(false)}
              />
              <div className="notifications-dropdown" ref={notificationsRef}>
                <div className="notifications-header">
                  <h3 className="notifications-title">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-button"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="notification-content">
                          <div className="notification-header-item">
                            <h4 className="notification-item-title">{notification.title}</h4>
                            <button
                              className="notification-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              aria-label="Delete notification"
                            >
                              <HiXMark />
                            </button>
                          </div>
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        {!notification.read && <div className="notification-dot" />}
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="notifications-footer">
                    <button className="view-all-button">View All Notifications</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <button className="icon-button" aria-label="Dark mode">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="user-menu">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="user-name">Admin user</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <button className="dropdown-item">Profile</button>
              <button className="dropdown-item">Settings</button>
              <button className="dropdown-item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;