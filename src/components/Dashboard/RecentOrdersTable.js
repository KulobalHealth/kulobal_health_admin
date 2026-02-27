import React, { useState, useEffect } from 'react';
import { getRecentOrders } from '../../utils/dashboardService';
import './RecentOrdersTable.css';

const RecentOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const formatAmount = (value) => {
    const numericValue = typeof value === 'string' ? Number(value) : value;
    if (Number.isFinite(numericValue)) {
      return numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '0.00';
  };

  // Fetch recent orders from API
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getRecentOrders({ limit: 10 });
        
        // Debug: log everything
        console.log('📦 FULL Raw API response:', JSON.stringify(response, null, 2));
        console.log('📦 response.orderData:', response.orderData);
        console.log('📦 response.data:', response.data);
        console.log('📦 response.data?.orderData:', response.data?.orderData);
        
        // Handle different response structures
        // API may return { data: { orderData: [...] } } or { data: [...] } or { orders: [...] }
        let ordersData = response.orderData || response.data?.orderData || response.data || response.orders || response || [];
        
        // Ensure it's an array
        if (!Array.isArray(ordersData)) {
          console.log('⚠️ ordersData is not an array, trying to extract:', ordersData);
          ordersData = ordersData.orderData || ordersData.data || [];
        }
        
        console.log('📦 Final ordersData array:', ordersData);
        console.log('📦 ordersData length:', ordersData.length);
        
        if (ordersData.length > 0) {
          console.log('📦 First order keys:', Object.keys(ordersData[0]));
          console.log('📦 First order totalCost:', ordersData[0].totalCost);
        }
        
        // Normalize orders data
        ordersData = ordersData.map(order => {
          console.log('💰 Processing order:', order.orderId, 'totalCost:', order.totalCost, 'type:', typeof order.totalCost);
          return {
            orderId: order.orderId || order.id || order._id || 'N/A',
            productName: order.products?.[0]?.productName || order.productName || 'Multiple Products',
            pharmacyName: order.pharmacy?.pharmacyName || order.pharmacyName || order.pharmacy || 'Unknown Pharmacy',
            amount: order.totalCost != null ? Number(order.totalCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            paymentStatus: order.paid ? 'Paid' : 'Unpaid',
            paymentType: order.paymentType || 'N/A',
            orderDate: order.dateOrdered ? new Date(order.dateOrdered).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
            location: order.pharmacy?.location || order.location || 'N/A',
            status: order.status || 'New Order',
            numberOfItems: order.numberOfItems || order.products?.length || 0,
          };
        });
        
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