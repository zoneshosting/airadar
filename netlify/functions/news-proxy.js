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
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      redirect: 'follow',
      // Abort controller for a reasonable timeout
      signal: AbortSignal.timeout(10000)
    });
    
    const content = await response.text();
    
    return {
      statusCode: response.status >= 400 ? 502 : 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
      body: content,
    };
  } catch (err) {
    return { statusCode: 502, body: err.message || 'Proxy Error' };
  }
};
