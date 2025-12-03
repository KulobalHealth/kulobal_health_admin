import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlus } from 'react-icons/hi2';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
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
  const [images, setImages] = useState([]); // { file, preview, name }
  const imagesRef = useRef(new Set()); // track created object URLs for cleanup
  const MAX_IMAGES = 5;
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    // only accept image files
    const imageFiles = files.filter((f) => f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const allowed = Math.max(0, MAX_IMAGES - images.length);
    const toAdd = imageFiles.slice(0, allowed);
    if (toAdd.length === 0) {
      window.alert(`Maximum of ${MAX_IMAGES} images allowed`);
      e.target.value = '';
      return;
    }

    const newImages = toAdd.map((file) => {
      const preview = URL.createObjectURL(file);
      imagesRef.current.add(preview);
      return { file, preview, name: file.name };
    });

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1);
      // revoke object URL to free memory and remove from ref
      if (removed[0]?.preview) {
        URL.revokeObjectURL(removed[0].preview);
        imagesRef.current.delete(removed[0].preview);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      // revoke all previews on unmount
      imagesRef.current.forEach((url) => URL.revokeObjectURL(url));
      imagesRef.current.clear();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement API call to add product
      console.log('Form data:', formData);
      console.log('Images:', images);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to products list
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      {/* Back Button and Title */}
      <div className="add-product-header">
        <button className="back-button" onClick={() => navigate('/products')}>
          <HiArrowLeft />
          <span>Back</span>
        </button>
        <div>
          <h1 className="add-product-title">Add New Product</h1>
          <p className="add-product-subtitle">
            Provide the required information to successfully add a new product to stock
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        {/* Product Stock Information Section */}
        <div className="form-section">
          <h2 className="form-section-title">Product Stock Information</h2>

          {/* Product Images */}
          <div className="form-group">
            <div className="image-upload-header">
              <label className="form-label">
                Product Images <span className="required">*</span>
              </label>
              <div className="image-count">
                {images.length}/{MAX_IMAGES}
              </div>
            </div>
            <div className="single-image-upload">
              <label className="image-upload-label">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleImageChange}
                  className="image-upload-input"
                />
                <div className="image-upload-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 4V20M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="image-upload-text">Upload</span>
                <span className="image-upload-hint">PNG or JPG</span>
              </label>

              {images.length > 0 ? (
                <div className="image-preview-grid">
                  {images.map((img, index) => (
                    <div key={index} className="image-preview-box">
                      <div className="image-preview">
                        <img
                          src={img.preview}
                          alt={img.name ? `Product image ${index + 1} - ${img.name}` : `Product image ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="remove-image-button"
                          aria-label={`Remove image ${index + 1}`}
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="image-caption" title={img.name}>{img.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="image-placeholder">No images selected</div>
              )}
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
                Price Per Product (GH₵) <span className="required">*</span>
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
            {loading ? 'Adding...' : 'Add New Stock'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

