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
} from 'react-icons/hi2';
import PagePreloader from '../components/common/PagePreloader';
import './Pharmacies.css';

const Pharmacies = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pharmacies, setPharmacies] = useState([
    {
      id: 'P001',
      name: 'Humble Pharmacy',
      location: 'Accra',
      branches: 38,
      licenceNumber: 'L89303003838',
      pharmacistName: 'John Doe',
      email: 'example@gmail.com',
      phone: '0540977343',
      subscriptionPlan: 'Premium Plan',
      subscriptionStatus: 'Active',
      subscriptionExpiry: 'June 30, 2025',
    },
    {
      id: 'P002',
      name: 'MediCare Pharmacy',
      location: 'Kumasi',
      branches: 25,
      licenceNumber: 'L89303003839',
      pharmacistName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0241234567',
      subscriptionPlan: 'Basic Plan',
      subscriptionStatus: 'Active',
      subscriptionExpiry: 'March 15, 2025',
    },
    {
      id: 'P003',
      name: 'Health Plus Pharmacy',
      location: 'Tamale',
      branches: 12,
      licenceNumber: 'L89303003840',
      pharmacistName: 'Michael Brown',
      email: 'michael@example.com',
      phone: '0209876543',
      subscriptionPlan: 'Premium Plan',
      subscriptionStatus: 'Expired',
      subscriptionExpiry: 'January 1, 2025',
    },
    {
      id: 'P004',
      name: 'Wellness Pharmacy',
      location: 'Accra',
      branches: 8,
      licenceNumber: 'L89303003841',
      pharmacistName: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '0551234567',
      subscriptionPlan: 'Standard Plan',
      subscriptionStatus: 'Active',
      subscriptionExpiry: 'December 31, 2025',
    },
    {
      id: 'P005',
      name: 'City Pharmacy',
      location: 'Cape Coast',
      branches: 15,
      licenceNumber: 'L89303003842',
      pharmacistName: 'David Wilson',
      email: 'david@example.com',
      phone: '0261234567',
      subscriptionPlan: 'Premium Plan',
      subscriptionStatus: 'Active',
      subscriptionExpiry: 'August 20, 2025',
    },
    {
      id: 'P006',
      name: 'Community Pharmacy',
      location: 'Takoradi',
      branches: 5,
      licenceNumber: 'L89303003843',
      pharmacistName: 'Emily Davis',
      email: 'emily@example.com',
      phone: '0271234567',
      subscriptionPlan: 'Basic Plan',
      subscriptionStatus: 'Pending',
      subscriptionExpiry: 'February 28, 2025',
    },
  ]);

  // Simulate data fetching on component mount
  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoading(false);
    };

    fetchPharmacies();
  }, []);

  // Filter pharmacies
  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch =
      searchQuery === '' ||
      pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.licenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.pharmacistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharmacy.email.toLowerCase().includes(searchQuery.toLowerCase());

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

  const handleViewPharmacy = (pharmacyId) => {
    navigate(`/pharmacies/${pharmacyId}`);
  };

  const handleEditPharmacy = (pharmacy) => {
    // TODO: Implement edit functionality
    console.log('Edit pharmacy:', pharmacy);
  };

  const handleDeletePharmacy = (pharmacy) => {
    if (window.confirm(`Are you sure you want to delete ${pharmacy.name}?`)) {
      setPharmacies(pharmacies.filter((p) => p.id !== pharmacy.id));
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get unique locations
  const locations = ['All', ...new Set(pharmacies.map((p) => p.location))];

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
                  <th>Licence Number</th>
                  <th>Pharmacist</th>
                  <th>Contact</th>
                  <th>Subscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPharmacies.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No pharmacies found
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
                            <span className="pharmacy-id">{pharmacy.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pharmacy-location">{pharmacy.location}</span>
                      </td>
                      <td>
                        <span className="pharmacy-branches">{pharmacy.branches} Branches</span>
                      </td>
                      <td>
                        <span className="pharmacy-licence">{pharmacy.licenceNumber}</span>
                      </td>
                      <td>
                        <div className="pharmacist-info">
                          <span className="pharmacist-name">{pharmacy.pharmacistName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <span className="contact-email">{pharmacy.email}</span>
                          <span className="contact-phone">{pharmacy.phone}</span>
                        </div>
                      </td>
                      <td>
                        <div className="subscription-info">
                          <span className="subscription-plan">{pharmacy.subscriptionPlan}</span>
                          <span
                            className={`subscription-status ${pharmacy.subscriptionStatus.toLowerCase()}`}
                          >
                            {pharmacy.subscriptionStatus}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button view"
                            onClick={() => handleViewPharmacy(pharmacy.id)}
                            title="View Details"
                          >
                            <HiEye />
                          </button>
                          <button
                            className="action-button edit"
                            onClick={() => handleEditPharmacy(pharmacy)}
                            title="Edit"
                          >
                            <HiPencil />
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => handleDeletePharmacy(pharmacy)}
                            title="Delete"
                          >
                            <HiTrash />
                          </button>
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
    </div>
  );
};

export default Pharmacies;

