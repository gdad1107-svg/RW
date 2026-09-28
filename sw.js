var CACHE_NAME = "gym-rewards-v6";
var FILES_TO_CACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/pablings-logo.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first: while online, always serve the latest deployed files (and
// refresh the cache with them) so a content update shows up on next load
// without needing a manual cache-name bump. Only falls back to the cache
// when the network request fails (offline).
self.addEventListener("fetch", function(event){
  event.respondWith(
    fetch(event.request).then(function(response){
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache){
        cache.put(event.request, copy);
      });
      return response;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
