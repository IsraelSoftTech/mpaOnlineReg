import { Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdmissionContext } from './AdmissionContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AdmissionContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      // Store the attempted URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      navigate('/signin');
    } else {
      setIsAuthorized(true);
    }
  }, [currentUser, navigate, location]);

  // Only render children when authorized
  return isAuthorized ? children : null;
}; 