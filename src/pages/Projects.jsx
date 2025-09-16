import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Github, CalendarDays, Layers3, Globe, BarChart3, Zap } from 'lucide-react';

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
    
    setIsVisible(true);
    
    // Scroll animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
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

  const projects = [
    {
      id: 1,
      title: "E-Ticaret Platformu",
      description: "Modern React.js kullanarak geliştirdiğim responsive e-ticaret sitesi. Redux ile state yönetimi, Stripe ile ödeme entegrasyonu ve Firebase backend kullanıldı.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format&q=80",
      category: "web",
      technologies: ["React", "Redux", "Firebase", "Stripe", "Tailwind CSS"],
      liveUrl: "https://example-ecommerce.com",
      githubUrl: "https://github.com/arifkco/ecommerce-project",
      date: "2024-08",
      featured: true
    },
    {
      id: 2,
      title: "Veri Analizi Dashboard",
      description: "Python ve Pandas kullanarak geliştirdiğim kapsamlı veri analizi aracı. Matplotlib ve Seaborn ile görselleştirmeler, real-time data processing.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&auto=format&q=80",
      category: "data",
      technologies: ["Python", "Pandas", "Matplotlib", "Seaborn", "Jupyter"],
      liveUrl: "https://example-dashboard.com",
      githubUrl: "https://github.com/arifkco/data-dashboard",
      date: "2024-07",
      featured: false
    },
    {
      id: 3,
      title: "Mobil Fitness Uygulaması",
      description: "React Native ile geliştirdiğim cross-platform fitness uygulaması. Workout tracking, progress analytics ve sosyal özellikler içeriyor.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format&q=80",
      category: "mobile",
      technologies: ["React Native", "Expo", "Node.js", "MongoDB", "Socket.io"],
      liveUrl: "https://play.google.com/store/apps/details?id=com.example.fitness",
      githubUrl: "https://github.com/arifkco/fitness-app",
      date: "2024-06",
      featured: true
    },
    {
      id: 4,
      title: "Süreç Optimizasyon Aracı",
      description: "Endüstri mühendisliği uzmanlığımı kullanarak geliştirdiğim süreç analizi ve optimizasyon yazılımı. Python backend, React frontend.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format&q=80",
      category: "automation",
      technologies: ["Python", "React", "FastAPI", "PostgreSQL", "Docker"],
      liveUrl: "https://example-optimization.com",
      githubUrl: "https://github.com/arifkco/process-optimization",
      date: "2024-05",
      featured: false
    },
    {
      id: 5,
      title: "AI Chatbot Asistanı",
      description: "OpenAI GPT-4 API kullanarak geliştirdiğim akıllı chatbot. Natural language processing ve context awareness özellikleri.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&auto=format&q=80",
      category: "ai",
      technologies: ["Python", "OpenAI API", "Flask", "JavaScript", "WebSocket"],
      liveUrl: "https://example-chatbot.com",
      githubUrl: "https://github.com/arifkco/ai-chatbot",
      date: "2024-04",
      featured: true
    },
    {
      id: 6,
      title: "IoT Sensör Yönetimi",
      description: "Endüstriyel IoT sensörlerinin takibi ve yönetimi için geliştirdiğim sistem. Real-time monitoring ve alert sistemi.",
      image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=400&fit=crop&auto=format&q=80",
      category: "iot",
      technologies: ["Node.js", "React", "MQTT", "InfluxDB", "Grafana"],
      liveUrl: "https://example-iot.com",
      githubUrl: "https://github.com/arifkco/iot-management",
      date: "2024-03",
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'Tümü', icon: <Layers3 size={16} /> },
    { id: 'web', name: 'Web Dev', icon: <Globe size={16} /> },
    { id: 'mobile', name: 'Mobil', icon: <Smartphone size={16} /> },
    { id: 'data', name: 'Veri Analizi', icon: <BarChart3 size={16} /> },
    { id: 'ai', name: 'AI/ML', icon: <Brain size={16} /> },
    { id: 'automation', name: 'Otomasyon', icon: <Zap size={16} /> },
    { id: 'iot', name: 'IoT', icon: <Cpu size={16} /> }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <div className="section">
      <div className="container">
        <h2 className={`section-title ${isVisible ? 'animate-fadeInUp' : ''}`}>Projelerim</h2>
        
        {/* Featured Projects */}
        <div style={{ marginBottom: '4rem' }} className="animate-on-scroll">
          <h3 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '2rem', 
            color: 'var(--primary-color)',
            textAlign: 'center'
          }}>
            ⭐ Öne Çıkan Projeler
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {featuredProjects.map((project) => (
              <div key={project.id} className="project-card featured-project">
                <div className="project-image">
                  <img src={project.image} alt={project.title} />
                  <div className="project-overlay">
                    <div className="project-links">
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <ArrowUpRight size={20} />
                      </a>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                        <Github size={20} />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="project-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>{project.title}</h3>
                    <span style={{ 
                      background: 'var(--secondary-color)', 
                      color: 'white', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <CalendarDays size={12} />
                      {project.date}
                    </span>
                  </div>
                  
                  <p style={{ 
                    color: 'var(--text-light)', 
                    marginBottom: '1.5rem',
                    lineHeight: '1.6'
                  }}>
                    {project.description}
                  </p>
                  
                  <div className="project-technologies">
                    {project.technologies.map((tech, index) => (
                      <span key={index} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '0.8rem',
          padding: '0 1rem'
        }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '12px 24px',
                border: '2px solid var(--border-color)',
                borderRadius: '25px',
                background: selectedCategory === category.id ? 'var(--secondary-color)' : 'transparent',
                color: selectedCategory === category.id ? 'white' : 'var(--text-dark)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.borderColor = 'var(--secondary-color)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>

        {/* All Projects Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem'
        }}>
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  <div className="project-links">
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      <ArrowUpRight size={20} />
                    </a>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                      <Github size={20} />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="project-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>{project.title}</h3>
                  <span style={{ 
                    background: 'var(--background-gray)', 
                    color: 'var(--text-light)', 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <CalendarDays size={12} />
                    {project.date}
                  </span>
                </div>
                
                <p style={{ 
                  color: 'var(--text-light)', 
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  {project.description}
                </p>
                
                <div className="project-technologies">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
