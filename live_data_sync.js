// ============================================================
// LIVE DATA SYNC UI — Real-time status, sync controls, cache management
// ============================================================

class LiveDataSyncUI {
  constructor() {
    this.syncInProgress = false;
    this.statusElement = null;
    this.init();
  }

  init() {
    console.log('🔄 [LiveDataSyncUI] Initializing live data sync UI...');
    this.createSyncStatusPanel();
    this.attachEventListeners();
    this.updateStatusDisplay();
    
    // Update status every 5 seconds
    setInterval(() => this.updateStatusDisplay(), 5000);
  }

  createSyncStatusPanel() {
    // Create status badge in header
    const header = document.querySelector('.header-meta');
    if (!header) return;

    const statusBadge = document.createElement('div');
    statusBadge.id = 'liveDataStatus';
    statusBadge.className = 'meta-chip';
    statusBadge.innerHTML = `
      <span class="dot pulse"></span>
      <span id="statusText">⚡ Loading Live Data...</span>
    `;
    statusBadge.style.cssText = `
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    `;

    statusBadge.addEventListener('click', () => this.showDetailedStatus());
    header.insertBefore(statusBadge, header.firstChild);
    this.statusElement = statusBadge;

    // Add CSS for pulse animation
    if (!document.getElementById('syncUiStyles')) {
      const style = document.createElement('style');
      style.id = 'syncUiStyles';
      style.textContent = `
        .dot.pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background: #10b981;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .sync-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #ffffff;
          border: 2px solid #1e3a8a;
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 99999;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
          font-family: 'Inter', sans-serif;
        }
        .sync-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99998;
        }
        .sync-stat-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .sync-stat-label {
          font-weight: 700;
          color: #334155;
        }
        .sync-stat-value {
          font-weight: 900;
          color: #1e3a8a;
          font-family: 'JetBrains Mono', monospace;
        }
      `;
      document.head.appendChild(style);
    }
  }

  updateStatusDisplay() {
    if (!this.statusElement || this.syncInProgress) return;

    const status = APIService.getCacheStatus();
    const statusText = document.getElementById('statusText');

    if (!statusText) return;

    if (status.isFresh) {
      statusText.textContent = `✅ Live (${status.recordCount.toLocaleString()} records)`;
      this.statusElement.style.background = '#d1fae5';
    } else if (status.isCached) {
      const ageMinutes = Math.round((status.cacheAge || 0) / 60000);
      statusText.textContent = `📦 Cached (${ageMinutes}m old)`;
      this.statusElement.style.background = '#fef3c7';
    } else {
      statusText.textContent = '⚠️ Offline Mode';
      this.statusElement.style.background = '#fee2e2';
    }
  }

  showDetailedStatus() {
    const status = APIService.getCacheStatus();

    const overlay = document.createElement('div');
    overlay.className = 'sync-modal-overlay';
    overlay.onclick = () => {
      overlay.remove();
      modal.remove();
    };

    const modal = document.createElement('div');
    modal.className = 'sync-modal';
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px;">
        <h2 style="margin: 0; color: #1e3a8a; font-size: 1.3rem;">🔄 Live Data Status</h2>
        <button onclick="this.closest('.sync-modal').parentElement.remove(); this.closest('.sync-modal').remove();" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
      </div>

      <div class="sync-stat-row">
        <span class="sync-stat-label">📊 Total Records:</span>
        <span class="sync-stat-value">${status.recordCount.toLocaleString()}</span>
      </div>

      <div class="sync-stat-row">
        <span class="sync-stat-label">⏱️ Last Sync:</span>
        <span class="sync-stat-value">${status.lastFetch}</span>
      </div>

      <div class="sync-stat-row">
        <span class="sync-stat-label">📦 Cache Status:</span>
        <span class="sync-stat-value" style="color: ${status.isFresh ? '#10b981' : '#f59e0b'}">${status.isFresh ? '✅ Fresh' : '⚠️ Stale'}</span>
      </div>

      <div class="sync-stat-row">
        <span class="sync-stat-label">🕐 Cache Age:</span>
        <span class="sync-stat-value">${status.cacheAge ? Math.round(status.cacheAge / 60000) + ' minutes' : 'N/A'}</span>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <button onclick="APIService.initialize().then(() => { alert('✅ Sync completed!'); location.reload(); })" 
          style="width: 100%; padding: 12px; background: #1e3a8a; color: #fff; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 0.95rem;">
          🔄 Force Refresh All Data
        </button>
      </div>

      <div style="margin-top: 14px; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #0891b2; font-size: 0.82rem; color: #334155; line-height: 1.5;">
        <strong>ℹ️ How Sync Works:</strong><br/>
        • Auto-sync every 10 minutes<br/>
        • Cache stays fresh for 1 hour<br/>
        • Fallback to mock data if APIs unreachable<br/>
        • Upload CSV to use local file
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }

  attachEventListeners() {
    // Sync button in header (if exists)
    const syncBtn = document.getElementById('syncGitLabBtn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.performManualSync());
    }
  }

  async performManualSync() {
    if (this.syncInProgress) {
      alert('⏳ Sync already in progress...');
      return;
    }

    this.syncInProgress = true;
    const statusText = document.getElementById('statusText');
    if (statusText) statusText.textContent = '⏳ Syncing...';

    try {
      const result = await APIService.initialize();
      alert(`✅ Sync completed!\n\n📊 Loaded: ${result.count.toLocaleString()} records\n📡 Source: ${result.source}`);
      location.reload();
    } catch (err) {
      alert(`❌ Sync failed:\n${err.message}`);
    } finally {
      this.syncInProgress = false;
      this.updateStatusDisplay();
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 [LiveDataSyncUI] Initializing...');
  
  // Initialize API Service
  if (typeof APIService !== 'undefined') {
    APIService.initialize().then(result => {
      console.log(`✅ API Service initialized with ${result.count} records from ${result.source}`);
      
      // Initialize UI
      new LiveDataSyncUI();

      // Update explorer with live data
      if (typeof Explorer !== 'undefined') {
        const records = APIService.getRecords();
        if (records.length > 0) {
          Explorer.allRecords = records;
          Explorer.filtered = [...records];
          if (typeof renderExplorerTable === 'function') {
            renderExplorerTable();
          }
        }
      }
    });
  }
});

console.log('✅ Live Data Sync UI loaded successfully');
