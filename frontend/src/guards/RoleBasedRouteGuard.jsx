import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const RoleBasedRouteGuard = ({ children, allowedRoles }) => {
  const { isLoggedIn, user, openLogin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      openLogin();
    }
  }, [isLoggedIn, openLogin]);

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleBasedRouteGuard;
