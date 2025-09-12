const CACHE_NAME = 'financial-dashboard-v3';
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
  const url = new URL(event.request.url);
  
  // Never cache API endpoints - always fetch fresh data
  if (url.pathname.includes('.php') || 
      url.pathname.includes('/api/') ||
      url.pathname.includes('get_rekeningen') ||
      url.pathname.includes('get_taken') ||
      url.pathname.includes('get_transacties') ||
      url.pathname.includes('update_') ||
      url.pathname.includes('new_')) {
    
    // Network-first strategy for API calls with aggressive cache-busting for mobile
    event.respondWith(
      (async () => {
        try {
          // Build cache-busting URL
          const url = new URL(event.request.url);
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          
          // Add multiple cache-busting parameters
          url.searchParams.set('t', timestamp);
          url.searchParams.set('r', random);
          url.searchParams.set('mobile', '1');
          
          // Create new request with aggressive headers for mobile browsers
          const newRequest = new Request(url.toString(), {
            method: event.request.method,
            headers: {
              ...Object.fromEntries(event.request.headers.entries()),
              'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
              'Pragma': 'no-cache',
              'Expires': '0',
              'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
              'If-None-Match': '*'
            },
            body: event.request.body,
            mode: event.request.mode,
            credentials: event.request.credentials,
            cache: 'no-store'
          });
          
          const response = await fetch(newRequest);
          
          // Clone response and add no-cache headers
          const responseClone = response.clone();
          const headers = new Headers(responseClone.headers);
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          headers.set('Pragma', 'no-cache');
          headers.set('Expires', '0');
          
          return new Response(responseClone.body, {
            status: responseClone.status,
            statusText: responseClone.statusText,
            headers: headers
          });
          
        } catch (err) {
          console.log('Network request failed, API unavailable:', err);
          // For API calls, don't serve stale cache - return error
          return new Response(JSON.stringify({error: 'Network unavailable'}), {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
        }
      })()
    );
    return;
  }
  
  // Cache-first strategy for static resources
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
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