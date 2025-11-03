import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Resume from './pages/Resume';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import PWA from './pages/PWA';
import Utf from './pages/Utf';
import { useScrollProgress, useSectionScrollNav } from './hooks';
import './styles/App.css';

function PageTransition({ children }) {
  const location = useLocation();
  
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

function App() {
  const scrollProgress = useScrollProgress();
  const [isMobileSinglePage, setIsMobileSinglePage] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobileSinglePage(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleProgressBarClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickPercent = (clickX / progressBarWidth) * 100;
    
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollTop = (clickPercent / 100) * docHeight;
    
    window.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  return (
    <Router>
      {/* Router-scoped effects: run hooks that require react-router context here */}
      <RouteEffects />
      <div className="App">
        {/* Scroll Progress Bar */}
        <div 
          className="scroll-progress-container"
          onClick={handleProgressBarClick}
          style={{ cursor: 'pointer' }}
          title="Sayfada istediğiniz konuma gitmek için tıklayın"
        >
          <div 
            className="scroll-progress-bar"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
        
        <Header />
        <main>
          {isMobileSinglePage ? (
            <div className="mobile-singlepage" role="main">
              <section id="home" className="mobile-section"><Home /></section>
              <section id="about" className="mobile-section"><About /></section>
              <section id="resume" className="mobile-section"><Resume /></section>
              <section id="projects" className="mobile-section"><Projects /></section>
              <section id="contact" className="mobile-section"><Contact /></section>
              <section id="pwa" className="mobile-section"><PWA /></section>
              <section id="utf" className="mobile-section"><Utf /></section>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/resume" element={<PageTransition><Resume /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/pwa" element={<PageTransition><PWA /></PageTransition>} />
              <Route path="/utf" element={<PageTransition><Utf /></PageTransition>} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function RouteEffects() {
  // this component is rendered inside Router so useNavigate can be used safely
  useSectionScrollNav({ routes: ['/', '/about', '/resume', '/projects', '/contact', '/pwa', '/utf'] });
  return null;
}

export default App;
