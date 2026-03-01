const https = require('https');
const url = require('url');

// Keep body parsing enabled for JSON - file uploads use /api/upload.js
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiPath = req.query.path || '';
  const backendUrl = `https://kulobalhealth-backend-1.onrender.com/api/${apiPath}`;
  
  console.log('=== PROXY ===');
  console.log('URL:', backendUrl);
  console.log('Method:', req.method);

  try {
    let bodyData = '';
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      bodyData = JSON.stringify(req.body);
    }

    const response = await new Promise((resolve, reject) => {
      const parsedUrl = url.parse(backendUrl);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (bodyData) {
        options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      if (req.headers.authorization) {
        options.headers['Authorization'] = req.headers.authorization;
      }

      if (req.headers.cookie) {
        options.headers['Cookie'] = req.headers.cookie;
      }

      const proxyReq = https.request(options, (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          resolve({
            statusCode: proxyRes.statusCode,
            headers: proxyRes.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      });

      proxyReq.on('error', reject);
      
      if (bodyData && req.method !== 'GET') {
        proxyReq.write(bodyData);
      }
      
      proxyReq.end();
    });

    // Forward cookies with domain rewritten
    if (response.headers['set-cookie']) {
      const cookies = response.headers['set-cookie'].map(cookie => 
        cookie.replace(/Domain=[^;]+;?\s*/gi, '').replace(/Path=\/[^;]*;?\s*/gi, 'Path=/; ')
      );
      res.setHeader('Set-Cookie', cookies);
    }

    let responseBody;
    try {
      responseBody = JSON.parse(response.body);
    } catch (e) {
      responseBody = { message: response.body };
    }

    res.status(response.statusCode).json(responseBody);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
