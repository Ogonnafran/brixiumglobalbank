
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin } = useAppContext();
  const location = useLocation();

  if (!currentUser) {
    // Not logged in, redirect to login page
    const redirectTo = adminOnly ? '/admin/login' : '/app/login';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Logged in as user but trying to access admin route
    return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
  }
  
  if (!adminOnly && isAdmin) {
    // Logged in as admin but trying to access user route (optional: redirect to admin dashboard or allow)
    // For this app, let's redirect admins trying to access user app to their dashboard.
    // return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
    // Or allow admin to view user app pages if that's a desired feature (e.g. for impersonation for support)
    // For now, let's keep it simple: if adminOnly is false, any logged in user (admin or regular) can access
  }

  return <>{children}</>;
};

export default ProtectedRoute;
    