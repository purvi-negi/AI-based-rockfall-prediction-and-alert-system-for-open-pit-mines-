import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Key,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* PROFILE HEADER CARD */}
      <div
        className="card-white"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '24px',
          padding: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: '32px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid var(--primary-light)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </h2>
            <span
              className={`badge ${isAdmin ? 'badge-primary' : 'badge-neutral'}`}
              style={{ fontSize: '13px', padding: '4px 10px' }}
            >
              {user?.role || 'USER'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Mail size={14} /> {user?.email || 'No email registered'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={14} /> Role: {user?.role || 'USER'}
            </span>
          </div>
        </div>

        <div>
          <button className="btn btn-outline" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ACCOUNT DETAILS & ROLE PERMISSIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Account Details */}
        <div className="card-white">
          <div className="card-header">
            <h3 className="card-title">
              <User size={18} style={{ color: 'var(--primary)' }} />
              <span>Identity & Account Credentials</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>System User ID</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{user?.id || user?.userId || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Full Legal Name</span>
              <span style={{ fontWeight: 600 }}>{user?.name || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email Address</span>
              <span style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>System Role</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {user?.role || 'USER'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Session Security</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontWeight: 600 }}>
                <Key size={13} /> Active JWT Session
              </span>
            </div>
          </div>
        </div>

        {/* Role Permissions & Interactive Demo Switcher */}
        <div className="card-white">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              <span>Role-Based Access Control</span>
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Current System Role: <strong style={{ color: 'var(--text-primary)' }}>{user?.role || 'USER'}</strong>. Permissions are strictly enforced by the backend API Gateway:
          </p>

          <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
              <span>Dashboard & Real-time Live Monitoring View</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
              <span>Rockfall ML Prediction Pipeline Execution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2
                size={15}
                style={{ color: isAdmin ? 'var(--success)' : 'var(--text-secondary)' }}
              />
              <span style={{ color: isAdmin ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                Mine & Sensor Full CRUD (Create, Edit, Delete): {isAdmin ? 'Enabled' : 'Restricted (Admin only)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2
                size={15}
                style={{ color: isAdmin ? 'var(--success)' : 'var(--text-secondary)' }}
              />
              <span style={{ color: isAdmin ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                Geotechnical Alert Acknowledge & Resolve: {isAdmin ? 'Enabled' : 'Restricted (Admin only)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
