// ============================================================
// VOSviewer-Style Interactive Network Visualization
// Publication-Grade HD Scientometric Mapping Engine
// Authentic VOSviewer Item Frame Mapping
// ============================================================

const CLUSTER_METADATA = {
  keyword: {
    louvain: {
      colors: ['#1e3a8a', '#991b1b', '#065f46', '#5b21b6', '#0f766e', '#b45309', '#334155'],
      names: ['Paper Mills & Review', 'Data Fraud', 'Plagiarism & Dupes', 'AI & Policy', 'Authorship', 'Ethics & Consent', 'Publisher Oversight'],
      modularity: '0.71'
    },
    leiden: {
      colors: ['#1d4ed8', '#b91c1c', '#047857', '#6d28d9', '#0d9488', '#d97706', '#475569'],
      names: ['Systemic Misconduct', 'Data Tampering', 'Textual Copying', 'Generative Tech', 'Author Credit', 'Bioethics', 'Editorial Audit'],
      modularity: '0.76'
    }
  },
  coauthor: {
    louvain: {
      colors: ['#1e3a8a', '#991b1b', '#065f46', '#b45309'],
      names: ['East Asia Cluster', 'Western Alliance', 'South Asia & Middle East', 'Eastern Europe'],
      modularity: '0.68'
    },
    leiden: {
      colors: ['#1d4ed8', '#b91c1c', '#047857', '#d97706'],
      names: ['Pacific Rim', 'Euro-American Core', 'Afro-Asian Network', 'Eurasia Hub'],
      modularity: '0.73'
    }
  },
  cocitation: {
    louvain: {
      colors: ['#5b21b6', '#991b1b', '#0f766e', '#065f46'],
      names: ['General Science & Bio', 'Open Access Megajournals', 'Physical & Engineering', 'Biomedical & Clinical'],
      modularity: '0.65'
    },
    leiden: {
      colors: ['#6d28d9', '#b91c1c', '#0d9488', '#047857'],
      names: ['High-Impact Core', 'Publisher Networks', 'Tech & Computing', 'Health Sciences'],
      modularity: '0.70'
    }
  },
  coupling: {
    louvain: {
      colors: ['#0f766e', '#991b1b', '#b45309', '#5b21b6'],
      names: ['AI & CS Research', 'Oncology & Bio-Genetics', 'Clinical Ethics', 'Materials & Engineering'],
      modularity: '0.64'
    },
    leiden: {
      colors: ['#0d9488', '#b91c1c', '#d97706', '#6d28d9'],
      names: ['Algorithmic Intelligence', 'Cellular Biology', 'Healthcare Systems', 'Applied Physics'],
      modularity: '0.69'
    }
  }
};

let vosSimulation = null;
let activeVosNodes = [];
let activeVosLinks = [];
let currentNetworkType = 'keyword';
let currentClusterAlgo = 'louvain';
let currentViewMode = 'overlay';
let currentMinLinks = 2;

function initVOSviewer() {
  bindVosEventListeners();
  renderVOSviewer();
}

function bindVosEventListeners() {
  const netTypeSelect = document.getElementById('vosNetworkType');
  const clusterSelect = document.getElementById('vosCluster');
  const minLinksInput = document.getElementById('minLinks');
  const viewModeSelect = document.getElementById('vosViewMode');
  const resetBtn       = document.getElementById('vosReset');

  if (netTypeSelect && !netTypeSelect.dataset.bound) {
    netTypeSelect.dataset.bound = "true";
    netTypeSelect.addEventListener('change', (e) => {
      currentNetworkType = e.target.value;
      renderVOSviewer();
    });
  }

  if (clusterSelect && !clusterSelect.dataset.bound) {
    clusterSelect.dataset.bound = "true";
    clusterSelect.addEventListener('change', (e) => {
      currentClusterAlgo = e.target.value;
      renderVOSviewer();
    });
  }

  if (minLinksInput && !minLinksInput.dataset.bound) {
    minLinksInput.dataset.bound = "true";
    minLinksInput.addEventListener('input', (e) => {
      currentMinLinks = parseFloat(e.target.value);
      document.getElementById('minLinksVal').textContent = currentMinLinks;
      renderVOSviewer();
    });
  }

  if (viewModeSelect && !viewModeSelect.dataset.bound) {
    viewModeSelect.dataset.bound = "true";
    viewModeSelect.addEventListener('change', (e) => {
      currentViewMode = e.target.value;
      renderVOSviewer();
    });
  }

  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = "true";
    resetBtn.addEventListener('click', () => {
      if (vosSimulation) vosSimulation.alpha(0.5).restart();
      d3.select('#vosNetwork g.vos-root')
        .transition().duration(600)
        .attr('transform', 'translate(0,0) scale(1)');
    });
  }
}

function renderVOSviewer() {
  const svg = d3.select('#vosNetwork');
  const container = document.querySelector('.vos-container');
  if (!container) return;

  const W = container.clientWidth || 900;
  const H = container.clientHeight || 520;

  svg.attr('viewBox', `0 0 ${W} ${H}`);
  svg.selectAll('*').remove();

  // Load raw network data
  const netCollection = RW_DATA.vosNetwork[currentNetworkType] || RW_DATA.vosNetwork.keyword;
  const meta = CLUSTER_METADATA[currentNetworkType]?.[currentClusterAlgo] || CLUSTER_METADATA.keyword.louvain;
  const clusterColors = meta.colors;
  const clusterNames = meta.names;

  // Deep clone nodes and links to prevent D3 force mutation side-effects
  const rawNodes = netCollection.nodes.map(n => ({
    ...n,
    x: n.x * W * 0.75 + W * 0.125,
    y: n.y * H * 0.75 + H * 0.125
  }));

  const linkThreshold = currentMinLinks / 10;
  const rawLinks = netCollection.links
    .filter(l => l.strength >= linkThreshold)
    .map(l => ({
      source: l.source.id !== undefined ? l.source.id : l.source,
      target: l.target.id !== undefined ? l.target.id : l.target,
      strength: l.strength
    }));

  activeVosNodes = rawNodes;
  activeVosLinks = rawLinks;

  // Defs & Gradients
  const defs = svg.append('defs');

  // Solid clean white background for academic publication
  svg.append('rect')
    .attr('width', W)
    .attr('height', H)
    .attr('fill', currentViewMode === 'density' ? '#0f172a' : '#ffffff');

  // Density Blur Filter
  const filter = defs.append('filter').attr('id', 'densityBlur').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
  filter.append('feGaussianBlur').attr('stdDeviation', 24);

  const g = svg.append('g').attr('class', 'vos-root');

  // Zoom & Pan setup
  const zoom = d3.zoom()
    .scaleExtent([0.3, 5])
    .on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoom);

  // Scales
  const weights = rawNodes.map(n => n.weight);
  const minW = d3.min(weights) || 1000;
  const maxW = d3.max(weights) || 30000;
  const radiusScale = d3.scaleSqrt().domain([minW, maxW]).range([10, 32]).clamp(true);

  // Citation impact color scale
  const citations = rawNodes.map(n => n.citation || 50);
  const minC = d3.min(citations) || 30;
  const maxC = d3.max(citations) || 350;
  const citationColorScale = d3.scaleSequential().domain([minC, maxC]).interpolator(d3.interpolateViridis);

  // Helper for node color based on view mode
  const getNodeColor = (d) => {
    if (currentViewMode === 'citation') return citationColorScale(d.citation || 50);
    return clusterColors[d.cluster % clusterColors.length];
  };

  // Force simulation (Structured VOS layout spacing)
  if (vosSimulation) vosSimulation.stop();
  vosSimulation = d3.forceSimulation(rawNodes)
    .force('link', d3.forceLink(rawLinks).id(d => d.id).distance(d => 160 / Math.max(d.strength, 0.1)).strength(d => d.strength * 0.35))
    .force('charge', d3.forceManyBody().strength(-320))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide(d => radiusScale(d.weight) + 24))
    .alphaDecay(0.025);

  // 1. DENSITY HEATMAP LAYER
  let densityGroup = null;
  if (currentViewMode === 'density') {
    densityGroup = g.append('g').attr('class', 'density-layer').attr('filter', 'url(#densityBlur)');
    densityGroup.selectAll('circle')
      .data(rawNodes).join('circle')
        .attr('r', d => radiusScale(d.weight) * 3.4)
        .attr('fill', d => getNodeColor(d))
        .attr('opacity', 0.5);
  }

  // 2. LINKS LAYER
  const opacityScale = d3.scaleLinear().domain([0.1, 1]).range([0.15, 0.5]);
  const linkGroup = g.append('g').attr('class', 'links').selectAll('line')
    .data(rawLinks).join('line')
      .attr('stroke', d => {
        if (currentViewMode === 'density') return 'rgba(255,255,255,0.2)';
        const srcNode = rawNodes.find(n => n.id === (d.source.id ?? d.source));
        return srcNode ? getNodeColor(srcNode) : '#64748b';
      })
      .attr('stroke-opacity', d => currentViewMode === 'density' ? 0.15 : opacityScale(d.strength))
      .attr('stroke-width', d => Math.max(d.strength * 2.5, 1));

  // 3. NODES & ITEM FRAMES LAYER (Authentic VOSviewer Item Badging)
  const nodeGroup = g.append('g').attr('class', 'nodes').selectAll('g')
    .data(rawNodes).join('g')
      .attr('class', 'vos-node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => {
          if (!e.active) vosSimulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => {
          if (!e.active) vosSimulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

  // Main Node Circle
  nodeGroup.append('circle')
    .attr('r', d => radiusScale(d.weight))
    .attr('fill', d => getNodeColor(d))
    .attr('fill-opacity', 0.95)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2);

  // Authentic VOSviewer Label Frames
  nodeGroup.each(function(d) {
    const group = d3.select(this);
    const fontSize = Math.max(10, Math.min(13, radiusScale(d.weight) * 0.42));
    const charW = fontSize * 0.58;
    const textW = d.label.length * charW + 14;
    const textH = fontSize + 8;
    const color = getNodeColor(d);

    // Clean White Label Pill Frame (so network lines pass behind without overlapping text)
    group.append('rect')
      .attr('class', 'label-frame')
      .attr('x', -textW / 2)
      .attr('y', radiusScale(d.weight) + 5)
      .attr('width', textW)
      .attr('height', textH)
      .attr('rx', 4)
      .attr('fill', currentViewMode === 'density' ? '#0f172a' : '#ffffff')
      .attr('stroke', color)
      .attr('stroke-width', 1.5);

    // Solid Pure Black Label Text cleanly aligned inside frame
    group.append('text')
      .text(d.label)
      .attr('x', 0)
      .attr('y', radiusScale(d.weight) + 5 + textH / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', fontSize + 'px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .attr('font-weight', '800')
      .attr('fill', currentViewMode === 'density' ? '#ffffff' : '#000000')
      .attr('pointer-events', 'none');
  });

  // Interactive tooltips & info panel
  const tooltip = document.getElementById('vosTooltip');
  const infoPanel = document.getElementById('vosInfoPanel');

  nodeGroup
    .on('mouseover', (e, d) => {
      if (tooltip) {
        tooltip.style.display = 'block';
        const color = getNodeColor(d);
        tooltip.innerHTML = `
          <div style="font-weight:800;font-size:0.85rem;margin-bottom:4px;color:#0f172a">${d.label}</div>
          <div style="font-size:0.72rem;color:#475569">
            Records / Weight: <strong style="color:${color}">${d.weight.toLocaleString()}</strong><br>
            Citation Velocity: <strong style="color:#0891b2">${d.citation || 50}</strong><br>
            Cluster: <span style="font-weight:700;color:${color}">${clusterNames[d.cluster % clusterNames.length] || 'Cluster ' + d.cluster}</span>
          </div>
        `;
      }

      // Highlight connected nodes & links
      linkGroup.attr('stroke-opacity', l => {
        const sId = l.source.id ?? l.source;
        const tId = l.target.id ?? l.target;
        return (sId === d.id || tId === d.id) ? 0.95 : 0.05;
      });
    })
    .on('mousemove', e => {
      if (tooltip) {
        const r = container.getBoundingClientRect();
        tooltip.style.left = (e.clientX - r.left + 14) + 'px';
        tooltip.style.top = (e.clientY - r.top - 12) + 'px';
      }
    })
    .on('mouseout', () => {
      if (tooltip) tooltip.style.display = 'none';
      linkGroup.attr('stroke-opacity', d => currentViewMode === 'density' ? 0.15 : opacityScale(d.strength));
    })
    .on('click', (e, d) => {
      const conns = rawLinks.filter(l => (l.source.id ?? l.source) === d.id || (l.target.id ?? l.target) === d.id);
      const connNodeIds = [...new Set(conns.flatMap(l => [(l.source.id ?? l.source), (l.target.id ?? l.target)]).filter(id => id !== d.id))];
      const connLabels = connNodeIds.map(id => rawNodes.find(n => n.id === id)?.label).filter(Boolean);
      
      if (infoPanel) {
        const color = getNodeColor(d);
        infoPanel.innerHTML = `
          <h4 style="color:${color};font-size:0.9rem;font-weight:800">${d.label}</h4>
          <p>Retraction Records: <strong style="color:#0f172a">${d.weight.toLocaleString()}</strong></p>
          <p>Citation Impact Score: <strong style="color:#0891b2">${d.citation || 50}</strong></p>
          <p>Community Cluster: <strong>${clusterNames[d.cluster % clusterNames.length] || 'Cluster ' + d.cluster}</strong></p>
          <p style="margin-top:6px;font-weight:700;color:#475569">Connected Entities (${connLabels.length}):</p>
          <p style="color:#1e3a8a;font-size:0.68rem;font-weight:600">${connLabels.join(' · ') || 'None'}</p>
        `;
      }
    });

  // Simulation tick update
  vosSimulation.on('tick', () => {
    linkGroup
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);

    if (densityGroup) {
      densityGroup.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    }
  });

  // Update Legend UI
  const legend = document.getElementById('vosLegend');
  if (legend) {
    if (currentViewMode === 'citation') {
      legend.innerHTML = `
        <div style="font-size:0.7rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Citation Impact</div>
        <div style="height:12px;background:linear-gradient(to right, #440154,#3b528b,#21918c,#5ec962,#fde725);border-radius:6px;margin-bottom:4px"></div>
        <div style="display:flex;justify-space-between;font-size:0.65rem;color:#64748b;font-weight:600">
          <span>Low (30)</span>
          <span style="margin-left:auto">High (350+)</span>
        </div>
      `;
    } else {
      legend.innerHTML = '<div style="font-size:0.7rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Clusters (' + (currentClusterAlgo === 'louvain' ? 'Louvain' : 'Leiden') + ')</div>' +
        clusterNames.map((n, i) => `
          <div class="vos-legend-item">
            <span class="vos-legend-dot" style="background:${clusterColors[i % clusterColors.length]}"></span>
            <span>${n}</span>
          </div>
        `).join('');
    }
  }

  // Update Stats UI
  const nodeCountEl = document.getElementById('vosNodeCount');
  const linkCountEl = document.getElementById('vosLinkCount');
  const clusterCountEl = document.getElementById('vosClusterCount');
  const densityEl = document.getElementById('vosDensity');
  const modularityEl = document.getElementById('vosModularity');

  if (nodeCountEl) nodeCountEl.textContent = rawNodes.length;
  if (linkCountEl) linkCountEl.textContent = rawLinks.length;
  if (clusterCountEl) clusterCountEl.textContent = clusterNames.length;
  if (densityEl) densityEl.textContent = (rawLinks.length / (rawNodes.length * (rawNodes.length - 1) / 2)).toFixed(2);
  if (modularityEl) modularityEl.textContent = meta.modularity;
}

function zoomVosIn() {
  d3.select('#vosNetwork').transition().duration(350).call(d3.zoom().scaleBy, 1.35);
}

function zoomVosOut() {
  d3.select('#vosNetwork').transition().duration(350).call(d3.zoom().scaleBy, 0.75);
}

