/* eslint-disable no-restricted-globals */
self.addEventListener('install', (event) => {
    console.log('Service worker installing...');
    // Cache resources
    event.waitUntil(
      caches.open('static-cache-v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/favicon.ico',
          '/logo192.png',
          '/logo512.png',
          '/manifest.json',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  