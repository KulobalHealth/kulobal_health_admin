import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiMagnifyingGlass,
  HiEye,
  HiPencil,
  HiTrash,
  HiPlus,
  HiBars3,
  HiFunnel,
  HiExclamationTriangle,
  HiXMark,
} from 'react-icons/hi2';
import { FaShoppingBag } from 'react-icons/fa';
import ProductDetails from '../components/Products/ProductDetails';
import { getProducts, deleteProduct, toggleProductVisibility } from '../utils/productsService';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('6 per page');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: '' });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPageOptions = ['6 per page', '12 per page', '24 per page', '48 per page'];

  const itemsPerPageValue = parseInt(itemsPerPage, 10) || 6;

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Adjust the API response structure based on your backend
        // Your API might return: { data: [...], products: [...], or just [...]
        const response = await getProducts();
        
        // Handle different response structures
        let productsData = response.data || response.products || response || [];
        
        // Normalize products to ensure they all have an 'id' field
        // Some APIs return _id instead of id
        productsData = productsData.map(product => ({
          ...product,
          id: product.id || product._id || product.productId || product.ID,
        }));
        
        setProducts(productsData);
      } catch (err) {
        // Handle 401 errors gracefully - don't show error if token was cleared
        // The Layout component will handle redirect
        if (err.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          // Token is already cleared by apiClient, Layout will redirect
          return;
        }
        
        // Handle 404 errors - endpoint might not be implemented yet
        if (err.response?.status === 404) {
          const errorMsg = 'Products endpoint not found. Please verify the endpoint path with your backend developer. The endpoint may not be implemented yet.';
          setError(errorMsg);
          console.error('404 Error - Products endpoint:', {
            message: err.message,
            url: err.config?.baseURL + err.config?.url,
            endpoint: err.config?.url,
            suggestion: 'Check if the endpoint should be /product (singular) or a different path'
          });
          // Set empty array so UI can still render
          setProducts([]);
          return;
        }
        
        setError(err.message || 'Failed to fetch products');
        console.error('Error fetching products:', err);
        // Keep empty array on error, or you can set mock data as fallback
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      // Search across all relevant product fields
      const searchableFields = [
        product.productName,        // Product name
        product.name,                // Fallback for name
        product.productType,         // Category/Type
        product.productTypeCode,     // Type code
        product.brand,               // Brand
        product.manufacturer,        // Manufacturer
        product.description,         // Description
        product.price,               // Price (convert to string for search)
        product.currency,            // Currency
      ];

      // Convert all fields to strings and search
      return searchableFields.some((field) => {
        if (field === null || field === undefined) return false;
        return String(field).toLowerCase().includes(query);
      });
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPageValue) || 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPageValue]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPageValue;
    return filteredProducts.slice(start, start + itemsPerPageValue);
  }, [filteredProducts, currentPage, itemsPerPageValue]);

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 10); i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (
      (i === currentPage - 2 || i === currentPage + 2) &&
      pages[pages.length - 1] !== '...'
    ) {
      pages.push('...');
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery((prev) => prev.trim());
  };

  const handleToggleVisibility = async (productId) => {
    try {
      const product = products.find((p) => p.id === productId);
      const newVisibility = !product?.visibility;
      
      // Update via API
      await toggleProductVisibility(productId, newVisibility);
      
      // Update local state
      setProducts(
        products.map((product) =>
          product.id === productId ? { ...product, visibility: newVisibility } : product
        )
      );
    } catch (err) {
      console.error('Error toggling product visibility:', err);
      // You might want to show an error toast/notification here
    }
  };

  const handleViewClick = (product) => {
    // Ensure product has an ID before opening details
    const productId = product.id || product._id || product.productId;
    if (!productId) {
      console.error('Product missing ID:', product);
      console.error('Available product keys:', Object.keys(product || {}));
      return;
    }
    setSelectedProduct(product);
  };

  const handleEditClick = (product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDeleteClick = (productId, productName) => {
    // Normalize product ID - ensure we have the correct ID format
    const normalizedId = productId || productId?._id || productId?.productId;
    if (!normalizedId) {
      console.error('Cannot delete: Product ID is missing', { productId, productName });
      setError('Cannot delete product: Product ID is missing');
      return;
    }
    setDeleteModal({ isOpen: true, productId: normalizedId, productName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) {
      setDeleteError('Product ID is missing. Cannot delete.');
      return;
    }
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      console.log('🗑️ Attempting to delete product:', {
        productId: deleteModal.productId,
        productIdType: typeof deleteModal.productId,
        productName: deleteModal.productName,
        allProducts: products.map(p => ({ id: p.id, _id: p._id, productId: p.productId }))
      });
      
      // Ensure we're passing the correct ID format
      const productIdToDelete = String(deleteModal.productId).trim();
      console.log('📤 Sending delete request with ID:', productIdToDelete);
      
      // Delete via API - endpoint: DELETE /product/{id}
      await deleteProduct(productIdToDelete);
      
      // Update local state - remove deleted product from list
      // Check multiple ID fields to ensure we remove the correct product
      setProducts(products.filter((product) => {
        const productId = product.id || product._id || product.productId;
        const deleteId = deleteModal.productId;
        return productId !== deleteId && String(productId) !== String(deleteId);
      }));
      
      // Close modal and reset state
      setDeleteModal({ isOpen: false, productId: null, productName: '' });
      setDeleteError(null);
      
      console.log('✅ Product deleted successfully from database');
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      
      // Log full error details for debugging
      if (err.response) {
        console.error('📋 Error Response Status:', err.response.status);
        console.error('📋 Error Response Data:', err.response.data);
        console.error('📋 Full Error Response:', JSON.stringify(err.response.data, null, 2));
      }
      
      const errorMessage = err.message || 'Failed to delete product. Please try again.';
      setDeleteError(errorMessage);
      // Don't close modal on error so user can see the error message
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '' });
    setDeleteError(null);
    setDeleting(false);
  };

  const getPerformanceColor = (color) => {
    const colors = {
      green: '#00A170',
      grey: '#9ca3af',
    };
    return colors[color] || colors.grey;
  };

  const getCategoryStyle = (category) => {
    if (!category) {
      return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }

    const normalized = category.toLowerCase();
    const categoryThemes = {
      diagnostics: { backgroundColor: '#ecfdf5', color: '#047857' },
      'rapid tests': { backgroundColor: '#eef2ff', color: '#4338ca' },
      monitoring: { backgroundColor: '#fef3c7', color: '#92400e' },
      wellness: { backgroundColor: '#f0f9ff', color: '#0369a1' },
      supplements: { backgroundColor: '#fff5f5', color: '#b91c1c' },
    };

    return categoryThemes[normalized] || { backgroundColor: '#f3f4f6', color: '#4b5563' };
  };

  return (
    <div className="products-page">
      {/* Admin Watermark */}
      <div className="admin-watermark">Admin</div>
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="products-title">Products</h1>
          <p className="products-subtitle">View and manage all registered products</p>
        </div>
        <button className="add-product-button-header" onClick={() => navigate('/products/add')}>
          <HiPlus />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="products-error" style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading products...</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="products-filters">
        <form onSubmit={handleSearch} className="products-search-form">
          <div className="products-search-input-wrapper">
            <HiMagnifyingGlass className="products-search-icon" />
            <input
              type="text"
              placeholder="Search by name, brand, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="products-search-input"
            />
          </div>
          <button type="submit" className="products-search-button">
            Search
          </button>
        </form>

        <div className="products-filter-controls">
          <button className="products-filter-icon-button" title="Sort">
            <HiBars3 />
          </button>
          <button className="products-filter-icon-button" title="Filter">
            <HiFunnel />
          </button>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value)}
            className="products-items-per-page"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {!loading && filteredProducts.length === 0 ? (
        <div className="products-empty-state">
          <div className="products-empty-illustration">
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
              {/* Product Box */}
              <rect x="150" y="80" width="100" height="80" rx="8" fill="#374151" />
              <text x="200" y="125" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">
                PRODUCT
              </text>
              <rect x="160" y="90" width="30" height="15" rx="4" fill="#00A170" />
              <text x="175" y="100" textAnchor="middle" fill="white" fontSize="8">
                BEST QUALITY
              </text>
              {/* Stacked boxes */}
              <rect x="130" y="100" width="80" height="60" rx="6" fill="#00A170" opacity="0.3" />
              <rect x="190" y="110" width="80" height="60" rx="6" fill="#00A170" opacity="0.3" />
              {/* Magnifying glass */}
              <circle cx="250" cy="150" r="30" fill="none" stroke="#00A170" strokeWidth="3" />
              <line x1="270" y1="170" x2="290" y2="190" stroke="#00A170" strokeWidth="3" />
              {/* Tablet */}
              <rect x="240" y="180" width="40" height="30" rx="4" fill="#00A170" />
              <circle cx="250" cy="192" r="4" fill="white" />
              <rect x="255" y="190" width="15" height="4" rx="2" fill="white" />
              {/* Person figure */}
              <circle cx="320" cy="120" r="15" fill="#374151" />
              <rect x="305" y="135" width="30" height="50" rx="15" fill="#374151" />
              {/* Stars */}
              <path
                d="M100 60 L105 75 L120 75 L108 85 L113 100 L100 92 L87 100 L92 85 L80 75 L95 75 Z"
                fill="#00A170"
                opacity="0.5"
              />
              <path
                d="M350 200 L352 208 L360 208 L353 213 L355 221 L350 216 L345 221 L347 213 L340 208 L348 208 Z"
                fill="#00A170"
                opacity="0.5"
              />
            </svg>
          </div>
          <h3 className="products-empty-title">No products added yet</h3>
          <p className="products-empty-text">
            {products.length === 0
              ? 'You have not added any product yet. Click on the button below to add products.'
              : `We couldn’t find any product that matches “${searchQuery}”. Try a different keyword.`}
          </p>
          {products.length === 0 ? (
            <button
              className="products-add-button-empty"
              onClick={() => navigate('/products/add')}
            >
              <HiPlus />
              <span>Add New Product</span>
            </button>
          ) : (
            <button
              className="products-add-button-empty"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Performance</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="product-table-name">{product.productName}</span>
                  </td>
                    <td>
                      <span
                        className="product-category-badge"
                        style={getCategoryStyle(product.productType)}
                      >
                        {product.productType || 'Uncategorized'}
                      </span>
                    </td>
                  <td>
                    <div className="performance-cell">
                      <span
                        className="performance-badge"
                        style={{ 
                          backgroundColor: getPerformanceColor(product.performanceColor) + '20',
                          color: getPerformanceColor(product.performanceColor)
                        }}
                      >
                        {product.brand}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span>{product.manufacturer}</span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <span className="price-value">
                        {product.currency} {product.price}
                      </span>
                    </div>
                  </td>
                  <td>
                    <label className="product-toggle">
                      <input
                        type="checkbox"
                        checked={product.visibility}
                        onChange={() => handleToggleVisibility(product.id)}
                      />
                      <span className="product-toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div className="product-actions">
                      <button 
                        className="product-action-button" 
                        title="View"
                        onClick={() => handleViewClick(product)}
                      >
                        <HiEye />
                      </button>
                      <button 
                        className="product-action-button" 
                        title="Edit"
                        onClick={() => handleEditClick(product)}
                      >
                        <HiPencil />
                      </button>
                      <button
                        className="product-action-button delete-button"
                        title="Delete"
                        onClick={() => {
                          const productId = product.id || product._id || product.productId;
                          const productName = product.productName || product.name || 'this product';
                          handleDeleteClick(productId, productName);
                        }}
                      >
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="products-pagination">
          <button
            className="products-pagination-button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="products-pagination-numbers">
            {pages.map((page, index) => (
              <button
                key={index}
                className={`products-pagination-number ${page === currentPage ? 'active' : ''} ${
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
            className="products-pagination-button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={(product) => {
            setSelectedProduct(null);
            handleEditClick(product);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="delete-modal-overlay" onClick={!deleting ? handleDeleteCancel : undefined}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="delete-modal-close" 
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              <HiXMark />
            </button>
            <div className="delete-modal-content">
              <div className="delete-modal-icon">
                <HiExclamationTriangle />
              </div>
              <h2 className="delete-modal-title">Delete Product</h2>
              <p className="delete-modal-message">
                Are you sure you want to delete <strong>"{deleteModal.productName}"</strong>? This action cannot be undone.
              </p>
              
              {/* Error Message */}
              {deleteError && (
                <div className="delete-modal-error" style={{
                  padding: '12px',
                  marginTop: '16px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {deleteError}
                </div>
              )}
              
              <div className="delete-modal-actions">
                <button 
                  className="delete-modal-cancel" 
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className="delete-modal-confirm" 
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  style={{ opacity: deleting ? 0.6 : 1, cursor: deleting ? 'not-allowed' : 'pointer' }}
                >
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

