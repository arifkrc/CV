import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import VerifyBasboussa from './VerifyBasboussa';

const ProtectedBasboussaRoute = ({ children }) => {
  const location = useLocation();
  const isVerified = sessionStorage.getItem('basboussaVerified') === 'true';

  if (!isVerified) {
    // Show verification inline for all devices
    return <VerifyBasboussa />;
  }

  return children;
};

export default ProtectedBasboussaRoute;