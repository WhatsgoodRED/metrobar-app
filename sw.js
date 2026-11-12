// Minimal offline cache for MetroBar: the one HTML file, manifest, icons; fonts are cached when first fetched.
const CACHE = 'metrobar-v65';
const FILES = ['./', './landing-beat-meter.html', './barbook.html', './manifest.json', './icon-192.png', './icon-512.png', './cmudict.txt'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url), fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !fonts) return;
  const save = r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; };
  // The page and manifest load network first, so a new version shows on the first reload; the cache is only the offline fallback
  if (u.origin === location.origin && (e.request.mode === 'navigate' || /\.(html|json)$|\/$|zone-config\.js$/.test(u.pathname))) {
    e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request, { ignoreSearch: true }))); return;   // ignoreSearch: Barbook opens the page with ?barbook
  }
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(save).catch(() => hit);
    return hit || net;
  }));
});
