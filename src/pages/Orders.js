import React, { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiEye, HiPencil } from 'react-icons/hi2';
import { FaShoppingBag } from 'react-icons/fa';
import OrderDetails from '../components/Orders/OrderDetails';
import './Orders.css';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Select Status');
  const [selectedDate, setSelectedDate] = useState('Select Dates');
  const [itemsPerPage, setItemsPerPage] = useState('10 per page');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample orders data - all orders
  const allOrders = [
    {
      id: '#57578558686',
      productName: 'Malaria Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'Delivered',
      statusColor: 'green',
    },
    {
      id: '#57578558687',
      productName: 'HIV Test Kits',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Credit',
      paymentStatusColor: 'orange',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'New Order',
      statusColor: 'grey',
    },
    // ... rest of the orders array remains the same
    {
      id: '#57578558688',
      productName: 'Hypertension Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'In Transit',
      statusColor: 'blue',
    },
    {
      id: '#57578558689',
      productName: 'Malaria Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'Cancelled',
      statusColor: 'red',
    },
    {
      id: '#57578558690',
      productName: 'HIV Test Kits',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Credit',
      paymentStatusColor: 'orange',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'Confirmed',
      statusColor: 'yellow',
    },
    {
      id: '#57578558691',
      productName: 'Malaria Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'Delivered',
      statusColor: 'green',
    },
    {
      id: '#57578558692',
      productName: 'Hypertension Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'New Order',
      statusColor: 'grey',
    },
    {
      id: '#57578558693',
      productName: 'Malaria Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Credit',
      paymentStatusColor: 'orange',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'In Transit',
      statusColor: 'blue',
    },
    {
      id: '#57578558694',
      productName: 'HIV Test Kits',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'Confirmed',
      statusColor: 'yellow',
    },
    {
      id: '#57578558695',
      productName: 'Malaria Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      paymentStatusColor: 'green',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'Delivered',
      statusColor: 'green',
    },
  ];

  const statusOptions = [
    'Select Status',
    'Delivered',
    'New Order',
    'In Transit',
    'Cancelled',
    'Confirmed',
  ];

  const dateOptions = ['Select Dates', 'Today', 'This Week', 'This Month', 'Custom Range'];

  const itemsPerPageOptions = ['10 per page', '20 per page', '50 per page', '100 per page'];

  // Filter and search orders
  const getFilteredOrders = () => {
    let filtered = [...allOrders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.productName.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.pharmacyName.toLowerCase().includes(query) ||
          order.location.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus !== 'Select Status') {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Date filter (simplified - in real app, you'd parse actual dates)
    if (selectedDate !== 'Select Dates') {
      // For demo purposes, we'll just return all orders
      // In a real app, you'd filter by actual dates
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Pagination
  const itemsPerPageNum = parseInt(itemsPerPage.split(' ')[0]);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPageNum);
  const startIndex = (currentPage - 1) * itemsPerPageNum;
  const endIndex = startIndex + itemsPerPageNum;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Generate page numbers
  const pages = [];
  const maxPagesToShow = 7;
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDate, itemsPerPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by filteredOrders
  };

  const handleEditOrder = (order) => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Editing order:', order);
    // For now, we'll just show an alert
    alert(`Edit functionality for order ${order.id} will be implemented here.`);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  const handleConfirmOrder = () => {
    // TODO: Implement confirm order functionality
    console.log('Confirming order:', selectedOrder);
    // You can update the order status here
    setSelectedOrder(null);
  };

  const getStatusDotColor = (color) => {
    const colors = {
      green: '#00A170',
      orange: '#f97316',
      grey: '#9ca3af',
      blue: '#3b82f6',
      red: '#ef4444',
      yellow: '#eab308',
    };
    return colors[color] || colors.grey;
  };

  return (
    <>
      <div className="orders-page">
        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">Orders Management</h1>
            <p className="orders-subtitle">View and manage all orders from marketplace.</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="orders-filters">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <HiMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Search order"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          <div className="filter-dropdowns">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-dropdown"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-dropdown"
            >
              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="filter-dropdown"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Pharmacy Name</th>
                <th>Amount(GHC)</th>
                <th>Order Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                      No orders found matching your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                <tr key={index}>
                  <td>
                    <div className="order-id-cell">
                      <FaShoppingBag className="order-icon" />
                      <div className="order-id-content">
                        <div className="product-name">{order.productName}</div>
                        <div className="order-id">{order.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{order.pharmacyName}</td>
                  <td>
                    <div className="amount-cell">
                      <div className="amount">GHS {order.amount}</div>
                      <div
                        className="payment-status"
                        style={{ color: getStatusDotColor(order.paymentStatusColor) }}
                      >
                        <span
                          className="status-dot"
                          style={{ backgroundColor: getStatusDotColor(order.paymentStatusColor) }}
                        />
                        {order.paymentStatus}
                      </div>
                    </div>
                  </td>
                  <td>{order.orderDate}</td>
                  <td>{order.location}</td>
                  <td>
                    <div
                      className="order-status"
                      style={{ color: getStatusDotColor(order.statusColor) }}
                    >
                      <span
                        className="status-dot"
                        style={{ backgroundColor: getStatusDotColor(order.statusColor) }}
                      />
                      {order.status}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-button"
                        title="View Details"
                        onClick={() => handleViewOrder(order)}
                      >
                        <HiEye />
                      </button>
                      <button
                        className="action-button"
                        title="Edit"
                        onClick={() => handleEditOrder(order)}
                      >
                        <HiPencil />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="pagination-numbers">
                {pages.map((page, index) => (
                  <button
                    key={index}
                    className={`pagination-number ${page === currentPage ? 'active' : ''} ${
                      page === '...' ? 'ellipsis' : ''
                    }`}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Panel */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={handleCloseDetails}
          onConfirmOrder={handleConfirmOrder}
        />
      )}
    </>
  );
};

export default Orders;