import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, MapPin, Building2, GraduationCap, Award, Smartphone, Download } from 'lucide-react';

const Resume = () => {
  const [selectedExperience, setSelectedExperience] = useState(null);
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
    const timelineItems = document.querySelectorAll('.timeline-node');
    const educationItems = document.querySelectorAll('.education-item');
    const certificateItems = document.querySelectorAll('.certificate-item');
    const experienceItems = document.querySelectorAll('.skill-item:not(.education-item):not(.certificate-item)');
    
    timelineItems.forEach((item, index) => {
      item.dataset.index = index;
      if (observerRef.current) {
        observerRef.current.observe(item);
      }
    });

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
        [...timelineItems, ...educationItems, ...certificateItems, ...experienceItems].forEach(item => {
          observerRef.current.unobserve(item);
        });
      }
    };
  }, []);

  const handleExperienceClick = (index) => {
    setSelectedExperience(selectedExperience === index ? null : index);
  };

  const experiences = [
    {
      id: 't01',
      title: "Kıdemli Endüstri Mühendisi",
      company: "İmalat Şirketi",
      period: "2021 - Günümüz",
      location: "İstanbul",
      position: { x: 50, y: 85, pathProgress: 0.05 }, // Start/Finish area
      description: [
        "Süreçleri optimize ederek %20 verimlilik artışı sağladım",
        "Kalite kontrol prosedürlerini geliştirdim",
        "Proje yönetimi ve ekip liderliği yaptım",
        "Lean Manufacturing metodolojilerini uyguladım"
      ]
    },
    {
      id: 't03',
      title: "Endüstri Mühendisi",
      company: "XYZ Corporation",
      period: "2019 - 2021",
      location: "Ankara",
      position: { x: 12, y: 45, pathProgress: 0.25 }, // Turn 3 area
      description: [
        "Operasyonel süreçleri analiz ettim ve iyileştirdim",
        "Risk analizleri gerçekleştirdim",
        "Üretim planlaması ve envanter yönetimi",
        "ERP sistemlerinin implementasyonunda rol aldım"
      ]
    },
    {
      id: 't09',
      title: "Yazılım Geliştirici",
      company: "Tech Solutions Ltd.",
      period: "2018 - 2019",
      location: "İstanbul",
      position: { x: 75, y: 12, pathProgress: 0.55 }, // Turn 9 area
      description: [
        "React ve Node.js ile web uygulamaları geliştirdim",
        "RESTful API tasarımı ve implementasyonu",
        "Agile metodolojiler ile proje yönetimi",
        "Code review ve mentoring süreçlerinde aktif rol aldım"
      ]
    },
    {
      id: 't13',
      title: "Stajyer Mühendis",
      company: "Endüstri Firması A.Ş.",
      period: "2017 - 2018",
      location: "Bursa",
      position: { x: 80, y: 65, pathProgress: 0.75 }, // Turn 13 area
      description: [
        "Üretim hatlarında veri toplama ve analiz",
        "Kalite kontrol prosedürlerini öğrendim",
        "AutoCAD ile teknik çizimler hazırladım",
        "İş güvenliği eğitimleri aldım"
      ]
    },
    {
      id: 't16',
      title: "Part-time Yazılım Geliştirici",
      company: "Startup Teknoloji",
      period: "2016 - 2017",
      location: "İstanbul",
      position: { x: 40, y: 82, pathProgress: 0.95 }, // Turn 16 area
      description: [
        "Mobile uygulama geliştirme projelerinde yer aldım",
        "JavaScript ve Python ile küçük projeler geliştirdim",
        "Veritabanı tasarımı ve optimizasyonu",
        "Müşteri geri bildirimlerini analiz ettim"
      ]
    }
  ];

  const education = [
    {
      degree: "Yüksek Lisans",
      field: "Endüstri Mühendisliği",
      school: "Teknik Üniversite",
      period: "2017 - 2019",
      gpa: "3.7/4.0"
    },
    {
      degree: "Lisans",
      field: "Endüstri Mühendisliği",
      school: "Devlet Üniversitesi",
      period: "2013 - 2017",
      gpa: "3.5/4.0"
    },
    {
      degree: "Lise",
      field: "Fen Bilimleri",
      school: "Anadolu Lisesi",
      period: "2009 - 2013",
      gpa: "4.2/5.0"
    }
  ];

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Özgeçmiş</h2>
        
        {/* İş Deneyimi Timeline */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ 
            fontSize: '2rem', 
            marginBottom: '3rem', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <Building2 size={24} />
            İş Deneyimlerim
          </h3>
          
          {/* Timeline Container */}
          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {experiences.map((exp, index) => (
              <div 
                key={index}
                className={`timeline-item ${visibleItems.has(index.toString()) ? 'animate-timeline-item' : ''}`}
                style={{
                  '--delay': `${index * 0.2}s`
                }}
                onClick={() => handleExperienceClick(index)}
              >
                <div className="timeline-dot">
                  <span className="timeline-year">{exp.period.split(' - ')[0]}</span>
                </div>
                
                <div className={`timeline-content ${selectedExperience === index ? 'expanded' : ''}`}>
                  <div className="timeline-header">
                    <h4>{exp.title}</h4>
                    <div className="company-info">
                      <span className="company-name">{exp.company}</span>
                      <span className="location">
                        <MapPin size={14} />
                        {exp.location}
                      </span>
                    </div>
                    <span className="period-badge">{exp.period}</span>
                  </div>
                  
                  {selectedExperience === index && (
                    <div className="timeline-details">
                      <h5>Sorumluluklar & Başarılar:</h5>
                      <ul>
                        {exp.description.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* İş Deneyimi Kartları */}
        <div style={{ marginBottom: '4rem' }}>
          <h3 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '2rem', 
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <Building2 size={20} />
            Detaylı İş Deneyimleri
          </h3>
          
          <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {experiences.map((exp, index) => (
              <div 
                key={index}
                className={`skill-item ${
                  visibleItems.has(`exp-${index}`) ? 'animate-slide-up' : ''
                }`}
                style={{
                  opacity: visibleItems.has(`exp-${index}`) ? 1 : 0,
                  transform: `${visibleItems.has(`exp-${index}`) ? 'translateY(0)' : 'translateY(30px)'} ${selectedExperience === index ? 'scale(1.02)' : 'scale(1)'}`,
                  transition: `all 0.6s ease ${index * 0.2}s`,
                  cursor: 'pointer',
                  border: selectedExperience === index ? '2px solid var(--secondary-color)' : '1px solid var(--border-light)'
                }}
                onClick={() => handleExperienceClick(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Building2 size={20} color="var(--secondary-color)" />
                  <h4 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '1.2rem' }}>
                    {exp.title}
                  </h4>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ 
                    color: 'var(--secondary-color)', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    {exp.company}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} color="var(--text-light)" />
                      <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {exp.location}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarDays size={14} color="var(--text-light)" />
                      <span style={{ 
                        color: 'var(--primary-color)', 
                        fontWeight: '500',
                        backgroundColor: 'var(--bg-light)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem'
                      }}>
                        {exp.period}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedExperience === index && (
                  <div style={{
                    backgroundColor: 'var(--bg-light)',
                    padding: '1rem',
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
                      Sorumluluklar & Başarılar:
                    </h5>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '1.5rem',
                      color: 'var(--text-color)'
                    }}>
                      {exp.description.map((item, i) => (
                        <li key={i} style={{ 
                          marginBottom: '0.5rem',
                          lineHeight: '1.4'
                        }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CalendarDays size={14} />
                    {edu.period}
                  </span>
                  <span>GPA: {edu.gpa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sertifikalar & Projeler */}
        <div style={{ marginBottom: '4rem' }}>
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
