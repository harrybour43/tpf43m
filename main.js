// ==========================================
// C.L.A.R.A. - MAIN ORCHESTRATOR
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Injeta a versão na UI e no Menu
  const versionDisplay = document.getElementById("version-display");
  if (versionDisplay) versionDisplay.innerText = `v${APP_VERSION} • Harry Bour • 2026`;

  const btnSyncMenu = document.getElementById("btn-sync-menu");
  if (btnSyncMenu) btnSyncMenu.innerHTML = `🔄 Sincronizar Dados (v${APP_VERSION})`;

  // 2. Limpa Caches Antigos se a versão mudar
  if (localStorage.getItem("clara_version") !== APP_VERSION) {
    localStorage.removeItem("tpf43m_aulas");
    localStorage.removeItem("tpf43m_eventos");
    localStorage.removeItem("tpf43m_datas");
    localStorage.removeItem("tpf43m_dicio");
    localStorage.setItem("clara_version", APP_VERSION);
  }

  // 3. Inicializa Bancos de Dados Offline (Caches Locais)
  if (localStorage.getItem("tpf43m_aulas")) processarAulas(localStorage.getItem("tpf43m_aulas"));
  if (localStorage.getItem("tpf43m_eventos")) processarEventos(localStorage.getItem("tpf43m_eventos"));
  if (localStorage.getItem("tpf43m_datas")) processarDatas(localStorage.getItem("tpf43m_datas"));
  if (localStorage.getItem("tpf43m_dicio")) processarDicio(localStorage.getItem("tpf43m_dicio"));

  // 4. Inicia Motores da Calculadora de Estúdio
  if (typeof lights !== 'undefined' && lights.length === 0) {
    addLight("Principal", 6, 0);
    addLight("Preenchimento", 4, 0);
  }

  // 5. Inicia Motores e Cálculos Visuais
  if (typeof initZonasDial === "function") initZonasDial();
  if (typeof calculateZonasHyperfocal === "function") calculateZonasHyperfocal();
  if (typeof renderTabelaZonas === "function") renderTabelaZonas(); // Tabela vazia no início
  if (typeof initSunCalc === "function") initSunCalc();
  
  // 6. Buscas Assíncronas (Puxa do Google e Analytics)
  if (typeof fetchGoogleSheets === "function") fetchGoogleSheets();
  if (typeof atualizarContador === "function") atualizarContador();
  
});

// ==========================================
// FETCH BLINDADO (Gatilho da Planilha)
// ==========================================
async function fetchGoogleSheets() {
  const noCacheStr = `&nocache=${Date.now()}`;

  async function tryFetch(url, storageKey, processFunc) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (!text.includes("<html")) {
          localStorage.setItem(storageKey, text);
          if(typeof processFunc === "function") processFunc(text);
        }
      }
    } catch (error) {
      console.warn(`Aviso: Não foi possível sincronizar ${storageKey} no modo offline.`);
    }
  }

  Promise.all([
    tryFetch(LINK_PLANILHA_AULAS + noCacheStr, "tpf43m_aulas", processarAulas),
    tryFetch(LINK_PLANILHA_EVENTOS + noCacheStr, "tpf43m_eventos", processarEventos),
    tryFetch(LINK_PLANILHA_DATAS + noCacheStr, "tpf43m_datas", processarDatas),
    tryFetch(LINK_PLANILHA_DICIO + noCacheStr, "tpf43m_dicio", processarDicio),
  ]).finally(function () {
    setTimeout(function () {
      const btnEntrar = document.getElementById("btn-entrar");
      const textLoading = document.getElementById("loading-text");
      const btnSync = document.getElementById("btn-force-sync");

      if (btnSync) btnSync.classList.remove("spinning");
      if (btnEntrar && btnEntrar.classList.contains("hidden")) {
        textLoading.innerText = "Sincronização finalizada!";
        textLoading.style.animation = "none";
        btnEntrar.classList.remove("hidden");
      }
    }, 1000);
  });
}
