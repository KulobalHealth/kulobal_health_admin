# Login Testing Guide

## ✅ Fixed Issues
1. Fixed typo in `.env` file (was `hhttps`, now `https`)
2. Added console logging for debugging
3. Enhanced error handling to show detailed error information

## 🔍 Step 1: Verify Your Postman Setup

### Check Your Postman Login Request:
1. **Endpoint URL**: What is the full URL in Postman?
   - Example: `https://kulobalhealth-backend-qlhm.onrender.com/api/v1/admin/auth/login`
   - Or: `https://kulobalhealth-backend-qlhm.onrender.com/auth/login`

2. **Request Method**: Should be `POST`

3. **Request Body**: Check what fields your API expects:
   - `{ "adminId": "...", "password": "..." }` ✅ (Current setup)
   - `{ "email": "...", "password": "..." }`
   - `{ "username": "...", "password": "..." }`
   - `{ "phone": "...", "password": "..." }`

4. **Response Structure**: What does the successful response look like?
   ```json
   {
     "token": "...",
     "user": { ... }
   }
   ```
   Or:
   ```json
   {
     "data": {
       "token": "...",
       "user": { ... }
     }
   }
   ```

## 🔧 Step 2: Update Frontend if Needed

### If Your API Uses Different Field Names:

**Option A: If API expects `email` instead of `adminId`**
Update `src/pages/auth/Login.js` line 35-38:
```javascript
const credentials = {
  email: formData.adminId,  // Use email field
  password: formData.password,
};
```

**Option B: If API expects `username`**
```javascript
const credentials = {
  username: formData.adminId,
  password: formData.password,
};
```

### If Your Endpoint Path is Different:

**If your Postman shows**: `/login` (not `/auth/login`)
Update `src/utils/authService.js` line 11:
```javascript
const response = await apiClient.post('/login', credentials);
```

**If your Postman shows**: `/admin/login`
```javascript
const response = await apiClient.post('/admin/login', credentials);
```

## 🧪 Step 3: Test the Login

1. **Start your development server** (if not running):
   ```bash
   npm start
   ```

2. **Open browser console** (F12 → Console tab)

3. **Go to login page**: `http://localhost:3000/login`

4. **Enter credentials** from Postman:
   - Admin ID: (use the same value that works in Postman)
   - Password: (use the same password)

5. **Click Login** and watch the console for:
   - Request details
   - Response data
   - Any errors

## 🔍 Step 4: Check for Common Issues

### Issue 1: CORS Error
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution**: Backend needs to allow your frontend origin. Contact backend developer.

### Issue 2: 404 Not Found
**Error**: `Request failed with status code 404`
**Solution**: Check the endpoint path matches Postman exactly.

### Issue 3: 401 Unauthorized
**Error**: `Request failed with status code 401`
**Solution**: 
- Verify credentials are correct
- Check if field names match (adminId vs email vs username)

### Issue 4: Wrong Response Structure
**Error**: Token not being stored
**Solution**: Check console logs to see actual response structure, then update `authService.js` accordingly.

## 📋 Quick Checklist

- [ ] `.env` file has correct base URL (no typos)
- [ ] Endpoint path matches Postman (`/auth/login` or `/login`?)
- [ ] Field names match Postman (`adminId` or `email` or `username`?)
- [ ] Response structure matches (token location)
- [ ] Browser console shows request/response
- [ ] No CORS errors
- [ ] Credentials are correct

## 🆘 Need Help?

Share with me:
1. The exact endpoint URL from Postman
2. The request body structure from Postman
3. The response structure from Postman
4. Any console errors you see

I'll help you adjust the code accordingly!

