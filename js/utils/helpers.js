// Recipe Finder - Utility Helper Functions

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Format cooking time for display
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
function formatCookingTime(minutes) {
  if (!minutes || minutes <= 0) return 'Unknown';
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
}

/**
 * Format serving count for display
 * @param {number} servings - Number of servings
 * @returns {string} Formatted serving string
 */
function formatServings(servings) {
  if (!servings || servings <= 0) return 'Unknown';
  return servings === 1 ? '1 person' : `${servings} people`;
}

/**
 * Format rating for display
 * @param {number} rating - Rating value
 * @param {number} maxRating - Maximum rating value (default: 5)
 * @returns {string} Formatted rating string
 */
function formatRating(rating, maxRating = 5) {
  if (!rating || rating <= 0) return 'No rating';
  const stars = '⭐'.repeat(Math.round(rating));
  return `${stars} ${rating.toFixed(1)}`;
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobile() {
  return window.innerWidth <= BREAKPOINTS.MOBILE;
}

/**
 * Check if device is tablet
 * @returns {boolean} True if tablet device
 */
function isTablet() {
  return window.innerWidth > BREAKPOINTS.MOBILE && window.innerWidth <= BREAKPOINTS.TABLET;
}

/**
 * Check if device is desktop
 * @returns {boolean} True if desktop device
 */
function isDesktop() {
  return window.innerWidth > BREAKPOINTS.TABLET;
}

/**
 * Get device type
 * @returns {string} Device type ('mobile', 'tablet', 'desktop')
 */
function getDeviceType() {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
}

/**
 * Smooth scroll to element
 * @param {string|Element} target - Target element or selector
 * @param {number} offset - Offset from top (default: 0)
 */
function scrollToElement(target, offset = 0) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

/**
 * Show element with animation
 * @param {Element} element - Element to show
 * @param {string} animationClass - Animation class to add
 */
function showElement(element, animationClass = 'fade-in') {
  if (!element) return;
  element.style.display = 'block';
  element.classList.remove(UI_CONSTANTS.CLASSES.HIDDEN);
  element.classList.add(UI_CONSTANTS.CLASSES.VISIBLE);
  if (animationClass) {
    element.classList.add(animationClass);
  }
}

/**
 * Hide element
 * @param {Element} element - Element to hide
 */
function hideElement(element) {
  if (!element) return;
  element.style.display = 'none';
  element.classList.add(UI_CONSTANTS.CLASSES.HIDDEN);
  element.classList.remove(UI_CONSTANTS.CLASSES.VISIBLE);
}

/**
 * Toggle element visibility
 * @param {Element} element - Element to toggle
 * @param {boolean} show - Force show/hide (optional)
 */
function toggleElement(element, show) {
  if (!element) return;
  const isVisible = !element.classList.contains(UI_CONSTANTS.CLASSES.HIDDEN);
  const shouldShow = show !== undefined ? show : !isVisible;
  
  if (shouldShow) {
    showElement(element);
  } else {
    hideElement(element);
  }
}

/**
 * Create DOM element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Element|Array} content - Element content
 * @returns {Element} Created element
 */
function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Set content
  if (typeof content === 'string') {
    element.innerHTML = content;
  } else if (content instanceof Element) {
    element.appendChild(content);
  } else if (Array.isArray(content)) {
    content.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        element.appendChild(child);
      }
    });
  }
  
  return element;
}

/**
 * Format ingredient list for display
 * @param {Array} ingredients - Array of ingredients
 * @param {number} maxDisplay - Maximum ingredients to display
 * @returns {string} Formatted ingredient string
 */
function formatIngredientList(ingredients, maxDisplay = 3) {
  if (!ingredients || ingredients.length === 0) return '';
  
  const displayIngredients = ingredients.slice(0, maxDisplay);
  let result = displayIngredients.join(', ');
  
  if (ingredients.length > maxDisplay) {
    const remaining = ingredients.length - maxDisplay;
    result += ` +${remaining} more`;
  }
  
  return result;
}

/**
 * Parse recipe instructions from various formats
 * @param {string|Array} instructions - Instructions in various formats
 * @returns {Array} Array of instruction steps
 */
function parseInstructions(instructions) {
  if (!instructions) return [];
  
  if (Array.isArray(instructions)) {
    return instructions.map((step, index) => ({
      number: index + 1,
      step: typeof step === 'string' ? step : step.step || step.instruction || ''
    }));
  }
  
  if (typeof instructions === 'string') {
    // Split by common delimiters
    const steps = instructions
      .split(/\d+\.\s*|\n\s*\n|\.\s*(?=[A-Z])/)
      .filter(step => step.trim().length > 0)
      .map(step => step.trim());
    
    return steps.map((step, index) => ({
      number: index + 1,
      step: step
    }));
  }
  
  return [];
}

/**
 * Handle image loading errors
 * @param {Element} img - Image element
 * @param {string} fallbackSrc - Fallback image source
 */
function handleImageError(img, fallbackSrc = null) {
  if (!img) return;
  
  img.onerror = function() {
    if (fallbackSrc && this.src !== fallbackSrc) {
      this.src = fallbackSrc;
    } else {
      // Create placeholder
      this.style.display = 'none';
      const placeholder = createElement('div', {
        className: 'image-placeholder',
        style: 'display: flex; align-items: center; justify-content: center; background: var(--color-accent); color: var(--color-text-secondary); font-size: 2rem;'
      }, '🍽️');
      this.parentNode.appendChild(placeholder);
    }
  };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type ('success', 'error', 'info')
 * @param {number} duration - Display duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = createElement('div', {
    className: `toast toast-${type}`,
    style: `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--color-surface);
      color: var(--color-text);
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `
  }, message);
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value or null
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 * @param {string} param - Parameter name
 * @param {string} value - Parameter value
 */
function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.replaceState({}, '', url);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    throttle,
    generateId,
    sanitizeHTML,
    formatCookingTime,
    formatServings,
    formatRating,
    capitalizeWords,
    truncateText,
    isMobile,
    isTablet,
    isDesktop,
    getDeviceType,
    scrollToElement,
    showElement,
    hideElement,
    toggleElement,
    createElement,
    formatIngredientList,
    parseInstructions,
    handleImageError,
    copyToClipboard,
    showToast,
    isValidEmail,
    getQueryParam,
    setQueryParam
  };
}