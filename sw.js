const CACHE_NAME = "mi-pwa-v1";
const URLS_TO_CACHE = [
  "index.html",
  "app.js",
  "manifest.json",
  "assets/logo.jpg"
];

// 📌 Instalar y guardar archivos en caché
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Archivos en caché");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 📌 Activar y limpiar cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log("🗑️ Caché viejo eliminado:", key);
          return caches.delete(key);
        }
      }))
    )
  );
});

// 📌 Estrategia "Network First"
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay conexión, guarda una copia en caché
        const respuestaClonada = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, respuestaClonada);
        });
        return response;
      })
      .catch(() => {
        // Si falla la red, usa caché
        return caches.match(event.request);
      })
  );
});
