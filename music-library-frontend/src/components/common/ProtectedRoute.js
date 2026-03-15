import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 * - requireAuth  → redirect to /login if not authenticated
 * - adminOnly    → redirect to /home if not admin
 * - userOnly     → redirect to /admin if not user (admin trying user pages)
 */
const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  if (userOnly && user.role !== 'user') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
