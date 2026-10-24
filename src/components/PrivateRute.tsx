import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  // Si no hay usuario autenticado, redirige a /login mediante Navigate
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};