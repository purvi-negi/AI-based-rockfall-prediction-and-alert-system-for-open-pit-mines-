import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mountain,
  Cpu,
  Activity,
  AlertTriangle,
  Bell,
  History,
  User,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  alertCount = 2,
}) {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/mines', label: 'Mine Management', icon: Mountain },
    { to: '/sensors', label: 'Sensor Management', icon: Cpu },
    { to: '/monitoring', label: 'Live Monitoring', icon: Activity },
    { to: '/prediction', label: 'Rockfall Prediction', icon: AlertTriangle },
    { to: '/alerts', label: 'Alert Management', icon: Bell, badge: alertCount },
    { to: '/history', label: 'Prediction History', icon: History },
    { to: '/profile', label: 'User Profile', icon: User },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth <= 992) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              <ShieldAlert size={22} />
            </div>
            {!isCollapsed && <span>ROCKFALL AI</span>}
          </div>

          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {!isCollapsed && (
            <div className="sidebar-section-title">Navigation Menu</div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <div className="sidebar-link-icon">
                  <Icon size={19} />
                </div>
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.badge > 0 && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Info */}
        {!isCollapsed && user && (
          <div className="sidebar-footer">
            <NavLink to="/profile" className="sidebar-user-card" onClick={handleLinkClick}>
              <div className="sidebar-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.role}</div>
              </div>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
