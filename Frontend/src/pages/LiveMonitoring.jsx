import { useEffect, useState } from 'react';
import {
  RefreshCw,
  Compass,
  Droplet,
  Zap,
  Layers,
  CloudRain,
  Clock,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import { apiService } from '../services/api';

export default function LiveMonitoring() {
  const [mines, setMines] = useState([]);
  const [selectedMineId, setSelectedMineId] = useState('MINE-001');
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const mineList = await apiService.getMines();
        setMines(mineList);
        if (mineList.length > 0) {
          setSelectedMineId(mineList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  // Fetch telemetry when mine changes
  const fetchTelemetry = async (mineId, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiService.getLiveMonitoring(mineId);
      setTelemetry(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedMineId) {
      fetchTelemetry(selectedMineId);
    }
  }, [selectedMineId]);

  const handleRefresh = () => {
    fetchTelemetry(selectedMineId, true);
  };

  if (loading) {
    return <Loading fullPage message="Connecting to IoT telemetry stream..." />;
  }

  const { metrics, historySeries, snapshots, timestamp } = telemetry || {};
  const currentMine = mines.find((m) => m.id === selectedMineId);

  // Columns for Snapshot History Table
  const snapshotColumns = [
    {
      header: 'Snapshot ID',
      accessor: 'id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>,
    },
    {
      header: 'Timestamp',
      accessor: 'time',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
          <Clock size={13} /> {val}
        </span>
      ),
    },
    {
      header: 'Ground Tilt',
      accessor: 'tilt',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}°</span>,
    },
    {
      header: 'Discontinuity',
      accessor: 'discontinuity',
      render: (val) => <span>{val}°</span>,
    },
    {
      header: 'Joint Spacing',
      accessor: 'spacing',
      render: (val) => <span>{val} m</span>,
    },
    {
      header: 'Pore Pressure',
      accessor: 'pressure',
      render: (val) => <span style={{ fontWeight: 600 }}>{val} kPa</span>,
    },
    {
      header: 'Vibration',
      accessor: 'vibration',
      render: (val) => <span>{val} mm/s</span>,
    },
    {
      header: 'Rainfall',
      accessor: 'rain',
      render: (val) => <span>{val} mm/h</span>,
    },
    {
      header: 'Evaluation',
      accessor: 'status',
      render: (val) => {
        let badge = 'badge-safe';
        if (val === 'Hazard') badge = 'badge-hazard';
        else if (val === 'Warning') badge = 'badge-warning';
        return <span className={`badge ${badge}`}>{val}</span>;
      },
    },
  ];

  return (
    <div>
      {/* HEADER CONTROLS */}
      <div className="toolbar-wrap" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Select Active Mine Site:
            </label>
            <select
              className="form-control"
              style={{ width: '280px', fontWeight: 600, borderColor: 'var(--primary)' }}
              value={selectedMineId}
              onChange={(e) => setSelectedMineId(e.target.value)}
            >
              {mines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px' }}>
            <span className="pulse-dot online" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
              Stream Active
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              • Last Packet: {timestamp}
            </span>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ marginTop: '18px' }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
              color: 'var(--primary)',
            }}
          />
          <span>{refreshing ? 'Polling...' : 'Refresh Latest Data'}</span>
        </button>
      </div>

      {/* 6 REAL-TIME METRIC CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Ground Tilt */}
        <div className="sensor-metric-card">
          <div className="sensor-metric-header">
            <span className="sensor-metric-title">Ground Tilt</span>
            <Compass size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="sensor-metric-value">
            {metrics?.groundTilt?.value}
            <span className="sensor-metric-unit">{metrics?.groundTilt?.unit}</span>
          </div>
          <div className="sensor-metric-status">
            <span className={`pulse-dot ${metrics?.groundTilt?.status === 'danger' ? 'danger' : 'online'}`} />
            <span style={{ color: metrics?.groundTilt?.status === 'danger' ? 'var(--danger)' : 'var(--text-secondary)' }}>
              Threshold: &lt; {metrics?.groundTilt?.threshold}°
            </span>
          </div>
        </div>

        {/* Discontinuity Angle */}
        <div className="sensor-metric-card">
          <div className="sensor-metric-header">
            <span className="sensor-metric-title">Discontinuity Angle</span>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="sensor-metric-value">
            {metrics?.discontinuityAngle?.value}
            <span className="sensor-metric-unit">{metrics?.discontinuityAngle?.unit}</span>
          </div>
          <div className="sensor-metric-status">
            <span className={`pulse-dot ${metrics?.discontinuityAngle?.status === 'danger' ? 'danger' : 'online'}`} />
            <span style={{ color: metrics?.discontinuityAngle?.status === 'danger' ? 'var(--danger)' : 'var(--text-secondary)' }}>
              Dip Threshold: &lt; {metrics?.discontinuityAngle?.threshold}°
            </span>
          </div>
        </div>

        {/* Joint Spacing */}
        <div className="sensor-metric-card">
          <div className="sensor-metric-header">
            <span className="sensor-metric-title">Joint Spacing</span>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="sensor-metric-value">
            {metrics?.jointSpacing?.value}
            <span className="sensor-metric-unit">{metrics?.jointSpacing?.unit}</span>
          </div>
          <div className="sensor-metric-status">
            <span className={`pulse-dot ${metrics?.jointSpacing?.status === 'danger' ? 'danger' : 'online'}`} />
            <span style={{ color: metrics?.jointSpacing?.status === 'danger' ? 'var(--danger)' : 'var(--text-secondary)' }}>
              Safe Band: &gt; {metrics?.jointSpacing?.threshold}m
            </span>
          </div>
        </div>

        {/* Pore Water Pressure */}
        <div className="sensor-metric-card">
          <div className="sensor-metric-header">
            <span className="sensor-metric-title">Pore Water Pressure</span>
            <Droplet size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="sensor-metric-value">
            {metrics?.poreWaterPressure?.value}
            <span className="sensor-metric-unit">{metrics?.poreWaterPressure?.unit}</span>
          </div>
          <div className="sensor-metric-status">
            <span className={`pulse-dot ${metrics?.poreWaterPressure?.status === 'danger' ? 'danger' : 'online'}`} />
            <span style={{ color: metrics?.poreWaterPressure?.status === 'danger' ? 'var(--danger)' : 'var(--text-secondary)' }}>
              Critical limit: 100 kPa
            </span>
          </div>
        </div>

        {/* Vibration RMR */}
        <div className="sensor-metric-card">
          <div className="sensor-metric-header">
            <span className="sensor-metric-title">Vibration PPV</span>
            <Zap size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="sensor-metric-value">
            {metrics?.vibrationRMR?.value}
            <span className="sensor-metric-unit">{metrics?.vibrationRMR?.unit}</span>
          </div>
          <div className="sensor-metric-status">
            <span className={`pulse-dot ${metrics?.vibrationRMR?.status === 'warning' ? 'warning' : 'online'}`} />
            <span style={{ color: metrics?.vibrationRMR?.status === 'warning' ? 'var(--warning)' : 'var(--text-secondary)' }}>
              Blast limit: 4.0 mm/s
            </span>
          </div>
        </div>

        {/* Rainfall */}
        <div className="sensor-metric-card">
          <div className="sensor-metric-header">
            <span className="sensor-metric-title">Precipitation Rate</span>
            <CloudRain size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="sensor-metric-value">
            {metrics?.rainfall?.value}
            <span className="sensor-metric-unit">{metrics?.rainfall?.unit}</span>
          </div>
          <div className="sensor-metric-status">
            <span className={`pulse-dot ${metrics?.rainfall?.status === 'danger' ? 'danger' : 'online'}`} />
            <span style={{ color: metrics?.rainfall?.status === 'danger' ? 'var(--danger)' : 'var(--text-secondary)' }}>
              Flash threshold: 25 mm/h
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS GRID (4 CHARTS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Chart 1: Ground Tilt History */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Compass size={17} style={{ color: 'var(--primary)' }} />
                <span>Ground Tilt History (Past 60 mins)</span>
              </h3>
              <p className="card-subtitle">Real-time inclinometer displacement curve</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historySeries}>
                <defs>
                  <linearGradient id="tiltGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} domain={['auto', 'auto']} unit="°" />
                <Tooltip contentStyle={{ borderRadius: '8px', borderColor: 'var(--border)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="groundTilt" name="Ground Tilt (°)" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#tiltGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vibration History */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Zap size={17} style={{ color: 'var(--warning)' }} />
                <span>Seismic & Blasting Vibration (PPV)</span>
              </h3>
              <p className="card-subtitle">Peak particle velocity measured in mm/s</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} unit="mm/s" />
                <Tooltip contentStyle={{ borderRadius: '8px', borderColor: 'var(--border)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="#E39A28" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Pore Water Pressure History */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Droplet size={17} style={{ color: '#2575fc' }} />
                <span>Pore Water Pressure (Hydrostatic)</span>
              </h3>
              <p className="card-subtitle">Bench toe water saturation trend in kPa</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} unit="kPa" />
                <Tooltip contentStyle={{ borderRadius: '8px', borderColor: 'var(--border)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="porePressure" name="Pressure (kPa)" stroke="#2575fc" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Rainfall History */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <CloudRain size={17} style={{ color: 'var(--primary)' }} />
                <span>Rainfall Intensity (mm/h)</span>
              </h3>
              <p className="card-subtitle">Weather station precipitation log</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} unit="mm" />
                <Tooltip contentStyle={{ borderRadius: '8px', borderColor: 'var(--border)', fontSize: '12px' }} />
                <Bar dataKey="rainfall" name="Rainfall (mm/h)" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MONITORING SNAPSHOTS HISTORY TABLE */}
      <div className="card-white">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Radio size={18} style={{ color: 'var(--primary)' }} />
              <span>Monitoring Snapshots Telemetry Stream — {currentMine?.name}</span>
            </h3>
            <p className="card-subtitle">Synchronized Multi-Sensor Snapshots</p>
          </div>
        </div>

        <DataTable
          columns={snapshotColumns}
          data={snapshots || []}
          pagination={false}
          emptyMessage="No snapshots recorded for this mine."
        />
      </div>
    </div>
  );
}
