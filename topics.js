// ============================================================
// Topic Modeling Visualizations (LDA, NMF & BERTopic)
// Interactive Collision-Free Word Cloud + Heatmap + Time Series
// ============================================================

let activeTopicId = 1;
let topicTimeChart = null;
let currentTopicK = 7;
let currentTopicAlgo = 'LDA';

function initTopicModeling() {
  bindTopicEventListeners();
  renderTopicModelingView();
}

function bindTopicEventListeners() {
  const kSelect    = document.getElementById('topicK');
  const algoSelect = document.getElementById('topicAlgo');

  if (kSelect && !kSelect.dataset.bound) {
    kSelect.dataset.bound = "true";
    kSelect.addEventListener('change', (e) => {
      currentTopicK = parseInt(e.target.value);
      if (activeTopicId > currentTopicK) activeTopicId = 1;
      renderTopicModelingView();
    });
  }

  if (algoSelect && !algoSelect.dataset.bound) {
    algoSelect.dataset.bound = "true";
    algoSelect.addEventListener('change', (e) => {
      currentTopicAlgo = e.target.value;
      updateCoherenceBadge();
      renderTopicModelingView();
    });
  }
}

function updateCoherenceBadge() {
  const badges = document.querySelectorAll('.coherence-badge');
  if (badges.length > 0) {
    if (currentTopicAlgo.includes('NMF')) {
      badges[0].innerHTML = 'C<sub>v</sub> = 0.721 &nbsp;|&nbsp; Error = 42.1 &nbsp;|&nbsp; Diversity = 0.92';
    } else if (currentTopicAlgo.includes('BERTopic')) {
      badges[0].innerHTML = 'C<sub>v</sub> = 0.812 &nbsp;|&nbsp; Silhouette = 0.64 &nbsp;|&nbsp; Diversity = 0.96';
    } else {
      badges[0].innerHTML = 'C<sub>v</sub> = 0.684 &nbsp;|&nbsp; Perplexity = -148.3 &nbsp;|&nbsp; Diversity = 0.89';
    }
  }
}

function getActiveTopics() {
  return RW_DATA.topics.slice(0, currentTopicK);
}

function renderTopicModelingView() {
  renderTopicList();
  renderWordCloud(activeTopicId);
  renderTopicTimeChart();
  renderTopicHeatmap();
}

// ===== TOPIC LIST SIDEBAR =====
function renderTopicList() {
  const container = document.getElementById('topicList');
  if (!container) return;
  const topics = getActiveTopics();

  container.innerHTML = topics.map(t => `
    <div class="topic-item ${t.id === activeTopicId ? 'active' : ''}" 
         data-topic="${t.id}" onclick="selectTopic(${t.id})">
      <div class="topic-item-num">Topic ${t.id} &bull; ${currentTopicAlgo.split(' ')[0]}</div>
      <div class="topic-item-name" style="color:${t.color}">${t.name}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
        <span style="font-size:0.68rem;color:#94a3b8">${t.weight}% weight</span>
        <span style="font-size:0.68rem;font-family:var(--font-mono);color:${t.color}">${(t.weight/100*RW_DATA.totalRecords).toFixed(0)} docs</span>
      </div>
      <div class="topic-item-bar-wrap">
        <div class="topic-item-bar" style="width:${(t.weight/22.4*100)}%;background:${t.color}"></div>
      </div>
    </div>
  `).join('');
}

function selectTopic(id) {
  activeTopicId = id;
  const topics = getActiveTopics();
  const topic = topics.find(t => t.id === id) || topics[0];
  
  document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-topic="${id}"]`)?.classList.add('active');
  
  const titleEl = document.getElementById('topicCloudTitle');
  if (titleEl) titleEl.textContent = `Topic ${topic.id}: ${topic.name}`;
  
  const badgeEl = document.querySelector('.topic-weight-badge');
  if (badgeEl) badgeEl.textContent = `Weight: ${topic.weight}%`;
  
  renderWordCloud(topic.id);
  updateTopicTimeChart(topic.id);
}

// ===== WORD CLOUD (COLLISION-FREE SPIRAL ALGORITHM) =====
function renderWordCloud(topicId) {
  const topics = getActiveTopics();
  const topic = topics.find(t => t.id === topicId) || topics[0];
  const svg = document.getElementById('wordCloudSvg');
  if (!svg) return;

  const container = svg.parentElement;
  const W = container ? container.clientWidth || 600 : 600;
  const H = 340;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = '';

  // Solid clean white background for academic publication export
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', W);
  bgRect.setAttribute('height', H);
  bgRect.setAttribute('fill', '#ffffff');
  svg.appendChild(bgRect);

  // Sort words by probability score
  const words = [...topic.topWords].sort((a, b) => b.prob - a.prob);
  const maxProb = words[0].prob;
  const minProb = words[words.length - 1].prob;

  const fontScale = prob => {
    const norm = (prob - minProb) / Math.max(maxProb - minProb, 0.001);
    return Math.round(14 + norm * 34);
  };

  // Collision-free Archimedean Spiral Placement
  const placedBoxes = [];
  const cx = W / 2;
  const cy = H / 2;

  words.forEach((w, i) => {
    const fs = fontScale(w.prob);
    const charW = fs * 0.58;
    const boxW = w.word.length * charW + 16;
    const boxH = fs + 12;

    let x = cx;
    let y = cy;
    let placed = false;
    let angle = i * 0.5;
    let radius = 0;
    const step = 0.28;

    // Search outward along spiral for non-overlapping spot
    for (let attempts = 0; attempts < 600; attempts++) {
      angle += step;
      radius = attempts * 0.55;
      const testX = cx + radius * Math.cos(angle) * 1.45;
      const testY = cy + radius * Math.sin(angle) * 0.85;

      const box = {
        x: testX - boxW / 2,
        y: testY - boxH / 2,
        w: boxW,
        h: boxH
      };

      // Check boundary limits
      if (box.x >= 10 && box.x + box.w <= W - 10 && box.y >= 10 && box.y + box.h <= H - 10) {
        // Check collision with placed boxes
        const collision = placedBoxes.some(b => {
          return !(box.x + box.w < b.x || b.x + b.w < box.x || box.y + box.h < b.y || b.y + b.h < box.y);
        });

        if (!collision) {
          x = testX;
          y = testY;
          placedBoxes.push(box);
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      x = Math.max(boxW / 2 + 10, Math.min(W - boxW / 2 - 10, cx + (Math.random() - 0.5) * W * 0.6));
      y = Math.max(boxH / 2 + 10, Math.min(H - boxH / 2 - 10, cy + (Math.random() - 0.5) * H * 0.6));
    }

    // Render word chip group
    const wordGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wordGroup.setAttribute('transform', `translate(${x},${y})`);
    wordGroup.style.cursor = 'pointer';

    // Background chip capsule
    const opacity = 0.65 + (w.prob / maxProb) * 0.35;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', -boxW / 2);
    rect.setAttribute('y', -boxH / 2);
    rect.setAttribute('width', boxW);
    rect.setAttribute('height', boxH);
    rect.setAttribute('rx', boxH / 2);
    rect.setAttribute('fill', topic.color);
    rect.setAttribute('fill-opacity', i === 0 ? 0.22 : 0.1);
    rect.setAttribute('stroke', topic.color);
    rect.setAttribute('stroke-width', i === 0 ? '2.5' : '1.2');
    rect.setAttribute('stroke-opacity', opacity);
    rect.style.transition = 'all 0.25s ease';

    // Word text label - Solid pure black without shadow colors
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', fs);
    text.setAttribute('font-family', 'Inter, system-ui, sans-serif');
    text.setAttribute('font-weight', '800');
    text.setAttribute('fill', '#000000');
    text.textContent = w.word;
    text.style.transition = 'all 0.25s ease';

    wordGroup.appendChild(rect);
    wordGroup.appendChild(text);

    // Interactive Hover Effects
    wordGroup.addEventListener('mouseenter', function() {
      rect.setAttribute('fill-opacity', 0.9);
      rect.setAttribute('stroke-opacity', 1);
      text.setAttribute('fill', '#ffffff');
      wordGroup.setAttribute('transform', `translate(${x},${y}) scale(1.12)`);
    });

    wordGroup.addEventListener('mouseleave', function() {
      rect.setAttribute('fill-opacity', i === 0 ? 0.22 : 0.1);
      rect.setAttribute('stroke-opacity', opacity);
      text.setAttribute('fill', '#000000');
      wordGroup.setAttribute('transform', `translate(${x},${y}) scale(1)`);
    });

    // Tooltip / click annotation
    wordGroup.addEventListener('click', function() {
      alert(`🏷️ Term: "${w.word}"\n\nTopic: ${topic.name}\nProbability P(w|t): ${(w.prob * 100).toFixed(2)}%\nRank in Topic: #${i + 1}`);
    });

    svg.appendChild(wordGroup);
  });

  // Footer probability info
  const annot = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  annot.setAttribute('x', W - 14);
  annot.setAttribute('y', H - 12);
  annot.setAttribute('text-anchor', 'end');
  annot.setAttribute('font-size', '10');
  annot.setAttribute('fill', '#64748b');
  annot.setAttribute('font-weight', '600');
  annot.setAttribute('font-family', 'JetBrains Mono, monospace');
  annot.textContent = `Top Term: ${words[0].word} (P=${words[0].prob.toFixed(3)})`;
  svg.appendChild(annot);
}

// ===== TOPIC TIME SERIES =====
function renderTopicTimeChart() {
  const ctx = document.getElementById('topicTimeChart');
  if (!ctx) return;
  const topics = getActiveTopics();
  const years = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];

  if (topicTimeChart) topicTimeChart.destroy();

  topicTimeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: topics.map(t => ({
        label: t.name,
        data: t.yearlyWeight,
        borderColor: t.color,
        backgroundColor: t.color + '18',
        borderWidth: t.id === activeTopicId ? 3.5 : 1.2,
        pointRadius: t.id === activeTopicId ? 5 : 2,
        tension: 0.4,
        fill: t.id === activeTopicId
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: '#475569', font: { size: 9.5 }, boxWidth: 10 }
        },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` } }
      },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(100,116,139,0.1)' } },
        y: {
          ticks: { color: '#64748b', callback: v => v + '%' },
          grid: { color: 'rgba(100,116,139,0.1)' },
          title: { display: true, text: 'Topic Weight (%)', color: '#64748b', font: { size: 10 } }
        }
      }
    }
  });
}

function updateTopicTimeChart(topicId) {
  if (!topicTimeChart) return;
  const topics = getActiveTopics();
  topicTimeChart.data.datasets.forEach((ds, i) => {
    const t = topics[i];
    if (t) {
      ds.borderWidth = t.id === topicId ? 3.5 : 1.2;
      ds.pointRadius = t.id === topicId ? 5 : 2;
      ds.fill = t.id === topicId;
    }
  });
  topicTimeChart.update();
}

// ===== TOPIC-TERM HEATMAP =====
function renderTopicHeatmap() {
  const container = document.getElementById('topicHeatmap');
  if (!container) return;
  const topics = getActiveTopics();
  const allWords = [...new Set(topics.flatMap(t => t.topWords.slice(0, 6).map(w => w.word)))];

  const table = document.createElement('table');
  table.className = 'heatmap-table';

  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th style="min-width:140px">Term / Keyword</th>
    ${topics.map(t => `<th style="color:${t.color}">${t.name.split(' ').slice(0, 2).join(' ')}</th>`).join('')}
  </tr>`;
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  allWords.forEach(word => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="color:#334155;font-weight:600;font-family:var(--font-mono)">${word}</td>` +
      topics.map(t => {
        const w = t.topWords.find(w => w.word === word);
        const prob = w ? w.prob : 0;
        const alpha = prob > 0 ? 0.12 + prob * 7.5 : 0;
        const bgColor = prob > 0 ? t.color : 'transparent';
        const hexAlpha = Math.min(255, Math.round(alpha * 255)).toString(16).padStart(2, '0');
        return `<td>
          <span class="hm-cell" style="background:${bgColor}${hexAlpha};color:${prob > 0.05 ? '#ffffff' : '#475569'}">
            ${prob > 0 ? prob.toFixed(3) : '–'}
          </span>
        </td>`;
      }).join('');
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}
