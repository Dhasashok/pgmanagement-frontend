import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pg_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pg_auth_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('pg_auth_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Auth token validation failed:', err.message);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('pg_auth_token', res.token);
      localStorage.setItem('pg_auth_user', JSON.stringify(res.user));
      return res.user || res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'confirmPassword') {
        formData.append(key, value);
      }
    });
    const res = await api.post('/auth/register', formData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('pg_auth_token', res.token);
      localStorage.setItem('pg_auth_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pg_auth_token');
    localStorage.removeItem('pg_auth_user');
  };

  const quickDemoLogin = async (role = 'owner') => {
    if (role === 'owner') {
      return await login('owner@pgmaster.com', 'admin123');
    } else {
      return await login('rahul.patil@example.com', 'tenant123');
    }
  };

  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        isOwner,
        isTenant,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
