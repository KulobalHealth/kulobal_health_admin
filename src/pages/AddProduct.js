import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiPlus } from 'react-icons/hi2';
import { createProduct, getProducts } from '../utils/productsService';
import { uploadImage } from '../utils/imageUploadService';
import { getProductTypes } from '../utils/productTypeService';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    brand: '',
    manufacturer: '',
    category: '',
    description: '',
    visibility: false,
  });

  const [categories, setCategories] = useState([
    { value: '', label: 'Select Category', productTypeCode: '' },
  ]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);
  const [images, setImages] = useState([]); // { file, preview, name }
  const imagesRef = useRef(new Set()); // track created object URLs for cleanup
  const MAX_IMAGES = 5;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState(null);

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

  // Fetch product types from API on component mount
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        setLoadingProductTypes(true);
        const response = await getProductTypes();
        
        console.log('Product Types API Response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array?', Array.isArray(response));
        
        // Handle different response structures
        let productTypesData = [];
        if (Array.isArray(response)) {
          productTypesData = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            productTypesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            productTypesData = response.data.data;
          } else if (response.data.productTypes && Array.isArray(response.data.productTypes)) {
            productTypesData = response.data.productTypes;
          }
        } else if (response.productTypes && Array.isArray(response.productTypes)) {
          productTypesData = response.productTypes;
        }
        
        console.log('Extracted product types data:', productTypesData);
        console.log('Number of product types:', productTypesData.length);
        
        if (productTypesData.length > 0) {
          console.log('First product type example:', productTypesData[0]);
          console.log('Available keys in first product type:', Object.keys(productTypesData[0] || {}));
        }
        
        // Map product types to category options
        // Try multiple possible field names for productTypeCode
        const categoryOptions = [
          { value: '', label: 'Select Category', productTypeCode: '' },
          ...productTypesData.map((type, index) => {
            const productTypeCode = type.productTypeCode || type.code || type.productTypeCode || type.id || type._id;
            const label = type.productTypeName || type.name || type.productType || type.label || `Product Type ${index + 1}`;
            
            console.log(`Product Type ${index + 1}:`, {
              productTypeCode,
              label,
              fullObject: type
            });
            
            return {
              value: productTypeCode, // Use productTypeCode as the value
              label: label,
              productTypeCode: productTypeCode, // Store it for later use
            };
          }),
        ];
        
        console.log('Category options created:', categoryOptions);
        setCategories(categoryOptions);
      } catch (err) {
        console.error('Error fetching product types:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data,
        });
        
        // Try to extract product types from existing products as fallback
        console.log('Attempting to extract product types from existing products...');
        try {
          const productsResponse = await getProducts();
          let productsData = productsResponse.data || productsResponse.products || productsResponse || [];
          
          // Extract unique productTypeCode values from existing products
          const uniqueProductTypes = new Map();
          productsData.forEach(product => {
            const productTypeCode = product.productTypeCode || product.productType?.code || product.typeCode;
            const productTypeName = product.productTypeName || product.productType?.name || product.productType || product.typeName;
            
            if (productTypeCode && !uniqueProductTypes.has(productTypeCode)) {
              uniqueProductTypes.set(productTypeCode, productTypeName || productTypeCode);
            }
          });
          
          console.log('Extracted product types from existing products:', Array.from(uniqueProductTypes.entries()));
          
          // Create categories from extracted product types
          const extractedCategories = [
            { value: '', label: 'Select Category', productTypeCode: '' },
            ...Array.from(uniqueProductTypes.entries()).map(([code, name]) => ({
              value: code,
              label: name,
              productTypeCode: code,
            })),
          ];
          
          if (extractedCategories.length > 1) {
            console.log('Using extracted product types from existing products');
            setCategories(extractedCategories);
            setWarning('Product types endpoint unavailable. Using product types from existing products. If you need a new product type, please ensure it exists in your database first.');
          } else {
            // Fallback to default categories if no products exist
            throw new Error('No product types found in existing products');
          }
        } catch (extractError) {
          console.warn('Could not extract product types from existing products:', extractError);
          
          // Always provide fallback categories so user can still add products
          const fallbackCategories = [
            { value: '', label: 'Select Category', productTypeCode: '' },
            { value: 'RAPID_TEST_KITS', label: 'RAPID_TEST_KITS', productTypeCode: 'RAPID_TEST_KITS' },
            { value: 'MEDICATIONS', label: 'MEDICATIONS', productTypeCode: 'MEDICATIONS' },
            { value: 'MEDICAL_EQUIPMENT', label: 'MEDICAL_EQUIPMENT', productTypeCode: 'MEDICAL_EQUIPMENT' },
            { value: 'SUPPLEMENTS', label: 'SUPPLEMENTS', productTypeCode: 'SUPPLEMENTS' },
          ];
          
          setCategories(fallbackCategories);
          
          // If 404, the endpoint might not exist
          if (err.response?.status === 404) {
            console.warn('Product types endpoint (/product-types) not found (404). Using fallback categories.');
            setWarning('Product types endpoint not available. Using default categories. Please ensure the productTypeCode you select exists in your database.');
          } else {
            // For other errors (network, 500, etc.)
            console.warn('Failed to load product types from API. Using fallback categories.');
            setWarning('Could not load product types from API. Using default categories. Please verify the productTypeCode exists in your database.');
          }
        }
      } finally {
        setLoadingProductTypes(false);
      }
    };

    fetchProductTypes();
  }, []);

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
    setError(null);
    setSuccess(false);
    setWarning(null);

    try {
      // Validate required fields
      if (!formData.productName || !formData.price || !formData.brand || !formData.category || !formData.description) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Validate at least one image is selected (API requires at least one photo)
      if (images.length === 0) {
        setError('Please upload at least one product image. At least one photo is required.');
        setLoading(false);
        return;
      }
      
      // Validate price is a valid number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        setLoading(false);
        return;
      }

      // Step 1: Upload images first (REQUIRED - backend needs at least one)
      let imageUrls = [];
      const imageFiles = images.map(img => img.file).filter(file => file);
      
      if (imageFiles.length === 0) {
        setError('No valid image files found. Please upload at least one product image.');
        setLoading(false);
        return;
      }
      
      console.log('Attempting to upload', imageFiles.length, 'images (at least one required)...');
      
      // Upload images - this is required, so we must succeed
      try {
          console.log(`Uploading ${imageFiles.length} image(s) using POST /image-upload endpoint...`);
        const uploadPromises = imageFiles.map((file, index) => {
          console.log(`Uploading image ${index + 1}/${imageFiles.length}:`, file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
          return uploadImage(file);
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        console.log('Individual upload results:', uploadResults);
        
        // Extract URLs from individual uploads
        imageUrls = uploadResults.map((result, index) => {
          let url = null;
          
          console.log(`Processing upload result ${index + 1}:`, result);
          
          // Try different response structures (checking most common formats first)
          if (typeof result === 'string') {
            // Direct URL string
            url = result;
          } else if (result.secure_url) {
            // Cloudinary format (most common)
            url = result.secure_url;
          } else if (result.url) {
            url = result.url;
          } else if (result.data?.secure_url) {
            url = result.data.secure_url;
          } else if (result.data?.url) {
            url = result.data.url;
          } else if (result.imageUrl) {
            url = result.imageUrl;
          } else if (result.data?.imageUrl) {
            url = result.data.imageUrl;
          } else if (result.data && typeof result.data === 'string') {
            url = result.data;
          } else if (result.public_id && result.format) {
            // Cloudinary format with public_id - construct URL if possible
            console.warn(`Cloudinary public_id found but no secure_url. Result:`, result);
          }
          
          if (url) {
            console.log(`✓ Image ${index + 1} uploaded successfully:`, url);
          } else {
            console.warn(`✗ Could not extract URL from upload result ${index + 1}:`, JSON.stringify(result, null, 2));
          }
          
          return url;
        }).filter(url => url !== null && url.trim().length > 0);
        
        console.log('Extracted image URLs:', imageUrls);
        console.log('Total valid image URLs:', imageUrls.length);
        
        // Validate that we have at least one valid image URL (API requirement)
        if (imageUrls.length === 0) {
          setError('Failed to upload images. No valid image URLs were returned. Please try again.');
          setLoading(false);
          return;
        }
        
        if (imageUrls.length < imageFiles.length) {
          console.warn(`Only ${imageUrls.length} out of ${imageFiles.length} images were uploaded successfully`);
          setWarning(`Warning: Only ${imageUrls.length} out of ${imageFiles.length} images were uploaded successfully.`);
        }
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        console.error('Upload error details:', {
          status: uploadError.response?.status,
          message: uploadError.message,
          data: uploadError.response?.data,
        });
        
        // Image upload is required - don't allow product creation without images
        const errorMessage = uploadError.response?.data?.message || 
                           uploadError.message || 
                           'Unknown error occurred while uploading images';
        setError(`Failed to upload images: ${errorMessage}. Please try again. At least one image is required.`);
        setLoading(false);
        return;
      }

      // Step 2: Get productTypeCode from selected category
      // The category value should already be the productTypeCode from the API
      const selectedCategory = categories.find(cat => cat.value === formData.category);
      
      console.log('Selected category value:', formData.category);
      console.log('Selected category object:', selectedCategory);
      console.log('All available categories:', categories);
      
      if (!selectedCategory || !formData.category || formData.category === '') {
        setError('Please select a valid product category');
        setLoading(false);
        return;
      }
      
      // Use the productTypeCode from the selected category, or fall back to the value
      const productTypeCode = selectedCategory.productTypeCode || selectedCategory.value || formData.category;
      
      if (!productTypeCode || productTypeCode === '') {
        setError('Invalid product type code. Please select a category again.');
        setLoading(false);
        return;
      }
      
      console.log('Final Product Type Code to send:', productTypeCode);
      console.log('Product Type Code type:', typeof productTypeCode);

      // Step 3: Prepare product data for API (matching exact API structure)
      // API expects: { productName, productTypeCode, price, description, brand, manufacturer, photos }
      // photos is REQUIRED and must contain at least one URL
      
      // Final validation - ensure we have at least one photo URL
      if (!imageUrls || imageUrls.length === 0) {
        setError('At least one product image is required. Please upload at least one image.');
        setLoading(false);
        return;
      }
      
      // Ensure productTypeCode is properly formatted (trim and convert to string)
      const finalProductTypeCode = String(productTypeCode).trim();
      
      console.log('Creating product with data:');
      console.log('- Product Type Code:', finalProductTypeCode);
      console.log('- Product Type Code type:', typeof finalProductTypeCode);
      console.log('- Product Type Code length:', finalProductTypeCode.length);
      
      const productData = {
        productName: formData.productName.trim(),
        productTypeCode: finalProductTypeCode, // Ensure it's a clean string
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        manufacturer: formData.manufacturer.trim() || formData.brand.trim(), // Use brand as fallback if manufacturer not provided
        photos: imageUrls, // Array of image URLs (required - must have at least one)
      };

      console.log('Full product data to send:', JSON.stringify(productData, null, 2));
      console.log('Product data structure:', {
        productName: typeof productData.productName,
        productTypeCode: typeof productData.productTypeCode,
        price: typeof productData.price,
        description: typeof productData.description,
        brand: typeof productData.brand,
        manufacturer: typeof productData.manufacturer,
        photos: Array.isArray(productData.photos) ? `Array(${productData.photos.length})` : typeof productData.photos,
      });

      // Step 4: Create product via API
      try {
        const response = await createProduct(productData);
        console.log('Product created successfully:', response);
        
        setSuccess(true);
        setError(null);
        setWarning(null);
        
        // Show success message and navigate after a short delay
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      } catch (createError) {
        console.error('Error creating product:', createError);
        console.error('Error response:', createError.response);
        console.error('Error data:', createError.response?.data);
        
        // Extract error message from API response
        const errorMessage = createError.response?.data?.message || 
                            createError.response?.data?.error ||
                            createError.message || 
                            'Failed to create product. Please try again.';
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to add product. Please try again.';
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
          ⚠️ {warning}
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
                disabled={loadingProductTypes}
              >
                {loadingProductTypes ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))
                )}
              </select>
              {loadingProductTypes && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Loading product types from API...
                </div>
              )}
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

