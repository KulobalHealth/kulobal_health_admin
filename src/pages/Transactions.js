import React, { useState, useEffect } from 'react';
import {
  HiMagnifyingGlass,
  HiArrowDownCircle,
  HiArrowUpCircle,
  HiFunnel,
  HiCurrencyDollar,
} from 'react-icons/hi2';
import PagePreloader from '../components/common/PagePreloader';
import './Transactions.css';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line no-unused-vars
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-001',
      type: 'received',
      typeLabel: 'Payment Received',
      amount: 5000.00,
      currency: 'GHS',
      from: 'Pharmacy ABC',
      description: 'Payment for Order #ORD-1234',
      date: '2025-01-15',
      time: '10:30 AM',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'TXN-002',
      type: 'paid',
      typeLabel: 'Payment Made',
      amount: 3000.00,
      currency: 'GHS',
      to: 'Supplier XYZ',
      description: 'Payment for Product Stock',
      date: '2025-01-15',
      time: '09:15 AM',
      status: 'completed',
      paymentMethod: 'Mobile Money',
    },
    {
      id: 'TXN-003',
      type: 'received',
      typeLabel: 'Payment Received',
      amount: 7500.00,
      currency: 'GHS',
      from: 'Pharmacy DEF',
      description: 'Payment for Order #ORD-1235',
      date: '2025-01-14',
      time: '03:45 PM',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'TXN-004',
      type: 'paid',
      typeLabel: 'Payment Made',
      amount: 2000.00,
      currency: 'GHS',
      to: 'Supplier ABC',
      description: 'Payment for Medical Supplies',
      date: '2025-01-14',
      time: '02:20 PM',
      status: 'pending',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'TXN-005',
      type: 'received',
      typeLabel: 'Payment Received',
      amount: 4500.00,
      currency: 'GHS',
      from: 'Pharmacy GHI',
      description: 'Payment for Order #ORD-1236',
      date: '2025-01-13',
      time: '11:00 AM',
      status: 'completed',
      paymentMethod: 'Mobile Money',
    },
    {
      id: 'TXN-006',
      type: 'paid',
      typeLabel: 'Payment Made',
      amount: 1500.00,
      currency: 'GHS',
      to: 'Supplier LMN',
      description: 'Payment for Test Kits',
      date: '2025-01-13',
      time: '10:15 AM',
      status: 'completed',
      paymentMethod: 'Mobile Money',
    },
    {
      id: 'TXN-007',
      type: 'received',
      typeLabel: 'Payment Received',
      amount: 6000.00,
      currency: 'GHS',
      from: 'Pharmacy JKL',
      description: 'Payment for Order #ORD-1237',
      date: '2025-01-12',
      time: '04:30 PM',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
    },
    {
      id: 'TXN-008',
      type: 'paid',
      typeLabel: 'Payment Made',
      amount: 4000.00,
      currency: 'GHS',
      to: 'Supplier OPQ',
      description: 'Payment for Equipment',
      date: '2025-01-12',
      time: '01:45 PM',
      status: 'failed',
      paymentMethod: 'Bank Transfer',
    },
  ]);

  // Simulate data fetching
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  // Calculate totals
  const totalReceived = transactions
    .filter((t) => t.type === 'received' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter((t) => t.type === 'paid' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalReceived - totalPaid;

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === '' ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.from && transaction.from.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.to && transaction.to.toLowerCase().includes(searchQuery.toLowerCase())) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || transaction.type === selectedType.toLowerCase();

    const matchesStatus =
      selectedStatus === 'All' || transaction.status === selectedStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 10); i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...');
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1 className="transactions-title">Transactions</h1>
          <p className="transactions-subtitle">Track all payments received and made to suppliers</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="transactions-kpi-grid">
        <div className="transaction-kpi-card received">
          <div className="kpi-icon received-icon">
            <HiArrowDownCircle />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Received</p>
            <h3 className="kpi-value">GHS {formatAmount(totalReceived)}</h3>
          </div>
        </div>
        <div className="transaction-kpi-card paid">
          <div className="kpi-icon paid-icon">
            <HiArrowUpCircle />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Paid Out</p>
            <h3 className="kpi-value">GHS {formatAmount(totalPaid)}</h3>
          </div>
        </div>
        <div className="transaction-kpi-card balance">
          <div className="kpi-icon balance-icon">
            <HiCurrencyDollar />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Net Balance</p>
            <h3 className={`kpi-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>
              GHS {formatAmount(Math.abs(netBalance))}
            </h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="transactions-filters">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <HiMagnifyingGlass className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        <div className="filter-group">
          <div className="filter-wrapper">
            <HiFunnel className="filter-icon" />
            <select
              className="filter-select"
              value={selectedType}
              onChange={handleTypeChange}
            >
              <option value="All">All Types</option>
              <option value="received">Payment Received</option>
              <option value="paid">Payment Made</option>
            </select>
          </div>
          <div className="filter-wrapper">
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="All">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="filter-wrapper">
            <select
              className="filter-select"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <PagePreloader message="Loading transactions..." />
      ) : (
        <>
          {/* Table */}
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>From/To</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className="transaction-id">{transaction.id}</span>
                      </td>
                      <td>
                        <span
                          className={`transaction-type-badge ${
                            transaction.type === 'received' ? 'received' : 'paid'
                          }`}
                        >
                          {transaction.type === 'received' ? (
                            <HiArrowDownCircle />
                          ) : (
                            <HiArrowUpCircle />
                          )}
                          <span>{transaction.typeLabel}</span>
                        </span>
                      </td>
                      <td>
                        <span className="transaction-party">
                          {transaction.type === 'received' ? transaction.from : transaction.to}
                        </span>
                      </td>
                      <td>
                        <span className="transaction-description">{transaction.description}</span>
                      </td>
                      <td>
                        <span
                          className={`transaction-amount ${
                            transaction.type === 'received' ? 'received' : 'paid'
                          }`}
                        >
                          {transaction.type === 'received' ? '+' : '-'}
                          {transaction.currency} {formatAmount(transaction.amount)}
                        </span>
                      </td>
                      <td>
                        <div className="transaction-datetime">
                          <span className="transaction-date">{formatDate(transaction.date)}</span>
                          <span className="transaction-time">{transaction.time}</span>
                        </div>
                      </td>
                      <td>
                        <span className="payment-method">{transaction.paymentMethod}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${transaction.status}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="transactions-pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <div className="pagination-numbers">
                {pages.map((page, index) => (
                  <button
                    key={index}
                    className={`pagination-number ${page === currentPage ? 'active' : ''} ${
                      page === '...' ? 'ellipsis' : ''
                    }`}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;

