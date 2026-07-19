const https = require('https');
const { URL } = require('url');

/**
 * Same-origin proxy for the Render backend.
 * Strips Origin / Referer so the backend's broken CORS handling does not 500.
 */
module.exports = async (req, res) => {
  const requestOrigin = req.headers.origin || '*';

  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const apiPath = (req.query.path || '').replace(/^\/+/, '');
  if (!apiPath) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing path query parameter',
    });
  }

  const backendUrl = `https://kulobalhealth-backend-1.onrender.com/api/${apiPath}`;

  try {
    let bodyData = '';
    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD' &&
      req.body &&
      typeof req.body === 'object' &&
      Object.keys(req.body).length > 0
    ) {
      bodyData = JSON.stringify(req.body);
    }

    const response = await new Promise((resolve, reject) => {
      const parsedUrl = new URL(backendUrl);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: req.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // Intentionally omit Origin / Referer — backend crashes on them
        },
      };

      if (bodyData) {
        options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      if (req.headers.authorization) {
        options.headers.Authorization = req.headers.authorization;
      }

      if (req.headers.cookie) {
        options.headers.Cookie = req.headers.cookie;
      }

      const proxyReq = https.request(options, (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          resolve({
            statusCode: proxyRes.statusCode,
            headers: proxyRes.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      });

      proxyReq.on('error', reject);
      proxyReq.setTimeout(25000, () => {
        proxyReq.destroy(new Error('Backend request timed out'));
      });

      if (bodyData) {
        proxyReq.write(bodyData);
      }

      proxyReq.end();
    });

    if (response.headers['set-cookie']) {
      const cookies = response.headers['set-cookie'].map((cookie) =>
        cookie
          .replace(/Domain=[^;]+;?\s*/gi, '')
          .replace(/Path=\/[^;]*;?\s*/gi, 'Path=/; ')
      );
      res.setHeader('Set-Cookie', cookies);
    }

    let responseBody;
    try {
      responseBody = JSON.parse(response.body);
    } catch (e) {
      responseBody = { message: response.body || 'Empty response from backend' };
    }

    return res.status(response.statusCode || 502).json(responseBody);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(502).json({
      status: 'error',
      message: error.message || 'Failed to reach backend',
    });
  }
};
