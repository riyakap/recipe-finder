// Recipe Finder - Recipe Card Component

class RecipeCard {
  constructor(recipe, searchIngredients = []) {
    this.recipe = recipe;
    this.searchIngredients = searchIngredients;
    this.element = null;
    this.listeners = new Map();
  }
  
  render() {
    this.element = this.createElement();
    this.setupEventListeners();
    return this.element;
  }
  
  createElement() {
    const card = createElement('div', {
      className: 'recipe-card',
      dataset: {
        recipeId: this.recipe.id,
        source: this.recipe.source || 'spoonacular'
      }
    });
    
    // Image container
    const imageContainer = createElement('div', {
      className: 'recipe-image-container'
    });
    
    const image = createElement('img', {
      className: 'recipe-image lazy',
      dataset: { src: this.recipe.image },
      alt: this.recipe.title,
      loading: 'lazy'
    });
    
    // Handle image loading
    this.setupLazyLoading(image);
    handleImageError(image);
    
    imageContainer.appendChild(image);
    
    // Rating overlay
    if (this.recipe.rating && this.recipe.rating > 0) {
      const rating = createElement('div', {
        className: 'recipe-rating'
      }, `⭐ ${this.recipe.rating.toFixed(1)}`);
      imageContainer.appendChild(rating);
    }
    
    card.appendChild(imageContainer);
    
    // Content container
    const content = createElement('div', {
      className: 'recipe-content'
    });
    
    // Title
    const title = createElement('h3', {
      className: 'recipe-title'
    }, sanitizeHTML(this.recipe.title));
    content.appendChild(title);
    
    // Meta information
    const meta = createElement('div', {
      className: 'recipe-meta'
    });
    
    if (this.recipe.readyInMinutes) {
      const timeItem = createElement('span', {
        className: 'meta-item'
      }, `⏱️ ${formatCookingTime(this.recipe.readyInMinutes)}`);
      meta.appendChild(timeItem);
    }
    
    if (this.recipe.servings) {
      const servingsItem = createElement('span', {
        className: 'meta-item'
      }, `👥 ${formatServings(this.recipe.servings)}`);
      meta.appendChild(servingsItem);
    }
    
    content.appendChild(meta);
    
    // Ingredient matching (only show if we have search ingredients)
    if (this.searchIngredients.length > 0) {
      const ingredientMatch = this.createIngredientMatch();
      content.appendChild(ingredientMatch);
    }
    
    // Summary
    if (this.recipe.summary) {
      const summary = createElement('p', {
        className: 'recipe-summary'
      }, sanitizeHTML(truncateText(this.recipe.summary, 120)));
      content.appendChild(summary);
    }
    
    // View recipe button
    const viewButton = createElement('button', {
      className: 'view-recipe-btn',
      type: 'button',
      'aria-label': `View recipe for ${this.recipe.title}`
    }, 'View Recipe');
    
    content.appendChild(viewButton);
    card.appendChild(content);
    
    return card;
  }
  
  createIngredientMatch() {
    const matchContainer = createElement('div', {
      className: 'ingredient-match'
    });
    
    // Used ingredients
    if (this.recipe.usedIngredients && this.recipe.usedIngredients.length > 0) {
      const usedContainer = createElement('div', {
        className: 'used-ingredients'
      });
      
      const usedLabel = createElement('span', {
        className: 'match-label'
      }, '✅ Have:');
      
      const usedList = createElement('span', {
        className: 'ingredient-list'
      }, formatIngredientList(this.recipe.usedIngredients, 3));
      
      usedContainer.appendChild(usedLabel);
      usedContainer.appendChild(usedList);
      matchContainer.appendChild(usedContainer);
    }
    
    // Missing ingredients
    if (this.recipe.missedIngredients && this.recipe.missedIngredients.length > 0) {
      const missedContainer = createElement('div', {
        className: 'missing-ingredients'
      });
      
      const missedLabel = createElement('span', {
        className: 'match-label'
      }, '🛒 Need:');
      
      const missedList = createElement('span', {
        className: 'ingredient-list'
      }, formatIngredientList(this.recipe.missedIngredients, 2));
      
      missedContainer.appendChild(missedLabel);
      missedContainer.appendChild(missedList);
      matchContainer.appendChild(missedContainer);
    }
    
    return matchContainer;
  }
  
  setupLazyLoading(image) {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });
      
      imageObserver.observe(image);
    } else {
      // Fallback for older browsers
      image.src = image.dataset.src;
      image.classList.remove('lazy');
    }
  }
  
  setupEventListeners() {
    if (!this.element) return;
    
    // Card click handler
    this.element.addEventListener('click', this.handleCardClick.bind(this));
    
    // View recipe button click handler
    const viewButton = this.element.querySelector('.view-recipe-btn');
    if (viewButton) {
      viewButton.addEventListener('click', this.handleViewRecipe.bind(this));
    }
    
    // Keyboard navigation
    this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Make card focusable
    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('aria-label', `Recipe: ${this.recipe.title}`);
  }
  
  handleCardClick(event) {
    // Don't trigger if clicking on the view button
    if (event.target.classList.contains('view-recipe-btn')) {
      return;
    }
    
    this.handleViewRecipe(event);
  }
  
  handleViewRecipe(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.emit('viewRecipe', {
      recipe: this.recipe,
      element: this.element
    });
  }
  
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleViewRecipe(event);
    }
  }
  
  updateRecipe(recipe) {
    this.recipe = { ...this.recipe, ...recipe };
    
    // Re-render if element exists
    if (this.element && this.element.parentNode) {
      const parent = this.element.parentNode;
      const newElement = this.render();
      parent.replaceChild(newElement, this.element);
    }
  }
  
  highlight() {
    if (this.element) {
      this.element.classList.add('highlighted');
      this.element.focus();
    }
  }
  
  removeHighlight() {
    if (this.element) {
      this.element.classList.remove('highlighted');
    }
  }
  
  show() {
    if (this.element) {
      showElement(this.element, 'fade-in');
    }
  }
  
  hide() {
    if (this.element) {
      hideElement(this.element);
    }
  }
  
  getElement() {
    return this.element;
  }
  
  getRecipe() {
    return this.recipe;
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
    
    if (this.element) {
      this.element.removeEventListener('click', this.handleCardClick);
      this.element.removeEventListener('keydown', this.handleKeydown);
      
      const viewButton = this.element.querySelector('.view-recipe-btn');
      if (viewButton) {
        viewButton.removeEventListener('click', this.handleViewRecipe);
      }
      
      // Remove from DOM
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }
  
  // Static method to create skeleton loading cards
  static createSkeleton() {
    const skeleton = createElement('div', {
      className: 'recipe-skeleton'
    });
    
    const skeletonImage = createElement('div', {
      className: 'skeleton-image'
    });
    skeleton.appendChild(skeletonImage);
    
    const skeletonContent = createElement('div', {
      className: 'skeleton-content'
    });
    
    const skeletonTitle = createElement('div', {
      className: 'skeleton-title'
    });
    skeletonContent.appendChild(skeletonTitle);
    
    const skeletonMeta = createElement('div', {
      className: 'skeleton-meta'
    });
    skeletonContent.appendChild(skeletonMeta);
    
    const skeletonText1 = createElement('div', {
      className: 'skeleton-text'
    });
    skeletonContent.appendChild(skeletonText1);
    
    const skeletonText2 = createElement('div', {
      className: 'skeleton-text short'
    });
    skeletonContent.appendChild(skeletonText2);
    
    const skeletonButton = createElement('div', {
      className: 'skeleton-button'
    });
    skeletonContent.appendChild(skeletonButton);
    
    skeleton.appendChild(skeletonContent);
    
    return skeleton;
  }
  
  // Static method to create multiple skeleton cards
  static createSkeletons(count = 6) {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      skeletons.push(RecipeCard.createSkeleton());
    }
    return skeletons;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecipeCard;
}