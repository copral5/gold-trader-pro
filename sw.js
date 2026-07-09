// Gold Trader Pro — Service Worker v2
const CACHE_NAME = 'gtp-v2';

// Install
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './',
        './index.html',
      ]).catch(e => console.log('Cache install partial:', e));
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Never cache Supabase, Telegram, or CDN API calls
  if (url.includes('supabase.co') ||
      url.includes('telegram.org') ||
      url.includes('jsdelivr.net') ||
      url.includes('cdn.') ||
      event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
