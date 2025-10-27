import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import VerifyBasboussa from './VerifyBasboussa';

const ProtectedBasboussaRoute = ({ children }) => {
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;
  const isVerified = sessionStorage.getItem('basboussaVerified') === 'true';

  if (!isVerified) {
    // For mobile view, show verification component inline
    if (isMobile) {
      return <VerifyBasboussa />;
    }
    // For desktop view, redirect to appropriate verification page
    const verifyPath = location.pathname === '/threejs' ? '/threejs/verify' : '/basboussa/verify';
    return <Navigate to={verifyPath} replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedBasboussaRoute;