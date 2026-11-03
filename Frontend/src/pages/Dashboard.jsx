import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mountain,
  Cpu,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Loading from '../components/Loading';
import { apiService } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      setErrorMsg(null);
      const res = await apiService.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to load live dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading fullPage message="Compiling real-time mine telemetry..." />;
  }

  const { stats, latestPrediction, recentPredictions, riskDistribution, mines } = data || {};

  // Table columns for recent predictions
  const predictionColumns = [
    {
      header: 'Prediction ID',
      accessor: 'id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>,
    },
    {
      header: 'Mine Site',
      accessor: 'mineName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.mineId}</div>
        </div>
      ),
    },
    {
      header: 'Effective Class',
      accessor: 'effectiveClass',
      render: (val, row) => {
        const cls = val || row.predictedClass;
        let badgeClass = 'badge-safe';
        if (cls === 'CRITICAL' || cls === 'WARNING' || cls === 'HAZARD') badgeClass = 'badge-hazard';
        else if (cls === 'LOW') badgeClass = 'badge-warning';
        return (
          <span className={`badge ${badgeClass}`}>
            <span className="badge-dot" />
            {cls}
          </span>
        );
      },
    },
    {
      header: 'Hazard Prob.',
      accessor: 'hazardProbability',
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: val >= 50 ? 'var(--danger)' : 'var(--success)',
          }}
        >
          {val}%
        </span>
      ),
    },
    {
      header: 'Risk Level',
      accessor: 'riskLevel',
      render: (val, row) => {
        const eff = row.effectiveClass || val;
        let badgeClass = 'badge-neutral';
        if (eff === 'CRITICAL' || eff === 'WARNING' || eff === 'HIGH') badgeClass = 'badge-hazard';
        else if (eff === 'LOW' || eff === 'MEDIUM') badgeClass = 'badge-warning';
        else if (eff === 'SAFE') badgeClass = 'badge-safe';
        return <span className={`badge ${badgeClass}`}>{eff}</span>;
      },
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (val) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{val}</span>,
    },
  ];

  return (
    <div className="dashboard-page">
      {errorMsg && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 8 STATISTICS CARDS */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Mines"
          value={stats?.totalMines ?? 0}
          icon={Mountain}
          subtitle="Registered Open Cast & Underground"
        />
        <StatCard
          title="Active Mines"
          value={stats?.activeMines ?? 0}
          icon={Activity}
          subtitle="Under continuous sensor watch"
        />
        <StatCard
          title="Total Sensors"
          value={stats?.totalSensors ?? 0}
          icon={Cpu}
          subtitle="Deployed IoT instruments"
        />
        <StatCard
          title="Active Sensors"
          value={stats?.activeSensors ?? 0}
          icon={CheckCircle}
          subtitle="Transmitting telemetry normal"
        />
        <StatCard
          title="Total Alerts"
          value={stats?.totalAlerts ?? 0}
          icon={Bell}
          subtitle="All historical alert triggers"
        />
        <StatCard
          title="Pending Alerts"
          value={stats?.pendingAlerts ?? 0}
          icon={AlertTriangle}
          variant="pending"
          subtitle="Requires immediate response"
        />
        <StatCard
          title="Acknowledged"
          value={stats?.acknowledgedAlerts ?? 0}
          icon={Clock}
          variant="acknowledged"
          subtitle="Assigned to field engineers"
        />
        <StatCard
          title="Resolved Alerts"
          value={stats?.resolvedAlerts ?? 0}
          icon={CheckCircle}
          variant="resolved"
          subtitle="Mitigated and verified safe"
        />
      </div>

      {/* LATEST PREDICTION HERO SECTION & LATEST MONITORING SNAPSHOT */}
      <div className="dashboard-grid-2">
        {/* Latest Prediction Card */}
        {(() => {
          const effClass = latestPrediction?.effectiveClass || latestPrediction?.predictedClass;
          const isDanger = effClass === 'CRITICAL' || effClass === 'WARNING' || effClass === 'HAZARD';
          return (
            <div className={`prediction-hero-card ${isDanger ? 'hazard' : 'safe'}`}>
              <div className="prediction-hero-header">
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      color: 'var(--primary)',
                      marginBottom: '4px',
                    }}
                  >
                    Latest ML Rockfall Evaluation
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {latestPrediction ? latestPrediction.mineName : 'No Predictions Recorded'}
                  </h2>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {latestPrediction
                      ? `Snapshot: ${latestPrediction.snapshotId} • Evaluated: ${latestPrediction.timestamp}`
                      : 'Run an evaluation in the Rockfall Prediction module to populate latest telemetry metrics.'}
                  </div>
                </div>

                <span className={`prediction-badge-lg ${isDanger ? 'hazard' : 'safe'}`}>
                  {isDanger ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                  {effClass || 'NO DATA'}
                </span>
              </div>

          <div className="probability-bar-container">
            <div className="probability-bar-labels">
              <span style={{ color: 'var(--danger)' }}>
                Hazard Probability: {latestPrediction?.hazardProbability ?? 0}%
              </span>
              <span style={{ color: 'var(--success)' }}>
                Safe Probability: {latestPrediction?.safeProbability ?? 0}%
              </span>
            </div>
            <div className="probability-bar-track">
              <div
                className="probability-bar-fill-hazard"
                style={{ width: `${latestPrediction?.hazardProbability ?? 0}%` }}
              />
              <div
                className="probability-bar-fill-safe"
                style={{ width: `${latestPrediction?.safeProbability ?? 0}%` }}
              />
            </div>
          </div>

          {/* Key Geotechnical Factors */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginTop: '18px',
            }}
          >
            <div className="sensor-metric-card" style={{ padding: '10px' }}>
              <div className="sensor-metric-title">Ground Tilt</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {latestPrediction?.factors?.groundTilt != null ? `${latestPrediction.factors.groundTilt}°` : '—'}
              </div>
            </div>
            <div className="sensor-metric-card" style={{ padding: '10px' }}>
              <div className="sensor-metric-title">Discontinuity</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {latestPrediction?.factors?.discontinuityAngle != null ? `${latestPrediction.factors.discontinuityAngle}°` : '—'}
              </div>
            </div>
            <div className="sensor-metric-card" style={{ padding: '10px' }}>
              <div className="sensor-metric-title">Pore Pressure</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {latestPrediction?.factors?.poreWaterPressure != null ? `${latestPrediction.factors.poreWaterPressure} kPa` : '—'}
              </div>
            </div>
            <div className="sensor-metric-card" style={{ padding: '10px' }}>
              <div className="sensor-metric-title">Rainfall</div>
              <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {latestPrediction?.factors?.rainfall != null ? `${latestPrediction.factors.rainfall} mm/h` : '—'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/prediction" className="btn btn-outline btn-sm">
              <span>Inspect Rockfall Predictor</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
          );
        })()}

        {/* Risk Distribution Chart */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
                <span>Risk Level Distribution</span>
              </h3>
              <p className="card-subtitle">Aggregate breakdown of recent assessments</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {riskDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Records`, name]}
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: 'var(--border)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {riskDistribution?.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                <span style={{ fontWeight: 700 }}>({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT PREDICTIONS TABLE & MINE STATUS SUMMARY */}
      <div className="dashboard-grid-2">
        {/* Recent Predictions Table */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Layers size={18} style={{ color: 'var(--primary)' }} />
                <span>Recent Geotechnical Predictions</span>
              </h3>
              <p className="card-subtitle">Latest outputs generated by ML inference engine</p>
            </div>
            <Link to="/history" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <DataTable
            columns={predictionColumns}
            data={recentPredictions || []}
            emptyMessage="No recent predictions available."
          />
        </div>

        {/* Mine Status Summary */}
        <div className="card-white">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Mountain size={18} style={{ color: 'var(--primary)' }} />
                <span>Mine Fleet Status</span>
              </h3>
              <p className="card-subtitle">Operational safety index across sites</p>
            </div>
            <Link to="/mines" className="btn btn-secondary btn-sm">
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mines && mines.length > 0 ? (
              mines.map((mine) => (
                <div
                  key={mine.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                      {mine.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Slope: {mine.slopeAngle != null ? `${mine.slopeAngle}°` : '—'} • {mine.totalSensors ?? 0} Sensors
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`badge ${
                        mine.riskRating === 'Critical'
                          ? 'badge-hazard'
                          : mine.riskRating === 'High'
                          ? 'badge-warning'
                          : 'badge-safe'
                      }`}
                    >
                      {mine.riskRating}
                    </span>
                    <span
                      className={`badge ${mine.status === 'Active' ? 'badge-safe' : 'badge-neutral'}`}
                    >
                      {mine.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '16px 0', textAlign: 'center' }}>
                No registered mine sites found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
