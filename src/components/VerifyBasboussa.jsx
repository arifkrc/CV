import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function VerifyBasboussa() {
  const [step, setStep] = useState(1);
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;

  const handleRealBasboussaVerification = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && answer.toLowerCase().trim() === 'balik') {
      sessionStorage.setItem('basboussaVerified', 'true');
      if (isMobile) {
        // For mobile, just set the session storage and let the parent component update
        window.location.hash = '#basboussa';
      } else {
        navigate('/basboussa');
      }
    } else {
      sessionStorage.removeItem('basboussaVerified');
      if (isMobile) {
        window.location.hash = '#home';
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(193, 39, 45, 0.95))',
        padding: '2rem',
        borderRadius: '20px',
        maxWidth: '90%',
        width: '400px',
        textAlign: 'center',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
        animation: 'popIn 0.5s ease-out',
        fontFamily: '"Inter", sans-serif'
      }}>
        {step === 1 ? (
          <>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Are you real Basboussa? 🤨
            </h2>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => handleRealBasboussaVerification()}
                style={{
                  padding: '0.8rem 2rem',
                  fontSize: '1.1rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#FFD700',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Yes
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.8rem 2rem',
                  fontSize: '1.1rem',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#C1272D',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Complete the sentence 🤔
            </h2>
            <div style={{ 
              color: 'white', 
              fontSize: '1.2rem', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span>Mr.</span>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="________"
                style={{
                  width: '100px',
                  padding: '0.5rem',
                  fontSize: '1.1rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 215, 0, 0.5)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center'
                }}
              />
              <span>sent me here</span>
            </div>
            <button
              onClick={handleRealBasboussaVerification}
              style={{
                padding: '0.8rem 2rem',
                fontSize: '1.1rem',
                border: 'none',
                borderRadius: '10px',
                background: '#FFD700',
                color: '#333',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Enter
            </button>
          </>
        )}
      </div>
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default VerifyBasboussa;