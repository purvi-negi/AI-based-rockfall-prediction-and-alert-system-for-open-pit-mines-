import axios from 'axios';

// Centralized Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK === 'true';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rockfall_token') || sessionStorage.getItem('rockfall_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const reqUrl = error.config?.url || '';
      const isAuthRoute = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');
      // Only auto-logout and redirect for non-auth endpoints so login/register forms can display error responses
      if (!isAuthRoute) {
        localStorage.removeItem('rockfall_token');
        localStorage.removeItem('rockfall_user');
        sessionStorage.removeItem('rockfall_token');
        sessionStorage.removeItem('rockfall_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/* =====================================================================
   CLEARLY IDENTIFIED MOCK DATA ENGINE (FALLBACK / PROTOTYPE DEMO)
   ===================================================================== */

const SEED_MINES = [
  {
    id: 'MINE-001',
    name: 'Aravalli Open Cast Pit A',
    location: 'Rajasthan, Sector 4',
    slopeAngle: 48.5,
    status: 'Active',
    operator: 'National Mining Corp',
    benchHeight: '15m',
    totalSensors: 12,
    riskRating: 'High',
  },
  {
    id: 'MINE-002',
    name: 'Singrauli Block 4 Quarry',
    location: 'Madhya Pradesh, Northern Field',
    slopeAngle: 36.2,
    status: 'Active',
    operator: 'Coal Apex Ltd',
    benchHeight: '12m',
    totalSensors: 8,
    riskRating: 'Moderate',
  },
  {
    id: 'MINE-003',
    name: 'Kolar Deep Wall Zone B',
    location: 'Karnataka, East Ridge',
    slopeAngle: 54.0,
    status: 'Active',
    operator: 'Kolar Gold Works',
    benchHeight: '18m',
    totalSensors: 14,
    riskRating: 'Critical',
  },
  {
    id: 'MINE-004',
    name: 'Jharia Coal Pit 12',
    location: 'Jharkhand, Dhanbad',
    slopeAngle: 31.8,
    status: 'Active',
    operator: 'Bharat Coking Coal',
    benchHeight: '10m',
    totalSensors: 6,
    riskRating: 'Low',
  },
  {
    id: 'MINE-005',
    name: 'Bellary Iron Ore Sector 3',
    location: 'Karnataka, Bellary',
    slopeAngle: 42.1,
    status: 'Maintenance',
    operator: 'Deccan Minerals Ltd',
    benchHeight: '14m',
    totalSensors: 9,
    riskRating: 'Moderate',
  },
];

const SEED_SENSORS = [
  {
    id: 'SEN-101',
    name: 'North Face Tiltmeter Alpha',
    type: 'Inclinometer',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    status: 'Active',
    lastCalibration: '2026-09-15',
    readingInterval: '5s',
  },
  {
    id: 'SEN-102',
    name: 'Bench 3 Crack Wire Extensometer',
    type: 'Extensometer',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    status: 'Active',
    lastCalibration: '2026-08-20',
    readingInterval: '10s',
  },
  {
    id: 'SEN-103',
    name: 'Toe Piezometer P1',
    type: 'Piezometer',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    status: 'Active',
    lastCalibration: '2026-10-01',
    readingInterval: '15s',
  },
  {
    id: 'SEN-104',
    name: 'Haul Road Seismometer S1',
    type: 'Seismograph',
    mineId: 'MINE-002',
    mineName: 'Singrauli Block 4 Quarry',
    status: 'Active',
    lastCalibration: '2026-07-12',
    readingInterval: '1s',
  },
  {
    id: 'SEN-105',
    name: 'Met Station Rain Gauge RG-01',
    type: 'Rain Gauge',
    mineId: 'MINE-002',
    mineName: 'Singrauli Block 4 Quarry',
    status: 'Active',
    lastCalibration: '2026-09-28',
    readingInterval: '60s',
  },
  {
    id: 'SEN-106',
    name: 'East Ridge Multi-point Inclinometer',
    type: 'Inclinometer',
    mineId: 'MINE-003',
    mineName: 'Kolar Deep Wall Zone B',
    status: 'Active',
    lastCalibration: '2026-10-18',
    readingInterval: '5s',
  },
  {
    id: 'SEN-107',
    name: 'Zone B Fault Crack Meter CM-4',
    type: 'Crack Meter',
    mineId: 'MINE-003',
    mineName: 'Kolar Deep Wall Zone B',
    status: 'Active',
    lastCalibration: '2026-10-22',
    readingInterval: '5s',
  },
  {
    id: 'SEN-108',
    name: 'Sub-level Hydrostatic Piezometer',
    type: 'Piezometer',
    mineId: 'MINE-003',
    mineName: 'Kolar Deep Wall Zone B',
    status: 'Inactive',
    lastCalibration: '2026-04-10',
    readingInterval: '30s',
  },
  {
    id: 'SEN-109',
    name: 'Pit 12 Vibration Monitor',
    type: 'Seismograph',
    mineId: 'MINE-004',
    mineName: 'Jharia Coal Pit 12',
    status: 'Active',
    lastCalibration: '2026-08-05',
    readingInterval: '1s',
  },
  {
    id: 'SEN-110',
    name: 'Quarry 3 Slope Discontinuity Scanner',
    type: 'Inclinometer',
    mineId: 'MINE-005',
    mineName: 'Bellary Iron Ore Sector 3',
    status: 'Maintenance',
    lastCalibration: '2026-05-19',
    readingInterval: '10s',
  },
];

const SEED_PREDICTIONS = [
  {
    id: 'PRED-901',
    mineId: 'MINE-003',
    mineName: 'Kolar Deep Wall Zone B',
    snapshotId: 'SNAP-501',
    predictedClass: 'HAZARD',
    hazardProbability: 88.4,
    safeProbability: 11.6,
    riskLevel: 'CRITICAL',
    alertTriggered: true,
    timestamp: '2026-11-03 14:15:20',
    factors: {
      groundTilt: 4.8,
      discontinuityAngle: 62.4,
      jointSpacing: 0.18,
      poreWaterPressure: 142.5,
      vibrationRMR: 5.8,
      rainfall: 32.4,
    },
  },
  {
    id: 'PRED-902',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    snapshotId: 'SNAP-489',
    predictedClass: 'HAZARD',
    hazardProbability: 74.2,
    safeProbability: 25.8,
    riskLevel: 'HIGH',
    alertTriggered: true,
    timestamp: '2026-11-03 12:40:10',
    factors: {
      groundTilt: 3.9,
      discontinuityAngle: 54.1,
      jointSpacing: 0.28,
      poreWaterPressure: 112.0,
      vibrationRMR: 4.2,
      rainfall: 18.2,
    },
  },
  {
    id: 'PRED-903',
    mineId: 'MINE-002',
    mineName: 'Singrauli Block 4 Quarry',
    snapshotId: 'SNAP-472',
    predictedClass: 'SAFE',
    hazardProbability: 18.1,
    safeProbability: 81.9,
    riskLevel: 'LOW',
    alertTriggered: false,
    timestamp: '2026-11-03 11:05:45',
    factors: {
      groundTilt: 0.6,
      discontinuityAngle: 28.5,
      jointSpacing: 0.95,
      poreWaterPressure: 34.0,
      vibrationRMR: 1.1,
      rainfall: 2.5,
    },
  },
  {
    id: 'PRED-904',
    mineId: 'MINE-004',
    mineName: 'Jharia Coal Pit 12',
    snapshotId: 'SNAP-461',
    predictedClass: 'SAFE',
    hazardProbability: 12.5,
    safeProbability: 87.5,
    riskLevel: 'LOW',
    alertTriggered: false,
    timestamp: '2026-11-03 09:30:00',
    factors: {
      groundTilt: 0.4,
      discontinuityAngle: 22.1,
      jointSpacing: 1.20,
      poreWaterPressure: 21.4,
      vibrationRMR: 0.8,
      rainfall: 0.0,
    },
  },
  {
    id: 'PRED-905',
    mineId: 'MINE-005',
    mineName: 'Bellary Iron Ore Sector 3',
    snapshotId: 'SNAP-455',
    predictedClass: 'SAFE',
    hazardProbability: 41.0,
    safeProbability: 59.0,
    riskLevel: 'MEDIUM',
    alertTriggered: false,
    timestamp: '2026-11-02 22:15:10',
    factors: {
      groundTilt: 2.1,
      discontinuityAngle: 42.0,
      jointSpacing: 0.52,
      poreWaterPressure: 78.5,
      vibrationRMR: 2.7,
      rainfall: 12.0,
    },
  },
  {
    id: 'PRED-906',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    snapshotId: 'SNAP-440',
    predictedClass: 'SAFE',
    hazardProbability: 33.2,
    safeProbability: 66.8,
    riskLevel: 'MEDIUM',
    alertTriggered: false,
    timestamp: '2026-11-02 18:00:22',
    factors: {
      groundTilt: 1.8,
      discontinuityAngle: 39.5,
      jointSpacing: 0.65,
      poreWaterPressure: 64.2,
      vibrationRMR: 2.1,
      rainfall: 8.5,
    },
  },
];

const SEED_ALERTS = [
  {
    id: 'ALT-301',
    mineId: 'MINE-003',
    mineName: 'Kolar Deep Wall Zone B',
    predictionId: 'PRED-901',
    snapshotId: 'SNAP-501',
    riskLevel: 'CRITICAL',
    hazardProbability: 88.4,
    status: 'Pending',
    createdAt: '2026-11-03 14:15:20',
    notes: 'Ground displacement slope deformation velocity exceeded 4.5 mm/hr. Immediate zone evacuation recommended.',
  },
  {
    id: 'ALT-302',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    predictionId: 'PRED-902',
    snapshotId: 'SNAP-489',
    riskLevel: 'HIGH',
    hazardProbability: 74.2,
    status: 'Pending',
    createdAt: '2026-11-03 12:40:10',
    notes: 'Pore pressure spike detected near North bench toe following recent rainfall.',
  },
  {
    id: 'ALT-303',
    mineId: 'MINE-001',
    mineName: 'Aravalli Open Cast Pit A',
    predictionId: 'PRED-889',
    snapshotId: 'SNAP-410',
    riskLevel: 'HIGH',
    hazardProbability: 71.0,
    status: 'Acknowledged',
    createdAt: '2026-11-02 15:20:00',
    notes: 'Safety patrol dispatched. Bench 3 haul access barricaded.',
  },
  {
    id: 'ALT-304',
    mineId: 'MINE-005',
    mineName: 'Bellary Iron Ore Sector 3',
    predictionId: 'PRED-850',
    snapshotId: 'SNAP-380',
    riskLevel: 'MEDIUM',
    hazardProbability: 56.5,
    status: 'Resolved',
    createdAt: '2026-11-01 10:10:00',
    notes: 'Drainage sumps cleared. Pore water pressure returned to baseline.',
  },
  {
    id: 'ALT-305',
    mineId: 'MINE-002',
    mineName: 'Singrauli Block 4 Quarry',
    predictionId: 'PRED-820',
    snapshotId: 'SNAP-340',
    riskLevel: 'HIGH',
    hazardProbability: 69.8,
    status: 'Resolved',
    createdAt: '2026-10-31 16:45:00',
    notes: 'Controlled rockfall scaling completed by geotechnical team.',
  },
];

// Helper to access LocalStorage with seed fallback
export function normalizeMine(m) {
  if (!m) return m;
  const name = m.name || m.mineName || '';
  const mineName = m.mineName || m.name || '';
  return {
    ...m,
    id: m.id,
    name,
    mineName,
    location: m.location || '',
    slopeAngle: m.slopeAngle !== undefined && m.slopeAngle !== null ? Number(m.slopeAngle) : null,
    status: m.status || 'Active',
    operator: m.operator || 'National Mining Syndicate',
    benchHeight: m.benchHeight || '15m',
    totalSensors: m.totalSensors ?? 0,
    riskRating: m.riskRating || 'Moderate',
  };
}

export function normalizeSensor(s) {
  if (!s) return s;
  const name = s.sensorName || s.name || '';
  const sensorName = s.sensorName || s.name || '';
  const type = s.sensorType || s.type || 'Inclinometer';
  const sensorType = s.sensorType || s.type || 'Inclinometer';
  const status = s.status || 'Active';
  const mineId = s.mine?.id != null ? s.mine.id : (s.mineId != null ? s.mineId : null);
  const mineName = s.mine?.mineName || s.mine?.name || s.mineName || '';

  return {
    ...s,
    id: s.id,
    name,
    sensorName,
    type,
    sensorType,
    status,
    mineId,
    mineName,
    readingInterval: s.readingInterval || '5s',
    lastCalibration: s.lastCalibration || null,
  };
}

export function normalizeSnapshot(s) {
  if (!s) return s;
  const id = s.id;
  const mineId = s.mineId ?? (s.mine?.id ?? null);
  const groundTilt = Number(s.groundTilt ?? s.ground_tilt ?? 0);
  const discontinuityAngle = Number(s.discontinuityAngle ?? s.discontinuity_angle ?? 0);
  const jointSpacing = Number(s.jointSpacing ?? s.joint_spacing ?? 0);
  const poreWaterPressure = Number(s.poreWaterPressure ?? s.pore_water_pressure ?? 0);
  const vibrationRmr = Number(s.vibrationRmr ?? s.vibration_rmr ?? 0);
  const rainfallMm = Number(s.rainfallMm ?? s.rainfall_mm ?? 0);
  const recordedAt = s.recordedAt ?? s.created_at ?? s.time ?? new Date().toISOString();

  const dt = new Date(recordedAt);
  const time = !isNaN(dt.getTime())
    ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : String(recordedAt);

  let status = 'Safe';
  if (groundTilt > 4.0 || poreWaterPressure > 120.0 || vibrationRmr > 5.0) {
    status = 'Hazard';
  } else if (groundTilt > 3.5 || poreWaterPressure > 100.0 || vibrationRmr > 4.0) {
    status = 'Warning';
  }

  return {
    ...s,
    id,
    mineId,
    groundTilt,
    discontinuityAngle,
    jointSpacing,
    poreWaterPressure,
    vibrationRmr,
    rainfallMm,
    recordedAt,
    time,
    tilt: groundTilt,
    discontinuity: discontinuityAngle,
    spacing: jointSpacing,
    pressure: poreWaterPressure,
    vibration: vibrationRmr,
    rain: rainfallMm,
    status,
  };
}

export function normalizePrediction(p, minesList = []) {
  if (!p) return p;
  const id = p.id != null ? p.id : '';
  const snapshotId = p.snapshotId ?? p.snapshot_id ?? 'N/A';
  const mineId = p.mineId ?? p.mine_id ?? null;

  const groundTilt = Number(p.groundTilt ?? p.ground_tilt ?? 0);
  const discontinuityAngle = Number(p.discontinuityAngle ?? p.discontinuity_angle ?? 0);
  const jointSpacing = Number(p.jointSpacing ?? p.joint_spacing ?? 0);
  const poreWaterPressure = Number(p.poreWaterPressure ?? p.pore_water_pressure ?? 0);
  const vibrationRmr = Number(p.vibrationRmr ?? p.vibration_rmr ?? 0);
  const rainfallMm = Number(p.rainfallMm ?? p.rainfall_mm ?? 0);

  const rawHazard = Number(p.hazardProbability ?? p.hazard_probability ?? 0);
  const hazardProbability = rawHazard <= 1.0 ? +(rawHazard * 100).toFixed(1) : +rawHazard.toFixed(1);
  const rawSafe = Number(p.safeProbability ?? p.safe_probability ?? Math.max(0, 100 - hazardProbability));
  const safeProbability = rawSafe <= 1.0 ? +(rawSafe * 100).toFixed(1) : +rawSafe.toFixed(1);

  // Raw SVM output
  const rawSvmClass = Number(
    p.rawSvmClass ?? p.raw_svm_class ?? p.predictedClass ?? p.predicted_class ?? 0
  );
  const decisionFunction =
    p.decisionFunction != null
      ? Number(p.decisionFunction)
      : p.decision_function != null
      ? Number(p.decision_function)
      : null;

  // Option A: Probability-Aligned Effective Classification
  // - Below 0.30: SAFE
  // - 0.30 to below 0.50: LOW
  // - 0.50 to below 0.80: WARNING
  // - 0.80 or above: CRITICAL
  const effectiveClass =
    p.effectiveClass ||
    p.effective_class ||
    (hazardProbability >= 80 ? 'CRITICAL' : hazardProbability >= 50 ? 'WARNING' : hazardProbability >= 30 ? 'LOW' : 'SAFE');

  const alertTriggered = Boolean(p.triggerAlert ?? p.trigger_alert ?? (hazardProbability >= 50.0));

  const createdAt = p.createdAt ?? p.created_at ?? p.timestamp ?? new Date().toISOString();
  const dt = new Date(createdAt);
  const timestamp = !isNaN(dt.getTime())
    ? dt.toISOString().replace('T', ' ').substring(0, 19)
    : String(createdAt);

  const matchedMine = minesList.find((m) => String(m.id) === String(mineId));
  const mineName = p.mineName || matchedMine?.name || matchedMine?.mineName || (mineId ? `Mine #${mineId}` : 'Selected Mine');

  return {
    ...p,
    id,
    snapshotId,
    mineId,
    mineName,
    predictedClass: effectiveClass, // Primary prediction badge displays effective classification
    effectiveClass,
    rawSvmClass,
    decisionFunction,
    hazardProbability,
    safeProbability,
    riskLevel: effectiveClass,
    alertTriggered,
    timestamp,
    factors: {
      groundTilt,
      discontinuityAngle,
      jointSpacing,
      poreWaterPressure,
      vibrationRMR: vibrationRmr,
      rainfall: rainfallMm,
    },
  };
}

export function normalizeAlert(a, minesList = []) {
  if (!a) return a;
  const id = a.id != null ? a.id : '';
  const mineId = a.mineId ?? a.mine_id ?? null;
  const predictionId = a.predictionId ?? a.prediction_id ?? 'N/A';
  const snapshotId = a.snapshotId ?? a.snapshot_id ?? 'N/A';
  const riskLevel = (a.riskLevel ?? a.risk_level ?? 'WARNING').toUpperCase();

  const rawHazard = Number(a.hazardProbability ?? a.hazard_probability ?? 0);
  const hazardProbability = rawHazard <= 1.0 ? +(rawHazard * 100).toFixed(1) : +rawHazard.toFixed(1);

  const rawStatus = String(a.status || 'PENDING').toUpperCase();
  const status =
    rawStatus === 'ACKNOWLEDGED'
      ? 'Acknowledged'
      : rawStatus === 'RESOLVED'
      ? 'Resolved'
      : 'Pending';

  const message = a.message || a.notes || '';
  const createdAt = a.createdAt ?? a.created_at ?? new Date().toISOString();
  const dt = new Date(createdAt);
  const formattedDate = !isNaN(dt.getTime())
    ? dt.toISOString().replace('T', ' ').substring(0, 19)
    : String(createdAt);

  const matchedMine = minesList.find((m) => String(m.id) === String(mineId));
  const mineName = a.mineName || matchedMine?.name || matchedMine?.mineName || (mineId ? `Mine #${mineId}` : 'Mine Site');

  return {
    ...a,
    id,
    mineId,
    mineName,
    predictionId,
    snapshotId,
    riskLevel,
    hazardProbability,
    status,
    rawStatus,
    notes: message,
    message,
    createdAt: formattedDate,
    acknowledgedAt: a.acknowledgedAt ?? a.acknowledged_at,
    resolvedAt: a.resolvedAt ?? a.resolved_at,
  };
}

export function normalizeDashboardSummary(raw, minesList = []) {
  if (!raw) {
    return {
      stats: {
        totalMines: 0,
        activeMines: 0,
        totalSensors: 0,
        activeSensors: 0,
        totalAlerts: 0,
        pendingAlerts: 0,
        acknowledgedAlerts: 0,
        resolvedAlerts: 0,
      },
      latestPrediction: null,
      recentPredictions: [],
      riskDistribution: [
        { name: 'Critical Risk', count: 0, color: '#D83B3B' },
        { name: 'High Risk', count: 0, color: '#E8A27E' },
        { name: 'Medium Risk', count: 0, color: '#E39A28' },
        { name: 'Low / Safe', count: 0, color: '#27865B' },
      ],
      mines: minesList,
      latestSnapshots: [],
    };
  }

  const mineStats = raw.mine_stats || raw.mineStats || {};
  const sensorStats = raw.sensor_stats || raw.sensorStats || {};
  const alertStats = raw.alert_stats || raw.alertStats || {};

  const totalMines = Number(mineStats.total ?? minesList.length ?? 0);
  const activeMines = Number(mineStats.active ?? minesList.filter((m) => m.status === 'Active').length ?? 0);
  const totalSensors = Number(sensorStats.total ?? 0);
  const activeSensors = Number(sensorStats.active ?? 0);
  const totalAlerts = Number(alertStats.total ?? 0);
  const pendingAlerts = Number(alertStats.pending ?? 0);
  const acknowledgedAlerts = Number(alertStats.acknowledged ?? 0);
  const resolvedAlerts = Number(alertStats.resolved ?? 0);

  const rawLatestPred = raw.latest_prediction || raw.latestPrediction;
  const latestPrediction = rawLatestPred ? normalizePrediction(rawLatestPred, minesList) : null;

  const rawRecentPreds = raw.recent_predictions || raw.recentPredictions || [];
  const recentPredictions = Array.isArray(rawRecentPreds)
    ? rawRecentPreds.map((p) => normalizePrediction(p, minesList))
    : [];

  const rawSnapshots = raw.latest_snapshots || raw.latestSnapshots || [];
  const latestSnapshots = Array.isArray(rawSnapshots)
    ? rawSnapshots.map(normalizeSnapshot)
    : [];

  // Risk distribution computed from recent predictions
  const criticalCount = recentPredictions.filter((p) => p.riskLevel === 'CRITICAL').length;
  const highCount = recentPredictions.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'WARNING').length;
  const mediumCount = recentPredictions.filter((p) => p.riskLevel === 'MEDIUM').length;
  const lowCount = recentPredictions.filter((p) => p.riskLevel === 'LOW' || p.riskLevel === 'SAFE').length;

  const riskDistribution = [
    { name: 'Critical Risk', count: criticalCount, color: '#D83B3B' },
    { name: 'High Risk', count: highCount, color: '#E8A27E' },
    { name: 'Medium Risk', count: mediumCount, color: '#E39A28' },
    { name: 'Low / Safe', count: lowCount, color: '#27865B' },
  ];

  return {
    stats: {
      totalMines,
      activeMines,
      totalSensors,
      activeSensors,
      totalAlerts,
      pendingAlerts,
      acknowledgedAlerts,
      resolvedAlerts,
    },
    latestPrediction,
    recentPredictions,
    riskDistribution,
    mines: minesList,
    latestSnapshots,
  };
}

function getLocalData(key, seedData) {
  try {
    const raw = localStorage.getItem(`rockfall_${key}`);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(`rockfall_${key}`, JSON.stringify(seedData));
    return seedData;
  } catch {
    return seedData;
  }
}

function saveLocalData(key, data) {
  try {
    localStorage.setItem(`rockfall_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// SIMULATE NETWORK DELAY
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

/* =====================================================================
   CENTRALIZED API SERVICES EXPORT
   ===================================================================== */

export const apiService = {
  // --- MINES ---
  async getMines() {
    if (USE_MOCK) {
      await delay();
      return getLocalData('mines', SEED_MINES).map(normalizeMine);
    }
    const res = await apiClient.get('/mines');
    return Array.isArray(res.data) ? res.data.map(normalizeMine) : [];
  },

  async getMineById(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      const found = list.find((m) => String(m.id) === String(id));
      return found ? normalizeMine(found) : null;
    }
    const res = await apiClient.get(`/mines/${id}`);
    return normalizeMine(res.data);
  },

  async createMine(mineData) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      const newMine = {
        ...mineData,
        id: `MINE-${String(list.length + 1).padStart(3, '0')}`,
        totalSensors: 0,
      };
      const updated = [newMine, ...list];
      saveLocalData('mines', updated);
      return normalizeMine(newMine);
    }
    const payload = {
      mineName: mineData.mineName || mineData.name,
      location: mineData.location,
      slopeAngle: mineData.slopeAngle != null ? parseFloat(mineData.slopeAngle) : null,
      status: mineData.status || 'Active',
    };
    const res = await apiClient.post('/mines', payload);
    return normalizeMine(res.data);
  },

  async updateMine(id, mineData) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      const updated = list.map((m) => (String(m.id) === String(id) ? { ...m, ...mineData } : m));
      saveLocalData('mines', updated);
      const found = updated.find((m) => String(m.id) === String(id));
      return found ? normalizeMine(found) : null;
    }
    const payload = {
      mineName: mineData.mineName || mineData.name,
      location: mineData.location,
      slopeAngle: mineData.slopeAngle != null ? parseFloat(mineData.slopeAngle) : null,
      status: mineData.status || 'Active',
    };
    const res = await apiClient.put(`/mines/${id}`, payload);
    return normalizeMine(res.data);
  },

  async deleteMine(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      const updated = list.filter((m) => String(m.id) !== String(id));
      saveLocalData('mines', updated);
      return { success: true, id };
    }
    const res = await apiClient.delete(`/mines/${id}`);
    return res.data || { success: true, id };
  },

  // --- SENSORS ---
  async getSensors(mineId = null) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const filtered = mineId ? list.filter((s) => String(s.mineId) === String(mineId)) : list;
      return filtered.map(normalizeSensor);
    }
    const res = await apiClient.get('/sensors');
    const raw = Array.isArray(res.data) ? res.data.map(normalizeSensor) : [];
    if (mineId) {
      return raw.filter((s) => String(s.mineId) === String(mineId));
    }
    return raw;
  },

  async getSensorById(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const found = list.find((s) => String(s.id) === String(id));
      return found ? normalizeSensor(found) : null;
    }
    const res = await apiClient.get(`/sensors/${id}`);
    return normalizeSensor(res.data);
  },

  async createSensor(sensorData) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const newSensor = {
        ...sensorData,
        id: `SEN-${String(list.length + 101).padStart(3, '0')}`,
      };
      const updated = [newSensor, ...list];
      saveLocalData('sensors', updated);

      const mines = getLocalData('mines', SEED_MINES);
      const updatedMines = mines.map((m) =>
        String(m.id) === String(sensorData.mineId) ? { ...m, totalSensors: (m.totalSensors || 0) + 1 } : m
      );
      saveLocalData('mines', updatedMines);

      return normalizeSensor(newSensor);
    }
    const parsedMineId = Number(sensorData.mineId);
    const payload = {
      sensorName: (sensorData.sensorName || sensorData.name || '').trim(),
      sensorType: sensorData.sensorType || sensorData.type || 'Inclinometer',
      status: sensorData.status || 'Active',
      mineId: isNaN(parsedMineId) ? sensorData.mineId : parsedMineId,
    };
    const res = await apiClient.post('/sensors', payload);
    return normalizeSensor(res.data);
  },

  async updateSensor(id, sensorData) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const updated = list.map((s) => (String(s.id) === String(id) ? { ...s, ...sensorData } : s));
      saveLocalData('sensors', updated);
      const found = updated.find((s) => String(s.id) === String(id));
      return found ? normalizeSensor(found) : null;
    }
    const parsedMineId = Number(sensorData.mineId);
    const payload = {
      sensorName: (sensorData.sensorName || sensorData.name || '').trim(),
      sensorType: sensorData.sensorType || sensorData.type || 'Inclinometer',
      status: sensorData.status || 'Active',
      mineId: isNaN(parsedMineId) ? sensorData.mineId : parsedMineId,
    };
    const res = await apiClient.put(`/sensors/${id}`, payload);
    return normalizeSensor(res.data);
  },

  async deleteSensor(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const target = list.find((s) => String(s.id) === String(id));
      const updated = list.filter((s) => String(s.id) !== String(id));
      saveLocalData('sensors', updated);

      if (target?.mineId) {
        const mines = getLocalData('mines', SEED_MINES);
        const updatedMines = mines.map((m) =>
          String(m.id) === String(target.mineId) ? { ...m, totalSensors: Math.max(0, (m.totalSensors || 1) - 1) } : m
        );
        saveLocalData('mines', updatedMines);
      }
      return { success: true, id };
    }
    const res = await apiClient.delete(`/sensors/${id}`);
    return res.data || { success: true, id };
  },

  // --- LIVE MONITORING & SNAPSHOTS ---
  async getMonitoringSnapshotsByMine(mineId) {
    if (USE_MOCK) {
      await delay();
      return [];
    }
    const res = await apiClient.get(`/monitoring-snapshots/mine/${mineId}`);
    return Array.isArray(res.data) ? res.data.map(normalizeSnapshot) : [];
  },

  async getLatestMonitoringSnapshot(mineId) {
    if (USE_MOCK) {
      await delay();
      return null;
    }
    const res = await apiClient.get(`/monitoring-snapshots/mine/${mineId}/latest`);
    return normalizeSnapshot(res.data);
  },

  async createMonitoringSnapshot(snapshotData) {
    if (USE_MOCK) {
      await delay();
      return normalizeSnapshot(snapshotData);
    }
    const payload = {
      mineId: Number(snapshotData.mineId),
      groundTilt: parseFloat(snapshotData.groundTilt ?? snapshotData.tilt),
      discontinuityAngle: parseFloat(snapshotData.discontinuityAngle ?? snapshotData.discontinuity),
      jointSpacing: parseFloat(snapshotData.jointSpacing ?? snapshotData.spacing),
      poreWaterPressure: parseFloat(snapshotData.poreWaterPressure ?? snapshotData.pressure),
      vibrationRmr: parseFloat(snapshotData.vibrationRmr ?? snapshotData.vibration),
      rainfallMm: parseFloat(snapshotData.rainfallMm ?? snapshotData.rainfall ?? snapshotData.rain),
    };
    const res = await apiClient.post('/monitoring-snapshots', payload);
    return normalizeSnapshot(res.data);
  },

  async predictMonitoringSnapshot(snapshotId) {
    const res = await apiClient.post(`/monitoring-snapshots/${snapshotId}/predict`);
    return normalizePrediction(res.data);
  },

  async getLiveMonitoring(mineId = 'MINE-001') {
    if (USE_MOCK) {
      await delay();
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
      const isCriticalMine = mineId === 'MINE-003';
      const isHighMine = mineId === 'MINE-001';

      const groundTilt = isCriticalMine ? 4.82 : isHighMine ? 3.45 : 0.72;
      const discontinuityAngle = isCriticalMine ? 63.5 : isHighMine ? 52.8 : 26.4;
      const jointSpacing = isCriticalMine ? 0.16 : isHighMine ? 0.32 : 1.15;
      const poreWaterPressure = isCriticalMine ? 144.2 : isHighMine ? 108.5 : 29.8;
      const vibrationRMR = isCriticalMine ? 5.9 : isHighMine ? 4.1 : 1.2;
      const rainfall = isCriticalMine ? 34.0 : isHighMine ? 19.5 : 2.0;

      const historySeries = [];
      for (let i = 11; i >= 0; i--) {
        const past = new Date(now.getTime() - i * 5 * 60 * 1000);
        const timeLabel = past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const jitter = (Math.random() - 0.5) * 0.3;
        historySeries.push({
          time: timeLabel,
          groundTilt: +(groundTilt + jitter * 0.5).toFixed(2),
          vibration: +(vibrationRMR + jitter * 0.8).toFixed(2),
          porePressure: +(poreWaterPressure + jitter * 6).toFixed(1),
          rainfall: +(Math.max(0, rainfall + jitter * 3)).toFixed(1),
        });
      }

      const snapshots = [
        { id: `SNAP-${mineId}-1`, time: '14:45:00', tilt: 4.82, discontinuity: 63.5, spacing: 0.16, pressure: 144.2, vibration: 5.9, rain: 34.0, status: 'Hazard' },
        { id: `SNAP-${mineId}-2`, time: '14:40:00', tilt: 4.75, discontinuity: 63.2, spacing: 0.17, pressure: 141.0, vibration: 5.6, rain: 32.5, status: 'Hazard' },
        { id: `SNAP-${mineId}-3`, time: '14:35:00', tilt: 4.60, discontinuity: 62.8, spacing: 0.18, pressure: 138.4, vibration: 5.2, rain: 29.0, status: 'Hazard' },
        { id: `SNAP-${mineId}-4`, time: '14:30:00', tilt: 4.41, discontinuity: 62.0, spacing: 0.19, pressure: 132.0, vibration: 4.9, rain: 26.0, status: 'Warning' },
        { id: `SNAP-${mineId}-5`, time: '14:25:00', tilt: 4.20, discontinuity: 61.4, spacing: 0.20, pressure: 125.8, vibration: 4.6, rain: 22.0, status: 'Warning' },
        { id: `SNAP-${mineId}-6`, time: '14:20:00', tilt: 3.90, discontinuity: 60.1, spacing: 0.22, pressure: 118.0, vibration: 4.2, rain: 18.0, status: 'Safe' },
      ];

      return {
        mineId,
        timestamp,
        metrics: {
          groundTilt: { value: groundTilt, unit: '°', threshold: 3.5, status: groundTilt > 3.5 ? 'danger' : 'normal' },
          discontinuityAngle: { value: discontinuityAngle, unit: '°', threshold: 50.0, status: discontinuityAngle > 50.0 ? 'danger' : 'normal' },
          jointSpacing: { value: jointSpacing, unit: 'm', threshold: 0.3, status: jointSpacing < 0.3 ? 'danger' : 'normal' },
          poreWaterPressure: { value: poreWaterPressure, unit: 'kPa', threshold: 100.0, status: poreWaterPressure > 100.0 ? 'danger' : 'normal' },
          vibrationRMR: { value: vibrationRMR, unit: 'mm/s', threshold: 4.0, status: vibrationRMR > 4.0 ? 'warning' : 'normal' },
          rainfall: { value: rainfall, unit: 'mm/h', threshold: 25.0, status: rainfall > 25.0 ? 'danger' : 'normal' },
        },
        historySeries,
        snapshots,
      };
    }

    // Live mode: query actual monitoring-snapshots
    const res = await apiClient.get(`/monitoring-snapshots/mine/${mineId}`);
    const rawSnapshots = Array.isArray(res.data) ? res.data.map(normalizeSnapshot) : [];

    if (rawSnapshots.length === 0) {
      return {
        mineId,
        timestamp: 'No telemetry recorded',
        metrics: {
          groundTilt: { value: 0, unit: '°', threshold: 3.5, status: 'normal' },
          discontinuityAngle: { value: 0, unit: '°', threshold: 50.0, status: 'normal' },
          jointSpacing: { value: 0, unit: 'm', threshold: 0.3, status: 'normal' },
          poreWaterPressure: { value: 0, unit: 'kPa', threshold: 100.0, status: 'normal' },
          vibrationRMR: { value: 0, unit: 'mm/s', threshold: 4.0, status: 'normal' },
          rainfall: { value: 0, unit: 'mm/h', threshold: 25.0, status: 'normal' },
        },
        historySeries: [],
        snapshots: [],
      };
    }

    const latest = rawSnapshots[0];
    const dt = new Date(latest.recordedAt);
    const timestamp = !isNaN(dt.getTime())
      ? dt.toLocaleTimeString('en-US', { hour12: false })
      : String(latest.recordedAt);

    const metrics = {
      groundTilt: {
        value: latest.groundTilt,
        unit: '°',
        threshold: 3.5,
        status: latest.groundTilt > 3.5 ? 'danger' : 'normal',
      },
      discontinuityAngle: {
        value: latest.discontinuityAngle,
        unit: '°',
        threshold: 50.0,
        status: latest.discontinuityAngle > 50.0 ? 'danger' : 'normal',
      },
      jointSpacing: {
        value: latest.jointSpacing,
        unit: 'm',
        threshold: 0.3,
        status: latest.jointSpacing < 0.3 ? 'danger' : 'normal',
      },
      poreWaterPressure: {
        value: latest.poreWaterPressure,
        unit: 'kPa',
        threshold: 100.0,
        status: latest.poreWaterPressure > 100.0 ? 'danger' : 'normal',
      },
      vibrationRMR: {
        value: latest.vibrationRmr,
        unit: 'mm/s',
        threshold: 4.0,
        status: latest.vibrationRmr > 4.0 ? 'warning' : 'normal',
      },
      rainfall: {
        value: latest.rainfallMm,
        unit: 'mm/h',
        threshold: 25.0,
        status: latest.rainfallMm > 25.0 ? 'danger' : 'normal',
      },
    };

    // Recharts requires chronological order (oldest first)
    const chronological = [...rawSnapshots].slice(0, 20).reverse();
    const historySeries = chronological.map((s) => ({
      time: s.time,
      groundTilt: s.groundTilt,
      vibration: s.vibrationRmr,
      porePressure: s.poreWaterPressure,
      rainfall: s.rainfallMm,
    }));

    return {
      mineId,
      timestamp,
      metrics,
      historySeries,
      snapshots: rawSnapshots,
    };
  },

  // --- PREDICTIONS ---
  async runRockfallPrediction(inputData) {
    if (USE_MOCK) {
      await delay(400);
      const tilt = parseFloat(inputData.groundTilt) || 0;
      const discontinuity = parseFloat(inputData.discontinuityAngle) || 0;
      const spacing = parseFloat(inputData.jointSpacing) || 1.0;
      const pressure = parseFloat(inputData.poreWaterPressure) || 0;
      const vibration = parseFloat(inputData.vibrationRMR) || 0;
      const rainfall = parseFloat(inputData.rainfall) || 0;

      let riskScore =
        (tilt / 6.0) * 0.25 +
        (discontinuity / 70.0) * 0.2 +
        (Math.max(0, 1.5 - spacing) / 1.5) * 0.15 +
        (pressure / 160.0) * 0.2 +
        (vibration / 8.0) * 0.1 +
        (rainfall / 50.0) * 0.1;

      riskScore = Math.min(0.99, Math.max(0.05, riskScore));
      const hazardProb = +(riskScore * 100).toFixed(1);
      const safeProb = +(100 - hazardProb).toFixed(1);

      const isHazard = hazardProb >= 50.0;
      const riskLevel =
        hazardProb >= 80 ? 'CRITICAL' : hazardProb >= 55 ? 'HIGH' : hazardProb >= 35 ? 'MEDIUM' : 'LOW';
      const alertTriggered = isHazard;

      const predictions = getLocalData('predictions', SEED_PREDICTIONS);
      const newPredId = `PRED-${predictions.length + 901}`;
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

      const newPrediction = {
        id: newPredId,
        mineId: inputData.mineId,
        mineName: inputData.mineName || 'Selected Mine',
        snapshotId: inputData.snapshotId || `SNAP-MANUAL-${Math.floor(Math.random() * 900 + 100)}`,
        predictedClass: isHazard ? 'HAZARD' : 'SAFE',
        hazardProbability: hazardProb,
        safeProbability: safeProb,
        riskLevel,
        alertTriggered,
        timestamp: dateStr,
        factors: {
          groundTilt: tilt,
          discontinuityAngle: discontinuity,
          jointSpacing: spacing,
          poreWaterPressure: pressure,
          vibrationRMR: vibration,
          rainfall,
        },
      };

      saveLocalData('predictions', [newPrediction, ...predictions]);

      if (alertTriggered) {
        const alerts = getLocalData('alerts', SEED_ALERTS);
        const newAlert = {
          id: `ALT-${alerts.length + 301}`,
          mineId: inputData.mineId,
          mineName: inputData.mineName || 'Selected Mine',
          predictionId: newPredId,
          snapshotId: newPrediction.snapshotId,
          riskLevel,
          hazardProbability: hazardProb,
          status: 'Pending',
          createdAt: dateStr,
          notes: `Automatic alert generated by Rockfall ML Ensemble. High hazard probability detected (${hazardProb}%).`,
        };
        saveLocalData('alerts', [newAlert, ...alerts]);
      }

      return newPrediction;
    }

    const parsedMineId = Number(inputData.mineId);
    const parsedSnapshotId = Number(inputData.snapshotId);
    const payload = {
      mineId: isNaN(parsedMineId) ? null : parsedMineId,
      snapshotId: isNaN(parsedSnapshotId) ? null : parsedSnapshotId,
      groundTilt: parseFloat(inputData.groundTilt),
      discontinuityAngle: parseFloat(inputData.discontinuityAngle),
      jointSpacing: parseFloat(inputData.jointSpacing),
      poreWaterPressure: parseFloat(inputData.poreWaterPressure),
      vibrationRmr: parseFloat(inputData.vibrationRMR ?? inputData.vibrationRmr),
      rainfallMm: parseFloat(inputData.rainfall ?? inputData.rainfallMm),
    };

    const res = await apiClient.post('/predictions/predict', payload);
    return normalizePrediction(res.data);
  },

  async getPredictions(limit = null) {
    if (USE_MOCK) {
      await delay();
      return getLocalData('predictions', SEED_PREDICTIONS);
    }
    const params = limit ? { limit } : {};
    const res = await apiClient.get('/predictions/history', { params });
    return Array.isArray(res.data) ? res.data.map((p) => normalizePrediction(p)) : [];
  },

  async getPredictionHistory(limit = null) {
    return this.getPredictions(limit);
  },

  async checkMlHealth() {
    if (USE_MOCK) {
      await delay();
      return { status: 'ok', modelLoaded: true };
    }
    const res = await apiClient.get('/predictions/ml-health');
    return {
      status: res.data?.status || 'UNKNOWN',
      modelLoaded: Boolean(res.data?.model_loaded ?? res.data?.modelLoaded),
    };
  },

  // --- ALERTS ---
  async getAlerts(params = {}) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('alerts', SEED_ALERTS);
      let filtered = list;
      if (params.mineId && params.mineId !== 'ALL') {
        filtered = filtered.filter((a) => String(a.mineId) === String(params.mineId));
      }
      if (params.status && params.status !== 'ALL') {
        filtered = filtered.filter((a) => a.status.toLowerCase() === params.status.toLowerCase());
      }
      return filtered;
    }

    let url = '/alerts';
    if (params.mineId && params.mineId !== 'ALL') {
      url = `/alerts/mine/${params.mineId}`;
    } else if (params.status && params.status !== 'ALL') {
      url = `/alerts/status/${params.status.toUpperCase()}`;
    }

    const res = await apiClient.get(url);
    return Array.isArray(res.data) ? res.data.map((a) => normalizeAlert(a)) : [];
  },

  async getAlertsByMine(mineId) {
    return this.getAlerts({ mineId });
  },

  async getAlertsByStatus(status) {
    return this.getAlerts({ status });
  },

  async acknowledgeAlert(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('alerts', SEED_ALERTS);
      const updated = list.map((a) => (String(a.id) === String(id) ? { ...a, status: 'Acknowledged' } : a));
      saveLocalData('alerts', updated);
      return updated.find((a) => String(a.id) === String(id));
    }
    const res = await apiClient.put(`/alerts/${id}/acknowledge`);
    return normalizeAlert(res.data);
  },

  async resolveAlert(id, notes = '') {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('alerts', SEED_ALERTS);
      const updated = list.map((a) =>
        String(a.id) === String(id)
          ? { ...a, status: 'Resolved', resolutionNotes: notes || 'Resolved by operator' }
          : a
      );
      saveLocalData('alerts', updated);
      return updated.find((a) => String(a.id) === String(id));
    }
    const res = await apiClient.put(`/alerts/${id}/resolve`);
    return normalizeAlert(res.data);
  },

  // --- DASHBOARD OVERVIEW ---
  async getDashboardSummary() {
    return this.getDashboardStats();
  },

  async getDashboardStats() {
    if (USE_MOCK) {
      await delay();
      const mines = getLocalData('mines', SEED_MINES);
      const sensors = getLocalData('sensors', SEED_SENSORS);
      const alerts = getLocalData('alerts', SEED_ALERTS);
      const predictions = getLocalData('predictions', SEED_PREDICTIONS);

      const totalMines = mines.length;
      const activeMines = mines.filter((m) => m.status === 'Active').length;

      const totalSensors = sensors.length;
      const activeSensors = sensors.filter((s) => s.status === 'Active').length;

      const totalAlerts = alerts.length;
      const pendingAlerts = alerts.filter((a) => a.status === 'Pending').length;
      const acknowledgedAlerts = alerts.filter((a) => a.status === 'Acknowledged').length;
      const resolvedAlerts = alerts.filter((a) => a.status === 'Resolved').length;

      const latestPrediction = predictions[0] || null;
      const recentPredictions = predictions.slice(0, 5);

      // Risk distribution
      const riskDistribution = [
        { name: 'Critical Risk', count: predictions.filter((p) => p.riskLevel === 'CRITICAL').length, color: '#D83B3B' },
        { name: 'High Risk', count: predictions.filter((p) => p.riskLevel === 'HIGH').length, color: '#E8A27E' },
        { name: 'Medium Risk', count: predictions.filter((p) => p.riskLevel === 'MEDIUM').length, color: '#E39A28' },
        { name: 'Low / Safe', count: predictions.filter((p) => p.riskLevel === 'LOW').length, color: '#27865B' },
      ];

      return {
        stats: {
          totalMines,
          activeMines,
          totalSensors,
          activeSensors,
          totalAlerts,
          pendingAlerts,
          acknowledgedAlerts,
          resolvedAlerts,
        },
        latestPrediction,
        recentPredictions,
        riskDistribution,
        mines,
      };
    }

    const [summaryRes, minesRes] = await Promise.all([
      apiClient.get('/dashboard/summary'),
      apiClient.get('/mines'),
    ]);
    const minesList = Array.isArray(minesRes.data) ? minesRes.data.map(normalizeMine) : [];
    return normalizeDashboardSummary(summaryRes.data, minesList);
  },
};

export default apiClient;

