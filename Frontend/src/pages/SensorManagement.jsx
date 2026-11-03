import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SENSOR_TYPES = [
  'Inclinometer',
  'Extensometer',
  'Piezometer',
  'Seismograph',
  'Rain Gauge',
  'Crack Meter',
];

export default function SensorManagement() {
  const { isAdmin } = useAuth();
  const [sensors, setSensors] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [mineFilter, setMineFilter] = useState('ALL');

  // Modal states
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete'
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Inclinometer',
    mineId: '',
    status: 'Active',
    readingInterval: '5s',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [sensorsRes, minesRes] = await Promise.all([
        apiService.getSensors(),
        apiService.getMines(),
      ]);
      setSensors(Array.isArray(sensorsRes) ? sensorsRes : []);
      setMines(Array.isArray(minesRes) ? minesRes : []);
    } catch (err) {
      console.error('Failed to load sensor or mine telemetry:', err);
      const apiErr =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load telemetry sensor data.';
      setErrorMsg(apiErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: 'Inclinometer',
      mineId: mines.length > 0 ? String(mines[0].id) : '',
      status: 'Active',
      readingInterval: '5s',
    });
    setFormErrors({});
    setModalMode('add');
  };

  const handleOpenEdit = (sensor) => {
    setSelectedSensor(sensor);
    setFormData({
      name: sensor.name || sensor.sensorName || '',
      type: sensor.type || sensor.sensorType || 'Inclinometer',
      mineId: sensor.mineId != null ? String(sensor.mineId) : (mines.length > 0 ? String(mines[0].id) : ''),
      status: sensor.status || 'Active',
      readingInterval: sensor.readingInterval || '5s',
    });
    setFormErrors({});
    setModalMode('edit');
  };

  const handleOpenDelete = (sensor) => {
    setSelectedSensor(sensor);
    setFormErrors({});
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSensor(null);
    setFormErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Sensor label/name is required.';
    if (!formData.mineId) errs.mineId = 'Associated mine must be selected.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      const targetMine = mines.find((m) => String(m.id) === String(formData.mineId));
      const payload = {
        name: formData.name.trim(),
        sensorName: formData.name.trim(),
        type: formData.type,
        sensorType: formData.type,
        status: formData.status,
        mineId: formData.mineId,
        mineName: targetMine ? (targetMine.name || targetMine.mineName) : '',
        readingInterval: formData.readingInterval,
      };

      if (modalMode === 'add') {
        await apiService.createSensor(payload);
        showNotification('New geotechnical sensor successfully added.');
      } else if (modalMode === 'edit') {
        await apiService.updateSensor(selectedSensor.id, payload);
        showNotification('Sensor parameters updated.');
      }
      closeModal();
      await fetchData();
    } catch (err) {
      console.error('Failed to save sensor:', err);
      const apiErr =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save sensor configuration. Please verify input and try again.';
      setFormErrors((prev) => ({ ...prev, submit: apiErr }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSensor) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      await apiService.deleteSensor(selectedSensor.id);
      showNotification(`Sensor ${selectedSensor.name || selectedSensor.sensorName || selectedSensor.id} removed from network.`);
      closeModal();
      await fetchData();
    } catch (err) {
      console.error('Failed to delete sensor:', err);
      const apiErr =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to delete sensor. Please check system status and try again.';
      setFormErrors((prev) => ({ ...prev, submit: apiErr }));
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filtered sensors
  const filteredSensors = sensors.filter((sensor) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (sensor.name || sensor.sensorName || '').toLowerCase().includes(q) ||
      String(sensor.id ?? '').toLowerCase().includes(q) ||
      (sensor.mineName && sensor.mineName.toLowerCase().includes(q));
    const matchesType = typeFilter === 'ALL' || sensor.type === typeFilter || sensor.sensorType === typeFilter;
    const matchesMine = mineFilter === 'ALL' || String(sensor.mineId) === String(mineFilter);
    return matchesSearch && matchesType && matchesMine;
  });

  const columns = [
    {
      header: 'Sensor ID',
      accessor: 'id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{val}</span>,
    },
    {
      header: 'Sensor Name',
      accessor: 'name',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={15} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{val || row.sensorName}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Interval: {row.readingInterval || '5s'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Sensor Type',
      accessor: 'type',
      render: (val, row) => <span className="badge badge-primary">{val || row.sensorType}</span>,
    },
    {
      header: 'Associated Mine',
      accessor: 'mineName',
      render: (val, row) => {
        const associatedMine = mines.find((m) => String(m.id) === String(row.mineId));
        const displayName = val || associatedMine?.name || associatedMine?.mineName || (row.mineId ? `Mine #${row.mineId}` : 'Unassigned');
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{displayName}</div>
            {row.mineId && (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mine ID: #{row.mineId}</div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Telemetry Status',
      accessor: 'status',
      render: (val) => {
        let badgeClass = 'badge-neutral';
        if (val === 'Active') badgeClass = 'badge-safe';
        else if (val === 'Maintenance') badgeClass = 'badge-warning';
        else if (val === 'Inactive') badgeClass = 'badge-hazard';
        return (
          <span className={`badge ${badgeClass}`}>
            <span className="badge-dot" />
            {val}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          {isAdmin ? (
            <>
              <button
                className="btn-icon"
                onClick={() => handleOpenEdit(row)}
                title="Edit Sensor"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleOpenDelete(row)}
                title="Delete Sensor"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Read-only</span>
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

      {errorMsg && (
        <div className="alert-banner alert-banner-danger" style={{ marginBottom: '16px' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="toolbar-wrap">
        <div className="toolbar-actions">
          <div className="search-box">
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              placeholder="Search by sensor name, ID or mine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '150px', padding: '8px 12px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              {SENSOR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <select
            className="form-control"
            style={{ width: '180px', padding: '8px 12px' }}
            value={mineFilter}
            onChange={(e) => setMineFilter(e.target.value)}
          >
            <option value="ALL">All Associated Mines</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.mineName} (#{m.id})
              </option>
            ))}
          </select>
        </div>

        {isAdmin ? (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Sensor</span>
          </button>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Admin role required to configure sensors.
          </span>
        )}
      </div>

      {/* SENSORS TABLE */}
      <div className="card-white">
        <DataTable
          columns={columns}
          data={filteredSensors}
          loading={loading}
          pagination={true}
          pageSize={8}
          emptyMessage="No telemetry sensors found matching selected filters."
        />
      </div>

      {/* ADD / EDIT MODAL */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Install New Sensor' : `Edit: ${selectedSensor?.name || selectedSensor?.sensorName || selectedSensor?.id}`}</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formErrors.submit && (
                  <div className="alert-banner alert-banner-danger" style={{ marginBottom: '14px' }}>
                    <AlertTriangle size={16} />
                    <span>{formErrors.submit}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Sensor Identifier / Label</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. North Ridge Multi-Axis Inclinometer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Sensor Type</label>
                    <select
                      className="form-control"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {SENSOR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Associated Mine</label>
                    <select
                      className="form-control"
                      value={formData.mineId}
                      onChange={(e) => setFormData({ ...formData, mineId: e.target.value })}
                    >
                      {mines.length === 0 && (
                        <option value="" disabled>No mines available</option>
                      )}
                      {mines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name || m.mineName} (#{m.id})
                        </option>
                      ))}
                    </select>
                    {formErrors.mineId && <div className="form-error">{formErrors.mineId}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Operational Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sampling Frequency</label>
                    <select
                      className="form-control"
                      value={formData.readingInterval}
                      onChange={(e) => setFormData({ ...formData, readingInterval: e.target.value })}
                    >
                      <option value="1s">1 second (High Res)</option>
                      <option value="5s">5 seconds (Standard)</option>
                      <option value="15s">15 seconds</option>
                      <option value="60s">1 minute</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Install Sensor' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {modalMode === 'delete' && selectedSensor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}>Confirm Deletion</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {formErrors.submit && (
                <div className="alert-banner alert-banner-danger" style={{ marginBottom: '14px' }}>
                  <AlertTriangle size={16} />
                  <span>{formErrors.submit}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#FEECEB',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Remove sensor {selectedSensor.name || selectedSensor.sensorName} (ID: #{selectedSensor.id})?
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Deleting this sensor will disconnect telemetry data streaming from {selectedSensor.mineName || `Mine #${selectedSensor.mineId}`}.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? 'Removing...' : 'Remove Sensor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
