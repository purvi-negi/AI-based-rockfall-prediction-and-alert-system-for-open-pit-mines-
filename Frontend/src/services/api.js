import axios from 'axios';

// Centralized Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK !== 'false';

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
    const token = localStorage.getItem('rockfall_token');
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
      // Auto logout if unauthorized
      localStorage.removeItem('rockfall_token');
      localStorage.removeItem('rockfall_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
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
      return getLocalData('mines', SEED_MINES);
    }
    const res = await apiClient.get('/mines');
    return res.data;
  },

  async getMineById(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      return list.find((m) => m.id === id) || null;
    }
    const res = await apiClient.get(`/mines/${id}`);
    return res.data;
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
      return newMine;
    }
    const res = await apiClient.post('/mines', mineData);
    return res.data;
  },

  async updateMine(id, mineData) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      const updated = list.map((m) => (m.id === id ? { ...m, ...mineData } : m));
      saveLocalData('mines', updated);
      return updated.find((m) => m.id === id);
    }
    const res = await apiClient.put(`/mines/${id}`, mineData);
    return res.data;
  },

  async deleteMine(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('mines', SEED_MINES);
      const updated = list.filter((m) => m.id !== id);
      saveLocalData('mines', updated);
      return { success: true, id };
    }
    const res = await apiClient.delete(`/mines/${id}`);
    return res.data;
  },

  // --- SENSORS ---
  async getSensors(mineId = null) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      if (mineId) {
        return list.filter((s) => s.mineId === mineId);
      }
      return list;
    }
    const res = await apiClient.get('/sensors', { params: { mineId } });
    return res.data;
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

      // Increment mine's sensor count
      const mines = getLocalData('mines', SEED_MINES);
      const updatedMines = mines.map((m) =>
        m.id === sensorData.mineId ? { ...m, totalSensors: (m.totalSensors || 0) + 1 } : m
      );
      saveLocalData('mines', updatedMines);

      return newSensor;
    }
    const res = await apiClient.post('/sensors', sensorData);
    return res.data;
  },

  async updateSensor(id, sensorData) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const updated = list.map((s) => (s.id === id ? { ...s, ...sensorData } : s));
      saveLocalData('sensors', updated);
      return updated.find((s) => s.id === id);
    }
    const res = await apiClient.put(`/sensors/${id}`, sensorData);
    return res.data;
  },

  async deleteSensor(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('sensors', SEED_SENSORS);
      const target = list.find((s) => s.id === id);
      const updated = list.filter((s) => s.id !== id);
      saveLocalData('sensors', updated);

      if (target?.mineId) {
        const mines = getLocalData('mines', SEED_MINES);
        const updatedMines = mines.map((m) =>
          m.id === target.mineId ? { ...m, totalSensors: Math.max(0, (m.totalSensors || 1) - 1) } : m
        );
        saveLocalData('mines', updatedMines);
      }
      return { success: true, id };
    }
    const res = await apiClient.delete(`/sensors/${id}`);
    return res.data;
  },

  // --- LIVE MONITORING & SNAPSHOTS ---
  async getLiveMonitoring(mineId = 'MINE-001') {
    if (USE_MOCK) {
      await delay();
      // Generate realistic dynamic metrics with baseline variations
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

      // History series for Recharts
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

      // Recent Snapshots table rows
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
    const res = await apiClient.get(`/monitoring/${mineId}`);
    return res.data;
  },

  // --- PREDICTIONS ---
  async runRockfallPrediction(inputData) {
    if (USE_MOCK) {
      await delay(400); // realistic ML compute latency
      const tilt = parseFloat(inputData.groundTilt) || 0;
      const discontinuity = parseFloat(inputData.discontinuityAngle) || 0;
      const spacing = parseFloat(inputData.jointSpacing) || 1.0;
      const pressure = parseFloat(inputData.poreWaterPressure) || 0;
      const vibration = parseFloat(inputData.vibrationRMR) || 0;
      const rainfall = parseFloat(inputData.rainfall) || 0;

      // Deterministic geotechnical ML heuristic based on empirical rock mechanics
      let riskScore = (tilt / 6.0) * 0.25 + 
                       (discontinuity / 70.0) * 0.20 + 
                       (Math.max(0, 1.5 - spacing) / 1.5) * 0.15 + 
                       (pressure / 160.0) * 0.20 + 
                       (vibration / 8.0) * 0.10 + 
                       (rainfall / 50.0) * 0.10;

      riskScore = Math.min(0.99, Math.max(0.05, riskScore));
      const hazardProb = +(riskScore * 100).toFixed(1);
      const safeProb = +(100 - hazardProb).toFixed(1);

      const isHazard = hazardProb >= 50.0;
      const riskLevel = hazardProb >= 80 ? 'CRITICAL' : hazardProb >= 55 ? 'HIGH' : hazardProb >= 35 ? 'MEDIUM' : 'LOW';
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

      // Store in predictions history
      saveLocalData('predictions', [newPrediction, ...predictions]);

      // If alert triggered, automatically post to alerts list
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
    const res = await apiClient.post('/predict', inputData);
    return res.data;
  },

  async getPredictions() {
    if (USE_MOCK) {
      await delay();
      return getLocalData('predictions', SEED_PREDICTIONS);
    }
    const res = await apiClient.get('/predictions');
    return res.data;
  },

  // --- ALERTS ---
  async getAlerts() {
    if (USE_MOCK) {
      await delay();
      return getLocalData('alerts', SEED_ALERTS);
    }
    const res = await apiClient.get('/alerts');
    return res.data;
  },

  async acknowledgeAlert(id) {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('alerts', SEED_ALERTS);
      const updated = list.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a));
      saveLocalData('alerts', updated);
      return updated.find((a) => a.id === id);
    }
    const res = await apiClient.patch(`/alerts/${id}/acknowledge`);
    return res.data;
  },

  async resolveAlert(id, notes = '') {
    if (USE_MOCK) {
      await delay();
      const list = getLocalData('alerts', SEED_ALERTS);
      const updated = list.map((a) =>
        a.id === id ? { ...a, status: 'Resolved', resolutionNotes: notes || 'Resolved by operator' } : a
      );
      saveLocalData('alerts', updated);
      return updated.find((a) => a.id === id);
    }
    const res = await apiClient.patch(`/alerts/${id}/resolve`, { notes });
    return res.data;
  },

  // --- DASHBOARD OVERVIEW ---
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
    const res = await apiClient.get('/dashboard/stats');
    return res.data;
  },
};

export default apiClient;

