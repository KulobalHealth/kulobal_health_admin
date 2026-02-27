import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiMagnifyingGlass,
  HiEye,
  HiPencil,
  HiTrash,
  HiPlus,
  HiFunnel,
  HiBuildingOffice2,
  HiExclamationTriangle,
  HiXMark,
  HiArrowPath,
} from 'react-icons/hi2';
import PagePreloader from '../components/common/PagePreloader';
import { getPharmacies, deletePharmacy, getDeletedPharmacies, reinstatePharmacy } from '../utils/pharmaciesService';
import './Pharmacies.css';

const Pharmacies = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, pharmacyId: null, pharmacyName: '' });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'deleted'
  const [deletedPharmacies, setDeletedPharmacies] = useState([]);

  // Fetch pharmacies from API on component mount
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'active') {
          const response = await getPharmacies();
          
          // Handle different response structures
          let pharmaciesData = response.data || response.pharmacies || response || [];
          
          // Normalize pharmacies to match the component's expected structure
          pharmaciesData = pharmaciesData.map(pharmacy => ({
            id: pharmacy.id || pharmacy._id || pharmacy.pharmacyId,
            pharmacyId: pharmacy.pharmacyId,
            name: pharmacy.pharmacy || pharmacy.name || pharmacy.pharmacyName,
            location: pharmacy.location || pharmacy.city,
            branches: pharmacy.branch || pharmacy.branches || 0,
            licenceNumber: pharmacy.licenceNumber || 'N/A',
            address: pharmacy.gps || pharmacy.address || '',
            pharmacistName: `${pharmacy.firstName || ''} ${pharmacy.lastName || ''}`.trim() || 'N/A',
            pharmacistLicenceNumber: pharmacy.pharmacistLicenceNumber || '',
            email: pharmacy.email || '',
            phone: pharmacy.phoneNumber || pharmacy.phone || '',
            subscriptionPlan: pharmacy.subscriptionPlan || 'Free Trial',
            subscriptionStatus: pharmacy.subscriptionStatus || 'Active',
            subscriptionExpiry: pharmacy.subscriptionExpiry || '',
            region: pharmacy.region || '',
            city: pharmacy.city || '',
            gps: pharmacy.gps || '',
            pharmacyBio: pharmacy.pharmacyBio || '',
            photo: pharmacy.photo || '',
            dateCreated: pharmacy.dateCreated || '',
            firstName: pharmacy.firstName || '',
            lastName: pharmacy.lastName || '',
            totalPatients: pharmacy.totalPatients || 0,
            rapidTestsConducted: pharmacy.rapidTestsConducted || 0,
          }));
          
          console.log('📊 Active pharmacies loaded:', pharmaciesData.length);
          console.log('📊 Sample pharmacy data:', pharmaciesData[0]);
          setPharmacies(pharmaciesData);
        } else {
          // Fetch deleted pharmacies
          const response = await getDeletedPharmacies();
          
          // Handle different response structures
          let deletedData = response.data || response.pharmacies || response || [];
          
          // Normalize deleted pharmacies
          deletedData = deletedData.map(pharmacy => ({
            id: pharmacy.id || pharmacy._id || pharmacy.pharmacyId,
            pharmacyId: pharmacy.pharmacyId,
            name: pharmacy.pharmacy || pharmacy.name || pharmacy.pharmacyName,
            location: pharmacy.location || pharmacy.city,
            branches: pharmacy.branch || pharmacy.branches || 0,
            licenceNumber: pharmacy.licenceNumber || 'N/A',
            address: pharmacy.gps || pharmacy.address || '',
            pharmacistName: `${pharmacy.firstName || ''} ${pharmacy.lastName || ''}`.trim() || 'N/A',
            pharmacistLicenceNumber: pharmacy.pharmacistLicenceNumber || '',
            email: pharmacy.email || '',
            phone: pharmacy.phoneNumber || pharmacy.phone || '',
            subscriptionPlan: pharmacy.subscriptionPlan || 'Free Trial',
            subscriptionStatus: pharmacy.subscriptionStatus || 'Active',
            subscriptionExpiry: pharmacy.subscriptionExpiry || '',
            region: pharmacy.region || '',
            city: pharmacy.city || '',
            gps: pharmacy.gps || '',
            pharmacyBio: pharmacy.pharmacyBio || '',
            photo: pharmacy.photo || '',
            dateCreated: pharmacy.dateCreated || '',
            deletedAt: pharmacy.deletedAt || '',
            firstName: pharmacy.firstName || '',
            lastName: pharmacy.lastName || '',
            totalPatients: pharmacy.totalPatients || 0,
            rapidTestsConducted: pharmacy.rapidTestsConducted || 0,
          }));
          
          console.log('🗑️ Deleted pharmacies loaded:', deletedData.length);
          setDeletedPharmacies(deletedData);
        }
      } catch (err) {
        // Handle 401 errors gracefully
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          return;
        }
        
        // Handle 404 errors
        if (err.response?.status === 404) {
          const errorMsg = activeTab === 'active' 
            ? 'Pharmacies endpoint not found. Please verify the endpoint with your backend developer.'
            : 'Deleted pharmacies endpoint not found. Please verify the endpoint with your backend developer.';
          setError(errorMsg);
          console.error('404 Error - Pharmacies endpoint:', {
            message: err.message,
            url: err.config?.baseURL + err.config?.url,
          });
          if (activeTab === 'active') {
            setPharmacies([]);
          } else {
            setDeletedPharmacies([]);
          }
          return;
        }
        
        setError(err.message || 'Failed to fetch pharmacies');
        console.error('Error fetching pharmacies:', err);
        if (activeTab === 'active') {
          setPharmacies([]);
        } else {
          setDeletedPharmacies([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [activeTab]);

  // Filter pharmacies based on active tab
  const currentPharmacies = activeTab === 'active' ? pharmacies : deletedPharmacies;
  
  const filteredPharmacies = currentPharmacies.filter((pharmacy) => {
    const matchesSearch =
      searchQuery === '' ||
      (pharmacy.name && pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pharmacy.id && pharmacy.id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pharmacy.licenceNumber && pharmacy.licenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pharmacy.pharmacistName && pharmacy.pharmacistName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pharmacy.email && pharmacy.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLocation = selectedLocation === 'All' || pharmacy.location === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPharmacies = filteredPharmacies.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleViewPharmacy = (pharmacy) => {
    // Navigate to pharmacy detail page and pass pharmacy data via state
    navigate(`/pharmacies/${pharmacy.id || pharmacy.pharmacyId}`, {
      state: { pharmacy }
    });
  };

  const handleEditPharmacy = (pharmacy) => {
    // TODO: Implement edit functionality
    console.log('Edit pharmacy:', pharmacy);
  };

  const handleDeletePharmacy = (pharmacy) => {
    // Prioritize pharmacyId field
    const pharmacyId = pharmacy.pharmacyId || pharmacy.id || pharmacy._id;
    const pharmacyName = pharmacy.name || pharmacy.pharmacyName || 'this pharmacy';
    
    console.log('Delete pharmacy - Full pharmacy object:', pharmacy);
    console.log('Delete pharmacy - Extracted pharmacyId:', pharmacyId);
    
    if (!pharmacyId) {
      console.error('Cannot delete: Pharmacy ID is missing', { pharmacy });
      setError('Cannot delete pharmacy: Pharmacy ID is missing');
      return;
    }
    
    setDeleteModal({ isOpen: true, pharmacyId, pharmacyName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.pharmacyId) {
      setDeleteError('Pharmacy ID is missing. Cannot delete.');
      return;
    }
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      console.log('🗑️ Attempting to delete pharmacy:', {
        pharmacyId: deleteModal.pharmacyId,
        pharmacyName: deleteModal.pharmacyName,
      });
      
      const pharmacyIdToDelete = String(deleteModal.pharmacyId).trim();
      
      await deletePharmacy(pharmacyIdToDelete);
      
      // Close modal first
      setDeleteModal({ isOpen: false, pharmacyId: null, pharmacyName: '' });
      setDeleteError(null);
      
      // Show success alert
      alert('Pharmacy deleted successfully!');
      
      // Refresh the page to get updated data
      window.location.reload();
      
      console.log('✅ Pharmacy deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting pharmacy:', err);
      
      if (err.response) {
        console.error('📋 Error Response Status:', err.response.status);
        console.error('📋 Error Response Data:', err.response.data);
      }
      
      const errorMessage = err.message || 'Failed to delete pharmacy. Please try again.';
      setDeleteError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, pharmacyId: null, pharmacyName: '' });
    setDeleteError(null);
    setDeleting(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedLocation('All');
  };

  const handleReinstatePharmacy = async (pharmacy) => {
    const pharmacyId = pharmacy.pharmacyId || pharmacy.id || pharmacy._id;
    const pharmacyName = pharmacy.name || pharmacy.pharmacyName || 'this pharmacy';
    
    console.log('🔄 Reinstate pharmacy - Full pharmacy object:', pharmacy);
    console.log('🔄 Reinstate pharmacy - Extracted pharmacyId:', pharmacyId);
    
    if (!pharmacyId) {
      alert('Cannot reinstate: Pharmacy ID is missing');
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to reinstate "${pharmacyName}"?`);
    if (!confirmed) return;
    
    try {
      await reinstatePharmacy(pharmacyId);
      alert('Pharmacy reinstated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('❌ Error reinstating pharmacy:', err);
      const errorMessage = err.message || 'Failed to reinstate pharmacy. Please try again.';
      alert(errorMessage);
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'N/A';
    }
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get unique locations from current tab data
  const locations = ['All', ...new Set(currentPharmacies.map((p) => p.location).filter(Boolean))];

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
    <div className="pharmacies-page">
      {/* Header */}
      <div className="pharmacies-header">
        <div>
          <h1 className="pharmacies-title">Pharmacies</h1>
          <p className="pharmacies-subtitle">View and manage all registered pharmacies</p>
        </div>
        <button className="add-pharmacy-button" onClick={() => navigate('/pharmacies/add')}>
          <HiPlus />
          <span>Add New Pharmacy</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="pharmacies-tabs">
        <button
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => handleTabChange('active')}
        >
          Active Pharmacies
          {pharmacies.length > 0 && (
            <span className="tab-count">{pharmacies.length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'deleted' ? 'active' : ''}`}
          onClick={() => handleTabChange('deleted')}
        >
          Deleted Pharmacies
          {deletedPharmacies.length > 0 && (
            <span className="tab-count">{deletedPharmacies.length}</span>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="pharmacies-error" style={{ 
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

      {/* Search and Filters */}
      <div className="pharmacies-filters">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <HiMagnifyingGlass className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search pharmacies..."
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
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
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
        <PagePreloader message="Loading pharmacies..." />
      ) : (
        <>
          {/* Table */}
          <div className="pharmacies-table-container">
            <table className="pharmacies-table">
              <thead>
                <tr>
                  <th>Pharmacy</th>
                  <th>Location</th>
                  <th>Branches</th>
                  <th>Pharmacist</th>
                  <th>Contact</th>
                  {activeTab === 'active' ? (
                    <th>Subscription</th>
                  ) : (
                    <th>Deleted At</th>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPharmacies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      {activeTab === 'active' ? 'No active pharmacies found' : 'No deleted pharmacies found'}
                    </td>
                  </tr>
                ) : (
                  paginatedPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id}>
                      <td>
                        <div className="pharmacy-info">
                          <div className="pharmacy-avatar">
                            {getInitials(pharmacy.name)}
                          </div>
                          <div className="pharmacy-details">
                            <span className="pharmacy-name">{pharmacy.name}</span>
                            <span className="pharmacy-id">ID: {pharmacy.id?.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pharmacy-location">{pharmacy.location}</span>
                      </td>
                      <td>
                        <span className="pharmacy-branches">{pharmacy.branches}</span>
                      </td>
                      <td>
                        <span className="pharmacist-name">{pharmacy.pharmacistName}</span>
                      </td>
                      <td>
                        <div className="contact-info">
                          <span className="contact-email">{pharmacy.email}</span>
                          <span className="contact-phone">{pharmacy.phone}</span>
                        </div>
                      </td>
                      <td>
                        {activeTab === 'active' ? (
                          <span className="subscription-badge">Free Trial</span>
                        ) : (
                          <span className="deleted-date">
                            {pharmacy.deletedAt 
                              ? new Date(pharmacy.deletedAt).toLocaleDateString()
                              : 'N/A'
                            }
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button view"
                            onClick={() => handleViewPharmacy(pharmacy)}
                            title="View Details"
                          >
                            <HiEye />
                          </button>
                          {activeTab === 'active' ? (
                            <button
                              className="action-button delete"
                              onClick={() => handleDeletePharmacy(pharmacy)}
                              title="Delete"
                            >
                              <HiTrash />
                            </button>
                          ) : (
                            <button
                              className="action-button reinstate"
                              onClick={() => handleReinstatePharmacy(pharmacy)}
                              title="Reinstate Pharmacy"
                            >
                              <HiArrowPath />
                            </button>
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
          {filteredPharmacies.length > 0 && (
            <div className="pharmacies-pagination">
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="delete-modal-overlay" onClick={!deleting ? handleDeleteCancel : undefined}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="delete-modal-close" 
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              <HiXMark />
            </button>
            <div className="delete-modal-content">
              <div className="delete-modal-icon">
                <HiExclamationTriangle />
              </div>
              <h2 className="delete-modal-title">Delete Pharmacy</h2>
              <p className="delete-modal-message">
                Are you sure you want to delete <strong>"{deleteModal.pharmacyName}"</strong>? This action cannot be undone.
              </p>
              
              {deleteError && (
                <div className="delete-modal-error" style={{
                  padding: '12px',
                  marginTop: '16px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {deleteError}
                </div>
              )}
              
              <div className="delete-modal-actions">
                <button 
                  className="delete-modal-cancel" 
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className="delete-modal-confirm" 
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  style={{ opacity: deleting ? 0.6 : 1, cursor: deleting ? 'not-allowed' : 'pointer' }}
                >
                  {deleting ? 'Deleting...' : 'Delete Pharmacy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacies;

