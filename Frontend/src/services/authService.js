import apiClient from './api';

const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK === 'true';

// Default mock accounts for offline demonstration only
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

/**
 * Normalizes backend flat AuthResponse into frontend { token, user } contract.
 * Backend returns: { access_token, token_type, user_id, name, email, role, expires_in }
 */
export function normalizeAuthResponse(data) {
  if (!data) return null;

  const token = data.access_token || data.token;
  if (!token) return null;

  const role = data.role ? String(data.role).toUpperCase() : 'USER';
  const user = data.user || {
    id: data.user_id != null ? String(data.user_id) : (data.id != null ? String(data.id) : ''),
    userId: data.user_id ?? data.id,
    name: data.name || '',
    email: data.email || '',
    role,
    tokenType: data.token_type || 'Bearer',
  };

  return { token, user };
}

/**
 * Persists token and user based on rememberMe flag.
 */
function saveAuthSession(token, user, rememberMe) {
  if (rememberMe) {
    localStorage.setItem('rockfall_token', token);
    localStorage.setItem('rockfall_user', JSON.stringify(user));
    sessionStorage.removeItem('rockfall_token');
    sessionStorage.removeItem('rockfall_user');
  } else {
    sessionStorage.setItem('rockfall_token', token);
    sessionStorage.setItem('rockfall_user', JSON.stringify(user));
    localStorage.removeItem('rockfall_token');
    localStorage.removeItem('rockfall_user');
  }
}

export const authService = {
  async login(email, password, rememberMe = true) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const isAdmin = email.toLowerCase().includes('admin');
      const mockUser = isAdmin ? DEMO_ACCOUNTS.admin : {
        ...DEMO_ACCOUNTS.user,
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      };

      const token = `mock_jwt_token_${Date.now()}`;
      saveAuthSession(token, mockUser, rememberMe);
      return { user: mockUser, token };
    }

    const res = await apiClient.post('/auth/login', { email, password });
    const normalized = normalizeAuthResponse(res.data);
    if (!normalized || !normalized.token) {
      throw new Error('Authentication response did not contain a valid access token.');
    }

    saveAuthSession(normalized.token, normalized.user, rememberMe);
    return normalized;
  },

  async register(data, rememberMe = true) {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 350));
      const newUser = {
        id: `USR-REG-${Math.floor(Math.random() * 900 + 100)}`,
        name: data.name,
        email: data.email,
        role: 'USER', // Public registration is always standard USER
        department: data.department || 'Mine Safety Operations',
        createdDate: new Date().toISOString().slice(0, 10),
        assignedMines: 'General Mining Fleet',
      };
      const token = `mock_jwt_token_${Date.now()}`;
      saveAuthSession(token, newUser, rememberMe);
      return { user: newUser, token };
    }

    // Backend RegisterRequest expects: { name, email, password }
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    const res = await apiClient.post('/auth/register', payload);
    const normalized = normalizeAuthResponse(res.data);
    if (!normalized || !normalized.token) {
      throw new Error('Registration response did not contain a valid access token.');
    }

    saveAuthSession(normalized.token, normalized.user, rememberMe);
    return normalized;
  },

  getCurrentUser() {
    const userJson = localStorage.getItem('rockfall_user') || sessionStorage.getItem('rockfall_user');
    if (!userJson) {
      return null;
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
};

export default authService;
