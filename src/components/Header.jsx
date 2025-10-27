import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlignJustify, X, Moon, Sun } from 'lucide-react';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark-theme');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleNavigation = (path) => {
    // Always check verification for basboussa route
    if (path === '/basboussa') {
      if (sessionStorage.getItem('basboussaVerified') !== 'true') {
        if (window.innerWidth <= 768) {
          const verifySection = document.getElementById('basboussaverify');
          if (verifySection) {
            verifySection.style.display = 'flex';
            verifySection.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
            return;
          }
        }
        navigate('/basboussa/verify');
        return;
      }
    }

    // On small screens, scroll to section IDs instead of navigating routes
    if (window.innerWidth <= 768) {
      setIsMenuOpen(false);
      const id = path === '/' ? 'home' : path.replace(/^\//, '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // fallback to route navigation if section not present
        navigate(path);
      }
      return;
    }

    // Desktop: keep route transition behavior
    document.body.style.opacity = '0.95';
    document.body.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
      navigate(path);
      setIsMenuOpen(false);
      
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

  // Restore body styles on unmount
  useEffect(() => {
    return () => {
      document.body.style.opacity = '';
      document.body.style.transition = '';
    };
  }, []);

  return (
    <header className="header">
      <div className="container">
        <div className="nav-container">
          <button 
            onClick={() => handleNavigation('/')} 
            className="logo"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span>arifk.co</span>
          </button>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <button 
              className={`nav-link ${isActive('/')}`}
              onClick={() => handleNavigation('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Ana Sayfa
            </button>
            <button 
              className={`nav-link ${isActive('/about')}`}
              onClick={() => handleNavigation('/about')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Hakkımda
            </button>
            <button 
              className={`nav-link ${isActive('/resume')}`}
              onClick={() => handleNavigation('/resume')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Özgeçmiş
            </button>
            <button 
              className={`nav-link ${isActive('/projects')}`}
              onClick={() => handleNavigation('/projects')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Projeler
            </button>
            <button 
              className={`nav-link ${isActive('/contact')}`}
              onClick={() => handleNavigation('/contact')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              İletişim
            </button>
            <button 
              className={`nav-link ${isActive('/basboussa')}`}
              onClick={() => handleNavigation('/basboussa')}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: '#FFD700',
                fontWeight: isActive('/basboussa') ? '700' : '400',
                textShadow: isActive('/basboussa') ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
              }}
            >
              Basboussa
            </button>
          </nav>

          <div className="header-controls">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <AlignJustify size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
