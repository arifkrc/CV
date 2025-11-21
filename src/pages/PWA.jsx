import React, { useEffect, useState } from 'react';
import { Code, Server, Database, Globe } from 'lucide-react';

const PWA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  const technologies = [
    {
      icon: <Code size={32} />,
      title: 'Frontend Development',
      description: 'React, JavaScript, HTML5, CSS3',
      skills: ['React 19', 'Vite', 'React Router', 'Responsive Design']
    },
    {
      icon: <Server size={32} />,
      title: 'Backend Development',
      description: '.NET, Entity Framework, API Development',
      skills: ['.NET 8', 'REST APIs', 'Entity Framework Core', 'SQL Server']
    },
    {
      icon: <Database size={32} />,
      title: 'Database & Data',
      description: 'SQL Server, Data Analysis, Optimization',
      skills: ['SQL Server', 'Database Design', 'Python', 'Data Analysis']
    },
    {
      icon: <Globe size={32} />,
      title: 'Web Technologies',
      description: 'Modern web development & deployment',
      skills: ['Git', 'GitHub', 'Responsive Design', 'Performance Optimization']
    }
  ];

  return (
    <div className="section">
      <div className="container">
        <h2 className={`section-title ${isVisible ? 'animate-fadeInUp' : ''}`}>
          Teknolojiler & Yetenekler
        </h2>
        
        <div className={`${isVisible ? 'animate-fadeInUp' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto 3rem auto',
            padding: '2rem',
            background: 'var(--background-light)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '1.1rem', 
              lineHeight: '1.8', 
              color: 'var(--text-light)',
              marginBottom: '1rem'
            }}>
              Endüstri mühendisliği bilgimi modern yazılım geliştirme teknolojileriyle 
              birleştirerek, verimli ve etkili çözümler üretiyorum.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {technologies.map((tech, index) => (
              <div
                key={index}
                className={`tech-card ${isVisible ? 'animate-fadeInUp' : ''}`}
                style={{
                  animationDelay: `${0.3 + index * 0.1}s`
                }}
              >
                <div style={{
                  color: 'var(--secondary-color)',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  {tech.icon}
                </div>
                <h3 style={{
                  color: 'var(--primary-color)',
                  marginBottom: '0.8rem',
                  fontSize: '1.3rem'
                }}>
                  {tech.title}
                </h3>
                <p style={{
                  color: 'var(--text-light)',
                  marginBottom: '1.5rem',
                  fontSize: '0.95rem'
                }}>
                  {tech.description}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center'
                }}>
                  {tech.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'var(--background-gray)',
                        color: 'var(--primary-color)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWA;
