// server.js
// Plain Node.js dev server — no Vercel CLI needed.
// Mirrors the same behavior as api/sentiment.js so you can test locally in VS Code.
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { SentimentEngine } = require('./lib/sentimentEngine');

const engine = new SentimentEngine();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (parsed.pathname !== '/api/sentiment') {
    // Serve the frontend for "/" and any static file under /public
    const reqPath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
    const filePath = path.join(PUBLIC_DIR, reqPath);

    if (filePath.startsWith(PUBLIC_DIR) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    sendJson(res, 404, { error: 'Not found. Try / or /api/sentiment' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const text = parsed.query.text;
      if (!text) {
        sendJson(res, 400, { error: 'Missing "text" query parameter.' });
        return;
      }
      sendJson(res, 200, engine.analyze(text));
      return;
    }

    if (req.method === 'POST') {
      const body = await readBody(req);

      if (Array.isArray(body.texts)) {
        sendJson(res, 200, { results: engine.analyzeBatch(body.texts) });
        return;
      }

      if (typeof body.text === 'string') {
        sendJson(res, 200, engine.analyze(body.text));
        return;
      }

      sendJson(res, 400, { error: 'Provide "text" (string) or "texts" (array) in the request body.' });
      return;
    }

    sendJson(res, 405, { error: `Method ${req.method} not allowed.` });
  } catch (err) {
    sendJson(res, 500, { error: 'Internal server error.', details: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n✅ Sentiment Engine dev server running at http://localhost:${PORT}`);
  console.log(`   Try:  http://localhost:${PORT}/api/sentiment?text=I%20love%20this!`);
  console.log(`   Or:   curl -X POST http://localhost:${PORT}/api/sentiment -H "Content-Type: application/json" -d '{"text":"This is amazing!"}'\n`);
});
