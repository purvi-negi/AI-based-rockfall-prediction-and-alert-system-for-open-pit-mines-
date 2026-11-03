import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
export { useAuth } from './useAuth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial user from active storage
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password, rememberMe);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, rememberMe = true) => {
    setLoading(true);
    try {
      const response = await authService.register(userData, rememberMe);
      setUser(response.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
