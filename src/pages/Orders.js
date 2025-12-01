import React, { useState, useEffect } from 'react';
import { 
  HiMagnifyingGlass, 
  HiEye, 
  HiPencil,
  HiArrowPath,
  HiArrowDownTray,
  HiFunnel,
  HiXMark
} from 'react-icons/hi2';
import { FaShoppingBag } from 'react-icons/fa';
import { getOrders } from '../utils/ordersService';
import OrderDetails from '../components/Orders/OrderDetails';
import './Orders.css';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All'); // Changed default to 'All'
  const [selectedDate, setSelectedDate] = useState('Select Dates');
  const [itemsPerPage, setItemsPerPage] = useState('10 per page');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    paymentStatus: '',
    minAmount: '',
    maxAmount: '',
    location: '',
    pharmacyName: '',
  });

  // Helper function to normalize order data from API
  const normalizeOrderData = (order) => {
    // Map API response to component's expected format
    return {
      id: order.id || order.orderId || order._id || `#${order.id}`,
      productName: order.productName || order.product?.name || order.product || 'N/A',
      pharmacyName: order.pharmacyName || order.pharmacy?.name || order.pharmacy || 'N/A',
      amount: order.amount || order.total || order.totalAmount || '0.00',
      paymentStatus: order.paymentStatus || order.payment?.status || 'Full Payment',
      paymentStatusColor: order.paymentStatusColor || 
        (order.paymentStatus === 'Credit' ? 'orange' : 
         order.paymentStatus === 'Partial Payment' ? 'yellow' : 'green'),
      orderDate: order.orderDate || order.createdAt || order.date || new Date().toLocaleDateString(),
      location: order.location || order.pharmacy?.location || order.address || 'N/A',
      status: order.status || order.orderStatus || 'New Order',
      statusColor: order.statusColor || 
        (order.status === 'Delivered' ? 'green' :
         order.status === 'In Transit' ? 'blue' :
         order.status === 'Confirmed' ? 'yellow' :
         order.status === 'Cancelled' ? 'red' : 'grey'),
      // Include original order data for details view
      ...order
    };
  };

  // Fetch orders from API on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrders();
        
        console.log('Orders API Response:', response);
        
        // Handle different response structures
        let ordersData = [];
        if (Array.isArray(response)) {
          ordersData = response;
        } else if (response.data && Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
        } else if (response.results && Array.isArray(response.results)) {
          ordersData = response.results;
        }
        
        // Normalize order data to match component format
        const normalizedOrders = ordersData.map(normalizeOrderData);
        
        // Set orders from API (empty array if no orders)
        setOrders(normalizedOrders);
        
        if (normalizedOrders.length === 0) {
          console.info('No orders found in API response.');
        }
      } catch (err) {
        // Handle 401 errors gracefully
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          setError('Authentication failed. Please login again.');
          return;
        }
        
        // Handle 404 errors - endpoint might not be implemented yet
        if (err.response?.status === 404) {
          console.error('Orders endpoint not found.');
          setError('Orders endpoint not found. Please check if the endpoint is implemented.');
          setOrders([]); // Set empty array instead of dummy data
          return;
        }
        
        setError(err.message || 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
        // Set empty array on error instead of dummy data
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Status tabs configuration
  const statusTabs = [
    { id: 'All', label: 'All Orders' },
    { id: 'Delivered', label: 'Delivered' },
    { id: 'New Order', label: 'New Orders' },
    { id: 'In Transit', label: 'In Transit' },
    { id: 'Confirmed', label: 'Confirmed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ];

  // Calculate counts for each status
  const getStatusCount = (statusId) => {
    if (statusId === 'All') {
      return orders.length;
    }
    return orders.filter((order) => order.status === statusId).length;
  };

  const dateOptions = ['Select Dates', 'Today', 'This Week', 'This Month', 'Custom Range'];

  const itemsPerPageOptions = ['10 per page', '20 per page', '50 per page', '100 per page'];

  // Helper function to parse date string
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Filter and search orders
  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.productName?.toLowerCase().includes(query) ||
          order.id?.toLowerCase().includes(query) ||
          order.pharmacyName?.toLowerCase().includes(query) ||
          order.location?.toLowerCase().includes(query)
      );
    }

    // Date filter (simplified - in real app, you'd parse actual dates)
    if (selectedDate !== 'Select Dates') {
      // For demo purposes, we'll just return all orders
      // In a real app, you'd filter by actual dates
    }

    // Advanced filters
    if (advancedFilters.dateFrom) {
      const fromDate = parseDate(advancedFilters.dateFrom);
      if (fromDate) {
        filtered = filtered.filter((order) => {
          const orderDate = parseDate(order.orderDate);
          return orderDate && orderDate >= fromDate;
        });
      }
    }
    if (advancedFilters.dateTo) {
      const toDate = parseDate(advancedFilters.dateTo);
      if (toDate) {
        filtered = filtered.filter((order) => {
          const orderDate = parseDate(order.orderDate);
          return orderDate && orderDate <= toDate;
        });
      }
    }
    if (advancedFilters.paymentStatus) {
      filtered = filtered.filter((order) => 
        order.paymentStatus?.toLowerCase() === advancedFilters.paymentStatus.toLowerCase()
      );
    }
    if (advancedFilters.minAmount) {
      filtered = filtered.filter((order) => {
        const amount = parseFloat(String(order.amount).replace(/[^0-9.]/g, '') || 0);
        return amount >= parseFloat(advancedFilters.minAmount);
      });
    }
    if (advancedFilters.maxAmount) {
      filtered = filtered.filter((order) => {
        const amount = parseFloat(String(order.amount).replace(/[^0-9.]/g, '') || 0);
        return amount <= parseFloat(advancedFilters.maxAmount);
      });
    }
    if (advancedFilters.location) {
      filtered = filtered.filter((order) =>
        order.location?.toLowerCase().includes(advancedFilters.location.toLowerCase())
      );
    }
    if (advancedFilters.pharmacyName) {
      filtered = filtered.filter((order) =>
        order.pharmacyName?.toLowerCase().includes(advancedFilters.pharmacyName.toLowerCase())
      );
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

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders();
      
      console.log('Orders API Response (Refresh):', response);
      
      // Handle different response structures
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response.data && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (response.results && Array.isArray(response.results)) {
        ordersData = response.results;
      }
      
      // Normalize order data to match component format
      const normalizedOrders = ordersData.map(normalizeOrderData);
      
      // Set orders from API (empty array if no orders)
      setOrders(normalizedOrders);
      
      if (normalizedOrders.length === 0) {
        console.info('No orders found in API response.');
      }
    } catch (err) {
      // Handle 401 errors gracefully
      if (err.response?.status === 401) {
        console.error('Authentication failed. Please login again.');
        setError('Authentication failed. Please login again.');
        return;
      }
      
      // Handle 404 errors
      if (err.response?.status === 404) {
        console.error('Orders endpoint not found.');
        setError('Orders endpoint not found. Please check if the endpoint is implemented.');
        setOrders([]); // Set empty array instead of dummy data
        return;
      }
      
      setError(err.message || 'Failed to refresh orders');
      console.error('Error refreshing orders:', err);
      // Set empty array on error instead of keeping existing orders
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting orders...');
    // Could export to CSV, Excel, PDF, etc.
    alert('Export functionality will be implemented here. This will export the filtered orders.');
  };

  const handleAdvancedFilter = () => {
    setShowAdvancedFilter(true);
  };

  const handleCloseAdvancedFilter = () => {
    setShowAdvancedFilter(false);
  };

  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyAdvancedFilters = () => {
    setShowAdvancedFilter(false);
    setCurrentPage(1); // Reset to first page when filters are applied
  };

  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({
      dateFrom: '',
      dateTo: '',
      paymentStatus: '',
      minAmount: '',
      maxAmount: '',
      location: '',
      pharmacyName: '',
    });
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

        {/* Status Tabs */}
        <div className="orders-status-tabs">
          {statusTabs.map((tab) => {
            const count = getStatusCount(tab.id);
            
            return (
              <button
                key={tab.id}
                className={`status-tab ${selectedStatus === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedStatus(tab.id)}
              >
                <span className="status-tab-label">{tab.label}</span>
                {count > 0 && (
                  <span className="status-tab-count">{count}</span>
                )}
              </button>
            );
          })}
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
          </form>

          <div className="orders-actions">
            <button
              type="button"
              className="action-icon-button"
              onClick={handleRefresh}
              title="Refresh"
              disabled={loading}
            >
              <HiArrowPath className={loading ? 'spinning' : ''} />
            </button>
            
            <button
              type="button"
              className="action-icon-button"
              onClick={handleAdvancedFilter}
              title="Advanced Filter"
            >
              <HiFunnel />
            </button>

            <button
              type="button"
              className="action-icon-button"
              onClick={handleExport}
              title="Export Orders"
            >
              <HiArrowDownTray />
            </button>

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

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading orders...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="orders-error" style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && (
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
        )}

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
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

      {/* Advanced Filter Modal */}
      {showAdvancedFilter && (
        <div className="advanced-filter-overlay" onClick={handleCloseAdvancedFilter}>
          <div className="advanced-filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="advanced-filter-header">
              <h2 className="advanced-filter-title">Advanced Filters</h2>
              <button
                className="advanced-filter-close"
                onClick={handleCloseAdvancedFilter}
                aria-label="Close"
              >
                <HiXMark />
              </button>
            </div>

            <div className="advanced-filter-content">
              {/* Date Range */}
              <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <div className="filter-date-range">
                  <div className="filter-date-input">
                    <label className="filter-date-label">From</label>
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) => handleAdvancedFilterChange('dateFrom', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-date-input">
                    <label className="filter-date-label">To</label>
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) => handleAdvancedFilterChange('dateTo', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="filter-group">
                <label className="filter-label">Payment Status</label>
                <select
                  value={advancedFilters.paymentStatus}
                  onChange={(e) => handleAdvancedFilterChange('paymentStatus', e.target.value)}
                  className="filter-input"
                >
                  <option value="">All Payment Status</option>
                  <option value="Full Payment">Full Payment</option>
                  <option value="Credit">Credit</option>
                  <option value="Partial Payment">Partial Payment</option>
                </select>
              </div>

              {/* Amount Range */}
              <div className="filter-group">
                <label className="filter-label">Amount Range (GHS)</label>
                <div className="filter-amount-range">
                  <div className="filter-amount-input">
                    <label className="filter-amount-label">Min</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={advancedFilters.minAmount}
                      onChange={(e) => handleAdvancedFilterChange('minAmount', e.target.value)}
                      className="filter-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="filter-amount-input">
                    <label className="filter-amount-label">Max</label>
                    <input
                      type="number"
                      placeholder="100000.00"
                      value={advancedFilters.maxAmount}
                      onChange={(e) => handleAdvancedFilterChange('maxAmount', e.target.value)}
                      className="filter-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="filter-group">
                <label className="filter-label">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={advancedFilters.location}
                  onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Pharmacy Name */}
              <div className="filter-group">
                <label className="filter-label">Pharmacy Name</label>
                <input
                  type="text"
                  placeholder="Enter pharmacy name"
                  value={advancedFilters.pharmacyName}
                  onChange={(e) => handleAdvancedFilterChange('pharmacyName', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="advanced-filter-footer">
              <button
                className="filter-button filter-button-secondary"
                onClick={handleResetAdvancedFilters}
              >
                Reset
              </button>
              <button
                className="filter-button filter-button-primary"
                onClick={handleApplyAdvancedFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;