import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MineManagement from './pages/MineManagement';
import SensorManagement from './pages/SensorManagement';
import LiveMonitoring from './pages/LiveMonitoring';
import RockfallPrediction from './pages/RockfallPrediction';
import AlertManagement from './pages/AlertManagement';
import PredictionHistory from './pages/PredictionHistory';
import UserProfile from './pages/UserProfile';

// Authenticated Layout Shell
function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`main-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <Navbar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mines" element={<MineManagement />} />
            <Route path="/sensors" element={<SensorManagement />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/prediction" element={<RockfallPrediction />} />
            <Route path="/alerts" element={<AlertManagement />} />
            <Route path="/history" element={<PredictionHistory />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
