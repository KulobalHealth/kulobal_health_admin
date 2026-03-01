// Special proxy for file uploads using node-fetch
// This endpoint handles multipart/form-data properly

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

// Collect raw body from stream
const getRawBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
    
    // Timeout after 30 seconds
    setTimeout(() => reject(new Error('Body read timeout')), 30000);
  });
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiPath = req.query.path || 'v1/admin/image-upload';
  const backendUrl = `https://kulobalhealth-backend-1.onrender.com/api/${apiPath}`;
  
  console.log('=== UPLOAD PROXY ===');
  console.log('Backend URL:', backendUrl);
  console.log('Content-Type:', req.headers['content-type']);

  try {
    // Read raw body
    const bodyBuffer = await getRawBody(req);
    console.log('Body size:', bodyBuffer.length);

    // Use native https to forward the request
    const https = require('https');
    const url = require('url');
    const parsedUrl = url.parse(backendUrl);

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': req.headers['content-type'],
          'Content-Length': bodyBuffer.length,
        },
      };

      // Forward auth headers
      if (req.headers.authorization) {
        options.headers['Authorization'] = req.headers.authorization;
      }
      if (req.headers.cookie) {
        options.headers['Cookie'] = req.headers.cookie;
      }

      console.log('Forwarding to backend with headers:', JSON.stringify(options.headers, null, 2));

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
      proxyReq.write(bodyBuffer);
      proxyReq.end();
    });

    console.log('Backend response:', response.statusCode, response.body.substring(0, 200));

    // Forward cookies
    if (response.headers['set-cookie']) {
      res.setHeader('Set-Cookie', response.headers['set-cookie']);
    }

    // Return response
    try {
      const jsonBody = JSON.parse(response.body);
      res.status(response.statusCode).json(jsonBody);
    } catch (e) {
      res.status(response.statusCode).send(response.body);
    }
  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({
      status: 'error', 
      message: 'Upload failed: ' + error.message,
    });
  }
};
