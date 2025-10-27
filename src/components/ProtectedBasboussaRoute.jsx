import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedBasboussaRoute = ({ children }) => {
  // Check if verification was successful (stored in session)
  const isVerified = sessionStorage.getItem('basboussaVerified') === 'true';

  if (!isVerified) {
    // Redirect to verification page if not verified
    return <Navigate to="/basboussa/verify" replace />;
  }

  return children;
};

export default ProtectedBasboussaRoute;