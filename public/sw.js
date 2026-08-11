// Минимальный service worker: только офлайн-заглушка для навигационных запросов
// (требование Google для TWA-упаковки, см. ТЗ п.10). Осознанно не кэширует
// авторизованный/динамический контент приложения (чат, API) — это не app-shell
// PWA, а обычное серверное приложение с офлайн-fallback.

const CACHE_NAME = "gate-offline-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
