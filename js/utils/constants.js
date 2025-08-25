// Recipe Finder - Application Constants

// API Configuration
const API_CONFIG = {
  SPOONACULAR: {
    BASE_URL: 'https://api.spoonacular.com/recipes',
    // Note: In production, API key should be handled securely
    // For demo purposes, users will need to add their own key
    API_KEY: '9c7e3df995894afe93d4e8a335f06be8', // Users need to add their Spoonacular API key here
    ENDPOINTS: {
      FIND_BY_INGREDIENTS: '/findByIngredients',
      RECIPE_INFORMATION: '/information',
      COMPLEX_SEARCH: '/complexSearch'
    }
  },
  THEMEALDB: {
    BASE_URL: 'https://www.themealdb.com/api/json/v1/1',
    ENDPOINTS: {
      SEARCH_BY_INGREDIENT: '/filter.php?i=',
      SEARCH_BY_NAME: '/search.php?s=',
      RECIPE_DETAILS: '/lookup.php?i='
    }
  }
};

// Application Settings
const APP_SETTINGS = {
  MAX_INGREDIENTS: 15,
  MAX_RESULTS: 12,
  CACHE_DURATION: 300000, // 5 minutes
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2,
  DEFAULT_SERVINGS: 4
};

// UI Constants
const UI_CONSTANTS = {
  CLASSES: {
    HIDDEN: 'hidden',
    VISIBLE: 'visible',
    ACTIVE: 'active',
    LOADING: 'loading',
    HIGHLIGHTED: 'highlighted',
    FADE_IN: 'fade-in'
  },
  SELECTORS: {
    INGREDIENT_INPUT: '#ingredient-input',
    SUGGESTIONS_DROPDOWN: '#suggestions-dropdown',
    INGREDIENT_TAGS: '#ingredient-tags',
    SEARCH_BTN: '#search-btn',
    RESULTS_SECTION: '#results-section',
    RESULTS_GRID: '#results-grid',
    RESULTS_HEADER: '#results-header',
    NO_RESULTS: '#no-results',
    ERROR_STATE: '#error-state',
    LOADING_OVERLAY: '#loading-overlay',
    RECIPE_MODAL: '#recipe-modal',
    MODAL_BODY: '#modal-body',
    MODAL_CLOSE: '#modal-close',
    COOKING_TIME: '#cooking-time',
    SERVINGS: '#servings',
    DIET: '#diet'
  },
  KEYS: {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    TAB: 'Tab',
    BACKSPACE: 'Backspace'
  }
};

// Filter Options
const FILTER_OPTIONS = {
  COOKING_TIME: [
    { label: 'Any time', value: '', apiParam: null },
    { label: '15 min or less', value: '15', apiParam: 'maxReadyTime=15' },
    { label: '30 min or less', value: '30', apiParam: 'maxReadyTime=30' },
    { label: '45 min or less', value: '45', apiParam: 'maxReadyTime=45' },
    { label: '1 hour or less', value: '60', apiParam: 'maxReadyTime=60' },
    { label: 'More than 1 hour', value: '61', apiParam: 'minReadyTime=61' }
  ],
  SERVINGS: [
    { label: '1 person', value: 1 },
    { label: '2 people', value: 2 },
    { label: '4 people', value: 4 },
    { label: '6 people', value: 6 },
    { label: '8+ people', value: 8 }
  ],
  DIET: [
    { label: 'Any diet', value: '', apiParam: null },
    { label: 'Vegetarian', value: 'vegetarian', apiParam: 'diet=vegetarian' },
    { label: 'Vegan', value: 'vegan', apiParam: 'diet=vegan' },
    { label: 'Gluten-free', value: 'gluten-free', apiParam: 'intolerances=gluten' },
    { label: 'Dairy-free', value: 'dairy-free', apiParam: 'intolerances=dairy' },
    { label: 'Keto', value: 'ketogenic', apiParam: 'diet=ketogenic' }
  ]
};

// Error Messages
const ERROR_MESSAGES = {
  NO_INGREDIENTS: 'Please add at least one ingredient to search for recipes.',
  API_ERROR: 'We couldn\'t load recipes right now. Please try again.',
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  NO_RESULTS: 'No recipes found with your current ingredients and filters.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before searching again.',
  INVALID_API_KEY: 'API key is missing or invalid. Please check your configuration.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
const SUCCESS_MESSAGES = {
  RECIPES_FOUND: (count) => `Found ${count} delicious recipe${count !== 1 ? 's' : ''} for you!`,
  INGREDIENT_ADDED: (ingredient) => `Added ${ingredient} to your ingredients`,
  INGREDIENT_REMOVED: (ingredient) => `Removed ${ingredient} from your ingredients`
};

// Ingredient Categories with Icons
const INGREDIENT_CATEGORIES = {
  PROTEIN: {
    name: 'protein',
    icon: '🥩',
    color: '#D32F2F'
  },
  VEGETABLE: {
    name: 'vegetable',
    icon: '🥕',
    color: '#388E3C'
  },
  FRUIT: {
    name: 'fruit',
    icon: '🍎',
    color: '#F57C00'
  },
  GRAIN: {
    name: 'grain',
    icon: '🌾',
    color: '#795548'
  },
  DAIRY: {
    name: 'dairy',
    icon: '🥛',
    color: '#1976D2'
  },
  PANTRY: {
    name: 'pantry',
    icon: '🧂',
    color: '#7B1FA2'
  },
  HERB: {
    name: 'herb',
    icon: '🌿',
    color: '#2E7D32'
  },
  SPICE: {
    name: 'spice',
    icon: '🌶️',
    color: '#E64A19'
  }
};

// Local Storage Keys
const STORAGE_KEYS = {
  FREQUENT_INGREDIENTS: 'recipe-finder-frequent-ingredients',
  USER_PREFERENCES: 'recipe-finder-preferences',
  RECIPE_CACHE: 'recipe-finder-cache',
  FAVORITE_RECIPES: 'recipe-finder-favorites'
};

// Animation Durations (in milliseconds)
const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Breakpoints (should match CSS)
const BREAKPOINTS = {
  MOBILE_SM: 480,
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
  DESKTOP_LG: 1440
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_CONFIG,
    APP_SETTINGS,
    UI_CONSTANTS,
    FILTER_OPTIONS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    INGREDIENT_CATEGORIES,
    STORAGE_KEYS,
    ANIMATION_DURATION,
    BREAKPOINTS
  };
}