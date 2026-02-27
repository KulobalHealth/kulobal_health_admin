# Environment Variables Setup for Vercel

## Required Environment Variables

When deploying to Vercel, you need to set the following environment variables in your Vercel project settings:

### 1. REACT_APP_API_BASE_URL
- **Value**: `https://kulobalhealth-backend-1.onrender.com/api/v1/admin`
- **Description**: The base URL for your backend API

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add the following variable:
   - **Key**: `REACT_APP_API_BASE_URL`
   - **Value**: `https://kulobalhealth-backend-1.onrender.com/api/v1/admin`
   - **Environments**: Select all (Production, Preview, Development)
5. Click "Save"
6. Redeploy your application

## Backend CORS Configuration

⚠️ **IMPORTANT**: Your backend must be configured to accept requests from your Vercel domain.

The backend CORS configuration should include:
- Your Vercel domain (e.g., `https://your-app.vercel.app`)
- Allow credentials: `true`
- Allowed methods: `GET, POST, PUT, PATCH, DELETE`
- Allowed headers: `Content-Type, Authorization`

### Example Backend CORS Configuration (Node.js/Express):

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000', // Local development
    'https://your-app.vercel.app', // Your Vercel domain
    // Add any other domains that need access
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Troubleshooting

### "Network Error" on Login

This usually means one of the following:

1. **CORS is blocking the request**
   - Solution: Add your Vercel domain to backend CORS configuration
   
2. **Backend is down or unreachable**
   - Solution: Check if backend is running and accessible
   
3. **Wrong API URL**
   - Solution: Verify the `REACT_APP_API_BASE_URL` environment variable

### Check Browser Console

Always check the browser console (F12) for detailed error messages. The app logs extensive debugging information that will help identify the exact issue.
