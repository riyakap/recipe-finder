# Ingredient Input System Design

## Overview
The ingredient input system combines text input with smart suggestions that convert to visual tags, providing an intuitive and efficient way for users to specify their available ingredients.

## Core Components

### 1. Input Field
**HTML Structure:**
```html
<div class="ingredient-input-container">
  <input type="text" 
         id="ingredient-input" 
         placeholder="Type ingredients (e.g., chicken, rice, tomatoes)..."
         autocomplete="off">
  <div class="suggestions-dropdown" id="suggestions"></div>
</div>
<div class="ingredient-tags" id="ingredient-tags"></div>
```

**Behavior:**
- Focus state: Border color changes to primary green
- Typing: Triggers suggestion search after 2+ characters
- Enter/Tab/Click: Converts suggestion to tag
- Backspace on empty input: Removes last tag

### 2. Suggestion System

#### Data Source
**Static Ingredient Database (JSON):**
```json
{
  "common_ingredients": [
    {
      "name": "chicken breast",
      "category": "protein",
      "aliases": ["chicken", "chicken breasts", "breast meat"]
    },
    {
      "name": "rice",
      "category": "grain",
      "aliases": ["white rice", "jasmine rice", "basmati rice"]
    },
    {
      "name": "tomatoes",
      "category": "vegetable",
      "aliases": ["tomato", "fresh tomatoes", "roma tomatoes"]
    }
  ]
}
```

**Categories for Organization:**
- Proteins (chicken, beef, fish, eggs, tofu)
- Vegetables (onions, tomatoes, peppers, carrots)
- Grains (rice, pasta, bread, quinoa)
- Dairy (milk, cheese, yogurt, butter)
- Pantry (oil, salt, spices, herbs)
- Fruits (apples, bananas, berries, citrus)

#### Search Algorithm
```javascript
function searchIngredients(query) {
  const results = [];
  const queryLower = query.toLowerCase();
  
  // Exact name matches (highest priority)
  ingredients.forEach(ingredient => {
    if (ingredient.name.toLowerCase().startsWith(queryLower)) {
      results.push({...ingredient, priority: 1});
    }
  });
  
  // Alias matches (medium priority)
  ingredients.forEach(ingredient => {
    ingredient.aliases.forEach(alias => {
      if (alias.toLowerCase().includes(queryLower)) {
        results.push({...ingredient, priority: 2});
      }
    });
  });
  
  // Partial matches (lowest priority)
  ingredients.forEach(ingredient => {
    if (ingredient.name.toLowerCase().includes(queryLower)) {
      results.push({...ingredient, priority: 3});
    }
  });
  
  // Remove duplicates and sort by priority
  return [...new Set(results)]
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 8); // Limit to 8 suggestions
}
```

#### Suggestion Dropdown
**Visual Design:**
```
┌─────────────────────────────────────┐
│ 🥗 chicken breast          protein  │
│ 🍗 chicken thighs          protein  │
│ 🐔 whole chicken           protein  │
│ 🍖 chicken wings           protein  │
│ 🥘 chicken stock           pantry   │
└─────────────────────────────────────┘
```

**Features:**
- Maximum 8 suggestions visible
- Category icons for visual grouping
- Keyboard navigation (↑↓ arrows)
- Mouse hover highlighting
- Click or Enter to select

### 3. Tag System

#### Tag Creation
**When user selects ingredient:**
1. Clear input field
2. Create tag element
3. Add to tags container
4. Update internal ingredients array
5. Focus back to input

#### Tag Visual Design
```html
<span class="ingredient-tag" data-ingredient="chicken breast">
  <span class="tag-icon">🥗</span>
  <span class="tag-text">chicken breast</span>
  <button class="tag-remove" aria-label="Remove chicken breast">×</button>
</span>
```

**CSS Styling:**
```css
.ingredient-tag {
  display: inline-flex;
  align-items: center;
  background: #E8F5E8;
  color: #2E7D32;
  border: 1px solid #C8E6C9;
  border-radius: 20px;
  padding: 6px 12px;
  margin: 4px;
  font-size: 14px;
  animation: slideIn 0.2s ease-out;
}

.tag-remove {
  background: none;
  border: none;
  color: #666;
  margin-left: 8px;
  cursor: pointer;
  font-size: 16px;
}

.tag-remove:hover {
  color: #D32F2F;
}
```

#### Tag Management
**Features:**
- Remove individual tags (× button)
- Clear all tags (separate button)
- Prevent duplicate ingredients
- Maximum 15 ingredients (reasonable limit)
- Drag to reorder (future enhancement)

### 4. User Experience Flow

#### Interaction Sequence
```mermaid
graph TD
    A[User clicks input field] --> B[Field gains focus]
    B --> C[User types ingredient]
    C --> D{Length >= 2?}
    D -->|No| C
    D -->|Yes| E[Search suggestions]
    E --> F[Display dropdown]
    F --> G{User action?}
    G -->|Types more| C
    G -->|Clicks suggestion| H[Create tag]
    G -->|Presses Enter| I{Suggestion selected?}
    I -->|Yes| H
    I -->|No| J[Try exact match]
    J --> K{Match found?}
    K -->|Yes| H
    K -->|No| L[Show "not found" hint]
    H --> M[Clear input]
    M --> N[Focus input]
    N --> C
```

#### Keyboard Shortcuts
- **↓ Arrow**: Navigate down suggestions
- **↑ Arrow**: Navigate up suggestions
- **Enter**: Select highlighted suggestion or create custom tag
- **Escape**: Close suggestions dropdown
- **Tab**: Select first suggestion and move to next field
- **Backspace** (empty input): Remove last tag

#### Mobile Considerations
- Larger touch targets (44px minimum)
- Prevent zoom on input focus
- Swipe to remove tags
- Voice input support
- Autocorrect disabled

### 5. Data Management

#### Internal State
```javascript
class IngredientManager {
  constructor() {
    this.selectedIngredients = [];
    this.suggestions = [];
    this.currentQuery = '';
  }
  
  addIngredient(ingredient) {
    if (!this.isDuplicate(ingredient)) {
      this.selectedIngredients.push({
        name: ingredient.name,
        category: ingredient.category,
        id: this.generateId()
      });
      this.renderTags();
    }
  }
  
  removeIngredient(id) {
    this.selectedIngredients = this.selectedIngredients
      .filter(ing => ing.id !== id);
    this.renderTags();
  }
  
  getIngredientsList() {
    return this.selectedIngredients.map(ing => ing.name);
  }
}
```

#### Local Storage
```javascript
// Save user's frequently used ingredients
function saveFrequentIngredients(ingredients) {
  const frequent = JSON.parse(localStorage.getItem('frequentIngredients') || '[]');
  ingredients.forEach(ingredient => {
    const existing = frequent.find(f => f.name === ingredient);
    if (existing) {
      existing.count++;
    } else {
      frequent.push({ name: ingredient, count: 1 });
    }
  });
  
  // Keep top 20 most frequent
  frequent.sort((a, b) => b.count - a.count);
  localStorage.setItem('frequentIngredients', JSON.stringify(frequent.slice(0, 20)));
}
```

### 6. Performance Optimizations

#### Debounced Search
```javascript
const debouncedSearch = debounce((query) => {
  const suggestions = searchIngredients(query);
  renderSuggestions(suggestions);
}, 300);
```

#### Virtual Scrolling (for large ingredient lists)
- Only render visible suggestions
- Lazy load ingredient database
- Cache search results

#### Memory Management
- Clean up event listeners
- Limit suggestion history
- Garbage collect unused elements

### 7. Accessibility Features

#### Screen Reader Support
```html
<div role="combobox" 
     aria-expanded="false" 
     aria-haspopup="listbox"
     aria-label="Add ingredients">
  <input type="text" 
         aria-describedby="ingredient-help"
         aria-autocomplete="list">
</div>
<div id="ingredient-help" class="sr-only">
  Type ingredient names and select from suggestions
</div>
```

#### ARIA Labels
- Dynamic aria-expanded for dropdown state
- aria-selected for highlighted suggestions
- aria-label for remove buttons
- Live region for tag additions/removals

#### Keyboard Navigation
- Full keyboard accessibility
- Focus management
- Skip links for screen readers
- High contrast mode support

### 8. Error Handling

#### Common Scenarios
1. **No suggestions found**: Show "Try a different spelling" hint
2. **Network error**: Fall back to cached ingredients
3. **Too many ingredients**: Show warning at 15+ ingredients
4. **Invalid characters**: Filter out special characters
5. **Empty submission**: Highlight required field

#### User Feedback
```html
<div class="input-feedback" role="alert">
  <span class="feedback-icon">ℹ️</span>
  <span class="feedback-text">Try "chicken" instead of "chiken"</span>
</div>
```

This system provides a smooth, intuitive experience for ingredient input while maintaining performance and accessibility standards.