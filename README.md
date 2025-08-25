# 🍳 Recipe Finder

A modern, responsive web application that helps you find delicious recipes based on ingredients you have at home. Built with vanilla JavaScript, HTML, and CSS for optimal performance and simplicity.

![Recipe Finder Screenshot](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Recipe+Finder+App)

## ✨ Features

- **Smart Ingredient Input**: Type ingredients with intelligent autocomplete suggestions
- **Advanced Filtering**: Filter by cooking time, servings, and dietary restrictions
- **Recipe Discovery**: Find recipes using Spoonacular API with fallback support
- **Detailed Recipe View**: View complete recipes with ingredients, instructions, and nutrition
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Offline Support**: Basic functionality works offline with cached data
- **Fast Performance**: Optimized with caching and efficient API usage

## 🚀 Live Demo

Visit the live application: [Recipe Finder on Vercel](https://your-app-name.vercel.app)

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **APIs**: Spoonacular Recipe API
- **Deployment**: Vercel
- **Storage**: LocalStorage for caching and preferences
- **Architecture**: Component-based modular design

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Spoonacular API key (optional - app works with fallback data)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/recipe-finder.git
cd recipe-finder
```

### 2. Configure API Key (Optional)

1. Get a free API key from [Spoonacular](https://spoonacular.com/food-api)
2. Open `js/utils/constants.js`
3. Replace `YOUR_SPOONACULAR_API_KEY_HERE` with your actual API key:

```javascript
const API_CONFIG = {
  SPOONACULAR: {
    API_KEY: 'your-actual-api-key-here',
    // ... rest of config
  }
};
```

### 3. Run Locally

#### Option A: Simple HTTP Server (Python)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option B: Node.js HTTP Server
```bash
npx http-server -p 8000
```

#### Option C: Live Server (VS Code Extension)
- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

Visit `http://localhost:8000` in your browser.

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (Recommended):
   - Push your code to GitHub
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically deploy

3. **Deploy via CLI**:
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Drag & Drop**: Zip your project and drag to [netlify.com/drop](https://netlify.com/drop)
2. **Git Integration**: Connect your GitHub repo at [netlify.com](https://netlify.com)

### Deploy to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Select source: "Deploy from a branch"
   - Choose "main" branch, "/ (root)" folder
   - Save

2. **Access your site**: `https://yourusername.github.io/recipe-finder`

## 📁 Project Structure

```
recipe-finder/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Core styles
│   ├── components.css      # Component-specific styles
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── app.js             # Main application logic
│   ├── utils/
│   │   ├── constants.js   # Configuration and constants
│   │   └── helpers.js     # Utility functions
│   ├── services/
│   │   ├── RecipeAPI.js   # API service layer
│   │   └── CacheManager.js # Caching system
│   └── components/
│       ├── IngredientInput.js  # Ingredient input component
│       ├── FilterManager.js    # Filter management
│       ├── RecipeCard.js      # Recipe card component
│       └── RecipeModal.js     # Recipe detail modal
├── data/
│   └── ingredients.json   # Ingredient database
├── docs/                  # Documentation files
├── README.md             # This file
├── vercel.json          # Vercel configuration
└── package.json         # Project metadata
```

## 🔑 Environment Variables

For production deployment, set these environment variables:

- `SPOONACULAR_API_KEY`: Your Spoonacular API key

### Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project → Settings → Environment Variables
3. Add: `SPOONACULAR_API_KEY` = `your-api-key-here`

## 🎯 Usage

1. **Add Ingredients**: Type ingredients in the search box and select from suggestions
2. **Set Filters**: Choose cooking time, servings, and dietary preferences
3. **Find Recipes**: Click "Find Recipes" to search
4. **View Details**: Click any recipe card to see full details
5. **Save Favorites**: Bookmark recipes you like (feature coming soon)

## 🧪 Testing

### Manual Testing Checklist

- [ ] Ingredient input and suggestions work
- [ ] Filters apply correctly
- [ ] Recipe search returns results
- [ ] Recipe modal displays properly
- [ ] Responsive design works on mobile
- [ ] App works without API key (fallback mode)
- [ ] Caching improves performance

### Debug Tools

Open browser console and use:

```javascript
// Clear all caches
debugRecipeFinder.clearCache()

// Force fresh search
debugRecipeFinder.forceSpoonacularSearch(['chicken', 'rice'])

// Get current results
debugRecipeFinder.results()
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spoonacular API](https://spoonacular.com/food-api) for recipe data
- [Inter Font](https://fonts.google.com/specimen/Inter) for typography
- Icons from Unicode emoji set

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/recipe-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/recipe-finder/discussions)
- **Email**: your.email@example.com

## 🗺️ Roadmap

- [ ] User accounts and saved recipes
- [ ] Shopping list generation
- [ ] Meal planning features
- [ ] Recipe rating and reviews
- [ ] Social sharing
- [ ] PWA support with offline recipes
- [ ] Recipe import from URLs
- [ ] Nutritional analysis
- [ ] Recipe scaling calculator

---

Made with ❤️ by [Your Name](https://github.com/yourusername)