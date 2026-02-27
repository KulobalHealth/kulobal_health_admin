import React, { useState, useEffect } from 'react';
import { HiXMark, HiPencil } from 'react-icons/hi2';
import { getProductById } from '../../utils/productsService';
import './ProductDetails.css';

// Helper function to construct full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Convert to string if it's not already
  const path = String(imagePath).trim();
  if (!path) return null;
  
  // If already a full URL (http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a data URL (base64), return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Get base URL from environment or use default
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://kulobalhealth-backend-1.onrender.com/api/v1/admin';
  
  // If it starts with /, it's a relative path - construct full URL
  if (path.startsWith('/')) {
    // Remove /api/v1/admin from base URL to get the server root
    let serverRoot = baseURL.replace('/api/v1/admin', '').replace('/api/v1', '').replace('/api', '');
    // Ensure server root doesn't end with /
    if (serverRoot.endsWith('/')) {
      serverRoot = serverRoot.slice(0, -1);
    }
    return `${serverRoot}${path}`;
  }
  
  // If it doesn't start with /, it might be a relative path - try to construct URL
  // But first check if it looks like it might already be a partial URL
  if (path.includes('://')) {
    return path; // It has a protocol, return as is
  }
  
  // Otherwise, try to prepend the server root
  let serverRoot = baseURL.replace('/api/v1/admin', '').replace('/api/v1', '').replace('/api', '');
  if (serverRoot.endsWith('/')) {
    serverRoot = serverRoot.slice(0, -1);
  }
  return `${serverRoot}/${path}`;
};

const ProductDetails = ({ product, onClose, onEdit }) => {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!product) {
        setError('Product information is missing');
        setLoading(false);
        return;
      }

      // Get product ID - handle different ID field names (_id, id, productId)
      const productId = product.id || product._id || product.productId;
      
      if (!productId) {
        console.error('Product object received:', product);
        console.error('Available keys:', Object.keys(product || {}));
        setError('Product ID is missing. Please check the product object structure.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First, check if product prop already has photos (from the list)
        // This is useful if the API endpoint doesn't exist or fails
        if (product.photos && Array.isArray(product.photos) && product.photos.length > 0) {
          console.log('Product prop already has photos, using them directly:', product.photos);
          const images = product.photos.filter(url => url && typeof url === 'string' && url.trim().length > 0);
          
          setProductDetails({
            images: images,
            name: product.productName || product.name || 'N/A',
            visibility: product.visibility !== undefined ? product.visibility : false,
            description: product.description || 'No description available.',
            quantity: product.stock || product.quantity || '0',
            brand: product.brand || 'N/A',
            price: product.price || '0.00',
            category: product.productType || product.category || 'Uncategorized',
            manufacturer: product.manufacturer || 'N/A',
            currency: product.currency || 'GHC',
            productId: product.id || product._id || product.productId || productId,
          });
          setLoading(false);
          return; // Use product prop data and skip API call
        }
        
        // Fetch full product details from API
        const response = await getProductById(productId);
        
        // Log full response for debugging
        console.log('Full API Response:', response);
        
        // Handle different response structures
        // API returns { data: [...] } or { data: {...} } or just {...}
        let productData = {};
        if (response.data) {
          // If data is an array, find the product by ID or take the first item
          if (Array.isArray(response.data)) {
            console.log('Response data is an array with', response.data.length, 'items');
            // Try to find the product by ID (handle different ID field names)
            productData = response.data.find(p => {
              const pId = p.productId || p.id || p._id;
              const match = String(pId) === String(productId);
              if (match) {
                console.log('Found product by ID:', pId);
              }
              return match;
            });
            
            // If not found by ID, use the first item
            if (!productData && response.data.length > 0) {
              console.log('Product not found by ID, using first item');
              productData = response.data[0];
            }
            
            if (!productData) {
              console.warn('No product data found in array');
              productData = {};
            }
          } else {
            // If data is an object, use it directly
            console.log('Response data is an object');
            productData = response.data;
          }
        } else {
          // If no data property, use response directly
          console.log('No data property, using response directly');
          productData = response || {};
        }
        
        console.log('Product Data extracted:', productData);
        console.log('All product data keys:', Object.keys(productData));
        console.log('Product ID used for lookup:', productId);
        console.log('Product ID in data:', productData.productId || productData.id || productData._id);
        console.log('Photos field value:', productData.photos);
        console.log('Photos field type:', typeof productData.photos);
        console.log('Photos is array?', Array.isArray(productData.photos));
        
        // Extract and normalize images from API response
        // Handle different image formats: array of URLs, array of objects, single image, etc.
        let images = [];
        
        // Helper function to extract image URL from various formats
        const extractImageUrl = (img) => {
          if (!img) return null;
          
          // If it's already a string URL
          if (typeof img === 'string') {
            return getFullImageUrl(img);
          }
          
          // If it's an object, try to find the URL in common properties
          if (typeof img === 'object') {
            const url = img.url || img.imageUrl || img.image || img.path || img.src || img.link || 
                       img.fullUrl || img.full_url || img.imagePath || img.image_path || 
                       img.originalUrl || img.original_url || img.publicUrl || img.public_url;
            if (url) {
              return getFullImageUrl(url);
            }
          }
          
          return null;
        };
        
        // Check 'photos' field first (primary field name from API)
        // Photos are already full URLs from Cloudinary, so we can use them directly
        console.log('Checking for photos field in productData...');
        console.log('productData.photos exists?', !!productData.photos);
        console.log('productData.photos type:', typeof productData.photos);
        console.log('productData.photos value:', productData.photos);
        
        if (productData.photos) {
          const photosValue = productData.photos;
          console.log('Found photos field:', photosValue);
          console.log('Photos is array?', Array.isArray(photosValue));
          
          if (Array.isArray(photosValue)) {
            console.log('Photos array length:', photosValue.length);
            // Photos are already full URLs, use them directly (no need to process them)
            images = photosValue.filter(url => {
              const isValid = url && typeof url === 'string' && url.trim().length > 0;
              if (!isValid) {
                console.warn('Invalid photo URL filtered out:', url, 'Type:', typeof url);
              } else {
                console.log('Valid photo URL:', url);
              }
              return isValid;
            });
            console.log('Extracted images from photos array:', images);
            console.log('Number of valid images:', images.length);
          } else if (typeof photosValue === 'string') {
            // Single photo URL
            images = [photosValue.trim()];
            console.log('Extracted image from photos string:', images);
          } else if (typeof photosValue === 'object' && photosValue !== null) {
            // If it's an object, try to extract URL
            console.log('Photos is an object, trying to extract URL...');
            const extracted = extractImageUrl(photosValue);
            if (extracted) {
              images = [extracted];
              console.log('Extracted image from photos object:', images);
            } else {
              console.warn('Could not extract URL from photos object:', photosValue);
            }
          } else {
            console.warn('Photos field exists but is not a valid type:', typeof photosValue, photosValue);
          }
        } else {
          console.warn('No photos field found in productData');
          console.warn('Available fields:', Object.keys(productData));
        }
        
        // Try other possible image field names if photos didn't yield results
        if (images.length === 0) {
          const imageFields = [
            'images', 'imageUrls', 'imageUrl', 'image', 'productImages', 
            'product_images', 'imageLinks', 'image_links', 'pictures',
            'imageList', 'image_list', 'gallery', 'media', 'attachments'
          ];
          
          for (const field of imageFields) {
            if (productData[field]) {
              const fieldValue = productData[field];
              
              if (Array.isArray(fieldValue)) {
                const extracted = fieldValue.map(extractImageUrl).filter(url => url);
                if (extracted.length > 0) {
                  images = extracted;
                  console.log(`Found images in field "${field}":`, images);
                  break;
                }
              } else if (typeof fieldValue === 'string') {
                const extracted = extractImageUrl(fieldValue);
                if (extracted) {
                  images = [extracted];
                  console.log(`Found image in field "${field}":`, images);
                  break;
                }
              } else if (typeof fieldValue === 'object') {
                const extracted = extractImageUrl(fieldValue);
                if (extracted) {
                  images = [extracted];
                  console.log(`Found image in field "${field}":`, images);
                  break;
                }
              }
            }
          }
        }
        
        // If still no images, check nested structures
        if (images.length === 0) {
          // Check if photos are nested in a data or result object
          if (productData.data && typeof productData.data === 'object') {
            // Check photos first in nested data
            if (productData.data.photos) {
              const photosValue = productData.data.photos;
              if (Array.isArray(photosValue)) {
                const extracted = photosValue.map(extractImageUrl).filter(url => url);
                if (extracted.length > 0) {
                  images = extracted;
                  console.log('Found images in nested data.photos:', images);
                }
              }
            }
            
            // Check other image fields in nested data
            if (images.length === 0) {
              const imageFields = ['images', 'imageUrls', 'imageUrl', 'image', 'productImages', 
                                   'product_images', 'imageLinks', 'image_links', 'pictures',
                                   'imageList', 'image_list', 'gallery', 'media', 'attachments'];
              for (const field of imageFields) {
                if (productData.data[field]) {
                  const fieldValue = productData.data[field];
                  if (Array.isArray(fieldValue)) {
                    const extracted = fieldValue.map(extractImageUrl).filter(url => url);
                    if (extracted.length > 0) {
                      images = extracted;
                      console.log(`Found images in nested data.${field}:`, images);
                      break;
                    }
                  }
                }
              }
            }
          }
          
          // Check all object values for image-like structures
          if (images.length === 0) {
            const checkObjectForImages = (obj, depth = 0) => {
              if (depth > 3) return; // Limit recursion depth
              
              for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  const value = obj[key];
                  
                  // Check if key name suggests it might contain images
                  if (key.toLowerCase().includes('image') || 
                      key.toLowerCase().includes('photo') || 
                      key.toLowerCase().includes('picture') ||
                      key.toLowerCase().includes('media')) {
                    if (Array.isArray(value)) {
                      const extracted = value.map(extractImageUrl).filter(url => url);
                      if (extracted.length > 0) {
                        images = extracted;
                        console.log(`Found images in nested field "${key}":`, images);
                        return;
                      }
                    } else if (typeof value === 'string' || typeof value === 'object') {
                      const extracted = extractImageUrl(value);
                      if (extracted) {
                        images = [extracted];
                        console.log(`Found image in nested field "${key}":`, images);
                        return;
                      }
                    }
                  }
                  
                  // Recursively check nested objects
                  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    checkObjectForImages(value, depth + 1);
                    if (images.length > 0) return;
                  }
                }
              }
            };
            
            checkObjectForImages(productData);
          }
        }
        
        // Fallback to placeholder if no images found
        if (images.length === 0) {
          console.warn('No images found in API response.');
          console.warn('Product data keys:', Object.keys(productData));
          console.warn('Product data photos field:', productData.photos);
          console.warn('Product data full object:', JSON.stringify(productData, null, 2));
          // Don't set placeholder here, let it be handled in the render
        }
        
        console.log('Final images array:', images);
        console.log('Final images count:', images.length);
        
        // Map API response to component structure
        setProductDetails({
          images: images.length > 0 ? images : [],
          name: productData.productName || productData.name || product.productName || 'N/A',
          visibility: productData.visibility !== undefined ? productData.visibility : (product.visibility || false),
          description: productData.description || productData.productDescription || 'No description available.',
          quantity: productData.stock || productData.quantity || productData.quantityAvailable || product.stock || '0',
          brand: productData.brand || product.brand || 'N/A',
          price: productData.price || product.price || '0.00',
          category: productData.productType || productData.category || product.productType || product.category || 'Uncategorized',
          manufacturer: productData.manufacturer || product.manufacturer || 'N/A',
          currency: productData.currency || product.currency || 'GHC',
          productId: productData.productId || productData.id || productData._id || productId,
        });
      } catch (err) {
        console.error('Error fetching product details:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        // If it's a 404, the endpoint might not exist - use product prop data
        if (err.response?.status === 404) {
          console.warn('Product endpoint returned 404. Using product data from props.');
          console.warn('Product prop data:', product);
        }
        
        setError(err.message || 'Failed to load product details');
        
        // Extract images from product prop as fallback
        // Check if product already has photos from the list
        let fallbackImages = [];
        
        // First, try to get photos from the product prop (it might already have them from the list)
        if (product.photos && Array.isArray(product.photos)) {
          console.log('Found photos in product prop:', product.photos);
          fallbackImages = product.photos.filter(url => url && typeof url === 'string' && url.trim().length > 0);
          console.log('Extracted photos from product prop:', fallbackImages);
        } else if (product.images && Array.isArray(product.images)) {
          fallbackImages = product.images.map(img => {
            if (typeof img === 'string') {
              return getFullImageUrl(img);
            }
            if (typeof img === 'object' && img.url) {
              return getFullImageUrl(img.url);
            }
            return img;
          }).filter(img => img);
        } else if (product.imageUrl || product.image) {
          const imgUrl = product.imageUrl || product.image;
          fallbackImages = [getFullImageUrl(imgUrl)];
        }
        
        if (fallbackImages.length === 0) {
          console.warn('No images found in product prop either');
          fallbackImages = [];
        }
        
        // Fallback to product data passed as prop
        setProductDetails({
          images: fallbackImages,
          name: product.productName || product.name || 'N/A',
          visibility: product.visibility || false,
          description: product.description || 'No description available.',
          quantity: product.stock || product.quantity || '0',
          brand: product.brand || 'N/A',
          price: product.price || '0.00',
          category: product.productType || product.category || 'Uncategorized',
          manufacturer: product.manufacturer || 'N/A',
          currency: product.currency || 'GHC',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product]);

  if (!product) return null;

  return (
    <div className="product-details-overlay" onClick={onClose}>
      <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="product-details-header">
          <h2 className="product-details-title">Product Stock Details</h2>
          <button className="product-details-close" onClick={onClose} aria-label="Close">
            <HiXMark />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading product details...</p>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px', 
            margin: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && productDetails && (
          <div className="product-details-content">
            {/* Product Stock Information Section */}
            <div className="product-details-section">
              <h3 className="product-details-section-title">Product Stock Information</h3>

              {/* Product Images */}
              {productDetails.images && productDetails.images.length > 0 ? (
                <>
                  <div className="product-details-images">
                    {productDetails.images.map((image, index) => {
                      // Ensure image URL is properly formatted
                      const imageUrl = typeof image === 'string' ? image.trim() : 
                                      (image?.url || image?.imageUrl || image?.src || image?.path || '').trim();
                      
                      if (!imageUrl || imageUrl === '/api/placeholder/120/120') {
                        console.warn(`Skipping invalid image at index ${index}:`, image);
                        return null;
                      }
                      
                      // Log image URL for debugging
                      console.log(`Rendering image ${index + 1}:`, imageUrl);
                      
                      return (
                        <div key={index} className="product-details-image">
                          <img 
                            src={imageUrl} 
                            alt={`${productDetails.name} - ${index + 1}`}
                            loading="lazy"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error(`Failed to load image ${index + 1}:`, imageUrl);
                              console.error('Error details:', e);
                              // Try to use placeholder if image fails to load
                              if (e.target.src !== '/api/placeholder/120/120') {
                                e.target.src = '/api/placeholder/120/120';
                              }
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image ${index + 1}:`, imageUrl);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      <strong>Debug:</strong> Found {productDetails.images.length} image(s)
                      <br />
                      <strong>Image URLs:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {productDetails.images.map((img, idx) => (
                          <li key={idx} style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                            {typeof img === 'string' ? img : JSON.stringify(img)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  <p>No images available for this product</p>
                </div>
              )}

              {/* Product Details Grid */}
              <div className="product-details-grid">
                {/* Left Column */}
                <div className="product-details-column">
                  <div className="product-details-field">
                    <label className="product-details-label">Product Name</label>
                    <div className="product-details-value">{productDetails.name}</div>
                  </div>

                  <div className="product-details-field">
                    <label className="product-details-label">Product Visibility</label>
                    <div className="product-details-value">
                      <span className={`visibility-status ${productDetails.visibility ? 'on' : 'off'}`}>
                        {productDetails.visibility ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>

                  <div className="product-details-field">
                    <label className="product-details-label">Product Description</label>
                    <div className="product-details-value description-text">
                      {productDetails.description}
                    </div>
                  </div>

                  <div className="product-details-field">
                    <label className="product-details-label">Product Category</label>
                    <div className="product-details-value">{productDetails.category}</div>
                  </div>

                  {productDetails.manufacturer && (
                    <div className="product-details-field">
                      <label className="product-details-label">Manufacturer</label>
                      <div className="product-details-value">{productDetails.manufacturer}</div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="product-details-column">
                  <div className="product-details-field">
                    <label className="product-details-label">Quantity Available</label>
                    <div className="product-details-value">{productDetails.quantity}</div>
                  </div>

                  <div className="product-details-field">
                    <label className="product-details-label">Brand</label>
                    <div className="product-details-value">{productDetails.brand}</div>
                  </div>

                  <div className="product-details-field">
                    <label className="product-details-label">Product Price ({productDetails.currency})</label>
                    <div className="product-details-value">
                      {productDetails.currency} {productDetails.price}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="product-details-footer">
          <button className="product-details-close-btn" onClick={onClose}>
            Close
          </button>
          {productDetails && (
            <button className="product-details-edit-btn" onClick={() => onEdit(product)}>
              <HiPencil />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

