import React from 'react';
import { HiXMark } from 'react-icons/hi2';
import './OrderDetails.css';

const OrderDetails = ({ order, onClose, onConfirmOrder, loading = false, error = null }) => {
  if (!order) return null;

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
  const fetchedData = order.fetchedDetails || order.originalOrder || order;
  
  // Get order ID
  const orderId = order.id || fetchedData.id || fetchedData.orderId || fetchedData._id || 'N/A';
  const orderNo = typeof orderId === 'string' && orderId.startsWith('#') ? orderId : `#${orderId}`;

  // Extract product information
  const productName = order.productName || fetchedData.productName || fetchedData.product?.name || 'N/A';
  const quantity = fetchedData.quantity || fetchedData.qty || fetchedData.items?.length || 1;

  // Extract date
  const dateOrdered = formatDate(order.orderDate || fetchedData.orderDate || fetchedData.createdAt || fetchedData.date);

  // Extract amount information
  const totalAmount = formatCurrency(order.amount || fetchedData.amount || fetchedData.total || fetchedData.totalAmount || 0);
  const paymentType = order.paymentStatus || fetchedData.paymentStatus || fetchedData.payment?.status || 'Full Payment';
  const initialAmountPaid = formatCurrency(fetchedData.initialAmountPaid || fetchedData.amountPaid || fetchedData.paidAmount || 0);
  const remainingAmount = formatCurrency(fetchedData.remainingAmount || fetchedData.balance || 
    (parseFloat(String(totalAmount).replace(/,/g, '')) - parseFloat(String(initialAmountPaid).replace(/,/g, ''))) || 0);

  // Extract pharmacy information
  const pharmacyName = order.pharmacyName || fetchedData.pharmacyName || fetchedData.pharmacy?.name || 'N/A';
  const address = fetchedData.address || fetchedData.pharmacy?.address || fetchedData.deliveryAddress?.address || order.location || 'N/A';
  const street = fetchedData.street || fetchedData.pharmacy?.street || fetchedData.deliveryAddress?.street || '';
  const city = fetchedData.city || fetchedData.pharmacy?.city || fetchedData.deliveryAddress?.city || order.location || 'N/A';
  const contact = fetchedData.contact || fetchedData.phoneNumber || fetchedData.pharmacy?.phoneNumber || fetchedData.pharmacy?.contact || 'N/A';

  const orderStatus = order.status || fetchedData.status || fetchedData.orderStatus || 'New Order';
  const orderStatusColor = order.statusColor || 
    (orderStatus === 'Delivered' ? 'green' :
     orderStatus === 'In Transit' ? 'blue' :
     orderStatus === 'Confirmed' ? 'yellow' :
     orderStatus === 'Cancelled' ? 'red' : 'grey');

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <div className="order-details-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-details-header">
          <h2 className="order-details-title">Order details</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <HiXMark />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading order details...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px', 
            margin: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Order Details Content */}
        {!loading && (
          <>

        {/* Status and Confirm Button */}
        <div className="order-details-status-bar">
          <div className="status-section">
            <span className="status-label">Order Status</span>
            <div
              className="order-status-badge"
              style={{ color: getStatusDotColor(orderStatusColor) }}
            >
              <span
                className="status-dot"
                style={{ backgroundColor: getStatusDotColor(orderStatusColor) }}
              />
              {orderStatus}
            </div>
          </div>
          {orderStatus === 'New Order' && (
            <button className="confirm-order-button" onClick={onConfirmOrder}>
              Confirm Order
            </button>
          )}
        </div>

        {/* Order Summary */}
        <div className="order-details-section">
          <h3 className="section-title">Order Summary</h3>
          <div className="order-summary">
            <div className="product-image">
              <div className="product-image-placeholder">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <rect width="60" height="60" rx="8" fill="#3b82f6" opacity="0.1" />
                  <rect x="15" y="15" width="30" height="30" rx="4" fill="#3b82f6" />
                </svg>
              </div>
            </div>
            <div className="product-info">
              <div className="order-number">Order No.: {orderNo}</div>
              <div className="product-name-large">{productName}</div>
              <div className="product-quantity">Qty: {quantity}</div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="order-details-section">
          <h3 className="section-title">Order Information</h3>
          <div className="order-info-list">
            <div className="info-item">
              <span className="info-label">Date Ordered:</span>
              <span className="info-value">{dateOrdered}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Amount (GHC):</span>
              <span className="info-value">{totalAmount}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Type:</span>
              <span
                className="info-value payment-type"
                style={{ color: getStatusDotColor(order.paymentStatusColor || 'grey') }}
              >
                <span
                  className="status-dot"
                  style={{ backgroundColor: getStatusDotColor(order.paymentStatusColor || 'grey') }}
                />
                {paymentType}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Initial Amount Paid (GHC):</span>
              <span className="info-value">{initialAmountPaid}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Remaining Amount (GHC):</span>
              <span className="info-value">{remainingAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="order-details-section">
          <h3 className="section-title">Delivery Address</h3>
          <div className="delivery-address">
            <div className="address-line">{pharmacyName}</div>
            {address && address !== 'N/A' && <div className="address-line">{address}</div>}
            {street && <div className="address-line">{street}</div>}
            {city && city !== 'N/A' && <div className="address-line">{city}</div>}
            {contact && contact !== 'N/A' && <div className="address-line">{contact}</div>}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;