// Recipe Finder - Recipe API Service

class RecipeAPI {
  constructor(apiKey = '') {
    this.apiKey = apiKey;
    this.cacheManager = new CacheManager();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.rateLimitDelay = 1000; // 1 second between requests
    this.maxRetries = 3;
    
    // Clear cache if we're switching to Spoonacular-only mode
    this.clearOldCache();
  }
  
  clearOldCache() {
    // Clear any cached TheMealDB data since we're now Spoonacular-only
    console.log('🧹 Clearing old cache data...');
    this.cacheManager.clear();
  }
  
  /**
   * Search recipes by ingredients
   * @param {Array} ingredients - Array of ingredient names
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of recipes
   */
  async searchRecipes(ingredients, filters = {}) {
    if (!ingredients || ingredients.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_INGREDIENTS);
    }
    
    console.log('🔍 searchRecipes called with API key:', this.apiKey ? 'CONFIGURED' : 'NOT CONFIGURED');
    
    // Check cache first
    const cacheKey = this.cacheManager.generateSearchKey(ingredients, filters);
    const cachedResult = this.cacheManager.get(cacheKey);
    
    if (cachedResult) {
      console.log('Returning cached search results');
      return cachedResult;
    }
    
    try {
      let recipes;
      
      if (!this.apiKey) {
        throw new Error('Spoonacular API key is required. Please configure your API key.');
      }
      
      console.log('🔍 Using Spoonacular API only');
      // Use Spoonacular API only
      recipes = await this.searchWithSpoonacular(ingredients, filters);
      
      // Process and enhance recipes
      const processedRecipes = await this.processRecipes(recipes, ingredients);
      
      // Cache the results
      this.cacheManager.set(cacheKey, processedRecipes);
      
      return processedRecipes;
      
    } catch (error) {
      console.error('Spoonacular API search failed:', error);
      throw this.handleAPIError(error);
    }
  }
  
  /**
   * Get detailed recipe information
   * @param {string|number} recipeId - Recipe ID
   * @param {string} source - API source ('spoonacular' or 'themealdb')
   * @returns {Promise<Object>} Detailed recipe information
   */
  async getRecipeDetails(recipeId, source = 'spoonacular') {
    console.log('🔍 getRecipeDetails called with ID:', recipeId, 'source:', source);
    
    const cacheKey = this.cacheManager.generateRecipeKey(recipeId);
    const cachedResult = this.cacheManager.get(cacheKey);
    
    if (cachedResult) {
      console.log('Returning cached recipe details');
      return cachedResult;
    }
    
    try {
      if (!this.apiKey) {
        throw new Error('Spoonacular API key is required for recipe details.');
      }
      
      console.log('🔍 Getting Spoonacular recipe details for ID:', recipeId);
      const recipeDetails = await this.getSpoonacularRecipeDetails(recipeId);
      
      // Process recipe details
      const processedDetails = this.processRecipeDetails(recipeDetails);
      
      // Cache the results
      this.cacheManager.set(cacheKey, processedDetails);
      
      return processedDetails;
      
    } catch (error) {
      console.error('Failed to get Spoonacular recipe details:', error);
      throw this.handleAPIError(error);
    }
  }
  
  // Spoonacular API methods
  
  async searchWithSpoonacular(ingredients, filters) {
    if (!this.apiKey) {
      throw new Error(ERROR_MESSAGES.INVALID_API_KEY);
    }
    
    const params = new URLSearchParams({
      apiKey: this.apiKey,
      ingredients: ingredients.join(','),
      number: APP_SETTINGS.MAX_RESULTS,
      ranking: 2, // Maximize used ingredients
      ignorePantry: true,
      addRecipeInformation: true,
      fillIngredients: true
    });
    
    // Add filters
    if (filters.cookingTime) {
      if (filters.cookingTime <= 60) {
        params.append('maxReadyTime', filters.cookingTime);
      } else {
        params.append('minReadyTime', 61);
      }
    }
    
    if (filters.diet) {
      if (filters.diet.includes('gluten-free') || filters.diet.includes('dairy-free')) {
        params.append('intolerances', filters.diet.replace('-free', ''));
      } else {
        params.append('diet', filters.diet);
      }
    }
    
    const url = `${API_CONFIG.SPOONACULAR.BASE_URL}${API_CONFIG.SPOONACULAR.ENDPOINTS.FIND_BY_INGREDIENTS}?${params}`;
    
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      if (response.status === 402) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT);
      } else if (response.status === 401) {
        throw new Error(ERROR_MESSAGES.INVALID_API_KEY);
      } else {
        throw new Error(ERROR_MESSAGES.API_ERROR);
      }
    }
    
    return await response.json();
  }
  
  async getSpoonacularRecipeDetails(recipeId) {
    if (!this.apiKey) {
      throw new Error(ERROR_MESSAGES.INVALID_API_KEY);
    }
    
    const params = new URLSearchParams({
      apiKey: this.apiKey,
      includeNutrition: true
    });
    
    const url = `${API_CONFIG.SPOONACULAR.BASE_URL}/${recipeId}${API_CONFIG.SPOONACULAR.ENDPOINTS.RECIPE_INFORMATION}?${params}`;
    
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.API_ERROR);
    }
    
    return await response.json();
  }
  
  // TheMealDB API methods (fallback)
  
  async searchWithTheMealDB(ingredients, filters) {
    // TheMealDB only supports single ingredient search, so we'll search for the first ingredient
    const primaryIngredient = ingredients[0];
    const url = `${API_CONFIG.THEMEALDB.BASE_URL}${API_CONFIG.THEMEALDB.ENDPOINTS.SEARCH_BY_INGREDIENT}${encodeURIComponent(primaryIngredient)}`;
    
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.API_ERROR);
    }
    
    const data = await response.json();
    return data.meals || [];
  }
  
  async getTheMealDBRecipeDetails(recipeId) {
    const url = `${API_CONFIG.THEMEALDB.BASE_URL}${API_CONFIG.THEMEALDB.ENDPOINTS.RECIPE_DETAILS}${recipeId}`;
    
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.API_ERROR);
    }
    
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  }
  
  // Processing methods
  
  async processRecipes(recipes, searchIngredients) {
    if (!recipes || recipes.length === 0) {
      return [];
    }
    
    return recipes.map(recipe => this.normalizeRecipe(recipe, searchIngredients));
  }
  
  normalizeRecipe(recipe, searchIngredients = []) {
    // Only handle Spoonacular format now
    return this.normalizeSpoonacularRecipe(recipe, searchIngredients);
  }
  
  normalizeSpoonacularRecipe(recipe, searchIngredients) {
    const usedIngredients = recipe.usedIngredients || [];
    const missedIngredients = recipe.missedIngredients || [];
    
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes || 0,
      servings: recipe.servings || 4,
      rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 0, // Convert to 5-star scale
      summary: this.stripHTML(recipe.summary || ''),
      usedIngredients: usedIngredients.map(ing => ing.name),
      missedIngredients: missedIngredients.map(ing => ing.name),
      sourceUrl: recipe.sourceUrl,
      source: 'spoonacular',
      nutrition: recipe.nutrition ? this.normalizeNutrition(recipe.nutrition) : null
    };
  }
  
  normalizeTheMealDBRecipe(recipe, searchIngredients) {
    console.log('🔍 Normalizing TheMealDB recipe:', recipe);
    
    // Extract ingredients from TheMealDB format
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.trim().toLowerCase());
      }
    }
    
    // Determine used vs missed ingredients
    const usedIngredients = ingredients.filter(ing =>
      searchIngredients.some(search =>
        ing.includes(search.toLowerCase()) || search.toLowerCase().includes(ing)
      )
    );
    
    const missedIngredients = ingredients.filter(ing => !usedIngredients.includes(ing));
    
    // Ensure we have a valid ID
    const recipeId = recipe.idMeal || `themealdb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const normalizedRecipe = {
      id: recipeId,
      title: recipe.strMeal,
      image: recipe.strMealThumb,
      readyInMinutes: 30, // Default estimate for TheMealDB
      servings: 4, // Default serving size
      rating: 0, // TheMealDB doesn't provide ratings
      summary: recipe.strInstructions ? this.truncateText(recipe.strInstructions, 150) : '',
      usedIngredients,
      missedIngredients,
      sourceUrl: recipe.strSource,
      source: 'themealdb',
      category: recipe.strCategory,
      area: recipe.strArea,
      nutrition: null
    };
    
    console.log('🔍 Normalized recipe:', normalizedRecipe);
    return normalizedRecipe;
  }
  
  processRecipeDetails(recipe) {
    if (!recipe) return null;
    
    // Only handle Spoonacular format now
    return {
      ...recipe,
      instructions: this.processInstructions(recipe.analyzedInstructions || recipe.instructions),
      ingredients: this.processIngredients(recipe.extendedIngredients || []),
      nutrition: recipe.nutrition ? this.normalizeNutrition(recipe.nutrition) : null,
      summary: this.stripHTML(recipe.summary || '')
    };
  }
  
  processInstructions(instructions) {
    if (!instructions) return [];
    
    if (Array.isArray(instructions) && instructions.length > 0) {
      // Spoonacular format
      return instructions[0].steps.map((step, index) => ({
        number: index + 1,
        step: step.step
      }));
    }
    
    return parseInstructions(instructions);
  }
  
  processIngredients(ingredients) {
    return ingredients.map(ingredient => ({
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      original: ingredient.original
    }));
  }
  
  normalizeNutrition(nutrition) {
    if (!nutrition || !nutrition.nutrients) return null;
    
    const nutrients = nutrition.nutrients;
    const findNutrient = (name) => {
      const nutrient = nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
      return nutrient ? Math.round(nutrient.amount) : 0;
    };
    
    return {
      calories: findNutrient('calories'),
      protein: `${findNutrient('protein')}g`,
      carbs: `${findNutrient('carbohydrates')}g`,
      fat: `${findNutrient('fat')}g`,
      fiber: `${findNutrient('fiber')}g`,
      sugar: `${findNutrient('sugar')}g`
    };
  }
  
  // Utility methods
  
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {},
      ...options
    };
    
    // Only add Content-Type header if not running from file:// protocol
    // This prevents CORS preflight issues when running locally
    if (window.location.protocol !== 'file:') {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }
    
    // Add to request queue for rate limiting
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        options: defaultOptions,
        resolve,
        reject,
        retries: 0
      });
      
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        const response = await fetch(request.url, request.options);
        request.resolve(response);
      } catch (error) {
        if (request.retries < this.maxRetries) {
          request.retries++;
          this.requestQueue.unshift(request); // Add back to front of queue
          await this.delay(this.rateLimitDelay * (request.retries + 1)); // Exponential backoff
        } else {
          request.reject(error);
        }
      }
      
      // Rate limiting delay
      if (this.requestQueue.length > 0) {
        await this.delay(this.rateLimitDelay);
      }
    }
    
    this.isProcessingQueue = false;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  stripHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  
  truncateText(text, maxLength) {
    return truncateText(text, maxLength);
  }
  
  handleAPIError(error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return new Error(ERROR_MESSAGES.NETWORK_ERROR);
    } else if (error.message.includes('rate limit') || error.message.includes('402')) {
      return new Error(ERROR_MESSAGES.RATE_LIMIT);
    } else if (error.message.includes('401') || error.message.includes('API key')) {
      return new Error(ERROR_MESSAGES.INVALID_API_KEY);
    } else {
      return new Error(ERROR_MESSAGES.API_ERROR);
    }
  }
  
  // Public utility methods
  
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  
  clearCache() {
    console.log('🧹 Manually clearing all cache...');
    this.cacheManager.clear();
    // Also clear localStorage cache
    try {
      localStorage.removeItem('recipe-finder-cache');
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }
  
  getCacheStats() {
    return this.cacheManager.getStats();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecipeAPI;
}