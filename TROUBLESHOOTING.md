# Recipe Finder - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue: "Searching for delicious recipes..." never finishes

**Possible Causes:**
1. **CORS Error (Most Common)**: Running from `file://` protocol
2. **No ingredients added**: Search button clicked without adding ingredients
3. **API Key issues**: Invalid or expired Spoonacular API key
4. **Network connectivity**: Internet connection problems

**Solutions:**

#### 1. CORS Error (Running from file://)
**Problem**: Modern browsers block API calls when running HTML files directly from disk.

**Solution A - Use Local Server (Recommended):**
```bash
# Option 1: Python (if installed)
python -m http.server 8000
# Then visit: http://localhost:8000

# Option 2: Node.js (if installed)
npx serve .
# Then visit: http://localhost:3000

# Option 3: PHP (if installed)
php -S localhost:8000
# Then visit: http://localhost:8000

# Option 4: VS Code Live Server Extension
# Install "Live Server" extension, right-click index.html, select "Open with Live Server"
```

**Solution B - Use Online Hosting:**
- Upload to [Netlify Drop](https://app.netlify.com/drop) (drag & drop folder)
- Use [GitHub Pages](https://pages.github.com/)
- Use [Vercel](https://vercel.com/)

#### 2. No Ingredients Added
**Problem**: Clicking search without adding any ingredients.

**Solution:**
1. Type an ingredient in the input field (e.g., "chicken")
2. Select from the dropdown suggestions or press Enter
3. You should see ingredient tags appear below the input
4. Then click "Find Recipes"

#### 3. API Key Issues
**Problem**: Invalid or expired Spoonacular API key.

**Solution:**
1. Get a new API key from [Spoonacular](https://spoonacular.com/food-api)
2. Open `js/utils/constants.js`
3. Replace the API key on line 9:
   ```javascript
   API_KEY: 'your-new-api-key-here'
   ```
4. The app will automatically fall back to TheMealDB if Spoonacular fails

#### 4. Network Issues
**Problem**: No internet connection or API servers down.

**Solution:**
- Check your internet connection
- Try the test page: open `test.html` to diagnose API issues
- The app should automatically fall back to TheMealDB if Spoonacular fails

---

## 🔧 Debug Tools

### Test Page
Open [`test.html`](test.html) to run diagnostic tests:
- Environment check (protocol, user agent, API key status)
- API connectivity tests
- Quick recipe search test

### Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages or debug logs
4. Common errors:
   - `CORS error`: Use local server
   - `Failed to fetch`: Network/API issue
   - `API key invalid`: Check your Spoonacular key

### Debug Mode
When running on localhost or file://, debug mode is automatically enabled:
- Detailed console logging
- Missing DOM element warnings
- API call debugging

---

## 📋 Step-by-Step Testing

### 1. Basic Functionality Test
1. Open the app (preferably via local server)
2. Type "chicken" in the ingredient input
3. Select "chicken breast" from suggestions
4. Verify the ingredient tag appears
5. Click "Find Recipes"
6. Should see recipes or error message

### 2. API Test
1. Open `test.html`
2. Click "Test TheMealDB (Free)" - should work without API key
3. Click "Test Spoonacular (API Key)" - tests your API key
4. Check results for any errors

### 3. Network Test
1. Disconnect internet
2. Try searching - should show network error
3. Reconnect internet
4. Try again - should work

---

## 🐛 Specific Error Messages

### "Please add at least one ingredient"
- **Cause**: No ingredients selected
- **Fix**: Add ingredients using the input field

### "API key is missing or invalid"
- **Cause**: Spoonacular API key issue
- **Fix**: Check/update API key in constants.js

### "Please check your internet connection"
- **Cause**: Network connectivity issue
- **Fix**: Check internet connection, try again

### "Too many requests. Please wait a moment"
- **Cause**: Exceeded Spoonacular API rate limit
- **Fix**: Wait a few minutes, or app will use TheMealDB fallback

### "We couldn't load recipes right now"
- **Cause**: General API error
- **Fix**: Try again, check network, verify API key

---

## 🔍 Advanced Debugging

### Check API Responses
Open browser Network tab to see API calls:
1. F12 → Network tab
2. Try a search
3. Look for failed requests (red entries)
4. Click on failed requests to see error details

### Manual API Test
Test Spoonacular API directly in browser:
```
https://api.spoonacular.com/recipes/findByIngredients?ingredients=chicken&number=5&apiKey=YOUR_API_KEY_HERE
```

### Check File Loading
Ensure all files are loading correctly:
- CSS files should load (check Network tab)
- JavaScript files should load without errors
- ingredients.json should load successfully

---

## 💡 Tips for Success

1. **Always use a local server** for development
2. **Check browser console** for error messages
3. **Test with simple ingredients** first (chicken, rice, etc.)
4. **Verify API key** is correctly added to constants.js
5. **Try the test page** for quick diagnostics
6. **Use fallback**: App works without Spoonacular API key

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Try the test page** (`test.html`) first
2. **Check browser console** for specific error messages
3. **Verify file structure** matches the documentation
4. **Test with a simple local server** setup
5. **Try without API key** (uses free TheMealDB)

The app is designed to be resilient and should work even with limited functionality if some features fail.