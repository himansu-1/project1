// src/components/ProtectedRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, loading } = useSelector((state: { auth: { isAuthenticated: boolean; loading: boolean } }) => state.auth);

    if (loading) return <p>Loading...</p>;

    // const isAuthenticated = true;
    return isAuthenticated ? <WrappedComponent {...props} /> : <Navigate to="/login" />;
  };
};

export default ProtectedRoute;
