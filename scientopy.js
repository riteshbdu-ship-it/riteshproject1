// ============================================================
// SciencePy-Style Visualizations
// Bar charts, trend lines, scatter plots, periodic table
// Publication Quality — Solid Black Labelling (#000000)
// ============================================================

let spBarChart = null;
let spTrendChart = null;
let spScatterChart = null;

const SP_PALETTE = [
  '#1e3a8a','#991b1b','#065f46','#5b21b6','#b45309',
  '#0f766e','#334155','#4338ca','#c2410c','#0369a1'
];

function initSciencePy() {
  renderSPBar();
  renderSPTrend();
  renderSPScatter();
  renderPeriodicTable();

  // Controls
  document.getElementById('spParam')?.addEventListener('change', updateSP);
  document.getElementById('spMetric')?.addEventListener('change', updateSP);
  document.getElementById('spTopN')?.addEventListener('change', updateSP);
}

function getSPData() {
  const param = document.getElementById('spParam')?.value || 'keywords';
  const metric = document.getElementById('spMetric')?.value || 'publications';
  const topN = parseInt(document.getElementById('spTopN')?.value || '10');

  let items = [];
  if (param === 'keywords') {
    items = RW_DATA.topReasons.map(r => ({ name: r.short, count: r.count }));
  } else if (param === 'countries') {
    items = RW_DATA.topCountries.map(c => ({ name: c.name, count: c.count }));
  } else if (param === 'journals') {
    items = RW_DATA.topJournals.map(j => ({ name: j.name.substring(0,30) + (j.name.length > 30 ? '…' : ''), count: j.count }));
  } else if (param === 'authors') {
    items = [
      { name: 'Yoshihiro Sato', count: 183 }, { name: 'Hyung-In Moon', count: 98 },
      { name: 'Diederik Stapel', count: 58 }, { name: 'Joachim Boldt', count: 92 },
      { name: 'Peter Chen', count: 130 }, { name: 'Ali Nazari', count: 119 },
      { name: 'Jan Hendrik Schön', count: 21 }, { name: 'Eric Poehlman', count: 17 },
      { name: 'Andrew Wakefield', count: 12 }, { name: 'Hwang Woo-suk', count: 25 }
    ].sort((a, b) => b.count - a.count);
  } else {
    items = RW_DATA.topics.map(t => ({ name: t.name.substring(0,28), count: Math.round(t.weight * 707) }));
  }

  return items.slice(0, topN);
}

function renderSPBar() {
  const ctx = document.getElementById('spBarChart');
  if (!ctx) return;
  const data = getSPData();

  if (spBarChart) spBarChart.destroy();
  spBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Count',
        data: data.map(d => d.count),
        backgroundColor: data.map((_, i) => SP_PALETTE[i % SP_PALETTE.length] + 'cc'),
        borderColor: data.map((_, i) => SP_PALETTE[i % SP_PALETTE.length]),
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x.toLocaleString()} records`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#000000', font: { size: 10.5, weight: '800' } },
          grid: { color: 'rgba(100,116,139,0.12)' }
        },
        y: {
          ticks: { color: '#000000', font: { size: 11, weight: '800' } },
          grid: { color: 'transparent' }
        }
      }
    }
  });

  const param = document.getElementById('spParam')?.value || 'keywords';
  const barTitleEl = document.getElementById('spBarTitle');
  if (barTitleEl) barTitleEl.textContent = `Top ${param.charAt(0).toUpperCase()+param.slice(1)} – Publications`;
}

function renderSPTrend() {
  const ctx = document.getElementById('spTrendChart');
  if (!ctx) return;

  const years = RW_DATA.trendYears;
  const keys = Object.keys(RW_DATA.scientopyKeywords).slice(0, 8);

  if (spTrendChart) spTrendChart.destroy();
  spTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: keys.map((k, i) => ({
        label: k,
        data: RW_DATA.scientopyKeywords[k],
        borderColor: SP_PALETTE[i % SP_PALETTE.length],
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 3.5,
        tension: 0.4,
        pointBackgroundColor: SP_PALETTE[i % SP_PALETTE.length]
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#000000', font: { size: 10, weight: '800' }, boxWidth: 12, padding: 10 }
        }
      },
      scales: {
        x: { ticks: { color: '#000000', font: { size: 10.5, weight: '800' } }, grid: { color: 'rgba(100,116,139,0.12)' } },
        y: {
          ticks: { color: '#000000', font: { size: 10.5, weight: '800' } },
          grid: { color: 'rgba(100,116,139,0.12)' },
          type: 'logarithmic',
          title: { display: true, text: 'Publications (log scale)', color: '#000000', font: { size: 11, weight: '800' } }
        }
      }
    }
  });
}

function renderSPScatter() {
  const ctx = document.getElementById('spScatterChart');
  if (!ctx) return;

  if (spScatterChart) spScatterChart.destroy();

  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  const datasets = RW_DATA.topics.map(t => {
    const dataPoints = years.map((yr, idx) => {
      const w = (t.yearlyWeight && t.yearlyWeight[idx] !== undefined) ? t.yearlyWeight[idx] : t.weight;
      return {
        x: yr,
        y: w,
        r: Math.max(3.5, Math.sqrt(w) * 3.2)
      };
    });

    return {
      label: t.name,
      data: dataPoints,
      backgroundColor: t.color + 'aa',
      borderColor: t.color,
      borderWidth: 1.5,
      hoverRadius: 8
    };
  });

  spScatterChart = new Chart(ctx, {
    type: 'bubble',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#000000', font: { size: 9.5, weight: '800' }, boxWidth: 10, padding: 8 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label} (${ctx.parsed.x}): ${ctx.parsed.y.toFixed(1)}% Topic Weight`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#000000', font: { size: 10.5, weight: '800' }, stepSize: 1, callback: v => Math.round(v) },
          grid: { color: 'rgba(100,116,139,0.12)' },
          title: { display: true, text: 'Publication Year (2015–2024)', color: '#000000', font: { size: 11, weight: '800' } }
        },
        y: {
          ticks: { color: '#000000', font: { size: 10.5, weight: '800' }, callback: v => v + '%' },
          grid: { color: 'rgba(100,116,139,0.12)' },
          title: { display: true, text: 'Longitudinal Topic Weight (%)', color: '#000000', font: { size: 11, weight: '800' } }
        }
      }
    }
  });
}

// ===== PERIODIC TABLE OF AI ETHICS TOPICS =====
function renderPeriodicTable() {
  const container = document.getElementById('periodicTable');
  if (!container) return;

  const elements = [
    { sym: 'Pm', name: 'Paper Mill Operations & Syndicates', count: 11796, color: '#991b1b', num: 1 },
    { sym: 'Fr', name: 'Academic Fraud & Falsification', count: 21202, color: '#c2410c', num: 2 },
    { sym: 'Ai', name: 'Generative AI Synthetic Text & Media', count: 9135, color: '#5b21b6', num: 3 },
    { sym: 'Pl', name: 'Textual Plagiarism & Similarity', count: 2787, color: '#0369a1', num: 4 },
    { sym: 'Dp', name: 'Article Duplication & Self-Plagiarism', count: 3661, color: '#065f46', num: 5 },
    { sym: 'Im', name: 'Image Manipulation & Gel Splicing', count: 5353, color: '#be185d', num: 6 },
    { sym: 'Pr', name: 'Compromised Peer Review Ring', count: 11433, color: '#b45309', num: 7 },
    { sym: 'Da', name: 'Unreliable Data & Raw Code Issues', count: 15731, color: '#4338ca', num: 8 },
    { sym: 'Au', name: 'Authorship Disputes & Ghost Writers', count: 2963, color: '#0f766e', num: 9 },
    { sym: 'Rb', name: 'Reference & Citation Attribution Errors', count: 14849, color: '#e11d48', num: 10 },
    { sym: 'Et', name: 'Ethics Committee & IRB Non-Compliance', count: 2616, color: '#047857', num: 11 },
    { sym: 'Pb', name: 'Publisher Formal Investigation Notice', count: 30845, color: '#6d28d9', num: 12 },
    { sym: 'Co', name: 'Participant Consent & Privacy Issues', count: 900, color: '#0891b2', num: 13 },
    { sym: 'Re', name: 'Rogue Editors & Editorial Misconduct', count: 3116, color: '#d97706', num: 14 },
    { sym: 'Cf', name: 'Conflict of Interest Disclosure Failure', count: 2200, color: '#db2777', num: 15 },
    { sym: 'Bc', name: 'Breach of Journal Policy & Guidelines', count: 4798, color: '#059669', num: 16 },
    { sym: 'Up', name: 'Unresponsive & Unreachable Author', count: 3100, color: '#2563eb', num: 17 },
    { sym: 'Dt', name: 'Undated Retraction Record Notice', count: 6946, color: '#7c3aed', num: 18 }
  ];

  const gridHtml = `
    <div class="periodic-grid">
      ${elements.map(el => `
        <div class="pt-cell" style="background:#ffffff;border:2px solid ${el.color}"
             title="${el.name}: ${el.count.toLocaleString()} records">
          <div style="position:absolute;top:4px;left:6px;font-size:0.65rem;font-weight:800;color:#64748b">${el.num}</div>
          <div class="pt-symbol" style="color:${el.color};margin-top:2px">${el.sym}</div>
          <div class="pt-label">${el.name}</div>
          <div class="pt-count" style="margin-top:2px">${(el.count >= 1000 ? (el.count/1000).toFixed(0)+'k' : el.count)}</div>
        </div>
      `).join('')}
    </div>
  `;

  const legendHtml = `
    <div class="pt-legend-key" style="margin-top:8px;padding:10px 14px;background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.04);font-family:Inter,sans-serif;">
      <div style="font-size:0.75rem;font-weight:900;color:#000000;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;border-bottom:1.5px solid #e2e8f0;padding-bottom:5px;display:flex;align-items:center;justify-content:space-between;">
        <span>🔑 Element Abbreviation Key & Record Index</span>
        <span style="font-size:0.68rem;color:#64748b;font-weight:700">Total 18 Ethics Topics</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px 14px;font-size:0.72rem;">
        ${elements.map(el => `
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-weight:900;color:${el.color};background:#ffffff;border:1.5px solid ${el.color};padding:1px 5px;border-radius:4px;min-width:24px;text-align:center;font-size:0.75rem;">${el.sym}</span>
            <span style="font-weight:800;color:#000000;">${el.name}</span>
            <span style="margin-left:auto;font-family:monospace;font-weight:800;color:#1e3a8a;">${el.count.toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = gridHtml + legendHtml;
}

function updateSP() {
  renderSPBar();
}
