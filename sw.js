var CACHE_NAME = 'kearney-tax-v4';
var urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// Remove caches from older versions so they can't serve out-of-date rates
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(names.map(function(name) {
                if (name !== CACHE_NAME) return caches.delete(name);
            }));
        }).then(function() { return self.clients.claim(); })
    );
});

// Network first, so updates show right away; fall back to the cache when offline
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request).then(function(response) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
            return response;
        }).catch(function() {
            return caches.match(event.request);
        })
    );
});
