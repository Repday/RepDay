const AD = "repday-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((k) => Promise.all(k.filter((x) => x !== AD).map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

/* Önce ağ, olmazsa önbellek. Böylece güncellemeler hemen gelir,
   internet yokken de uygulama açılır. */
self.addEventListener("fetch", (e) => {
  const istek = e.request;
  if (istek.method !== "GET") return;
  const url = new URL(istek.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(istek)
      .then((yanit) => {
        const kopya = yanit.clone();
        caches.open(AD).then((c) => c.put(istek, kopya));
        return yanit;
      })
      .catch(() =>
        caches.match(istek).then((k) => k || caches.match("./index.html"))
      )
  );
});
