// ============================================================
// BACKEND PROXY SERVER (Optional)
// Run this on your own server to avoid CORS restrictions
// npm install express cors node-fetch dotenv
// ============================================================

// Usage: node backend_proxy.js
// Set PORT env variable (default: 3000)
// Access: http://localhost:3000/api/retraction-watch

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Cache for reducing API calls
const cache = {
  data: [],
  timestamp: null,
  TTL: 3600000 // 1 hour
};

const DRIVE_CSV_URL = 'https://drive.usercontent.google.com/download?id=1Va_mrh2Zb2lI68TFXFvgtboOtviLpRkZ&export=download&confirm=t';

// Same-origin endpoint used by drive_data.js. This avoids Google Drive's
// cross-origin resource policy while keeping the cron-refreshed file authoritative.
app.get('/api/drive-csv', async (req, res) => {
  try {
    if (typeof cache.data === 'string' && cache.data.length && Date.now() - cache.timestamp < cache.TTL) {
      return res.type('text/csv').set('Cache-Control', 'no-store').send(cache.data);
    }
    const response = await fetch(DRIVE_CSV_URL, { headers: { 'User-Agent': 'Dashboard-Proxy/1.0' } });
    if (!response.ok) throw new Error(`Google Drive returned HTTP ${response.status}`);
    const csv = await response.text();
    if (!csv.includes(',')) throw new Error('Google Drive did not return CSV data');
    cache.data = csv;
    cache.timestamp = Date.now();
    return res.type('text/csv').set('Cache-Control', 'no-store').send(csv);
  } catch (error) {
    return res.status(502).json({ success: false, error: error.message });
  }
});

// ===== PROXY ENDPOINTS =====

/**
 * GET /api/retraction-watch
 * Fetch from Retraction Watch API with caching
 */
app.get('/api/retraction-watch', async (req, res) => {
  console.log('📡 [Proxy] Incoming request: /api/retraction-watch');

  try {
    // Check cache first
    if (cache.data.length > 0 && Date.now() - cache.timestamp < cache.TTL) {
      console.log('📦 [Proxy] Returning cached data');
      return res.json({
        success: true,
        source: 'Proxy Cache',
        count: Array.isArray(cache.data) ? cache.data.length : null,
        records: Array.isArray(cache.data) ? cache.data : undefined,
        csv: typeof cache.data === 'string' ? cache.data : undefined,
        cachedAt: new Date(cache.timestamp).toISOString()
      });
    }

    // Try multiple endpoints
    const endpoints = [
      'https://api.retraction.watch/v1/retractions?limit=1000',
      'https://drive.usercontent.google.com/download?id=1Va_mrh2Zb2lI68TFXFvgtboOtviLpRkZ&export=download&confirm=t'
    ];

    let result = null;
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 [Proxy] Trying endpoint: ${endpoint.substring(0, 50)}...`);
        
        const response = await fetch(endpoint, {
          timeout: 10000,
          headers: { 'User-Agent': 'Dashboard-Proxy/1.0' }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          const data = contentType.includes('json') ? await response.json() : await response.text();
          
          // Store in cache
          cache.data = typeof data === 'string' ? data : (data.retractions || data.data || []);
          cache.timestamp = Date.now();

          console.log(`✅ [Proxy] Fetched ${cache.data.length} records`);
          
          return res.json({
            success: true,
            source: endpoint.includes('retraction.watch') ? 'Retraction Watch API' : 'Google Drive CSV',
            count: Array.isArray(cache.data) ? cache.data.length : null,
            records: Array.isArray(cache.data) ? cache.data : undefined,
            csv: typeof cache.data === 'string' ? cache.data : undefined,
            fetchedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`⚠️ [Proxy] Endpoint failed: ${err.message}`);
        continue;
      }
    }

    throw new Error('All endpoints failed');
  } catch (err) {
    console.error('❌ [Proxy] Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      fallback: 'Please upload a CSV file manually'
    });
  }
});

/**
 * POST /api/proxy
 * Generic proxy endpoint for any URL
 */
app.post('/api/proxy', async (req, res) => {
  const { url, method = 'GET' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    console.log(`🔄 [Proxy] Proxying request: ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      timeout: 15000,
      headers: {
        'User-Agent': 'Dashboard-Proxy/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      data,
      source: new URL(url).hostname,
      fetchedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ [Proxy] Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/cache-status
 * Check current cache status
 */
app.get('/api/cache-status', (req, res) => {
  const age = cache.timestamp ? Date.now() - cache.timestamp : null;
  const isFresh = age !== null && age < cache.TTL;

  res.json({
    recordCount: cache.data.length,
    lastFetch: cache.timestamp ? new Date(cache.timestamp).toISOString() : null,
    cacheAge: age ? Math.round(age / 1000) + ' seconds' : null,
    isFresh,
    ttl: cache.TTL / 1000 + ' seconds'
  });
});

/**
 * POST /api/clear-cache
 * Manual cache clearing
 */
app.post('/api/clear-cache', (req, res) => {
  cache.data = [];
  cache.timestamp = null;
  console.log('🗑️ [Proxy] Cache cleared');
  res.json({ success: true, message: 'Cache cleared' });
});

// Serve the dashboard and its assets when launched with `npm start`.
app.use(express.static(__dirname));

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('❌ [Proxy] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ===== SERVER STARTUP =====
app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   🚀 DASHBOARD PROXY SERVER ACTIVE    ║
    ║   Port: ${PORT.toString().padEnd(34)} ║
    ║   URL: http://localhost:${PORT}        ║
    ║                                        ║
    ║   📡 Available Endpoints:              ║
    ║   • GET  /api/retraction-watch         ║
    ║   • POST /api/proxy                    ║
    ║   • GET  /api/cache-status             ║
    ║   • POST /api/clear-cache              ║
    ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
