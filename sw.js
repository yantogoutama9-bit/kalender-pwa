const cacheName="kalender-cache-v1";
const filesToCache=["./","./index.html","./app.js","./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(filesToCache)));
});

self.addEventListener("fetch",e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
