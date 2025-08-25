// Recipe Finder - Service Worker
// Simple service worker for basic caching

const CACHE_NAME = 'recipe-finder-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/utils/constants.js',
  '/js/utils/helpers.js',
  '/js/services/CacheManager.js',
  '/js/services/RecipeAPI.js',
  '/js/components/IngredientInput.js',
  '/js/components/FilterManager.js',
  '/js/components/RecipeCard.js',
  '/js/components/RecipeModal.js',
  '/data/ingredients.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return a fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});