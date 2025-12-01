import React, { useState } from 'react';
import KPICard from '../components/Dashboard/KPICard';
import DateRangeFilter from '../components/Dashboard/DateRangeFilter';
import ProductOrdersChart from '../components/Dashboard/ProductOrdersChart';
import HighlyPerformingProductsChart from '../components/Dashboard/HighlyPerformingProductsChart';
import RecentOrdersTable from '../components/Dashboard/RecentOrdersTable';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('12 months');

  const kpiData = [
    {
      title: 'Total Pharmacies',
      value: '200',
      change: '+100%',
      showChange: true,
    },
    {
      title: 'Total Patients',
      value: '40',
      change: '+100%',
      showChange: true,
    },
    {
      title: 'Total Suppliers',
      value: '90',
      change: '+100%',
      showChange: true,
    },
    {
      title: 'Total Sales (GHS)',
      value: '40,000.00',
      change: null,
      showChange: false,
    },
    {
      title: 'Outstanding Payment (GHS)',
      value: '4,000.00',
      change: null,
      showChange: false,
    },
    {
      title: 'Total DDI Users',
      value: '78',
      change: '+100%',
      showChange: true,
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <DateRangeFilter
          selectedRange={selectedDateRange}
          onRangeChange={setSelectedDateRange}
        />
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            showChange={kpi.showChange}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <ProductOrdersChart dateRange={selectedDateRange} />
        </div>
        <div className="chart-container">
          <HighlyPerformingProductsChart />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="recent-orders-section">
        <RecentOrdersTable />
      </div>
    </div>
  );
};

export default Dashboard;