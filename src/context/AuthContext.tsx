import React, { createContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const defaultAuthState: ReturnType<typeof useAuth> = {
  user: null,
  loading: true,
  login: async () => {
    throw new Error('AuthContext not initialized');
  },
  register: async () => {
    throw new Error('AuthContext not initialized');
  },
  logout: async () => {
    throw new Error('AuthContext not initialized');
  }
};

export const AuthContext = createContext<ReturnType<typeof useAuth>>(defaultAuthState);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuth();
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
};