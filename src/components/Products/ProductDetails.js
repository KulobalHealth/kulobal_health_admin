import React from 'react';
import { HiXMark, HiPencil } from 'react-icons/hi2';
import './ProductDetails.css';

const ProductDetails = ({ product, onClose, onEdit }) => {
  if (!product) return null;

  // Sample product details - in real app, this would come from the product object
  const productDetails = {
    images: [
      '/api/placeholder/120/120',
      '/api/placeholder/120/120',
      '/api/placeholder/120/120',
      '/api/placeholder/120/120',
    ],
    name: product.name || 'Fertilizer',
    visibility: product.visibility ? 'On' : 'Off',
    description: 'Lorem ipsum dolor sit amet consectetur. Odio quisque sed arcu elit justo tortor. Vitae facilisi nam aliquet est placerat venenatis.',
    quantity: product.stock || '300',
    brand: 'Greater Accra',
    price: product.price || '200.00',
    category: product.category || 'Uncategorized',
  };

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

        {/* Content */}
        <div className="product-details-content">
          {/* Product Stock Information Section */}
          <div className="product-details-section">
            <h3 className="product-details-section-title">Product Stock Information</h3>

            {/* Product Images */}
            <div className="product-details-images">
              {productDetails.images.map((image, index) => (
                <div key={index} className="product-details-image">
                  <img src={image} alt={`Product ${index + 1}`} />
                </div>
              ))}
            </div>

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
                    <span className={`visibility-status ${product.visibility ? 'on' : 'off'}`}>
                      {productDetails.visibility}
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
                  <label className="product-details-label">Product Price (GHC)</label>
                  <div className="product-details-value">
                    {product.currency || '¢'} {productDetails.price}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="product-details-footer">
          <button className="product-details-close-btn" onClick={onClose}>
            Close
          </button>
          <button className="product-details-edit-btn" onClick={() => onEdit(product)}>
            <HiPencil />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

