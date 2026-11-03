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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sensorsRes, minesRes] = await Promise.all([
        apiService.getSensors(),
        apiService.getMines(),
      ]);
      setSensors(sensorsRes);
      setMines(minesRes);
    } catch (err) {
      console.error(err);
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
      mineId: mines[0]?.id || '',
      status: 'Active',
      readingInterval: '5s',
    });
    setFormErrors({});
    setModalMode('add');
  };

  const handleOpenEdit = (sensor) => {
    setSelectedSensor(sensor);
    setFormData({
      name: sensor.name,
      type: sensor.type,
      mineId: sensor.mineId,
      status: sensor.status,
      readingInterval: sensor.readingInterval || '5s',
    });
    setFormErrors({});
    setModalMode('edit');
  };

  const handleOpenDelete = (sensor) => {
    setSelectedSensor(sensor);
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSensor(null);
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
    try {
      const targetMine = mines.find((m) => m.id === formData.mineId);
      const payload = {
        ...formData,
        mineName: targetMine ? targetMine.name : 'Unassigned',
      };

      if (modalMode === 'add') {
        await apiService.createSensor(payload);
        showNotification('New geotechnical sensor successfully added.');
      } else if (modalMode === 'edit') {
        await apiService.updateSensor(selectedSensor.id, payload);
        showNotification('Sensor parameters updated.');
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSensor) return;
    setSubmitting(true);
    try {
      await apiService.deleteSensor(selectedSensor.id);
      showNotification(`Sensor ${selectedSensor.id} removed from network.`);
      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
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
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sensor.mineName && sensor.mineName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || sensor.type === typeFilter;
    const matchesMine = mineFilter === 'ALL' || sensor.mineId === mineFilter;
    return matchesSearch && matchesType && matchesMine;
  });

  const columns = [
    {
      header: 'Sensor ID',
      accessor: 'id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>,
    },
    {
      header: 'Sensor Name',
      accessor: 'name',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={15} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{val}</div>
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
      render: (val) => <span className="badge badge-primary">{val}</span>,
    },
    {
      header: 'Associated Mine',
      accessor: 'mineName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val || row.mineId}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.mineId}</div>
        </div>
      ),
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
                {m.name}
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
              <h3>{modalMode === 'add' ? 'Install New Sensor' : `Edit: ${selectedSensor?.name}`}</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                      {mines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
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
                    Remove sensor {selectedSensor.name}?
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Deleting this sensor will disconnect telemetry data streaming from {selectedSensor.mineName}.
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
