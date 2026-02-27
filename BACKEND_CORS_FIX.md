# URGENT: Fix CORS Error - Backend Configuration Required

## The Problem
Your frontend on Vercel **CANNOT** connect to your backend because the backend is blocking requests from your Vercel domain due to CORS (Cross-Origin Resource Sharing) restrictions.

## What You Need To Do RIGHT NOW

### Step 1: Find Your Vercel Deployment URL
1. Go to your Vercel dashboard
2. Look for your deployment URL (it will be something like `https://kulobalhealth-admin-xyz.vercel.app`)
3. Copy this URL

### Step 2: Update Backend CORS Configuration

You need to update your backend code (on Render.com) to allow requests from your Vercel domain.

#### Option A: If you're using Express.js (Node.js)

Find your backend's main server file (usually `app.js`, `server.js`, or `index.js`) and update the CORS configuration:

```javascript
const cors = require('cors');

// REPLACE THIS SECTION
app.use(cors({
  origin: [
    'http://localhost:3000',                    // Local development
    'http://localhost:3001',                    // Local development alternate
    'https://kulobalhealth-admin.vercel.app',   // Replace with YOUR Vercel URL
    'https://kulobalhealth-admin-*.vercel.app'  // Matches all preview deployments
  ],
  credentials: true,  // CRITICAL: Must be true for cookies/auth
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
```

#### Option B: If you're using a different framework

The key settings you need:
- **Allowed Origins**: Add your Vercel URL
- **Credentials**: Must be `true`
- **Allowed Methods**: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- **Allowed Headers**: `Content-Type, Authorization, Cookie`

### Step 3: Deploy Backend Changes

1. Commit and push your backend changes to GitHub
2. Render.com will automatically redeploy (or manually trigger a redeploy)
3. Wait for the deployment to complete

### Step 4: Test Again

Once the backend is redeployed with the new CORS configuration:
1. Go to your Vercel app
2. Try logging in again
3. Check the browser console (F12) for any errors

## Quick Test: Verify Backend CORS Settings

Open your browser console on your Vercel app and run this:

```javascript
fetch('https://kulobalhealth-backend-1.onrender.com/api/v1/admin/auth/login', {
  method: 'OPTIONS',
  credentials: 'include'
})
.then(response => {
  console.log('CORS Status:', response.status);
  console.log('CORS Headers:', [...response.headers]);
})
.catch(err => console.error('CORS Error:', err));
```

If you see a CORS error, your backend is NOT configured correctly.

## Alternative Quick Fix (Temporary)

If you need to test immediately and can't update the backend right now, you can temporarily disable credentials:

**⚠️ NOT RECOMMENDED FOR PRODUCTION - This is only for testing**

In your backend, you could temporarily set:
```javascript
app.use(cors({
  origin: '*',  // WARNING: Allows all origins
  credentials: false
}));
```

But this is **NOT secure** and should only be used for testing!

## Common Mistakes

❌ **DON'T** set `origin: '*'` with `credentials: true` - This won't work
❌ **DON'T** forget to include `https://` in your origin URLs
❌ **DON'T** forget the wildcard pattern for Vercel preview deployments
✅ **DO** include your exact Vercel URL
✅ **DO** set `credentials: true`
✅ **DO** redeploy after making changes

## Still Having Issues?

If you've updated the backend and it's still not working:

1. **Check the backend logs** on Render.com for any errors
2. **Verify the URL** - Make sure you're using the correct backend URL
3. **Check browser console** - Look for detailed error messages
4. **Test with curl** from terminal:
   ```bash
   curl -X OPTIONS https://kulobalhealth-backend-1.onrender.com/api/v1/admin/auth/login \
     -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -v
   ```

Look for `Access-Control-Allow-Origin` in the response headers.

## Contact Backend Team

If you're not the backend developer, send them this:

> "Please add `https://[YOUR-VERCEL-URL].vercel.app` to the CORS allowed origins in the backend configuration, and ensure `credentials: true` is set. The frontend is deployed on Vercel and cannot connect due to CORS restrictions."

Replace `[YOUR-VERCEL-URL]` with your actual Vercel deployment URL.
