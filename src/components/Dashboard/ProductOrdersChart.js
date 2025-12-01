import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './ProductOrderChart.css';

const ProductOrdersChart = ({ dateRange }) => {
  // Sample data based on date range
  const getData = () => {
    if (dateRange === '12 months') {
      return [
        { month: 'Jan', orders: 120, revenue: 24000 },
        { month: 'Feb', orders: 150, revenue: 30000 },
        { month: 'Mar', orders: 180, revenue: 36000 },
        { month: 'Apr', orders: 200, revenue: 40000 },
        { month: 'May', orders: 220, revenue: 44000 },
        { month: 'Jun', orders: 250, revenue: 50000 },
        { month: 'Jul', orders: 280, revenue: 56000 },
        { month: 'Aug', orders: 300, revenue: 60000 },
        { month: 'Sep', orders: 320, revenue: 64000 },
        { month: 'Oct', orders: 350, revenue: 70000 },
        { month: 'Nov', orders: 380, revenue: 76000 },
        { month: 'Dec', orders: 400, revenue: 80000 },
      ];
    } else if (dateRange === '30 days') {
      return Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        orders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 10000) + 2000,
      }));
    } else if (dateRange === '7 days') {
      return [
        { day: 'Mon', orders: 45, revenue: 9000 },
        { day: 'Tue', orders: 52, revenue: 10400 },
        { day: 'Wed', orders: 48, revenue: 9600 },
        { day: 'Thu', orders: 60, revenue: 12000 },
        { day: 'Fri', orders: 65, revenue: 13000 },
        { day: 'Sat', orders: 70, revenue: 14000 },
        { day: 'Sun', orders: 55, revenue: 11000 },
      ];
    } else {
      return [
        { hour: '00:00', orders: 5, revenue: 1000 },
        { hour: '06:00', orders: 8, revenue: 1600 },
        { hour: '12:00', orders: 15, revenue: 3000 },
        { hour: '18:00', orders: 12, revenue: 2400 },
        { hour: '24:00', orders: 6, revenue: 1200 },
      ];
    }
  };

  const data = getData();
  const xAxisKey = dateRange === '12 months' ? 'month' : dateRange === '30 days' ? 'day' : dateRange === '7 days' ? 'day' : 'hour';

  return (
    <div className="product-orders-chart">
      <h3 className="chart-title">Product Orders & Revenue</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xAxisKey}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="orders"
            stroke="#00A170"
            strokeWidth={2}
            name="Orders"
            dot={{ fill: '#00A170', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Revenue (GHS)"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductOrdersChart;
