// Minimal offline cache for MetroBar: the one HTML file, manifest, icons; fonts (fonts/) are cached when first fetched.
const CACHE = 'metrobar-v252';
const FILES = ['./', './index.html', './landing-beat-meter.html', './barbook.html', './studio.html', './flow-advanced.html', './fonts/jost.css', './manifest.json', './app-shell.js', './icon-192.png', './icon-512.png', './cmudict.txt', './fonts/Panchang-Variable.woff2', './fonts/fonts.css', './zone-config.js',
  './fonts/g/instrument-sans-400-latin-e190a6.woff2', './fonts/g/ibm-plex-mono-400-latin-171e02.woff2', './fonts/g/big-shoulders-display-700-latin-48e1b4.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('metrobar-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;   // fonts are self-hosted in fonts/ (no Google requests)
  if (/\.(mp4|webm)$/.test(u.pathname)) return;   // videos go straight to the network: Safari asks with Range and needs a 206
  // Pages are stored under their address without ?query, so ?bpm=92, ?example … share one copy
  const key = e.request.mode === 'navigate' ? u.origin + u.pathname : e.request;
  const save = r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(key, cp)); } return r; };
  // The page and manifest load network first, so a new version shows on the first reload; the cache is only the offline fallback
  if (u.origin === location.origin && (e.request.mode === 'navigate' || /\.(html|json)$|\/$|zone-config\.js$/.test(u.pathname))) {
    // On a bad signal, wait about 3 s for the network, then use the cached copy (the network answer still refreshes the cache)
    const net = fetch(e.request).then(save);
    const cached = () => caches.match(e.request, { ignoreSearch: true });
    e.respondWith(new Promise((ok, no) => {
      let done = false; const fin = r => { if (!done && r) { done = true; ok(r); } };
      const t = setTimeout(() => cached().then(fin), 3000);
      net.then(r => { clearTimeout(t); fin(r); }, () => { clearTimeout(t); cached().then(r => r ? fin(r) : (done || no(new TypeError('offline')))); });
    })); return;   // ignoreSearch: Barbook opens the page with ?barbook
  }
  // The dictionary and fonts never change under one CACHE number (a bump refreshes them), so a hit is served as is: no refetch, no rewrite
  const fixed = u.pathname.endsWith('/cmudict.txt') || u.pathname.includes('/fonts/');
  e.respondWith(caches.match(e.request).then(hit => {
    if (hit && fixed) return hit;
    const net = fetch(e.request).then(save).catch(() => hit);
    return hit || net;
  }));
});
