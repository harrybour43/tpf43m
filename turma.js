// ==========================================
// C.L.A.R.A. - MÓDULO DA TURMA (Aulas e Eventos)
// ==========================================

function processarAulas(tsv) {
  const linhas = tratarTSV(tsv).slice(1);
  aulasArray = [];

  linhas.forEach(function (colunas) {
    if (colunas.length >= 4 && colunas[0] && colunas[1]) {
      const dt = processarDataInteligente(colunas[0].trim());
      if (dt) {
        const codigoLimpo = colunas[1].trim();
        const nomeDaUC = nomesUC[codigoLimpo] ? nomesUC[codigoLimpo] : "";

        aulasArray.push({
          data: dt.iso,
          codigoUC: codigoLimpo,
          uc: `${codigoLimpo} - ${nomeDaUC}`,
          docente: colunas[2].trim(),
          aula: colunas[3].trim(),
        });
      }
    }
  });
  initAulas();
}

function initAulas() {
  const select = document.getElementById("filtroUC");
  if(!select) return;
  select.innerHTML = '<option value="">-- Ver Todas as Aulas --</option>';

  for (const [codigo, nome] of Object.entries(nomesUC)) {
    const opt = document.createElement("option");
    opt.value = codigo;
    opt.textContent = `${codigo} - ${nome}`;
    select.appendChild(opt);
  }

  mudarSemana(0);
}

document.getElementById("filtroUC")?.addEventListener("change", function (e) {
  const ucSelec = e.target.value;

  if (!ucSelec) return window.limparBusca();

  document.getElementById("painel-aulas").style.display = "none";
  document.getElementById("resultado-pesquisa").style.display = "flex";

  const dUC = aulasArray.filter((a) => a.codigoUC === ucSelec);
  const hojeStr = toISODate(new Date());

  let todasEncerradas = false;
  if (dUC.length > 0) todasEncerradas = dUC.every((a) => a.data < hojeStr);

  let htmlHTML = `<div class="card" style="border-top-width:4px; border-top-color:#f59e0b; width: 100%;">
                    <button onclick="window.limparBusca()" class="btn btn-outline" style="border-color:#f59e0b; color:#f59e0b; padding:8px; margin-bottom:16px;">Limpar Busca</button>
                    <h3 style="color:#f59e0b; margin-bottom:16px;">${nomesUC[ucSelec]}</h3>`;

  if (todasEncerradas) {
    htmlHTML += `<div style="background:rgba(16,185,129,0.1); color:#10b981; padding:12px; border-radius:8px; font-weight:700; margin-bottom:16px;">✅ UC Encerrada</div>`;
  }

  if (dUC.length === 0) {
    htmlHTML += `<p style="color:var(--text-muted);">Nenhuma aula agendada para esta UC na base.</p>`;
  }

  dUC.forEach(function (a) {
    const isPast = a.data < hojeStr;
    let rowStyle = "padding:12px 0; border-bottom:1px solid var(--border-color);";
    if (isPast) rowStyle = "padding:12px 0; border-bottom:1px solid var(--border-color); color:var(--text-muted); opacity:0.6;";

    htmlHTML += `<div style="${rowStyle}" onclick="abrirModal('${a.data}','${a.uc}','${a.docente}','${a.aula}')">
                    <strong style="color:#fff;">${formatarDataBR(a.data)}</strong> - Prof. ${a.docente} 
                    <span style="display:block; font-size:0.85em; color:var(--text-muted);">Aula ${a.aula}</span>
                  </div>`;
  });

  htmlHTML += `</div>`;
  document.getElementById("resultado-pesquisa").innerHTML = htmlHTML;
});

window.limparBusca = function () {
  document.getElementById("filtroUC").value = "";
  document.getElementById("resultado-pesquisa").style.display = "none";
  document.getElementById("painel-aulas").style.display = "flex";
};

function mudarSemana(offset) {
  const btnPassada = document.getElementById("btn-passada");
  const btnAtual = document.getElementById("btn-atual");
  const btnQueVem = document.getElementById("btn-que-vem");
  if(!btnPassada) return;

  const corPassada = "var(--text-muted)";
  const corAtual = "var(--accent-aulas)";
  const corQueVem = "var(--accent-datas)";

  btnPassada.style.cssText = `padding: 12px 8px; font-size: 0.85rem; background: transparent; color: ${corPassada}; border-color: ${corPassada};`;
  btnAtual.style.cssText = `padding: 12px 8px; font-size: 0.85rem; background: transparent; color: ${corAtual}; border-color: ${corAtual};`;
  btnQueVem.style.cssText = `padding: 12px 8px; font-size: 0.85rem; background: transparent; color: ${corQueVem}; border-color: ${corQueVem};`;

  if (offset === -1) {
    btnPassada.style.background = corPassada;
    btnPassada.style.color = "#fff";
  } else if (offset === 0) {
    btnAtual.style.background = corAtual;
    btnAtual.style.color = "#fff";
  } else if (offset === 1) {
    btnQueVem.style.background = corQueVem;
    btnQueVem.style.color = "#121212";
  }

  const hoje = new Date();
  const diaDaSemanaHoje = hoje.getDay();
  const diffParaSegunda = hoje.getDate() - diaDaSemanaHoje + 1 + offset * 7;
  const segundaFeira = new Date(hoje.getFullYear(), hoje.getMonth(), diffParaSegunda, 12, 0, 0);
  const sextaFeira = new Date(segundaFeira.getFullYear(), segundaFeira.getMonth(), segundaFeira.getDate() + 4, 12, 0, 0);

  const hojeStr = toISODate(hoje);
  const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
  const amanhaStr = toISODate(amanha);

  const aSemana = aulasArray.filter((a) => a.data >= toISODate(segundaFeira) && a.data <= toISODate(sextaFeira));

  let htmlHTML = `<h3 style="margin-bottom:16px; text-align:center; color:var(--text-muted); font-family: 'DM Sans', sans-serif; font-size: 1rem;">Cronograma da Semana</h3>`;

  if (aSemana.length === 0) {
    htmlHTML += `<div class="card"><div style="text-align:center; color:var(--text-muted);">Sem aulas programadas para esta semana.</div></div>`;
  }

  aSemana.forEach(function (a) {
    const isCancelled = a.aula.toLowerCase().includes("cancelada");
    let statusMsg = "";
    let colorHex = "var(--accent-aulas)";

    if (isCancelled) {
      statusMsg = `❌ CANCELADA`;
      colorHex = "var(--accent-danger)";
    } else if (a.data === hojeStr) {
      statusMsg = "🔥 HOJE";
      colorHex = "#e91e63";
    } else if (a.data === amanhaStr) {
      statusMsg = `AMANHÃ! ⚡`;
      colorHex = "var(--accent-warning)";
    } else if (a.data < hojeStr) {
      statusMsg = `✅ PASSADA`;
    } else {
      statusMsg = `⏳ PREVISTA`;
    }

    htmlHTML += `<div class="card" style="border-top-width:4px; border-top-color:${colorHex};" onclick="abrirModal('${a.data}', '${a.uc}', '${a.docente}', '${a.aula}')">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:800; color:var(--text-muted); margin-bottom:8px; text-transform:uppercase;">
                        <span>${getDiaDaSemana(a.data)}</span>
                        <span style="color:${colorHex}">${statusMsg}</span>
                    </div>
                    <div style="font-size:1.8rem; font-family:'Cormorant Garamond', serif; font-weight:700; margin-bottom:8px; color:#fff;">${formatarDataBR(a.data)}</div>
                    <div style="color:var(--text-muted); font-size:0.95rem; line-height:1.4;">
                        <strong style="color:#fff;">${a.uc}</strong><br>Prof: ${a.docente}
                    </div>
                 </div>`;
  });

  document.getElementById("painel-aulas").innerHTML = htmlHTML;
}

function processarEventos(tsv) {
  const linhas = tratarTSV(tsv).slice(1);
  baseEventos = [];

  linhas.forEach(function (colunas) {
    if (colunas.length >= 2 && colunas[0]) {
      baseEventos.push({
        data: colunas[0].trim(),
        titulo: colunas[1] ? colunas[1].trim() : "",
        desc: colunas[2] ? colunas[2].trim() : "",
      });
    }
  });
  initEventos();
}

function initEventos() {
  const container = document.getElementById("lista-eventos");
  if(!container) return;
  let htmlHTML = "";

  if (baseEventos.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhum evento interno programado.</p>";
    return;
  }

  baseEventos.sort(function (a, b) {
    const dtA = processarDataInteligente(a.data);
    const dtB = processarDataInteligente(b.data);
    if (!dtA || !dtB) return 0;
    return new Date(dtA.iso).getTime() - new Date(dtB.iso).getTime();
  });

  const hojeLocal = new Date();
  hojeLocal.setHours(0, 0, 0, 0);
  let eventosExibidos = 0;

  baseEventos.forEach(function (ev) {
    const dt = processarDataInteligente(ev.data);
    if (!dt) return;

    const dataEvento = new Date(dt.ano, dt.mes - 1, dt.dia);
    const diffDays = Math.round((dataEvento.getTime() - hojeLocal.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -10) return;

    let countdownHTML = "";
    if (diffDays > 1) countdownHTML = `<span style="font-weight:normal; opacity:0.8;">Faltam ${diffDays} dias</span>`;
    else if (diffDays === 1) countdownHTML = `<span style="color:var(--accent-warning);">É amanhã!</span>`;
    else if (diffDays === 0) countdownHTML = `<span style="color:#e91e63;">É hoje!</span>`;
    else countdownHTML = `<span style="font-weight:normal; opacity:0.5;">Passou</span>`;

    htmlHTML += `<div class="card" style="border-top-width:4px; border-top-color:var(--accent-eventos);">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:8px;">
                        <span>${dt.dia.toString().padStart(2, "0")}/${dt.mes.toString().padStart(2, "0")}</span>
                        ${countdownHTML}
                    </div>
                    <div class="ev-titulo">${ev.titulo}</div>
                    <div class="ev-desc" style="margin-bottom:0;">${ev.desc}</div>
                </div>`;
    eventosExibidos++;
  });

  if (eventosExibidos === 0) {
    htmlHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhum evento recente ou futuro.</p>";
  }
  container.innerHTML = htmlHTML;
}
