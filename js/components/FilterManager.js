// Recipe Finder - Filter Manager Component

class FilterManager {
  constructor() {
    this.cookingTimeElement = document.querySelector(UI_CONSTANTS.SELECTORS.COOKING_TIME);
    this.servingsElement = document.querySelector(UI_CONSTANTS.SELECTORS.SERVINGS);
    this.dietElement = document.querySelector(UI_CONSTANTS.SELECTORS.DIET);
    
    this.filters = {
      cookingTime: '',
      servings: APP_SETTINGS.DEFAULT_SERVINGS,
      diet: ''
    };
    
    this.listeners = new Map();
    this.isInitializing = true; // Flag to prevent events during initialization
    
    this.init();
  }
  
  init() {
    console.log('🔧 FilterManager init() called');
    this.setupEventListeners();
    console.log('🔧 FilterManager event listeners set up');
    this.loadUserPreferences();
    console.log('🔧 FilterManager user preferences loaded');
    this.isInitializing = false; // Initialization complete
    console.log('🔧 FilterManager initialization complete');
  }
  
  setupEventListeners() {
    // Cooking time filter
    if (this.cookingTimeElement) {
      this.cookingTimeElement.addEventListener('change', (event) => {
        this.updateFilter('cookingTime', event.target.value);
      });
    }
    
    // Servings filter
    if (this.servingsElement) {
      this.servingsElement.addEventListener('change', (event) => {
        this.updateFilter('servings', parseInt(event.target.value));
      });
    }
    
    // Diet filter
    if (this.dietElement) {
      this.dietElement.addEventListener('change', (event) => {
        this.updateFilter('diet', event.target.value);
      });
    }
  }
  
  updateFilter(filterType, value) {
    console.log('🔧 updateFilter called:', { filterType, value, isInitializing: this.isInitializing });
    
    const oldValue = this.filters[filterType];
    this.filters[filterType] = value;
    
    // Save to user preferences
    this.saveUserPreferences();
    
    // Only emit change event if not initializing
    if (!this.isInitializing) {
      console.log('🔧 Emitting filterChange event');
      this.emit('filterChange', {
        filterType,
        oldValue,
        newValue: value,
        allFilters: { ...this.filters }
      });
    } else {
      console.log('🔧 Skipping filterChange event (initializing)');
    }
    
    // Update UI if needed
    this.updateFilterUI(filterType, value);
  }
  
  updateFilterUI(filterType, value) {
    // Update visual indicators or additional UI elements
    switch (filterType) {
      case 'cookingTime':
        this.updateCookingTimeUI(value);
        break;
      case 'servings':
        this.updateServingsUI(value);
        break;
      case 'diet':
        this.updateDietUI(value);
        break;
    }
  }
  
  updateCookingTimeUI(value) {
    // Add visual feedback for cooking time selection
    if (this.cookingTimeElement) {
      const label = this.cookingTimeElement.previousElementSibling;
      if (label && value) {
        const option = this.cookingTimeElement.querySelector(`option[value="${value}"]`);
        if (option) {
          label.setAttribute('data-selected', option.textContent);
        }
      } else if (label) {
        label.removeAttribute('data-selected');
      }
    }
  }
  
  updateServingsUI(value) {
    // Add visual feedback for servings selection
    if (this.servingsElement) {
      const label = this.servingsElement.previousElementSibling;
      if (label) {
        const option = this.servingsElement.querySelector(`option[value="${value}"]`);
        if (option) {
          label.setAttribute('data-selected', option.textContent);
        }
      }
    }
  }
  
  updateDietUI(value) {
    // Add visual feedback for diet selection
    if (this.dietElement) {
      const label = this.dietElement.previousElementSibling;
      if (label && value) {
        const option = this.dietElement.querySelector(`option[value="${value}"]`);
        if (option) {
          label.setAttribute('data-selected', option.textContent);
        }
      } else if (label) {
        label.removeAttribute('data-selected');
      }
    }
  }
  
  getFilters() {
    return { ...this.filters };
  }
  
  getAPIFilters() {
    const apiFilters = {};
    
    // Convert cooking time to API format
    if (this.filters.cookingTime) {
      const timeValue = parseInt(this.filters.cookingTime);
      if (timeValue <= 60) {
        apiFilters.maxReadyTime = timeValue;
      } else {
        apiFilters.minReadyTime = 61;
      }
    }
    
    // Convert diet to API format
    if (this.filters.diet) {
      if (this.filters.diet.includes('-free')) {
        // Handle intolerances (gluten-free, dairy-free)
        apiFilters.intolerances = this.filters.diet.replace('-free', '');
      } else {
        // Handle diet types (vegetarian, vegan, ketogenic)
        apiFilters.diet = this.filters.diet;
      }
    }
    
    // Servings (used for scaling, not API filtering)
    apiFilters.servings = this.filters.servings;
    
    return apiFilters;
  }
  
  setFilter(filterType, value) {
    if (this.filters.hasOwnProperty(filterType)) {
      this.filters[filterType] = value;
      
      // Update UI element
      switch (filterType) {
        case 'cookingTime':
          if (this.cookingTimeElement) {
            this.cookingTimeElement.value = value;
          }
          break;
        case 'servings':
          if (this.servingsElement) {
            this.servingsElement.value = value;
          }
          break;
        case 'diet':
          if (this.dietElement) {
            this.dietElement.value = value;
          }
          break;
      }
      
      this.updateFilterUI(filterType, value);
      this.saveUserPreferences();
      
      // Only emit change event if not initializing
      if (!this.isInitializing) {
        this.emit('filterChange', {
          filterType,
          oldValue: this.filters[filterType],
          newValue: value,
          allFilters: { ...this.filters }
        });
      }
    }
  }
  
  setFilters(filters) {
    Object.entries(filters).forEach(([filterType, value]) => {
      this.setFilter(filterType, value);
    });
  }
  
  clearFilters() {
    const oldFilters = { ...this.filters };
    
    this.filters = {
      cookingTime: '',
      servings: APP_SETTINGS.DEFAULT_SERVINGS,
      diet: ''
    };
    
    // Update UI elements
    if (this.cookingTimeElement) {
      this.cookingTimeElement.value = '';
    }
    if (this.servingsElement) {
      this.servingsElement.value = APP_SETTINGS.DEFAULT_SERVINGS;
    }
    if (this.dietElement) {
      this.dietElement.value = '';
    }
    
    // Update UI feedback
    this.updateFilterUI('cookingTime', '');
    this.updateFilterUI('servings', APP_SETTINGS.DEFAULT_SERVINGS);
    this.updateFilterUI('diet', '');
    
    this.saveUserPreferences();
    
    this.emit('filtersCleared', {
      oldFilters,
      newFilters: { ...this.filters }
    });
  }
  
  hasActiveFilters() {
    return this.filters.cookingTime !== '' || 
           this.filters.diet !== '' || 
           this.filters.servings !== APP_SETTINGS.DEFAULT_SERVINGS;
  }
  
  getActiveFiltersCount() {
    let count = 0;
    if (this.filters.cookingTime) count++;
    if (this.filters.diet) count++;
    if (this.filters.servings !== APP_SETTINGS.DEFAULT_SERVINGS) count++;
    return count;
  }
  
  getActiveFiltersDescription() {
    const descriptions = [];
    
    if (this.filters.cookingTime) {
      const option = this.cookingTimeElement?.querySelector(`option[value="${this.filters.cookingTime}"]`);
      if (option) {
        descriptions.push(option.textContent);
      }
    }
    
    if (this.filters.diet) {
      const option = this.dietElement?.querySelector(`option[value="${this.filters.diet}"]`);
      if (option) {
        descriptions.push(option.textContent);
      }
    }
    
    if (this.filters.servings !== APP_SETTINGS.DEFAULT_SERVINGS) {
      descriptions.push(formatServings(this.filters.servings));
    }
    
    return descriptions;
  }
  
  validateFilters() {
    const errors = [];
    
    // Validate cooking time
    if (this.filters.cookingTime) {
      const timeValue = parseInt(this.filters.cookingTime);
      if (isNaN(timeValue) || timeValue < 0) {
        errors.push('Invalid cooking time');
      }
    }
    
    // Validate servings
    if (this.filters.servings) {
      const servingsValue = parseInt(this.filters.servings);
      if (isNaN(servingsValue) || servingsValue < 1 || servingsValue > 20) {
        errors.push('Servings must be between 1 and 20');
      }
    }
    
    // Validate diet
    if (this.filters.diet) {
      const validDiets = FILTER_OPTIONS.DIET.map(option => option.value).filter(v => v);
      if (!validDiets.includes(this.filters.diet)) {
        errors.push('Invalid diet selection');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  saveUserPreferences() {
    try {
      const preferences = {
        filters: this.filters,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }
  
  loadUserPreferences() {
    try {
      const preferencesString = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (preferencesString) {
        const preferences = JSON.parse(preferencesString);
        
        // Check if preferences are not too old (30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (preferences.timestamp && preferences.timestamp > thirtyDaysAgo) {
          if (preferences.filters) {
            // Only load non-default preferences
            Object.entries(preferences.filters).forEach(([key, value]) => {
              if (key === 'servings' && value !== APP_SETTINGS.DEFAULT_SERVINGS) {
                this.setFilterSilently(key, value);
              } else if (key !== 'servings' && value) {
                this.setFilterSilently(key, value);
              }
            });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }
  
  setFilterSilently(filterType, value) {
    if (this.filters.hasOwnProperty(filterType)) {
      this.filters[filterType] = value;
      
      // Update UI element
      switch (filterType) {
        case 'cookingTime':
          if (this.cookingTimeElement) {
            this.cookingTimeElement.value = value;
          }
          break;
        case 'servings':
          if (this.servingsElement) {
            this.servingsElement.value = value;
          }
          break;
        case 'diet':
          if (this.dietElement) {
            this.dietElement.value = value;
          }
          break;
      }
      
      this.updateFilterUI(filterType, value);
      // Note: Don't save preferences or emit events during silent loading
    }
  }
  
  exportFilters() {
    return {
      filters: { ...this.filters },
      activeCount: this.getActiveFiltersCount(),
      descriptions: this.getActiveFiltersDescription(),
      apiFilters: this.getAPIFilters()
    };
  }
  
  importFilters(filtersData) {
    if (filtersData && filtersData.filters) {
      this.setFilters(filtersData.filters);
    }
  }
  
  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    console.log('🔧 FilterManager emitting event:', event, data);
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
  
  destroy() {
    // Clean up event listeners
    this.listeners.clear();
    
    if (this.cookingTimeElement) {
      this.cookingTimeElement.removeEventListener('change', this.updateFilter);
    }
    if (this.servingsElement) {
      this.servingsElement.removeEventListener('change', this.updateFilter);
    }
    if (this.dietElement) {
      this.dietElement.removeEventListener('change', this.updateFilter);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterManager;
}