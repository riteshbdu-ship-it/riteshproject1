// Central data loader. The cron job replaces this public Google Drive file every 24 hours.
const DRIVE_CSV_FILE_ID = '1Va_mrh2Zb2lI68TFXFvgtboOtviLpRkZ';
const DRIVE_CSV_VIEW_URL = `https://drive.google.com/file/d/${DRIVE_CSV_FILE_ID}/view`;

function parseCSV(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(value); value = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(value); value = '';
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
    } else value += ch;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  if (rows.length < 2) throw new Error('The downloaded file contains no CSV records.');

  const headers = rows.shift().map(h => h.trim().replace(/^\uFEFF/, ''));
  return rows.map((values, index) => {
    const raw = {};
    headers.forEach((header, column) => { raw[header] = (values[column] || '').trim(); });
    const date = raw.RetractionDate || raw['Retraction Date'] || raw.Date || '';
    const yearMatch = date.match(/(?:19|20)\d{2}/);
    return {
      ...raw,
      'Record ID': raw['Record ID'] || raw.RecordID || String(index + 1),
      Title: raw.Title || raw['Article Title'] || 'Untitled',
      Journal: raw.Journal || raw.Source || 'Unknown Journal',
      Publisher: raw.Publisher || 'Unknown Publisher',
      Author: raw.Author || raw.Authors || 'Anonymous',
      Country: raw.Country || 'Unknown',
      Reason: raw.Reason || raw['Retraction Reason'] || 'Unspecified',
      RetractionDate: date,
      RetractionNature: raw.RetractionNature || raw['Retraction Nature'] || raw.Type || 'Retraction',
      Year: yearMatch ? yearMatch[0] : (raw.Year || '')
    };
  });
}

function counts(records, field, splitPattern) {
  const result = new Map();
  records.forEach(record => {
    const raw = String(record[field] || '').trim();
    const values = splitPattern ? raw.split(splitPattern) : [raw];
    values.map(v => v.trim()).filter(Boolean).forEach(value => result.set(value, (result.get(value) || 0) + 1));
  });
  return [...result].sort((a, b) => b[1] - a[1]);
}

function updateSharedData(records) {
  const palette = ['#f43f5e','#7c3aed','#0891b2','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316','#6366f1'];
  const nature = counts(records, 'RetractionNature');
  const years = counts(records, 'Year').filter(([year]) => /^\d{4}$/.test(year)).sort((a, b) => Number(a[0]) - Number(b[0]));
  const reasons = counts(records, 'Reason', /;/);
  const subjects = counts(records.map(r => ({...r, Subject: r.Subject || r.Subjects || ''})), 'Subject', /;/);
  const types = counts(records.map(r => ({...r, ArticleType: r.ArticleType || r['Article Type'] || ''})), 'ArticleType', /;/);

  RW_DATA.totalRecords = records.length;
  RW_DATA.totalRetractions = nature.find(([name]) => name.toLowerCase() === 'retraction')?.[1] || 0;
  RW_DATA.totalExpressionOfConcern = nature.find(([name]) => name.toLowerCase().includes('expression'))?.[1] || 0;
  RW_DATA.totalCorrections = nature.find(([name]) => name.toLowerCase().includes('correction'))?.[1] || 0;
  RW_DATA.totalReinstatements = nature.find(([name]) => name.toLowerCase().includes('reinstatement'))?.[1] || 0;
  RW_DATA.byYear = years.map(([year, count]) => ({ year: Number(year), count }));
  RW_DATA.byNature = nature.map(([name, count], i) => ({ name, count, color: palette[i % palette.length] }));
  RW_DATA.topCountries = counts(records, 'Country', /;/).slice(0, 30).map(([name, count]) => ({ name, count, flag: '' }));
  RW_DATA.topJournals = counts(records, 'Journal').slice(0, 30).map(([name, count], i) => ({ name, count, zone: Math.floor(i / 5) + 1, publisher: '' }));
  RW_DATA.topPublishers = counts(records, 'Publisher').slice(0, 30).map(([name, count], i) => ({ name, count, color: palette[i % palette.length] }));
  RW_DATA.topReasons = reasons.slice(0, 40).map(([name, count]) => ({ name, count, short: name.length > 28 ? name.slice(0, 27) + '…' : name, flag: classifyFlag(name) }));
  if (subjects.length) RW_DATA.topSubjects = subjects.slice(0, 20).map(([name, count], i) => ({ name: name.replace(/^\([^)]*\)\s*/, ''), count, code: '', color: palette[i % palette.length] }));
  if (types.length) RW_DATA.articleTypes = types.slice(0, 15).map(([name, count], i) => ({ name, count, color: palette[i % palette.length] }));
  RW_DATA.mockRecords = records;

  // Refresh network weights from the same CSV instead of retaining old hard-coded totals.
  if (RW_DATA.vosNetwork?.keyword) RW_DATA.vosNetwork.keyword.nodes.forEach(node => {
    const match = reasons.find(([name]) => name.toLowerCase().includes(node.label.toLowerCase().replace('ai-generated', 'computer-generated')));
    node.weight = match?.[1] || 0;
  });
  if (RW_DATA.vosNetwork?.coauthor) RW_DATA.vosNetwork.coauthor.nodes = RW_DATA.topCountries.slice(0, 15).map((item, id) => ({ id, label: item.name, weight: item.count, cluster: id % 4, x: (id % 5) / 5 + .1, y: (Math.floor(id / 5)) / 3 + .15, citation: item.count }));
}

async function downloadDriveCSV() {
  const direct = `https://drive.usercontent.google.com/download?id=${DRIVE_CSV_FILE_ID}&export=download&confirm=t&_=${Date.now()}`;
  const endpoints = [
    '/api/drive-csv',
    direct,
    `https://corsproxy.io/?${encodeURIComponent(direct)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`,
    'data/retraction_watch.csv'
  ];
  let lastError;
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (/^\s*<!doctype html/i.test(text) || !text.includes(',')) throw new Error('Drive returned a sharing/confirmation page instead of CSV.');
      return { text, source: url === endpoints[4] ? 'bundled fallback CSV' : 'Google Drive CSV' };
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error('Unable to download CSV.');
}

window.driveDataReady = (async () => {
  try {
    const { text, source } = await downloadDriveCSV();
    const records = parseCSV(text);
    updateSharedData(records);
    window.DRIVE_DATA_STATUS = { ok: true, source, records: records.length, url: DRIVE_CSV_VIEW_URL };
    return records;
  } catch (error) {
    console.error('[Drive CSV] Load failed; using generated fallback data:', error);
    window.DRIVE_DATA_STATUS = { ok: false, source: 'generated fallback', error: error.message, url: DRIVE_CSV_VIEW_URL };
    return RW_DATA.mockRecords || [];
  }
})();

window.syncDriveData = async function syncDriveData() {
  const { text, source } = await downloadDriveCSV();
  const records = parseCSV(text);
  updateSharedData(records);
  if (typeof finishLoad === 'function') finishLoad(records, Object.keys(records[0] || {}), null, null, null);
  window.DRIVE_DATA_STATUS = { ok: true, source, records: records.length, url: DRIVE_CSV_VIEW_URL };
  if (typeof initOverview === 'function') initOverview();
  return records;
};
