import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MineManagement() {
  const { isAdmin } = useAuth();
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'view' | 'delete'
  const [selectedMine, setSelectedMine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    slopeAngle: '',
    benchHeight: '',
    operator: '',
    status: 'Active',
    riskRating: 'Moderate',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchMines = async () => {
    setLoading(true);
    try {
      const res = await apiService.getMines();
      setMines(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMines();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      location: '',
      slopeAngle: '',
      benchHeight: '15m',
      operator: 'National Mining Syndicate',
      status: 'Active',
      riskRating: 'Moderate',
    });
    setFormErrors({});
    setModalMode('add');
  };

  const handleOpenEdit = (mine) => {
    setSelectedMine(mine);
    setFormData({
      name: mine.name,
      location: mine.location,
      slopeAngle: mine.slopeAngle,
      benchHeight: mine.benchHeight || '15m',
      operator: mine.operator || 'National Mining Syndicate',
      status: mine.status,
      riskRating: mine.riskRating || 'Moderate',
    });
    setFormErrors({});
    setModalMode('edit');
  };

  const handleOpenView = (mine) => {
    setSelectedMine(mine);
    setModalMode('view');
  };

  const handleOpenDelete = (mine) => {
    setSelectedMine(mine);
    setModalMode('delete');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMine(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Mine name is required.';
    if (!formData.location.trim()) errs.location = 'Location details are required.';
    if (!formData.slopeAngle || isNaN(formData.slopeAngle)) {
      errs.slopeAngle = 'Valid slope angle in degrees is required.';
    } else if (formData.slopeAngle < 0 || formData.slopeAngle > 90) {
      errs.slopeAngle = 'Slope angle must be between 0° and 90°.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await apiService.createMine({
          ...formData,
          slopeAngle: parseFloat(formData.slopeAngle),
        });
        showNotification('New mine location successfully registered.');
      } else if (modalMode === 'edit') {
        await apiService.updateMine(selectedMine.id, {
          ...formData,
          slopeAngle: parseFloat(formData.slopeAngle),
        });
        showNotification('Mine configuration updated.');
      }
      closeModal();
      fetchMines();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMine) return;
    setSubmitting(true);
    try {
      await apiService.deleteMine(selectedMine.id);
      showNotification(`Mine ${selectedMine.id} deleted successfully.`);
      closeModal();
      fetchMines();
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

  // Filtered mines
  const filteredMines = mines.filter((mine) => {
    const matchesSearch =
      mine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mine.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mine.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || mine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Mine ID',
      accessor: 'id',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>,
    },
    {
      header: 'Mine Name',
      accessor: 'name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{row.operator}</div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} style={{ color: 'var(--primary)' }} />
          <span>{val}</span>
        </div>
      ),
    },
    {
      header: 'Slope Angle',
      accessor: 'slopeAngle',
      render: (val) => (
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          {val}°
        </span>
      ),
    },
    {
      header: 'Sensors',
      accessor: 'totalSensors',
      render: (val) => <span className="badge badge-neutral">{val ?? 0} active</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        let badgeClass = 'badge-neutral';
        if (val === 'Active') badgeClass = 'badge-safe';
        else if (val === 'Maintenance') badgeClass = 'badge-warning';
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
          <button
            className="btn-icon"
            onClick={() => handleOpenView(row)}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          {isAdmin && (
            <>
              <button
                className="btn-icon"
                onClick={() => handleOpenEdit(row)}
                title="Edit Mine"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="btn-icon"
                onClick={() => handleOpenDelete(row)}
                title="Delete Mine"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={16} />
              </button>
            </>
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
              placeholder="Search mine by name, location or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '150px', padding: '8px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isAdmin ? (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Mine</span>
          </button>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Admin role required to add or modify mine records.
          </span>
        )}
      </div>

      {/* MINES TABLE */}
      <div className="card-white">
        <DataTable
          columns={columns}
          data={filteredMines}
          loading={loading}
          pagination={true}
          pageSize={8}
          emptyMessage="No mine sites matching your search criteria."
        />
      </div>

      {/* ADD / EDIT MODAL */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Register New Mine Site' : `Edit Mine: ${selectedMine?.name}`}</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Mine Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aravalli Open Cast Pit B"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Geographic Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rajasthan, Sector 5 West"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  {formErrors.location && <div className="form-error">{formErrors.location}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Average Slope Angle (°)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="e.g. 45.0"
                      value={formData.slopeAngle}
                      onChange={(e) => setFormData({ ...formData, slopeAngle: e.target.value })}
                    />
                    {formErrors.slopeAngle && (
                      <div className="form-error">{formErrors.slopeAngle}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bench Height</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 15m"
                      value={formData.benchHeight}
                      onChange={(e) => setFormData({ ...formData, benchHeight: e.target.value })}
                    />
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
                    <label className="form-label">Operating Company</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.operator}
                      onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Create Mine' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {modalMode === 'view' && selectedMine && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mine Details: {selectedMine.name}</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mine ID</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedMine.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Location</span>
                  <span style={{ fontWeight: 600 }}>{selectedMine.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Operating Entity</span>
                  <span style={{ fontWeight: 600 }}>{selectedMine.operator || 'National Mining Corp'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Slope Angle</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedMine.slopeAngle}°</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Bench Height</span>
                  <span style={{ fontWeight: 600 }}>{selectedMine.benchHeight || '15m'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Sensors</span>
                  <span className="badge badge-primary">{selectedMine.totalSensors || 0} Telemetry Units</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Operational Status</span>
                  <span className="badge badge-safe">{selectedMine.status}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {modalMode === 'delete' && selectedMine && (
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
                    Are you sure you want to delete {selectedMine.name}?
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    This action will permanently remove mine configuration and all linked telemetry sensors.
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
                {submitting ? 'Deleting...' : 'Delete Mine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
