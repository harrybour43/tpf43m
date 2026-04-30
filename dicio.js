// ==========================================
// C.L.A.R.A. - MÓDULO DICIONÁRIO / ENCICLOPÉDIA
// ==========================================

function processarDicio(tsv) {
  const linhas = tratarTSV(tsv).slice(1);
  dicioArray = [];
  let catSet = new Set();

  linhas.forEach(function (colunas) {
    if (colunas.length >= 3 && colunas[0] && colunas[0].trim() !== "") {
      let cat = colunas[1] ? colunas[1].trim() : "Geral";
      dicioArray.push({
        termo: colunas[0].trim(),
        categoria: cat,
        definicao: colunas[2] ? colunas[2].trim() : "",
      });
      catSet.add(cat);
    }
  });

  const selectCat = document.getElementById("filtroCategoriaDicio");
  if (selectCat) {
    let optionsHtml = '<option value="">Todas as Categorias</option>';
    Array.from(catSet).sort().forEach(function (c) {
        optionsHtml += `<option value="${c}">${c}</option>`;
      });
    selectCat.innerHTML = optionsHtml;
  }

  if (dicioMode === "search") {
    renderDicioSearch();
  }
}

function toggleDicioMode() {
  const btn = document.getElementById("btn-toggle-dicio");
  const areaSearch = document.getElementById("dicio-search-area");
  const areaAlpha = document.getElementById("dicio-alpha-area");

  if (dicioMode === "search") {
    dicioMode = "index";
    btn.innerText = "🔍 Buscar";
    btn.style.backgroundColor = "var(--accent-dicio)";
    btn.style.color = "#fff";

    areaSearch.classList.add("hidden");
    areaAlpha.classList.remove("hidden");

    renderAlphabet();
    renderDicioIndex(currentLetter);
  } else {
    dicioMode = "search";
    btn.innerText = "🔤 Índice A-Z";
    btn.style.backgroundColor = "transparent";
    btn.style.color = "var(--accent-dicio)";

    areaSearch.classList.remove("hidden");
    areaAlpha.classList.add("hidden");
    document.getElementById("buscaDicio").value = "";

    renderDicioSearch();
  }
}

function renderAlphabet() {
  const cont = document.getElementById("dicio-alpha-area");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let htmlHTML = "";

  letters.forEach(function (letra) {
    const activeClass = letra === currentLetter ? "active chip-todas" : "";
    htmlHTML += `<div class="filter-chip ${activeClass}" style="border-radius:8px; padding:8px 14px;" onclick="selectLetter('${letra}')">${letra}</div>`;
  });

  if(cont) cont.innerHTML = htmlHTML;
}

function selectLetter(l) {
  currentLetter = l;
  renderAlphabet();
  renderDicioIndex(l);
}

function filtrarDicio() {
  if (dicioMode === "search") {
    renderDicioSearch();
  }
}

function renderDicioSearch() {
  const container = document.getElementById("lista-dicio");
  if (!container) return;

  if (dicioArray.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:var(--text-muted); grid-column: 1/-1;'>Nenhum dado vinculado ainda.</p>";
    return;
  }

  const inputFiltro = document.getElementById("buscaDicio").value.toLowerCase();
  const catFiltro = document.getElementById("filtroCategoriaDicio").value;

  const itensFiltrados = dicioArray.filter(function (item) {
      const matchTexto = item.termo.toLowerCase().includes(inputFiltro) || item.definicao.toLowerCase().includes(inputFiltro);
      const matchCat = catFiltro === "" || item.categoria === catFiltro;
      return matchTexto && matchCat;
    }).sort(function (a, b) {
      return a.termo.localeCompare(b.termo);
    });

  if (itensFiltrados.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:var(--text-muted); grid-column: 1/-1;'>Nenhum termo encontrado.</p>";
    return;
  }

  let htmlHTML = "";
  itensFiltrados.forEach(function (item) {
    const termoSafe = item.termo.replace(/'/g, "\\'");
    const catSafe = item.categoria.replace(/'/g, "\\'");
    const defSafe = item.definicao.replace(/'/g, "\\'").replace(/\n/g, "\\n");

    htmlHTML += `
      <div class="card dicio-item" onclick="abrirVerbeteModal('${termoSafe}', '${catSafe}', '${defSafe}')">
          <div class="term" style="margin-bottom: 2px;">${item.termo}</div>
          <div style="font-size: 0.75rem; color: var(--accent-dicio); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px;">${item.categoria}</div>
          <div class="preview">${item.definicao}</div>
      </div>`;
  });

  container.innerHTML = htmlHTML;
}

function renderDicioIndex(letter) {
  const container = document.getElementById("lista-dicio");
  if (!container || dicioArray.length === 0) return;

  const itensFiltrados = dicioArray.filter(function (item) {
      return item.termo.toUpperCase().startsWith(letter);
    }).sort(function (a, b) {
      return a.termo.localeCompare(b.termo);
    });

  if (itensFiltrados.length === 0) {
    container.innerHTML = `<p style='text-align:center; color:var(--text-muted); margin-top:20px; grid-column: 1/-1;'>Nenhum verbete com a letra <strong>${letter}</strong>.</p>`;
    return;
  }

  let htmlHTML = "";
  itensFiltrados.forEach(function (item) {
    const termoSafe = item.termo.replace(/'/g, "\\'");
    const catSafe = item.categoria.replace(/'/g, "\\'");
    const defSafe = item.definicao.replace(/'/g, "\\'").replace(/\n/g, "\\n");

    htmlHTML += `
      <div class="card dicio-item" onclick="abrirVerbeteModal('${termoSafe}', '${catSafe}', '${defSafe}')">
          <div class="term" style="margin-bottom: 2px;">${item.termo}</div>
          <div style="font-size: 0.75rem; color: var(--accent-dicio); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px;">${item.categoria}</div>
          <div class="preview">${item.definicao}</div>
      </div>`;
  });

  container.innerHTML = htmlHTML;
}
