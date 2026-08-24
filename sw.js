// Offline cache. Bumping V alone is NOT enough to ship an update:
// GitHub Pages serves everything with cache-control: max-age=600, and cache.addAll()
// fetches through the HTTP cache, so a new version would happily store the OLD bytes.
// Every precache request therefore forces a network fetch with {cache:'reload'}.
const V = 'memoria-v23';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png", "./palace.webmanifest", "./palace-icon-180.png", "./palace-icon-192.png", "./palace-icon-512.png", "./Memory-Palace.html", "./Lector-23.html", "./Lector-24.html", "./Lector-25.html", "./Lector-26.html", "./Lector-27.html", "./Lector-28.html", "./Lector-29.html", "./Lector-30.html", "./Lector-31.html", "./Indice-de-Trozos.html"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V)
    .then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Pages are network-first so an update lands the moment there is signal;
  // the cache is the fallback that keeps the app working with no signal.
  const isPage = e.request.mode === 'navigate' || e.request.destination === 'document';
  if (isPage) {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(V).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true})));
    return;
  }
  if (url.pathname.endsWith('.mp3')) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(V).then(c => c.put(e.request, copy)).catch(() => {}); }
      return r;
    })));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(r => r || fetch(e.request)));
});
