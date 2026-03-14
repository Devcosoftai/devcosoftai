import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#050a12',
        color: '#00dcff', fontFamily: 'Syne, sans-serif', fontSize: '1.1rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⟳</div>
          Authenticating...
        </div>
      </div>
    );
  }

  return admin ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
