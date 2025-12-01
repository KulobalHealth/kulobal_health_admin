# API Integration Guide

This guide will help you connect your React frontend to the backend API endpoints.

## 📋 Prerequisites

- Backend API is running and accessible
- Postman collection with API endpoints
- API base URL from your backend developer

## 🚀 Step-by-Step Setup

### Step 1: Configure Environment Variables

1. Create a `.env` file in the root directory of your project (if it doesn't exist)
2. Add your API base URL:

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

**Important Notes:**
- Replace `http://localhost:3000/api` with your actual API base URL
- The URL should NOT end with a trailing slash
- Restart your development server after creating/modifying `.env` file

### Step 2: Verify API Endpoints in Postman

Before integrating, verify these endpoints in Postman:

1. **Auth**
   - Login: `POST /auth/login`
   - Expected request body: `{ adminId: string, password: string }` (or as per your API)
   - Expected response: `{ token: string, user: object }`

2. **Product Types**
   - Get all: `GET /product-types`
   - Get by ID: `GET /product-types/:id`
   - Create: `POST /product-types`
   - Update: `PUT /product-types/:id`
   - Delete: `DELETE /product-types/:id`

3. **Products**
   - Get all: `GET /products`
   - Get by ID: `GET /products/:id`
   - Create: `POST /products`
   - Update: `PUT /products/:id`
   - Delete: `DELETE /products/:id`
   - Toggle visibility: `PATCH /products/:id/visibility`

4. **Image Upload**
   - Upload single: `POST /upload/image`
   - Upload multiple: `POST /upload/images`
   - Delete: `DELETE /upload/images/:id`

5. **Orders**
   - Get all: `GET /orders`
   - Get by ID: `GET /orders/:id`
   - Create: `POST /orders`
   - Update: `PUT /orders/:id`
   - Update status: `PATCH /orders/:id/status`

### Step 3: Adjust API Service Files

The service files are located in `src/utils/`. You may need to adjust them based on your API structure:

#### Common Adjustments Needed:

1. **Response Structure**: Your API might return data in different formats:
   ```javascript
   // Option 1: Direct array
   const products = response.data;
   
   // Option 2: Nested in data property
   const products = response.data.data;
   
   // Option 3: Different property name
   const products = response.data.products;
   ```

2. **Request Body Format**: Adjust the request body structure in each service file to match your API requirements.

3. **Error Handling**: The current setup handles 401 errors automatically. Adjust if your API uses different status codes.

### Step 4: Update Components

#### Login Component (`src/pages/auth/Login.js`)
✅ **Already Updated** - Now uses `login()` from `authService`

**If your API expects different field names:**
```javascript
// Current (adjust if needed):
const credentials = {
  adminId: formData.adminId,
  password: formData.password,
};
```

#### Products Component (`src/pages/Products.js`)
✅ **Already Updated** - Now fetches products from API

**Adjust the response structure if needed:**
```javascript
// In the fetchProducts function, adjust this line:
const productsData = response.data || response.products || response || [];
```

### Step 5: Update Other Components

#### Add Product (`src/pages/AddProduct.js`)

Update the `handleSubmit` function:

```javascript
import { createProduct } from '../utils/productsService';
import { uploadImages } from '../utils/imageUploadService';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Upload images first (if any)
    let imageUrls = [];
    const imageFiles = images.filter(img => img && typeof img !== 'string');
    if (imageFiles.length > 0) {
      const uploadResponse = await uploadImages(imageFiles);
      imageUrls = uploadResponse.urls || uploadResponse.data || [];
    }

    // 2. Create product with image URLs
    const productData = {
      name: formData.productName,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      brand: formData.brand,
      category: formData.category,
      description: formData.description,
      visibility: formData.visibility,
      images: imageUrls,
    };

    await createProduct(productData);
    navigate('/products');
  } catch (err) {
    console.error('Error creating product:', err);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};
```

#### Edit Product (`src/pages/EditProduct.js`)

Similar to Add Product, but use `updateProduct(id, productData)` instead.

#### Orders Component (`src/pages/Orders.js`)

```javascript
import { getOrders, updateOrderStatus, confirmOrder } from '../utils/ordersService';

// In component:
useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      const ordersData = response.data || response.orders || response || [];
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };
  fetchOrders();
}, []);
```

### Step 6: Test the Integration

1. **Start your development server:**
   ```bash
   npm start
   ```

2. **Test Login:**
   - Go to `/login`
   - Enter credentials
   - Check browser console for any errors
   - Verify token is stored in localStorage

3. **Test Products:**
   - Navigate to `/products`
   - Check if products load from API
   - Test create, update, delete operations

4. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Verify API calls are being made
   - Check request/response formats

### Step 7: Handle Authentication

The app automatically:
- Adds `Authorization: Bearer <token>` header to all requests
- Redirects to login on 401 errors
- Stores token in localStorage

**To add protected routes**, update `src/components/Layout/Layout.js`:

```javascript
import { isAuthenticated } from '../utils/authService';
import { Navigate } from 'react-router-dom';

// In Layout component:
if (!isAuthenticated()) {
  return <Navigate to="/login" replace />;
}
```

## 🔧 Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure your backend has CORS enabled for your frontend URL.

### Issue: 401 Unauthorized
**Solution**: 
- Check if token is being sent in headers
- Verify token format matches API expectations
- Check token expiration

### Issue: Wrong Response Structure
**Solution**: Adjust the response parsing in service files:
```javascript
// Example: If API returns { success: true, data: { products: [...] } }
const productsData = response.data?.data?.products || [];
```

### Issue: Images Not Uploading
**Solution**: 
- Verify `Content-Type: multipart/form-data` header
- Check file size limits
- Verify FormData structure matches API expectations

## 📝 API Service Files Reference

All service files are in `src/utils/`:

- `apiClient.js` - Axios instance with interceptors
- `authService.js` - Authentication endpoints
- `productTypeService.js` - Product type endpoints
- `productsService.js` - Product endpoints
- `imageUploadService.js` - Image upload endpoints
- `ordersService.js` - Order endpoints
- `index.js` - Exports all services

## 🎯 Next Steps

1. Test each endpoint individually
2. Adjust service files based on your API structure
3. Add error notifications/toasts for better UX
4. Implement loading states where needed
5. Add form validation
6. Test on different browsers

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for API request/response
3. Verify API endpoints in Postman
4. Compare request/response formats with service files

---

**Note**: This guide assumes standard REST API patterns. Adjust based on your specific API structure and requirements.

