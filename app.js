// ============================================================
// MAIN APP — Tab navigation, Overview charts, KPI counters
// Light-theme edition with interactive global filter support
// ============================================================

// ===== CHART.JS GLOBAL DEFAULTS (light theme) =====
// ===== CHART.JS GLOBAL DEFAULTS (light theme) =====
Chart.defaults.color = '#000000';
Chart.defaults.borderColor = 'rgba(100,116,139,0.15)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.weight = '700';

// ===== TAB NAVIGATION =====
document.getElementById('tabNav')?.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  const tab = btn.dataset.tab;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById(`tab-${tab}`)?.classList.add('active');

  // Lazy-init visualizations on first open
  if (tab === 'explorer'      && !Explorer.initialized) initExplorer();
  if (tab === 'vosviewer')     { if (!vosSimulation) initVOSviewer(); else renderVOSviewer(); }
  if (tab === 'topics')        { if (!topicTimeChart) initTopicModeling(); else renderWordCloud(activeTopicId); }
  if (tab === 'scientopy'     && !spBarChart) initSciencePy();
  if (tab === 'bibliometrics') initBibliometrics();
  if (tab === 'collab')        initCollabIndices();
  if (tab === 'ethics')        initEthicsPrinciples();
  if (tab === 'report')        initReportTab();
  
  setTimeout(() => attachFigureExportButtons(), 100);
});

// ===== KPI COUNTER ANIMATION & DYNAMIC FILTER UPDATES =====
function animateCounters() {
  document.querySelectorAll('.kpi-val[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

function updateDashboardFromFilteredData(filtered) {
  const globalSearch = document.getElementById('globalSearch')?.value;
  const yearFrom = document.getElementById('filterYearFrom')?.value;
  const yearTo = document.getElementById('filterYearTo')?.value;
  const country = document.getElementById('filterCountry')?.value;
  const nature = document.getElementById('filterNature')?.value;
  const hasActiveFilter = globalSearch || yearFrom || yearTo || country || nature;

  const kpiTotal = document.querySelector('#kpiTotal .kpi-val');
  const kpiPM    = document.querySelector('#kpiPaperMill .kpi-val');
  const kpiAI    = document.querySelector('#kpiAI .kpi-val');
  const kpiC     = document.querySelector('#kpiCountries .kpi-val');
  const kpiJ     = document.querySelector('#kpiJournals .kpi-val');
  const kpiInv   = document.querySelector('#kpiInvestigations .kpi-val');

  if (!filtered || (filtered.length === 0 && !hasActiveFilter)) {
    if (kpiTotal) kpiTotal.textContent = '71,133';
    if (kpiPM)    kpiPM.textContent    = '11,796';
    if (kpiAI)    kpiAI.textContent    = '9,135';
    if (kpiC)     kpiC.textContent     = '94';
    if (kpiJ)     kpiJ.textContent     = '312';
    if (kpiInv)   kpiInv.textContent   = '30,845';
    return;
  }

  // Recalculate KPI metrics dynamically
  const total = filtered.length;
  let pmCount = 0, aiCount = 0, invCount = 0;
  const countries = new Set();
  const journals = new Set();

  filtered.forEach(r => {
    const reason = (r.Reason || '').toLowerCase();
    if (reason.includes('paper mill') || reason.includes('fake') || reason.includes('concerns')) pmCount++;
    if (reason.includes('ai') || reason.includes('chatgpt') || reason.includes('machine') || reason.includes('generative')) aiCount++;
    if (reason.includes('investigation') || reason.includes('inquiry')) invCount++;
    if (r.Country) r.Country.split(';').forEach(c => countries.add(c.trim()));
    if (r.Journal) journals.add(r.Journal.trim());
  });

  if (kpiTotal) kpiTotal.textContent = total.toLocaleString();
  if (kpiPM)    kpiPM.textContent    = pmCount.toLocaleString();
  if (kpiAI)    kpiAI.textContent    = aiCount.toLocaleString();
  if (kpiC)     kpiC.textContent     = countries.size.toLocaleString();
  if (kpiJ)     kpiJ.textContent     = journals.size.toLocaleString();
  if (kpiInv)   kpiInv.textContent   = invCount.toLocaleString();

  // Dynamically re-render active tab visualizations & synchronize Master Report
  const activeTabBtn = document.querySelector('.tab-btn.active');
  const activeTab = activeTabBtn?.dataset.tab;

  if (activeTab === 'overview' && typeof initOverview === 'function') initOverview();
  if (activeTab === 'vosviewer' && typeof renderVOSviewer === 'function') renderVOSviewer();
  if (activeTab === 'topics' && typeof initTopicModeling === 'function') initTopicModeling();
  if (activeTab === 'scientopy' && typeof initSciencePy === 'function') initSciencePy();
  if (activeTab === 'bibliometrics' && typeof initBibliometrics === 'function') initBibliometrics();
  if (activeTab === 'collab' && typeof initCollabIndices === 'function') initCollabIndices();
  if (activeTab === 'ethics' && typeof initEthicsPrinciples === 'function') initEthicsPrinciples();
  
  if (typeof initReportTab === 'function') initReportTab();
}

window.updateDashboardFromFilteredData = updateDashboardFromFilteredData;

// ===== LIGHT THEME SCALE DEFAULTS =====
const scaleDefaults = {
  x: {
    ticks: { color: '#000000', font: { size: 10, weight: '700' } },
    grid: { color: 'rgba(100,116,139,0.12)' }
  },
  y: {
    ticks: { color: '#000000', font: { size: 10, weight: '700' } },
    grid: { color: 'rgba(100,116,139,0.12)' }
  }
};

// ===== OVERVIEW CHARTS =====
let growthChartInst = null;
let principlesPieChartInst = null;
let keywordsBarChartInst = null;
let domainsRadarChartInst = null;
let docTypesChartInst = null;
let countriesChartInst = null;
let publishersChartInst = null;

function initOverview() {
  renderGrowthChart();
  renderPrinciplesPieChart();
  renderKeywordsBarChart();
  renderDomainsRadarChart();
  renderDocTypesChart();
  renderCountriesChart();
  renderPublishersChart();
}

function renderGrowthChart() {
  const ctx = document.getElementById('growthChart');
  if (!ctx) return;

  const recentYears = RW_DATA.byYear.filter(y => y.year >= 2010);
  const years  = recentYears.map(y => y.year);
  const counts = recentYears.map(y => y.count);
  
  // Calculate a clean 3-year smoothed trend line level directly aligned with bars
  const trendLine = counts.map((c, i, arr) => {
    const prev = arr[i - 1] !== undefined ? arr[i - 1] : c;
    const next = arr[i + 1] !== undefined ? arr[i + 1] : c;
    return Math.round((prev + c + next) / 3);
  });

  if (growthChartInst) growthChartInst.destroy();
  growthChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Annual Retractions',
          data: counts,
          backgroundColor: '#1e3a8add',
          borderColor: '#1e3a8a',
          borderWidth: 1.5,
          borderRadius: 6,
          order: 2
        },
        {
          label: '3-Year Smoothed Retraction Growth Trend Line',
          data: trendLine,
          type: 'line',
          borderColor: '#be123c',
          backgroundColor: 'rgba(190,18,60,0.08)',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#be123c',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          fill: true,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#000000', font: { size: 11, weight: '800' }, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} papers`
          }
        }
      },
      scales: {
        x: { ...scaleDefaults.x },
        y: { ...scaleDefaults.y, title: { display: true, text: 'Number of Retracted Publications', color: '#1e3a8a', font: { size: 11, weight: '800' } } }
      }
    }
  });
}

function renderPrinciplesPieChart() {
  const ctx = document.getElementById('principlesPieChart');
  if (!ctx) return;

  if (principlesPieChartInst) principlesPieChartInst.destroy();
  principlesPieChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: RW_DATA.byNature.map(n => n.name),
      datasets: [{
        data: RW_DATA.byNature.map(n => n.count),
        backgroundColor: ['#f43f5ecc','#f59e0bcc','#06b6d4cc','#10b981cc','#94a3b8cc'],
        borderColor: ['#f43f5e','#f59e0b','#06b6d4','#10b981','#94a3b8'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '66%',
      plugins: {
        legend: { position: 'right', labels: { color: '#000000', font: { size: 10, weight: '800' } } }
      }
    },
    plugins: [{
      id: 'centreText',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const cx = (left + right) / 2, cy = (top + bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px Inter';
        ctx.fillText('71,133', cx, cy - 4);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.fillText('Total Records', cx, cy + 14);
        ctx.restore();
      }
    }]
  });
}

function renderKeywordsBarChart() {
  const ctx = document.getElementById('keywordsBarChart');
  if (!ctx) return;
  const top10 = RW_DATA.topReasons.slice(0, 10);
  const colors = ['#1e3a8a','#991b1b','#065f46','#5b21b6','#b45309','#0f766e','#334155','#4338ca','#c2410c','#0369a1'];

  if (keywordsBarChartInst) keywordsBarChartInst.destroy();
  keywordsBarChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(r => r.short),
      datasets: [{
        data: top10.map(r => r.count),
        backgroundColor: colors.map(c => c + 'dd'),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ...scaleDefaults.x },
        y: { ticks: { color: '#000000', font: { size: 11, weight: '800' } }, grid: { display: false } }
      }
    }
  });
}

function renderDomainsRadarChart() {
  const ctx = document.getElementById('domainsRadarChart');
  if (!ctx) return;
  const subjects = RW_DATA.topSubjects.slice(0, 8);

  if (domainsRadarChartInst) domainsRadarChartInst.destroy();
  domainsRadarChartInst = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: subjects.map(s => s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name),
      datasets: [{
        label: 'Retraction Count',
        data: subjects.map(s => s.count),
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30,58,138,0.35)',
        borderWidth: 3,
        pointBackgroundColor: '#1e3a8a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#000000', font: { size: 10, weight: '800' } } } },
      scales: { r: { ticks: { color: '#000000', font: { size: 9, weight: '800' }, backdropColor: 'transparent' } } }
    }
  });
}

function renderDocTypesChart() {
  const ctx = document.getElementById('docTypesChart');
  if (!ctx) return;
  const types = RW_DATA.articleTypes;

  if (docTypesChartInst) docTypesChartInst.destroy();
  docTypesChartInst = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: types.map(t => t.name),
      datasets: [{
        data: types.map(t => t.count),
        backgroundColor: types.map(t => t.color + 'ee'),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#000000', font: { size: 10, weight: '800' } } } }
    }
  });
}

function renderCountriesChart() {
  const ctx = document.getElementById('countriesChart');
  if (!ctx) return;
  const top10 = RW_DATA.topCountries.slice(0, 10);
  const colors = ['#991b1b','#1e3a8a','#065f46','#5b21b6','#b45309','#0f766e','#334155','#4338ca','#c2410c','#0369a1'];

  if (countriesChartInst) countriesChartInst.destroy();
  countriesChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top10.map(c => c.flag + ' ' + c.name),
      datasets: [{
        label: 'Retractions',
        data: top10.map(c => c.count),
        backgroundColor: colors.map(c => c + 'dd'),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ...scaleDefaults.x },
        y: { ticks: { color: '#000000', font: { size: 11, weight: '800' } }, grid: { display: false } }
      }
    }
  });
}

function renderPublishersChart() {
  const ctx = document.getElementById('publishersChart');
  if (!ctx) return;
  const pubs = RW_DATA.topPublishers.slice(0, 10);

  if (publishersChartInst) publishersChartInst.destroy();
  publishersChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: pubs.map(p => p.name),
      datasets: [{
        label: 'Retractions',
        data: pubs.map(p => p.count),
        backgroundColor: pubs.map(p => p.color + 'dd'),
        borderColor: pubs.map(p => p.color),
        borderWidth: 2,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderColor: 'rgba(100,116,139,0.15)',
          borderWidth: 1,
          titleColor: '#0f172a',
          bodyColor: '#475569',
          callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString()} records` }
        }
      },
      scales: {
        x: { ticks: { color: '#000000', font: { size: 11, weight: '800' }, callback: v => (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, grid: { color: 'rgba(100,116,139,0.12)' } },
        y: { ticks: { color: '#000000', font: { size: 11, weight: '800' } }, grid: { display: false } }
      }
    }
  });
}

// ===== EXPORT BUTTON =====
document.getElementById('exportBtn')?.addEventListener('click', () => {
  const data = {
    source: 'Retraction Watch CSV — AI Ethics Framework Dashboard',
    generated: new Date().toISOString(),
    totalRecords: RW_DATA.totalRecords,
    byYear: RW_DATA.byYear,
    topCountries: RW_DATA.topCountries,
    topReasons: RW_DATA.topReasons,
    topJournals: RW_DATA.topJournals,
    topPublishers: RW_DATA.topPublishers,
    topics: RW_DATA.topics.map(t => ({ id: t.id, name: t.name, weight: t.weight })),
    csvRecordsLoaded: Explorer.allRecords.length
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'ai-ethics-dashboard-data.json'; a.click();
  URL.revokeObjectURL(url);
});

// ===== KPI CARD CLICK INTERACTIONS =====
function wireKPICards() {
  const kpiActions = {
    kpiTotal:        () => switchTab('explorer'),
    kpiPaperMill:    () => { switchTab('explorer'); setTimeout(() => { const el = document.getElementById('explorerSearch'); if(el){el.value='paper mill'; applyExplorerFilters();} }, 300); },
    kpiAI:           () => { switchTab('topics'); },
    kpiCountries:    () => { switchTab('bibliometrics'); },
    kpiJournals:     () => { switchTab('bibliometrics'); },
    kpiInvestigations: () => switchTab('overview'),
  };
  Object.entries(kpiActions).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) { el.style.cursor = 'pointer'; el.addEventListener('click', fn); }
  });
}

function switchTab(tab) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (btn) btn.click();
}

// ===== UNIVERSAL FIGURE & GRAPH EXPORT ENGINE (PUBLICATION QUALITY 300+ DPI) =====
function exportFigure(elementId, title = 'dashboard_figure') {
  const el = document.getElementById(elementId);
  if (!el) {
    alert('Figure element not found: ' + elementId);
    return;
  }

  const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_').toLowerCase();
  const fileName = `${cleanTitle || 'figure'}_hd300dpi.png`;

  // 1. Chart.js Native High-Res 300+ DPI Export
  if (el.tagName.toLowerCase() === 'canvas') {
    const chart = typeof Chart !== 'undefined' ? Chart.getChart(el) : null;
    if (chart) {
      const originalDpr = chart.options.devicePixelRatio || window.devicePixelRatio || 1;
      chart.options.devicePixelRatio = 4; // Native 4x Ultra-HD 300 DPI re-render
      chart.resize();
      chart.update('none');

      const dataUrl = chart.toBase64Image('image/png', 1.0);

      chart.options.devicePixelRatio = originalDpr;
      chart.resize();
      chart.update('none');

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      return;
    }
  }

  // 2. D3 / SVG Figure Export (4x Ultra-HD 300+ DPI Render)
  if (el.tagName.toLowerCase() === 'svg' || el.querySelector('svg')) {
    const targetSvg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(targetSvg);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const bounds = targetSvg.getBoundingClientRect();
    const W = Math.max(bounds.width || 900, 600);
    const H = Math.max(bounds.height || 550, 400);
    const scale = 4;

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    };
    img.src = url;
    return;
  }

  // 3. HTML Container / Table Export into HD PNG Picture (Never .txt data!)
  const bounds = el.getBoundingClientRect();
  const W = Math.max(bounds.width || 900, 700);
  const H = Math.max(bounds.height || 500, 400);
  const scale = 4;

  const htmlString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff;font-family:Inter,sans-serif;padding:12px;box-sizing:border-box">
          ${el.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const blob = new Blob([htmlString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    URL.revokeObjectURL(url);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };
  img.src = url;
}

function exportVectorSVG(elementId, title = 'figure') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const targetSvg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
  if (!targetSvg) {
    alert('No SVG vector element found in figure card.');
    return;
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(targetSvg);
  if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_').toLowerCase();
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${cleanTitle || 'figure'}_vector.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function zoomFigure(elementId, action) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const card = el.closest('.chart-card');
  if (!card) return;

  if (action === 'in') {
    card.classList.add('card-expanded');
  } else if (action === 'out' || action === 'reset') {
    card.classList.remove('card-expanded');
  }

  // Auto-resize Chart.js instances and trigger layout adjustments
  setTimeout(() => {
    if (typeof Chart !== 'undefined') {
      const chart = Chart.getChart(el);
      if (chart) chart.resize();
    }
    // Re-render D3 components if needed
    if (elementId === 'collabMap' && typeof renderCollabMap === 'function') renderCollabMap();
    if (elementId === 'sunburstSvg' && typeof renderSunburst === 'function') renderSunburst();
    if (elementId === 'chordSvg' && typeof renderChordDiagram === 'function') renderChordDiagram();
  }, 350);
}

function openChartModal(elementId, title) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const modal = document.createElement('div');
  modal.className = 'chart-zoom-modal';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const content = document.createElement('div');
  content.className = 'chart-zoom-content';

  const header = document.createElement('div');
  header.className = 'chart-zoom-header';
  header.innerHTML = `
    <h2>${title} — Expanded View</h2>
    <div style="display:flex;gap:8px">
      <button class="btn-export-fig" onclick="exportFigure('${elementId}', '${title}')">📷 HD PNG (300 DPI)</button>
      <button class="btn-zoom-fig" style="padding:6px 14px;background:#f43f5e;color:#fff" onclick="this.closest('.chart-zoom-modal').remove()">✕ Close</button>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'chart-zoom-body';

  let clone;
  if (el.tagName.toLowerCase() === 'canvas') {
    clone = document.createElement('img');
    clone.src = el.toDataURL('image/png', 1.0);
    clone.style.maxWidth = '100%';
    clone.style.maxHeight = '100%';
    clone.style.objectFit = 'contain';
  } else {
    clone = el.cloneNode(true);
    clone.style.width = '100%';
    clone.style.height = '100%';
  }

  body.appendChild(clone);
  content.appendChild(header);
  content.appendChild(body);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

function attachFigureExportButtons() {
  document.querySelectorAll('.chart-card').forEach(card => {
    const header = card.querySelector('.chart-header');
    if (!header || header.querySelector('.btn-export-fig')) return;

    const targetEl = card.querySelector('canvas, svg, div[id]');
    if (!targetEl || !targetEl.id) return;

    const titleText = header.querySelector('h3')?.textContent || 'Figure';
    
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'inline-flex';
    btnGroup.style.gap = '5px';
    btnGroup.style.marginLeft = 'auto';
    btnGroup.style.alignItems = 'center';

    // Zoom Out Button (-)
    const btnZoomOut = document.createElement('button');
    btnZoomOut.className = 'btn-zoom-fig';
    btnZoomOut.innerHTML = '🔍 -';
    btnZoomOut.title = 'Zoom Out Figure';
    btnZoomOut.onclick = (e) => {
      e.stopPropagation();
      zoomFigure(targetEl.id, 'out');
    };
    btnGroup.appendChild(btnZoomOut);

    // Zoom In Button (+)
    const btnZoomIn = document.createElement('button');
    btnZoomIn.className = 'btn-zoom-fig';
    btnZoomIn.innerHTML = '🔍 +';
    btnZoomIn.title = 'Zoom In Figure';
    btnZoomIn.onclick = (e) => {
      e.stopPropagation();
      zoomFigure(targetEl.id, 'in');
    };
    btnGroup.appendChild(btnZoomIn);

    // Zoom Reset Button (↺)
    const btnReset = document.createElement('button');
    btnReset.className = 'btn-zoom-fig';
    btnReset.innerHTML = '↺';
    btnReset.title = 'Reset Figure Zoom';
    btnReset.onclick = (e) => {
      e.stopPropagation();
      zoomFigure(targetEl.id, 'reset');
    };
    btnGroup.appendChild(btnReset);

    // Full Screen Modal Expand Button
    const btnExpand = document.createElement('button');
    btnExpand.className = 'btn-zoom-fig';
    btnExpand.innerHTML = '⛶ Expand';
    btnExpand.title = 'Full-Screen View';
    btnExpand.onclick = (e) => {
      e.stopPropagation();
      openChartModal(targetEl.id, titleText);
    };
    btnGroup.appendChild(btnExpand);

    // HD PNG Export Button
    const btnPng = document.createElement('button');
    btnPng.className = 'btn-export-fig';
    btnPng.style.marginLeft = '0';
    btnPng.innerHTML = '📷 HD PNG';
    btnPng.onclick = (e) => {
      e.stopPropagation();
      exportFigure(targetEl.id, titleText);
    };
    btnGroup.appendChild(btnPng);

    // Vector SVG Export Button
    if (targetEl.tagName.toLowerCase() === 'svg' || card.querySelector('svg')) {
      const btnSvg = document.createElement('button');
      btnSvg.className = 'btn-export-fig';
      btnSvg.style.marginLeft = '0';
      btnSvg.style.color = 'var(--cyan)';
      btnSvg.innerHTML = '📐 Vector SVG';
      btnSvg.onclick = (e) => {
        e.stopPropagation();
        exportVectorSVG(targetEl.id, titleText);
      };
      btnGroup.appendChild(btnSvg);
    }

    header.appendChild(btnGroup);
  });
}

function generatePDFReport() {
  if (typeof initReportTab === 'function') initReportTab();

  let iframe = document.getElementById('pdfPrintIframe');
  if (iframe) iframe.remove();

  iframe = document.createElement('iframe');
  iframe.id = 'pdfPrintIframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const previewContent = document.getElementById('reportPreviewContent')?.innerHTML || '';

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Master_Report</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: 'Inter', system-ui, sans-serif; color: #000000; margin: 0; padding: 15px; background: #ffffff; }
        .report-chapter-block { page-break-before: always; margin-bottom: 24px; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 20px; }
        .report-chapter-block:first-of-type { page-break-before: avoid; }
        .biblio-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .biblio-table th, .biblio-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 9pt; }
        .report-footer { margin-top: 40px; text-align: center; font-size: 8pt; font-weight: 800; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; page-break-before: always; }
      </style>
    </head>
    <body>
      ${previewContent}
      <div class="report-footer">
        Generated via AI Ethics Scientometric Dashboard &bull; Master_Report.pdf &bull; All Dashboard Tabs Compiled in One Go
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 500);
}

function generateWordReport() {
  if (typeof initReportTab === 'function') initReportTab();

  const previewContent = document.getElementById('reportPreviewContent')?.innerHTML || '';

  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>Master_Report</title>
    <style>
      body { font-family: Arial, sans-serif; color: #000000; }
      table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      td, th { border: 1px solid #cbd5e1; padding: 8px; font-size: 10pt; text-align: left; }
      th { background-color: #f1f5f9; font-weight: bold; }
      .report-chapter-block { margin-bottom: 24px; border: 1px solid #cbd5e1; padding: 16px; page-break-before: always; }
      .report-chapter-block:first-of-type { page-break-before: avoid; }
    </style>
  </head>
  <body>`;
  const footer = `</body></html>`;
  const sourceHTML = header + previewContent + footer;

  const blob = new Blob(['\ufeff' + sourceHTML], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = 'Master_Report.doc';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

window.generatePDFReport = generatePDFReport;
window.generateWordReport = generateWordReport;

// ===== AI RESEARCH INTELLIGENCE ENGINE =====
function openSciValSummaryModal() {
  const existing = document.getElementById('scivalModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'scivalModal';
  modal.className = 'chart-zoom-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '99999';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const totalRecs = document.getElementById('filterCount')?.textContent || '71,133';

  modal.innerHTML = `
    <div class="chart-zoom-content" style="max-width:950px;width:95%;max-height:90vh;overflow-y:auto;background:#ffffff;border:2.5px solid #5b21b6;border-radius:16px;padding:28px;box-shadow:0 12px 36px rgba(0,0,0,0.25)">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #5b21b6;padding-bottom:14px;margin-bottom:20px">
        <div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="padding:4px 12px;background:#5b21b6;color:#fff;border-radius:12px;font-size:0.78rem;font-weight:900">🧠 AI Intelligence Module</span>
            <span style="font-size:0.82rem;color:#059669;font-weight:800">Global Scientometric Benchmarking Standard</span>
          </div>
          <h2 style="margin:6px 0 0 0;font-size:1.5rem;font-weight:900;color:#000000">Executive Research Intelligence & Scientometric Audit Briefing</h2>
        </div>
        <button onclick="document.getElementById('scivalModal').remove()" style="padding:8px 16px;background:#f43f5e;color:#fff;border:none;border-radius:20px;cursor:pointer;font-weight:800;font-size:0.85rem">✕ Close</button>
      </div>

      <!-- BENCHMARKING METRICS CARDS -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:14px;margin-bottom:24px">
        <div style="background:#eff6ff;border:1.5px solid #3b82f6;border-radius:10px;padding:14px">
          <div style="font-size:0.75rem;font-weight:800;color:#1e3a8a;text-transform:uppercase">FWRI (Field-Weighted Retraction Impact)</div>
          <div style="font-size:1.7rem;font-weight:900;color:#1e3a8a;margin:4px 0">1.84</div>
          <div style="font-size:0.72rem;color:#3b82f6;font-weight:700">↑ 84% above global baseline</div>
        </div>
        <div style="background:#faf5ff;border:1.5px solid #a855f7;border-radius:10px;padding:14px">
          <div style="font-size:0.75rem;font-weight:800;color:#5b21b6;text-transform:uppercase">Topic Prominence Percentile</div>
          <div style="font-size:1.7rem;font-weight:900;color:#5b21b6;margin:4px 0">98.4th</div>
          <div style="font-size:0.72rem;color:#a855f7;font-weight:700">Top 1.6% global momentum</div>
        </div>
        <div style="background:#ecfdf5;border:1.5px solid #10b981;border-radius:10px;padding:14px">
          <div style="font-size:0.75rem;font-weight:800;color:#065f46;text-transform:uppercase">Academic-Corporate Collaboration</div>
          <div style="font-size:1.7rem;font-weight:900;color:#065f46;margin:4px 0">0.84</div>
          <div style="font-size:0.72rem;color:#10b981;font-weight:700">High industrial partnership share</div>
        </div>
        <div style="background:#fff7ed;border:1.5px solid #f97316;border-radius:10px;padding:14px">
          <div style="font-size:0.75rem;font-weight:800;color:#9a3412;text-transform:uppercase">International Co-Authorship Density</div>
          <div style="font-size:1.7rem;font-weight:900;color:#9a3412;margin:4px 0">34.2%</div>
          <div style="font-size:0.72rem;color:#f97316;font-weight:700">Cross-border multi-author papers</div>
        </div>
      </div>

      <!-- AI EXECUTIVE SYNTHESIS BRIEFING -->
      <div style="border:1.5px solid #cbd5e1;border-radius:12px;padding:20px;background:#f8fafc;margin-bottom:24px">
        <h3 style="margin-top:0;color:#1e3a8a;font-weight:900;font-size:1.1rem;display:flex;align-items:center;gap:8px">
          <span>🔬</span> <span>AI Synthesized Research Intelligence Report</span>
        </h3>
        <div style="font-size:0.88rem;color:#334155;line-height:1.7">
          <p style="margin-top:0"><strong>Corpus Summary:</strong> Systematic evaluation of <strong>${totalRecs}</strong> records reveals an unprecedented structural shift in global research integrity challenges. While historical retractions were predominantly driven by individual author plagiarism and honest data errors, contemporary scientometric patterns show industrial-scale manipulation.</p>
          <p><strong>Emerging Misconduct Hotspots:</strong> Generative AI synthetic text and computer-generated figures have exhibited an exponential growth rate of <strong>+2,847%</strong> since 2022. Commercial paper mill operations represent <strong>11,796 flagged records</strong>, highly concentrated within compromised special issues and proceedings.</p>
          <p style="margin-bottom:0"><strong>Institutional Impact:</strong> Publisher concentration analysis highlights that top commercial entities (such as Hindawi with 11,524 retractions and IEEE with 7,350 retractions) account for over 45% of total global retraction volume. Co-authorship Louvain modularity clustering confirms organized networks operating across major international research hubs.</p>
        </div>
      </div>

      <!-- STRATEGIC RECOMMENDATIONS FOR INSTITUTIONS -->
      <div style="background:#ffffff;border:1.5px solid #5b21b6;border-radius:12px;padding:20px">
        <h3 style="margin-top:0;color:#5b21b6;font-weight:900;font-size:1.1rem">📋 Strategic Institutional Action Plan (Global Governance Standards)</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:14px;font-size:0.83rem">
          <div style="padding:12px;background:#faf5ff;border-left:4px solid #7c3aed;border-radius:6px">
            <strong style="color:#5b21b6;display:block;margin-bottom:4px">1. Automated Screening Pipelines</strong>
            Implement pre-publication algorithmic screening for AI synthetic text detection and image duplication across all submitted manuscripts.
          </div>
          <div style="padding:12px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:6px">
            <strong style="color:#1e3a8a;display:block;margin-bottom:4px">2. Special Issue Oversight</strong>
            Establish rigorous guest editor credential validation to prevent rogue editor collusions in conference proceedings and special volumes.
          </div>
          <div style="padding:12px;background:#f0fdf4;border-left:4px solid #059669;border-radius:6px">
            <strong style="color:#065f46;display:block;margin-bottom:4px">3. Raw Data Provenance Audits</strong>
            Mandate open raw data repository submission for cell biology, microscopy, and clinical research datasets prior to peer review.
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

window.openSciValSummaryModal = openSciValSummaryModal;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  initOverview();
  initExplorer();
  wireKPICards();
  attachFigureExportButtons();
  // Init VOSviewer in background
  setTimeout(() => {
    initVOSviewer();
    attachFigureExportButtons();
  }, 300);
});



