import React, { useRef } from 'react';
import { HiXMark, HiPrinter } from 'react-icons/hi2';
import './OrderInvoice.css';

const OrderInvoice = ({ order, onClose }) => {
  const invoiceRef = useRef();

  if (!order) return null;

  // Helper to format date
  const formatDate = (dateString, format = 'long') => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      if (format === 'short') {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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
  const orderId = fetchedData.orderId || order.orderId || order.id || 'N/A';
  const invoiceNo = `INV-${orderId.slice(-8).toUpperCase()}`;
  const totalCost = fetchedData.totalCost || order.originalOrder?.totalCost || order.amount || 0;
  const dateOrdered = order.originalOrder?.dateOrdered || fetchedData.dateOrdered || order.orderDate;
  const products = order.originalOrder?.products || fetchedData.products || [];
  
  // Pharmacy info
  const pharmacy = order.originalOrder?.pharmacy || fetchedData.pharmacy || {};
  const pharmacyName = pharmacy.pharmacyName || order.pharmacyName || 'N/A';
  const pharmacyLocation = pharmacy.location || order.location || '';
  const pharmacyEmail = pharmacy.email || '';
  const pharmacyPhone = pharmacy.phoneNumber || '';
  const pharmacyContact = `${pharmacy.firstName || ''} ${pharmacy.lastName || ''}`.trim();
  
  // Payment info
  const paymentType = order.originalOrder?.paymentType || fetchedData.paymentType || 'FULL_PAYMENT';
  const deliveryMethod = order.originalOrder?.deliveryMethod || fetchedData.deliveryMethod || 'STANDARD';
  const orderStatus = order.originalOrder?.status || fetchedData.status || order.status || 'PENDING';
  const numberOfItems = order.originalOrder?.numberOfItems || products.length || 0;

  // Calculate totals
  const subtotal = products.reduce((sum, product) => {
    return sum + ((product.price || 0) * (product.quantity || 1));
  }, 0) || totalCost;

  // Due date (15 days from order date)
  const dueDate = dateOrdered ? new Date(new Date(dateOrdered).getTime() + 15 * 24 * 60 * 60 * 1000) : null;

  // Print handler - opens a new window with just the invoice content
  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups for this site to print the invoice.');
      return;
    }

    const printStyles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: white; }
        
        .invoice-paper { background: white; padding: 20px; }
        
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .invoice-brand { display: flex; align-items: center; gap: 12px; }
        .brand-logo { width: 50px; height: 50px; background: #fff; border: 2px solid #000; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .logo-icon { font-size: 24px; font-weight: 800; color: #000; }
        .brand-info h1 { margin: 0; font-size: 20px; font-weight: 700; color: #000; }
        .brand-info p { margin: 4px 0 0; font-size: 11px; color: #000; }
        .invoice-meta { text-align: right; }
        .invoice-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #000; background: #f0f0f0; border: 1px solid #000; padding: 4px 10px; margin-bottom: 6px; }
        .invoice-number { font-size: 16px; font-weight: 700; color: #000; font-family: monospace; }
        
        .invoice-info-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 12px 16px; background: #f8f8f8; border: 1px solid #ccc; margin-bottom: 20px; }
        .info-item { display: flex; flex-direction: column; gap: 2px; }
        .info-label { font-size: 9px; font-weight: 700; color: #666; text-transform: uppercase; }
        .info-value { font-size: 12px; font-weight: 600; color: #000; }
        .status-badge { display: inline-block; padding: 3px 8px; border: 1px solid #000; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #f0f0f0; color: #000; }
        
        .invoice-billing { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 24px; }
        .billing-from h4, .billing-to h4 { font-size: 11px; font-weight: 700; color: #000; text-transform: uppercase; margin: 0 0 8px; padding-bottom: 6px; border-bottom: 2px solid #000; display: inline-block; }
        .billing-details { line-height: 1.5; }
        .billing-details p { margin: 0; font-size: 11px; color: #000; }
        .billing-name { font-size: 13px !important; font-weight: 700; }
        .billing-contact { margin-top: 8px !important; display: flex; flex-direction: column; gap: 2px; }
        .billing-contact span { font-size: 11px; color: #000; }
        
        .invoice-items { margin-bottom: 20px; }
        .invoice-items table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
        .invoice-items thead { background: #f0f0f0; }
        .invoice-items th { padding: 6px 8px; font-size: 10px; font-weight: 700; color: #000; text-transform: uppercase; text-align: left; border: 1px solid #000; }
        .invoice-items th:last-child { text-align: right; }
        .invoice-items .col-qty, .invoice-items .col-price { text-align: center; }
        .invoice-items td { padding: 5px 8px; font-size: 11px; color: #000; border: 1px solid #000; }
        .invoice-items td.col-qty, .invoice-items td.col-price { text-align: center; }
        .invoice-items td.col-total { text-align: right; font-weight: 600; }
        .item-name { font-weight: 600; font-size: 11px; }
        
        .invoice-summary { display: grid; grid-template-columns: 1fr 250px; gap: 30px; padding-top: 16px; border-top: 2px solid #000; }
        .summary-notes h4 { font-size: 11px; font-weight: 700; color: #000; margin: 0 0 8px; }
        .summary-notes p { margin: 0 0 4px; font-size: 11px; color: #000; }
        .summary-notes strong { color: #000; }
        .summary-totals { display: flex; flex-direction: column; gap: 8px; }
        .total-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #000; }
        .total-row.grand-total { padding-top: 10px; margin-top: 6px; border-top: 2px solid #000; }
        .total-row.grand-total span:first-child { font-size: 13px; font-weight: 700; }
        .total-row.grand-total span:last-child { font-size: 16px; font-weight: 700; }
        
        .invoice-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #000; }
        .footer-message { text-align: center; margin-bottom: 16px; }
        .thank-you { font-size: 14px; font-weight: 700; color: #000; margin: 0 0 6px; }
        .terms { font-size: 10px; color: #000; margin: 0; }
        .footer-contact { display: flex; justify-content: center; gap: 30px; padding: 12px; background: #f8f8f8; border: 1px solid #ccc; }
        .contact-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .contact-label { font-size: 9px; font-weight: 700; color: #666; text-transform: uppercase; }
        .contact-value { font-size: 11px; font-weight: 500; color: #000; }
        
        .invoice-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 800; color: rgba(0,0,0,0.05); pointer-events: none; }
        
        @media print {
          body { padding: 0; }
          .invoice-paper { padding: 10px; }
          @page { size: A4; margin: 10mm; }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNo}</title>
          ${printStyles}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };

    // Fallback for browsers that don't support onload properly
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div className="invoice-overlay" onClick={onClose}>
      <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
        {/* Toolbar - Hidden when printing */}
        <div className="invoice-toolbar no-print">
          <div className="toolbar-left">
            <h3>Invoice Preview</h3>
          </div>
          <div className="toolbar-right">
            <button className="toolbar-btn primary" onClick={handlePrint}>
              <HiPrinter /> Print / Save PDF
            </button>
            <button className="toolbar-btn close" onClick={onClose}>
              <HiXMark />
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="invoice-document" ref={invoiceRef}>
          {/* Invoice Paper */}
          <div className="invoice-paper">
            {/* Header */}
            <header className="invoice-header">
              <div className="invoice-brand">
                <div className="brand-logo">
                  <span className="logo-icon">K</span>
                </div>
                <div className="brand-info">
                  <h1>KulobalHealth</h1>
                  <p>Healthcare Distribution Solutions</p>
                </div>
              </div>
              <div className="invoice-meta">
                <div className="invoice-badge">INVOICE</div>
                <div className="invoice-number">{invoiceNo}</div>
              </div>
            </header>

            {/* Invoice Info Bar */}
            <div className="invoice-info-bar">
              <div className="info-item">
                <span className="info-label">Issue Date</span>
                <span className="info-value">{formatDate(dateOrdered)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Due Date</span>
                <span className="info-value">{dueDate ? formatDate(dueDate) : 'Upon Receipt'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Order Status</span>
                <span className={`info-value status-badge ${orderStatus.toLowerCase()}`}>{orderStatus}</span>
              </div>
            </div>

            {/* Billing Section */}
            <div className="invoice-billing">
              <div className="billing-from">
                <h4>From</h4>
                <div className="billing-details">
                  <p className="billing-name">KulobalHealth Ltd.</p>
                  <p>14 Independence Avenue</p>
                  <p>Accra, Greater Accra Region</p>
                  <p>Ghana</p>
                  <p className="billing-contact">
                    <span>info@kulobalhealth.com</span>
                    <span>+233 30 123 4567</span>
                  </p>
                </div>
              </div>
              <div className="billing-to">
                <h4>Bill To</h4>
                <div className="billing-details">
                  <p className="billing-name">{pharmacyName}</p>
                  {pharmacyContact && <p>{pharmacyContact}</p>}
                  {pharmacyLocation && <p>{pharmacyLocation}</p>}
                  {pharmacyPhone && <p>{pharmacyPhone}</p>}
                  {pharmacyEmail && <p>{pharmacyEmail}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="invoice-items">
              <table>
                <thead>
                  <tr>
                    <th className="col-item">Item Description</th>
                    <th className="col-qty">Qty</th>
                    <th className="col-price">Unit Price</th>
                    <th className="col-total">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={product.productId || index}>
                        <td className="col-item">
                          <div className="item-name">{product.productName || 'Product'}</div>
                        </td>
                        <td className="col-qty">{product.quantity || 1}</td>
                        <td className="col-price">GHS {formatCurrency(product.price || 0)}</td>
                        <td className="col-total">GHS {formatCurrency((product.price || 0) * (product.quantity || 1))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="col-item">
                        <div className="item-name">Order Items ({numberOfItems} item(s))</div>
                      </td>
                      <td className="col-qty">1</td>
                      <td className="col-price">GHS {formatCurrency(totalCost)}</td>
                      <td className="col-total">GHS {formatCurrency(totalCost)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="invoice-summary">
              <div className="summary-notes">
                <h4>Payment Information</h4>
                <p><strong>Payment Method:</strong> {paymentType.replace(/_/g, ' ')}</p>
                <p><strong>Delivery Method:</strong> {deliveryMethod.replace(/_/g, ' ')}</p>
              </div>
              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>GHS {formatCurrency(subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>GHS 0.00</span>
                </div>
                <div className="total-row">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total Due</span>
                  <span>GHS {formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="invoice-footer">
              <div className="footer-message">
                <p className="thank-you">Thank you for your business!</p>
                <p className="terms">Payment is due within 15 days of invoice date. Please include the invoice number with your payment.</p>
              </div>
              <div className="footer-contact">
                <div className="contact-item">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">billing@kulobalhealth.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">+233 30 123 4567</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Website</span>
                  <span className="contact-value">www.kulobalhealth.com</span>
                </div>
              </div>
            </footer>

            {/* Watermark for paid orders */}
            {orderStatus === 'DELIVERED' && (
              <div className="invoice-watermark">PAID</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
