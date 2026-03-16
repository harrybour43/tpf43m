// Alteração gerada em: 16/03/2026
const CACHE_NAME = "clara-cache-v6.5.0"; // Atualizado para o módulo Zonas
const ASSETS = [
  "/clara/",
  "/clara/index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js",
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
];

// Instalação: Salva os arquivos essenciais no celular
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Ativação: Limpa caches antigos de versões anteriores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Busca: Serve os arquivos do cache (offline) ou da rede (online)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
