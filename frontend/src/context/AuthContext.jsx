import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fiveStarUser');
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (data) => {
    setUser(data);
    localStorage.setItem('fiveStarUser', JSON.stringify(data));
  };

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    persist(data);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/api/auth/register', { name, email, password, phone });
    persist(data);
    return data;
  };

  const setupAdmin = async (name, email, password) => {
    const { data } = await api.post('/api/auth/setup-admin', { name, email, password });
    persist(data);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fiveStarUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setupAdmin, isAdmin: user?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
