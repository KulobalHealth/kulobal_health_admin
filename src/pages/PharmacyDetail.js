import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiBuildingOffice2,
  HiUser,
  HiCreditCard,
  HiDocumentText,
} from 'react-icons/hi2';
import PagePreloader from '../components/common/PagePreloader';
import './PharmacyDetail.css';

const PharmacyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pharmacy, setPharmacy] = useState(null);

  // Sample pharmacy data - in a real app, this would come from an API
  const pharmacyData = {
    P001: {
      id: 'P001',
      name: 'Humble Pharmacy',
      location: 'Accra',
      branches: 38,
      licenceNumber: 'L89303003838',
      address: '123 Main Street, Accra, Ghana',
      pharmacistName: 'John Doe',
      pharmacistLicenceNumber: 'LT38379723',
      email: 'example@gmail.com',
      phone: '0540977343',
      subscriptionPlan: 'Premium Plan',
      subscriptionStatus: 'Active',
      subscriptionExpiry: 'June 30, 2025',
      transactions: [],
    },
    P002: {
      id: 'P002',
      name: 'MediCare Pharmacy',
      location: 'Kumasi',
      branches: 25,
      licenceNumber: 'L89303003839',
      address: '456 High Street, Kumasi, Ghana',
      pharmacistName: 'Jane Smith',
      pharmacistLicenceNumber: 'LT38379724',
      email: 'jane@example.com',
      phone: '0241234567',
      subscriptionPlan: 'Basic Plan',
      subscriptionStatus: 'Active',
      subscriptionExpiry: 'March 15, 2025',
      transactions: [],
    },
  };

  useEffect(() => {
    const fetchPharmacy = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const foundPharmacy = pharmacyData[id] || pharmacyData.P001;
      setPharmacy(foundPharmacy);
      setLoading(false);
    };

    fetchPharmacy();
  }, [id]);

  if (loading) {
    return <PagePreloader message="Loading pharmacy details..." />;
  }

  if (!pharmacy) {
    return (
      <div className="pharmacy-detail-page">
        <div className="pharmacy-not-found">
          <h2>Pharmacy not found</h2>
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

