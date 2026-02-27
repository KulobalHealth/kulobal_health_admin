const https = require('https');
const url = require('url');

module.exports = async (req, res) => {
  // Enable CORS for the response - must allow credentials for cookies
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the path from query parameter
  // URL format: /api/proxy?path=v1/admin/auth/login
  const apiPath = req.query.path || '';
  
  const backendUrl = `https://kulobalhealth-backend-1.onrender.com/api/${apiPath}`;
  
  console.log('=== PROXY REQUEST ===');
  console.log('Query path:', req.query.path);
  console.log('API Path:', apiPath);
  console.log('Backend URL:', backendUrl);
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body));

  try {
    // Prepare the request body
    let bodyData = '';
    if (req.body && typeof req.body === 'object') {
      bodyData = JSON.stringify(req.body);
    } else if (req.body) {
      bodyData = String(req.body);
    }

    // Make the request to the backend
    const response = await new Promise((resolve, reject) => {
      const parsedUrl = url.parse(backendUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          // Don't forward Origin header - this is the key fix for the backend CORS bug
        },
      };

      if (bodyData && req.method !== 'GET' && req.method !== 'HEAD') {
        options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      // Forward Authorization header if present
      if (req.headers.authorization) {
        options.headers['Authorization'] = req.headers.authorization;
      }

      // Forward Cookie header if present (critical for HTTP-only cookie auth)
      if (req.headers.cookie) {
        options.headers['Cookie'] = req.headers.cookie;
        console.log('Forwarding cookies to backend');
      }

      console.log('Request options:', JSON.stringify(options, null, 2));

      const proxyReq = https.request(options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', (chunk) => {
          data += chunk;
        });
        proxyRes.on('end', () => {
          console.log('Response status:', proxyRes.statusCode);
          console.log('Response body:', data);
          resolve({
            statusCode: proxyRes.statusCode,
            headers: proxyRes.headers,
            body: data,
          });
        });
      });

      proxyReq.on('error', (err) => {
        console.error('Request error:', err);
        reject(err);
      });
      
      if (bodyData && req.method !== 'GET' && req.method !== 'HEAD') {
        proxyReq.write(bodyData);
      }
      
      proxyReq.end();
    });

    // Forward set-cookie headers with domain rewritten for our proxy
    if (response.headers['set-cookie']) {
      // Rewrite cookies to work with our domain
      const cookies = response.headers['set-cookie'].map(cookie => {
        // Remove the domain restriction so cookie works on any domain
        // Also ensure SameSite=None and Secure for cross-site cookies
        return cookie
          .replace(/Domain=[^;]+;?\s*/gi, '')
          .replace(/Path=\/[^;]*;?\s*/gi, 'Path=/; ');
      });
      console.log('Rewritten cookies:', cookies);
      res.setHeader('Set-Cookie', cookies);
    }

    // Parse and return the response
    let responseBody;
    try {
      responseBody = JSON.parse(response.body);
    } catch (e) {
      responseBody = { message: response.body };
    }

    res.status(response.statusCode).json(responseBody);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Proxy error: ' + error.message,
    });
  }
};
