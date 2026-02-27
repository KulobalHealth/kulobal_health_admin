import React from 'react';
import { HiXMark, HiTruck, HiCreditCard, HiShoppingBag, HiCheckCircle } from 'react-icons/hi2';
import './OrderDetails.css';

const OrderDetails = ({ order, onClose, onConfirmOrder, onUpdateStatus, onViewInvoice, loading = false, error = null }) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    const statusMap = {
      'DELIVERED': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
      'Delivered': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
      'SHIPPED': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
      'Shipped': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
      'PROCESSING': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
      'Processing': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
      'PENDING': { bg: '#fed7aa', color: '#c2410c', dot: '#f97316' },
      'Pending': { bg: '#fed7aa', color: '#c2410c', dot: '#f97316' },
      'New Order': { bg: '#fed7aa', color: '#c2410c', dot: '#f97316' },
      'CANCELLED': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
      'Cancelled': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    };
    return statusMap[status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Extract order details from fetched data or fallback to normalized data
  // Priority: fetchedDetails (from API call) > originalOrder (raw API data) > order (normalized)
  const fetchedData = order.fetchedDetails || order.originalOrder || order;
  
  // Get order ID for internal use (not displayed)
  const orderId = fetchedData.orderId || order.orderId || order.id || fetchedData.id || fetchedData._id || 'N/A';

  // Extract order information from API response
  const totalCost = fetchedData.totalCost || order.originalOrder?.totalCost || order.amount || 0;
  
  // Get paid status - check multiple sources:
  // 1. Direct 'paid' boolean from API
  // 2. paymentType === 'FULL_PAYMENT' suggests paid
  // 3. paymentStatus from normalized data (e.g., "Full Payment")
  const paymentTypeRaw = order.originalOrder?.paymentType || fetchedData.paymentType || '';
  const paymentStatusNormalized = order.paymentStatus || '';
  
  let paid = false;
  if (order.originalOrder?.paid === true || fetchedData.paid === true) {
    paid = true;
  } else if (paymentTypeRaw === 'FULL_PAYMENT' || paymentStatusNormalized === 'Full Payment') {
    paid = true;
  }
  
  const orderStatus = fetchedData.status || order.originalOrder?.status || order.status || 'PENDING';
  const paymentType = order.originalOrder?.paymentType || fetchedData.paymentType || 'FULL_PAYMENT';
  const deliveryMethod = order.originalOrder?.deliveryMethod || fetchedData.deliveryMethod || 'STANDARD';
  const numberOfItems = order.originalOrder?.numberOfItems || fetchedData.numberOfItems || fetchedData.products?.length || order.originalOrder?.products?.length || 0;
  const dateOrdered = formatDate(order.originalOrder?.dateOrdered || fetchedData.dateOrdered || order.orderDate);
  
  // Extract products array - prioritize originalOrder
  const products = order.originalOrder?.products || fetchedData.products || [];
  
  // Extract pharmacy information - prioritize originalOrder.pharmacy
  const pharmacy = order.originalOrder?.pharmacy || fetchedData.pharmacy || {};
  const pharmacyName = pharmacy.pharmacyName || order.pharmacyName || 'N/A';
  const pharmacyLocation = pharmacy.location || order.location || 'N/A';
  const pharmacyEmail = pharmacy.email || '';
  const pharmacyPhone = pharmacy.phoneNumber || '';
  const pharmacyFirstName = pharmacy.firstName || '';
  const pharmacyLastName = pharmacy.lastName || '';
  const pharmacyFullName = pharmacyFirstName && pharmacyLastName ? `${pharmacyFirstName} ${pharmacyLastName}` : '';

  // Calculate payment information
  const totalAmount = formatCurrency(totalCost);
  const amountPaid = paid ? totalCost : 0;
  const remainingAmount = formatCurrency(totalCost - amountPaid);

  // Status styling
  const statusStyle = getStatusColor(orderStatus);

  // Format payment type
  const formatPaymentType = (type) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format delivery method
  const formatDeliveryMethod = (method) => {
    if (!method) return 'Standard';
    return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get action button based on status
  const getActionButton = () => {
    const statusActions = {
      'PENDING': { label: 'Confirm Order', nextStatus: 'PROCESSING' },
      'Pending': { label: 'Confirm Order', nextStatus: 'PROCESSING' },
      'New Order': { label: 'Confirm Order', nextStatus: 'PROCESSING' },
      'PROCESSING': { label: 'Mark as Shipped', nextStatus: 'SHIPPED' },
      'Processing': { label: 'Mark as Shipped', nextStatus: 'SHIPPED' },
      'SHIPPED': { label: 'Confirm Delivered', nextStatus: 'DELIVERED' },
      'Shipped': { label: 'Confirm Delivered', nextStatus: 'DELIVERED' },
    };
    return statusActions[orderStatus] || null;
  };

  const actionButton = getActionButton();

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <div className="order-modal-header-left">
            <div className="order-modal-icon">
              <HiShoppingBag />
            </div>
            <div>
              <h2 className="order-modal-title">Order Details</h2>
              <p className="order-modal-subtitle">{numberOfItems} item{numberOfItems !== 1 ? 's' : ''} • {dateOrdered}</p>
            </div>
          </div>
          <div className="order-modal-header-right">
            <div 
              className="order-status-pill"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
            >
              <span className="status-indicator" style={{ backgroundColor: statusStyle.dot }} />
              {orderStatus}
            </div>
            <button className="order-modal-close" onClick={onClose} aria-label="Close">
              <HiXMark />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="order-modal-loading">
            <div className="loading-spinner" />
            <p>Loading order details...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="order-modal-content">
            {/* Quick Stats Row */}
            <div className="order-quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-icon" style={{ backgroundColor: '#d1fae5' }}>
                  <HiCreditCard style={{ color: '#065f46' }} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Total Amount</span>
                  <span className="quick-stat-value">GHS {totalAmount}</span>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon" style={{ backgroundColor: paid ? '#d1fae5' : '#fee2e2' }}>
                  <HiCheckCircle style={{ color: paid ? '#065f46' : '#991b1b' }} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Payment Status</span>
                  <span className="quick-stat-value" style={{ color: paid ? '#065f46' : '#991b1b' }}>
                    {paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-icon" style={{ backgroundColor: '#dbeafe' }}>
                  <HiTruck style={{ color: '#1e40af' }} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Delivery</span>
                  <span className="quick-stat-value">{formatDeliveryMethod(deliveryMethod)}</span>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="order-modal-grid">
              {/* Left Column - Pharmacy & Payment Info */}
              <div className="order-modal-left">
                {/* Pharmacy Card */}
                <div className="order-info-card">
                  <h3 className="order-card-title">
                    Pharmacy Information
                  </h3>
                  <div className="pharmacy-info">
                    <div className="pharmacy-details">
                      <h4 className="pharmacy-name">{pharmacyName}</h4>
                      {pharmacyFullName && <p className="pharmacy-contact-name">{pharmacyFullName}</p>}
                      <div className="pharmacy-meta">
                        {pharmacyLocation && pharmacyLocation !== 'N/A' && (
                          <span className="pharmacy-meta-item">
                            {pharmacyLocation}
                          </span>
                        )}
                        {pharmacyPhone && (
                          <span className="pharmacy-meta-item">
                            {pharmacyPhone}
                          </span>
                        )}
                        {pharmacyEmail && (
                          <span className="pharmacy-meta-item">
                            {pharmacyEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Card */}
                <div className="order-info-card">
                  <h3 className="order-card-title">
                    Payment Details
                  </h3>
                  <div className="payment-details">
                    <div className="payment-row">
                      <span className="payment-label">Payment Type</span>
                      <span className="payment-value">{formatPaymentType(paymentType)}</span>
                    </div>
                    <div className="payment-row">
                      <span className="payment-label">Subtotal</span>
                      <span className="payment-value">GHS {totalAmount}</span>
                    </div>
                    {!paid && (
                      <div className="payment-row payment-due">
                        <span className="payment-label">Amount Due</span>
                        <span className="payment-value">GHS {remainingAmount}</span>
                      </div>
                    )}
                    <div className="payment-row payment-total">
                      <span className="payment-label">Total</span>
                      <span className="payment-value">GHS {totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="order-actions">
                  {onViewInvoice && (
                    <button className="order-action-btn order-action-secondary" onClick={onViewInvoice}>
                      View Invoice
                    </button>
                  )}
                  {actionButton && onUpdateStatus && (
                    <button 
                      className="order-action-btn order-action-primary"
                      onClick={() => onUpdateStatus(orderId, actionButton.nextStatus)}
                    >
                      {actionButton.label}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column - Products */}
              <div className="order-modal-right">
                <div className="order-info-card order-products-card">
                  <h3 className="order-card-title">
                    Products ({products.length})
                  </h3>
                  {products.length > 0 ? (
                    <div className="order-products-list">
                      {products.map((product, index) => (
                        <div key={product.productId || index} className="order-product-item">
                          <div className="product-image-placeholder">
                            <HiShoppingBag />
                          </div>
                          <div className="product-info">
                            <h4 className="product-title">{product.productName || 'Unknown Product'}</h4>
                            <div className="product-meta">
                              <span className="product-type">{product.productType || product.productTypeCode || 'N/A'}</span>
                              {product.brand && <span className="product-brand">{product.brand}</span>}
                            </div>
                            {product.manufacturer && (
                              <p className="product-manufacturer">by {product.manufacturer}</p>
                            )}
                          </div>
                          <div className="product-pricing">
                            <div className="product-qty">× {product.quantity || 1}</div>
                            <div className="product-price">GHS {formatCurrency(product.price || 0)}</div>
                            <div className="product-subtotal">GHS {formatCurrency((product.price || 0) * (product.quantity || 1))}</div>
                          </div>
                        </div>
                      ))}
                      {/* Order Total */}
                      <div className="order-products-total">
                        <span>Order Total</span>
                        <span className="order-total-amount">GHS {totalAmount}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-products">
                      <HiShoppingBag />
                      <p>No products found in this order.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
