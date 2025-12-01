import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import './HighlyPerformingProductsChart.css';

const HighlyPerformingProductsChart = () => {
  const products = [
    { name: 'Malaria Test Kits', orders: 120, color: '#00A170' },
    { name: 'Hypertension Test Kit', orders: 78, color: '#3b82f6' },
    { name: 'HIV Test Kits', orders: 45, color: '#ec4899' },
    { name: 'Diabetes Test Kit', orders: 32, color: '#f59e0b' },
  ];

  const totalOrders = products.reduce((sum, p) => sum + p.orders, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="highly-performing-chart">
      <h3 className="chart-title">Highly Performing Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={products}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="orders"
          >
            {products.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value) => [`${value} Orders`, 'Orders']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: '12px' }}>
                {value} ({entry.payload.orders} Orders)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Orders</span>
          <span className="summary-value">{totalOrders}</span>
        </div>
      </div>
    </div>
  );
};

export default HighlyPerformingProductsChart;
