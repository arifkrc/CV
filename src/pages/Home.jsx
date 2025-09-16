import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({ years: 0, projects: 0, satisfaction: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Counter animation effect
  useEffect(() => {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
    
    setIsVisible(true);
    const timer = setTimeout(() => {
      animateCounters();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const animateCounters = () => {
    const targets = { years: 5, projects: 15, satisfaction: 100 };
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCounters({
        years: Math.floor(targets.years * easeOut),
        projects: Math.floor(targets.projects * easeOut),
        satisfaction: Math.floor(targets.satisfaction * easeOut)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };
  
  const handleNavigation = (path) => {
    // Smooth transition effect
    document.body.style.opacity = '0.95';
    document.body.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
      navigate(path);
      
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Restore opacity
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    }, 150);
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
                Merhaba,
              </span>
            
            </h1>
            <p 
              className={`subtitle ${isVisible ? 'animate-fadeInUp' : ''}`} 
              style={{ 
                animationDelay: '2s',
                opacity: 0
              }}
            >
              Endüstri Mühendisi & Yazılım Geliştirici
            </p>
            <p 
              className={`description ${isVisible ? 'animate-fadeInUp' : ''}`} 
              style={{ 
                animationDelay: '2.4s',
                opacity: 0
              }}
            >
              Modern teknolojiler kullanarak yaratıcı çözümler üreten, süreç optimizasyonu 
              ve yazılım geliştirme konularında deneyimli bir mühendisim. Projelerim hem 
              teknik hem de yaratıcı açıdan değer katmayı hedefler.
            </p>
            
            <div className={`stats-grid ${isVisible ? 'animate-fadeInUp' : ''}`} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              padding: '1.5rem 0',
              animationDelay: '2.4s',
              opacity: 0
            }}>
              <div style={{ textAlign: 'center' }} className="animate-pulse">
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: 'var(--secondary-color)' 
                }}>{counters.years}+</div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-light)' 
                }}>Yıl Deneyim</div>
              </div>
              <div style={{ textAlign: 'center' }} className="animate-pulse delay-100">
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: 'var(--secondary-color)' 
                }}>{counters.projects}+</div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-light)' 
                }}>Proje</div>
              </div>
              <div style={{ textAlign: 'center' }} className="animate-pulse delay-200">
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: 'var(--secondary-color)' 
                }}>{counters.satisfaction}%</div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-light)' 
                }}>Memnuniyet</div>
              </div>
            </div>
            <div className={`hero-buttons ${isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '2.4s', opacity: 0 }}>
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
          <div className={`hero-image ${isVisible ? 'animate-fadeInRight' : ''}`} style={{ animationDelay: '1.5s', opacity: 0 }}>
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80" 
              alt="arifk.co" 
              className="profile-image animate-float"
              style={{
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
