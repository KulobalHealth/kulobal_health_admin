import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiXMark, HiUser, HiMagnifyingGlass } from 'react-icons/hi2';
import { logout, getCurrentUser } from '../../utils/authService';
import { getOrders } from '../../utils/ordersService';
import logoImage from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [userEmail, setUserEmail] = useState('Admin user');

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  // Get user email on component mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // Try different possible email field names
      const email = user.email || user.adminEmail || user.userEmail || user.emailAddress || user.email_address;
      if (email) {
        setUserEmail(email);
      }
    }
  }, []);

  // Fetch pending orders and convert to notifications
  const fetchPendingOrders = async () => {
    try {
      setLoadingNotifications(true);
      const response = await getOrders();
      
      // Extract orders array from response
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      }

      // Filter for pending orders
      const pendingOrders = ordersData.filter((order) => {
        const status = order.status || order.orderStatus || '';
        return status.toUpperCase() === 'PENDING' || status === 'Pending';
      });

      // Convert pending orders to notifications
      const orderNotifications = pendingOrders.map((order) => {
        const orderId = order.orderId || order.id || order._id || 'N/A';
        const pharmacyName = order.pharmacyName || 
                           order.pharmacy?.name || 
                           order.pharmacy?.pharmacyName || 
                           'Unknown Pharmacy';
        const amount = order.amount || order.total || order.totalAmount || '0.00';
        const orderDate = order.orderDate || order.createdAt || order.date || new Date().toISOString();

        return {
          id: `order-${orderId}`,
          title: 'New Pending Order',
          message: `Order ${orderId} from ${pharmacyName} - GHS ${amount}`,
          time: getTimeAgo(orderDate),
          read: false,
          type: 'order',
          orderId: orderId,
          orderData: order,
        };
      });

      setNotifications(orderNotifications);
      console.log('📬 Fetched pending orders:', pendingOrders.length, 'notifications created');
    } catch (error) {
      console.error('❌ Error fetching pending orders for notifications:', error);
      // Don't show error to user, just log it
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch pending orders on mount and set up periodic refresh
  useEffect(() => {
    // Fetch immediately
    fetchPendingOrders();

    // Refresh every 30 seconds to get new pending orders
    const interval = setInterval(() => {
      fetchPendingOrders();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleNotificationClick = (notification) => {
    // Mark as read
    handleMarkAsRead(notification.id);
    
    // Navigate to orders page
    if (notification.type === 'order') {
      navigate('/orders');
      setShowNotifications(false);
    }
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
                  {loadingNotifications ? (
                    <div className="no-notifications">
                      <p>Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>No pending orders</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
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
                    <button 
                      className="view-all-button"
                      onClick={() => {
                        navigate('/orders');
                        setShowNotifications(false);
                      }}
                    >
                      View All Orders
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="search-container">
          <HiMagnifyingGlass className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
        </div>
        <button className="add-user-button" aria-label="Add user">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 12C4 12 5.5 6 12 6C18.5 6 20 12 20 12C20 12 18.5 18 12 18C5.5 18 4 12 4 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M12 9V15M9 12H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Sync Data</span>
        </button>
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
            <HiUser className="user-icon" />
            <span className="user-name">{userEmail}</span>
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