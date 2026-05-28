const CACHE_NAME = "day-plus-plus-v1.0.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/day-plus-plus-192.png",
  "./icons/day-plus-plus-512.png",
  "./icons/day-plus-plus-1024.png",
  "./icons/day-plus-plus-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }
  const title = data.title || "Day++";
  const options = {
    body: data.body || "Ton jour attend sa validation.",
    icon: "icons/day-plus-plus-192.png",
    badge: "icons/day-plus-plus-192.png",
    tag: data.tag || "day-plus-plus-reminder",
    data: { url: data.url || "./index.html#day" },
    vibrate: [70, 35, 70],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "./index.html#day",
    self.location.href,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const sameAppClient = clients.find((client) =>
          client.url.startsWith(self.location.origin),
        );
        if (sameAppClient && "navigate" in sameAppClient) {
          return sameAppClient
            .navigate(targetUrl)
            .then((client) => client?.focus());
        }
        if (sameAppClient) return sameAppClient.focus();
        return self.clients.openWindow(targetUrl);
      }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, "./index.html"));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request) || caches.match(fallbackUrl);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || network || caches.match("./index.html");
}
