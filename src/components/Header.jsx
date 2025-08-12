import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlignJustify, X, Moon, Sun } from 'lucide-react';
import './Header.css';

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
    // Smooth transition effect
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
