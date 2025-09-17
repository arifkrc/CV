import React, { useState, useEffect } from 'react';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { usePageNavigation, usePageInit } from '../hooks';

const Home = () => {
  const navigateWithTransition = usePageNavigation();
  usePageInit(); // Scroll to top on page load
  const [isVisible, setIsVisible] = useState(false);

  // Animation trigger
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const handleNavigation = (path) => {
    navigateWithTransition(path);
  };

  return (
    <div className="hero">
      <div className="container">
        <div className="hero-content">
          <div className={`hero-text ${isVisible ? 'animate-fadeInLeft' : ''}`} style={{ opacity: isVisible ? 1 : 0 }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span 
                className={`${isVisible ? 'animate-slide-left' : ''}`} 
                style={{ 
                  animationDelay: '0.5s',
                  opacity: 0
                }}
              >
                Merhaba
              </span>
            
            </h1>
            <p 
              className={`subtitle ${isVisible ? 'animate-fadeInUp' : ''}`} 
              style={{ 
                animationDelay: '2s',
                opacity: 0
              }}
            >
              Problem Çözücü & İnovatör
            </p>
            <p 
              className={`description ${isVisible ? 'animate-fadeInUp' : ''}`} 
              style={{ 
                animationDelay: '2.4s',
                opacity: 0
              }}
            >
              Endüstri mühendisliği bilgimi modern teknolojilerle harmanlayarak 
              iş süreçlerini optimize ediyor ve yaratıcı çözümler üretiyorum. 
              Analitik düşünce tarzım ile karmaşık problemleri basit, etkili 
              çözümlere dönüştürüyorum.
            </p>
            
            <div className={`hero-buttons ${isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '2.8s', opacity: 0 }}>
              <div 
                onClick={() => handleNavigation('/resume')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--secondary-color)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: '2px solid var(--secondary-color)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--secondary-color)';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--secondary-color)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <FolderOpen size={20} />
                Özgeçmişimi İncele
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
          <div className={`hero-visual ${isVisible ? 'animate-fadeInRight' : ''}`} style={{ animationDelay: '1.5s', opacity: 0 }}>
            <div className="visual-container">
              {/* Central Focus Element */}
              <div className="central-element">
                <div className="pulse-ring"></div>
                <div className="central-icon">
                  <span className="icon-text">arifk.</span>
                </div>
              </div>
              
              {/* Individual Orbital Cards - Each card has its own unique orbit */}
              <div className="individual-orbit orbit-1">
                <div className="floating-card orbital-card tech-card-1">
                  <div className="card-icon">💻</div>
                  <div className="card-text">Kodlama</div>
                </div>
              </div>
              
              <div className="individual-orbit orbit-2">
                <div className="floating-card orbital-card tech-card-2">
                  <div className="card-icon">⚙️</div>
                  <div className="card-text">Otomasyon</div>
                </div>
              </div>
              
              <div className="individual-orbit orbit-3">
                <div className="floating-card orbital-card tech-card-3">
                  <div className="card-icon">🔧</div>
                  <div className="card-text">Geliştirme</div>
                </div>
              </div>
              
              <div className="individual-orbit orbit-4">
                <div className="floating-card orbital-card card-1">
                  <div className="card-icon">🎯</div>
                  <div className="card-text">İnovasyon</div>
                </div>
              </div>
              
              <div className="individual-orbit orbit-5">
                <div className="floating-card orbital-card card-2">
                  <div className="card-icon">⚡</div>
                  <div className="card-text">Verimlilik</div>
                </div>
              </div>
              
              <div className="individual-orbit orbit-6">
                <div className="floating-card orbital-card card-3">
                  <div className="card-icon">🚀</div>
                  <div className="card-text">Gelişim</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
