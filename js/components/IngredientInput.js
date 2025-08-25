// Recipe Finder - Ingredient Input Component

class IngredientInput {
  constructor(inputSelector) {
    this.inputElement = document.querySelector(inputSelector);
    this.suggestionsElement = document.querySelector(UI_CONSTANTS.SELECTORS.SUGGESTIONS_DROPDOWN);
    this.tagsElement = document.querySelector(UI_CONSTANTS.SELECTORS.INGREDIENT_TAGS);
    
    this.ingredients = [];
    this.ingredientDatabase = [];
    this.suggestions = [];
    this.currentFocus = -1;
    this.listeners = new Map();
    
    this.init();
  }
  
  async init() {
    try {
      await this.loadIngredientDatabase();
      this.setupEventListeners();
      this.loadFrequentIngredients();
    } catch (error) {
      console.error('Failed to initialize ingredient input:', error);
    }
  }
  
  async loadIngredientDatabase() {
    try {
      // Check if we're running from file:// protocol
      if (window.location.protocol === 'file:') {
        console.log('🔧 Running from file:// protocol, using fallback ingredient database');
        this.ingredientDatabase = this.getBasicIngredients();
        return;
      }
      
      const response = await fetch('data/ingredients.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.ingredientDatabase = data.common_ingredients;
      console.log('✅ Ingredient database loaded successfully');
    } catch (error) {
      console.warn('Failed to load ingredient database, using fallback:', error.message);
      // Fallback to basic ingredients
      this.ingredientDatabase = this.getBasicIngredients();
    }
  }
  
  getBasicIngredients() {
    return [
      // Proteins
      { name: 'chicken', category: 'protein', aliases: ['chicken breast', 'chicken thigh'], icon: '🐔' },
      { name: 'beef', category: 'protein', aliases: ['ground beef', 'beef steak'], icon: '🥩' },
      { name: 'pork', category: 'protein', aliases: ['pork chops', 'ground pork'], icon: '🐷' },
      { name: 'fish', category: 'protein', aliases: ['salmon', 'tuna', 'cod'], icon: '🐟' },
      { name: 'eggs', category: 'protein', aliases: ['egg'], icon: '🥚' },
      { name: 'tofu', category: 'protein', aliases: ['firm tofu'], icon: '🧈' },
      
      // Vegetables
      { name: 'onions', category: 'vegetable', aliases: ['onion', 'yellow onion'], icon: '🧅' },
      { name: 'garlic', category: 'vegetable', aliases: ['garlic cloves'], icon: '🧄' },
      { name: 'tomatoes', category: 'vegetable', aliases: ['tomato', 'cherry tomatoes'], icon: '🍅' },
      { name: 'carrots', category: 'vegetable', aliases: ['carrot'], icon: '🥕' },
      { name: 'potatoes', category: 'vegetable', aliases: ['potato'], icon: '🥔' },
      { name: 'bell peppers', category: 'vegetable', aliases: ['bell pepper', 'red pepper'], icon: '🫑' },
      { name: 'mushrooms', category: 'vegetable', aliases: ['mushroom'], icon: '🍄' },
      { name: 'spinach', category: 'vegetable', aliases: ['fresh spinach'], icon: '🥬' },
      { name: 'broccoli', category: 'vegetable', aliases: [], icon: '🥦' },
      
      // Grains & Starches
      { name: 'rice', category: 'grain', aliases: ['white rice', 'brown rice'], icon: '🍚' },
      { name: 'pasta', category: 'grain', aliases: ['spaghetti', 'penne'], icon: '🍝' },
      { name: 'bread', category: 'grain', aliases: ['white bread'], icon: '🍞' },
      { name: 'flour', category: 'grain', aliases: ['all-purpose flour'], icon: '🌾' },
      
      // Pantry Items
      { name: 'olive oil', category: 'pantry', aliases: ['cooking oil'], icon: '🫒' },
      { name: 'salt', category: 'pantry', aliases: ['table salt'], icon: '🧂' },
      { name: 'pepper', category: 'pantry', aliases: ['black pepper'], icon: '🧂' },
      { name: 'butter', category: 'pantry', aliases: ['unsalted butter'], icon: '🧈' },
      { name: 'cheese', category: 'pantry', aliases: ['cheddar cheese'], icon: '🧀' },
      { name: 'milk', category: 'pantry', aliases: ['whole milk'], icon: '🥛' },
      
      // Herbs & Spices
      { name: 'basil', category: 'herb', aliases: ['fresh basil'], icon: '🌿' },
      { name: 'oregano', category: 'herb', aliases: ['dried oregano'], icon: '🌿' },
      { name: 'thyme', category: 'herb', aliases: ['fresh thyme'], icon: '🌿' },
      { name: 'paprika', category: 'spice', aliases: [], icon: '🌶️' },
      { name: 'cumin', category: 'spice', aliases: ['ground cumin'], icon: '🌶️' }
    ];
  }
  
  setupEventListeners() {
    if (!this.inputElement) return;
    
    // Input events
    this.inputElement.addEventListener('input', debounce(this.handleInput.bind(this), APP_SETTINGS.DEBOUNCE_DELAY));
    this.inputElement.addEventListener('keydown', this.handleKeydown.bind(this));
    this.inputElement.addEventListener('blur', this.handleBlur.bind(this));
    this.inputElement.addEventListener('focus', this.handleFocus.bind(this));
    
    // Suggestions dropdown events
    if (this.suggestionsElement) {
      this.suggestionsElement.addEventListener('click', this.handleSuggestionClick.bind(this));
      this.suggestionsElement.addEventListener('mouseover', this.handleSuggestionHover.bind(this));
    }
    
    // Tags container events
    if (this.tagsElement) {
      this.tagsElement.addEventListener('click', this.handleTagClick.bind(this));
    }
    
    // Global click to close suggestions
    document.addEventListener('click', (event) => {
      if (!this.inputElement.contains(event.target) && !this.suggestionsElement.contains(event.target)) {
        this.hideSuggestions();
      }
    });
  }
  
  handleInput(event) {
    const query = event.target.value.trim();
    
    if (query.length >= APP_SETTINGS.MIN_SEARCH_LENGTH) {
      this.showSuggestions(this.searchIngredients(query));
    } else {
      this.hideSuggestions();
    }
  }
  
  handleKeydown(event) {
    const key = event.key;
    
    switch (key) {
      case UI_CONSTANTS.KEYS.ARROW_DOWN:
        event.preventDefault();
        this.navigateSuggestions(1);
        break;
        
      case UI_CONSTANTS.KEYS.ARROW_UP:
        event.preventDefault();
        this.navigateSuggestions(-1);
        break;
        
      case UI_CONSTANTS.KEYS.ENTER:
        event.preventDefault();
        this.selectCurrentSuggestion();
        break;
        
      case UI_CONSTANTS.KEYS.ESCAPE:
        this.hideSuggestions();
        this.inputElement.blur();
        break;
        
      case UI_CONSTANTS.KEYS.TAB:
        if (this.suggestions.length > 0 && this.currentFocus >= 0) {
          event.preventDefault();
          this.selectCurrentSuggestion();
        }
        break;
        
      case UI_CONSTANTS.KEYS.BACKSPACE:
        if (this.inputElement.value === '' && this.ingredients.length > 0) {
          this.removeIngredient(this.ingredients[this.ingredients.length - 1].id);
        }
        break;
    }
  }
  
  handleBlur(event) {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.hideSuggestions();
    }, 150);
  }
  
  handleFocus(event) {
    const query = event.target.value.trim();
    if (query.length >= APP_SETTINGS.MIN_SEARCH_LENGTH) {
      this.showSuggestions(this.searchIngredients(query));
    }
  }
  
  handleSuggestionClick(event) {
    const suggestionElement = event.target.closest('.suggestion-item');
    if (suggestionElement) {
      const index = parseInt(suggestionElement.dataset.index);
      this.selectSuggestion(index);
    }
  }
  
  handleSuggestionHover(event) {
    const suggestionElement = event.target.closest('.suggestion-item');
    if (suggestionElement) {
      this.highlightSuggestion(parseInt(suggestionElement.dataset.index));
    }
  }
  
  handleTagClick(event) {
    if (event.target.classList.contains('tag-remove')) {
      const tagElement = event.target.closest('.ingredient-tag');
      if (tagElement) {
        const ingredientId = tagElement.dataset.ingredientId;
        this.removeIngredient(ingredientId);
      }
    }
  }
  
  searchIngredients(query) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    // Exact name matches (highest priority)
    this.ingredientDatabase.forEach(ingredient => {
      if (ingredient.name.toLowerCase().startsWith(queryLower)) {
        results.push({ ...ingredient, priority: 1 });
      }
    });
    
    // Alias matches (medium priority)
    this.ingredientDatabase.forEach(ingredient => {
      ingredient.aliases.forEach(alias => {
        if (alias.toLowerCase().includes(queryLower) && 
            !results.find(r => r.name === ingredient.name)) {
          results.push({ ...ingredient, priority: 2 });
        }
      });
    });
    
    // Partial matches (lowest priority)
    this.ingredientDatabase.forEach(ingredient => {
      if (ingredient.name.toLowerCase().includes(queryLower) && 
          !results.find(r => r.name === ingredient.name)) {
        results.push({ ...ingredient, priority: 3 });
      }
    });
    
    // Remove already selected ingredients
    const filteredResults = results.filter(ingredient => 
      !this.ingredients.find(selected => selected.name === ingredient.name)
    );
    
    // Sort by priority and limit results
    return filteredResults
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 8);
  }
  
  showSuggestions(suggestions) {
    this.suggestions = suggestions;
    this.currentFocus = -1;
    
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }
    
    const suggestionsHTML = suggestions.map((suggestion, index) => `
      <div class="suggestion-item" data-index="${index}" role="option">
        <span class="suggestion-icon">${suggestion.icon}</span>
        <span class="suggestion-text">${sanitizeHTML(suggestion.name)}</span>
        <span class="suggestion-category">${suggestion.category}</span>
      </div>
    `).join('');
    
    this.suggestionsElement.innerHTML = suggestionsHTML;
    this.suggestionsElement.style.display = 'block';
    this.suggestionsElement.setAttribute('aria-expanded', 'true');
  }
  
  hideSuggestions() {
    this.suggestionsElement.style.display = 'none';
    this.suggestionsElement.setAttribute('aria-expanded', 'false');
    this.suggestions = [];
    this.currentFocus = -1;
  }
  
  navigateSuggestions(direction) {
    if (this.suggestions.length === 0) return;
    
    this.currentFocus += direction;
    
    if (this.currentFocus >= this.suggestions.length) {
      this.currentFocus = 0;
    } else if (this.currentFocus < 0) {
      this.currentFocus = this.suggestions.length - 1;
    }
    
    this.highlightSuggestion(this.currentFocus);
  }
  
  highlightSuggestion(index) {
    const suggestionElements = this.suggestionsElement.querySelectorAll('.suggestion-item');
    
    suggestionElements.forEach((element, i) => {
      if (i === index) {
        element.classList.add(UI_CONSTANTS.CLASSES.HIGHLIGHTED);
        element.setAttribute('aria-selected', 'true');
      } else {
        element.classList.remove(UI_CONSTANTS.CLASSES.HIGHLIGHTED);
        element.setAttribute('aria-selected', 'false');
      }
    });
    
    this.currentFocus = index;
  }
  
  selectCurrentSuggestion() {
    if (this.currentFocus >= 0 && this.currentFocus < this.suggestions.length) {
      this.selectSuggestion(this.currentFocus);
    } else {
      // Try to add custom ingredient
      const query = this.inputElement.value.trim();
      if (query) {
        this.addCustomIngredient(query);
      }
    }
  }
  
  selectSuggestion(index) {
    if (index >= 0 && index < this.suggestions.length) {
      const ingredient = this.suggestions[index];
      this.addIngredient(ingredient);
    }
  }
  
  addIngredient(ingredient) {
    console.log('🥕 addIngredient called with:', ingredient);
    
    if (this.ingredients.length >= APP_SETTINGS.MAX_INGREDIENTS) {
      showToast(`Maximum ${APP_SETTINGS.MAX_INGREDIENTS} ingredients allowed`, 'error');
      return;
    }
    
    if (this.isDuplicate(ingredient)) {
      showToast(`${ingredient.name} is already added`, 'error');
      return;
    }
    
    const ingredientWithId = {
      ...ingredient,
      id: generateId()
    };
    
    this.ingredients.push(ingredientWithId);
    this.renderTags();
    this.clearInput();
    this.hideSuggestions();
    this.saveFrequentIngredient(ingredient.name);
    
    console.log('🥕 Emitting ingredientsChange event');
    this.emit('ingredientsChange', this.ingredients);
    
    // Show success message
    showToast(SUCCESS_MESSAGES.INGREDIENT_ADDED(ingredient.name), 'success', 2000);
  }
  
  addCustomIngredient(name) {
    console.log('🥄 addCustomIngredient called with:', name);
    console.log('🥄 Call stack:', new Error().stack);
    
    const customIngredient = {
      name: name.toLowerCase(),
      category: 'custom',
      aliases: [],
      icon: '🥄'
    };
    
    this.addIngredient(customIngredient);
  }
  
  removeIngredient(ingredientId) {
    const ingredient = this.ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;
    
    this.ingredients = this.ingredients.filter(ing => ing.id !== ingredientId);
    this.renderTags();
    this.emit('ingredientsChange', this.ingredients);
    
    // Show success message
    showToast(SUCCESS_MESSAGES.INGREDIENT_REMOVED(ingredient.name), 'success', 2000);
  }
  
  clearAllIngredients() {
    this.ingredients = [];
    this.renderTags();
    this.emit('ingredientsChange', this.ingredients);
  }
  
  isDuplicate(ingredient) {
    return this.ingredients.some(existing => existing.name === ingredient.name);
  }
  
  renderTags() {
    if (!this.tagsElement) return;
    
    if (this.ingredients.length === 0) {
      this.tagsElement.innerHTML = '';
      return;
    }
    
    const tagsHTML = this.ingredients.map(ingredient => `
      <span class="ingredient-tag" data-ingredient-id="${ingredient.id}" role="listitem">
        <span class="tag-icon">${ingredient.icon}</span>
        <span class="tag-text">${sanitizeHTML(ingredient.name)}</span>
        <button class="tag-remove" aria-label="Remove ${sanitizeHTML(ingredient.name)}" type="button">×</button>
      </span>
    `).join('');
    
    this.tagsElement.innerHTML = tagsHTML;
  }
  
  clearInput() {
    this.inputElement.value = '';
    this.inputElement.focus();
  }
  
  getIngredients() {
    return this.ingredients.map(ingredient => ingredient.name);
  }
  
  getIngredientsData() {
    return this.ingredients;
  }
  
  hasIngredients() {
    return this.ingredients.length > 0;
  }
  
  saveFrequentIngredient(ingredientName) {
    try {
      const frequent = JSON.parse(localStorage.getItem(STORAGE_KEYS.FREQUENT_INGREDIENTS) || '[]');
      const existing = frequent.find(f => f.name === ingredientName);
      
      if (existing) {
        existing.count++;
      } else {
        frequent.push({ name: ingredientName, count: 1 });
      }
      
      // Keep top 20 most frequent
      frequent.sort((a, b) => b.count - a.count);
      localStorage.setItem(STORAGE_KEYS.FREQUENT_INGREDIENTS, JSON.stringify(frequent.slice(0, 20)));
    } catch (error) {
      console.warn('Failed to save frequent ingredient:', error);
    }
  }
  
  loadFrequentIngredients() {
    try {
      const frequent = JSON.parse(localStorage.getItem(STORAGE_KEYS.FREQUENT_INGREDIENTS) || '[]');
      // Could be used to prioritize suggestions in the future
      this.frequentIngredients = frequent;
    } catch (error) {
      console.warn('Failed to load frequent ingredients:', error);
      this.frequentIngredients = [];
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
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
  
  destroy() {
    // Clean up event listeners
    this.listeners.clear();
    
    if (this.inputElement) {
      this.inputElement.removeEventListener('input', this.handleInput);
      this.inputElement.removeEventListener('keydown', this.handleKeydown);
      this.inputElement.removeEventListener('blur', this.handleBlur);
      this.inputElement.removeEventListener('focus', this.handleFocus);
    }
    
    if (this.suggestionsElement) {
      this.suggestionsElement.removeEventListener('click', this.handleSuggestionClick);
      this.suggestionsElement.removeEventListener('mouseover', this.handleSuggestionHover);
    }
    
    if (this.tagsElement) {
      this.tagsElement.removeEventListener('click', this.handleTagClick);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IngredientInput;
}