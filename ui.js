// ==========================================
// C.L.A.R.A. - MOTOR DE NAVEGAÇÃO E UI
// ==========================================

function switchTab(viewId, elementTab) {
  document.querySelectorAll(".view-tab").forEach(function (v) {
    v.classList.remove("active");
  });
  document.querySelectorAll(".tab-item").forEach(function (t) {
    t.classList.remove("active");
  });

  const targetView = document.getElementById(viewId);
  targetView.classList.add("active");

  if (elementTab) {
    elementTab.classList.add("active");
  }

  targetView.scrollTo({ top: 0, behavior: "smooth" });
}

function openPush(id) {
  document.getElementById(id).classList.add("active");
}

function closePush(id) {
  document.getElementById(id).classList.remove("active");
}

function openBottomSheet(kicker, title, body, colorHex) {
  document.getElementById("sheet-kicker").innerText = kicker;
  document.getElementById("sheet-kicker").style.color = colorHex;
  document.getElementById("sheet-title").innerText = title;
  document.getElementById("sheet-subtitle").innerText = "";
  document.getElementById("sheet-body").innerHTML = body;

  document.getElementById("sheet-backdrop").classList.add("active");
  document.getElementById("bottom-sheet").classList.add("active");
}

function closeBottomSheet() {
  document.getElementById("sheet-backdrop").classList.remove("active");
  document.getElementById("bottom-sheet").classList.remove("active");
  document.getElementById("side-menu").classList.remove("active");
}

function abrirModal(dataISO, ucNome, profNome, numAula) {
  document.getElementById("sheet-kicker").innerText = `${getDiaDaSemana(dataISO)}, ${formatarDataBR(dataISO)}`;
  document.getElementById("sheet-kicker").style.color = "var(--text-muted)";
  document.getElementById("sheet-title").innerText = `${ucNome}`;
  document.getElementById("sheet-subtitle").innerText = `Aula ${numAula} • Prof. ${profNome}`;

  const eventosDoDia = baseEventos.filter(function (ev) {
    const dt = processarDataInteligente(ev.data);
    return dt && dt.iso === dataISO;
  });

  let bodyHTML = "";

  if (eventosDoDia.length > 0) {
    bodyHTML = `<div style="margin-bottom: 12px; font-size: 0.75rem; color: var(--accent-eventos); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">📌 Programação Extra na Data:</div>`;
    eventosDoDia.forEach(function (ev) {
      bodyHTML += `
          <div style="background: rgba(217, 70, 239, 0.1); border-left: 3px solid var(--accent-eventos); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
              <div style="font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 1.3rem; color: #fff; margin-bottom: 6px;">${ev.titulo}</div>
              <div style="color: #ccc; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;">${ev.desc}</div>
          </div>
      `;
    });
  } else {
    bodyHTML = "<em>Nenhum material extra ou evento cadastrado para esta data.</em>";
  }

  document.getElementById("sheet-body").innerHTML = bodyHTML;
  document.getElementById("sheet-backdrop").classList.add("active");
  document.getElementById("bottom-sheet").classList.add("active");
}

function abrirVerbeteModal(termo, categoria, definicao) {
  openBottomSheet(categoria, termo, definicao, "var(--accent-dicio)");
}

function abrirGuiaLuz() {
  openBottomSheet("LUZ DE ESTÚDIO", "A Lógica do Estúdio", document.getElementById("guia-luz-content").innerHTML, "var(--accent-calc)");
}

function abrirGuiaZonas() {
  openBottomSheet("SISTEMA DE ZONAS", "Fotometria e Filtros", document.getElementById("guia-zonas-content").innerHTML, "var(--accent-zonas)");
}

function toggleZonasBox(bodyId, chevId) {
  const body = document.getElementById(bodyId);
  const chev = document.getElementById(chevId);
  body.classList.toggle("expanded");
  chev.innerText = body.classList.contains("expanded") ? "▲" : "▼";
}

function toggleMenu() {
  document.getElementById("side-menu").classList.toggle("active");
  document.getElementById("sheet-backdrop").classList.toggle("active");
}

function toggleFiltros() {
  const body = document.getElementById("filter-body");
  const chevron = document.getElementById("filter-chevron");
  body.classList.toggle("expanded");
  chevron.innerText = body.classList.contains("expanded") ? "▲" : "▼";
}

function dismissSplash() {
  document.getElementById("splash-screen").style.opacity = "0";
  setTimeout(function () {
    document.getElementById("splash-screen").style.display = "none";
  }, 500);
}

// ==========================================
// AUTENTICAÇÃO E ÁREA RESTRITA
// ==========================================
function requireAuth(tabElement) {
  if (localStorage.getItem("auth_tpf43m") === "true") {
    switchTab("view-turma-menu", tabElement);
  } else {
    openPush("push-auth");
  }
}

function validarSenha() {
  const input = document.getElementById("input-senha").value.toUpperCase();
  if (input === "TPF43M") {
    localStorage.setItem("auth_tpf43m", "true");
    document.getElementById("auth-error").style.display = "none";
    document.getElementById("input-senha").value = "";
    closePush("push-auth");

    const tabTurma = document.querySelectorAll(".tab-item")[4];
    switchTab("view-turma-menu", tabTurma);
  } else {
    document.getElementById("auth-error").style.display = "block";
  }
}

document.getElementById("input-senha")?.addEventListener("keypress", function (e) {
  if (e.key === "Enter") validarSenha();
});

// ==========================================
// NOTIFICAÇÕES E CONTADOR
// ==========================================
async function solicitarPermissaoNotificacao() {
  if (!("Notification" in window)) {
    alert("Este navegador não suporta notificações.");
    return;
  }
  const permissao = await Notification.requestPermission();
  if (permissao === "granted") {
    new Notification("C.L.A.R.A. Ativada!", {
      body: "Permissão concedida. Você receberá alertas sobre luz e eventos.",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff7b00'%3E%3Cpath d='M12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z'/%3E%3C/svg%3E",
    });
  } else {
    alert("Para receber alertas, autorize as notificações nas configurações.");
  }
}

async function atualizarContador() {
  try {
    const response = await fetch(`https://api.countapi.xyz/hit/clara_project_hb_2026/main_hits`);
    const data = await response.json();
    const counterElement = document.getElementById("visitor-counter");
    if (counterElement) counterElement.innerText = `ID: ${data.value}`;
  } catch (error) {}
}

// ==========================================
// MOTOR PWA (INSTALAÇÃO DO APP)
// ==========================================
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById("btn-install-pwa");
  const installedMsg = document.getElementById("pwa-installed-msg");
  if (installBtn) installBtn.style.display = "inline-flex";
  if (installedMsg) installedMsg.classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("btn-install-pwa");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        alert("Para instalar no iOS: toque em 'Compartilhar' e depois em 'Adicionar à Tela de Início'.");
      }
    });
  }
});

window.addEventListener("appinstalled", () => {
  const installBtn = document.getElementById("btn-install-pwa");
  const installedMsg = document.getElementById("pwa-installed-msg");
  if (installBtn) installBtn.style.display = "none";
  if (installedMsg) installedMsg.classList.remove("hidden");
  deferredPrompt = null;
});

// ==========================================
// SISTEMA DE PROTEÇÃO (ANTI-INSPECT / ANTI-COPY)
// ==========================================
document.addEventListener("contextmenu", function (e) { e.preventDefault(); });
document.addEventListener("keydown", function (e) {
  if (e.key === "F12") e.preventDefault();
  if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) e.preventDefault();
  if (e.ctrlKey && (e.key === "U" || e.key === "u")) e.preventDefault();
  if (e.ctrlKey && (e.key === "S" || e.key === "s")) e.preventDefault();
});
