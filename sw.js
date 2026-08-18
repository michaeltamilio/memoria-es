// Cache everything on install; serve from cache first so the app works offline.
const V = 'memoria-v2';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png", "./Lector-23.html", "./Lector-24.html", "./Lector-25.html", "./Lector-26.html", "./Lector-27.html", "./Lector-28.html", "./Lector-29.html", "./Lector-30.html", "./Lector-31.html", "./Indice-de-Trozos.html"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request)));
});
