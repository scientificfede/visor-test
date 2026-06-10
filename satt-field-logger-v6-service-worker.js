const CACHE_NAME = 'satt-field-logger-v6-offline-20260610';
const OFFLINE_URL = './SATT_FIELD_LOGGER_V6_OFFLINE.html';
const PRECACHE_URLS = [
  './SATT_FIELD_LOGGER_V6_OFFLINE.html',
  './satt-field-logger-v6-manifest.json',
  './satt-field-logger-v6-service-worker.js',
  './satt-icon-180.png',
  './satt-icon-192.png',
  './satt-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME && k.startsWith('satt-field-logger-')).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        const copy = response.clone();
        if (response && response.status === 200 && new URL(req.url).origin === self.location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return response;
      }).catch(() => {
        if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
        return caches.match(req);
      });
    })
  );
});
