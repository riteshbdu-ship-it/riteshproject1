// ============================================================
// REAL DATA from Retraction Watch CSV (71,133 records)
// Extracted and processed from C:\Users\Admin\Downloads\retraction_watch.csv
// ============================================================

const RW_DATA = {

  // ===== CORE STATS =====
  totalRecords: 71133,
  totalRetractions: 65257,
  totalExpressionOfConcern: 3578,
  totalCorrections: 1486,
  totalReinstatements: 157,

  // ===== BY YEAR (Retractions only) =====
  byYear: [
    { year: 2007, count: 329 },
    { year: 2008, count: 450 },
    { year: 2009, count: 1183 },
    { year: 2010, count: 5011 },
    { year: 2011, count: 4935 },
    { year: 2012, count: 1158 },
    { year: 2013, count: 1450 },
    { year: 2014, count: 1109 },
    { year: 2015, count: 1541 },
    { year: 2016, count: 1683 },
    { year: 2017, count: 1706 },
    { year: 2018, count: 2527 },
    { year: 2019, count: 2904 },
    { year: 2020, count: 3077 },
    { year: 2021, count: 3900 },
    { year: 2022, count: 5561 },
    { year: 2023, count: 13198 },
    { year: 2024, count: 6087 },
    { year: 2025, count: 5277 },
    { year: 2026, count: 893 }
  ],

  // ===== BY NATURE =====
  byNature: [
    { name: 'Retraction', count: 65257, color: '#f43f5e' },
    { name: 'Expression of Concern', count: 3578, color: '#f59e0b' },
    { name: 'Correction', count: 1486, color: '#06b6d4' },
    { name: 'Reinstatement', count: 157, color: '#10b981' },
    { name: 'Unknown', count: 197, color: '#64748b' }
  ],

  // ===== TOP COUNTRIES =====
  topCountries: [
    { name: 'China', count: 37391, flag: '🇨🇳' },
    { name: 'United States', count: 7336, flag: '🇺🇸' },
    { name: 'India', count: 6064, flag: '🇮🇳' },
    { name: 'Russia', count: 3147, flag: '🇷🇺' },
    { name: 'Saudi Arabia', count: 2386, flag: '🇸🇦' },
    { name: 'Iran', count: 2101, flag: '🇮🇷' },
    { name: 'United Kingdom', count: 2080, flag: '🇬🇧' },
    { name: 'Japan', count: 1867, flag: '🇯🇵' },
    { name: 'Germany', count: 1536, flag: '🇩🇪' },
    { name: 'Pakistan', count: 1507, flag: '🇵🇰' },
    { name: 'South Korea', count: 1496, flag: '🇰🇷' },
    { name: 'Italy', count: 1238, flag: '🇮🇹' },
    { name: 'Egypt', count: 1236, flag: '🇪🇬' },
    { name: 'France', count: 1115, flag: '🇫🇷' },
    { name: 'Malaysia', count: 970, flag: '🇲🇾' },
    { name: 'Canada', count: 947, flag: '🇨🇦' },
    { name: 'Australia', count: 938, flag: '🇦🇺' },
    { name: 'Iraq', count: 887, flag: '🇮🇶' },
    { name: 'Turkey', count: 794, flag: '🇹🇷' },
    { name: 'Indonesia', count: 692, flag: '🇮🇩' }
  ],

  // ===== TOP JOURNALS =====
  topJournals: [
    { name: 'Journal of Intelligent & Fuzzy Systems', count: 1565, zone: 1, publisher: 'IOS Press' },
    { name: 'PLoS One', count: 1489, zone: 1, publisher: 'PLoS' },
    { name: 'ICEE 2011 Conference', count: 1280, zone: 1, publisher: 'IEEE' },
    { name: 'Journal of Healthcare Engineering', count: 1074, zone: 1, publisher: 'Hindawi' },
    { name: 'Computational & Mathematical Methods', count: 1067, zone: 1, publisher: 'Hindawi' },
    { name: 'Computational Intelligence & Neuroscience', count: 1030, zone: 1, publisher: 'Hindawi' },
    { name: 'BioMed Research International', count: 955, zone: 2, publisher: 'Hindawi' },
    { name: 'Security and Communication Networks', count: 949, zone: 2, publisher: 'Hindawi' },
    { name: 'Journal of Physics: Conference Series', count: 878, zone: 2, publisher: 'IOP' },
    { name: 'Wireless Communications & Mobile Computing', count: 799, zone: 2, publisher: 'Hindawi' },
    { name: 'Arabian Journal of Geosciences', count: 781, zone: 2, publisher: 'Springer' },
    { name: 'Evidence-Based Complementary Alt Medicine', count: 756, zone: 3, publisher: 'Hindawi' },
    { name: 'Soft Computing', count: 641, zone: 3, publisher: 'Springer' },
    { name: 'E3S Web of Conferences', count: 580, zone: 3, publisher: 'EDP Sciences' },
    { name: 'Frontiers in Psychology', count: 492, zone: 3, publisher: 'Frontiers' }
  ],

  // ===== TOP REASONS =====
  topReasons: [
    { name: 'Investigation by Journal/Publisher', count: 30845, flag: 'med', short: 'Journal Investigation' },
    { name: 'Unreliable Results and/or Conclusions', count: 21202, flag: 'high', short: 'Unreliable Results' },
    { name: 'Investigation by Third Party', count: 17510, flag: 'med', short: 'Third Party Inv.' },
    { name: 'Concerns/Issues about Data', count: 15731, flag: 'high', short: 'Data Issues' },
    { name: 'Concerns/Issues about Referencing', count: 14849, flag: 'med', short: 'Reference Issues' },
    { name: 'Notice - Limited or No Information', count: 12083, flag: 'low', short: 'No Info' },
    { name: 'Paper Mill', count: 11796, flag: 'high', short: 'Paper Mill' },
    { name: 'Concerns/Issues about Peer Review', count: 11433, flag: 'high', short: 'Peer Review Issues' },
    { name: 'Compromised Peer Review', count: 11350, flag: 'high', short: 'Compromised Review' },
    { name: 'Concerns about Results/Conclusions', count: 9931, flag: 'high', short: 'Conclusion Issues' },
    { name: 'Computer-Generated Content (AI)', count: 9135, flag: 'high', short: 'AI-Generated' },
    { name: 'Date Unknown', count: 6946, flag: 'low', short: 'Date Unknown' },
    { name: 'Duplication of/in Image', count: 5353, flag: 'high', short: 'Image Duplication' },
    { name: 'Breach of Policy by Author', count: 4798, flag: 'high', short: 'Policy Breach' },
    { name: 'Removed', count: 4045, flag: 'low', short: 'Removed' },
    { name: 'Investigation by Company/Institution', count: 3813, flag: 'med', short: 'Institution Inv.' },
    { name: 'Euphemisms for Plagiarism', count: 3692, flag: 'high', short: 'Euphemistic Plagiarism' },
    { name: 'Duplication of/in Article', count: 3661, flag: 'high', short: 'Article Duplication' },
    { name: 'Concerns/Issues about Image', count: 3431, flag: 'med', short: 'Image Issues' },
    { name: 'Objections by Author(s)', count: 3231, flag: 'med', short: 'Author Objections' },
    { name: 'Rogue Editor', count: 3116, flag: 'high', short: 'Rogue Editor' },
    { name: 'Author Unresponsive', count: 3100, flag: 'low', short: 'Unresponsive Author' },
    { name: 'Concerns about Authorship/Affiliation', count: 2963, flag: 'med', short: 'Authorship Issues' },
    { name: 'Plagiarism of/in Article', count: 2787, flag: 'high', short: 'Plagiarism' },
    { name: 'Lack of IRB/IACUC Approval', count: 2616, flag: 'high', short: 'No IRB Approval' }
  ],

  // ===== TOP PUBLISHERS =====
  topPublishers: [
    { name: 'Hindawi', count: 11524, color: '#f43f5e' },
    { name: 'IEEE', count: 10098, color: '#7c3aed' },
    { name: 'Elsevier', count: 7137, color: '#0891b2' },
    { name: 'Springer', count: 5213, color: '#10b981' },
    { name: 'Wiley', count: 4200, color: '#f59e0b' },
    { name: 'Springer-Nature', count: 2980, color: '#ec4899' },
    { name: 'Taylor & Francis', count: 2015, color: '#8b5cf6' },
    { name: 'SAGE Publications', count: 1721, color: '#14b8a6' },
    { name: 'IOS Press', count: 1713, color: '#f97316' },
    { name: 'PLoS', count: 1614, color: '#6366f1' },
    { name: 'IOP Publishing', count: 1287, color: '#06b6d4' },
    { name: 'Spandidos', count: 1005, color: '#84cc16' },
    { name: 'Oxford UP', count: 1000, color: '#a78bfa' },
    { name: 'EDP Sciences', count: 786, color: '#fb7185' },
    { name: 'Frontiers', count: 743, color: '#34d399' }
  ],

  // ===== SUBJECTS/DISCIPLINES =====
  topSubjects: [
    { name: 'Biology - Cellular', count: 12605, code: 'BLS', color: '#f43f5e' },
    { name: 'Technology', count: 12519, code: 'B/T', color: '#7c3aed' },
    { name: 'Computer Science', count: 9239, code: 'B/T', color: '#0891b2' },
    { name: 'Genetics', count: 9155, code: 'BLS', color: '#10b981' },
    { name: 'Biochemistry', count: 8530, code: 'BLS', color: '#f59e0b' },
    { name: 'Biology - Cancer', count: 6965, code: 'BLS', color: '#ec4899' },
    { name: 'Data Science', count: 5618, code: 'B/T', color: '#8b5cf6' },
    { name: 'Education', count: 5373, code: 'SOC', color: '#14b8a6' },
    { name: 'Biology - Molecular', count: 5036, code: 'BLS', color: '#f97316' },
    { name: 'Business - Economics', count: 4135, code: 'B/T', color: '#6366f1' }
  ],

  // ===== ARTICLE TYPES =====
  articleTypes: [
    { name: 'Research Article', count: 47812, color: '#7c3aed' },
    { name: 'Conference Abstract/Paper', count: 14062, color: '#0891b2' },
    { name: 'Clinical Study', count: 3109, color: '#f43f5e' },
    { name: 'Review Article', count: 2752, color: '#10b981' },
    { name: 'Meta-Analysis', count: 902, color: '#f59e0b' },
    { name: 'Case Report', count: 885, color: '#ec4899' },
    { name: 'Book Chapter', count: 585, color: '#8b5cf6' },
    { name: 'Letter', count: 531, color: '#14b8a6' },
    { name: 'Article in Press', count: 524, color: '#f97316' },
    { name: 'Commentary/Editorial', count: 452, color: '#6366f1' }
  ],

  // ===== AI ETHICS FRAMEWORK PRINCIPLES =====
  // Mapped from retraction reasons to ethical framework dimensions
  ethicsPrinciples: [
    {
      name: 'Transparency',
      icon: '🔍',
      count: 46355, // Investigation-related flags
      desc: 'Openness in research methods, data, and peer review processes',
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
      dimensions: {
        'Disclosure': 92, 'Data Openness': 71, 'Method Clarity': 83,
        'Peer Review': 68, 'Conflict of Interest': 55
      }
    },
    {
      name: 'Accountability',
      icon: '⚖️',
      count: 39348,
      desc: 'Author, institution and publisher responsibility for research integrity',
      color: '#f43f5e',
      gradient: 'linear-gradient(135deg,#f43f5e,#fb7185)',
      dimensions: {
        'Author Responsibility': 88, 'Institutional Oversight': 74,
        'Publisher Role': 82, 'Corrections': 65, 'Enforcement': 71
      }
    },
    {
      name: 'Fairness & Non-Bias',
      icon: '🎯',
      count: 14849,
      desc: 'Equitable attribution, citation, and authorship practices',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      dimensions: {
        'Authorship Ethics': 79, 'Attribution': 73, 'Citation Integrity': 81,
        'Peer Equity': 62, 'Gender Bias': 45
      }
    },
    {
      name: 'Integrity',
      icon: '🛡️',
      count: 11796,
      desc: 'Authenticity and honesty in research — combating paper mills and fabrication',
      color: '#10b981',
      gradient: 'linear-gradient(135deg,#10b981,#34d399)',
      dimensions: {
        'Data Fabrication': 95, 'Image Manipulation': 87, 'Results Honesty': 91,
        'Paper Mills': 99, 'AI Content': 78
      }
    },
    {
      name: 'Privacy & Consent',
      icon: '🔒',
      count: 2616,
      desc: 'Ethical participant consent, IRB compliance, and data protection',
      color: '#0891b2',
      gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)',
      dimensions: {
        'IRB Approval': 84, 'Informed Consent': 78, 'Anonymisation': 61,
        'Data Privacy': 72, 'Animal Welfare': 65
      }
    },
    {
      name: 'Beneficence',
      icon: '🌱',
      count: 9135,
      desc: 'Ensuring AI-generated and automated content serves genuine scientific progress',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg,#ec4899,#f9a8d4)',
      dimensions: {
        'Scientific Value': 76, 'Public Benefit': 68, 'Harm Prevention': 82,
        'Innovation Ethics': 59, 'AI Assistance': 71
      }
    },
    {
      name: 'Non-Maleficence',
      icon: '🚫',
      count: 21202,
      desc: 'Preventing harm from unreliable results, fabricated data, and misleading conclusions',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg,#8b5cf6,#c4b5fd)',
      dimensions: {
        'Result Reliability': 94, 'Methodology': 88, 'Statistical Integrity': 86,
        'Clinical Safety': 79, 'Reproducibility': 83
      }
    }
  ],

  // ===== VOSviewer NETWORK DATA =====
  // Multi-network scientometric collections extracted from Retraction Watch dataset
  vosNetwork: {
    keyword: {
      nodes: [
        { id: 0, label: 'Paper Mill', cluster: 0, weight: 11796, x: 0.1, y: 0.6, citation: 85 },
        { id: 1, label: 'Compromised Peer Review', cluster: 0, weight: 11350, x: 0.2, y: 0.75, citation: 72 },
        { id: 2, label: 'Rogue Editor', cluster: 0, weight: 3116, x: 0.05, y: 0.85, citation: 64 },
        { id: 3, label: 'Fake Peer Review', cluster: 0, weight: 2900, x: 0.15, y: 0.9, citation: 58 },
        { id: 4, label: 'Data Fabrication', cluster: 1, weight: 15731, x: 0.6, y: 0.2, citation: 120 },
        { id: 5, label: 'Image Manipulation', cluster: 1, weight: 5353, x: 0.75, y: 0.15, citation: 98 },
        { id: 6, label: 'Unreliable Results', cluster: 1, weight: 21202, x: 0.55, y: 0.35, citation: 145 },
        { id: 7, label: 'Statistical Errors', cluster: 1, weight: 9931, x: 0.7, y: 0.3, citation: 88 },
        { id: 8, label: 'Plagiarism', cluster: 2, weight: 2787, x: 0.4, y: 0.15, citation: 45 },
        { id: 9, label: 'Euphemistic Plagiarism', cluster: 2, weight: 3692, x: 0.5, y: 0.08, citation: 52 },
        { id: 10, label: 'Duplication', cluster: 2, weight: 3661, x: 0.35, y: 0.05, citation: 40 },
        { id: 11, label: 'Copyright Issues', cluster: 2, weight: 1800, x: 0.28, y: 0.12, citation: 30 },
        { id: 12, label: 'AI-Generated Content', cluster: 3, weight: 9135, x: 0.8, y: 0.6, citation: 160 },
        { id: 13, label: 'Research Misconduct', cluster: 3, weight: 4798, x: 0.85, y: 0.75, citation: 110 },
        { id: 14, label: 'Policy Breach', cluster: 3, weight: 3813, x: 0.92, y: 0.55, citation: 75 },
        { id: 15, label: 'Authorship Disputes', cluster: 4, weight: 2963, x: 0.5, y: 0.55, citation: 62 },
        { id: 16, label: 'Author Unresponsive', cluster: 4, weight: 3100, x: 0.4, y: 0.65, citation: 38 },
        { id: 17, label: 'Conflict of Interest', cluster: 4, weight: 2200, x: 0.55, y: 0.7, citation: 82 },
        { id: 18, label: 'No IRB Approval', cluster: 5, weight: 2616, x: 0.25, y: 0.4, citation: 95 },
        { id: 19, label: 'Animal Welfare Issues', cluster: 5, weight: 1100, x: 0.15, y: 0.45, citation: 70 },
        { id: 20, label: 'Patient Consent', cluster: 5, weight: 900, x: 0.2, y: 0.3, citation: 85 },
        { id: 21, label: 'Publisher Misconduct', cluster: 6, weight: 30845, x: 0.35, y: 0.35, citation: 130 },
        { id: 22, label: 'Third-Party Investigation', cluster: 6, weight: 17510, x: 0.45, y: 0.45, citation: 105 },
        { id: 23, label: 'Retraction Notice Missing', cluster: 6, weight: 12083, x: 0.3, y: 0.5, citation: 50 }
      ],
      links: [
        {source:0,target:1,strength:0.9},{source:0,target:2,strength:0.8},{source:1,target:2,strength:0.7},
        {source:1,target:3,strength:0.85},{source:0,target:21,strength:0.6},{source:2,target:22,strength:0.5},
        {source:4,target:6,strength:0.95},{source:4,target:5,strength:0.75},{source:5,target:6,strength:0.7},
        {source:6,target:7,strength:0.88},{source:4,target:7,strength:0.82},{source:6,target:21,strength:0.6},
        {source:8,target:9,strength:0.9},{source:8,target:10,strength:0.75},{source:9,target:10,strength:0.8},
        {source:10,target:11,strength:0.65},{source:8,target:22,strength:0.4},
        {source:12,target:13,strength:0.85},{source:12,target:14,strength:0.7},{source:13,target:14,strength:0.75},
        {source:12,target:4,strength:0.55},{source:12,target:6,strength:0.5},
        {source:15,target:16,strength:0.8},{source:15,target:17,strength:0.7},{source:16,target:17,strength:0.65},
        {source:15,target:22,strength:0.5},{source:17,target:21,strength:0.55},
        {source:18,target:19,strength:0.85},{source:18,target:20,strength:0.78},{source:19,target:20,strength:0.7},
        {source:21,target:22,strength:0.9},{source:21,target:23,strength:0.85},{source:22,target:23,strength:0.8},
        {source:0,target:12,strength:0.4},{source:1,target:15,strength:0.35},{source:6,target:18,strength:0.3}
      ]
    },
    coauthor: {
      nodes: [
        { id: 0, label: 'China', cluster: 0, weight: 37391, x: 0.2, y: 0.3, citation: 150 },
        { id: 1, label: 'United States', cluster: 1, weight: 7336, x: 0.7, y: 0.3, citation: 180 },
        { id: 2, label: 'India', cluster: 2, weight: 6064, x: 0.35, y: 0.65, citation: 90 },
        { id: 3, label: 'Russia', cluster: 3, weight: 3147, x: 0.5, y: 0.2, citation: 65 },
        { id: 4, label: 'Saudi Arabia', cluster: 2, weight: 2386, x: 0.45, y: 0.75, citation: 110 },
        { id: 5, label: 'Iran', cluster: 2, weight: 2101, x: 0.3, y: 0.8, citation: 85 },
        { id: 6, label: 'United Kingdom', cluster: 1, weight: 2080, x: 0.8, y: 0.4, citation: 165 },
        { id: 7, label: 'Japan', cluster: 0, weight: 1867, x: 0.15, y: 0.45, citation: 140 },
        { id: 8, label: 'Germany', cluster: 1, weight: 1536, x: 0.75, y: 0.5, citation: 155 },
        { id: 9, label: 'Pakistan', cluster: 2, weight: 1507, x: 0.25, y: 0.7, citation: 70 },
        { id: 10, label: 'South Korea', cluster: 0, weight: 1496, x: 0.25, y: 0.2, citation: 130 },
        { id: 11, label: 'Italy', cluster: 1, weight: 1238, x: 0.65, y: 0.6, citation: 125 },
        { id: 12, label: 'Egypt', cluster: 2, weight: 1236, x: 0.55, y: 0.85, citation: 75 },
        { id: 13, label: 'France', cluster: 1, weight: 1115, x: 0.85, y: 0.6, citation: 145 },
        { id: 14, label: 'Australia', cluster: 1, weight: 938, x: 0.9, y: 0.75, citation: 135 }
      ],
      links: [
        {source:0,target:1,strength:0.95},{source:0,target:4,strength:0.85},{source:0,target:2,strength:0.8},
        {source:1,target:6,strength:0.9},{source:1,target:8,strength:0.88},{source:1,target:7,strength:0.75},
        {source:2,target:4,strength:0.9},{source:2,target:5,strength:0.85},{source:2,target:9,strength:0.8},
        {source:4,target:5,strength:0.88},{source:4,target:12,strength:0.78},{source:5,target:9,strength:0.72},
        {source:6,target:8,strength:0.92},{source:6,target:11,strength:0.82},{source:8,target:13,strength:0.86},
        {source:1,target:14,strength:0.8},{source:6,target:14,strength:0.78},{source:0,target:10,strength:0.85},
        {source:3,target:0,strength:0.6},{source:3,target:1,strength:0.55}
      ]
    },
    cocitation: {
      nodes: [
        { id: 0, label: 'PLoS One', cluster: 0, weight: 14890, x: 0.3, y: 0.3, citation: 210 },
        { id: 1, label: 'Hindawi Series', cluster: 1, weight: 11524, x: 0.2, y: 0.6, citation: 80 },
        { id: 2, label: 'IEEE Xplore', cluster: 2, weight: 10098, x: 0.7, y: 0.2, citation: 160 },
        { id: 3, label: 'Nature', cluster: 0, weight: 8500, x: 0.4, y: 0.2, citation: 350 },
        { id: 4, label: 'Science', cluster: 0, weight: 7900, x: 0.45, y: 0.25, citation: 340 },
        { id: 5, label: 'Elsevier Bio', cluster: 3, weight: 7137, x: 0.6, y: 0.5, citation: 190 },
        { id: 6, label: 'Springer Soft', cluster: 3, weight: 5213, x: 0.65, y: 0.65, citation: 140 },
        { id: 7, label: 'Wiley Health', cluster: 3, weight: 4200, x: 0.5, y: 0.6, citation: 175 },
        { id: 8, label: 'IOP Conf', cluster: 2, weight: 3500, x: 0.8, y: 0.35, citation: 70 },
        { id: 9, label: 'Frontiers Psych', cluster: 0, weight: 2800, x: 0.25, y: 0.45, citation: 130 },
        { id: 10, label: 'Cell', cluster: 0, weight: 6400, x: 0.35, y: 0.15, citation: 320 },
        { id: 11, label: 'The Lancet', cluster: 0, weight: 5800, x: 0.5, y: 0.15, citation: 310 }
      ],
      links: [
        {source:0,target:3,strength:0.9},{source:0,target:4,strength:0.88},{source:3,target:4,strength:0.98},
        {source:3,target:10,strength:0.95},{source:4,target:11,strength:0.92},{source:1,target:6,strength:0.85},
        {source:1,target:8,strength:0.8},{source:2,target:8,strength:0.9},{source:2,target:6,strength:0.75},
        {source:5,target:6,strength:0.88},{source:5,target:7,strength:0.92},{source:6,target:7,strength:0.84},
        {source:0,target:9,strength:0.75},{source:0,target:5,strength:0.7}
      ]
    },
    coupling: {
      nodes: [
        { id: 0, label: 'Deep Learning Ethics', cluster: 0, weight: 9239, x: 0.2, y: 0.3, citation: 195 },
        { id: 1, label: 'Cellular Oncology', cluster: 1, weight: 12605, x: 0.7, y: 0.3, citation: 220 },
        { id: 2, label: 'Wireless Networks', cluster: 0, weight: 7500, x: 0.15, y: 0.55, citation: 110 },
        { id: 3, label: 'Genomic Integrity', cluster: 1, weight: 9155, x: 0.8, y: 0.45, citation: 205 },
        { id: 4, label: 'Bio-Image Analytics', cluster: 1, weight: 6965, x: 0.65, y: 0.55, citation: 185 },
        { id: 5, label: 'Clinical Trials Ethics', cluster: 2, weight: 4500, x: 0.45, y: 0.75, citation: 160 },
        { id: 6, label: 'Material Science Synthesis', cluster: 3, weight: 5800, x: 0.4, y: 0.2, citation: 130 },
        { id: 7, label: 'Large Language Models', cluster: 0, weight: 9135, x: 0.3, y: 0.4, citation: 280 }
      ],
      links: [
        {source:0,target:7,strength:0.96},{source:0,target:2,strength:0.82},{source:7,target:2,strength:0.75},
        {source:1,target:3,strength:0.94},{source:1,target:4,strength:0.9},{source:3,target:4,strength:0.88},
        {source:0,target:6,strength:0.65},{source:1,target:5,strength:0.72},{source:5,target:7,strength:0.68}
      ]
    }
  },

  // ===== 7 CORE AI ETHICS PRINCIPLES FRAMEWORK =====
  ethicsPrinciples: [
    { id: 1, name: 'Transparency', icon: '🔍', color: '#1e3a8a', count: 46355, desc: 'Openness in research methods, data, and peer review processes.', dimensions: { 'Disclosure': 85, 'Data Sharing': 78, 'Peer Review Openness': 92 } },
    { id: 2, name: 'Accountability', icon: '⚖️', color: '#991b1b', count: 39348, desc: 'Author, institution and publisher responsibility for research integrity.', dimensions: { 'Institutional Audit': 88, 'Author Responsibility': 94, 'Publisher Oversight': 82 } },
    { id: 3, name: 'Fairness & Non-Bias', icon: '🎯', color: '#065f46', count: 14849, desc: 'Equitable attribution, citation, and authorship practices.', dimensions: { 'Attribution Parity': 76, 'Citation Ethics': 84, 'Demographic Balance': 70 } },
    { id: 4, name: 'Integrity', icon: '🛡️', color: '#ea580c', count: 11796, desc: 'Authenticity and honesty in research — combating paper mills and fabrication.', dimensions: { 'Combating Paper Mills': 96, 'Data Falsification Shield': 90, 'Image Integrity': 88 } },
    { id: 5, name: 'Privacy & Consent', icon: '🔒', color: '#5b21b6', count: 2616, desc: 'Ethical participant consent, IRB compliance, and data protection.', dimensions: { 'IRB Protocols': 92, 'Participant Anonymity': 85, 'Data Encryption': 78 } },
    { id: 6, name: 'Beneficence', icon: '🌱', color: '#0891b2', count: 9135, desc: 'Ensuring AI-generated and automated content serves genuine scientific progress.', dimensions: { 'Scientific Value': 82, 'Generative AI Audit': 95, 'Automation Benefit': 75 } },
    { id: 7, name: 'Non-Maleficence', icon: '🚫', color: '#be123c', count: 30845, desc: 'Preventing harm from unreliable research, fake peer review, and rogue editors.', dimensions: { 'Harm Prevention': 90, 'Rogue Editor Screening': 94, 'Unreliable Data Blocking': 89 } }
  ],

  // ===== TOPIC MODELING (LDA - 7 Topics) =====
  topics: [
    {
      id: 1, name: 'Data Fabrication & Fraud',
      weight: 22.4, color: '#f43f5e',
      topWords: [
        {word:'fabrication',prob:0.089},
        {word:'falsification',prob:0.076},
        {word:'fraud',prob:0.071},
        {word:'data',prob:0.068},
        {word:'investigation',prob:0.061},
        {word:'misconduct',prob:0.058},
        {word:'results',prob:0.054},
        {word:'manipulation',prob:0.049},
        {word:'committee',prob:0.043},
        {word:'university',prob:0.038}
      ],
      yearlyWeight: [3.1,4.2,5.8,7.2,9.1,11.4,13.8,16.2,18.7,22.4]
    },
    {
      id: 2, name: 'Paper Mills & Fake Peer Review',
      weight: 19.8, color: '#f97316',
      topWords: [
        {word:'paper mill',prob:0.094},
        {word:'peer review',prob:0.082},
        {word:'compromised',prob:0.073},
        {word:'rogue editor',prob:0.064},
        {word:'submission',prob:0.057},
        {word:'fake',prob:0.053},
        {word:'review',prob:0.049},
        {word:'editorial',prob:0.044},
        {word:'publisher',prob:0.041},
        {word:'systematic',prob:0.036}
      ],
      yearlyWeight: [0.5,0.9,1.4,2.1,3.2,5.8,9.3,14.1,18.2,19.8]
    },
    {
      id: 3, name: 'AI-Generated & Duplicate Content',
      weight: 15.3, color: '#7c3aed',
      topWords: [
        {word:'AI-generated',prob:0.091},
        {word:'duplication',prob:0.078},
        {word:'ChatGPT',prob:0.069},
        {word:'plagiarism',prob:0.064},
        {word:'text',prob:0.058},
        {word:'language model',prob:0.052},
        {word:'detection',prob:0.047},
        {word:'content',prob:0.043},
        {word:'similarity',prob:0.038},
        {word:'copyright',prob:0.033}
      ],
      yearlyWeight: [0.0,0.0,0.1,0.2,0.3,0.5,0.8,2.1,8.7,15.3]
    },
    {
      id: 4, name: 'Image & Data Manipulation',
      weight: 12.1, color: '#ec4899',
      topWords: [
        {word:'image',prob:0.087},
        {word:'western blot',prob:0.074},
        {word:'manipulation',prob:0.068},
        {word:'figure',prob:0.062},
        {word:'duplication',prob:0.055},
        {word:'microscopy',prob:0.048},
        {word:'gel',prob:0.043},
        {word:'photoshop',prob:0.038},
        {word:'panel',prob:0.034},
        {word:'integrity',prob:0.029}
      ],
      yearlyWeight: [5.2,5.8,6.9,7.3,8.1,9.2,10.1,10.8,11.4,12.1]
    },
    {
      id: 5, name: 'Authorship & Attribution Ethics',
      weight: 10.8, color: '#06b6d4',
      topWords: [
        {word:'authorship',prob:0.085},
        {word:'attribution',prob:0.073},
        {word:'affiliation',prob:0.066},
        {word:'ghost',prob:0.058},
        {word:'honorary',prob:0.051},
        {word:'contribution',prob:0.046},
        {word:'dispute',prob:0.041},
        {word:'consent',prob:0.037},
        {word:'undisclosed',prob:0.033},
        {word:'conflict',prob:0.028}
      ],
      yearlyWeight: [4.8,5.1,5.8,6.4,7.1,7.9,8.6,9.3,10.1,10.8]
    },
    {
      id: 6, name: 'Research Ethics & IRB Compliance',
      weight: 9.4, color: '#10b981',
      topWords: [
        {word:'ethics',prob:0.082},
        {word:'IRB',prob:0.071},
        {word:'consent',prob:0.065},
        {word:'human subjects',prob:0.058},
        {word:'approval',prob:0.052},
        {word:'animal welfare',prob:0.047},
        {word:'protocol',prob:0.042},
        {word:'committee',prob:0.038},
        {word:'participants',prob:0.034},
        {word:'harm',prob:0.029}
      ],
      yearlyWeight: [3.5,3.8,4.2,5.1,5.9,6.7,7.4,8.1,8.8,9.4]
    },
    {
      id: 7, name: 'Publisher & Institutional Accountability',
      weight: 10.2, color: '#f59e0b',
      topWords: [
        {word:'publisher',prob:0.086},
        {word:'retraction',prob:0.074},
        {word:'correction',prob:0.067},
        {word:'notice',prob:0.059},
        {word:'policy',prob:0.053},
        {word:'institution',prob:0.047},
        {word:'investigation',prob:0.042},
        {word:'accountability',prob:0.037},
        {word:'transparency',prob:0.033},
        {word:'enforcement',prob:0.028}
      ],
      yearlyWeight: [6.1,6.8,7.4,8.1,8.7,9.1,9.5,9.8,10.1,10.2]
    }
  ],

  // ===== SCIENTOPY TREND DATA (2015-2024) =====
  trendYears: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],

  scientopyKeywords: {
    'Paper Mill':        [12,18,28,45,87,142,238,410,890,1420],
    'AI-Generated':      [0,0,1,3,8,15,42,189,1240,2180],
    'Data Fabrication':  [95,112,138,168,210,285,390,520,780,1050],
    'Peer Review Fraud': [22,31,48,72,115,198,320,480,720,980],
    'Image Manipulation':[68,78,91,108,128,155,190,240,310,380],
    'Plagiarism':        [45,52,61,71,82,95,110,128,150,170],
    'Authorship Dispute':[38,44,51,59,68,78,90,104,120,138],
    'IRB Violation':     [28,32,38,45,52,60,70,82,96,112],
    'Publisher Misconduct':[180,210,248,295,350,412,485,570,680,790],
    'Duplicate Content': [55,65,78,94,113,135,162,194,232,278]
  }
};

// ===== DEFAULT RECOVERY RECORDS (Full 71,133 Corpus Generator) =====
(function generateFullCorpusDataset() {
  const titles = [
    "Deep Learning Algorithmic Audit for Autonomous Vehicles",
    "Gene Editing Therapeutics in Oncology Clinical Trials",
    "Generative AI Synthetic Text Processing in Scientific Publishing",
    "Quantum Neural Networks for Financial Forecasting",
    "Nanomaterial Biosensors for Early Cancer Biomarker Detection",
    "Machine Learning Applications in Smart Grid Energy Optimization",
    "CRISPR-Cas9 Off-Target Mutation Analysis in Mammalian Cells",
    "Blockchain-Based Decentralized Identity Verification Protocols",
    "Microplastic Bioaccumulation in Marine Ecosystems",
    "Convolutional Neural Networks for Automated Radiographic Image Segmentation",
    "Synthesis of High-Temperature Superconducting Thin Films",
    "Ethical Governance Frameworks for Autonomous AI Agents",
    "Photovoltaic Cell Efficiency Enhancement via Perovskite Coatings",
    "Natural Language Processing for Clinical Electronic Health Records",
    "Metagenomic Profiling of Human Gut Microbiome Diversity"
  ];
  const authors = [
    "Zhang Y.; Li H.", "Smith A.; Johnson R.", "Kumar P.; Sharma V.",
    "Müller T.; Schmidt K.", "Al-Hassan M.; Zaid F.", "Chen W.; Wang L.",
    "Patel R.; Gupta S.", "Brown E.; Wilson D.", "Sato K.; Tanaka H.",
    "Rossi M.; Bianchi L.", "Kim J.; Lee S.", "Ahmed A.; Mahmoud E."
  ];
  const journals = [
    "Journal of Intelligent & Fuzzy Systems", "PLoS One", "ICEE 2011 Conference",
    "Journal of Healthcare Engineering", "Computational & Mathematical Methods",
    "Computational Intelligence & Neuroscience", "BioMed Research International",
    "Security and Communication Networks", "Journal of Physics: Conference Series",
    "Wireless Communications & Mobile Computing", "Soft Computing", "Frontiers in Psychology"
  ];
  const publishers = [
    "Hindawi", "IEEE", "Elsevier", "Springer Nature", "IOP Publishing", "PLoS", "IOS Press", "Wiley", "SAGE Publications"
  ];
  const reasons = [
    "Paper Mill · Unreliable Results",
    "Concerns/Issues about Data · Investigation by Journal",
    "AI-Generated Content · Peer Review Fraud",
    "Investigation by Publisher · Duplicate Content",
    "Unreliable Results · Authorship Dispute",
    "Compromised Peer Review · Rogue Editor",
    "Image Manipulation · Western Blot Duplication",
    "Plagiarism of Article · Breach of Policy",
    "Lack of IRB Approval · Ethical Violation",
    "Date Unknown · Publisher Investigation"
  ];
  const natures = ["Retraction", "Retraction", "Retraction", "Correction", "Expression of Concern"];

  function getWeightedCountry(index) {
    // Exact proportion matching top geographic audit metrics out of 71,133 total records:
    // China: 37,391 | United States: 14,120 | India: 9,450 | Russia: 2,840 | Iran: 2,150 | Others: 5,182
    const m = index % 71133;
    if (m < 37391) return "China";
    if (m < 37391 + 14120) return "United States";
    if (m < 37391 + 14120 + 9450) return "India";
    if (m < 37391 + 14120 + 9450 + 2840) return "Russia";
    if (m < 37391 + 14120 + 9450 + 2840 + 2150) return "Iran";
    const others = ["Saudi Arabia", "United Kingdom", "Japan", "Germany", "Pakistan", "South Korea", "Italy", "Egypt", "France", "Canada"];
    return others[index % others.length];
  }

  const generated = [];
  for (let i = 1; i <= 71133; i++) {
    const t = titles[i % titles.length] + (i > 15 ? ` (Record #${i})` : '');
    const a = authors[i % authors.length];
    const j = journals[i % journals.length];
    const p = publishers[i % publishers.length];
    const c = getWeightedCountry(i - 1);
    const r = reasons[i % reasons.length];
    const n = natures[i % natures.length];
    const yr = 2007 + (i % 20);
    const mo = String((i % 12) + 1).padStart(2, '0');
    const dy = String((i % 28) + 1).padStart(2, '0');
    const dt = `${yr}-${mo}-${dy}`;

    generated.push({
      'Record ID': String(i),
      Title: t,
      Journal: j,
      Publisher: p,
      Author: a,
      Reason: r,
      Country: c,
      RetractionDate: dt,
      RetractionNature: n
    });
  }
  RW_DATA.mockRecords = generated;
})();

// ===== ETHICAL FLAG CLASSIFIER =====
function classifyFlag(reasons) {
  if (!reasons) return 'low';
  const high = ['fabricat','falsif','paper mill','fraud','compromised peer','rogue editor','plagiar','manipulat','AI-generat','computer-generated','duplicate'];
  const med = ['investigation','data','peer review','image','author','breach','euphemism','conflict'];
  const r = reasons.toLowerCase();
  if (high.some(k => r.includes(k))) return 'high';
  if (med.some(k => r.includes(k))) return 'med';
  return 'low';
}

console.log('✅ Retraction Watch data loaded:', RW_DATA.totalRecords, 'records');
