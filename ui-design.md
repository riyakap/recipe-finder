# Recipe Generator - UI Design & Wireframes

## Design Philosophy
- **Minimalistic**: Clean, uncluttered interface focusing on essential functionality
- **Intuitive**: Self-explanatory controls with clear visual hierarchy
- **Mobile-first**: Responsive design that works seamlessly on all devices
- **Fast**: Quick loading and immediate feedback for user actions

## Color Palette
```
Primary: #2E7D32 (Forest Green) - Fresh, food-related
Secondary: #FFA726 (Warm Orange) - Appetizing, energetic
Background: #FAFAFA (Off-white) - Clean, minimal
Text: #212121 (Dark Gray) - High contrast, readable
Accent: #E8F5E8 (Light Green) - Subtle highlights
Error: #D32F2F (Red) - Clear error indication
```

## Typography
- **Primary Font**: Inter (clean, modern, web-safe)
- **Headings**: 24px, 20px, 18px (h1, h2, h3)
- **Body**: 16px (optimal readability)
- **Small text**: 14px (labels, hints)

## Layout Structure

### Header Section
```
┌─────────────────────────────────────────────────────┐
│  🍳 Recipe Finder                    [About] [Help] │
│  Find perfect recipes with what you have            │
└─────────────────────────────────────────────────────┘
```

### Main Input Section
```
┌─────────────────────────────────────────────────────┐
│  What ingredients do you have?                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Type ingredients... [chicken] [rice] [×]        │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ Cooking Time │ │ Serves       │ │ Diet         │ │
│  │ [30 min ▼]   │ │ [4 people ▼] │ │ [Any ▼]      │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                     │
│           [Find Recipes] (Primary Button)           │
└─────────────────────────────────────────────────────┘
```

### Results Section
```
┌─────────────────────────────────────────────────────┐
│  Found 12 recipes for you                           │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ [Image]     │ │ [Image]     │ │ [Image]     │   │
│  │ Chicken     │ │ Fried Rice  │ │ Chicken     │   │
│  │ Stir Fry    │ │ Special     │ │ Curry       │   │
│  │ ⏱ 25 min    │ │ ⏱ 20 min    │ │ ⏱ 35 min    │   │
│  │ 👥 4 people  │ │ 👥 4 people  │ │ 👥 4 people  │   │
│  │ ⭐ 4.5       │ │ ⭐ 4.2       │ │ ⭐ 4.7       │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Ingredient Input Component
**Features:**
- Text input with placeholder "Type ingredients..."
- Auto-suggestions dropdown appears as user types
- Selected ingredients become removable tags
- Visual feedback for valid/invalid ingredients

**States:**
- Empty: Placeholder text visible
- Typing: Suggestions dropdown visible
- With tags: Ingredients displayed as colored tags with × button

### 2. Filter Dropdowns
**Cooking Time Options:**
- 15 minutes or less
- 30 minutes or less
- 45 minutes or less
- 1 hour or less
- More than 1 hour
- Any time

**Serves Options:**
- 1 person
- 2 people
- 4 people
- 6 people
- 8+ people

**Dietary Options:**
- Any
- Vegetarian
- Vegan
- Gluten-free
- Dairy-free
- Low-carb
- Keto

### 3. Recipe Card Component
**Layout:**
```
┌─────────────────────────┐
│ [Recipe Image 200x150]  │
│ Recipe Title            │
│ ⏱ Time 👥 Serves ⭐ Rating │
│ Brief description...    │
│ [View Recipe] button    │
└─────────────────────────┘
```

**Hover State:**
- Subtle shadow elevation
- Slight scale transform (1.02x)
- Button color change

### 4. Recipe Detail Modal/Page
**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [×] Close                                           │
│                                                     │
│ ┌─────────────┐  Recipe Title                       │
│ │ [Large      │  ⏱ 30 min 👥 4 people ⭐ 4.5         │
│ │  Image]     │                                     │
│ │             │  Ingredients:                       │
│ └─────────────┘  • 2 chicken breasts               │
│                  • 1 cup rice                      │
│                  • 2 tbsp soy sauce                │
│                                                     │
│ Instructions:                                       │
│ 1. Heat oil in pan...                              │
│ 2. Add chicken and cook...                         │
│ 3. Serve hot with rice...                          │
│                                                     │
│ [Save Recipe] [Share] [Print]                       │
└─────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (320px - 768px)
- Single column layout
- Stacked filter controls
- Full-width recipe cards
- Simplified navigation

### Tablet (768px - 1024px)
- Two-column recipe grid
- Horizontal filter layout
- Larger touch targets

### Desktop (1024px+)
- Three-column recipe grid
- Full horizontal layout
- Hover effects enabled
- Larger images and text

## Loading States

### Initial Load
- Skeleton screens for recipe cards
- Animated placeholder rectangles
- "Loading recipes..." text

### Search Loading
- Spinner overlay on results section
- Disabled search button
- "Searching..." text

### Image Loading
- Gray placeholder rectangles
- Fade-in animation when loaded
- Fallback to default recipe icon

## Error States

### No Results
```
┌─────────────────────────────────────────────────────┐
│              🔍                                     │
│         No recipes found                            │
│    Try different ingredients or                     │
│         adjust your filters                         │
│                                                     │
│        [Clear Filters] [Try Again]                  │
└─────────────────────────────────────────────────────┘
```

### API Error
```
┌─────────────────────────────────────────────────────┐
│              ⚠️                                      │
│      Something went wrong                           │
│   We couldn't load recipes right now               │
│                                                     │
│           [Try Again]                               │
└─────────────────────────────────────────────────────┘
```

### Network Error
```
┌─────────────────────────────────────────────────────┐
│              📡                                     │
│       Connection problem                            │
│    Check your internet connection                   │
│                                                     │
│           [Retry]                                   │
└─────────────────────────────────────────────────────┘
```

## Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Meets WCAG AA standards
- **Focus Indicators**: Clear visual focus states
- **Alt Text**: Descriptive text for all images
- **Semantic HTML**: Proper heading hierarchy and landmarks