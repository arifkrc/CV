import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// PWA Installation Hook
export { usePWAInstall } from './usePWAInstall';

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
  const { thresholdPx = 80, cooldownMs = 600, routes = ['/', '/about', '/resume', '/projects', '/contact', '/pwa', '/utf'], enabled = true } = opts;
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return;

    let lastNav = 0;
    let isMobile = window.innerWidth <= 768;

    // Update mobile detection on resize
    const handleResize = () => {
      isMobile = window.innerWidth <= 768;
    };

    const onScroll = () => {
      // Only active on mobile sized viewports
      if (!isMobile) return;

      const now = Date.now();
      if (now - lastNav < cooldownMs) return;

      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const remaining = docHeight - (scrollTop + viewport);

      const currentPath = window.location.pathname || '/';
      const idx = routes.indexOf(currentPath);

      // Debug logging (remove in production)
      console.log('Scroll Navigation Debug:', {
        currentPath,
        idx,
        scrollTop,
        remaining,
        thresholdPx,
        routes,
        docHeight,
        viewport
      });

      // If near bottom and not last route -> go next
      if (remaining <= thresholdPx && idx >= 0 && idx < routes.length - 1) {
        lastNav = now;
        console.log('Navigating to next:', routes[idx + 1]);
        navigate(routes[idx + 1]);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, 50);
        return;
      }

      // If near top and not first route -> go previous
      if (scrollTop <= thresholdPx && idx > 0) {
        lastNav = now;
        console.log('Navigating to previous:', routes[idx - 1]);
        navigate(routes[idx - 1]);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, 50);
        return;
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('touchend', throttledScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('touchend', throttledScroll);
    };
  }, [thresholdPx, cooldownMs, navigate, routes, enabled]);
};