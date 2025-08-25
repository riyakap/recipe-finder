# 🚀 Deployment Guide

This guide will help you deploy the Recipe Finder app to GitHub and Vercel.

## 📋 Prerequisites

- Git installed on your computer
- GitHub account
- Vercel account (free)
- Spoonacular API key (optional but recommended)

## 🔧 Step 1: Prepare for Deployment

### 1.1 Configure API Key

1. Get a free API key from [Spoonacular](https://spoonacular.com/food-api)
2. Open `js/utils/constants.js`
3. Replace the placeholder with your API key:

```javascript
const API_CONFIG = {
  SPOONACULAR: {
    API_KEY: 'your-actual-api-key-here', // Replace this
    BASE_URL: 'https://api.spoonacular.com/recipes',
    // ... rest of config
  }
};
```

### 1.2 Test Locally

Before deploying, test the app locally:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server extension
```

Visit `http://localhost:8000` and verify everything works.

## 📚 Step 2: Deploy to GitHub

### 2.1 Initialize Git Repository

```bash
# Navigate to your project directory
cd recipe-finder

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Recipe Finder app"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New repository" (+ icon in top right)
3. Repository name: `recipe-finder` (or your preferred name)
4. Description: "A modern web app to find recipes based on available ingredients"
5. Make it **Public** (required for free GitHub Pages)
6. **Don't** initialize with README (we already have one)
7. Click "Create repository"

### 2.3 Push to GitHub

```bash
# Add GitHub remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/recipe-finder.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2.4 Enable GitHub Pages (Optional)

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" section
4. Source: "Deploy from a branch"
5. Branch: "main", Folder: "/ (root)"
6. Click "Save"

Your app will be available at: `https://YOUR_USERNAME.github.io/recipe-finder`

## 🌐 Step 3: Deploy to Vercel

### 3.1 Deploy via Vercel Website (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `recipe-finder` repository
5. Configure project:
   - **Project Name**: `recipe-finder` (or your choice)
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
6. Click "Deploy"

### 3.2 Configure Environment Variables

1. Go to your Vercel project dashboard
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add variable:
   - **Name**: `SPOONACULAR_API_KEY`
   - **Value**: Your actual API key
   - **Environment**: All (Production, Preview, Development)
5. Click "Save"

### 3.3 Redeploy (if needed)

1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"

Your app will be available at: `https://your-project-name.vercel.app`

## 🔄 Step 4: Update and Redeploy

### 4.1 Making Changes

```bash
# Make your changes to files
# Then commit and push

git add .
git commit -m "Description of changes"
git push origin main
```

### 4.2 Automatic Deployment

- **Vercel**: Automatically deploys when you push to GitHub
- **GitHub Pages**: May take a few minutes to update

## 🛠️ Alternative Deployment Options

### Deploy to Netlify

1. **Drag & Drop Method**:
   - Zip your project folder
   - Go to [netlify.com/drop](https://netlify.com/drop)
   - Drag the zip file

2. **Git Integration**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub and select your repository

### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🔐 Environment Variables for Production

For production deployments, you should use environment variables instead of hardcoding API keys:

### Vercel Environment Variables

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add: `SPOONACULAR_API_KEY` = `your-api-key`

### Netlify Environment Variables

1. Netlify Dashboard → Site → Settings → Environment Variables
2. Add: `SPOONACULAR_API_KEY` = `your-api-key`

## 🧪 Testing Your Deployment

### Checklist

- [ ] App loads without errors
- [ ] Ingredient input works with suggestions
- [ ] Recipe search returns results
- [ ] Recipe modal displays properly
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] API calls work (if API key configured)

### Debug Tools

Open browser console on your deployed site:

```javascript
// Check if debug tools are available
console.log(window.debugRecipeFinder);

// Clear cache if needed
debugRecipeFinder.clearCache();

// Test search
debugRecipeFinder.search(['chicken', 'rice']);
```

## 🚨 Troubleshooting

### Common Issues

1. **404 Error**: Check that `index.html` is in the root directory
2. **API Not Working**: Verify environment variables are set correctly
3. **CORS Errors**: Should not occur in production (only local file:// protocol)
4. **Slow Loading**: Check network tab for large files

### Vercel Specific

- Check build logs in Vercel dashboard
- Verify `vercel.json` configuration
- Check function logs if using serverless functions

### GitHub Pages Specific

- Ensure repository is public
- Check that Pages is enabled in repository settings
- Wait a few minutes for changes to propagate

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Review deployment logs
3. Verify all files are committed to Git
4. Test locally first
5. Check API key configuration

## 🎉 Success!

Once deployed, your Recipe Finder app will be live and accessible to users worldwide. Share the URL and start helping people find delicious recipes!

### Next Steps

- Set up custom domain (optional)
- Add analytics (Google Analytics, etc.)
- Monitor performance
- Collect user feedback
- Plan new features

---

**Happy Cooking! 🍳**