// Recipe Finder - Recipe Modal Component

class RecipeModal {
  constructor() {
    this.modalElement = document.querySelector(UI_CONSTANTS.SELECTORS.RECIPE_MODAL);
    this.modalBody = document.querySelector(UI_CONSTANTS.SELECTORS.MODAL_BODY);
    this.closeButton = document.querySelector(UI_CONSTANTS.SELECTORS.MODAL_CLOSE);
    
    this.currentRecipe = null;
    this.currentServings = 4;
    this.recipeAPI = null;
    this.listeners = new Map();
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.recipeAPI = new RecipeAPI(API_CONFIG.SPOONACULAR.API_KEY);
  }
  
  setupEventListeners() {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.close.bind(this));
    }
    
    // Overlay click to close
    if (this.modalElement) {
      this.modalElement.addEventListener('click', (event) => {
        if (event.target === this.modalElement) {
          this.close();
        }
      });
    }
    
    // Keyboard events
    document.addEventListener('keydown', (event) => {
      if (this.isOpen() && event.key === UI_CONSTANTS.KEYS.ESCAPE) {
        this.close();
      }
    });
  }
  
  async show(recipe, source = 'spoonacular') {
    if (!recipe) return;
    
    console.log('🔍 RecipeModal.show called with:', { recipe, source });
    
    try {
      // Show modal immediately with loading state
      this.showModal();
      this.showLoading();
      
      // Get detailed recipe information
      console.log('🔍 Getting recipe details for ID:', recipe.id, 'source:', source);
      const detailedRecipe = await this.recipeAPI.getRecipeDetails(recipe.id, source);
      
      if (detailedRecipe) {
        this.currentRecipe = { ...recipe, ...detailedRecipe };
        this.currentServings = this.currentRecipe.servings || 4;
        this.renderRecipeDetails();
      } else {
        // Fallback to basic recipe info
        this.currentRecipe = recipe;
        this.currentServings = recipe.servings || 4;
        this.renderBasicRecipe();
      }
      
      this.emit('recipeShown', this.currentRecipe);
      
    } catch (error) {
      console.error('Failed to load recipe details:', error);
      this.showError('Failed to load recipe details. Please try again.');
    }
  }
  
  showModal() {
    if (this.modalElement) {
      this.modalElement.classList.add(UI_CONSTANTS.CLASSES.ACTIVE);
      this.modalElement.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      
      // Focus management
      this.trapFocus();
    }
  }
  
  close() {
    if (this.modalElement) {
      this.modalElement.classList.remove(UI_CONSTANTS.CLASSES.ACTIVE);
      this.modalElement.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // Restore scrolling
      
      // Clear content
      if (this.modalBody) {
        this.modalBody.innerHTML = '';
      }
      
      this.currentRecipe = null;
      this.emit('recipeClosed');
    }
  }
  
  isOpen() {
    return this.modalElement && this.modalElement.classList.contains(UI_CONSTANTS.CLASSES.ACTIVE);
  }
  
  showLoading() {
    if (!this.modalBody) return;
    
    this.modalBody.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Loading recipe details...</p>
      </div>
    `;
  }
  
  showError(message) {
    if (!this.modalBody) return;
    
    this.modalBody.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Unable to Load Recipe</h2>
        <p class="error-message">${sanitizeHTML(message)}</p>
        <div class="error-actions">
          <button class="retry-btn btn-primary" onclick="this.closest('.modal-overlay').querySelector('.modal-close').click()">Close</button>
        </div>
      </div>
    `;
  }
  
  renderRecipeDetails() {
    if (!this.modalBody || !this.currentRecipe) return;
    
    const recipe = this.currentRecipe;
    
    this.modalBody.innerHTML = `
      <div class="recipe-detail-header">
        <h1 class="recipe-detail-title" id="modal-title">${sanitizeHTML(recipe.title)}</h1>
        <div class="recipe-meta-detailed">
          ${recipe.readyInMinutes ? `<span>⏱️ ${formatCookingTime(recipe.readyInMinutes)}</span>` : ''}
          <span>👥 Serves ${this.currentServings}</span>
          ${recipe.rating ? `<span>⭐ ${recipe.rating.toFixed(1)} rating</span>` : ''}
          ${recipe.nutrition && recipe.nutrition.calories ? `<span>🔥 ${recipe.nutrition.calories} calories</span>` : ''}
        </div>
      </div>
      
      ${recipe.image ? `
        <div class="recipe-image-large">
          <img src="${recipe.image}" alt="${sanitizeHTML(recipe.title)}" />
        </div>
      ` : ''}
      
      <div class="recipe-details">
        ${this.renderIngredientsSection()}
        ${this.renderInstructionsSection()}
        ${this.renderNutritionSection()}
      </div>
      
      ${this.renderRecipeActions()}
    `;
    
    this.setupModalEventListeners();
  }
  
  renderBasicRecipe() {
    if (!this.modalBody || !this.currentRecipe) return;
    
    const recipe = this.currentRecipe;
    
    this.modalBody.innerHTML = `
      <div class="recipe-detail-header">
        <h1 class="recipe-detail-title" id="modal-title">${sanitizeHTML(recipe.title)}</h1>
        <div class="recipe-meta-detailed">
          ${recipe.readyInMinutes ? `<span>⏱️ ${formatCookingTime(recipe.readyInMinutes)}</span>` : ''}
          <span>👥 Serves ${this.currentServings}</span>
          ${recipe.rating ? `<span>⭐ ${recipe.rating.toFixed(1)} rating</span>` : ''}
        </div>
      </div>
      
      ${recipe.image ? `
        <div class="recipe-image-large">
          <img src="${recipe.image}" alt="${sanitizeHTML(recipe.title)}" />
        </div>
      ` : ''}
      
      <div class="recipe-details">
        <div class="basic-info">
          ${recipe.summary ? `<p>${sanitizeHTML(recipe.summary)}</p>` : ''}
          ${recipe.sourceUrl ? `
            <p><strong>Recipe Source:</strong> <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer">View Original Recipe</a></p>
          ` : ''}
        </div>
      </div>
      
      ${this.renderRecipeActions()}
    `;
    
    this.setupModalEventListeners();
  }
  
  renderIngredientsSection() {
    const recipe = this.currentRecipe;
    if (!recipe.ingredients || recipe.ingredients.length === 0) return '';
    
    return `
      <section class="ingredients-section">
        <h2>🥘 Ingredients</h2>
        <div class="servings-adjuster">
          <label>Adjust servings:</label>
          <button class="serving-btn" data-action="decrease" aria-label="Decrease servings">-</button>
          <span class="serving-count">${this.currentServings}</span>
          <button class="serving-btn" data-action="increase" aria-label="Increase servings">+</button>
        </div>
        <ul class="ingredients-list">
          ${recipe.ingredients.map(ingredient => this.renderIngredientItem(ingredient)).join('')}
        </ul>
      </section>
    `;
  }
  
  renderIngredientItem(ingredient) {
    const isAvailable = this.isIngredientAvailable(ingredient.name);
    const scaledAmount = this.scaleIngredientAmount(ingredient.amount, ingredient.unit);
    
    return `
      <li class="ingredient-item ${isAvailable ? 'available' : 'missing'}">
        <span class="ingredient-amount">${scaledAmount}</span>
        <span class="ingredient-name">${sanitizeHTML(ingredient.name)}</span>
        <span class="ingredient-status">${isAvailable ? '✅' : '🛒'}</span>
      </li>
    `;
  }
  
  renderInstructionsSection() {
    const recipe = this.currentRecipe;
    if (!recipe.instructions || recipe.instructions.length === 0) return '';
    
    return `
      <section class="instructions-section">
        <h2>👨‍🍳 Instructions</h2>
        <ol class="instructions-list">
          ${recipe.instructions.map(instruction => `
            <li class="instruction-step">
              <span class="step-number"></span>
              <p>${sanitizeHTML(instruction.step)}</p>
            </li>
          `).join('')}
        </ol>
      </section>
    `;
  }
  
  renderNutritionSection() {
    const recipe = this.currentRecipe;
    if (!recipe.nutrition) return '';
    
    return `
      <section class="nutrition-section">
        <h2>📊 Nutrition (per serving)</h2>
        <div class="nutrition-grid">
          ${recipe.nutrition.calories ? `
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.calories}</span>
              <span class="nutrition-label">Calories</span>
            </div>
          ` : ''}
          ${recipe.nutrition.protein ? `
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.protein}</span>
              <span class="nutrition-label">Protein</span>
            </div>
          ` : ''}
          ${recipe.nutrition.carbs ? `
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.carbs}</span>
              <span class="nutrition-label">Carbs</span>
            </div>
          ` : ''}
          ${recipe.nutrition.fat ? `
            <div class="nutrition-item">
              <span class="nutrition-value">${recipe.nutrition.fat}</span>
              <span class="nutrition-label">Fat</span>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  }
  
  renderRecipeActions() {
    const recipe = this.currentRecipe;
    
    return `
      <footer class="recipe-actions">
        <button class="action-btn save-btn" data-action="save">💾 Save Recipe</button>
        <button class="action-btn share-btn" data-action="share">📤 Share</button>
        <button class="action-btn print-btn" data-action="print">🖨️ Print</button>
        ${recipe.sourceUrl ? `
          <a href="${recipe.sourceUrl}" target="_blank" rel="noopener noreferrer" class="action-btn">🔗 Original Recipe</a>
        ` : ''}
      </footer>
    `;
  }
  
  setupModalEventListeners() {
    if (!this.modalBody) return;
    
    // Serving adjustment buttons
    const servingButtons = this.modalBody.querySelectorAll('.serving-btn');
    servingButtons.forEach(button => {
      button.addEventListener('click', this.handleServingAdjustment.bind(this));
    });
    
    // Action buttons
    const actionButtons = this.modalBody.querySelectorAll('.action-btn[data-action]');
    actionButtons.forEach(button => {
      button.addEventListener('click', this.handleActionClick.bind(this));
    });
  }
  
  handleServingAdjustment(event) {
    const action = event.target.dataset.action;
    const originalServings = this.currentRecipe.servings || 4;
    
    if (action === 'increase' && this.currentServings < 20) {
      this.currentServings++;
    } else if (action === 'decrease' && this.currentServings > 1) {
      this.currentServings--;
    }
    
    // Update serving count display
    const servingCountElement = this.modalBody.querySelector('.serving-count');
    if (servingCountElement) {
      servingCountElement.textContent = this.currentServings;
    }
    
    // Update ingredient amounts
    this.updateIngredientAmounts();
    
    this.emit('servingsChanged', {
      originalServings,
      newServings: this.currentServings,
      recipe: this.currentRecipe
    });
  }
  
  updateIngredientAmounts() {
    const ingredientItems = this.modalBody.querySelectorAll('.ingredient-item');
    const recipe = this.currentRecipe;
    
    if (!recipe.ingredients) return;
    
    ingredientItems.forEach((item, index) => {
      if (recipe.ingredients[index]) {
        const ingredient = recipe.ingredients[index];
        const scaledAmount = this.scaleIngredientAmount(ingredient.amount, ingredient.unit);
        const amountElement = item.querySelector('.ingredient-amount');
        if (amountElement) {
          amountElement.textContent = scaledAmount;
        }
      }
    });
  }
  
  handleActionClick(event) {
    const action = event.target.dataset.action;
    
    switch (action) {
      case 'save':
        this.saveRecipe();
        break;
      case 'share':
        this.shareRecipe();
        break;
      case 'print':
        this.printRecipe();
        break;
    }
  }
  
  async saveRecipe() {
    try {
      const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_RECIPES) || '[]');
      const isAlreadySaved = favorites.some(fav => fav.id === this.currentRecipe.id);
      
      if (isAlreadySaved) {
        showToast('Recipe is already saved!', 'info');
        return;
      }
      
      favorites.push({
        ...this.currentRecipe,
        savedAt: Date.now()
      });
      
      localStorage.setItem(STORAGE_KEYS.FAVORITE_RECIPES, JSON.stringify(favorites));
      showToast('Recipe saved successfully!', 'success');
      
      this.emit('recipeSaved', this.currentRecipe);
      
    } catch (error) {
      console.error('Failed to save recipe:', error);
      showToast('Failed to save recipe', 'error');
    }
  }
  
  async shareRecipe() {
    const recipe = this.currentRecipe;
    const shareData = {
      title: recipe.title,
      text: `Check out this delicious recipe: ${recipe.title}`,
      url: recipe.sourceUrl || window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        this.emit('recipeShared', recipe);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        const success = await copyToClipboard(shareText);
        
        if (success) {
          showToast('Recipe link copied to clipboard!', 'success');
          this.emit('recipeShared', recipe);
        } else {
          showToast('Failed to share recipe', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to share recipe:', error);
      showToast('Failed to share recipe', 'error');
    }
  }
  
  printRecipe() {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    const recipe = this.currentRecipe;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.title} - Recipe</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 10px; }
          h2 { color: #1B5E20; margin-top: 30px; }
          .meta { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .ingredients { list-style: none; padding: 0; }
          .ingredients li { padding: 5px 0; border-bottom: 1px solid #eee; }
          .instructions { counter-reset: step-counter; }
          .instructions li { counter-increment: step-counter; margin: 15px 0; }
          .instructions li::before { content: counter(step-counter) ". "; font-weight: bold; color: #2E7D32; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${sanitizeHTML(recipe.title)}</h1>
        <div class="meta">
          ${recipe.readyInMinutes ? `<p><strong>Cooking Time:</strong> ${formatCookingTime(recipe.readyInMinutes)}</p>` : ''}
          <p><strong>Servings:</strong> ${this.currentServings}</p>
          ${recipe.rating ? `<p><strong>Rating:</strong> ${recipe.rating.toFixed(1)}/5</p>` : ''}
        </div>
        
        ${recipe.ingredients ? `
          <h2>Ingredients</h2>
          <ul class="ingredients">
            ${recipe.ingredients.map(ingredient => `
              <li>${this.scaleIngredientAmount(ingredient.amount, ingredient.unit)} ${sanitizeHTML(ingredient.name)}</li>
            `).join('')}
          </ul>
        ` : ''}
        
        ${recipe.instructions ? `
          <h2>Instructions</h2>
          <ol class="instructions">
            ${recipe.instructions.map(instruction => `
              <li>${sanitizeHTML(instruction.step)}</li>
            `).join('')}
          </ol>
        ` : ''}
        
        ${recipe.sourceUrl ? `<p><strong>Source:</strong> <a href="${recipe.sourceUrl}">${recipe.sourceUrl}</a></p>` : ''}
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    
    this.emit('recipePrinted', recipe);
  }
  
  // Utility methods
  
  isIngredientAvailable(ingredientName) {
    // This would typically check against user's selected ingredients
    // For now, return false as we don't have access to the ingredient input
    return false;
  }
  
  scaleIngredientAmount(amount, unit) {
    if (!amount || isNaN(amount)) return amount || '';
    
    const originalServings = this.currentRecipe.servings || 4;
    const scalingFactor = this.currentServings / originalServings;
    const scaledAmount = amount * scalingFactor;
    
    // Format the scaled amount nicely
    let formattedAmount;
    if (scaledAmount < 0.125) {
      formattedAmount = '⅛';
    } else if (scaledAmount < 0.25) {
      formattedAmount = '¼';
    } else if (scaledAmount < 0.375) {
      formattedAmount = '⅓';
    } else if (scaledAmount < 0.5) {
      formattedAmount = '½';
    } else if (scaledAmount < 0.75) {
      formattedAmount = '⅔';
    } else if (scaledAmount < 1) {
      formattedAmount = '¾';
    } else if (scaledAmount % 1 === 0) {
      formattedAmount = scaledAmount.toString();
    } else {
      formattedAmount = scaledAmount.toFixed(1);
    }
    
    return unit ? `${formattedAmount} ${unit}` : formattedAmount;
  }
  
  trapFocus() {
    // Simple focus trap for accessibility
    const focusableElements = this.modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
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
    this.listeners.clear();
    this.close();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecipeModal;
}