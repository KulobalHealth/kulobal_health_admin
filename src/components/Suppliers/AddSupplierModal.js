import React, { useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import './AddSupplierModal.css';

const AddSupplierModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    telephone: '',
    email: '',
    address: '',
    agentName: '',
    agentPhoneNumber: '',
    countryCode: '+233',
  });

  const [errors, setErrors] = useState({});

  const countryCodes = [
    { code: '+233', flag: '🇬🇭', country: 'Ghana' },
    { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
    { code: '+254', flag: '🇰🇪', country: 'Kenya' },
    { code: '+27', flag: '🇿🇦', country: 'South Africa' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Telephone is required';
    } else if (!/^\d+$/.test(formData.telephone)) {
      newErrors.telephone = 'Telephone must contain only numbers';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.agentName.trim()) {
      newErrors.agentName = 'Agent name is required';
    }

    if (!formData.agentPhoneNumber.trim()) {
      newErrors.agentPhoneNumber = 'Agent phone number is required';
    } else if (!/^\d+$/.test(formData.agentPhoneNumber)) {
      newErrors.agentPhoneNumber = 'Phone number must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAdd(formData);
      // Reset form
      setFormData({
        companyName: '',
        telephone: '',
        email: '',
        address: '',
        agentName: '',
        agentPhoneNumber: '',
        countryCode: '+233',
      });
    }
  };

  return (
    <div className="add-supplier-modal-overlay" onClick={onClose}>
      <div className="add-supplier-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Add New Supplier</h2>
          <button className="modal-close-button" onClick={onClose} aria-label="Close">
            <HiXMark />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="supplier-form">
          {/* Supplier Information Section */}
          <div className="form-section">
            <h3 className="section-title">Supplier Information</h3>

            <div className="form-group">
              <label htmlFor="companyName" className="form-label">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={`form-input ${errors.companyName ? 'error' : ''}`}
              />
              {errors.companyName && (
                <span className="error-message">{errors.companyName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="telephone" className="form-label">
                Telephone <span className="required">*</span>
              </label>
              <input
                type="text"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Eg. 030345408448"
                className={`form-input ${errors.telephone ? 'error' : ''}`}
              />
              {errors.telephone && (
                <span className="error-message">{errors.telephone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Address <span className="required">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter patients address"
                className={`form-input ${errors.address ? 'error' : ''}`}
              />
              {errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>
          </div>

          {/* Agent Information Section */}
          <div className="form-section">
            <h3 className="section-title">Agent Information</h3>

            <div className="form-group">
              <label htmlFor="agentName" className="form-label">
                Agent Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="agentName"
                name="agentName"
                value={formData.agentName}
                onChange={handleChange}
                placeholder="Enter email"
                className={`form-input ${errors.agentName ? 'error' : ''}`}
              />
              {errors.agentName && (
                <span className="error-message">{errors.agentName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="agentPhoneNumber" className="form-label">
                Agent Phone Number <span className="required">*</span>
              </label>
              <div className="phone-input-wrapper">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="country-code-select"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="agentPhoneNumber"
                  name="agentPhoneNumber"
                  value={formData.agentPhoneNumber}
                  onChange={handleChange}
                  placeholder="eg. 0540977343"
                  className={`form-input phone-input ${errors.agentPhoneNumber ? 'error' : ''}`}
                />
              </div>
              {errors.agentPhoneNumber && (
                <span className="error-message">{errors.agentPhoneNumber}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Add Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;

