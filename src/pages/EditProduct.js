import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { getProductById, updateProduct } from '../utils/productsService';
import apiClient from '../utils/apiClient';
import './EditProduct.css';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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
  const [images, setImages] = useState([]); // Existing product images
  const [newImages, setNewImages] = useState([]); // New images to upload
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingProductTypes, setLoadingProductTypes] = useState(false);

  // Fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoadingProductTypes(true);
      try {
        const response = await apiClient.get('/product-type/types-with-products');
        const types = response.data?.data || [];
        setProductTypes(types);
      } catch (error) {
        console.error('Error fetching product types:', error);
      } finally {
        setLoadingProductTypes(false);
      }
    };
    fetchProductTypes();
  }, []);

  // Load product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchingProduct(true);
        setError(null);
        
        console.log('🔍 Fetching product with ID:', id);
        const response = await getProductById(id);
        console.log('📦 Product data received:', response);
        
        // Extract product data from response
        const product = response.data || response;
        
        // Set form data
        setFormData({
          productName: product.productName || '',
          productTypeCode: product.productTypeCode || '',
          price: product.price || '',
          brand: product.brand || '',
          manufacturer: product.manufacturer || '',
          description: product.description || '',
          visibility: product.visibility || false,
        });
        
        // Set existing images
        if (product.photos && Array.isArray(product.photos)) {
          setImages(product.photos.map(url => ({ url, isExisting: true })));
        }
        
      } catch (error) {
        console.error('❌ Error fetching product:', error);
        console.error('📍 Error status:', error.response?.status);
        console.error('📝 Error message:', error.response?.data?.message || error.message);
        console.error('🔍 Full error:', error.response?.data);
        
        let errorMessage = 'Failed to load product data. ';
        if (error.response?.status === 404) {
          errorMessage += 'Product not found.';
        } else if (error.response?.status === 401) {
          errorMessage += 'Authentication required.';
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += 'Please try again.';
        }
        
        setError(errorMessage);
      } finally {
        setFetchingProduct(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

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
    
    const imageFiles = files.filter((f) => f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    
    // Add new images to upload
    const imagesToAdd = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    
    setNewImages((prev) => [...prev, ...imagesToAdd]);
    e.target.value = '';
  };

  const handleRemoveExistingImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke object URL to free memory
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('📤 Updating product:', id);
      
      // Upload new images if any
      let uploadedImageUrls = [];
      if (newImages.length > 0) {
        console.log('📸 Uploading new images...');
        for (const img of newImages) {
          try {
            const formData = new FormData();
            formData.append('image', img.file);
            const response = await apiClient.post('/image-upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = response.data?.data?.imageUrl;
            if (imageUrl) uploadedImageUrls.push(imageUrl);
          } catch (err) {
            console.warn('Failed to upload image:', err);
          }
        }
      }
      
      // Combine existing images with newly uploaded ones
      const existingImageUrls = images.filter(img => img.isExisting).map(img => img.url);
      const allPhotos = [...existingImageUrls, ...uploadedImageUrls];
      
      // Prepare update data
      const updateData = {
        productName: formData.productName,
        productTypeCode: formData.productTypeCode,
        price: parseFloat(formData.price),
        brand: formData.brand,
        manufacturer: formData.manufacturer || formData.brand,
        description: formData.description,
        photos: allPhotos,
      };
      
      console.log('📦 Update data:', updateData);
      
      // Call update API
      const response = await updateProduct(id, updateData);
      console.log('✅ Product updated successfully:', response);
      
      // Show success message
      setSuccess(true);
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error updating product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="edit-product-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

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
          ❌ {error}
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
          ✅ Product updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-product-form">
        {/* Product Stock Information Section */}
        <div className="form-section">
          <h2 className="form-section-title">Product Stock Information</h2>

          {/* Product Images */}
          <div className="form-group">
            <label className="form-label">
              Product Images
            </label>
            
            {/* Existing Images */}
            {images.length > 0 && (
              <div>
                <p style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>Current Images:</p>
                <div className="image-upload-grid">
                  {images.map((image, index) => (
                    <div key={`existing-${index}`} className="image-upload-box">
                      <div className="image-preview">
                        <img src={image.url} alt={`Current ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() => handleRemoveExistingImage(index)}
                          title="Remove this image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images */}
            {newImages.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>New Images to Upload:</p>
                <div className="image-upload-grid">
                  {newImages.map((image, index) => (
                    <div key={`new-${index}`} className="image-upload-box">
                      <div className="image-preview">
                        <img src={image.preview} alt={`New ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() => handleRemoveNewImage(index)}
                          title="Remove this image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            <div style={{ marginTop: '20px' }}>
              <label className="image-upload-label" style={{ display: 'inline-block', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleImageChange}
                  className="image-upload-input"
                  style={{ display: 'none' }}
                />
                <div style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#f3f4f6', 
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>+ Add New Images</span>
                </div>
              </label>
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

