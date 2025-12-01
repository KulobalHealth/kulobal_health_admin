import React, { useState, useEffect } from 'react';
import {
  HiMagnifyingGlass,
  HiEllipsisVertical,
  HiPencil,
  HiTrash,
  HiUserPlus,
  HiXMark,
} from 'react-icons/hi2';
import AddSupplierModal from '../components/Suppliers/AddSupplierModal';
import PagePreloader from '../components/common/PagePreloader';
import './Suppliers.css';

const Suppliers = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openActionsMenu, setOpenActionsMenu] = useState(null);
  const [suppliers, setSuppliers] = useState([
    {
      id: 'S8937',
      companyName: 'Supplier Company',
      telephone: '0303435454',
      email: 'example@gmail.com',
      address: 'Lapaz',
      agentName: 'Orlando Diggs',
      agentNumber: '0540977343',
    },
    {
      id: 'S8938',
      companyName: 'Supplier Company',
      telephone: '0303435454',
      email: 'example@gmail.com',
      address: 'Lapaz',
      agentName: 'Orlando Diggs',
      agentNumber: '0540977343',
    },
    {
      id: 'S8939',
      companyName: 'Supplier Company',
      telephone: '0303435454',
      email: 'example@gmail.com',
      address: 'Lapaz',
      agentName: 'Orlando Diggs',
      agentNumber: '0540977343',
    },
    {
      id: 'S8940',
      companyName: 'Supplier Company',
      telephone: '0303435454',
      email: 'example@gmail.com',
      address: 'Lapaz',
      agentName: 'Orlando Diggs',
      agentNumber: '0540977343',
    },
    {
      id: 'S8941',
      companyName: 'Supplier Company',
      telephone: '0303435454',
      email: 'example@gmail.com',
      address: 'Lapaz',
      agentName: 'Orlando Diggs',
      agentNumber: '0540977343',
    },
  ]);

  // Simulate data fetching on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoading(false);
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleToggleActionsMenu = (supplierId) => {
    setOpenActionsMenu(openActionsMenu === supplierId ? null : supplierId);
  };

  const handleEditSupplier = (supplier) => {
    setOpenActionsMenu(null);
    // TODO: Implement edit functionality
    console.log('Edit supplier:', supplier);
  };

  const handleDeleteSupplier = (supplier) => {
    setOpenActionsMenu(null);
    if (window.confirm(`Are you sure you want to delete ${supplier.companyName}?`)) {
      setSuppliers(suppliers.filter((s) => s.id !== supplier.id));
    }
  };

  const handleAddSupplier = (newSupplier) => {
    setSuppliers([...suppliers, { ...newSupplier, id: `S${Math.floor(Math.random() * 10000)}` }]);
    setShowAddModal(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <div className="suppliers-page">
      {/* Header */}
      <div className="suppliers-header">
        <div>
          <h1 className="suppliers-title">Suppliers</h1>
          <p className="suppliers-subtitle">View and manage all suppliers</p>
        </div>
        <button className="add-supplier-button" onClick={() => setShowAddModal(true)}>
          <HiUserPlus />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="suppliers-filters">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <HiMagnifyingGlass className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search supplier"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        <div className="items-per-page-wrapper">
          <select
            className="items-per-page-select"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <PagePreloader message="Loading..." />
      ) : (
        <>
          {/* Table */}
          <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Telephone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Agent Name</th>
              <th>Agent Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSuppliers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  No suppliers found
                </td>
              </tr>
            ) : (
              paginatedSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td>{supplier.companyName}</td>
                  <td>{supplier.telephone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.address}</td>
                  <td>
                    <div className="agent-name-cell">
                      <div className="agent-avatar">
                        {getInitials(supplier.agentName)}
                      </div>
                      <span>{supplier.agentName}</span>
                    </div>
                  </td>
                  <td>{supplier.agentNumber}</td>
                  <td>
                    <div className="actions-cell-wrapper">
                      <button
                        className="actions-button"
                        onClick={() => handleToggleActionsMenu(supplier.id)}
                      >
                        <HiEllipsisVertical />
                      </button>
                      {openActionsMenu === supplier.id && (
                        <>
                          <div
                            className="actions-overlay"
                            onClick={() => setOpenActionsMenu(null)}
                          />
                          <div className="actions-dropdown">
                            <button
                              className="actions-dropdown-item"
                              onClick={() => handleEditSupplier(supplier)}
                            >
                              <HiPencil />
                              <span>Edit Supplier</span>
                            </button>
                            <button
                              className="actions-dropdown-item delete"
                              onClick={() => handleDeleteSupplier(supplier)}
                            >
                              <HiTrash />
                              <span>Delete Supplier</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

          {/* Pagination */}
          {filteredSuppliers.length > 0 && (
            <div className="suppliers-pagination">
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

      {/* Add Supplier Modal */}
      {showAddModal && (
        <AddSupplierModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSupplier}
        />
      )}
    </div>
  );
};

export default Suppliers;

