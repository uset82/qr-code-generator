import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ requireTeacher = false }) {
  const { user, loading, isTeacher } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Check if route requires teacher role and user is not a teacher
  if (requireTeacher && !isTeacher) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated (and meets teacher requirement if needed), render child routes
  return <Outlet />;
} 