# Debug Instructions for Auto-Search Bug

## Problem
The recipe finder automatically starts searching for recipes immediately upon page load, showing the loading spinner with "Searching for delicious recipes..." before the user can add any ingredients.

## Debug Steps

### 1. Open Browser Console
1. Open any of these test files in your browser:
   - `minimal-test.html` (simplest test)
   - `debug-trace.html` (with visual logging)
   - `index.html` (main app)

2. Open browser developer tools (F12)
3. Go to the Console tab

### 2. Look for These Key Log Messages

**If you see this, the public API is being called:**
```
🔍 PUBLIC searchRecipes called with: [ingredients] [filters]
```

**If you see this, ingredients are being added automatically:**
```
🥄 addCustomIngredient called with: [ingredient_name]
🥕 addIngredient called with: [ingredient_object]
```

**If you see this, filter changes are triggering search:**
```
🔧 handleFilterChange called with: [filter_data]
🔧 Filter change will trigger search
```

**If you see this, the search is being triggered:**
```
🔍 performSearch called with ingredients: [ingredients]
```

**If you see this, the loading overlay is being shown:**
```
🔄 showLoading called with: true
```

### 3. Check Call Stack
Each log message includes a call stack that shows exactly what code triggered the event. Look for the call stack after each log message to trace the source.

### 4. Expected vs Actual Behavior

**Expected (correct) behavior:**
- App loads
- No loading spinner appears
- User can add ingredients
- User clicks "Find Recipes" button
- Then loading spinner appears

**Actual (buggy) behavior:**
- App loads
- Loading spinner appears immediately
- Shows "Searching for delicious recipes..."
- This happens before user interaction

### 5. Report Findings
Please copy and paste the console logs that appear when you load the page, especially:
1. Any logs that appear before you interact with the page
2. The complete call stack for any unexpected method calls
3. Whether the minimal-test.html shows the same issue

## Test Files Explanation

- **minimal-test.html**: Loads all components but with minimal styling, easier to debug
- **debug-trace.html**: Shows logs visually on the page as well as in console
- **index.html**: The main application with full styling

All three should behave the same way - no auto-search should occur.