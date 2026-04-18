import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, openLogin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      openLogin();
    }
  }, [isLoggedIn, openLogin]);

  if (!isLoggedIn) {
    // Redirect to home while the modal is triggered
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
