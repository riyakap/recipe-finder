// Recipe Finder - Cache Manager

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.storageKey = STORAGE_KEYS.RECIPE_CACHE;
    this.maxMemoryItems = 50;
    this.defaultTTL = APP_SETTINGS.CACHE_DURATION;
  }
  
  /**
   * Set item in cache with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = this.defaultTTL) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    // Memory cache
    this.setMemoryCache(key, item);
    
    // Persistent cache (localStorage)
    this.setPersistentCache(key, item);
  }
  
  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if not found/expired
   */
  get(key) {
    // Check memory cache first (faster)
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }
    
    // Check persistent cache
    const persistentItem = this.getPersistentCache(key);
    if (persistentItem && this.isValid(persistentItem)) {
      // Restore to memory cache
      this.setMemoryCache(key, persistentItem);
      return persistentItem.data;
    }
    
    return null;
  }
  
  /**
   * Check if item exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} True if exists and valid
   */
  has(key) {
    return this.get(key) !== null;
  }
  
  /**
   * Remove item from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.memoryCache.delete(key);
    
    try {
      const cache = this.getStorageCache();
      delete cache[key];
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to delete from persistent cache:', error);
    }
  }
  
  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error);
    }
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let persistentSize = 0;
    let totalSize = 0;
    
    try {
      const cache = this.getStorageCache();
      persistentSize = Object.keys(cache).length;
      
      const cacheString = localStorage.getItem(this.storageKey) || '{}';
      totalSize = new Blob([cacheString]).size;
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }
    
    return {
      memoryItems: memorySize,
      persistentItems: persistentSize,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  }
  
  /**
   * Clean expired items from cache
   */
  cleanup() {
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clean persistent cache
    try {
      const cache = this.getStorageCache();
      const cleanedCache = {};
      
      for (const [key, item] of Object.entries(cache)) {
        if (this.isValid(item)) {
          cleanedCache[key] = item;
        }
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(cleanedCache));
    } catch (error) {
      console.warn('Failed to cleanup persistent cache:', error);
    }
  }
  
  /**
   * Generate cache key for recipe search
   * @param {Array} ingredients - Array of ingredients
   * @param {Object} filters - Filter options
   * @returns {string} Cache key
   */
  generateSearchKey(ingredients, filters) {
    const sortedIngredients = [...ingredients].sort();
    const filterString = JSON.stringify(filters);
    return `search:${sortedIngredients.join(',')}:${btoa(filterString)}`;
  }
  
  /**
   * Generate cache key for recipe details
   * @param {string|number} recipeId - Recipe ID
   * @returns {string} Cache key
   */
  generateRecipeKey(recipeId) {
    return `recipe:${recipeId}`;
  }
  
  // Private methods
  
  setMemoryCache(key, item) {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(key, item);
  }
  
  setPersistentCache(key, item) {
    try {
      const cache = this.getStorageCache();
      cache[key] = item;
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old cache');
        this.clearOldPersistentCache();
        // Try again after clearing
        try {
          const cache = this.getStorageCache();
          cache[key] = item;
          localStorage.setItem(this.storageKey, JSON.stringify(cache));
        } catch (retryError) {
          console.warn('Failed to save to persistent cache after cleanup:', retryError);
        }
      } else {
        console.warn('Failed to save to persistent cache:', error);
      }
    }
  }
  
  getPersistentCache(key) {
    try {
      const cache = this.getStorageCache();
      return cache[key] || null;
    } catch (error) {
      console.warn('Failed to read from persistent cache:', error);
      return null;
    }
  }
  
  getStorageCache() {
    try {
      const cacheString = localStorage.getItem(this.storageKey);
      return cacheString ? JSON.parse(cacheString) : {};
    } catch (error) {
      console.warn('Failed to parse cache from localStorage:', error);
      return {};
    }
  }
  
  isValid(item) {
    if (!item || typeof item !== 'object') return false;
    if (!item.timestamp || !item.ttl) return false;
    
    const now = Date.now();
    const expiryTime = item.timestamp + item.ttl;
    
    return now < expiryTime;
  }
  
  clearOldPersistentCache() {
    try {
      const cache = this.getStorageCache();
      const now = Date.now();
      const validCache = {};
      
      // Keep only items that are less than half expired
      for (const [key, item] of Object.entries(cache)) {
        if (item.timestamp && item.ttl) {
          const age = now - item.timestamp;
          const halfLife = item.ttl / 2;
          
          if (age < halfLife) {
            validCache[key] = item;
          }
        }
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(validCache));
    } catch (error) {
      console.warn('Failed to clear old persistent cache:', error);
      // If all else fails, clear everything
      try {
        localStorage.removeItem(this.storageKey);
      } catch (clearError) {
        console.error('Failed to clear cache completely:', clearError);
      }
    }
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Clean up cache periodically
    const cacheManager = new CacheManager();
    cacheManager.cleanup();
    
    // Set up periodic cleanup (every 5 minutes)
    setInterval(() => {
      cacheManager.cleanup();
    }, 5 * 60 * 1000);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CacheManager;
}