// api/sentiment.js
// Vercel Serverless Function: POST /api/sentiment  or  GET /api/sentiment?text=...
const { SentimentEngine } = require('../lib/sentimentEngine');

const engine = new SentimentEngine();

module.exports = async function handler(req, res) {
  // Basic CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const text = req.query.text;
      if (!text) {
        res.status(400).json({ error: 'Missing "text" query parameter.' });
        return;
      }
      const result = engine.analyze(text);
      res.status(200).json(result);
      return;
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      // Batch mode: { texts: ["...", "..."] }
      if (Array.isArray(body.texts)) {
        const results = engine.analyzeBatch(body.texts);
        res.status(200).json({ results });
        return;
      }

      // Single mode: { text: "..." }
      if (typeof body.text === 'string') {
        const result = engine.analyze(body.text);
        res.status(200).json(result);
        return;
      }

      res.status(400).json({ error: 'Provide "text" (string) or "texts" (array) in the request body.' });
      return;
    }

    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.', details: err.message });
  }
};
