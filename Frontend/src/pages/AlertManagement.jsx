import { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  Search,
  Eye,
  Check,
  CheckCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AlertManagement() {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mineFilter, setMineFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchAlertsData = async () => {
    setLoading(true);
    try {
      const [alertsRes, minesRes] = await Promise.all([
        apiService.getAlerts(),
        apiService.getMines(),
      ]);
      setAlerts(alertsRes);
      setMines(minesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleAcknowledge = async (alertId) => {
    setSubmitting(true);
    try {
      await apiService.acknowledgeAlert(alertId);
      showFeedback(`Alert ${alertId} marked as Acknowledged.`);
      fetchAlertsData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResolve = (alert) => {
    setSelectedAlert(alert);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!selectedAlert) return;
    setSubmitting(true);
    try {
      await apiService.resolveAlert(selectedAlert.id, resolutionNotes);
      showFeedback(`Alert ${selectedAlert.id} resolved and marked safe.`);
      setResolveModalOpen(false);
      fetchAlertsData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (alert) => {
    setSelectedAlert(alert);
    setViewModalOpen(true);
  };

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Stats
  const totalCount = alerts.length;
  const pendingCount = alerts.filter((a) => a.status === 'Pending').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'Acknowledged').length;
  const resolvedCount = alerts.filter((a) => a.status === 'Resolved').length;

  // Filtered
  const filteredAlerts = alerts.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesMine = mineFilter === 'ALL' || a.mineId === mineFilter;
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesMine && matchesSearch;
  });

  const columns = [
    {
      header: 'Alert ID',
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
      header: 'Prediction ID',
      accessor: 'predictionId',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{val}</span>,
    },
    {
      header: 'Risk Level',
      accessor: 'riskLevel',
      render: (val) => {
        let badge = 'badge-neutral';
        if (val === 'CRITICAL' || val === 'HIGH') badge = 'badge-hazard';
        else if (val === 'MEDIUM') badge = 'badge-warning';
        return <span className={`badge ${badge}`}>{val}</span>;
      },
    },
    {
      header: 'Hazard Probability',
      accessor: 'hazardProbability',
      render: (val) => (
        <span style={{ fontWeight: 700, color: val >= 50 ? 'var(--danger)' : 'var(--text-primary)' }}>
          {val}%
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        let badge = 'badge-neutral';
        if (val === 'Pending') badge = 'badge-hazard';
        else if (val === 'Acknowledged') badge = 'badge-warning';
        else if (val === 'Resolved') badge = 'badge-safe';
        return (
          <span className={`badge ${badge}`}>
            <span className="badge-dot" />
            {val}
          </span>
        );
      },
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      render: (val) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{val}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            className="btn-icon"
            onClick={() => handleOpenView(row)}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          {isAdmin && row.status === 'Pending' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleAcknowledge(row.id)}
              disabled={submitting}
              title="Acknowledge Alert"
            >
              <Check size={14} />
              <span>Ack</span>
            </button>
          )}

          {isAdmin && (row.status === 'Pending' || row.status === 'Acknowledged') && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenResolve(row)}
              disabled={submitting}
              title="Resolve Alert"
            >
              <CheckCheck size={14} />
              <span>Resolve</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {feedbackMsg && (
        <div className="alert-banner alert-banner-success">
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="stat-cards-grid" style={{ marginBottom: '20px' }}>
        <StatCard
          title="Total Alerts"
          value={totalCount}
          icon={Bell}
          subtitle="All recorded incident triggers"
          onClick={() => setStatusFilter('ALL')}
        />
        <StatCard
          title="Pending Alerts"
          value={pendingCount}
          icon={AlertTriangle}
          variant="pending"
          subtitle="Awaiting response"
          onClick={() => setStatusFilter('Pending')}
        />
        <StatCard
          title="Acknowledged"
          value={acknowledgedCount}
          icon={Clock}
          variant="acknowledged"
          subtitle="Under active investigation"
          onClick={() => setStatusFilter('Acknowledged')}
        />
        <StatCard
          title="Resolved Alerts"
          value={resolvedCount}
          icon={CheckCircle}
          variant="resolved"
          subtitle="Cleared by safety crew"
          onClick={() => setStatusFilter('Resolved')}
        />
      </div>

      {/* FILTER CONTROLS */}
      <div className="toolbar-wrap">
        <div className="toolbar-actions">
          <div className="search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search alert by ID, mine or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '160px', padding: '8px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <select
            className="form-control"
            style={{ width: '200px', padding: '8px 12px' }}
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
          >
            <option value="ALL">All Mines</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {!isAdmin && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Read-only mode: Operator role cannot acknowledge or resolve safety alerts.
          </span>
        )}
      </div>

      {/* ALERTS TABLE */}
      <div className="card-white">
        <DataTable
          columns={columns}
          data={filteredAlerts}
          loading={loading}
          pagination={true}
          pageSize={8}
          emptyMessage="No safety alerts found matching criteria."
        />
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedAlert && (
        <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Alert Report: {selectedAlert.id}</h3>
              <button className="btn-icon" onClick={() => setViewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mine Site</span>
                  <span style={{ fontWeight: 700 }}>{selectedAlert.mineName} ({selectedAlert.mineId})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Related Prediction</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{selectedAlert.predictionId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Snapshot ID</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{selectedAlert.snapshotId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hazard Probability</span>
                  <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '16px' }}>{selectedAlert.hazardProbability}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Risk Classification</span>
                  <span className="badge badge-hazard">{selectedAlert.riskLevel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Status</span>
                  <span className="badge badge-warning">{selectedAlert.status}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Telemetry Notes & Recommendations:
                  </span>
                  <div style={{ padding: '12px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', fontSize: '13.5px' }}>
                    {selectedAlert.notes}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {resolveModalOpen && selectedAlert && (
        <div className="modal-overlay" onClick={() => setResolveModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resolve Alert: {selectedAlert.id}</h3>
              <button className="btn-icon" onClick={() => setResolveModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '14px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
                Please specify field mitigation action taken for {selectedAlert.mineName} to mark this hazard as safe.
              </p>

              <div className="form-group">
                <label className="form-label">Mitigation & Safety Inspection Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="e.g. Geotechnical patrol verified bench stabilization. Scaling completed and water drainage cleared."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmResolve}
                disabled={submitting}
              >
                {submitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
