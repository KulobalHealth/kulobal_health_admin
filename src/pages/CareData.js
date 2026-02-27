import React, { useState, useEffect, useMemo } from 'react';
import {
  HiMagnifyingGlass,
  HiEye,
  HiLockClosed,
  HiLockOpen,
  HiFunnel,
  HiXMark,
  HiDocumentText,
} from 'react-icons/hi2';
import { getCareData, requestPatientDataAccess, getPatientData } from '../utils/careDataService';
import './CareData.css';

const CareData = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('10 per page');
  const [currentPage, setCurrentPage] = useState(1);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [patientDataAccess, setPatientDataAccess] = useState({}); // Track which prescriptions have patient data access
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessPrescriptionId, setAccessPrescriptionId] = useState(null);

  const itemsPerPageOptions = ['10 per page', '25 per page', '50 per page', '100 per page'];
  const itemsPerPageValue = parseInt(itemsPerPage, 10) || 10;

  // Fetch care data from API
  useEffect(() => {
    const fetchCareData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCareData();
        
        // Handle different response structures
        let prescriptionsData = [];
        if (Array.isArray(response)) {
          prescriptionsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          prescriptionsData = response.data;
        } else if (response.prescriptions && Array.isArray(response.prescriptions)) {
          prescriptionsData = response.prescriptions;
        } else if (response.careData && Array.isArray(response.careData)) {
          prescriptionsData = response.careData;
        }
        
        // Normalize prescriptions to ensure they have an 'id' field
        prescriptionsData = prescriptionsData.map(prescription => ({
          ...prescription,
          id: prescription.id || prescription._id || prescription.prescriptionId || prescription.ID,
        }));
        
        setPrescriptions(prescriptionsData);
        console.log('📋 Loaded prescriptions:', prescriptionsData.length);
      } catch (err) {
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          return;
        }
        
        if (err.response?.status === 404) {
          setError('Care data endpoint not found. The endpoint may not be implemented yet.');
          setPrescriptions([]);
          return;
        }
        
        setError(err.message || 'Failed to fetch care data');
        console.error('Error fetching care data:', err);
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCareData();
  }, []);

  // Filter prescriptions based on search query
  const filteredPrescriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return prescriptions;

    return prescriptions.filter((prescription) => {
      const searchableFields = [
        prescription.prescriptionId,
        prescription.orderId,
        prescription.pharmacyName,
        prescription.pharmacy?.name,
        prescription.patientName,
        prescription.patient?.name,
        prescription.status,
        prescription.createdAt,
        prescription.uploadedAt,
      ];

      return searchableFields.some((field) => {
        if (field === null || field === undefined) return false;
        return String(field).toLowerCase().includes(query);
      });
    });
  }, [prescriptions, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPrescriptions.length / itemsPerPageValue) || 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPageValue]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPrescriptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPageValue;
    return filteredPrescriptions.slice(start, start + itemsPerPageValue);
  }, [filteredPrescriptions, currentPage, itemsPerPageValue]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery((prev) => prev.trim());
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const handleRequestPatientAccess = async (prescriptionId) => {
    setAccessPrescriptionId(prescriptionId);
    setShowAccessModal(true);
  };

  const confirmPatientAccess = async () => {
    if (!accessPrescriptionId) return;

    try {
      setRequestingAccess(true);
      await requestPatientDataAccess(accessPrescriptionId);
      
      // Fetch patient data after access is granted
      const patientData = await getPatientData(accessPrescriptionId);
      
      // Update the prescription with patient data
      setPrescriptions(prev => prev.map(p => 
        p.id === accessPrescriptionId 
          ? { ...p, patientData, hasPatientAccess: true }
          : p
      ));
      
      // Mark as having access
      setPatientDataAccess(prev => ({
        ...prev,
        [accessPrescriptionId]: true
      }));
      
      setShowAccessModal(false);
      setAccessPrescriptionId(null);
    } catch (err) {
      console.error('Error requesting patient data access:', err);
      alert(err.message || 'Failed to request patient data access. Please try again.');
    } finally {
      setRequestingAccess(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
    if (statusLower.includes('approved') || statusLower.includes('completed')) {
      return { backgroundColor: '#d1fae5', color: '#065f46' };
    }
    if (statusLower.includes('rejected') || statusLower.includes('cancelled')) {
      return { backgroundColor: '#fee2e2', color: '#991b1b' };
    }
    return { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  return (
    <div className="care-data-page">
      {/* Admin Watermark */}
      <div className="admin-watermark">Admin</div>
      
      {/* Header */}
      <div className="care-data-header">
        <div>
          <h1 className="care-data-title">Care Data</h1>
          <p className="care-data-subtitle">View prescription data uploaded by pharmacies</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="care-data-error" style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="care-data-filters">
        <form onSubmit={handleSearch} className="care-data-search-form">
          <div className="care-data-search-input-wrapper">
            <HiMagnifyingGlass className="care-data-search-icon" />
            <input
              type="text"
              placeholder="Search by prescription ID, pharmacy, patient, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="care-data-search-input"
            />
          </div>
          <button type="submit" className="care-data-search-button">
            Search
          </button>
        </form>
        <div className="care-data-filter-controls">
          <select
            className="care-data-items-per-page"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value)}
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading prescription data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPrescriptions.length === 0 && (
        <div className="care-data-empty-state">
          <HiDocumentText className="care-data-empty-icon" />
          <h2 className="care-data-empty-title">
            {prescriptions.length === 0
              ? 'No prescription data available'
              : `No prescriptions found matching "${searchQuery}"`}
          </h2>
          <p className="care-data-empty-text">
            {prescriptions.length === 0
              ? 'Prescription data will appear here once pharmacies start uploading prescriptions.'
              : 'Try adjusting your search criteria.'}
          </p>
        </div>
      )}

      {/* Prescriptions Table */}
      {!loading && filteredPrescriptions.length > 0 && (
        <div className="care-data-table-container">
          <table className="care-data-table">
            <thead>
              <tr>
                <th>Prescription ID</th>
                <th>Pharmacy</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Uploaded Date</th>
                <th>Patient Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPrescriptions.map((prescription) => {
                const hasAccess = patientDataAccess[prescription.id] || prescription.hasPatientAccess;
                const pharmacyName = prescription.pharmacyName || 
                                  prescription.pharmacy?.name || 
                                  prescription.pharmacy?.pharmacyName || 
                                  'Unknown Pharmacy';
                
                return (
                  <tr key={prescription.id}>
                    <td>
                      <span className="prescription-id">
                        {prescription.prescriptionId || prescription.id || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="pharmacy-name">{pharmacyName}</span>
                    </td>
                    <td>
                      <span className="order-id">
                        {prescription.orderId || prescription.order?.id || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={getStatusBadgeStyle(prescription.status)}
                      >
                        {prescription.status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className="upload-date">
                        {formatDate(prescription.uploadedAt || prescription.createdAt)}
                      </span>
                    </td>
                    <td>
                      {hasAccess ? (
                        <span className="patient-access-badge granted">
                          <HiLockOpen />
                          Access Granted
                        </span>
                      ) : (
                        <button
                          className="request-access-button"
                          onClick={() => handleRequestPatientAccess(prescription.id)}
                          title="Request access to view patient data"
                        >
                          <HiLockClosed />
                          Request Access
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="prescription-actions">
                        <button
                          className="action-button view-button"
                          title="View Details"
                          onClick={() => handleViewDetails(prescription)}
                        >
                          <HiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredPrescriptions.length > 0 && (
        <div className="care-data-pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPageValue + 1} to{' '}
            {Math.min(currentPage * itemsPerPageValue, filteredPrescriptions.length)} of{' '}
            {filteredPrescriptions.length} prescriptions
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="pagination-button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Patient Data Access Modal */}
      {showAccessModal && (
        <div className="access-modal-overlay" onClick={() => !requestingAccess && setShowAccessModal(false)}>
          <div className="access-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="access-modal-close"
              onClick={() => setShowAccessModal(false)}
              disabled={requestingAccess}
            >
              <HiXMark />
            </button>
            <div className="access-modal-content">
              <div className="access-modal-icon">
                <HiLockClosed />
              </div>
              <h2 className="access-modal-title">Request Patient Data Access</h2>
              <p className="access-modal-message">
                Patient data is protected for privacy compliance. You need to request access to view patient information.
              </p>
              <p className="access-modal-warning">
                <strong>Privacy Notice:</strong> Accessing patient data requires proper authorization and compliance with data protection regulations.
              </p>
              <div className="access-modal-actions">
                <button
                  className="access-modal-cancel"
                  onClick={() => setShowAccessModal(false)}
                  disabled={requestingAccess}
                >
                  Cancel
                </button>
                <button
                  className="access-modal-confirm"
                  onClick={confirmPatientAccess}
                  disabled={requestingAccess}
                >
                  {requestingAccess ? 'Requesting...' : 'Request Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="details-modal-close"
              onClick={() => setShowDetailsModal(false)}
            >
              <HiXMark />
            </button>
            <div className="details-modal-content">
              <h2 className="details-modal-title">Prescription Details</h2>
              
              <div className="details-section">
                <h3 className="details-section-title">Prescription Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Prescription ID:</span>
                    <span className="detail-value">
                      {selectedPrescription.prescriptionId || selectedPrescription.id || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">
                      {selectedPrescription.orderId || selectedPrescription.order?.id || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pharmacy:</span>
                    <span className="detail-value">
                      {selectedPrescription.pharmacyName || 
                       selectedPrescription.pharmacy?.name || 
                       'Unknown Pharmacy'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span 
                      className="detail-value status-badge"
                      style={getStatusBadgeStyle(selectedPrescription.status)}
                    >
                      {selectedPrescription.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Uploaded Date:</span>
                    <span className="detail-value">
                      {formatDate(selectedPrescription.uploadedAt || selectedPrescription.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Data Section - Only show if access is granted */}
              {(patientDataAccess[selectedPrescription.id] || selectedPrescription.hasPatientAccess) && selectedPrescription.patientData ? (
                <div className="details-section">
                  <h3 className="details-section-title">Patient Information</h3>
                  <div className="patient-data-warning">
                    <HiLockOpen />
                    <span>Patient data access granted</span>
                  </div>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Patient Name:</span>
                      <span className="detail-value">
                        {selectedPrescription.patientData?.name || 
                         selectedPrescription.patientName || 
                         'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Age:</span>
                      <span className="detail-value">
                        {selectedPrescription.patientData?.age || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">
                        {selectedPrescription.patientData?.gender || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">
                        {selectedPrescription.patientData?.phone || 
                         selectedPrescription.patientData?.email || 
                         'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="details-section">
                  <h3 className="details-section-title">Patient Information</h3>
                  <div className="patient-data-locked">
                    <HiLockClosed />
                    <p>Patient data is locked for privacy protection.</p>
                    <button
                      className="request-access-in-modal"
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleRequestPatientAccess(selectedPrescription.id);
                      }}
                    >
                      Request Access to Patient Data
                    </button>
                  </div>
                </div>
              )}

              {/* Prescription Content */}
              {selectedPrescription.prescriptionContent && (
                <div className="details-section">
                  <h3 className="details-section-title">Prescription Content</h3>
                  <div className="prescription-content">
                    {typeof selectedPrescription.prescriptionContent === 'string' 
                      ? selectedPrescription.prescriptionContent
                      : JSON.stringify(selectedPrescription.prescriptionContent, null, 2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareData;

