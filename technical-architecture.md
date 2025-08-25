# Technical Architecture & Implementation Plan

## Project Structure

### File Organization
```
recipe-generator/
├── index.html                 # Main HTML file
├── css/
│   ├── styles.css            # Main stylesheet
│   ├── components.css        # Component-specific styles
│   └── responsive.css        # Media queries
├── js/
│   ├── app.js               # Main application logic
│   ├── components/
│   │   ├── IngredientInput.js   # Ingredient input component
│   │   ├── FilterManager.js     # Filter management
│   │   ├── RecipeCard.js        # Recipe card component
│   │   └── RecipeModal.js       # Recipe detail modal
│   ├── services/
│   │   ├── RecipeAPI.js         # API service layer
│   │   └── CacheManager.js      # Caching functionality
│   └── utils/
│       ├── helpers.js           # Utility functions
│       └── constants.js         # App constants
├── data/
│   └── ingredients.json      # Static ingredient database
├── assets/
│   ├── images/              # Icons, placeholders
│   └── fonts/               # Custom fonts (if needed)
└── README.md                # Documentation
```

## Technology Stack

### Core Technologies
- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Modern layout (Grid, Flexbox), animations, custom properties
- **Vanilla JavaScript (ES6+)**: No frameworks for simplicity and performance
- **Web APIs**: Fetch API, Local Storage, Intersection Observer

### External Dependencies
```html
<!-- Minimal external dependencies -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### API Integration
- **Primary**: Spoonacular API
- **Fallback**: TheMealDB API (if needed)
- **Rate Limiting**: Client-side request throttling
- **Caching**: Browser storage for API responses

## HTML Structure

### Main HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Find perfect recipes based on ingredients you have">
    <title>Recipe Finder - Cook with What You Have</title>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="css/styles.css" as="style">
    <link rel="preload" href="js/app.js" as="script">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/responsive.css">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="app-header">
        <div class="container">
            <h1 class="app-title">
                <span class="app-icon">🍳</span>
                Recipe Finder
            </h1>
            <p class="app-subtitle">Find perfect recipes with what you have</p>
        </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
        <div class="container">
            <!-- Search Section -->
            <section class="search-section" aria-label="Recipe search">
                <div class="ingredient-input-container">
                    <label for="ingredient-input" class="input-label">
                        What ingredients do you have?
                    </label>
                    <div class="input-wrapper">
                        <input type="text" 
                               id="ingredient-input" 
                               class="ingredient-input"
                               placeholder="Type ingredients (e.g., chicken, rice, tomatoes)..."
                               autocomplete="off"
                               aria-describedby="ingredient-help">
                        <div class="suggestions-dropdown" id="suggestions-dropdown" role="listbox"></div>
                    </div>
                    <div id="ingredient-help" class="sr-only">
                        Type ingredient names and select from suggestions
                    </div>
                    <div class="ingredient-tags" id="ingredient-tags" role="list"></div>
                </div>

                <!-- Filters -->
                <div class="filters-container">
                    <div class="filter-group">
                        <label for="cooking-time">⏱️ Cooking Time</label>
                        <select id="cooking-time" class="filter-select">
                            <option value="">Any time</option>
                            <option value="15">15 min or less</option>
                            <option value="30">30 min or less</option>
                            <option value="45">45 min or less</option>
                            <option value="60">1 hour or less</option>
                            <option value="61">More than 1 hour</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="servings">👥 Serves</label>
                        <select id="servings" class="filter-select">
                            <option value="1">1 person</option>
                            <option value="2">2 people</option>
                            <option value="4" selected>4 people</option>
                            <option value="6">6 people</option>
                            <option value="8">8+ people</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="diet">🥗 Diet</label>
                        <select id="diet" class="filter-select">
                            <option value="">Any diet</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="gluten-free">Gluten-free</option>
                            <option value="dairy-free">Dairy-free</option>
                            <option value="keto">Keto</option>
                        </select>
                    </div>
                </div>

                <!-- Search Button -->
                <button class="search-btn" id="search-btn" type="button">
                    <span class="btn-text">Find Recipes</span>
                    <span class="btn-loader" aria-hidden="true"></span>
                </button>
            </section>

            <!-- Results Section -->
            <section class="results-section" id="results-section" aria-label="Recipe results">
                <div class="results-header" id="results-header"></div>
                <div class="results-grid" id="results-grid"></div>
                <div class="no-results" id="no-results" style="display: none;"></div>
            </section>
        </div>
    </main>

    <!-- Recipe Modal -->
    <div class="modal-overlay" id="recipe-modal" aria-hidden="true">
        <div class="modal-content" role="dialog" aria-labelledby="modal-title">
            <div class="modal-header">
                <button class="modal-close" aria-label="Close recipe details">&times;</button>
            </div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loading-overlay" aria-hidden="true">
        <div class="loading-spinner"></div>
        <p class="loading-text">Searching for recipes...</p>
    </div>

    <!-- Scripts -->
    <script src="js/utils/constants.js"></script>
    <script src="js/utils/helpers.js"></script>
    <script src="js/services/CacheManager.js"></script>
    <script src="js/services/RecipeAPI.js"></script>
    <script src="js/components/IngredientInput.js"></script>
    <script src="js/components/FilterManager.js"></script>
    <script src="js/components/RecipeCard.js"></script>
    <script src="js/components/RecipeModal.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

## CSS Architecture

### CSS Custom Properties (Variables)
```css
:root {
  /* Colors */
  --color-primary: #2E7D32;
  --color-secondary: #FFA726;
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-text: #212121;
  --color-text-secondary: #757575;
  --color-accent: #E8F5E8;
  --color-error: #D32F2F;
  --color-success: #388E3C;
  
  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Layout */
  --container-max-width: 1200px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
  
  /* Transitions */
  --transition-fast: 0.15s ease-out;
  --transition-normal: 0.3s ease-out;
  --transition-slow: 0.5s ease-out;
}
```

### Component-Based CSS Structure
```css
/* Base styles */
@import 'base/reset.css';
@import 'base/typography.css';
@import 'base/layout.css';

/* Components */
@import 'components/buttons.css';
@import 'components/forms.css';
@import 'components/cards.css';
@import 'components/modal.css';
@import 'components/loading.css';

/* Utilities */
@import 'utilities/spacing.css';
@import 'utilities/visibility.css';
```

## JavaScript Architecture

### Module Pattern
```javascript
// app.js - Main application controller
class RecipeFinderApp {
  constructor() {
    this.ingredientInput = null;
    this.filterManager = null;
    this.recipeAPI = null;
    this.cacheManager = null;
    
    this.init();
  }
  
  async init() {
    try {
      // Initialize services
      this.cacheManager = new CacheManager();
      this.recipeAPI = new RecipeAPI(API_CONFIG.SPOONACULAR_KEY);
      
      // Initialize components
      this.ingredientInput = new IngredientInput('#ingredient-input');
      this.filterManager = new FilterManager();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadIngredientDatabase();
      
      console.log('Recipe Finder App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to load the application. Please refresh the page.');
    }
  }
  
  setupEventListeners() {
    // Search button
    document.getElementById('search-btn').addEventListener('click', () => {
      this.performSearch();
    });
    
    // Filter changes
    this.filterManager.on('filterChange', () => {
      if (this.ingredientInput.hasIngredients()) {
        this.performSearch();
      }
    });
    
    // Ingredient changes
    this.ingredientInput.on('ingredientsChange', () => {
      this.updateSearchButton();
    });
  }
  
  async performSearch() {
    const ingredients = this.ingredientInput.getIngredients();
    const filters = this.filterManager.getFilters();
    
    if (ingredients.length === 0) {
      this.showError('Please add at least one ingredient');
      return;
    }
    
    try {
      this.showLoading(true);
      const recipes = await this.recipeAPI.searchRecipes(ingredients, filters);
      this.displayResults(recipes);
    } catch (error) {
      console.error('Search failed:', error);
      this.showError('Failed to search recipes. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RecipeFinderApp();
});
```

### Component Architecture
```javascript
// Base Component Class
class Component {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
  
  destroy() {
    this.listeners.clear();
  }
}

// Example: IngredientInput Component
class IngredientInput extends Component {
  constructor(selector) {
    super(selector);
    this.ingredients = [];
    this.suggestions = [];
    this.currentFocus = -1;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadIngredientDatabase();
  }
  
  setupEventListeners() {
    this.element.addEventListener('input', this.handleInput.bind(this));
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    this.element.addEventListener('blur', this.handleBlur.bind(this));
  }
  
  handleInput(event) {
    const query = event.target.value.trim();
    if (query.length >= 2) {
      this.showSuggestions(this.searchIngredients(query));
    } else {
      this.hideSuggestions();
    }
  }
  
  addIngredient(ingredient) {
    if (!this.ingredients.find(ing => ing.name === ingredient.name)) {
      this.ingredients.push(ingredient);
      this.renderTags();
      this.emit('ingredientsChange', this.ingredients);
    }
  }
  
  removeIngredient(ingredientId) {
    this.ingredients = this.ingredients.filter(ing => ing.id !== ingredientId);
    this.renderTags();
    this.emit('ingredientsChange', this.ingredients);
  }
}
```

## Performance Optimizations

### Code Splitting Strategy
```javascript
// Lazy load non-critical components
const loadRecipeModal = () => {
  return import('./components/RecipeModal.js');
};

// Load modal only when needed
document.addEventListener('click', async (event) => {
  if (event.target.matches('.view-recipe-btn')) {
    const { RecipeModal } = await loadRecipeModal();
    const modal = new RecipeModal();
    modal.show(event.target.dataset.recipeId);
  }
});
```

### Caching Strategy
```javascript
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.storageKey = 'recipe-finder-cache';
  }
  
  set(key, data, ttl = 300000) { // 5 minutes default
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    // Memory cache
    this.memoryCache.set(key, item);
    
    // Persistent cache
    try {
      const cache = this.getStorageCache();
      cache[key] = item;
      localStorage.setItem(this.storageKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }
  
  get(key) {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }
    
    // Check persistent cache
    try {
      const cache = this.getStorageCache();
      const item = cache[key];
      if (item && this.isValid(item)) {
        // Restore to memory cache
        this.memoryCache.set(key, item);
        return item.data;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }
    
    return null;
  }
}
```

## Build Process (Optional)

### Simple Build Script
```javascript
// build.js - Optional build process for production
const fs = require('fs');
const path = require('path');

class SimpleBuild {
  constructor() {
    this.srcDir = './src';
    this.distDir = './dist';
  }
  
  async build() {
    // Create dist directory
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }
    
    // Copy and minify files
    await this.processHTML();
    await this.processCSS();
    await this.processJS();
    await this.copyAssets();
    
    console.log('Build completed successfully!');
  }
  
  async processHTML() {
    // Minify HTML and inline critical CSS
    const html = fs.readFileSync(path.join(this.srcDir, 'index.html'), 'utf8');
    const minified = html
      .replace(/\s+/g, ' ')
      .replace(/<!--.*?-->/g, '')
      .trim();
    
    fs.writeFileSync(path.join(this.distDir, 'index.html'), minified);
  }
}
```

## Deployment Strategy

### Static Hosting Options
1. **Netlify**: Drag-and-drop deployment, automatic HTTPS
2. **Vercel**: Git integration, edge functions if needed
3. **GitHub Pages**: Free hosting for public repositories
4. **Firebase Hosting**: Google's CDN, easy custom domain

### Environment Configuration
```javascript
// config.js
const CONFIG = {
  development: {
    API_BASE_URL: 'https://api.spoonacular.com',
    API_KEY: 'your-dev-api-key',
    CACHE_TTL: 60000, // 1 minute for development
    DEBUG: true
  },
  production: {
    API_BASE_URL: 'https://api.spoonacular.com',
    API_KEY: 'your-prod-api-key',
    CACHE_TTL: 300000, // 5 minutes for production
    DEBUG: false
  }
};

const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';
const API_CONFIG = CONFIG[ENV];
```

This architecture provides a solid foundation for a performant, maintainable recipe finder application that can easily be extended and deployed.