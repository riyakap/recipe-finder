# Recipe Finder - Quick Start Guide

## 🚀 How to Run the App

### Option 1: Simple Test (Recommended)
1. **Open the test page first**: Double-click [`test.html`](test.html)
2. **Run the API tests** to make sure everything works
3. **Then open the main app**: Double-click [`index.html`](index.html)

### Option 2: Local Server (Best Experience)
```bash
# If you have Python installed:
python -m http.server 8000
# Then visit: http://localhost:8000

# If you have Node.js installed:
npx serve .
# Then visit: http://localhost:3000
```

## ✅ Fixed Issues

**Problem**: App was auto-searching on page load without ingredients
**Solution**: Fixed FilterManager initialization to prevent unwanted events

**Problem**: Loading screen appeared immediately 
**Solution**: Removed auto-search triggers during app startup

## 🎯 How to Use

1. **Open the app** - You should see a clean interface with no loading
2. **Add ingredients**:
   - Type "chicken" in the input field
   - Select "chicken breast" from the dropdown
   - You should see a green tag appear
3. **Set preferences** (optional):
   - Choose cooking time
   - Select number of servings
   - Pick dietary restrictions
4. **Search**: Click "Find Recipes" button
5. **View results**: Click any recipe card to see details

## 🔧 Troubleshooting

**If the app still auto-searches:**
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- Try in an incognito/private window

**If you see CORS errors:**
- Use a local server instead of opening the file directly
- Or try the test page first to diagnose issues

**If no ingredients appear:**
- Check that `data/ingredients.json` is loading
- Open browser console (F12) to see any error messages

## 🧪 Test Your Setup

1. **Open [`test.html`](test.html)**
2. **Click "Test TheMealDB (Free)"** - should show recipes
3. **Click "Test Spoonacular (API Key)"** - should work with your API key
4. **Try "Quick Recipe Search"** - enter "chicken" and search

If all tests pass, the main app should work perfectly!

## 📞 Still Having Issues?

Check the detailed [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) guide for more solutions.