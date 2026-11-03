import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Shield,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout, switchRole, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Page Title and Breadcrumb from current path
  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return { title: 'Operational Dashboard', breadcrumb: 'Dashboard' };
      case '/mines':
        return { title: 'Mine Management', breadcrumb: 'Mines & Pits' };
      case '/sensors':
        return { title: 'Sensor Management', breadcrumb: 'Telemetry Sensors' };
      case '/monitoring':
        return { title: 'Live Telemetry Monitoring', breadcrumb: 'Live Monitoring' };
      case '/prediction':
        return { title: 'Rockfall ML Prediction', breadcrumb: 'AI Prediction' };
      case '/alerts':
        return { title: 'Geotechnical Alert Management', breadcrumb: 'Safety Alerts' };
      case '/history':
        return { title: 'Prediction Audit History', breadcrumb: 'Prediction History' };
      case '/profile':
        return { title: 'User Profile & Access', breadcrumb: 'User Account' };
      default:
        return { title: 'Rockfall Prediction System', breadcrumb: 'System' };
    }
  };

  const meta = getPageMeta(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleToggle = () => {
    const nextRole = isAdmin ? 'USER' : 'ADMIN';
    switchRole(nextRole);
  };

  const notifications = [
    {
      id: 1,
      title: 'CRITICAL ALERT: Kolar Deep Wall',
      desc: 'Ground tilt threshold exceeded (4.82°). Slope failure risk 88.4%.',
      time: '12 min ago',
      unread: true,
      path: '/alerts',
    },
    {
      id: 2,
      title: 'HIGH ALERT: Aravalli Pit A',
      desc: 'Pore pressure surge detected in North toe piezometer.',
      time: '45 min ago',
      unread: true,
      path: '/alerts',
    },
    {
      id: 3,
      title: 'Sensor Calibration Needed',
      desc: 'CM-4 Crack Meter reported intermittent reading frequency.',
      time: '3 hours ago',
      unread: false,
      path: '/sensors',
    },
  ];

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="page-title-wrap">
          <div className="breadcrumbs">
            <span>Rockfall AI</span>
            <span>/</span>
            <span>{meta.breadcrumb}</span>
          </div>
          <h1 className="page-title">{meta.title}</h1>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Search */}
        <div className="navbar-search">
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search mine, sensor, alert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Switcher Pill - Easy Demo presentation feature */}
        <button
          onClick={handleRoleToggle}
          className={`role-badge-pill ${isAdmin ? 'role-badge-admin' : 'role-badge-user'}`}
          title="Click to toggle between ADMIN and USER roles for presentation testing"
        >
          {isAdmin ? <ShieldCheck size={14} /> : <Shield size={14} />}
          <span>Role: {user?.role || 'ADMIN'}</span>
        </button>

        {/* Notification Bell */}
        <div className="user-menu-wrapper" ref={notifRef}>
          <button
            className="notification-bell-btn"
            onClick={() => setNotificationOpen(!notificationOpen)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            <span className="notification-badge" />
          </button>

          {notificationOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>System Notifications</span>
                <Link
                  to="/alerts"
                  onClick={() => setNotificationOpen(false)}
                  style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}
                >
                  View All Alerts
                </Link>
              </div>

              <div className="notification-list">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notification-item ${item.unread ? 'unread' : ''}`}
                    onClick={() => {
                      setNotificationOpen(false);
                      navigate(item.path);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ color: item.unread ? 'var(--danger)' : 'var(--warning)', marginTop: 2 }}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="notification-item-content">
                      <div className="notification-item-title">{item.title}</div>
                      <div className="notification-item-desc">{item.desc}</div>
                      <div className="notification-item-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button
            className="user-menu-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="User profile options"
          >
            <div className="user-avatar-small">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-menu-text d-none-sm">
              <div className="user-menu-name">{user?.name || 'Administrator'}</div>
              <div className="user-menu-sub">{user?.role || 'ADMIN'}</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {userMenuOpen && (
            <div className="dropdown-menu">
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {user?.email}
                </div>
              </div>

              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setUserMenuOpen(false)}
              >
                <User size={15} />
                <span>My Profile</span>
              </Link>

              <div className="dropdown-divider" />

              <button
                className="dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
