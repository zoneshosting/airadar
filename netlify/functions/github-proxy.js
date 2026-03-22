// netlify/functions/github-proxy.js
// Server-side proxy for GitHub API — keeps GITHUB_TOKEN out of client HTML.
// Netlify will inject process.env.GITHUB_TOKEN from your site's env vars.

const https = require('https');

const ALLOWED_HOSTS = ['api.github.com', 'github-trending-api.vercel.app'];

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'AIRadar/1.0',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

exports.handler = async (event) => {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const targetUrl = event.queryStringParameters?.url;

  // Validate URL
  if (!targetUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing url parameter' }) };
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid URL' }) };
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: `Host not allowed: ${parsed.hostname}` }),
    };
  }

  // Build auth header (token is optional — falls back to unauth'd 60 req/hr)
  const authHeaders = {};
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await httpsGet(targetUrl, authHeaders);

    // Forward rate-limit headers so the client banner still works
    const forwardHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
    const rateLimitHeaders = [
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-ratelimit-used',
      'x-ratelimit-resource',
    ];
    rateLimitHeaders.forEach(h => {
      if (response.headers[h]) forwardHeaders[h] = response.headers[h];
    });

    return {
      statusCode: response.status,
      headers: forwardHeaders,
      body: response.body,
    };
  } catch (err) {
    console.error('github-proxy error:', err.message);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Upstream request failed', detail: err.message }),
    };
  }
};
