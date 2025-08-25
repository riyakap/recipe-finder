# Recipe Filtering & Results System Design

## Filtering System

### 1. Filter Components

#### Cooking Time Filter
**Options & API Mapping:**
```javascript
const cookingTimeOptions = [
  { label: "Any time", value: null, apiParam: null },
  { label: "15 minutes or less", value: 15, apiParam: "maxReadyTime=15" },
  { label: "30 minutes or less", value: 30, apiParam: "maxReadyTime=30" },
  { label: "45 minutes or less", value: 45, apiParam: "maxReadyTime=45" },
  { label: "1 hour or less", value: 60, apiParam: "maxReadyTime=60" },
  { label: "More than 1 hour", value: 61, apiParam: "minReadyTime=61" }
];
```

**UI Component:**
```html
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
```

#### Servings Filter
**Options & Logic:**
```javascript
const servingsOptions = [
  { label: "Any amount", value: null },
  { label: "1 person", value: 1 },
  { label: "2 people", value: 2 },
  { label: "4 people", value: 4 },
  { label: "6 people", value: 6 },
  { label: "8+ people", value: 8 }
];
```

**Scaling Logic:**
- API returns recipes with original servings
- Frontend calculates ingredient scaling
- Display both original and scaled portions

#### Dietary Restrictions Filter
**Spoonacular Diet Parameters:**
```javascript
const dietaryOptions = [
  { label: "Any diet", value: null, apiParam: null },
  { label: "Vegetarian", value: "vegetarian", apiParam: "diet=vegetarian" },
  { label: "Vegan", value: "vegan", apiParam: "diet=vegan" },
  { label: "Gluten-free", value: "gluten-free", apiParam: "intolerances=gluten" },
  { label: "Dairy-free", value: "dairy-free", apiParam: "intolerances=dairy" },
  { label: "Low-carb", value: "low-carb", apiParam: "diet=ketogenic" },
  { label: "Keto", value: "keto", apiParam: "diet=ketogenic" }
];
```

### 2. Filter State Management

#### Filter State Object
```javascript
class FilterManager {
  constructor() {
    this.filters = {
      ingredients: [],
      cookingTime: null,
      servings: 4, // default
      diet: null,
      intolerances: []
    };
  }
  
  updateFilter(filterType, value) {
    this.filters[filterType] = value;
    this.triggerSearch();
  }
  
  buildAPIQuery() {
    const params = new URLSearchParams();
    
    // Ingredients (required)
    if (this.filters.ingredients.length > 0) {
      params.append('ingredients', this.filters.ingredients.join(','));
    }
    
    // Cooking time
    if (this.filters.cookingTime) {
      if (this.filters.cookingTime <= 60) {
        params.append('maxReadyTime', this.filters.cookingTime);
      } else {
        params.append('minReadyTime', 61);
      }
    }
    
    // Diet
    if (this.filters.diet) {
      params.append('diet', this.filters.diet);
    }
    
    // Additional parameters
    params.append('number', '12'); // Results per page
    params.append('ranking', '2'); // Maximize used ingredients
    params.append('ignorePantry', 'true');
    
    return params.toString();
  }
}
```

### 3. Advanced Filtering Features

#### Ingredient Matching Strategy
```javascript
const matchingStrategies = {
  MAXIMIZE_INGREDIENTS: 'ranking=2', // Use as many provided ingredients as possible
  MINIMIZE_MISSING: 'ranking=1',     // Minimize missing ingredients
  BALANCED: 'ranking=0'              // Balance between the two
};
```

#### Smart Defaults
- **Servings**: Default to 4 people (most common)
- **Time**: No restriction initially
- **Diet**: No restrictions initially
- **Strategy**: Maximize ingredient usage

## Results System

### 1. Recipe Search Flow

#### API Integration
```javascript
class RecipeSearchService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.spoonacular.com/recipes';
  }
  
  async searchRecipes(filters) {
    const query = filters.buildAPIQuery();
    const url = `${this.baseURL}/findByIngredients?${query}&apiKey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const recipes = await response.json();
      
      // Get detailed information for each recipe
      const detailedRecipes = await this.getRecipeDetails(recipes);
      return this.processResults(detailedRecipes, filters);
      
    } catch (error) {
      throw new Error('Failed to fetch recipes');
    }
  }
  
  async getRecipeDetails(recipes) {
    const detailPromises = recipes.slice(0, 12).map(recipe => 
      fetch(`${this.baseURL}/${recipe.id}/information?apiKey=${this.apiKey}`)
        .then(res => res.json())
    );
    
    return Promise.all(detailPromises);
  }
}
```

### 2. Results Processing

#### Recipe Data Structure
```javascript
const processedRecipe = {
  id: 12345,
  title: "Chicken Stir Fry",
  image: "https://spoonacular.com/recipeImages/12345-312x231.jpg",
  readyInMinutes: 25,
  servings: 4,
  usedIngredients: ["chicken breast", "rice", "soy sauce"],
  missedIngredients: ["bell pepper", "garlic"],
  rating: 4.5,
  summary: "A quick and delicious chicken stir fry...",
  instructions: [...],
  nutrition: {
    calories: 320,
    protein: "28g",
    carbs: "35g",
    fat: "8g"
  }
};
```

#### Results Sorting Algorithm
```javascript
function sortRecipes(recipes, preferences) {
  return recipes.sort((a, b) => {
    // Primary: Number of used ingredients (descending)
    const usedDiff = b.usedIngredients.length - a.usedIngredients.length;
    if (usedDiff !== 0) return usedDiff;
    
    // Secondary: Number of missing ingredients (ascending)
    const missedDiff = a.missedIngredients.length - b.missedIngredients.length;
    if (missedDiff !== 0) return missedDiff;
    
    // Tertiary: Rating (descending)
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    
    // Quaternary: Cooking time preference
    if (preferences.preferQuick) {
      return a.readyInMinutes - b.readyInMinutes;
    }
    
    return 0;
  });
}
```

### 3. Results Display

#### Recipe Card Component
```html
<div class="recipe-card" data-recipe-id="12345">
  <div class="recipe-image-container">
    <img src="recipe-image.jpg" alt="Chicken Stir Fry" class="recipe-image">
    <div class="recipe-rating">⭐ 4.5</div>
  </div>
  
  <div class="recipe-content">
    <h3 class="recipe-title">Chicken Stir Fry</h3>
    
    <div class="recipe-meta">
      <span class="meta-item">⏱️ 25 min</span>
      <span class="meta-item">👥 4 people</span>
    </div>
    
    <div class="ingredient-match">
      <div class="used-ingredients">
        <span class="match-label">✅ Have:</span>
        <span class="ingredient-list">chicken, rice, soy sauce</span>
      </div>
      <div class="missing-ingredients">
        <span class="match-label">🛒 Need:</span>
        <span class="ingredient-list">bell pepper, garlic</span>
      </div>
    </div>
    
    <p class="recipe-summary">A quick and delicious chicken stir fry perfect for weeknight dinners...</p>
    
    <button class="view-recipe-btn" data-recipe-id="12345">
      View Recipe
    </button>
  </div>
</div>
```

#### Results Grid Layout
```css
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

### 4. Recipe Detail View

#### Modal/Page Structure
```html
<div class="recipe-modal" id="recipe-modal">
  <div class="modal-content">
    <header class="recipe-header">
      <button class="close-btn" aria-label="Close recipe">×</button>
      <h1 class="recipe-title">Chicken Stir Fry</h1>
      <div class="recipe-meta-detailed">
        <span>⏱️ 25 minutes</span>
        <span>👥 Serves 4</span>
        <span>⭐ 4.5 rating</span>
        <span>🔥 320 calories</span>
      </div>
    </header>
    
    <div class="recipe-body">
      <div class="recipe-image-large">
        <img src="large-image.jpg" alt="Chicken Stir Fry">
      </div>
      
      <div class="recipe-details">
        <section class="ingredients-section">
          <h2>Ingredients</h2>
          <div class="servings-adjuster">
            <label>Adjust servings:</label>
            <button class="serving-btn" data-action="decrease">-</button>
            <span class="serving-count">4</span>
            <button class="serving-btn" data-action="increase">+</button>
          </div>
          
          <ul class="ingredients-list">
            <li class="ingredient-item available">
              <span class="ingredient-amount">2</span>
              <span class="ingredient-name">chicken breasts</span>
              <span class="ingredient-status">✅</span>
            </li>
            <li class="ingredient-item missing">
              <span class="ingredient-amount">1</span>
              <span class="ingredient-name">bell pepper</span>
              <span class="ingredient-status">🛒</span>
            </li>
          </ul>
        </section>
        
        <section class="instructions-section">
          <h2>Instructions</h2>
          <ol class="instructions-list">
            <li class="instruction-step">
              <span class="step-number">1</span>
              <p>Heat oil in a large pan over medium-high heat...</p>
            </li>
            <li class="instruction-step">
              <span class="step-number">2</span>
              <p>Add chicken and cook until golden brown...</p>
            </li>
          </ol>
        </section>
        
        <section class="nutrition-section">
          <h2>Nutrition (per serving)</h2>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <span class="nutrition-value">320</span>
              <span class="nutrition-label">Calories</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">28g</span>
              <span class="nutrition-label">Protein</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">35g</span>
              <span class="nutrition-label">Carbs</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">8g</span>
              <span class="nutrition-label">Fat</span>
            </div>
          </div>
        </section>
      </div>
    </div>
    
    <footer class="recipe-actions">
      <button class="action-btn save-btn">💾 Save Recipe</button>
      <button class="action-btn share-btn">📤 Share</button>
      <button class="action-btn print-btn">🖨️ Print</button>
    </footer>
  </div>
</div>
```

### 5. Performance Optimizations

#### Lazy Loading
```javascript
// Implement intersection observer for recipe cards
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});
```

#### Caching Strategy
```javascript
class RecipeCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100;
  }
  
  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
    return null;
  }
}
```

### 6. Error Handling

#### No Results State
```html
<div class="no-results">
  <div class="no-results-icon">🔍</div>
  <h2>No recipes found</h2>
  <p>Try adjusting your filters or adding different ingredients</p>
  <div class="suggestions">
    <h3>Suggestions:</h3>
    <ul>
      <li>Remove some dietary restrictions</li>
      <li>Increase cooking time limit</li>
      <li>Try more common ingredients</li>
    </ul>
  </div>
  <button class="clear-filters-btn">Clear All Filters</button>
</div>
```

#### Loading States
```html
<div class="recipe-skeleton">
  <div class="skeleton-image"></div>
  <div class="skeleton-content">
    <div class="skeleton-title"></div>
    <div class="skeleton-meta"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text"></div>
  </div>
</div>
```

This comprehensive filtering and results system provides users with powerful search capabilities while maintaining a clean, intuitive interface.