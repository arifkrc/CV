import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  const getGridColumns = () => {
    if (windowWidth <= 768) return '1fr';
    if (windowWidth <= 1024) return 'repeat(2, 1fr)';
    return 'repeat(3, 1fr)';
  };

  const skills = [
    { name: 'Süreç İyileştirme', icon: '⚙️' },
    { name: 'Proje Yönetimi', icon: '📋' },
    { name: 'Veri Analizi', icon: '📊' },
    { name: 'Yalın Üretim', icon: '🏭' },
    { name: 'React & JavaScript', icon: '⚛️' },
    { name: '.NET', icon: '🔷' },
    
  ];

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title animate-on-scroll">Hakkımda</h2>
        
        <div className="about-content" style={{ display: 'block' }}>
          <div className="about-text animate-on-scroll">
            <h3 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1.5rem', 
              color: 'var(--primary-color)',
              position: 'relative'
            }}>
              Endüstri Mühendisi & Problem Çözücü
              <span style={{
                position: 'absolute',
                bottom: '-8px',
                left: '0',
                width: '60px',
                height: '3px',
                background: 'var(--secondary-color)',
                borderRadius: '2px'
              }}></span>
            </h3>
            
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.7' }}>
              💡 Kompleks problemlere yenilikçi çözümler üretme konusunda tutkulu olup, verimlilik 
              artışı sağlayacak sistemler geliştirmeyi hedefliyorum. Modern teknolojileri 
              mühendislik prensipleriyle birleştirerek, sürdürülebilir ve etkili sonuçlar elde 
              etmeye odaklanıyorum.
            </p>
            
            <p style={{ marginBottom: '2rem', lineHeight: '1.7' }}>
              🚀 Sürekli öğrenme ve gelişim ilkesiyle hareket ederek, yazılım geliştirme 
              becerilerimi de geliştiriyorum. Bu sayede hem analitik hem de teknik 
              perspektiflerden değer katabiliyorum.
            </p>

            {/* Projects Link */}
            <div className="about-project-card">
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                🚀 Projelerimi İnceleyin
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                Geliştirdiğim projeler ve kullandığım teknolojileri keşfedin
              </p>
              <button 
                onClick={() => handleNavigation('/projects')}
                className="btn about-project-btn"
              >
                Projeleri Görüntüle
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="skills-grid skills-section animate-on-scroll">
              <h4 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '2rem', 
                color: 'var(--primary-color)',
                textAlign: 'left'
              }}>
                💡 Uzmanlık Alanlarım
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: getGridColumns(),
                gap: '1.5rem'
              }}>
                {skills.map((skill, index) => (
                  <div key={index} className="skill-item" style={{
                    background: 'var(--background-light)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      marginBottom: '1rem',
                      filter: 'grayscale(0%)',
                      transition: 'all 0.3s ease'
                    }}>
                      {skill.icon}
                    </div>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      color: 'var(--primary-color)',
                      margin: 0,
                      fontWeight: '600'
                    }}>
                      {skill.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
