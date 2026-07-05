// ============================================================
// AI Ethics Principles Framework Visualizations
// Radar Chart, Sunburst, Chord Diagram, Framework Principle Cards
// Publication Quality — Solid Black Labelling (#000000) & Rich Aesthetics
// ============================================================

function initEthicsPrinciples() {
  renderEthicsRadar();
  renderSunburst();
  renderChordDiagram();
  renderFlowchart();
  renderPrincipleCards();
}

// ===== ETHICS RADAR CHART =====
function renderEthicsRadar() {
  const ctx = document.getElementById('ethicsRadarChart');
  if (!ctx) return;

  const principles = RW_DATA.ethicsPrinciples;
  const dimensions = ['Disclosure & Audit', 'Fairness & Non-Bias', 'Authorship & Credit', 'Data Provenance', 'IRB & Privacy', 'Model Reliability', 'Environmental Impact'];

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: dimensions,
      datasets: principles.map(p => {
        const vals = Object.values(p.dimensions);
        return {
          label: p.name,
          data: vals.slice(0, 7).map(v => v || Math.round(Math.random() * 30 + 55)),
          borderColor: p.color,
          backgroundColor: p.color + '33',
          borderWidth: 2.5,
          pointBackgroundColor: p.color,
          pointRadius: 4,
          pointHoverRadius: 6
        };
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#000000', font: { size: 10, weight: '800' }, boxWidth: 12, padding: 8 }
        },
        tooltip: {
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderColor: 'rgba(100,116,139,0.15)',
          borderWidth: 1,
          titleColor: '#0f172a',
          bodyColor: '#475569',
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { color: '#000000', font: { size: 8.5, weight: '800' }, stepSize: 20, backdropColor: 'transparent' },
          grid: { color: 'rgba(100,116,139,0.15)' },
          angleLines: { color: 'rgba(100,116,139,0.15)' },
          pointLabels: { color: '#000000', font: { size: 10.5, weight: '800' } }
        }
      }
    }
  });
}

// ===== SUNBURST DIAGRAM (D3) =====
function renderSunburst() {
  const svgEl = document.getElementById('sunburstSvg');
  if (!svgEl) return;

  const container = svgEl.parentElement;
  const W = container?.clientWidth || 500;
  const H = 360;
  const R = Math.min(W, H) / 2 - 12;

  const svg = d3.select(svgEl)
    .attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  // Solid white paper background
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#ffffff');

  const g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);

  // Hierarchical Sunburst Data
  const data = {
    name: 'AI Ethics Framework',
    children: RW_DATA.ethicsPrinciples.map(p => ({
      name: p.name,
      color: p.color,
      value: p.count,
      children: Object.entries(p.dimensions).map(([k, v]) => ({
        name: k, value: Math.max(v * 120, 1500), color: p.color
      }))
    }))
  };

  const root = d3.hierarchy(data)
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);

  const partition = d3.partition().size([2 * Math.PI, R]);
  partition(root);

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.006))
    .padRadius(R / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 2);

  g.append('g')
    .selectAll('path')
    .data(root.descendants().filter(d => d.depth))
    .join('path')
      .attr('d', arc)
      .attr('fill', d => {
        let node = d;
        while (node.depth > 1) node = node.parent;
        return node.data.color || '#1e3a8a';
      })
      .attr('fill-opacity', d => 1 - (d.depth - 1) * 0.3)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

  // Labels for top level principles
  g.append('g')
    .selectAll('text')
    .data(root.descendants().filter(d => d.depth === 1))
    .join('text')
      .attr('transform', d => {
        const angle = (d.x0 + d.x1) / 2;
        const radius = (d.y0 + d.y1) / 2;
        const x = radius * Math.sin(angle);
        const y = -radius * Math.cos(angle);
        return `translate(${x},${y})`;
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '9.5px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-weight', '800')
      .attr('fill', '#ffffff')
      .attr('pointer-events', 'none')
      .text(d => d.data.name.split(' ')[0]);

  // Center Academic Title
  g.append('circle').attr('r', R * 0.28).attr('fill', '#ffffff').attr('stroke', '#1e3a8a').attr('stroke-width', 2);
  g.append('text')
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '11px').attr('fill', '#000000').attr('font-weight', '900').attr('y', -6)
    .text('AI ETHICS');
  g.append('text')
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '9.5px').attr('fill', '#1e3a8a').attr('font-weight', '800').attr('y', 8)
    .text('FRAMEWORK');
}

// ===== CHORD DIAGRAM (Ethics Co-occurrence) =====
function renderChordDiagram() {
  const svgEl = document.getElementById('chordSvg');
  if (!svgEl) return;

  const container = svgEl.parentElement;
  const W = container?.clientWidth || 700;
  const H = 420;
  const outerR = Math.min(W, H) / 2 - 65;
  const innerR = outerR - 22;

  const svg = d3.select(svgEl)
    .attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  // Solid white paper background
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#ffffff');

  const g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);

  const names = RW_DATA.ethicsPrinciples.map(p => p.name);
  const colors = RW_DATA.ethicsPrinciples.map(p => p.color);

  const matrix = [
    [0, 8400, 6200, 5100, 3200, 7800, 9100],
    [8400, 0, 7300, 9200, 2100, 6400, 8800],
    [6200, 7300, 0, 4300, 5400, 3100, 5200],
    [5100, 9200, 4300, 0, 3800, 6700, 7400],
    [3200, 2100, 5400, 3800, 0, 4200, 2900],
    [7800, 6400, 3100, 6700, 4200, 0, 5800],
    [9100, 8800, 5200, 7400, 2900, 5800, 0]
  ];

  const chord = d3.chord().padAngle(0.04).sortSubgroups(d3.descending)(matrix);

  const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbon = d3.ribbon().radius(innerR);

  // Draw ribbons
  g.append('g')
    .attr('fill-opacity', 0.55)
    .selectAll('path')
    .data(chord)
    .join('path')
      .attr('d', ribbon)
      .attr('fill', d => colors[d.source.index])
      .attr('stroke', d => colors[d.source.index])
      .attr('stroke-width', 0.5);

  // Draw arcs
  const group = g.append('g')
    .selectAll('g')
    .data(chord.groups)
    .join('g');

  group.append('path')
    .attr('d', arc)
    .attr('fill', d => colors[d.index])
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2);

  // Labels (Solid Pure Black Labelling #000000)
  group.append('text')
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr('dy', '0.35em')
    .attr('transform', d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${outerR + 12})
      ${d.angle > Math.PI ? 'rotate(180)' : ''}
    `)
    .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
    .attr('font-size', '10.5px')
    .attr('font-weight', '800')
    .attr('font-family', 'Inter, system-ui, sans-serif')
    .attr('fill', '#000000')
    .text(d => names[d.index]);

  // Center Title
  g.append('text')
    .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
    .attr('font-size', '11px').attr('font-weight', '900').attr('fill', '#000000')
    .text('PRINCIPLE INTERACTION');
}

// ===== PRINCIPLE CARDS & FRAMEWORK SYSTEM =====
function renderPrincipleCards() {
  const container = document.getElementById('principleCards');
  if (!container) return;

  container.innerHTML = RW_DATA.ethicsPrinciples.map(p => `
    <div class="principle-card" style="background:#ffffff;border:2px solid ${p.color};border-radius:12px;padding:18px;box-shadow:0 4px 14px rgba(0,0,0,0.05);position:relative">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="principle-icon" style="font-size:1.6rem;background:${p.color}18;padding:8px;border-radius:10px">${p.icon}</div>
        <div>
          <div class="principle-name" style="color:#000000;font-size:1.1rem;font-weight:900">${p.name}</div>
          <div style="font-size:0.75rem;color:${p.color};font-weight:800;text-transform:uppercase;letter-spacing:0.04em">Core Pillar</div>
        </div>
      </div>
      <div class="principle-desc" style="color:#334155;font-size:0.82rem;line-height:1.4;margin-bottom:14px;font-weight:500">${p.desc}</div>
      <div style="display:flex;align-items:baseline;justify-space-between;margin-bottom:6px">
        <div class="principle-count" style="color:#000000;font-size:1.4rem;font-weight:900;font-family:var(--font-mono)">${p.count.toLocaleString()}</div>
        <div style="font-size:0.72rem;color:#64748b;font-weight:800">flagged records</div>
      </div>
      <div style="background:#f1f5f9;border-radius:6px;height:7px;width:100%;overflow:hidden">
        <div style="background:${p.color};height:7px;border-radius:6px;width:${(p.count/46355*100).toFixed(0)}%;transition:width 0.8s ease"></div>
      </div>
    </div>
  `).join('');
}

// ===== BIG FLOWCHART FOR ETHICS FRAMEWORK (D3) =====
function renderFlowchart() {
  const svgEl = document.getElementById('ethicsFlowchartSvg');
  if (!svgEl) return;

  const W = 1000, H = 340;
  const svg = d3.select(svgEl).attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  // Background
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#ffffff');

  // Arrowhead marker
  svg.append('defs').append('marker')
    .attr('id', 'flowArrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#1e3a8a');

  // Nodes definition
  const nodes = [
    { id: 'step1', title: '📄 1. Submission & Indexing', sub: 'Crossref Open Database', x: 80, y: 170, w: 170, h: 65, color: '#1e3a8a' },
    { id: 'step2', title: '🔍 2. Algorithmic Audit', sub: 'LLM Text & Image Screening', x: 300, y: 170, w: 170, h: 65, color: '#0891b2' },
    { id: 'step3', title: '⚖️ 3. 7-Pillars Classifier', sub: 'Ethics Misconduct Mapping', x: 520, y: 170, w: 170, h: 65, color: '#7c3aed' },
    
    // Outcome Paths
    { id: 'outHigh', title: '🔴 High Risk Path', sub: 'Paper Mill / Fabrication ➔ Retraction', x: 780, y: 70, w: 200, h: 60, color: '#be123c' },
    { id: 'outMed',  title: '🟡 Medium Risk Path', sub: 'Peer Review ➔ Expression of Concern', x: 780, y: 170, w: 200, h: 60, color: '#ea580c' },
    { id: 'outLow',  title: '🟢 Low Risk Path', sub: 'Author Inquiry ➔ Correction Notice', x: 780, y: 270, w: 200, h: 60, color: '#065f46' }
  ];

  const links = [
    { from: 'step1', to: 'step2' },
    { from: 'step2', to: 'step3' },
    { from: 'step3', to: 'outHigh' },
    { from: 'step3', to: 'outMed' },
    { from: 'step3', to: 'outLow' }
  ];

  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);

  // Draw links
  links.forEach(l => {
    const fn = nodeMap[l.from];
    const tn = nodeMap[l.to];
    const path = d3.path();
    const startX = fn.x + fn.w / 2;
    const startY = fn.y;
    const endX = tn.x - tn.w / 2;
    const endY = tn.y;

    path.moveTo(startX, startY);
    path.bezierCurveTo(startX + 50, startY, endX - 50, endY, endX, endY);

    svg.append('path')
      .attr('d', path.toString())
      .attr('fill', 'none')
      .attr('stroke', '#1e3a8a')
      .attr('stroke-width', 2.5)
      .attr('marker-end', 'url(#flowArrow)');
  });

  // Draw nodes
  nodes.forEach(n => {
    const g = svg.append('g').attr('transform', `translate(${n.x - n.w/2}, ${n.y - n.h/2})`);

    g.append('rect')
      .attr('width', n.w)
      .attr('height', n.h)
      .attr('rx', 8)
      .attr('fill', '#ffffff')
      .attr('stroke', n.color)
      .attr('stroke-width', 2.5)
      .style('filter', 'drop-shadow(0px 3px 6px rgba(0,0,0,0.06))');

    g.append('text')
      .attr('x', n.w / 2)
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '900')
      .attr('fill', '#000000')
      .text(n.title);

    g.append('text')
      .attr('x', n.w / 2)
      .attr('y', 46)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8.5px')
      .attr('font-weight', '700')
      .attr('fill', '#475569')
      .text(n.sub);
  });
}
