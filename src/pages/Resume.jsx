import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, MapPin, Building2, GraduationCap, Award, Smartphone, Download, ChevronDown } from 'lucide-react';

const Resume = () => {
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef(null);

  useEffect(() => {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, entry.target.dataset.index]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const educationItems = document.querySelectorAll('.education-item');
    const certificateItems = document.querySelectorAll('.certificate-item');
    const experienceItems = document.querySelectorAll('.skill-item:not(.education-item):not(.certificate-item)');
    
    educationItems.forEach((item, index) => {
      item.dataset.index = `edu-${index}`;
      if (observerRef.current) {
        observerRef.current.observe(item);
      }
    });

    certificateItems.forEach((item, index) => {
      item.dataset.index = `cert-${index}`;
      if (observerRef.current) {
        observerRef.current.observe(item);
      }
    });

    // Deneyim kartlarını da observe et
    experienceItems.forEach((item, index) => {
      item.dataset.index = `exp-${index}`;
      if (observerRef.current) {
        observerRef.current.observe(item);
      }
    });

    return () => {
      if (observerRef.current) {
        [...educationItems, ...certificateItems, ...experienceItems].forEach(item => {
          observerRef.current.unobserve(item);
        });
      }
    };
  }, []);

  const handleExperienceClick = (id) => {
    setSelectedExperienceId(prev => (prev === id ? null : id));
  };

  const experiences = [
    {
      id: 'tt',
      title: 'BT Departmanı',
      company: 'Türk Telekom Genel Müdürlüğü\n(Stajyer)',
      period: '07-2019',
      location: 'Ankara',
      description: [
        'Kurumsal BT operasyonlarına destek sağladım',
        'Sistem izleme, olay yönetimi ve temel altyapı desteği',
        'Dokümantasyon ve prosedür güncellemelerine katkı sağladım'
      ]
    },
    {
      id: 'nc',
      title: 'Metot Birimi',
      company: 'NITROCARE\n(Stajyer)',
      period: '07-2024',
      location: 'Sivas',
      description: [
        'Üretim metotları ve iş talimatları üzerinde çalıştım',
        'Verimlilik iyileştirme ve proses standardizasyonu görevleri yürüttüm',
        'Saha verilerini toplayıp analiz ederek öneriler sundum'
      ]
    },
    {
      id: 'bg',
      title: 'Teknik Ekip\n(Stajyer)',
      company: 'BG Grup',
      period: '08-2024',
      location: 'Sivas',
      description: [
        'Birimler arası ilişkileri inceledim',
        'Firmadaki iş akış sürecine uygun teknolojileri araştırdım'
        
      ]
    },
    {
      id: 'ak',
      title: 'Planlama Birimi',
      company: 'Akış Asansör (FRENBU)',
      period: '07-2025',
      location: 'Konya',
      description: [
        'Süreç akışlarının takibi ve veri toplama faaliyetlerinde görev aldım',
        'Proje ve iş planlama dokümantasyonuna katkı sağladım',
        'Sahanın CANIAS ERP üzerinden senkronize bir şekilde yürütülmesi üzerine çalıştım'
      ]
    }
  ];

  // Helper: parse period string 'MM-YYYY' to Date for sorting
  const parsePeriod = (period) => {
    if (!period || typeof period !== 'string') return new Date(0);
    const parts = period.split('-');
    if (parts.length !== 2) return new Date(0);
    const month = parseInt(parts[0], 10) - 1; // zero-based
    const year = parseInt(parts[1], 10);
    if (Number.isNaN(month) || Number.isNaN(year)) return new Date(0);
    return new Date(year, month, 1);
  };

  // Render experiences sorted by most recent period first
  const sortedExperiences = [...experiences].sort((a, b) => parsePeriod(b.period) - parsePeriod(a.period));

  // If observer hasn't detected items (for example on initial mobile singlepage render),
  // make experience items visible by default so cards aren't hidden.
  useEffect(() => {
    setVisibleItems(prev => {
      if (prev && prev.size > 0) return prev;
      const initial = new Set(sortedExperiences.map((_, i) => `exp-${i}`));
      return initial;
    });
    // only run when the sortedExperiences list changes
  }, [sortedExperiences]);

  const education = [
    
    {
      degree: "Lisans",
      field: "Endüstri Mühendisliği",
      school: "Konya Teknik Üniversitesi",
      
    },
    {
      degree: "Önlisans",
      field: "Bilgisayar Programcılığı",
      school: "Hacettepe Üniversitesi",
    
    }
  ];

  // Small helper component to render details (keeps JSX simpler)
  const ExperienceDetails = ({ items }) => (
    <div className={`experience-details expanded animate-expand`} role="region" aria-hidden={false} style={{
      backgroundColor: 'var(--bg-light)',
      borderRadius: '8px',
      marginTop: '1rem',
      border: '1px solid var(--border-light)'
    }}>
      <h5 style={{
        color: 'var(--primary-color)',
        marginBottom: '0.75rem',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Award size={16} />
        Sorumluluklar:
      </h5>
      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-color)' }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{item}</li>
        ))}
      </ul>
    </div>
  );

  // Small card component for a single experience
  const ExperienceCard = ({ exp, isExpanded, onToggle, index }) => (
    <div
      key={exp.id}
      className={`skill-item ${visibleItems.has(`exp-${index}`) ? 'animate-slide-up' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={{
        opacity: visibleItems.has(`exp-${index}`) ? 1 : 0,
        transform: `${visibleItems.has(`exp-${index}`) ? 'translateY(0)' : 'translateY(30px)'} ${isExpanded ? 'scale(1.02)' : 'scale(1)'}`,
        transition: `all 0.6s ease ${index * 0.2}s`,
        cursor: 'pointer',
        border: isExpanded ? '2px solid var(--secondary-color)' : '1px solid var(--border-light)'
      }}
      onClick={() => onToggle(exp.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Building2 size={20} color="var(--secondary-color)" />
        <h4 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.2rem' }}>{exp.title}</h4>
        <div style={{ marginLeft: 'auto' }}>
          <ChevronDown className="chevron" size={18} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--secondary-color)', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{exp.company}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={14} color="var(--text-light)" />
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{exp.location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CalendarDays size={14} color="var(--text-light)" />
            <span style={{ color: 'var(--primary-color)', fontWeight: '500', backgroundColor: 'var(--bg-light)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>{exp.period}</span>
          </div>
        </div>
      </div>

      {isExpanded && <ExperienceDetails items={exp.description} />}
    </div>
  );

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Özgeçmiş</h2>
        {/* Note removed per user request */}
        
        {/* İş Deneyimleri */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '2rem', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <Building2 size={24} />
            Deneyimlerim
          </h3>
          
          <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {sortedExperiences.map((exp, index) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                index={index}
                isExpanded={selectedExperienceId === exp.id}
                onToggle={handleExperienceClick}
              />
            ))}
          </div>
        </div>

        {/* Eğitim */}
        <div>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '2rem', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <GraduationCap size={24} />
            Eğitim
          </h3>
          
          <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            {education.map((edu, index) => (
              <div 
                key={index} 
                className={`skill-item education-item ${
                  visibleItems.has(`edu-${index}`) ? 'animate-slide-up' : ''
                }`}
                style={{
                  opacity: visibleItems.has(`edu-${index}`) ? 1 : 0,
                  transform: visibleItems.has(`edu-${index}`) ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s ease ${index * 0.2}s`
                }}
              >
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {edu.degree}
                </h4>
                <p style={{ color: 'var(--secondary-color)', fontWeight: '500', marginBottom: '0.5rem' }}>
                  {edu.field}
                </p>
                <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                  {edu.school}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.9rem',
                  color: 'var(--text-light)'
                }}>
                  
                  
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sertifikalar & Projeler */}
        <div style={{ marginBottom: '4rem' }}>
          <br />
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '2rem', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Award size={24} />
            Sertifikalar & Ek Projeler
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem'
          }}>
            {/* Mobil Uygulamalar */}
            <div 
              className={`skill-item certificate-item ${
                visibleItems.has('cert-0') ? 'animate-slide-up' : ''
              }`}
              style={{ 
                position: 'relative',
                opacity: visibleItems.has('cert-0') ? 1 : 0,
                transform: visibleItems.has('cert-0') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s ease 0.1s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Smartphone size={20} color="var(--secondary-color)" />
                <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>Mobil Uygulama Geliştirme</h4>
              </div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                React Native kullanarak kişisel projeler geliştirdim
              </p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem'
              }}>
                <span style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem' 
                }}>
                  React Native
                </span>
                <span style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontSize: '0.75rem' 
                }}>
                  Expo
                </span>
              </div>
            </div>

            {/* Sertifikalar */}
            <div 
              className={`skill-item certificate-item ${
                visibleItems.has('cert-1') ? 'animate-slide-up' : ''
              }`}
              style={{
                opacity: visibleItems.has('cert-1') ? 1 : 0,
                transform: visibleItems.has('cert-1') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s ease 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={20} color="var(--accent-color)" />
                <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>Sertifikalar</h4>
              </div>
              <ul style={{ 
                color: 'var(--text-light)', 
                fontSize: '0.9rem',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '4px', background: 'var(--secondary-color)', borderRadius: '50%' }}></span>
                  React Development Sertifikası
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '4px', background: 'var(--secondary-color)', borderRadius: '50%' }}></span>
                  JavaScript ES6+ Sertifikası
                </li>
                <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '4px', background: 'var(--secondary-color)', borderRadius: '50%' }}></span>
                  Python Data Analysis
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '4px', background: 'var(--secondary-color)', borderRadius: '50%' }}></span>
                  Agile & Scrum Metodolojileri
                </li>
              </ul>
            </div>

            {/* Dil Becerileri */}
            <div 
              className={`skill-item certificate-item ${
                visibleItems.has('cert-2') ? 'animate-slide-up' : ''
              }`}
              style={{
                opacity: visibleItems.has('cert-2') ? 1 : 0,
                transform: visibleItems.has('cert-2') ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s ease 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <GraduationCap size={20} color="var(--secondary-color)" />
                <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>Dil Becerileri</h4>
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Türkçe</span>
                  <span style={{ color: 'var(--secondary-color)', fontWeight: '500' }}>Ana Dil</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>İngilizce</span>
                  <span style={{ color: 'var(--secondary-color)', fontWeight: '500' }}>İleri Seviye</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Almanca</span>
                  <span style={{ color: 'var(--text-light)', fontWeight: '500' }}>Başlangıç</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CV İndirme Butonu */}
        <div 
          className={`certificate-item ${
            visibleItems.has('cert-3') ? 'animate-slide-up' : ''
          }`}
          style={{
            textAlign: 'center', 
            marginTop: '3rem',
            opacity: visibleItems.has('cert-3') ? 1 : 0,
            transform: visibleItems.has('cert-3') ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease 0.4s'
          }}
        >
          <button 
            className="btn" 
            style={{ 
              fontSize: '1.1rem', 
              padding: '15px 40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            <Download size={20} />
            PDF Olarak İndir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;
