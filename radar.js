// ==========================================
// C.L.A.R.A. - MÓDULO RADAR CULTURAL
// ==========================================

function getCategoriaClasse(categoriaReal) {
  if (!categoriaReal) return "cat-default";

  const str = categoriaReal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (str.includes("concurso") || str.includes("premio")) return "cat-concurso";
  if (str.includes("edital") || str.includes("editais")) return "cat-edital";
  if (str.includes("convocatoria")) return "cat-convocatoria";
  if (str.includes("exposi")) return "cat-exposicao";
  if (str.includes("mostra")) return "cat-mostra";
  if (str.includes("curso")) return "cat-cursos";
  if (str.includes("palestra")) return "cat-palestra";
  if (str.includes("workshop")) return "cat-workshop";
  if (str.includes("feira")) return "cat-feira";
  if (str.includes("festival")) return "cat-festival";

  return "cat-default";
}

function processarDatas(tsv) {
  const linhas = tratarTSV(tsv).slice(1);
  baseDatas = [];

  if (linhas.length === 0) return;

  linhas.forEach(function (colunas) {
    if (colunas.length >= 1 && colunas[0] && colunas[0].trim() !== "") {
      const dtInic = processarDataInteligente(colunas[0].trim());
      if (!dtInic) return;

      const dtFim = colunas.length > 1 && colunas[1].trim() !== "" ? processarDataInteligente(colunas[1].trim()) : dtInic;
      const categoriaRaw = colunas.length > 2 && colunas[2].trim() !== "" ? colunas[2].trim() : "Evento";

      const categoriasArray = categoriaRaw.split(";").map(function (cat) {
        const nome = cat.trim();
        return { nome: nome, classe: getCategoriaClasse(nome) };
      });

      const titulo = colunas.length > 3 ? colunas[3].trim() : "Sem Título";
      const local = colunas.length > 4 ? colunas[4].trim() : "";
      const desc = colunas.length > 5 ? colunas[5].trim() : "";

      let link = colunas.length > 6 ? colunas[6].trim() : "";
      if (link && !link.startsWith("http")) {
        link = "https://" + link;
      }

      let uf = "";
      if (local) {
        const ufMatch = local.match(/-\s*([a-zA-Z]{2})$/);
        if (ufMatch) {
          uf = ufMatch[1].toUpperCase();
        }
      }

      baseDatas.push({
        dtInic: dtInic,
        dtFim: dtFim,
        categorias: categoriasArray,
        titulo: titulo,
        local: local,
        desc: desc,
        link: link,
        uf: uf,
      });
    }
  });

  renderFiltrosAgenda();
  initDatas();
}

function renderFiltrosAgenda() {
  const painelFiltros = document.getElementById("painel-filtros");
  const boxCat = document.getElementById("filtros-categoria");
  const boxUF = document.getElementById("filtros-uf");
  const boxUrgencia = document.getElementById("filtros-urgencia");
  const tituloUrgencia = document.getElementById("titulo-filtro-urgencia");

  if (baseDatas.length === 0) {
    if(painelFiltros) painelFiltros.style.display = "none";
    return;
  }

  if(painelFiltros) painelFiltros.style.display = "block";

  let setCat = new Set();
  let setUF = new Set();
  let temUltimosDias = false;
  let temEmBreve = false;
  let temEmAndamento = false;

  const hojeObj = new Date();
  hojeObj.setHours(0, 0, 0, 0);
  const hojeTime = hojeObj.getTime();

  baseDatas.forEach(function (d) {
    d.categorias.forEach(function (catObj) { setCat.add(catObj.nome); });
    if (d.uf) setUF.add(d.uf);

    const dtInicObj = new Date(d.dtInic.ano, d.dtInic.mes - 1, d.dtInic.dia).getTime();
    const dtFimObj = new Date(d.dtFim.ano, d.dtFim.mes - 1, d.dtFim.dia).getTime();

    const diffInicDays = Math.round((dtInicObj - hojeTime) / (1000 * 60 * 60 * 24));
    const diffFimDays = Math.round((dtFimObj - hojeTime) / (1000 * 60 * 60 * 24));

    if (diffInicDays <= 0 && diffFimDays >= 0 && diffFimDays <= 7) temUltimosDias = true;
    if (diffInicDays > 0 && diffInicDays <= 7) temEmBreve = true;
    if (diffInicDays <= 0 && diffFimDays >= 0) temEmAndamento = true;
  });

  let classTodasCat = filtrosCatAtivos.size === 0 ? "active" : "";
  let htmlCat = `<div class="filter-chip chip-todas ${classTodasCat}" onclick="toggleFiltroCategoria('TODAS')">Todas</div>`;

  Array.from(setCat).sort().forEach(function (c) {
    const isActive = filtrosCatAtivos.has(c) ? "active" : "";
    const cor = getCategoriaClasse(c);
    htmlCat += `<div class="filter-chip ${cor} ${isActive}" onclick="toggleFiltroCategoria('${c.replace(/'/g, "\\'")}')">${c}</div>`;
  });
  if(boxCat) boxCat.innerHTML = htmlCat;

  let classTodasUF = filtrosUFAtivos.size === 0 ? "active" : "";
  let htmlUF = `<div class="filter-chip chip-todas ${classTodasUF}" onclick="toggleFiltroUF('TODOS')">Brasil</div>`;

  Array.from(setUF).sort().forEach(function (u) {
    const isActive = filtrosUFAtivos.has(u) ? "active" : "";
    htmlUF += `<div class="filter-chip chip-uf ${isActive}" onclick="toggleFiltroUF('${u}')">${u}</div>`;
  });
  if(boxUF) boxUF.innerHTML = htmlUF;

  if (boxUrgencia && tituloUrgencia) {
    if (temUltimosDias || temEmBreve || temEmAndamento) {
      tituloUrgencia.style.display = "block";
      boxUrgencia.style.display = "flex";
      let chipsHTML = "";

      if (temEmAndamento) {
        let classAtivo = filtroEmAndamentoAtivo ? "active" : "";
        let estiloExtra = filtroEmAndamentoAtivo ? "border-color: #10b981; background: #10b981; color: #fff;" : "border-color: #10b981; color: #10b981; background: transparent;";
        chipsHTML += `<div class="filter-chip ${classAtivo}" style="${estiloExtra}" onclick="toggleFiltroUrgencia('andamento')">▶️ EM ANDAMENTO</div>`;
      }
      if (temUltimosDias) {
        let classAtivo = filtroUltimosDiasAtivo ? "active" : "";
        let estiloExtra = filtroUltimosDiasAtivo ? "border-color: var(--accent-danger); background: var(--accent-danger); color: #fff;" : "border-color: var(--accent-danger); color: var(--accent-danger); background: transparent;";
        chipsHTML += `<div class="filter-chip ${classAtivo}" style="${estiloExtra}" onclick="toggleFiltroUrgencia('ultimos')">🚨 ÚLTIMOS DIAS</div>`;
      }
      if (temEmBreve) {
        let classAtivo = filtroEmBreveAtivo ? "active" : "";
        let estiloExtra = filtroEmBreveAtivo ? "border-color: var(--accent-warning); background: var(--accent-warning); color: #000;" : "border-color: var(--accent-warning); color: var(--accent-warning); background: transparent;";
        chipsHTML += `<div class="filter-chip ${classAtivo}" style="${estiloExtra}" onclick="toggleFiltroUrgencia('breve')">⏳ EM BREVE</div>`;
      }
      boxUrgencia.innerHTML = chipsHTML;
    } else {
      tituloUrgencia.style.display = "none";
      boxUrgencia.style.display = "none";
      filtroUltimosDiasAtivo = false;
      filtroEmBreveAtivo = false;
      filtroEmAndamentoAtivo = false;
    }
  }
}

function toggleFiltroCategoria(cat) {
  if (cat === "TODAS") {
    filtrosCatAtivos.clear();
  } else {
    if (filtrosCatAtivos.has(cat)) filtrosCatAtivos.delete(cat);
    else filtrosCatAtivos.add(cat);
  }
  renderFiltrosAgenda();
  initDatas();
}

function toggleFiltroUF(uf) {
  if (uf === "TODOS") {
    filtrosUFAtivos.clear();
  } else {
    if (filtrosUFAtivos.has(uf)) filtrosUFAtivos.delete(uf);
    else filtrosUFAtivos.add(uf);
  }
  renderFiltrosAgenda();
  initDatas();
}

function toggleFiltroUrgencia(tipo) {
  if (tipo === "ultimos") {
    filtroUltimosDiasAtivo = !filtroUltimosDiasAtivo;
    filtroEmBreveAtivo = false;
    filtroEmAndamentoAtivo = false;
  } else if (tipo === "breve") {
    filtroEmBreveAtivo = !filtroEmBreveAtivo;
    filtroUltimosDiasAtivo = false;
    filtroEmAndamentoAtivo = false;
  } else if (tipo === "andamento") {
    filtroEmAndamentoAtivo = !filtroEmAndamentoAtivo;
    filtroUltimosDiasAtivo = false;
    filtroEmBreveAtivo = false;
  }
  renderFiltrosAgenda();
  initDatas();
}

function initDatas() {
  const container = document.getElementById("lista-datas");
  if(!container) return;
  let htmlHTML = "";

  if (baseDatas.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhuma data cadastrada na base.</p>";
    return;
  }

  baseDatas.sort(function (a, b) {
    return new Date(a.dtInic.iso).getTime() - new Date(b.dtInic.iso).getTime();
  });

  const hojeObj = new Date();
  hojeObj.setHours(0, 0, 0, 0);
  const hojeTime = hojeObj.getTime();
  let datasExibidas = 0;

  baseDatas.forEach(function (ev) {
    const temCategoriaAtiva = filtrosCatAtivos.size === 0 || ev.categorias.some(function (cat) { return filtrosCatAtivos.has(cat.nome); });
    if (!temCategoriaAtiva) return;
    if (filtrosUFAtivos.size > 0 && (!ev.uf || !filtrosUFAtivos.has(ev.uf))) return;

    const dtInicObj = new Date(ev.dtInic.ano, ev.dtInic.mes - 1, ev.dtInic.dia).getTime();
    const dtFimObj = new Date(ev.dtFim.ano, ev.dtFim.mes - 1, ev.dtFim.dia).getTime();

    const diffInicDays = Math.round((dtInicObj - hojeTime) / (1000 * 60 * 60 * 24));
    const diffFimDays = Math.round((dtFimObj - hojeTime) / (1000 * 60 * 60 * 24));

    const isUltimosDias = diffInicDays <= 0 && diffFimDays >= 0 && diffFimDays <= 7;
    const isEmBreve = diffInicDays > 0 && diffInicDays <= 7;
    const isEmAndamento = diffInicDays <= 0 && diffFimDays >= 0;

    if (filtroUltimosDiasAtivo && !isUltimosDias) return;
    if (filtroEmBreveAtivo && !isEmBreve) return;
    if (filtroEmAndamentoAtivo && !isEmAndamento) return;

    let periodoHTML = "";
    if (ev.dtFim && ev.dtFim.iso !== ev.dtInic.iso) {
      periodoHTML = `De ${formatarDataBR(ev.dtInic.iso)} a ${formatarDataBR(ev.dtFim.iso)}/${ev.dtFim.ano}`;
    } else {
      periodoHTML = `${formatarDataBR(ev.dtInic.iso)}/${ev.dtInic.ano}`;
    }

    let tagsHTML = "";
    ev.categorias.forEach(function (cat) {
      tagsHTML += `<span class="ev-tipo ${cat.classe}">${cat.nome}</span> `;
    });

    let badgeHTML = "";
    if (isUltimosDias) {
      badgeHTML = `<span style="background: var(--accent-danger); color: #fff; font-size: 0.6rem; font-family: 'DM Sans', sans-serif; font-weight: 800; padding: 4px 8px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">🚨 ÚLTIMOS DIAS</span>`;
    } else if (isEmBreve) {
      badgeHTML = `<span style="background: var(--accent-warning); color: #000; font-size: 0.6rem; font-family: 'DM Sans', sans-serif; font-weight: 800; padding: 4px 8px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">⏳ EM BREVE</span>`;
    } else if (isEmAndamento) {
      badgeHTML = `<span style="background: #10b981; color: #fff; font-size: 0.6rem; font-family: 'DM Sans', sans-serif; font-weight: 800; padding: 4px 8px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">▶️ EM ANDAMENTO</span>`;
    }

    const classeBordaPrincipal = ev.categorias.length > 0 ? ev.categorias[0].classe : "cat-default";

    const dateStart = ev.dtInic.iso.replace(/-/g, "");
    let dateEndStr = ev.dtFim ? ev.dtFim.iso : ev.dtInic.iso;
    let dateEndObj = new Date(dateEndStr);
    dateEndObj.setDate(dateEndObj.getDate() + 1);
    const dateEnd = toISODate(dateEndObj).replace(/-/g, "");

    const urlTitulo = encodeURIComponent(ev.titulo);
    const urlDetalhe = encodeURIComponent(`Link: ${ev.link}\n\n${ev.desc}`);
    const urlLocal = encodeURIComponent(ev.local);
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${urlTitulo}&dates=${dateStart}/${dateEnd}&details=${urlDetalhe}&location=${urlLocal}`;

    htmlHTML += `
      <div class="card datas-int ${classeBordaPrincipal}">
          <div style="margin-bottom: 12px;">${tagsHTML}</div>
          <div class="ev-titulo">${ev.titulo} ${badgeHTML}</div>
          <div class="ev-periodo">📅 ${periodoHTML}</div>
          ${ev.local ? `<div class="ev-local">📍 ${ev.local}</div>` : ""}
          ${ev.desc ? `<div class="ev-desc">${ev.desc}</div>` : ""}
          <div style="display: flex; gap: 8px; margin-top: 24px; flex-wrap: wrap;">
              ${ev.link ? `<a href="${ev.link}" target="_blank" class="btn btn-outline" style="font-size:0.8rem; padding:10px;">SAIBA MAIS (Link externo)</a>` : ""}
              <a href="${googleCalUrl}" target="_blank" class="btn btn-outline" style="border-color:#3b82f6; color:#3b82f6; font-size:0.8rem; padding:10px;">+ AGENDA</a>
          </div>
      </div>
    `;
    datasExibidas++;
  });

  if (datasExibidas === 0) {
    htmlHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhum evento encontrado com os filtros selecionados.</p>";
  }
  container.innerHTML = htmlHTML;
}
