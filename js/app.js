// Recipe Finder - Main Application

class RecipeFinderApp {
  constructor() {
    this.ingredientInput = null;
    this.filterManager = null;
    this.recipeAPI = null;
    this.recipeModal = null;
    this.cacheManager = null;
    
    this.currentRecipes = [];
    this.currentSearchIngredients = [];
    this.isSearching = false;
    this.hasPerformedSearch = false; // Track if user has actually searched
    
    // DOM elements
    this.searchBtn = null;
    this.resultsSection = null;
    this.resultsGrid = null;
    this.resultsHeader = null;
    this.noResultsElement = null;
    this.errorStateElement = null;
    this.loadingOverlay = null;
    
    // Add debug flag
    this.debug = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    
    this.init();
  }
  
  async init() {
    try {
      console.log('🍳 Initializing Recipe Finder App...');
      
      // Initialize DOM elements
      this.initializeDOMElements();
      console.log('✅ DOM elements initialized');
      
      // Initialize services
      this.initializeServices();
      console.log('✅ Services initialized');
      
      // Initialize components
      await this.initializeComponents();
      console.log('✅ Components initialized');
      
      // Set up event listeners
      this.setupEventListeners();
      console.log('✅ Event listeners set up');
      
      // Check for API key and show warning if missing
      this.checkAPIConfiguration();
      
      // Load any saved state
      this.loadApplicationState();
      
      // Initial UI state
      this.updateSearchButtonState();
      
      console.log('✅ Recipe Finder App initialized successfully');
      console.log('🔍 Current state after init:', {
        hasPerformedSearch: this.hasPerformedSearch,
        isSearching: this.isSearching,
        currentSearchIngredients: this.currentSearchIngredients,
        currentRecipes: this.currentRecipes.length,
        ingredients: this.ingredientInput ? this.ingredientInput.getIngredients() : []
      });
      
      // Show ready message
      if (!API_CONFIG.SPOONACULAR.API_KEY) {
        console.log('Recipe Finder ready! Using free recipe database.');
      } else {
        console.log('Recipe Finder ready! Full features available.');
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.showError('Failed to load the application. Please refresh the page.');
      
      // Show detailed error in debug mode
      if (this.debug) {
        console.error('Detailed error:', error.stack);
      }
    }
  }
  
  initializeDOMElements() {
    this.searchBtn = document.querySelector(UI_CONSTANTS.SELECTORS.SEARCH_BTN);
    this.resultsSection = document.querySelector(UI_CONSTANTS.SELECTORS.RESULTS_SECTION);
    this.resultsGrid = document.querySelector(UI_CONSTANTS.SELECTORS.RESULTS_GRID);
    this.resultsHeader = document.querySelector(UI_CONSTANTS.SELECTORS.RESULTS_HEADER);
    this.noResultsElement = document.querySelector(UI_CONSTANTS.SELECTORS.NO_RESULTS);
    this.errorStateElement = document.querySelector(UI_CONSTANTS.SELECTORS.ERROR_STATE);
    this.loadingOverlay = document.querySelector(UI_CONSTANTS.SELECTORS.LOADING_OVERLAY);
    
    // Debug missing elements
    if (this.debug) {
      const elements = {
        searchBtn: this.searchBtn,
        resultsSection: this.resultsSection,
        resultsGrid: this.resultsGrid,
        resultsHeader: this.resultsHeader,
        noResultsElement: this.noResultsElement,
        errorStateElement: this.errorStateElement,
        loadingOverlay: this.loadingOverlay
      };
      
      Object.entries(elements).forEach(([name, element]) => {
        if (!element) {
          console.warn(`⚠️ Missing DOM element: ${name}`);
        }
      });
    }
  }
  
  initializeServices() {
    this.cacheManager = new CacheManager();
    this.recipeAPI = new RecipeAPI(API_CONFIG.SPOONACULAR.API_KEY);
  }
  
  async initializeComponents() {
    // Initialize ingredient input
    this.ingredientInput = new IngredientInput(UI_CONSTANTS.SELECTORS.INGREDIENT_INPUT);
    
    // Initialize filter manager
    this.filterManager = new FilterManager();
    
    // Initialize recipe modal
    this.recipeModal = new RecipeModal();
  }
  
  setupEventListeners() {
    // Search button
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    }
    
    // Ingredient input changes
    if (this.ingredientInput) {
      this.ingredientInput.on('ingredientsChange', this.handleIngredientsChange.bind(this));
    }
    
    // Filter changes
    if (this.filterManager) {
      this.filterManager.on('filterChange', this.handleFilterChange.bind(this));
      this.filterManager.on('filtersCleared', this.handleFiltersCleared.bind(this));
    }
    
    // Recipe modal events
    if (this.recipeModal) {
      this.recipeModal.on('recipeSaved', this.handleRecipeSaved.bind(this));
      this.recipeModal.on('recipeShared', this.handleRecipeShared.bind(this));
    }
    
    // Error state retry button
    if (this.errorStateElement) {
      const retryBtn = this.errorStateElement.querySelector('#retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', this.handleRetry.bind(this));
      }
    }
    
    // No results clear filters button
    if (this.noResultsElement) {
      const clearFiltersBtn = this.noResultsElement.querySelector('.clear-filters-btn');
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', this.handleClearFilters.bind(this));
      }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    
    // Window events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  handleIngredientsChange(ingredients) {
    console.log('🥕 handleIngredientsChange called with:', ingredients);
    this.updateSearchButtonState();
    
    // Don't auto-search - let user click the search button
    // This prevents unwanted searches on page load or ingredient changes
  }
  
  handleFilterChange(filterData) {
    console.log('🔧 handleFilterChange called with:', filterData);
    console.log('🔧 Current state:', {
      hasPerformedSearch: this.hasPerformedSearch,
      currentSearchIngredients: this.currentSearchIngredients.length,
      isSearching: this.isSearching,
      currentRecipes: this.currentRecipes.length
    });
    
    // Only re-search if user has actually performed a search before and we have results
    if (this.hasPerformedSearch && this.currentSearchIngredients.length > 0 && !this.isSearching && this.currentRecipes.length > 0) {
      console.log('🔧 Filter change will trigger search');
      // Debounced search on filter change
      clearTimeout(this.filterChangeTimeout);
      this.filterChangeTimeout = setTimeout(() => {
        this.performSearch();
      }, 500);
    } else {
      console.log('🔧 Filter change will NOT trigger search');
    }
  }
  
  handleFiltersCleared() {
    // Only re-search if user has actually performed a search before and we have results
    if (this.hasPerformedSearch && this.currentSearchIngredients.length > 0 && this.currentRecipes.length > 0) {
      this.performSearch();
    }
  }
  
  async handleSearch() {
    await this.performSearch();
  }
  
  async performSearch() {
    const ingredients = this.ingredientInput ? this.ingredientInput.getIngredients() : [];
    
    console.log('🔍 performSearch called with ingredients:', ingredients);
    console.log('🔍 Call stack:', new Error().stack);
    
    if (ingredients.length === 0) {
      console.log('🔍 No ingredients, showing error');
      this.showError(ERROR_MESSAGES.NO_INGREDIENTS);
      return;
    }
    
    if (this.isSearching) {
      console.log('⏳ Search already in progress, skipping');
      return; // Prevent multiple simultaneous searches
    }
    
    try {
      this.isSearching = true;
      this.hasPerformedSearch = true; // Mark that user has performed a search
      this.currentSearchIngredients = [...ingredients];
      
      // Show loading state
      this.showLoading(true);
      this.hideError();
      this.hideNoResults();
      
      // Get filters
      const filters = this.filterManager ? this.filterManager.getAPIFilters() : {};
      
      // Search for recipes
      if (this.debug) console.log('🔍 Searching for recipes with:', ingredients, filters);
      const recipes = await this.recipeAPI.searchRecipes(ingredients, filters);
      
      if (this.debug) console.log('📋 Found recipes:', recipes.length);
      
      // Display results
      this.displayResults(recipes, ingredients);
      
      // Save search to history
      this.saveSearchToHistory(ingredients, filters);
      
    } catch (error) {
      console.error('Search failed:', error);
      this.handleSearchError(error);
    } finally {
      this.isSearching = false;
      this.showLoading(false);
    }
  }
  
  displayResults(recipes, searchIngredients) {
    this.currentRecipes = recipes;
    
    if (recipes.length === 0) {
      this.showNoResults();
      return;
    }
    
    // Show results section
    this.showResults();
    
    // Update results header
    this.updateResultsHeader(recipes.length);
    
    // Clear existing results
    if (this.resultsGrid) {
      this.resultsGrid.innerHTML = '';
    }
    
    // Create and display recipe cards
    recipes.forEach((recipe, index) => {
      const recipeCard = new RecipeCard(recipe, searchIngredients);
      
      // Listen for view recipe events
      recipeCard.on('viewRecipe', this.handleViewRecipe.bind(this));
      
      // Render and append card
      const cardElement = recipeCard.render();
      if (this.resultsGrid) {
        this.resultsGrid.appendChild(cardElement);
      }
      
      // Stagger animation for visual appeal
      setTimeout(() => {
        cardElement.classList.add('fade-in');
      }, index * 50);
    });
    
    // Scroll to results
    scrollToElement(this.resultsSection, 100);
  }
  
  handleViewRecipe(data) {
    const { recipe } = data;
    if (this.recipeModal) {
      this.recipeModal.show(recipe, recipe.source);
    }
  }
  
  handleSearchError(error) {
    let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message.includes('rate limit')) {
      errorMessage = ERROR_MESSAGES.RATE_LIMIT;
    } else if (error.message.includes('API key')) {
      errorMessage = ERROR_MESSAGES.INVALID_API_KEY;
    } else if (error.message === ERROR_MESSAGES.NO_INGREDIENTS) {
      errorMessage = ERROR_MESSAGES.NO_INGREDIENTS;
    }
    
    this.showError(errorMessage);
  }
  
  handleRetry() {
    if (this.currentSearchIngredients.length > 0) {
      this.performSearch();
    }
  }
  
  handleClearFilters() {
    if (this.filterManager) {
      this.filterManager.clearFilters();
    }
  }
  
  handleRecipeSaved(recipe) {
    console.log('Recipe saved:', recipe.title);
    // Could trigger analytics or other actions
  }
  
  handleRecipeShared(recipe) {
    console.log('Recipe shared:', recipe.title);
    // Could trigger analytics or other actions
  }
  
  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to search
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.handleSearch();
    }
    
    // Escape to close modal
    if (event.key === 'Escape' && this.recipeModal && this.recipeModal.isOpen()) {
      this.recipeModal.close();
    }
  }
  
  handleOnline() {
    console.log('🌐 Back online');
    showToast('Connection restored', 'success', 2000);
  }
  
  handleOffline() {
    console.log('📡 Gone offline');
    showToast('You are offline. Some features may not work.', 'error', 5000);
  }
  
  // UI State Management
  
  updateSearchButtonState() {
    if (!this.searchBtn) return;
    
    const hasIngredients = this.ingredientInput && this.ingredientInput.hasIngredients();
    
    if (hasIngredients) {
      this.searchBtn.disabled = false;
      this.searchBtn.classList.remove('disabled');
    } else {
      this.searchBtn.disabled = true;
      this.searchBtn.classList.add('disabled');
    }
  }
  
  showLoading(show = true) {
    console.log('🔄 showLoading called with:', show);
    console.log('🔄 Call stack:', new Error().stack);
    
    if (!this.loadingOverlay) return;
    
    if (show) {
      this.loadingOverlay.style.display = 'flex';
      this.loadingOverlay.setAttribute('aria-hidden', 'false');
      
      if (this.searchBtn) {
        this.searchBtn.classList.add(UI_CONSTANTS.CLASSES.LOADING);
        this.searchBtn.disabled = true;
      }
    } else {
      this.loadingOverlay.style.display = 'none';
      this.loadingOverlay.setAttribute('aria-hidden', 'true');
      
      if (this.searchBtn) {
        this.searchBtn.classList.remove(UI_CONSTANTS.CLASSES.LOADING);
        this.updateSearchButtonState();
      }
    }
  }
  
  showResults() {
    if (this.resultsSection) {
      showElement(this.resultsSection);
    }
  }
  
  hideResults() {
    if (this.resultsSection) {
      hideElement(this.resultsSection);
    }
  }
  
  showNoResults() {
    this.hideResults();
    if (this.noResultsElement) {
      showElement(this.noResultsElement);
    }
  }
  
  hideNoResults() {
    if (this.noResultsElement) {
      hideElement(this.noResultsElement);
    }
  }
  
  showError(message) {
    this.hideResults();
    this.hideNoResults();
    
    if (this.errorStateElement) {
      const messageElement = this.errorStateElement.querySelector('#error-message');
      if (messageElement) {
        messageElement.textContent = message;
      }
      showElement(this.errorStateElement);
    }
    
    // Also show toast for immediate feedback
    showToast(message, 'error', 5000);
  }
  
  hideError() {
    if (this.errorStateElement) {
      hideElement(this.errorStateElement);
    }
  }
  
  updateResultsHeader(count) {
    if (!this.resultsHeader) return;
    
    this.resultsHeader.innerHTML = `
      <p class="results-count">${SUCCESS_MESSAGES.RECIPES_FOUND(count)}</p>
    `;
  }
  
  // Application State Management
  
  saveSearchToHistory(ingredients, filters) {
    try {
      const history = JSON.parse(localStorage.getItem('recipe-search-history') || '[]');
      
      const searchEntry = {
        ingredients: [...ingredients],
        filters: { ...filters },
        timestamp: Date.now(),
        resultCount: this.currentRecipes.length
      };
      
      // Add to beginning of history
      history.unshift(searchEntry);
      
      // Keep only last 20 searches
      const trimmedHistory = history.slice(0, 20);
      
      localStorage.setItem('recipe-search-history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }
  
  loadApplicationState() {
    // Could restore previous search or user preferences
    console.log('📱 Loading application state...');
  }
  
  checkAPIConfiguration() {
    if (!API_CONFIG.SPOONACULAR.API_KEY) {
      if (this.debug) {
        console.warn('⚠️ Spoonacular API key not configured. Using fallback API.');
      }
    } else {
      if (this.debug) {
        console.log('✅ Spoonacular API key configured');
      }
    }
  }
  
  // Public API methods
  
  searchRecipes(ingredients, filters = {}) {
    console.log('🔍 PUBLIC searchRecipes called with:', ingredients, filters);
    console.log('🔍 Call stack:', new Error().stack);
    
    if (this.ingredientInput) {
      // Clear current ingredients and add new ones
      this.ingredientInput.clearAllIngredients();
      
      ingredients.forEach(ingredient => {
        this.ingredientInput.addCustomIngredient(ingredient);
      });
    }
    
    if (this.filterManager) {
      this.filterManager.setFilters(filters);
    }
    
    return this.performSearch();
  }
  
  clearSearch() {
    if (this.ingredientInput) {
      this.ingredientInput.clearAllIngredients();
    }
    
    if (this.filterManager) {
      this.filterManager.clearFilters();
    }
    
    this.hideResults();
    this.hideNoResults();
    this.hideError();
    
    this.currentRecipes = [];
    this.currentSearchIngredients = [];
    this.hasPerformedSearch = false; // Reset search flag
  }
  
  getSearchResults() {
    return {
      recipes: [...this.currentRecipes],
      ingredients: [...this.currentSearchIngredients],
      filters: this.filterManager ? this.filterManager.getFilters() : {}
    };
  }
  
  // Cleanup
  
  destroy() {
    // Clean up components
    if (this.ingredientInput) {
      this.ingredientInput.destroy();
    }
    
    if (this.filterManager) {
      this.filterManager.destroy();
    }
    
    if (this.recipeModal) {
      this.recipeModal.destroy();
    }
    
    // Clear timeouts
    if (this.filterChangeTimeout) {
      clearTimeout(this.filterChangeTimeout);
    }
    
    console.log('🧹 Recipe Finder App cleaned up');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting Recipe Finder App...');
  
  // Create global app instance
  window.recipeFinderApp = new RecipeFinderApp();
  
  // Expose some methods globally for debugging
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
    window.debugRecipeFinder = {
      app: window.recipeFinderApp,
      search: (ingredients, filters) => window.recipeFinderApp.searchRecipes(ingredients, filters),
      clear: () => window.recipeFinderApp.clearSearch(),
      results: () => window.recipeFinderApp.getSearchResults(),
      cache: () => window.recipeFinderApp.cacheManager.getStats(),
      clearCache: () => {
        console.log('🧹 Clearing all caches...');
        window.recipeFinderApp.recipeAPI.clearCache();
        window.recipeFinderApp.cacheManager.clear();
        console.log('✅ All caches cleared');
      },
      forceSpoonacularSearch: (ingredients) => {
        console.log('🔍 Forcing fresh Spoonacular search...');
        window.recipeFinderApp.recipeAPI.clearCache();
        return window.recipeFinderApp.searchRecipes(ingredients);
      }
    };
    
    console.log('🔧 Debug tools available at window.debugRecipeFinder');
    console.log('🔧 Use debugRecipeFinder.clearCache() to clear all caches');
    console.log('🔧 Use debugRecipeFinder.forceSpoonacularSearch(["ingredient"]) for fresh search');
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.recipeFinderApp) {
    window.recipeFinderApp.destroy();
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecipeFinderApp;
}