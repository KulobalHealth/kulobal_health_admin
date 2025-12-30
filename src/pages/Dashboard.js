import React, { useState, useEffect } from 'react';
import KPICard from '../components/Dashboard/KPICard';
import DateRangeFilter from '../components/Dashboard/DateRangeFilter';
import ProductOrdersChart from '../components/Dashboard/ProductOrdersChart';
import HighlyPerformingProductsChart from '../components/Dashboard/HighlyPerformingProductsChart';
import RecentOrdersTable from '../components/Dashboard/RecentOrdersTable';
import PagePreloader from '../components/common/PagePreloader';
import { getDashboardStats } from '../utils/dashboardService';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('12 months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState([
    {
      title: 'Total Pharmacies',
      value: '0',
      change: '+0%',
      showChange: true,
    },
    {
      title: 'Total Patients',
      value: '0',
      change: '+0%',
      showChange: true,
    },
    {
      title: 'Total Suppliers',
      value: '0',
      change: '+0%',
      showChange: true,
    },
    {
      title: 'Total Sales (GHS)',
      value: '0.00',
      change: null,
      showChange: false,
    },
    {
      title: 'Outstanding Payment (GHS)',
      value: '0.00',
      change: null,
      showChange: false,
    },
    {
      title: 'Total DDI Users',
      value: '0',
      change: '+0%',
      showChange: true,
    },
  ]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getDashboardStats({ dateRange: selectedDateRange });
        
        // Handle different response structures
        const statsData = response.data || response.stats || response;

        // Map API response to KPI cards
        const updatedKpiData = [
          {
            title: 'Total Pharmacies',
            value: statsData.totalPharmacies?.toString() || '0',
            change: statsData.pharmaciesChange || '+0%',
            showChange: true,
          },
          {
            title: 'Total Patients',
            value: statsData.totalPatients?.toString() || '0',
            change: statsData.patientsChange || '+0%',
            showChange: true,
          },
          {
            title: 'Total Suppliers',
            value: statsData.totalSuppliers?.toString() || '0',
            change: statsData.suppliersChange || '+0%',
            showChange: true,
          },
          {
            title: 'Total Sales (GHS)',
            value: statsData.totalSales?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
            change: null,
            showChange: false,
          },
          {
            title: 'Outstanding Payment (GHS)',
            value: statsData.outstandingPayment?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
            change: null,
            showChange: false,
          },
          {
            title: 'Total DDI Users',
            value: statsData.totalDDIUsers?.toString() || '0',
            change: statsData.ddiUsersChange || '+0%',
            showChange: true,
          },
        ];

        console.log('📊 Dashboard stats updated:', updatedKpiData);
        setKpiData(updatedKpiData);
      } catch (err) {
        console.error('❌ Error fetching dashboard stats:', err);
        
        // Handle 401 errors gracefully
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          return;
        }
        
        // Handle 404 errors
        if (err.response?.status === 404) {
          setError('Dashboard endpoint not found. Please verify the endpoint with your backend developer.');
          console.error('404 Error - Dashboard endpoint:', {
            message: err.message,
            url: err.config?.baseURL + err.config?.url,
          });
          return;
        }
        
        setError(err.message || 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [selectedDateRange]);

  if (loading) {
    return <PagePreloader message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <DateRangeFilter
          selectedRange={selectedDateRange}
          onRangeChange={setSelectedDateRange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="dashboard-error" style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #fca5a5'
        }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            showChange={kpi.showChange}
            isGreen={kpi.title === 'Total DDI Users'}
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