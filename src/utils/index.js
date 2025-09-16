// Navigation Helper Functions
export const smoothScrollTo = (element, offset = 0) => {
  const elementPosition = element.offsetTop - offset;
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  });
};

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Page Transition Helper
export const handlePageTransition = (navigate, path, callback) => {
  document.body.style.opacity = '0.95';
  document.body.style.transition = 'opacity 0.2s ease';
  
  setTimeout(() => {
    navigate(path);
    scrollToTop();
    
    setTimeout(() => {
      document.body.style.opacity = '1';
      if (callback) callback();
    }, 100);
  }, 150);
};

// Animation Helpers
export const animateCounters = (targets, duration = 2000, callback) => {
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const result = {};
    Object.keys(targets).forEach(key => {
      result[key] = Math.floor(targets[key] * easeOut);
    });

    callback(result);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Form Validation Helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

// Local Storage Helpers
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error writing to localStorage:', error);
  }
};