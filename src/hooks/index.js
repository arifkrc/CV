import { useState, useEffect } from 'react';

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

// Page Visibility Hook
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  return isVisible;
};

// Intersection Observer Hook
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [targetElement, setTargetElement] = useState(null);

  useEffect(() => {
    if (!targetElement) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
      ...options
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, observerOptions);

    observer.observe(targetElement);

    return () => observer.disconnect();
  }, [targetElement, options]);

  return [setTargetElement, isIntersecting];
};

// Local Storage Hook
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error setting localStorage:', error);
    }
  };

  return [storedValue, setValue];
};