import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [token]);

  const loginSuccess = useCallback((data) => {
    // data = { token, user: { name, email, role } }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      const updated = {
        name:  res.data.name,
        email: res.data.email,
        role:  res.data.roleId?.roleName || user?.role,
        profilePicture: res.data.profilePicture,
      };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (_) {}
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isUser  = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, isUser, loginSuccess, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
