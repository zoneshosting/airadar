const https = require('https');

function httpsGet(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 3) return reject(new Error('Too many redirects'));

    const req = https.get(url, { headers: { 'User-Agent': 'AIRadar/1.0 NewsProxy' } }, (res) => {
      // Handle redirects up to 3 times
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        // Resolve relative redirects
        let nextUrl = res.headers.location;
        if (!nextUrl.startsWith('http')) {
          const base = new URL(url);
          nextUrl = new URL(nextUrl, base.origin).toString();
        }
        return httpsGet(nextUrl, redirects + 1).then(resolve).catch(reject);
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) return { statusCode: 400, body: 'Missing url parameter' };

  try {
    new URL(targetUrl); // Validate URL
  } catch {
    return { statusCode: 400, body: 'Invalid URL' };
  }

  try {
    const response = await httpsGet(targetUrl);
    return {
      statusCode: response.status >= 400 ? 502 : 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
      body: response.body || '',
    };
  } catch (err) {
    return { statusCode: 502, body: err.message || 'Proxy Error' };
  }
};
