// Alteração gerada em: 30/04/2026
const CACHE_NAME = "clara-cache-v6.6.0"; // Versão atualizada para Arquitetura Modular
const ASSETS = [
  "/clara/",
  "/clara/index.html",
  "/clara/style.css",
  "/clara/manifest.json",
  "/clara/core.js",
  "/clara/ui.js",
  "/clara/turma.js",
  "/clara/radar.js",
  "/clara/dicio.js",
  "/clara/luz_natural.js",
  "/clara/luz_estudio.js",
  "/clara/zonas.js",
  "/clara/main.js",
  "https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js",
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
];

// Instalação: Salva os arquivos essenciais no celular
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Força o SW a se tornar ativo imediatamente
  self.skipWaiting();
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
  // Garante que o SW controle as abas abertas na hora
  self.clients.claim();
});

// Busca: Serve os arquivos do cache (offline) ou da rede (online)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
