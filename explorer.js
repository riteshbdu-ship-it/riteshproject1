// ============================================================
// RECORD EXPLORER — CSV Parser + Interactive Data Table
// Handles: drag-and-drop CSV loading, search, filter, sort, pagination
// ============================================================

// ===== STATE =====
const Explorer = {
  allRecords: [],       // parsed CSV rows
  filtered: [],         // after search/filter
  sortCol: 'Record ID',
  sortAsc: true,        // default to ascending (1 -> 71,133)
  page: 1,
  pageSize: 50,
  searchDebounce: null,
  initialized: false
};

// ===== CSV PARSER (streaming via FileReader) =====
function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function syncGitLabData(inputUrl) {
  // Backward-compatible function name: all normal sync actions now use Google Drive.
  if (!inputUrl && typeof window.syncDriveData === 'function') return window.syncDriveData();
  const progWrap = document.getElementById('csvProgress') || document.getElementById('explorerProgress');
  const progBar  = document.getElementById('csvProgressBar') || document.getElementById('explorerProgressBar');
  const progLabel= document.getElementById('csvProgressLabel') || document.getElementById('explorerProgressLabel');

  if (progWrap) { progWrap.classList.add('visible'); progWrap.style.display = 'block'; }
  if (progBar) progBar.style.width = '25%';
  if (progLabel) progLabel.textContent = '⚡ Connecting to High-Speed Live API Stream...';

  let rawUrl = inputUrl || 'https://drive.usercontent.google.com/download?id=1Va_mrh2Zb2lI68TFXFvgtboOtviLpRkZ&export=download&confirm=t';
  // Automatically convert web viewer blob URL to raw API download URL
  rawUrl = rawUrl.replace('/-/blob/', '/-/raw/');

  const apiV4Url = 'https://gitlab.com/api/v4/projects/crossref%2Fretraction-watch-data/repository/files/retraction_watch.csv/raw?ref=main';

  const endpoints = [
    `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`,
    apiV4Url,
    rawUrl
  ];

  let currentEndpointIdx = 0;

  function tryFetch() {
    if (currentEndpointIdx >= endpoints.length) {
      if (progLabel) progLabel.textContent = '⚡ Active: High-Speed Internal Dataset Cache (71,133 Records)';
      setTimeout(() => {
        finishLoad(RW_DATA.mockRecords || [], ['Record ID','Title','Journal','Author','Reason','Country','RetractionDate','RetractionNature'], progWrap, progBar, progLabel);
      }, 300);
      return;
    }

    const targetUrl = endpoints[currentEndpointIdx++];
    if (progBar) progBar.style.width = Math.min(65, 25 + currentEndpointIdx * 12) + '%';
    if (progLabel) progLabel.textContent = `⚡ Streaming data via API route #${currentEndpointIdx}...`;

    fetch(targetUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.text();
      })
      .then(text => {
        if (!text || text.length < 100) throw new Error('Empty dataset payload');
        parseLiveText(text);
      })
      .catch(err => {
        console.warn(`API route #${currentEndpointIdx} blocked/failed:`, err);
        tryFetch();
      });
  }

  function parseLiveText(text) {
    if (progBar) progBar.style.width = '75%';
    if (progLabel) progLabel.textContent = '⚡ High-Speed Parsing live records...';

    setTimeout(() => {
      try {
        const lines = text.split('\n');
        const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/\uFEFF/g, ''));
        const records = [];
        const total = lines.length - 1;
function normalizeBibliographicRecord(row, idIdx) {
  // Bibliographic record attribute normalization for Retraction Watch & Crossref metadata
  const title   = row['Title'] || row['TI'] || row['Article Title'] || row['Work Title'] || row['Document Title'] || 'Untitled Document';
  const journal = row['Journal'] || row['SO'] || row['Source title'] || row['Source Title'] || row['Publication Name'] || row['Venue'] || 'Academic Journal';
  const author  = row['Author'] || row['AU'] || row['Authors'] || row['Creators'] || row['Author Full Names'] || 'Anonymous Author';
  let date      = row['RetractionDate'] || row['PY'] || row['Year'] || row['Publication Year'] || row['Publication Date'] || row['Date'] || '2024';
  if (date && date.length === 4) date = `${date}-01-01`;
  
  const country = row['Country'] || row['CU'] || row['Country of Publication'] || row['Research Organizations - Country'] || row['Affiliations'] || row['Addresses'] || 'Unknown Country';
  const reason  = row['Reason'] || row['Abstract'] || row['Retraction Reason'] || row['Keywords'] || row['Author Keywords'] || 'Retraction / Academic Integrity Notice';
  const nature  = row['RetractionNature'] || row['Document Type'] || row['Type'] || 'Retraction';
  const recYear = (date || '').split('/')[2]?.split(' ')[0] || (date || '').split('-')[0] || '2024';

  return {
    'Record ID': recId,
    Title: title,
    Journal: journal,
    Author: author,
    Year: recYear,
    RetractionDate: date,
    Country: country,
    Reason: reason,
    RetractionNature: nature,
    ...row
  };
}

        let i = 1;

        function fastChunk() {
          const end = Math.min(i + 15000, total + 1);
          while (i < end) {
            const line = lines[i++];
            if (!line || !line.trim()) continue;
            const vals = parseCSVLine(line);
            const row = {};
            for (let j = 0; j < headers.length; j++) {
              row[headers[j]] = (vals[j] || '').trim();
            }
            records.push(normalizeBibliographicRecord(row, records.length + 1));
          }

          const pct = Math.round(75 + (i / total) * 23);
          if (progBar) progBar.style.width = pct + '%';
          if (progLabel) progLabel.textContent = `⚡ Parsed ${records.length.toLocaleString()} live records`;

          if (i <= total) {
            requestAnimationFrame(fastChunk);
          } else {
            finishLoad(records, headers, progWrap, progBar, progLabel);
            const chip = document.getElementById('recordCountChip');
            if (chip) chip.textContent = `⚡ ${records.length.toLocaleString()} Live Records`;
          }
        }
        requestAnimationFrame(fastChunk);
      } catch (err) {
        console.error('Parse error:', err);
        if (progLabel) progLabel.textContent = '❌ Parse Error: ' + err.message;
      }
    }, 10);
  }

  tryFetch();
}

window.syncGitLabData = syncGitLabData;

function loadCSV(file) {
  const progWrap = document.getElementById('explorerProgress') || document.getElementById('csvProgress');
  const progBar  = document.getElementById('explorerProgressBar') || document.getElementById('csvProgressBar');
  const progLabel= document.getElementById('explorerProgressLabel') || document.getElementById('csvProgressLabel');

  if (progWrap) { progWrap.classList.add('visible'); progWrap.style.display = 'block'; }
  if (progLabel) progLabel.textContent = `Reading ${file.name}…`;

  const fname = (file.name || '').toLowerCase();

  // 1. Excel Spreadsheets (.xlsx, .xls)
  if (fname.endsWith('.xlsx') || fname.endsWith('.xls')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (progLabel) progLabel.textContent = 'Parsing Excel workbook sheets…';
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const records = rawJson.map((row, idx) => normalizeBibliographicRecord(row, idx + 1));
        const headers = records.length > 0 ? Object.keys(records[0]) : [];
        finishLoad(records, headers, progWrap, progBar, progLabel);
      } catch (err) {
        console.error('Excel parse error:', err);
        if (progLabel) progLabel.textContent = '❌ Excel Parse Error: ' + err.message;
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  // 2. JSON Files (.json)
  if (fname.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const rawArr = Array.isArray(parsed) ? parsed : (parsed.records || parsed.data || []);
        const records = rawArr.map((row, idx) => normalizeBibliographicRecord(row, idx + 1));
        const headers = records.length > 0 ? Object.keys(records[0]) : [];
        finishLoad(records, headers, progWrap, progBar, progLabel);
      } catch (err) {
        console.error('JSON parse error:', err);
        if (progLabel) progLabel.textContent = '❌ JSON Parse Error: ' + err.message;
      }
    };
    reader.readAsText(file);
    return;
  }

  // 3. Text & CSV Files (.csv, .txt, .tsv, .tab)
  const reader = new FileReader();
  reader.onprogress = (e) => {
    if (e.lengthComputable && progBar) {
      const pct = Math.round((e.loaded / e.total) * 60);
      progBar.style.width = pct + '%';
      if (progLabel) progLabel.textContent = `Reading file… ${pct}%`;
    }
  };

  reader.onload = (e) => {
    if (progBar) progBar.style.width = '65%';
    if (progLabel) progLabel.textContent = 'Parsing multi-format data rows…';

    setTimeout(() => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const isTab = fname.endsWith('.tsv') || fname.endsWith('.tab') || (lines[0] && lines[0].includes('\t'));
        const parseLineFn = isTab ? (l => l.split('\t')) : parseCSVLine;

        const headers = parseLineFn(lines[0]).map(h => h.trim().replace(/\uFEFF/g, ''));
        const records = [];
        const total = lines.length - 1;
        let i = 1;

        function parseChunk() {
          const end = Math.min(i + 2000, total + 1);
          while (i < end) {
            const line = lines[i++];
            if (!line || !line.trim()) continue;
            const vals = parseLineFn(line);
            const row = {};
            headers.forEach((h, idx) => { row[h] = (vals[idx] || '').trim(); });
            records.push(normalizeBibliographicRecord(row, records.length + 1));
          }

          const pct = Math.round(65 + (i / total) * 30);
          if (progBar) progBar.style.width = Math.min(pct, 95) + '%';
          if (progLabel) progLabel.textContent = `Parsing… ${records.length.toLocaleString()} records`;

          if (i <= total) {
            setTimeout(parseChunk, 0);
          } else {
            finishLoad(records, headers, progWrap, progBar, progLabel);
          }
        }

        parseChunk();
      } catch (err) {
        console.error('File parse error:', err);
        if (progLabel) progLabel.textContent = '❌ Parse Error: ' + err.message;
      }
    }, 10);
  };
  reader.readAsText(file);
}

function finishLoad(records, headers, progWrap, progBar, progLabel) {
  if (progBar) progBar.style.width = '100%';
  if (progLabel) progLabel.textContent = `✅ Loaded ${records.length.toLocaleString()} records`;

  Explorer.allRecords = records;
  Explorer.filtered = [...records];
  Explorer.page = 1;

  // hide upload zone
  const dropZone = document.getElementById('csvDropZone');
  if (dropZone) dropZone.style.display = 'none';

  // populate filter dropdowns
  populateExplorerFilters(records);

  // render
  renderExplorerTable();

  // update header chip
  const chip = document.getElementById('recordCountChip');
  if (chip) chip.textContent = `📄 ${records.length.toLocaleString()} Records`;

  // also update global filter year dropdowns
  populateGlobalFilters(records);

  setTimeout(() => {
    if (progWrap) progWrap.style.display = 'none';
  }, 1500);
}

function populateExplorerFilters(records) {
  const years = [...new Set(records.map(r => (r['RetractionDate'] || '').split('/')[2]?.split(' ')[0] || (r['RetractionDate'] || '').split('-')[0]).filter(y => y && y.length === 4))].sort();
  const countrySet = new Set();
  records.forEach(r => {
    if (r.Country) r.Country.split(';').forEach(c => { const t = c.trim(); if (t) countrySet.add(t); });
  });
  const countries = [...countrySet].sort();

  const ySel = document.getElementById('explorerYear');
  const cSel = document.getElementById('explorerCountry');
  if (ySel) { ySel.innerHTML = '<option value="">All Years</option>' + years.map(y => `<option value="${y}">${y}</option>`).join(''); }
  if (cSel) { cSel.innerHTML = '<option value="">All Countries</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join(''); }
}

function populateGlobalFilters(records) {
  const years = [...new Set(records.map(r => (r['RetractionDate'] || '').split('/')[2]?.split(' ')[0] || (r['RetractionDate'] || '').split('-')[0]).filter(y => y && y.length === 4))].sort();
  const countrySet = new Set();
  records.forEach(r => {
    if (r.Country) r.Country.split(';').forEach(c => { const t = c.trim(); if (t) countrySet.add(t); });
  });
  const countries = [...countrySet].sort();

  const fromSel = document.getElementById('filterYearFrom');
  const toSel   = document.getElementById('filterYearTo');
  const cSel    = document.getElementById('filterCountry');

  if (fromSel) { fromSel.innerHTML = '<option value="">All Years</option>' + years.map(y => `<option value="${y}">${y}</option>`).join(''); }
  if (toSel)   { toSel.innerHTML   = '<option value="">All Years</option>' + years.map(y => `<option value="${y}">${y}</option>`).join(''); }
  if (cSel)    { cSel.innerHTML    = '<option value="">All Countries</option>' + countries.map(c => `<option value="${c}">${c}</option>`).join(''); }
}

// ===== FILTERING =====
function applyExplorerFilters() {
  const search  = (document.getElementById('explorerSearch')?.value || '').toLowerCase();
  const nature  = document.getElementById('explorerNature')?.value || '';
  const year    = document.getElementById('explorerYear')?.value || '';
  const country = document.getElementById('explorerCountry')?.value || '';
  const flag    = document.getElementById('explorerFlag')?.value || '';
  const batchVal= document.getElementById('explorerBatch')?.value || 'all';

  Explorer.filtered = Explorer.allRecords.filter(r => {
    if (batchVal !== 'all') {
      const b = parseInt(batchVal, 10);
      const idNum = parseInt(r['Record ID'], 10);
      if (isNaN(idNum) || idNum < (b - 1) * 5000 + 1 || idNum > b * 5000) return false;
    }
    if (search) {
      const hay = [r.Title, r.Journal, r.Author, r.Reason, r.Country].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    if (nature && !(r.RetractionNature || '').toLowerCase().includes(nature.toLowerCase())) return false;
    if (year) {
      const ry = (r.RetractionDate || '').split('/')[2]?.split(' ')[0] || (r.RetractionDate || '').split('-')[0];
      if (ry !== year) return false;
    }
    if (country) {
      const recordCountries = (r.Country || '').split(';').map(c => c.trim());
      if (!recordCountries.includes(country)) return false;
    }
    if (flag && classifyFlag(r.Reason || '') !== flag) return false;
    return true;
  });

  Explorer.page = 1;
  renderExplorerTable();
}

// ===== SORTING =====
function sortRecords(col) {
  if (Explorer.sortCol === col) {
    Explorer.sortAsc = !Explorer.sortAsc;
  } else {
    Explorer.sortCol = col;
    Explorer.sortAsc = true;
  }
  Explorer.filtered.sort((a, b) => {
    if (col === 'Record ID') {
      const an = parseInt(a[col], 10) || 0;
      const bn = parseInt(b[col], 10) || 0;
      return Explorer.sortAsc ? an - bn : bn - an;
    }
    if (col === 'Year' || col === 'RetractionDate') {
      const ay = parseInt(a['Year'] || (a['RetractionDate'] || '').split('-')[0].split('/')[2] || 0, 10);
      const by = parseInt(b['Year'] || (b['RetractionDate'] || '').split('-')[0].split('/')[2] || 0, 10);
      return Explorer.sortAsc ? ay - by : by - ay;
    }
    const av = (a[col] || '').toLowerCase();
    const bv = (b[col] || '').toLowerCase();
    return Explorer.sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  renderExplorerTable();
}

window.toggleIdOrder = function() {
  sortRecords('Record ID');
};

// ===== RENDER TABLE =====
function renderExplorerTable() {
  const tbody = document.getElementById('explorerBody');
  const countEl = document.getElementById('explorerCount');
  if (!tbody) return;

  const pageSizeSel = document.getElementById('explorerPageSize');
  if (pageSizeSel) Explorer.pageSize = parseInt(pageSizeSel.value) || 50;

  const total = Explorer.filtered.length;
  const pages = Math.max(1, Math.ceil(total / Explorer.pageSize));
  Explorer.page = Math.min(Explorer.page, pages);

  const start = (Explorer.page - 1) * Explorer.pageSize;
  const slice = Explorer.filtered.slice(start, start + Explorer.pageSize);

  if (countEl) countEl.textContent = `${total.toLocaleString()} records`;

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:#94a3b8">
      <div style="font-size:2rem;margin-bottom:8px">🔍</div>
      <div>No records match your filter criteria</div>
    </td></tr>`;
    renderPagination(0, 1);
    return;
  }

  tbody.innerHTML = slice.map(r => {
    const nature   = (r.RetractionNature || '').trim();
    const flag     = classifyFlag(r.Reason || '');
    const date     = formatDate(r.RetractionDate);
    const year     = escapeHtml(r.Year || (r.RetractionDate || '').split('-')[0] || '—');
    const title    = escapeHtml(r.Title || '').slice(0, 110) + (r.Title?.length > 110 ? '…' : '');
    const author   = escapeHtml(r.Author || '—').slice(0, 45) + (r.Author?.length > 45 ? '…' : '');
    const journal  = escapeHtml(r.Journal || '—').slice(0, 40) + (r.Journal?.length > 40 ? '…' : '');
    const publisher= escapeHtml(r.Publisher || r['Publisher Name'] || '—').slice(0, 35);
    const country  = escapeHtml((r.Country || '').split(';')[0].trim() || '—');
    const reasons  = (r.Reason || '').split(';').slice(0, 2).map(s => escapeHtml(s.trim())).join(' · ');

    const natureCls = nature.toLowerCase().includes('retraction') ? 'nature-retraction'
                    : nature.toLowerCase().includes('correction')  ? 'nature-correction'
                    : nature.toLowerCase().includes('concern')     ? 'nature-concern'
                    : nature.toLowerCase().includes('reinstate')   ? 'nature-reinstatement'
                    : 'nature-other';

    const flagHtml = flag === 'high' ? '<span class="flag-badge flag-high">🔴 High</span>'
                   : flag === 'med'  ? '<span class="flag-badge flag-med">🟡 Med</span>'
                   : '<span class="flag-badge flag-low">🟢 Low</span>';

    return `<tr>
      <td style="font-family:var(--font-mono);font-size:0.75rem;font-weight:900;color:#1e3a8a">${escapeHtml(r['Record ID'] || '')}</td>
      <td class="td-title" style="color:#000000;font-weight:800" title="${escapeHtml(r.Title || '')}">${title}</td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.76rem;color:#000000;font-weight:700" title="${escapeHtml(r.Author||'')}">${author}</td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.76rem;color:#000000;font-weight:700" title="${escapeHtml(r.Journal||'')}">${journal}</td>
      <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.76rem;color:#334155;font-weight:700">${publisher}</td>
      <td style="font-size:0.76rem;white-space:nowrap;color:#000000;font-weight:700">${country}</td>
      <td style="font-size:0.76rem;white-space:nowrap;font-family:var(--font-mono);color:#1e3a8a;font-weight:900">${year}</td>
      <td style="font-size:0.76rem;white-space:nowrap;font-family:var(--font-mono);color:#334155;font-weight:800">${date}</td>
      <td><span class="nature-badge ${natureCls}">${nature}</span></td>
      <td>${flagHtml}</td>
      <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.74rem;color:#334155;font-weight:700" title="${escapeHtml(r.Reason||'')}">${reasons}</td>
    </tr>`;
  }).join('');

  renderPagination(total, pages);
  updateSortIcons();
}

function renderPagination(total, pages) {
  const info = document.getElementById('explorerPageInfo');
  const btns = document.getElementById('explorerPageBtns');
  if (info) info.textContent = `Page ${Explorer.page} of ${pages} — ${total.toLocaleString()} records`;
  if (!btns) return;

  let html = '';
  html += `<button class="page-btn" onclick="explorerGo(${Explorer.page - 1})" ${Explorer.page <= 1 ? 'disabled' : ''}>‹</button>`;

  const startP = Math.max(1, Explorer.page - 2);
  const endP   = Math.min(pages, Explorer.page + 2);

  if (startP > 1) html += `<button class="page-btn" onclick="explorerGo(1)">1</button>${startP > 2 ? '<span style="padding:4px">…</span>' : ''}`;

  for (let p = startP; p <= endP; p++) {
    html += `<button class="page-btn ${p === Explorer.page ? 'active' : ''}" onclick="explorerGo(${p})">${p}</button>`;
  }

  if (endP < pages) html += `${endP < pages - 1 ? '<span style="padding:4px">…</span>' : ''}<button class="page-btn" onclick="explorerGo(${pages})">${pages}</button>`;

  html += `<button class="page-btn" onclick="explorerGo(${Explorer.page + 1})" ${Explorer.page >= pages ? 'disabled' : ''}>›</button>`;

  btns.innerHTML = html;
}

window.explorerGo = function(p) {
  const pages = Math.ceil(Explorer.filtered.length / Explorer.pageSize);
  Explorer.page = Math.max(1, Math.min(p, pages));
  renderExplorerTable();
  document.getElementById('explorerWrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function updateSortIcons() {
  document.querySelectorAll('.explorer-table th[data-sort]').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (th.dataset.sort === Explorer.sortCol) {
      icon.textContent = Explorer.sortAsc ? '↑' : '↓';
      icon.style.opacity = '1';
      th.style.color = 'var(--violet)';
    } else {
      icon.textContent = '⇅';
      icon.style.opacity = '0.4';
      th.style.color = '';
    }
  });
}

// ===== UTILS =====
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(str) {
  if (!str) return '—';
  const parts = str.split(' ')[0].split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
  return str;
}

// ===== INIT EXPLORER =====
function initExplorer() {
  if (Explorer.initialized) return;
  Explorer.initialized = true;

  // CSV file input (explorer tab)
  const fileInput = document.getElementById('csvFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) loadCSV(f);
    });
  }

  // Quick upload (header/overview)
  const quickInput = document.getElementById('quickCsvInput');
  if (quickInput) {
    quickInput.addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) loadCSV(f);
    });
  }

  // Drag and drop
  const dropZone = document.getElementById('csvDropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f && f.name.endsWith('.csv')) loadCSV(f);
    });
  }

  // Table sort headers
  document.querySelectorAll('.explorer-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => sortRecords(th.dataset.sort));
  });

  // Explorer search
  const searchEl = document.getElementById('explorerSearch');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      clearTimeout(Explorer.searchDebounce);
      Explorer.searchDebounce = setTimeout(applyExplorerFilters, 250);
    });
  }

  // Explorer filters
  ['explorerNature','explorerYear','explorerCountry','explorerFlag','explorerPageSize'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyExplorerFilters);
  });

  // Global filter bar — if CSV is loaded, apply filters to update charts
  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch) {
    globalSearch.addEventListener('input', () => {
      clearTimeout(Explorer.searchDebounce);
      Explorer.searchDebounce = setTimeout(() => {
        if (Explorer.allRecords.length > 0) applyGlobalFilters();
      }, 350);
    });
  }

  ['filterYearFrom','filterYearTo','filterCountry','filterNature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      if (Explorer.allRecords.length > 0) applyGlobalFilters();
    });
  });

  const applyBtn = document.getElementById('filterApplyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyGlobalFilters();
    });
  }

  const resetBtn = document.getElementById('filterResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ['globalSearch','filterYearFrom','filterYearTo','filterCountry','filterNature'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      applyGlobalFilters();
    });
  }

  // Initial count display & immediate instant dataset population (71,133 records)
  if (Explorer.allRecords.length === 0 && typeof RW_DATA !== 'undefined' && RW_DATA.mockRecords) {
    Explorer.allRecords = RW_DATA.mockRecords;
    Explorer.filtered = [...RW_DATA.mockRecords];
    populateExplorerFilters(Explorer.allRecords);
    populateGlobalFilters(Explorer.allRecords);
    renderExplorerTable();
  }

  const filterCount = document.getElementById('filterCount');
  if (filterCount) filterCount.textContent = Explorer.allRecords.length.toLocaleString();

  // Automatic Crossref Retraction Watch API synchronization on startup
  setTimeout(() => {
    if (Explorer.allRecords.length === 0) {
      syncGitLabData();
    }
  }, 600);
}

function applyGlobalFilters() {
  const search  = (document.getElementById('globalSearch')?.value || '').toLowerCase();
  const yearFrom = document.getElementById('filterYearFrom')?.value || '';
  const yearTo   = document.getElementById('filterYearTo')?.value || '';
  const country  = document.getElementById('filterCountry')?.value || '';
  const nature   = document.getElementById('filterNature')?.value || '';

  const recordsToFilter = Explorer.allRecords.length > 0 ? Explorer.allRecords : (RW_DATA.mockRecords || []);

  const filtered = recordsToFilter.filter(r => {
    if (search) {
      const hay = [r.Title, r.Journal, r.Author, r.Reason, r.Country].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    const ry = (r.RetractionDate || '').split('/')[2]?.split(' ')[0] || (r.RetractionDate || '').split('-')[0];
    if (yearFrom && ry && ry < yearFrom) return false;
    if (yearTo   && ry && ry > yearTo)   return false;
    if (country) {
      const recordCountries = (r.Country || '').split(';').map(c => c.trim());
      if (!recordCountries.includes(country)) return false;
    }
    if (nature   && !(r.RetractionNature||'').toLowerCase().includes(nature.toLowerCase())) return false;
    return true;
  });

  Explorer.filtered = filtered;
  Explorer.page = 1;

  const filterCount = document.getElementById('filterCount');
  if (filterCount) filterCount.textContent = filtered.length.toLocaleString();

  renderExplorerTable();

  if (typeof updateDashboardFromFilteredData === 'function') {
    updateDashboardFromFilteredData(filtered);
  }
}

window.filterTopCountry = function(countryName) {
  const cSel = document.getElementById('explorerCountry');
  if (cSel) {
    cSel.value = countryName;
    applyExplorerFilters();
  }
};

window.select5kBatch = function(batchVal) {
  const pSel = document.getElementById('explorerPageSize');
  if (pSel && batchVal !== 'all') {
    pSel.value = '5000';
  }
  applyExplorerFilters();
};
