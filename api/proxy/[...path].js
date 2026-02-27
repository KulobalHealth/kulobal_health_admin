// Vercel Serverless Function to proxy API requests
// This strips the Origin header to avoid backend CORS issues

module.exports = async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  const backendUrl = `https://kulobalhealth-backend-1.onrender.com/api/${apiPath}`;

  try {
    // Prepare headers - remove Origin to avoid backend CORS crash
    const headers = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // Make request to backend using node-fetch or native fetch
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get response data
    const data = await response.json();

    // Forward cookies from backend
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    // Return response with same status code
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      code: 500,
      status: 'fail',
      message: 'Proxy error: ' + error.message,
    });
  }
};
