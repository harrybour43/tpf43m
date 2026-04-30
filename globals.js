// ==========================================
// C.L.A.R.A. - VARIÁVEIS GLOBAIS E UTILITÁRIOS
// ==========================================

const APP_VERSION = "6.6.0";

const LINK_PLANILHA_AULAS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=0&single=true&output=tsv";
const LINK_PLANILHA_EVENTOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=1213067383&single=true&output=tsv";
const LINK_PLANILHA_DATAS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=2069138341&single=true&output=tsv";
const LINK_PLANILHA_DICIO =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=1758081988&single=true&output=tsv";

// Bancos de Dados em Memória
let aulasArray = [];
let baseEventos = [];
let baseDatas = [];
let dicioArray = [];

// Estados de Interface
let dicioMode = "search";
let currentLetter = "A";

let filtrosCatAtivos = new Set();
let filtrosUFAtivos = new Set();
let filtroUltimosDiasAtivo = false;
let filtroEmBreveAtivo = false;
let filtroEmAndamentoAtivo = false;

// Dicionário de UCs
const nomesUC = {
  UC1: "Captar imagens",
  UC2: "Iluminar cenas",
  UC3: "Revelação digital",
  UC4: "Manipular imagens",
  UC5: "Finalizar imagens",
  UC6: "Captar vídeos",
  UC7: "Fotojornalismo",
  UC8: "Social",
  UC9: "Moda e Editoriais",
  UC10: "Propaganda e Publicidade",
  UC11: "Paisagem e Arquitetura",
  UC12: "Ensaios fotográficos",
  UC13: "Portfólio",
  UC14: "Projeto Integrador",
};

// ==========================================
// UTILITÁRIOS UNIVERSAIS (Parsers e Datas)
// ==========================================

function processarDataInteligente(dataRaw) {
  if (!dataRaw) return null;

  let dia, mes, ano;

  if (dataRaw.includes("/")) {
    const partes = dataRaw.split("/");
    dia = partes[0];
    mes = partes[1];
    ano = partes[2];
  } else if (dataRaw.includes("-")) {
    const partes = dataRaw.split("-");
    ano = partes[0];
    mes = partes[1];
    dia = partes[2];
  } else {
    return null;
  }

  if (!ano || !mes || !dia) return null;

  if (ano.length === 2) {
    ano = "20" + ano;
  }

  return {
    ano: parseInt(ano),
    mes: parseInt(mes),
    dia: parseInt(dia),
    iso: `${ano}-${mes.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`,
  };
}

function tratarTSV(tsv) {
  if (tsv.includes("<html") || tsv.includes("<!DOCTYPE")) {
    return [];
  }

  let linhas = [];
  let celulaAtual = "";
  let linhaAtual = [];
  let dentroDeAspas = false;

  for (let i = 0; i < tsv.length; i++) {
    let char = tsv[i];
    if (char === '"') {
      if (dentroDeAspas && tsv[i + 1] === '"') {
        celulaAtual += '"';
        i++;
      } else {
        dentroDeAspas = !dentroDeAspas;
      }
    } else if (char === "\t" && !dentroDeAspas) {
      linhaAtual.push(celulaAtual);
      celulaAtual = "";
    } else if (char === "\n" && !dentroDeAspas) {
      linhaAtual.push(celulaAtual.replace(/\r$/, ""));
      linhas.push(linhaAtual);
      linhaAtual = [];
      celulaAtual = "";
    } else {
      celulaAtual += char;
    }
  }

  if (celulaAtual || linhaAtual.length > 0) {
    linhaAtual.push(celulaAtual.replace(/\r$/, ""));
    linhas.push(linhaAtual);
  }
  return linhas;
}

function toISODate(d) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarDataBR(iso) {
  const partes = iso.split("-");
  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];
  return `${dia}/${mes}`;
}

function getDiaDaSemana(iso) {
  const partes = iso.split("-");
  const ano = partes[0];
  const mes = partes[1] - 1;
  const dia = partes[2];

  const d = new Date(ano, mes, dia, 12, 0, 0);
  const diasDaSemana = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  return diasDaSemana[d.getDay()];
}
