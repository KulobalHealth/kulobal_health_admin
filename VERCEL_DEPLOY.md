# Vercel Deployment Guide - KulobalHealth Admin

## Quick Deploy

### Option 1: Using Vercel Dashboard (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect settings from `vercel.json`
5. **Important:** Add environment variables (see below)
6. Click **Deploy**

### Option 2: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

## Required Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_BASE_URL` | `https://kulobalhealth-backend-1.onrender.com/api/v1/admin` |
| `GENERATE_SOURCEMAP` | `false` |

## Backend CORS Configuration

**Important:** The backend must allow your Vercel domain for CORS and cookies to work.

The backend at `kulobalhealth-backend-1.onrender.com` needs to:
1. Add your Vercel domain to `Access-Control-Allow-Origin`
2. Set `Access-Control-Allow-Credentials: true`
3. Ensure cookies are set with `SameSite=None; Secure`

**Ask the backend team to add your Vercel URL** (e.g., `https://kulobalhealth-admin.vercel.app`) to the CORS whitelist.

## Project Configuration

### vercel.json
- Build command: `npm run build`
- Output directory: `build`
- Framework: Create React App
- Includes SPA routing and security headers

### Authentication
- Backend uses HTTP-only cookies for authentication
- `withCredentials: true` is configured in the API client
- Cookies are automatically sent with cross-origin requests

## After Deployment

1. Test login functionality
2. If you get CORS errors, confirm your Vercel domain is whitelisted on the backend
3. Check browser DevTools → Network tab for any cookie issues

## Troubleshooting

### CORS Errors
- Ensure backend has your Vercel domain in the CORS whitelist
- Check that `Access-Control-Allow-Credentials: true` is set

### Authentication Issues
- HTTP-only cookies require `SameSite=None; Secure` on the backend
- Verify cookies are being set (check DevTools → Application → Cookies)

### 401 Unauthorized
- Cookie may not be sent - check CORS configuration
- Clear browser cookies and try logging in again
