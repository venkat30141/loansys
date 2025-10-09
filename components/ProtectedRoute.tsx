
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
