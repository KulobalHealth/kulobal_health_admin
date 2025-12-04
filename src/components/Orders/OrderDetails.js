import React from 'react';
import { HiXMark } from 'react-icons/hi2';
import './OrderDetails.css';

const OrderDetails = ({ order, onClose, onConfirmOrder, onUpdateStatus, loading = false, error = null }) => {
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
  
  // Get order ID - handle the API response structure
  const orderId = fetchedData.orderId || order.id || fetchedData.id || fetchedData._id || 'N/A';
  const orderNo = typeof orderId === 'string' && orderId.startsWith('#') ? orderId : `#${orderId}`;

  // Extract order information from API response
  const totalCost = fetchedData.totalCost || order.amount || fetchedData.amount || fetchedData.total || fetchedData.totalAmount || 0;
  const paid = fetchedData.paid !== undefined ? fetchedData.paid : (order.paymentStatus === 'Full Payment');
  const orderStatus = fetchedData.status || order.status || fetchedData.orderStatus || 'PENDING';
  const paymentType = fetchedData.paymentType || order.paymentStatus || fetchedData.payment?.status || 'FULL_PAYMENT';
  const deliveryMethod = fetchedData.deliveryMethod || 'STANDARD';
  const numberOfItems = fetchedData.numberOfItems || fetchedData.products?.length || 0;
  const dateOrdered = formatDate(fetchedData.dateOrdered || order.orderDate || fetchedData.orderDate || fetchedData.createdAt || fetchedData.date);
  
  // Extract products array
  const products = fetchedData.products || [];
  
  // Extract pharmacy information
  const pharmacyId = fetchedData.pharmacyId || order.pharmacyId || 'N/A';
  const pharmacyName = order.pharmacyName || fetchedData.pharmacyName || fetchedData.pharmacy?.name || 'N/A';
  const address = fetchedData.address || fetchedData.pharmacy?.address || fetchedData.deliveryAddress?.address || order.location || 'N/A';
  const street = fetchedData.street || fetchedData.pharmacy?.street || fetchedData.deliveryAddress?.street || '';
  const city = fetchedData.city || fetchedData.pharmacy?.city || fetchedData.deliveryAddress?.city || order.location || 'N/A';
  const contact = fetchedData.contact || fetchedData.phoneNumber || fetchedData.pharmacy?.phoneNumber || fetchedData.pharmacy?.contact || 'N/A';

  // Calculate payment information
  const totalAmount = formatCurrency(totalCost);
  const amountPaid = paid ? totalCost : 0;
  const remainingAmount = formatCurrency(totalCost - amountPaid);

  // Status color mapping
  const orderStatusColor = order.statusColor || 
    (orderStatus === 'DELIVERED' || orderStatus === 'Delivered' ? 'green' :
     orderStatus === 'SHIPPED' || orderStatus === 'Shipped' ? 'blue' :
     orderStatus === 'PROCESSING' || orderStatus === 'Processing' ? 'yellow' :
     orderStatus === 'CANCELLED' || orderStatus === 'Cancelled' ? 'red' :
     orderStatus === 'PENDING' || orderStatus === 'Pending' ? 'orange' : 'grey');

  // Format payment type
  const formatPaymentType = (type) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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
          <div className="order-details-content">
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
              {/* Action Buttons based on Status */}
              {(orderStatus === 'PENDING' || orderStatus === 'Pending' || orderStatus === 'New Order') && (
                <button 
                  className="confirm-order-button" 
                  onClick={() => onUpdateStatus && onUpdateStatus(orderId, 'PROCESSING')}
                >
                  Confirm Order
                </button>
              )}
              {(orderStatus === 'PROCESSING' || orderStatus === 'Processing') && (
                <button 
                  className="confirm-order-button" 
                  onClick={() => onUpdateStatus && onUpdateStatus(orderId, 'SHIPPED')}
                >
                  Mark as Shipped
                </button>
              )}
              {(orderStatus === 'SHIPPED' || orderStatus === 'Shipped') && (
                <button 
                  className="confirm-order-button" 
                  onClick={() => onUpdateStatus && onUpdateStatus(orderId, 'DELIVERED')}
                >
                  Confirm Delivered
                </button>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="order-details-grid">
              {/* Left Column */}
              <div className="order-details-left">
                {/* Order Information */}
                <div className="order-details-section">
                  <h3 className="section-title">Order Information</h3>
                  <div className="order-info-list">
                    <div className="info-item">
                      <span className="info-label">Order ID:</span>
                      <span className="info-value">{orderNo}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Pharmacy ID:</span>
                      <span className="info-value">{pharmacyId}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date Ordered:</span>
                      <span className="info-value">{dateOrdered}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Number of Items:</span>
                      <span className="info-value">{numberOfItems}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Delivery Method:</span>
                      <span className="info-value">{deliveryMethod.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="order-details-section">
                  <h3 className="section-title">Payment Information</h3>
                  <div className="order-info-list">
                    <div className="info-item">
                      <span className="info-label">Total Cost (GHC):</span>
                      <span className="info-value">{totalAmount}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Payment Type:</span>
                      <span className="info-value">{formatPaymentType(paymentType)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Payment Status:</span>
                      <span className="info-value">
                        <span
                          className={`payment-status-badge ${paid ? 'paid' : 'unpaid'}`}
                        >
                          {paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </span>
                    </div>
                    {!paid && (
                      <div className="info-item">
                        <span className="info-label">Amount Due (GHC):</span>
                        <span className="info-value">{remainingAmount}</span>
                      </div>
                    )}
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
              </div>

              {/* Right Column - Products */}
              <div className="order-details-right">
                <div className="order-details-section">
                  <h3 className="section-title">Products ({products.length})</h3>
                  {products.length > 0 ? (
                    <div className="products-table-container">
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Type</th>
                            <th>Brand</th>
                            <th>Manufacturer</th>
                            <th>Price (GHC)</th>
                            <th>Qty</th>
                            <th>Total (GHC)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => (
                            <tr key={product.productId || index}>
                              <td>
                                <div className="product-name-cell">
                                  <div className="product-name-main">{product.productName || 'N/A'}</div>
                                  {product.description && (
                                    <div className="product-description">{product.description}</div>
                                  )}
                                </div>
                              </td>
                              <td>{product.productType || product.productTypeCode || 'N/A'}</td>
                              <td>{product.brand || 'N/A'}</td>
                              <td>{product.manufacturer || 'N/A'}</td>
                              <td>{formatCurrency(product.price || 0)}</td>
                              <td>{product.quantity || 0}</td>
                              <td className="product-total">{formatCurrency((product.price || 0) * (product.quantity || 0))}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="products-total-row">
                            <td colSpan="6" className="products-total-label">Grand Total:</td>
                            <td className="products-total-value">{totalAmount}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="no-products">No products found in this order.</div>
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