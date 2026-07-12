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
        count: cache.data.length,
        records: cache.data,
        cachedAt: new Date(cache.timestamp).toISOString()
      });
    }

    // Try multiple endpoints
    const endpoints = [
      'https://api.retraction.watch/v1/retractions?limit=1000',
      'https://gitlab.com/api/v4/projects/crossref%2Fretraction-watch-data/repository/files/retraction_watch.csv/raw?ref=main'
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
          const data = await response.json();
          
          // Store in cache
          cache.data = data.retractions || data.data || [];
          cache.timestamp = Date.now();

          console.log(`✅ [Proxy] Fetched ${cache.data.length} records`);
          
          return res.json({
            success: true,
            source: endpoint.includes('retraction.watch') ? 'Retraction Watch API' : 'GitLab CSV',
            count: cache.data.length,
            records: cache.data,
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
