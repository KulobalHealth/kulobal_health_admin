import React, { useRef } from 'react';
import { HiXMark, HiPrinter, HiShare, HiDocumentArrowDown } from 'react-icons/hi2';
import './OrderInvoice.css';

const OrderInvoice = ({ order, onClose }) => {
  const invoiceRef = useRef();

  if (!order) return null;

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
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

  // Extract order details
  const fetchedData = order.fetchedDetails || order.originalOrder || order;
  const orderId = fetchedData.orderId || order.id || fetchedData.id || fetchedData._id || 'N/A';
  const orderNo = typeof orderId === 'string' && orderId.startsWith('#') ? orderId : `#${orderId}`;
  const totalCost = fetchedData.totalCost || order.amount || fetchedData.amount || fetchedData.total || 0;
  const dateOrdered = formatDate(fetchedData.dateOrdered || order.orderDate || fetchedData.createdAt);
  const products = fetchedData.products || [];
  const pharmacyName = order.pharmacyName || fetchedData.pharmacyName || fetchedData.pharmacy?.name || 'N/A';
  const address = fetchedData.address || order.location || fetchedData.pharmacy?.address || 'N/A';
  const contact = fetchedData.contact || fetchedData.phoneNumber || fetchedData.pharmacy?.phoneNumber || 'N/A';
  const paymentType = fetchedData.paymentType || order.paymentStatus || 'FULL_PAYMENT';
  const orderStatus = fetchedData.status || order.status || 'PENDING';

  // Calculate subtotal, tax, and total
  const subtotal = products.reduce((sum, product) => {
    const price = product.price || product.unitPrice || 0;
    const quantity = product.quantity || 0;
    return sum + (price * quantity);
  }, 0) || totalCost;

  const taxRate = 0.125; // 12.5% VAT
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF (using browser print to PDF)
  const handleDownload = () => {
    window.print();
  };

  // Share handler
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${orderNo}`,
          text: `Invoice for Order ${orderNo} - ${pharmacyName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Invoice link copied to clipboard!');
    }
  };

  return (
    <div className="invoice-overlay" onClick={onClose}>
      <div className="invoice-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Actions */}
        <div className="invoice-actions no-print">
          <button className="invoice-action-btn" onClick={handlePrint} title="Print Invoice">
            <HiPrinter />
            <span>Print</span>
          </button>
          <button className="invoice-action-btn" onClick={handleDownload} title="Download PDF">
            <HiDocumentArrowDown />
            <span>Download</span>
          </button>
          <button className="invoice-action-btn" onClick={handleShare} title="Share Invoice">
            <HiShare />
            <span>Share</span>
          </button>
          <button className="invoice-close-btn" onClick={onClose} title="Close">
            <HiXMark />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="invoice-content" ref={invoiceRef}>
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="invoice-logo">
              <h1 className="invoice-company">Kulobal Health</h1>
              <p className="invoice-tagline">Healthcare Distribution</p>
            </div>
            <div className="invoice-title-section">
              <h2 className="invoice-title">INVOICE</h2>
              <p className="invoice-number">{orderNo}</p>
              <p className="invoice-date">Date: {dateOrdered}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Bill To Section */}
          <div className="invoice-parties">
            <div className="invoice-from">
              <h3 className="party-title">From:</h3>
              <p className="party-name">Kulobal Health</p>
              <p className="party-detail">123 Healthcare Avenue</p>
              <p className="party-detail">Accra, Ghana</p>
              <p className="party-detail">Email: info@kulobalhealth.com</p>
              <p className="party-detail">Phone: +233 XX XXX XXXX</p>
            </div>
            <div className="invoice-to">
              <h3 className="party-title">Bill To:</h3>
              <p className="party-name">{pharmacyName}</p>
              <p className="party-detail">{address}</p>
              <p className="party-detail">Phone: {contact}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* Order Details */}
          <div className="invoice-details">
            <div className="detail-item">
              <span className="detail-label">Order Status:</span>
              <span className={`detail-value status-${orderStatus.toLowerCase()}`}>{orderStatus}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{paymentType.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th className="table-header">#</th>
                <th className="table-header">Product Description</th>
                <th className="table-header text-center">Quantity</th>
                <th className="table-header text-right">Unit Price</th>
                <th className="table-header text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => {
                  const price = product.price || product.unitPrice || 0;
                  const quantity = product.quantity || 0;
                  const itemTotal = price * quantity;
                  return (
                    <tr key={index}>
                      <td className="table-cell">{index + 1}</td>
                      <td className="table-cell">
                        <div className="product-name">{product.productName || product.name || 'N/A'}</div>
                        {product.description && (
                          <div className="product-description">{product.description}</div>
                        )}
                      </td>
                      <td className="table-cell text-center">{quantity}</td>
                      <td className="table-cell text-right">GHS {formatCurrency(price)}</td>
                      <td className="table-cell text-right">GHS {formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="table-cell" colSpan="2">{order.productName || 'General Order'}</td>
                  <td className="table-cell text-center">1</td>
                  <td className="table-cell text-right">GHS {formatCurrency(totalCost)}</td>
                  <td className="table-cell text-right">GHS {formatCurrency(totalCost)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="invoice-totals">
            <div className="totals-row">
              <span className="totals-label">Subtotal:</span>
              <span className="totals-value">GHS {formatCurrency(subtotal)}</span>
            </div>
            <div className="totals-row">
              <span className="totals-label">VAT (12.5%):</span>
              <span className="totals-value">GHS {formatCurrency(taxAmount)}</span>
            </div>
            <div className="invoice-divider"></div>
            <div className="totals-row total">
              <span className="totals-label">Total Amount:</span>
              <span className="totals-value">GHS {formatCurrency(total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <p className="footer-note">Thank you for your business!</p>
            <p className="footer-terms">
              Payment is due within 15 days. Please include invoice number with your payment.
            </p>
            <div className="footer-contact">
              <p>For questions about this invoice, contact us at:</p>
              <p>Email: billing@kulobalhealth.com | Phone: +233 XX XXX XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
