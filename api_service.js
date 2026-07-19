// ============================================================
// API SERVICE LAYER — Live Retraction Watch Data Integration
// Connects to: Retraction Watch API, Crossref API, GitLab Raw
// Fallback: Local mock data cache with automatic sync scheduler
// ============================================================

const APIService = {
  // Configuration
  config: {
    RETRACTION_WATCH_API: 'https://api.retraction.watch',
    CROSSREF_API: 'https://api.crossref.org',
    GITLAB_RAW: 'https://drive.usercontent.google.com/download?id=1Va_mrh2Zb2lI68TFXFvgtboOtviLpRkZ&export=download&confirm=t',
    TIMEOUT: 15000,
    CACHE_TTL: 3600000, // 1 hour in milliseconds
    AUTO_SYNC_INTERVAL: 600000 // 10 minutes
  },

  // Runtime state
  cache: {
    records: [],
    lastFetch: null,
    isCached: false,
    syncInProgress: false
  },

  // ===== PRIMARY: Retraction Watch REST API =====
  async fetchFromRetractionWatchAPI() {
    console.log('🌐 [APIService] Fetching from Retraction Watch REST API...');
    try {
      const response = await fetch(`${this.config.RETRACTION_WATCH_API}/v1/retractions?limit=1000&sort=-id`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AI-Ethics-Dashboard/1.0'
        },
        timeout: this.config.TIMEOUT
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const records = this.normalizeRetractionWatchRecords(data.retractions || data.data || []);
      
      console.log(`✅ [APIService] Loaded ${records.length} records from Retraction Watch API`);
      this.cache.records = records;
      this.cache.lastFetch = Date.now();
      this.cache.isCached = true;
      
      return { success: true, records, source: 'Retraction Watch API', count: records.length };
    } catch (err) {
      console.warn('⚠️ [APIService] Retraction Watch API failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ===== SECONDARY: Crossref API (alternative lookup) =====
  async fetchFromCrossrefAPI(filters = {}) {
    console.log('🌐 [APIService] Fetching from Crossref API with filters:', filters);
    try {
      const query = new URLSearchParams({
        query: 'retraction OR retracted',
        rows: 1000,
        offset: 0,
        sort: 'published-desc',
        ...filters
      });

      const response = await fetch(`${this.config.CROSSREF_API}/works?${query}`, {
        method: 'GET',
        headers: { 'User-Agent': 'AI-Ethics-Dashboard/1.0' },
        timeout: this.config.TIMEOUT
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const records = this.normalizeCrossrefRecords(data.message?.items || []);
      
      console.log(`✅ [APIService] Loaded ${records.length} records from Crossref API`);
      return { success: true, records, source: 'Crossref API', count: records.length };
    } catch (err) {
      console.warn('⚠️ [APIService] Crossref API failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ===== TERTIARY: GitLab CSV (direct raw access) =====
  async fetchFromGitLabCSV() {
    console.log('🌐 [APIService] Fetching from GitLab raw CSV...');
    try {
      const response = await fetch(this.config.GITLAB_RAW, {
        method: 'GET',
        headers: { 'User-Agent': 'AI-Ethics-Dashboard/1.0' },
        timeout: this.config.TIMEOUT
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const text = await response.text();
      const records = this.parseCSVData(text);
      
      console.log(`✅ [APIService] Loaded ${records.length} records from GitLab CSV`);
      this.cache.records = records;
      this.cache.lastFetch = Date.now();
      this.cache.isCached = true;
      
      return { success: true, records, source: 'GitLab CSV', count: records.length };
    } catch (err) {
      console.warn('⚠️ [APIService] GitLab CSV fetch failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ===== SMART FALLBACK CHAIN =====
  async fetchWithFallback() {
    console.log('🔄 [APIService] Starting smart fallback chain...');

    // Try each endpoint in sequence
    const endpoints = [
      () => this.fetchFromRetractionWatchAPI(),
      () => this.fetchFromCrossrefAPI(),
      () => this.fetchFromGitLabCSV()
    ];

    for (let i = 0; i < endpoints.length; i++) {
      const result = await endpoints[i]();
      if (result.success && result.records.length > 0) {
        return result;
      }
      console.log(`⚠️ [APIService] Endpoint ${i + 1} failed, trying next...`);
    }

    // All live APIs failed - use mock data
    console.log('⚠️ [APIService] All live APIs failed. Using mock data cache.');
    return {
      success: true,
      records: this.getMockData(),
      source: 'Mock Cache (Fallback)',
      count: this.getMockData().length,
      isFallback: true
    };
  },

  // ===== DATA NORMALIZATION =====
  normalizeRetractionWatchRecords(records) {
    return records.map((r, idx) => ({
      'Record ID': String(r.id || idx + 1),
      Title: r.title || r.article_title || 'Untitled',
      Journal: r.journal || r.publication || 'Unknown Journal',
      Author: r.authors || r.author_names || 'Anonymous',
      Publisher: r.publisher || 'Unknown Publisher',
      Country: r.country || 'Unknown',
      Reason: r.reason || r.retraction_reason || 'Retraction',
      RetractionDate: r.retraction_date || r.date_retracted || new Date().toISOString(),
      RetractionNature: r.type || 'Retraction',
      Year: new Date(r.retraction_date || r.date_retracted || Date.now()).getFullYear().toString(),
      ...r
    }));
  },

  normalizeCrossrefRecords(items) {
    return items.map((item, idx) => ({
      'Record ID': String(item.DOI || idx + 1),
      Title: item.title?.[0] || 'Untitled',
      Journal: item['container-title']?.[0] || 'Unknown Journal',
      Author: (item.author || []).map(a => `${a.given} ${a.family}`).join('; ') || 'Anonymous',
      Publisher: item.publisher || 'Unknown',
      Country: 'N/A',
      Reason: item.abstract?.substring(0, 200) || 'Retraction Notice',
      RetractionDate: item['published-online']?.['date-parts']?.[0] ? new Date(item['published-online']['date-parts'][0]).toISOString() : new Date().toISOString(),
      RetractionNature: 'Retraction',
      Year: item['published-online']?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
      ...item
    }));
  },

  parseCSVData(csvText) {
    const lines = csvText.split('\n');
    const headers = this.parseCSVLine(lines[0]).map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = this.parseCSVLine(lines[i]);
      const row = {};
      
      headers.forEach((h, idx) => {
        row[h] = (values[idx] || '').trim();
      });

      records.push({
        'Record ID': row['Record ID'] || String(i),
        Title: row['Title'] || row['Article Title'] || 'Untitled',
        Journal: row['Journal'] || row['Source'] || 'Unknown',
        Author: row['Author'] || row['Authors'] || 'Anonymous',
        Publisher: row['Publisher'] || 'Unknown',
        Country: row['Country'] || 'Unknown',
        Reason: row['Reason'] || row['Retraction Reason'] || 'Retraction',
        RetractionDate: row['RetractionDate'] || row['Date'] || new Date().toISOString(),
        RetractionNature: row['RetractionNature'] || row['Type'] || 'Retraction',
        Year: new Date(row['RetractionDate'] || new Date()).getFullYear().toString(),
        ...row
      });
    }

    return records;
  },

  parseCSVLine(line) {
    const result = [];
    let inQuotes = false;
    let cur = '';
    
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { 
          cur += '"'; 
          i++; 
        } else { 
          inQuotes = !inQuotes; 
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  },

  // ===== MOCK DATA FALLBACK =====
  getMockData() {
    if (typeof RW_DATA !== 'undefined' && RW_DATA.mockRecords) {
      return RW_DATA.mockRecords;
    }
    return [];
  },

  // ===== FILTER & SEARCH =====
  filterRecords(records, filters = {}) {
    return records.filter(r => {
      if (filters.search) {
        const hay = [r.Title, r.Journal, r.Author, r.Reason, r.Country].join(' ').toLowerCase();
        if (!hay.includes(filters.search.toLowerCase())) return false;
      }
      if (filters.yearFrom && parseInt(r.Year) < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && parseInt(r.Year) > parseInt(filters.yearTo)) return false;
      if (filters.country && !r.Country?.includes(filters.country)) return false;
      if (filters.nature && !r.RetractionNature?.toLowerCase().includes(filters.nature.toLowerCase())) return false;
      return true;
    });
  },

  // ===== AUTO-SYNC SCHEDULER =====
  startAutoSync() {
    console.log('🔄 [APIService] Auto-sync scheduler started (interval: 10 minutes)');
    
    setInterval(async () => {
      if (this.cache.syncInProgress) {
        console.log('⏳ [APIService] Sync already in progress, skipping...');
        return;
      }

      const now = Date.now();
      if (this.cache.lastFetch && (now - this.cache.lastFetch) < this.config.CACHE_TTL) {
        console.log('📦 [APIService] Cache still fresh, skipping sync');
        return;
      }

      console.log('🔄 [APIService] Cache expired, triggering sync...');
      this.cache.syncInProgress = true;

      try {
        const result = await this.fetchWithFallback();
        console.log(`✅ [APIService] Auto-sync completed: ${result.count} records from ${result.source}`);
      } catch (err) {
        console.error('❌ [APIService] Auto-sync failed:', err);
      } finally {
        this.cache.syncInProgress = false;
      }
    }, this.config.AUTO_SYNC_INTERVAL);
  },

  // ===== PUBLIC API =====
  async initialize() {
    console.log('🚀 [APIService] Initializing API Service...');
    const result = await this.fetchWithFallback();
    this.startAutoSync();
    return result;
  },

  getRecords() {
    return this.cache.records;
  },

  getCacheStatus() {
    return {
      recordCount: this.cache.records.length,
      lastFetch: this.cache.lastFetch ? new Date(this.cache.lastFetch).toISOString() : 'Never',
      isCached: this.cache.isCached,
      cacheAge: this.cache.lastFetch ? Date.now() - this.cache.lastFetch : null,
      isFresh: this.cache.lastFetch ? (Date.now() - this.cache.lastFetch) < this.config.CACHE_TTL : false
    };
  }
};

// Export for global use
window.APIService = APIService;

console.log('✅ API Service loaded successfully');
