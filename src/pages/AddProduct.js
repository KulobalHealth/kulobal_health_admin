import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import apiClient from '../utils/apiClient';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    productTypeCode: '',
    price: '',
    brand: '',
    manufacturer: '',
    description: '',
    visibility: false,
  });

  const [productTypes, setProductTypes] = useState([]);
  const [images, setImages] = useState([]); // { file, preview, name }
  const imagesRef = useRef(new Set()); // track created object URLs for cleanup
  const MAX_IMAGES = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState(null);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = async (e) => {
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

    // Create preview images first
    const newImages = toAdd.map((file) => {
      const preview = URL.createObjectURL(file);
      imagesRef.current.add(preview);
      return { file, preview, name: file.name, url: null, public_id: null, uploading: true };
    });

    // Add images to state with uploading flag
    setImages((prev) => [...prev, ...newImages]);

    // Upload each image
    const uploadPromises = newImages.map(async (img, index) => {
      try {
        const formData = new FormData();
        formData.append('image', img.file);

        const response = await apiClient.post('/image-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Extract URL and public_id from response
        const imageUrl = response.data?.data?.imageUrl;
        const publicId = response.data?.data?.public_id || response.data?.public_id;
        
        console.log('Image URL:', imageUrl);
        console.log('Public ID:', publicId);
        
        // Update the image with the URL and public_id
        setImages((prev) => {
          const updated = [...prev];
          const imgIndex = prev.length - newImages.length + index;
          if (updated[imgIndex]) {
            updated[imgIndex] = { ...updated[imgIndex], url: imageUrl, public_id: publicId, uploading: false };
          }
          return updated;
        });

        return { success: true, url: imageUrl };
      } catch (error) {
        console.error('Error uploading image:', error);
        
        // Update the image to show error state
        setImages((prev) => {
          const updated = [...prev];
          const imgIndex = prev.length - newImages.length + index;
          if (updated[imgIndex]) {
            updated[imgIndex] = { ...updated[imgIndex], uploading: false, error: true };
          }
          return updated;
        });

        // Remove the failed image after a delay
        setTimeout(() => {
          setImages((prev) => {
            const updated = prev.filter((_, i) => {
              const targetIndex = prev.length - newImages.length + index;
              return i !== targetIndex;
            });
            // Clean up preview URL
            URL.revokeObjectURL(img.preview);
            imagesRef.current.delete(img.preview);
            return updated;
          });
        }, 2000);

        window.alert(`Failed to upload image: ${img.name}. Please try again.`);
        return { success: false, error };
      }
    });

    await Promise.all(uploadPromises);
    e.target.value = '';
  };

  const removeImage = async (index) => {
    const imageToRemove = images[index];
    
    // If image has been uploaded (has public_id), delete it from the server first
    if (imageToRemove?.public_id && !imageToRemove?.uploading) {
      try {
        await apiClient.delete('/image-upload', {
          data: {
            public_id: imageToRemove.public_id
          }
        });
        console.log('Image deleted from server:', imageToRemove.public_id);
      } catch (error) {
        console.error('Error deleting image from server:', error);
        // Still remove from UI even if server delete fails
        // User can manually clean up orphaned images later if needed
      }
    }
    
    // Remove from UI
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

  // Fetch product types on mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoadingProductTypes(true);
      setWarning(null);
      
      try {
        console.log('Fetching product types from API...');
        
        // Use the correct endpoint
        const response = await apiClient.get('/product-type/types-with-products');
        console.log('Product types API response:', response);
        console.log('Response data structure:', response.data);
        
        // Extract the data array from response
        let types = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          types = response.data.data;
        } else if (Array.isArray(response.data)) {
          types = response.data;
        }
        
        console.log('Extracted product types:', types);
        console.log('Number of types found:', types.length);
        
        // Log each type's structure
        if (types.length > 0) {
          console.log('First product type structure:', types[0]);
          console.log('Product type codes available:', types.map(t => t.productTypeCode));
        }
        
        if (types.length > 0) {
          setProductTypes(types);
          console.log('Product types loaded successfully');
        } else {
          throw new Error('No product types returned from API');
        }
      } catch (error) {
        console.error('Error fetching product types:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        setError('Unable to load product categories. Please contact support or try again later.');
        setProductTypes([]);
      } finally {
        setLoadingProductTypes(false);
      }
    };
    
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const currentImagesRef = imagesRef.current;
    return () => {
      // revoke all previews on unmount
      currentImagesRef.forEach((url) => URL.revokeObjectURL(url));
      currentImagesRef.clear();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setWarning(null);

    try {
      // Validate that at least one image has been uploaded successfully
      const uploadedImages = images.filter(img => img.url && !img.uploading && !img.error);
      
      if (uploadedImages.length === 0) {
        setError('Please wait for images to finish uploading or add at least one image');
        setLoading(false);
        return;
      }

      // Prepare product data for API
      const productData = {
        productName: formData.productName,
        productTypeCode: formData.productTypeCode,
        price: parseFloat(formData.price),
        brand: formData.brand,
        manufacturer: formData.manufacturer || formData.brand,
        description: formData.description,
        photos: uploadedImages.map(img => img.url),
      };

      console.log('Submitting product data:', productData);
      console.log('Product Type Code being sent:', formData.productTypeCode);
      console.log('Available product types:', productTypes.map(t => t.productTypeCode));
      console.log('Is this code in the available types?', productTypes.some(t => t.productTypeCode === formData.productTypeCode));

      // Import createProduct dynamically to avoid circular dependencies
      const { createProduct } = await import('../utils/productsService');
      const response = await createProduct(productData);
      
      console.log('Product created successfully:', response);
      
      // Show success message
      setSuccess(true);
      
      // Wait 2 seconds before navigating to show the success message
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product. Please try again.';
      setError(errorMessage);
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

      {/* Warning Message */}
      {warning && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fef3c7', 
          color: '#92400e', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px',
          border: '1px solid #fbbf24'
        }}>
           {warning}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
           {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#dcfce7', 
          color: '#166534', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
           Product added successfully! Redirecting to products list...
        </div>
      )}

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
                          style={{ opacity: img.uploading ? 0.5 : 1 }}
                        />
                        {img.uploading && (
                          <div className="image-uploading-overlay">
                            <div className="image-uploading-spinner"></div>
                          </div>
                        )}
                        {img.error && (
                          <div className="image-error-overlay">
                            <span>✕</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="remove-image-button"
                          aria-label={`Remove image ${index + 1}`}
                          onClick={() => removeImage(index)}
                          disabled={img.uploading}
                        >
                          ×
                        </button>
                      </div>
                      <div className="image-caption" title={img.name}>
                        {img.uploading ? 'Uploading...' : img.error ? 'Failed' : img.name}
                      </div>
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
              <label htmlFor="manufacturer" className="form-label">
                Manufacturer
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Enter the manufacturer (optional)"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="productTypeCode" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="productTypeCode"
                name="productTypeCode"
                value={formData.productTypeCode}
                onChange={handleChange}
                className="form-input form-select"
                required
              >
                <option value="">Select Category</option>
                {loadingProductTypes ? (
                  <option value="" disabled>Loading categories...</option>
                ) : productTypes.length > 0 ? (
                  productTypes.map((type) => (
                    <option key={type.productTypeId} value={type.productTypeCode}>
                      {type.productType}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
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

