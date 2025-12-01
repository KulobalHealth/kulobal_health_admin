import React from 'react';
import './RecentOrdersTable.css';

const RecentOrdersTable = () => {
  const orders = [
    {
      orderId: '#57578558686',
      productName: 'Malaria Test Kit',
      pharmacyName: 'Humble Pharmacy',
      amount: '200.00',
      paymentStatus: 'Full Payment',
      orderDate: 'Thu 7 Dec, 2025',
      location: 'Greater Accra',
      status: 'New Order',
    },
    // Add more orders as needed
  ];

  return (
    <div className="recent-orders-table">
      <h3 className="table-title">Recent Orders</h3>
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Pharmacy Name</th>
              <th>Amount(GHC)</th>
              <th>Order Date</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td>
                  <div className="order-id-cell">
                    <div className="order-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          width="16"
                          height="16"
                          rx="4"
                          fill="#00A170"
                        />
                      </svg>
                    </div>
                    <div className="order-id-content">
                      <div className="product-name">{order.productName}</div>
                      <div className="order-id">{order.orderId}</div>
                    </div>
                  </div>
                </td>
                <td>{order.pharmacyName}</td>
                <td>
                  <div className="amount-cell">
                    <div className="amount">GHS {order.amount}</div>
                    <div className="payment-status">
                      <span className="payment-dot"></span>
                      {order.paymentStatus}
                    </div>
                  </div>
                </td>
                <td>{order.orderDate}</td>
                <td>{order.location}</td>
                <td>
                  <div className="status-cell">
                    <span className="status-dot"></span>
                    {order.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;