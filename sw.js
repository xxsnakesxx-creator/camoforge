const CACHE = "camoforge-pwa-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./Mw4/",
  "./Mw4/index.html",
  "./Warzone/",
  "./Warzone/index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("camoforge-pwa-") && key !== CACHE)
        .map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const copy = response.clone();
        const cache = await caches.open(CACHE);
        cache.put(request, copy);
      }
      return response;
    } catch (error) {
      const url = new URL(request.url);
      if (request.mode === "navigate") {
        if (url.pathname.includes("/Mw4")) return (await caches.match("./Mw4/index.html")) || (await caches.match("./"));
        if (url.pathname.includes("/Warzone")) return (await caches.match("./Warzone/index.html")) || (await caches.match("./"));
        return (await caches.match("./index.html")) || (await caches.match("./"));
      }
      return new Response("Offline", { status: 503, statusText: "Offline" });
    }
  })());
});
