import apiClient from './api';

const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK !== 'false';

// Default mock accounts for demonstration
export const DEMO_ACCOUNTS = {
  admin: {
    id: 'USR-ADM-01',
    name: 'Dr. Rajesh Sharma',
    email: 'admin@rockfall.ai',
    role: 'ADMIN',
    department: 'Geotechnical Safety & Slope Engineering',
    createdDate: '2025-08-14',
    assignedMines: 'All Sites (Master Access)',
  },
  user: {
    id: 'USR-OPS-09',
    name: 'Priya Verma',
    email: 'operator@rockfall.ai',
    role: 'USER',
    department: 'Field Operations & Sensor Telemetry',
    createdDate: '2026-01-20',
    assignedMines: 'Aravalli Pit A, Singrauli Block 4',
  },
};

export const authService = {
  async login(email, password, rememberMe = true) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      // Basic mock check
      const isAdmin = email.toLowerCase().includes('admin');
      const mockUser = isAdmin ? DEMO_ACCOUNTS.admin : {
        ...DEMO_ACCOUNTS.user,
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      };

      const token = `mock_jwt_token_${Date.now()}`;
      if (rememberMe) {
        localStorage.setItem('rockfall_token', token);
        localStorage.setItem('rockfall_user', JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem('rockfall_token', token);
        sessionStorage.setItem('rockfall_user', JSON.stringify(mockUser));
      }

      return { user: mockUser, token };
    }

    const res = await apiClient.post('/auth/login', { email, password });
    const { token, user } = res.data;
    if (token) {
      localStorage.setItem('rockfall_token', token);
      localStorage.setItem('rockfall_user', JSON.stringify(user));
    }
    return res.data;
  },

  async register(data) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 350));
      const newUser = {
        id: `USR-REG-${Math.floor(Math.random() * 900 + 100)}`,
        name: data.name,
        email: data.email,
        role: data.role || 'USER',
        department: data.department || 'Mine Safety Operations',
        createdDate: new Date().toISOString().slice(0, 10),
        assignedMines: 'General Mining Fleet',
      };
      const token = `mock_jwt_token_${Date.now()}`;
      localStorage.setItem('rockfall_token', token);
      localStorage.setItem('rockfall_user', JSON.stringify(newUser));
      return { user: newUser, token };
    }

    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  getCurrentUser() {
    const userJson = localStorage.getItem('rockfall_user') || sessionStorage.getItem('rockfall_user');
    if (!userJson) {
      // Default to admin for seamless initial load if user visits directly
      const defaultUser = DEMO_ACCOUNTS.admin;
      localStorage.setItem('rockfall_user', JSON.stringify(defaultUser));
      localStorage.setItem('rockfall_token', 'demo_active_token');
      return defaultUser;
    }
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('rockfall_token');
    localStorage.removeItem('rockfall_user');
    sessionStorage.removeItem('rockfall_token');
    sessionStorage.removeItem('rockfall_user');
  },

  switchUserRole(targetRole) {
    const current = this.getCurrentUser();
    const updated = {
      ...current,
      role: targetRole,
      ...(targetRole === 'ADMIN' ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.user),
    };
    localStorage.setItem('rockfall_user', JSON.stringify(updated));
    return updated;
  },
};

export default authService;

