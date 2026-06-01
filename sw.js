const APP_VERSION = '2026.06.01.06';
const CACHE_NAME = 'guide-cache-' + APP_VERSION;
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./hotel-checkin.html",
  "./hotel-wifi.html",
  "./hotel-breakfast.html",
  "./hotel-room-cleaning.html",
  "./hotel-room-facilities.html",
  "./hotel-laundry-service.html",
  "./hotel-rental-items.html",
  "./taipei-guide.html",
  "./9C8AD261-A01E-4D4E-A639-67CE3BB7C54A.jpeg"
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if(key.indexOf('guide-cache-') === 0 && key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', function(event) {
  if(event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function(event) {
  var request = event.request;

  if(request.method !== 'GET') return;
  if(!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request).then(function(response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(request, copy);
      });
      return response;
    }).catch(function() {
      return caches.match(request).then(function(cached) {
        if(cached) return cached;
        if(request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
