import React from 'react';
import { HiXMark } from 'react-icons/hi2';
import './OrderDetails.css';

const OrderDetails = ({ order, onClose, onConfirmOrder }) => {
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

  // Sample order details data - in real app, this would come from the order object
  const orderDetails = {
    orderNo: '#24432',
    productName: order.productName || 'Malaria Test Kit',
    quantity: 4,
    dateOrdered: 'Mon 3 Apr, 2025',
    totalAmount: '23,400.00',
    paymentType: order.paymentStatus || 'Credit',
    initialAmountPaid: '400.00',
    remainingAmount: '23,000.00',
    pharmacyName: order.pharmacyName || 'Humble Pharmacy',
    address: 'GM-071-8258',
    street: 'Location Streets',
    city: 'Accra, Ghana',
    contact: '233540977343',
  };

  const orderStatus = order.status || 'New Order';
  const orderStatusColor = order.statusColor || 'grey';

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
              <div className="order-number">Order No.: {orderDetails.orderNo}</div>
              <div className="product-name-large">{orderDetails.productName}</div>
              <div className="product-quantity">Qty: {orderDetails.quantity}</div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="order-details-section">
          <h3 className="section-title">Order Information</h3>
          <div className="order-info-list">
            <div className="info-item">
              <span className="info-label">Date Ordered:</span>
              <span className="info-value">{orderDetails.dateOrdered}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Amount (GHC):</span>
              <span className="info-value">{orderDetails.totalAmount}</span>
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
                {orderDetails.paymentType}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Initial Amount Paid (GHC):</span>
              <span className="info-value">{orderDetails.initialAmountPaid}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Remaining Amount (GHC):</span>
              <span className="info-value">{orderDetails.remainingAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="order-details-section">
          <h3 className="section-title">Delivery Address</h3>
          <div className="delivery-address">
            <div className="address-line">{orderDetails.pharmacyName}</div>
            <div className="address-line">{orderDetails.address}</div>
            <div className="address-line">{orderDetails.street}</div>
            <div className="address-line">{orderDetails.city}</div>
            <div className="address-line">{orderDetails.contact}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;