import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('daytrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('daytrack_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('daytrack_user', JSON.stringify(res.user));
          }
        } catch (err) {
          if (err?.status === 401) {
            console.warn('Session expired or invalid, logging out.');
            api.logout();
            setUser(null);
          } else {
            console.warn('Network issue verifying session with server, retaining cached session:', err.message);
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('daytrack_user');
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('daytrack_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('daytrack_user', JSON.stringify(res.user));
    }
    return res;
  };

  const seedDemoLogin = async () => {
    const res = await api.seedDemo();
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('daytrack_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateSettings = async (settings) => {
    const res = await api.updateSettings(settings);
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('daytrack_user', JSON.stringify(res.user));
    }
    return res.user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      seedDemoLogin,
      logout,
      updateSettings,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
