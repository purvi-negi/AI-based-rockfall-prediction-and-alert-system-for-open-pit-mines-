import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { apiService } from '../services/api';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mineFilter, setMineFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState(null);

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      setErrorMsg(null);
      const [predsRes, minesRes] = await Promise.all([
        apiService.getPredictions(),
        apiService.getMines(),
      ]);
      const mappedPreds = predsRes.map((p) => {
        const m = minesRes.find((mine) => String(mine.id) === String(p.mineId));
        return {
          ...p,
          mineName:
            p.mineName && !p.mineName.startsWith('Mine #')
              ? p.mineName
              : m?.name || p.mineName || (p.mineId ? `Mine #${p.mineId}` : 'Unknown Mine'),
        };
      });
      setPredictions(mappedPreds);
      setMines(minesRes);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch =
      String(p.id ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.mineName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.snapshotId ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMine = mineFilter === 'ALL' || String(p.mineId) === String(mineFilter);
    const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
    return matchesSearch && matchesMine && matchesRisk;
  });

  const columns = [
    {
      header: 'Prediction ID',
      accessor: 'id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{val}</span>,
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
      header: 'Snapshot ID',
      accessor: 'snapshotId',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>{val}</span>,
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
      header: 'Safe Prob.',
      accessor: 'safeProbability',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          {val}%
        </span>
      ),
    },
    {
      header: 'Risk Level',
      accessor: 'riskLevel',
      render: (val, row) => {
        const eff = row.effectiveClass || val;
        let badge = 'badge-neutral';
        if (eff === 'CRITICAL' || eff === 'WARNING' || eff === 'HIGH') badge = 'badge-hazard';
        else if (eff === 'LOW' || eff === 'MEDIUM') badge = 'badge-warning';
        else if (eff === 'SAFE') badge = 'badge-safe';
        return <span className={`badge ${badge}`}>{eff}</span>;
      },
    },
    {
      header: 'Alert Trigger',
      accessor: 'alertTriggered',
      render: (val) => (
        <span className={`badge ${val ? 'badge-hazard' : 'badge-neutral'}`}>
          {val ? 'Triggered' : 'None'}
        </span>
      ),
    },
    {
      header: 'Date & Time',
      accessor: 'timestamp',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{val}</span>,
    },
    {
      header: 'Audit',
      accessor: 'actions',
      align: 'right',
      render: (_, row) => (
        <button
          className="btn-icon"
          onClick={() => setSelectedRecord(row)}
          title="Inspect Telemetry Breakdown"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div>
      {errorMsg && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: '16px' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FILTER TOOLBAR */}
      <div className="toolbar-wrap">
        <div className="toolbar-actions">
          <div className="search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search prediction ID, mine or snapshot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '160px', padding: '8px 12px' }}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <select
            className="form-control"
            style={{ width: '200px', padding: '8px 12px' }}
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
          >
            <option value="ALL">All Associated Mines</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Total Assessments: <strong>{filteredPredictions.length}</strong>
        </div>
      </div>

      {/* PREDICTIONS TABLE */}
      <div className="card-white">
        <DataTable
          columns={columns}
          data={filteredPredictions}
          loading={loading}
          pagination={true}
          pageSize={8}
          emptyMessage="No historical predictions found matching filters."
        />
      </div>

      {/* INSPECT MODAL */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Prediction Audit Log: {selectedRecord.id}</h3>
              <button className="btn-icon" onClick={() => setSelectedRecord(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {(() => {
                const effClass = selectedRecord.effectiveClass || selectedRecord.predictedClass;
                const isDanger = effClass === 'CRITICAL' || effClass === 'WARNING' || effClass === 'HAZARD';
                const isLow = effClass === 'LOW';
                const badgeClass = isDanger ? 'badge-hazard' : isLow ? 'badge-warning' : 'badge-safe';
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isDanger ? '#FEECEB' : isLow ? '#FFFBEB' : '#E7F6ED',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Model Evaluation</div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: isDanger ? 'var(--danger)' : isLow ? '#D97706' : 'var(--success)' }}>
                        {effClass} ({selectedRecord.hazardProbability}% Hazard)
                      </div>
                    </div>
                    <span className={`badge ${badgeClass}`}>
                      {selectedRecord.riskLevel || effClass} RISK
                    </span>
                  </div>
                );
              })()}

              {selectedRecord.rawSvmClass !== undefined && selectedRecord.rawSvmClass !== null && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    ML Model Diagnostic Output
                  </div>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                    <span>Raw SVM Decision: <strong style={{ color: 'var(--text-primary)' }}>Class {selectedRecord.rawSvmClass} ({selectedRecord.rawSvmClass === 1 ? 'HAZARD' : 'SAFE'})</strong></span>
                    {selectedRecord.decisionFunction != null && (
                      <span>Decision Score f(x): <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{Number(selectedRecord.decisionFunction).toFixed(4)}</strong></span>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mine Site</span>
                  <span style={{ fontWeight: 600 }}>{selectedRecord.mineName} ({selectedRecord.mineId})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Snapshot ID</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedRecord.snapshotId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Inference Timestamp</span>
                  <span>{selectedRecord.timestamp}</span>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                    Snapshot Telemetry Features:
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Ground Tilt</span>
                      <strong>{selectedRecord.factors?.groundTilt ?? '—'}°</strong>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Discontinuity Dip</span>
                      <strong>{selectedRecord.factors?.discontinuityAngle ?? '—'}°</strong>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Joint Spacing</span>
                      <strong>{selectedRecord.factors?.jointSpacing ?? '—'} m</strong>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Pore Water Pressure</span>
                      <strong>{selectedRecord.factors?.poreWaterPressure ?? '—'} kPa</strong>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Vibration RMR</span>
                      <strong>{selectedRecord.factors?.vibrationRMR ?? '—'} mm/s</strong>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px' }}>Rainfall</span>
                      <strong>{selectedRecord.factors?.rainfall ?? '—'} mm/h</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
