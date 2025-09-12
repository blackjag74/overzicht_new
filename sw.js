const CACHE_NAME = 'financial-dashboard-v2';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './mobile.css',
  './display.js',
  './data.js',
  './mobile.js',
  './logo.svg',
  './manifest.json',
  // Add additional resources
  './tasks.js',
  './new.js',
  './edit.js',
  './delete.js',
  './update.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Failed to cache some resources:', err);
          // Cache individual files that succeed
          return Promise.allSettled(
            urlsToCache.map(url => cache.add(url).catch(e => console.warn('Failed to cache:', url, e)))
          );
        });
      })
      .then(() => {
        console.log('Service Worker installation completed');
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated and ready');
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Sync offline data when connection is restored
  return fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify({
      timestamp: Date.now()
    })
  }).catch(err => {
    console.log('Background sync failed:', err);
  });
}