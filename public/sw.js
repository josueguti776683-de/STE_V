const CACHE_NAME = 'tma-academy-cache-v2';
const ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Core Shell App assets...');
      // Robust caching: individually add resources to prevent any single failing request from blocking the entire service worker installation
      return Promise.all(
        ASSETS_TO_PRECACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[Service Worker] Failed to precache resource:', url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale files
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Dynamic stale-while-revalidate caching (for hashed Vite assets)
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS and GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Asset is in cache! Return it, but fetch a fresh version in the background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Silently swallow background fetch failures when completely offline
          });
        return cachedResponse;
      }

      // Not in cache, proceed to the network
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Dynamically cache response for future offline accesses
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and navigate request fails, fallback to index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
