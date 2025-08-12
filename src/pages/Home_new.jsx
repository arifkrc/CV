import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({ years: 0, projects: 0, satisfaction: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Counter animation effect
  useEffect(() => {
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
          <div className={`hero-text ${isVisible ? 'animate-fadeInLeft' : ''}`}>
            <h1 className="typing-effect">Merhaba, Ben arifk.co</h1>
            <p className={`subtitle ${isVisible ? 'animate-fadeInUp delay-200' : ''}`}>
              Endüstri Mühendisi & Yazılım Geliştirici
            </p>
            <p className={`description ${isVisible ? 'animate-fadeInUp delay-300' : ''}`}>
              Modern teknolojiler kullanarak yaratıcı çözümler üreten, süreç optimizasyonu 
              ve yazılım geliştirme konularında deneyimli bir mühendisim. Projelerim hem 
              teknik hem de yaratıcı açıdan değer katmayı hedefler.
            </p>
            
            <div className={`stats-grid ${isVisible ? 'animate-fadeInUp delay-400' : ''}`} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              padding: '1.5rem 0'
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
            <div className={`hero-buttons ${isVisible ? 'animate-fadeInUp delay-500' : ''}`}>
              <button 
                onClick={() => handleNavigation('/contact')}
                className="btn animate-on-hover"
                style={{
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <MessageCircle size={20} />
                İletişime Geç
              </button>
              <button 
                onClick={() => handleNavigation('/projects')}
                className="btn btn-outline animate-on-hover"
                style={{
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Sparkles size={20} />
                Projelerimi Gör
              </button>
            </div>
          </div>
          <div className={`hero-image ${isVisible ? 'animate-fadeInRight delay-100' : ''}`}>
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
