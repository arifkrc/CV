import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Scroll Progress Hook
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      
      setScrollProgress(scrollPercent);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const optimizedScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', optimizedScrollHandler);
    };
  }, []);

  return scrollProgress;
};

// Navigation Hook for smooth page transitions
export const usePageNavigation = () => {
  const navigate = useNavigate();

  const navigateWithTransition = (path) => {
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

  return navigateWithTransition;
};

// Page initialization hook (scroll to top)
export const usePageInit = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};