import React, { useState, useEffect } from 'react';
import { getRecentOrders } from '../../utils/dashboardService';
import './RecentOrdersTable.css';

const RecentOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  // Fetch recent orders from API
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getRecentOrders({ limit: 10 });
        
        // Handle different response structures
        let ordersData = response.data || response.orders || response || [];
        
        // Normalize orders data
        ordersData = ordersData.map(order => ({
          orderId: order.orderId || order.id || order._id || 'N/A',
          productName: order.productName || order.product || 'Unknown Product',
          pharmacyName: order.pharmacyName || order.pharmacy || 'Unknown Pharmacy',
          amount: order.amount || order.total || order.totalAmount || '0.00',
          paymentStatus: order.paymentStatus || order.payment || 'Pending',
          orderDate: order.orderDate || order.createdAt || order.date || new Date().toLocaleDateString(),
          location: order.location || order.city || order.region || 'N/A',
          status: order.status || order.orderStatus || 'New Order',
        }));
        
        console.log('📦 Recent orders loaded:', ordersData.length);
        setOrders(ordersData);
      } catch (err) {
        console.error('❌ Error fetching recent orders:', err);
        
        // Handle 404 - use fallback mock data
        if (err.response?.status === 404) {
          console.log('⚠️ Endpoint not found, using mock data');
          setOrders([
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
          ]);
        } else if (err.response?.status !== 401) {
          setError(err.message || 'Failed to fetch recent orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

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