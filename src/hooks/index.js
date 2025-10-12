import { useState, useEffect, useRef } from 'react';
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

// Mobile section scroll navigation
export const useSectionScrollNav = (opts = {}) => {
  const { thresholdPx = 120, cooldownMs = 900, routes = ['/', '/about', '/resume', '/projects', '/contact', '/utf'], enabled = true } = opts;
  const navigate = useNavigate();

  useEffect(() => {
    const routesRef = { current: routes };
    if (typeof window === 'undefined') return;

    let lastNav = 0;

    const onScroll = () => {
  // only active on mobile sized viewports and when enabled
  if (!enabled || window.innerWidth > 768) return;

      const now = Date.now();
      if (now - lastNav < cooldownMs) return;

      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const remaining = document.documentElement.scrollHeight - (scrollTop + viewport);

      const currentPath = window.location.pathname || '/';
      const idx = routes.indexOf(currentPath);

      // if near bottom and not last route -> go next
      if (remaining <= thresholdPx && idx >= 0 && idx < routes.length - 1) {
        lastNav = now;
        navigate(routes[idx + 1]);
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      // if near top and not first route -> go previous
      if (scrollTop <= thresholdPx && idx > 0) {
        lastNav = now;
        navigate(routes[idx - 1]);
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }
    };

  window.addEventListener('scroll', onScroll, { passive: true });
  // also listen to touchend to catch swipe-like behavior
  window.addEventListener('touchend', onScroll, { passive: true });

    // cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchend', onScroll);
    };
  }, [thresholdPx, cooldownMs, navigate, routes, enabled]);
};