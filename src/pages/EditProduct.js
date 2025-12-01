import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import './EditProduct.css';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    quantity: '',
    brand: '',
    category: '',
    description: '',
    visibility: false,
  });

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'test-kits', label: 'Test Kits' },
    { value: 'medications', label: 'Medications' },
    { value: 'medical-equipment', label: 'Medical Equipment' },
    { value: 'supplements', label: 'Supplements' },
    { value: 'personal-care', label: 'Personal Care' },
    { value: 'baby-care', label: 'Baby Care' },
    { value: 'first-aid', label: 'First Aid' },
    { value: 'wellness', label: 'Wellness Products' },
    { value: 'other', label: 'Other' },
  ];
  const [images, setImages] = useState([
    '/api/placeholder/120/120',
    '/api/placeholder/120/120',
    '/api/placeholder/120/120',
    '/api/placeholder/120/120',
    null,
  ]);
  const [loading, setLoading] = useState(false);

  // Load product data (in real app, fetch from API)
  useEffect(() => {
    // TODO: Fetch product data by id
    // For now, set sample data
    setFormData({
      productName: 'Fertilizer',
      price: '200.00',
      quantity: '300',
      brand: 'Greater Accra',
      category: 'other',
      description: 'Lorem ipsum dolor sit amet consectetur. Odio quisque sed arcu elit justo tortor. Vitae facilisi nam aliquet est placerat venenatis.',
      visibility: true,
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = URL.createObjectURL(file);
      setImages(newImages);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to update product
      console.log('Updating product:', id, formData);
      console.log('Images:', images);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to products list
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-product-page">
      {/* Back Button and Title */}
      <div className="edit-product-header">
        <button className="back-button" onClick={() => navigate('/products')}>
          <HiArrowLeft />
          <span>Back</span>
        </button>
        <div>
          <h1 className="edit-product-title">Edit Product Stock Details</h1>
          <p className="edit-product-subtitle">
            Kindly make the necessary change to successfully update the product details.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-product-form">
        {/* Product Stock Information Section */}
        <div className="form-section">
          <h2 className="form-section-title">Product Stock Information</h2>

          {/* Product Images */}
          <div className="form-group">
            <label className="form-label">
              Product Images <span className="required">*</span>
            </label>
            <div className="image-upload-grid">
              {images.map((image, index) => (
                <div key={index} className="image-upload-box">
                  {image ? (
                    <div className="image-preview">
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <div className="image-overlay">
                        <label className="update-photo-button">
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(e) => handleImageChange(index, e)}
                            className="image-upload-input"
                          />
                          Update photo
                        </label>
                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() => handleRemoveImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="image-upload-label">
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => handleImageChange(index, e)}
                        className="image-upload-input"
                      />
                      <div className="image-upload-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 4V20M4 12H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span className="image-upload-text">Click to upload</span>
                      <span className="image-upload-hint">PNG or JPG</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields-grid">
            <div className="form-group">
              <label htmlFor="productName" className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price Per Product (GHC) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="eg. 200"
                className="form-input"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity" className="form-label">
                Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="eg. 300"
                className="form-input"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand" className="form-label">
                Brand <span className="required">*</span>
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter the product's brand"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input form-select"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Product Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide the product's description"
              className="form-textarea"
              rows="5"
              required
            />
          </div>

          {/* Visibility Toggle */}
          <div className="form-group">
            <div className="visibility-section">
              <div>
                <label htmlFor="visibility" className="form-label">
                  Visibility
                </label>
                <p className="visibility-description">
                  Toggling visibility on makes your product visible on marketplace
                </p>
              </div>
              <label className="visibility-toggle">
                <input
                  type="checkbox"
                  id="visibility"
                  name="visibility"
                  checked={formData.visibility}
                  onChange={handleChange}
                />
                <span className="visibility-toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

