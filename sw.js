const CACHE = "okur-v39";
const ASSETS = ["./", "./index.html", "./css/styles.css?v=39", "./js/app.js?v=39", "./manifest.json", "./assets/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "notify") {
    event.waitUntil(
      self.registration.showNotification(data.title || "Okur", {
        body: data.body || "Bugünkü metnini oku.",
        icon: "assets/icon.svg",
        badge: "assets/icon.svg",
        tag: "okur-reminder",
      })
    );
  }
});
