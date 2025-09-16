import React, { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { usePageNavigation, usePageInit } from '../hooks';

const About = () => {
  const navigateWithTransition = usePageNavigation();
  usePageInit(); // Scroll to top on page load

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          
          // Skills bar animation
          if (entry.target.classList.contains('skills-section')) {
            const skillBars = entry.target.querySelectorAll('.skill-progress');
            skillBars.forEach((bar, index) => {
              setTimeout(() => {
                bar.style.width = bar.dataset.level + '%';
              }, index * 200);
            });
          }
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
  
  const handleNavigation = (path) => {
    navigateWithTransition(path);
  };

  const skills = [
    { name: 'Süreç İyileştirme', level: 90 },
    { name: 'Proje Yönetimi', level: 85 },
    { name: 'Veri Analizi', level: 80 },
    { name: 'Yalın Üretim', level: 88 },
    { name: 'React & JavaScript', level: 75 },
    { name: 'Python', level: 70 }
  ];

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title animate-on-scroll">Hakkımda</h2>
        
        <div className="about-content">
          <div className="about-image animate-on-scroll">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=600&fit=crop&auto=format&q=80" 
              alt="Çalışma Alanı"
              style={{
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          </div>
          
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
              🎯 2017 yılında Endüstri Mühendisliği lisans eğitimimi tamamladıktan sonra, aynı alanda 
              yüksek lisans yaparak bilgi birikimimi derinleştirdim. Kariyerim boyunca süreç 
              optimizasyonu, proje yönetimi ve operasyon araştırması alanlarında uzmanlaştım.
            </p>
            
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
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '2rem',
              padding: '2rem',
              background: 'var(--background-gray)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            >
              <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                🚀 Projelerimi İnceleyin
              </h4>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                Geliştirdiğim projeler ve kullandığım teknolojileri keşfedin
              </p>
              <button 
                onClick={() => handleNavigation('/projects')}
                className="btn" 
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
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
                textAlign: 'center'
              }}>
                💡 Uzmanlık Alanlarım
              </h4>
              {skills.map((skill, index) => (
                <div key={index} className="skill-item" style={{
                  marginBottom: '1.5rem',
                  background: 'var(--background-light)',
                  padding: '1.2rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.8rem'
                  }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      color: 'var(--primary-color)',
                      margin: 0
                    }}>
                      {skill.name}
                    </h3>
                    <span style={{ 
                      color: 'var(--secondary-color)', 
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {skill.level}%
                    </span>
                  </div>
                  <div className="skill-progress" style={{
                    height: '6px',
                    background: 'var(--background-gray)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div
                      className="skill-progress"
                      data-level={skill.level}
                      style={{
                        height: '100%',
                        width: '0%',
                        background: `linear-gradient(90deg, var(--secondary-color), var(--primary-color))`,
                        borderRadius: '3px',
                        transition: 'width 1.5s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
