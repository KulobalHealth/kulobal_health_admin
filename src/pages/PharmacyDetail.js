import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiBuildingOffice2,
  HiUser,
  HiCreditCard,
  HiDocumentText,
} from 'react-icons/hi2';
import PagePreloader from '../components/common/PagePreloader';
import { getPharmacyById } from '../utils/pharmaciesService';
import './PharmacyDetail.css';

const PharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if pharmacy data was passed via navigation state
        if (location.state?.pharmacy) {
          console.log('✅ Using pharmacy data from navigation state');
          setPharmacy(location.state.pharmacy);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        console.log('🏥 Fetching pharmacy details for ID:', id);
        const response = await getPharmacyById(id);
        
        // Handle different response structures
        const pharmacyData = response.data || response.pharmacy || response;
        
        // Normalize pharmacy data to match expected structure
        const normalizedPharmacy = {
          id: pharmacyData.id || pharmacyData._id || pharmacyData.pharmacyId,
          pharmacyId: pharmacyData.pharmacyId,
          name: pharmacyData.pharmacy || pharmacyData.name || pharmacyData.pharmacyName,
          location: pharmacyData.location || pharmacyData.city,
          branches: pharmacyData.branch || pharmacyData.branches || 0,
          licenceNumber: pharmacyData.licenceNumber || 'N/A',
          address: pharmacyData.gps || pharmacyData.address || '',
          pharmacistName: `${pharmacyData.firstName || ''} ${pharmacyData.lastName || ''}`.trim() || 'N/A',
          pharmacistLicenceNumber: pharmacyData.pharmacistLicenceNumber || '',
          email: pharmacyData.email || '',
          phone: pharmacyData.phoneNumber || pharmacyData.phone || '',
          subscriptionPlan: pharmacyData.subscriptionPlan || 'Free Trial',
          subscriptionStatus: pharmacyData.subscriptionStatus || 'Active',
          subscriptionExpiry: pharmacyData.subscriptionExpiry || '',
          region: pharmacyData.region || '',
          city: pharmacyData.city || '',
          gps: pharmacyData.gps || '',
          pharmacyBio: pharmacyData.pharmacyBio || '',
          photo: pharmacyData.photo || '',
          dateCreated: pharmacyData.dateCreated || '',
          firstName: pharmacyData.firstName || '',
          lastName: pharmacyData.lastName || '',
          totalPatients: pharmacyData.totalPatients || 0,
          rapidTestsConducted: pharmacyData.rapidTestsConducted || 0,
        };
        
        console.log('✅ Pharmacy details loaded:', normalizedPharmacy);
        setPharmacy(normalizedPharmacy);
      } catch (err) {
        console.error('❌ Error fetching pharmacy details:', err);
        
        // Handle 401 errors gracefully
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          return;
        }
        
        // Handle 404 errors
        if (err.response?.status === 404) {
          setError('Pharmacy not found');
          return;
        }
        
        setError(err.message || 'Failed to load pharmacy details');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacy();
  }, [id]);

  if (loading) {
    return <PagePreloader message="Loading pharmacy details..." />;
  }

  if (error || !pharmacy) {
    return (
      <div className="pharmacy-detail-page">
        <div className="pharmacy-not-found">
          <h2>{error || 'Pharmacy not found'}</h2>
          {error && (
            <p style={{ color: '#dc2626', marginTop: '12px' }}>{error}</p>
          )}
          <button onClick={() => navigate('/pharmacies')} className="back-button">
            <HiArrowLeft />
            Back to Pharmacies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-detail-page">
      {/* Header */}
      <div className="pharmacy-detail-header">
        <button className="back-button" onClick={() => navigate('/pharmacies')}>
          <HiArrowLeft />
          Back
        </button>
        <div className="pharmacy-detail-title-section">
          <h1 className="pharmacy-detail-title">{pharmacy.name}</h1>
          <div className="pharmacy-tags">
            <span className="pharmacy-tag">{pharmacy.location}</span>
            <span className="pharmacy-tag">{pharmacy.branches} Branches</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="pharmacy-detail-grid">
        {/* Pharmacy Information Card */}
        <div className="pharmacy-detail-card card-1">
          <div className="card-icon-wrapper pharmacy-icon">
            <HiBuildingOffice2 />
          </div>
          <h2 className="card-title">Pharmacy Information</h2>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Pharmacy Name</span>
              <span className="info-value">{pharmacy.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Licence Number</span>
              <span className="info-value">{pharmacy.licenceNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location</span>
              <span className="info-value">{pharmacy.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Branches</span>
              <span className="info-value">{pharmacy.branches}</span>
            </div>
          </div>
        </div>

        {/* Pharmacist Information Card */}
        <div className="pharmacy-detail-card card-2">
          <div className="card-icon-wrapper pharmacist-icon">
            <HiUser />
          </div>
          <h2 className="card-title">Pharmacist Information</h2>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Pharmacist Name</span>
              <span className="info-value">{pharmacy.pharmacistName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Licence Number</span>
              <span className="info-value">{pharmacy.pharmacistLicenceNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{pharmacy.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{pharmacy.phone}</span>
            </div>
          </div>
        </div>

        {/* Statistics Card - Patients & Rapid Tests */}
        <div className="pharmacy-detail-card stats-card">
          <div className="card-icon-wrapper stats-icon">
            <HiDocumentText />
          </div>
          <h2 className="card-title">Statistics</h2>
          <div className="card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Total Patients</div>
                <div className="stat-value">{pharmacy.totalPatients || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Rapid Tests Conducted</div>
                <div className="stat-value">{pharmacy.rapidTestsConducted || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="pharmacy-detail-card subscription-card card-3">
          <div className="card-icon-wrapper subscription-icon">
            <HiCreditCard />
          </div>
          <h2 className="card-title">Subscription Plan</h2>
          <div className="card-content">
            <div className="subscription-plan-info">
              <h3 className="subscription-plan-name">{pharmacy.subscriptionPlan}</h3>
              <p className="subscription-plan-expiry">Expires on {pharmacy.subscriptionExpiry}</p>
            </div>
            <span
              className={`subscription-status-badge ${pharmacy.subscriptionStatus.toLowerCase()}`}
            >
              <HiCheckCircle />
              {pharmacy.subscriptionStatus}
            </span>
          </div>
        </div>

        {/* Payments & Transactions Card */}
        <div className="pharmacy-detail-card transactions-card card-4">
          <div className="card-icon-wrapper transactions-icon">
            <HiDocumentText />
          </div>
          <h2 className="card-title">Payments & Transactions</h2>
          <div className="card-content">
            {pharmacy.transactions && pharmacy.transactions.length > 0 ? (
              <div className="transactions-list">
                {/* Transaction items would go here */}
              </div>
            ) : (
              <div className="empty-transactions">
                <div className="empty-transactions-icon">
                  <HiDocumentText />
                </div>
                <p className="empty-transactions-text">No transactions found</p>
                <p className="empty-transactions-description">
                  There are currently no payment transactions for this pharmacy at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetail;

