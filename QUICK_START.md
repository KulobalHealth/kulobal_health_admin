# Quick Start - API Integration

## ✅ What's Been Done

1. ✅ Installed `axios` for API calls
2. ✅ Created API service structure in `src/utils/`
3. ✅ Updated Login component to use API
4. ✅ Updated Products component to use API
5. ✅ Created comprehensive integration guide

## 🚀 Immediate Next Steps

### 1. Create `.env` File
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```
**Replace with your actual API URL from Postman!**

### 2. Restart Development Server
```bash
npm start
```

### 3. Test Login
- Go to `/login`
- Check browser console for errors
- Verify API call in Network tab

### 4. Adjust API Endpoints (If Needed)

Check your Postman collection and compare with these files:
- `src/utils/authService.js` - Auth endpoints
- `src/utils/productsService.js` - Products endpoints
- `src/utils/productTypeService.js` - Product types
- `src/utils/imageUploadService.js` - Image uploads
- `src/utils/ordersService.js` - Orders

**Common adjustments:**
- Change endpoint URLs (e.g., `/products` → `/api/v1/products`)
- Adjust request/response structure
- Change field names to match your API

## 📁 File Structure

```
src/utils/
├── apiClient.js          # Axios instance with auth headers
├── authService.js        # Login, logout, token management
├── productTypeService.js # Product type CRUD
├── productsService.js    # Product CRUD
├── imageUploadService.js # Image upload endpoints
├── ordersService.js      # Order CRUD
└── index.js              # Export all services
```

## 🔍 Testing Checklist

- [ ] Login works and token is stored
- [ ] Products page loads data from API
- [ ] Create product works
- [ ] Edit product works
- [ ] Delete product works
- [ ] Image upload works
- [ ] Orders page loads data
- [ ] No CORS errors in console
- [ ] No 401 errors (after login)

## 📖 Full Documentation

See `API_INTEGRATION_GUIDE.md` for detailed instructions.

## ⚠️ Important Notes

1. **Response Structure**: Your API might return data differently. Check the response in Postman and adjust:
   ```javascript
   // In Products.js, line ~115
   const productsData = response.data || response.products || response || [];
   ```

2. **Request Format**: Verify the request body format matches your API. Check Postman examples.

3. **Authentication**: Token is automatically added to all requests via `apiClient.js` interceptors.

4. **Error Handling**: 401 errors automatically redirect to login. Other errors are logged to console.

## 🆘 Need Help?

1. Check browser console for errors
2. Check Network tab for API calls
3. Compare with Postman requests
4. Review `API_INTEGRATION_GUIDE.md`

