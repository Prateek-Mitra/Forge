// FORGE Service Worker — Offline Support
const CACHE_NAME = 'forge-v1';

// All external CDN resources to pre-cache
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/prop-types@15.8.1/prop-types.js',
  'https://unpkg.com/recharts@2.12.7/umd/Recharts.js',
  'https://unpkg.com/lucide@0.447.0/dist/umd/lucide.js',
  'https://unpkg.com/@babel/standalone@7.25.6/babel.min.js',
];

// Install: pre-cache all known assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache local files strictly; CDN files best-effort
      const local = ['./', './index.html', './manifest.json', './icon-512.png'];
      const cdn = PRECACHE_URLS.filter(u => !local.includes(u));

      return cache.addAll(local).then(() =>
        Promise.allSettled(cdn.map(url =>
          fetch(url, { mode: 'no-cors' })
            .then(res => cache.put(url, res))
            .catch(() => {}) // silently skip CDN failures
        ))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache first, fall back to network, then cache the response
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For navigation (page load), always serve index.html from cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Cache-first strategy for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Cache valid responses for future use
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and uncached, return a minimal offline response for HTML
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
