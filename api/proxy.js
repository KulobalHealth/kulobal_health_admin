const https = require('https');
const url = require('url');

// Disable body parsing so we can access raw body for multipart uploads
// Note: Vercel parses JSON automatically, but we need raw body for file uploads
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

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
  
  // Check if this is a multipart request (file upload)
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');
  
  console.log('=== PROXY REQUEST ===');
  console.log('Query path:', req.query.path);
  console.log('API Path:', apiPath);
  console.log('Backend URL:', backendUrl);
  console.log('Method:', req.method);
  console.log('Content-Type:', contentType);
  console.log('Is Multipart:', isMultipart);

  try {
    // Get raw body for multipart or use parsed body for JSON
    let bodyData;
    let bodyLength;
    
    if (isMultipart) {
      // Get raw body for file uploads
      bodyData = await getRawBody(req);
      bodyLength = bodyData.length;
      console.log('Raw body length:', bodyLength);
    } else if (req.body && typeof req.body === 'object') {
      bodyData = JSON.stringify(req.body);
      bodyLength = Buffer.byteLength(bodyData);
    } else if (req.body) {
      bodyData = String(req.body);
      bodyLength = Buffer.byteLength(bodyData);
    } else {
      // Try to read raw body if req.body is empty
      bodyData = await getRawBody(req);
      bodyLength = bodyData.length;
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
          // Don't forward Origin header - this is the key fix for the backend CORS bug
        },
      };

      // Set appropriate Content-Type
      if (isMultipart) {
        // Forward the original content-type with boundary for multipart
        options.headers['Content-Type'] = contentType;
      } else if (bodyLength > 0) {
        options.headers['Content-Type'] = 'application/json';
      }

      if (bodyLength > 0 && req.method !== 'GET' && req.method !== 'HEAD') {
        options.headers['Content-Length'] = bodyLength;
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
        const chunks = [];
        proxyRes.on('data', (chunk) => {
          chunks.push(chunk);
        });
        proxyRes.on('end', () => {
          const data = Buffer.concat(chunks).toString('utf8');
          console.log('Response status:', proxyRes.statusCode);
          console.log('Response body:', data.substring(0, 500));
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
      
      if (bodyLength > 0 && req.method !== 'GET' && req.method !== 'HEAD') {
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
