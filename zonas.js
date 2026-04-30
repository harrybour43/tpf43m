// ==========================================
// C.L.A.R.A. - MÓDULO SISTEMA DE ZONAS E DIAL
// ==========================================

// Array completo de velocidades com identificador visual de Ponto Inteiro (isFull)
const stdZonasSpeeds = [
  { s: "30s", t: 30, isFull: true }, { s: "25s", t: 25, isFull: false }, { s: "20s", t: 20, isFull: false },
  { s: "15s", t: 15, isFull: true }, { s: "13s", t: 13, isFull: false }, { s: "10s", t: 10, isFull: false },
  { s: "8s", t: 8, isFull: true }, { s: "6s", t: 6, isFull: false }, { s: "5s", t: 5, isFull: false },
  { s: "4s", t: 4, isFull: true }, { s: "3.2s", t: 3.2, isFull: false }, { s: "2.5s", t: 2.5, isFull: false },
  { s: "2s", t: 2, isFull: true }, { s: "1.6s", t: 1.6, isFull: false }, { s: "1.3s", t: 1.3, isFull: false },
  { s: "1s", t: 1, isFull: true }, { s: "0.8s", t: 0.8, isFull: false }, { s: "0.6s", t: 0.6, isFull: false },
  { s: "1/2", t: 1/2, isFull: true }, { s: "1/3", t: 1/3, isFull: false }, { s: "1/4", t: 1/4, isFull: true },
  { s: "1/5", t: 1/5, isFull: false }, { s: "1/6", t: 1/6, isFull: false }, { s: "1/8", t: 1/8, isFull: true },
  { s: "1/10", t: 1/10, isFull: false }, { s: "1/13", t: 1/13, isFull: false }, { s: "1/15", t: 1/15, isFull: true },
  { s: "1/20", t: 1/20, isFull: false }, { s: "1/25", t: 1/25, isFull: false }, { s: "1/30", t: 1/30, isFull: true },
  { s: "1/40", t: 1/40, isFull: false }, { s: "1/50", t: 1/50, isFull: false }, { s: "1/60", t: 1/60, isFull: true },
  { s: "1/80", t: 1/80, isFull: false }, { s: "1/100", t: 1/100, isFull: false }, { s: "1/125", t: 1/125, isFull: true },
  { s: "1/160", t: 1/160, isFull: false }, { s: "1/200", t: 1/200, isFull: false }, { s: "1/250", t: 1/250, isFull: true },
  { s: "1/320", t: 1/320, isFull: false }, { s: "1/400", t: 1/400, isFull: false }, { s: "1/500", t: 1/500, isFull: true },
  { s: "1/640", t: 1/640, isFull: false }, { s: "1/800", t: 1/800, isFull: false }, { s: "1/1000", t: 1/1000, isFull: true },
  { s: "1/1250", t: 1/1250, isFull: false }, { s: "1/1600", t: 1/1600, isFull: false }, { s: "1/2000", t: 1/2000, isFull: true },
  { s: "1/2500", t: 1/2500, isFull: false }, { s: "1/3200", t: 1/3200, isFull: false }, { s: "1/4000", t: 1/4000, isFull: true },
  { s: "1/5000", t: 1/5000, isFull: false }, { s: "1/6400", t: 1/6400, isFull: false }, { s: "1/8000", t: 1/8000, isFull: true }
];

// O Estado da Aplicação: Banco de dados temporário das medições
let leiturasZonas = [];
let zonasIdCounter = 0;

// ==========================================
// HIPERFOCAL E INICIALIZAÇÃO
// ==========================================
document.getElementById("focal-length")?.addEventListener("input", calculateZonasHyperfocal);
document.getElementById("sensor-coc")?.addEventListener("change", calculateZonasHyperfocal);

function calculateZonasHyperfocal() {
  const f = parseFloat(document.getElementById("focal-length")?.value);
  const c = parseFloat(document.getElementById("sensor-coc")?.value);
  const resDiv = document.getElementById("hyperfocal-result");
  if(!resDiv) return;

  if (f > 0 && c > 0) {
    const h8 = (f * f) / (8 * c) / 1000;
    const h11 = (f * f) / (11 * c) / 1000;
    resDiv.innerHTML = `<strong>Sugestão de Abertura (Sweet Spots):</strong><br>Em <strong>f/8</strong>: Foque em <strong>${h8.toFixed(1)} metros</strong>.<br>Em <strong>f/11</strong>: Foque em <strong>${h11.toFixed(1)} metros</strong>.<br><br><span style="font-size: 0.75rem; color: #10b981;">Focando nesta distância, a nitidez vai da metade desse valor até o infinito.</span>`;
  } else {
    resDiv.innerHTML = "<em>Insira a focal para calcular onde focar.</em>";
  }
}

// ==========================================
// RENDERIZAÇÃO DO DIAL E TABELA
// ==========================================
function initZonasDial() {
  const container = document.getElementById("zonas-dial-container");
  if(!container) return;
  
  let html = "";
  stdZonasSpeeds.forEach((speed) => {
    const fontWeight = speed.isFull ? "800" : "300";
    const color = speed.isFull ? "#fff" : "var(--text-muted)";
    // itemWidth = 80px
    html += `<div style="flex: 0 0 80px; text-align: center; scroll-snap-align: center; font-size: 1.2rem; font-family: 'DM Sans', sans-serif; font-weight: ${fontWeight}; color: ${color}; user-select: none;">${speed.s}</div>`;
  });
  
  container.innerHTML = html;
  // Rolagem inicial para o meio da régua (aprox. 1/60s)
  setTimeout(() => { container.scrollLeft = 32 * 80; }, 100);
}

function inserirLeituraZonas() {
  const container = document.getElementById("zonas-dial-container");
  const itemWidth = 80;
  
  // A matemática perfeita: Posição do scroll dividida pelo tamanho do item = Índice exato
  const index = Math.round(container.scrollLeft / itemWidth);
  const selectedSpeed = stdZonasSpeeds[index];

  if(selectedSpeed) {
    leiturasZonas.push({
      id: zonasIdCounter++,
      s: selectedSpeed.s,
      t: selectedSpeed.t,
      isFull: selectedSpeed.isFull
    });
    renderTabelaZonas();
  }
}

function removerLeituraZona(id) {
  leiturasZonas = leiturasZonas.filter(l => l.id !== id);
  renderTabelaZonas();
  if(leiturasZonas.length === 0) {
    document.getElementById("zonas-exposure-result").style.display = "none";
  }
}

function renderTabelaZonas() {
  const container = document.getElementById("zonas-tabela-leituras");
  if(!container) return;
  
  if (leiturasZonas.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 10px;">Nenhuma medição inserida.</div>`;
    return;
  }

  // Ordena da velocidade mais lenta (tempo maior) para a mais rápida (tempo menor)
  leiturasZonas.sort((a, b) => b.t - a.t);

  let html = "";
  leiturasZonas.forEach((leitura, index) => {
    const fontWeight = leitura.isFull ? "800" : "300";
    const color = leitura.isFull ? "#fff" : "var(--text-muted)";
    
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-elevated);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; width: 20px;">P${index + 1}</span>
          <span style="font-size: 1.2rem; font-family: 'DM Sans', sans-serif; font-weight: ${fontWeight}; color: ${color}; width: 80px;">${leitura.s}</span>
        </div>
        <button onclick="removerLeituraZona(${leitura.id})" style="background: rgba(239,68,68,0.1); border: none; color: var(--accent-danger); font-size: 1rem; cursor: pointer; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ==========================================
// CÁLCULO DE EXPOSIÇÃO, ND E HDR
// ==========================================
function calculateZonasExposure() {
  if (leiturasZonas.length === 0) return alert("Insira ao menos uma leitura fotométrica através da régua deslizável.");

  let maxT = -Infinity; // Mais longo (Sombra)
  let minT = Infinity;  // Mais rápido (Luz Alta)

  leiturasZonas.forEach((pt) => {
    if (pt.t > maxT) maxT = pt.t;
    if (pt.t < minT) minT = pt.t;
  });

  const fullStopsT = [1/8000, 1/4000, 1/2000, 1/1000, 1/500, 1/250, 1/125, 1/60, 1/30, 1/15, 1/8, 1/4, 1/2, 1, 2, 4, 8, 15, 30];

  // Arredonda para as bordas seguras (Calculo de HDR)
  let outerMaxT = fullStopsT.find(t => t >= maxT) || maxT;
  let outerMinT = [...fullStopsT].reverse().find(t => t <= minT) || minT;
  const rangeStops = Math.abs(Math.log2(outerMaxT / outerMinT));

  // Ponto Zero exato
  const maxEV = Math.log2(1 / minT);
  const minEV = Math.log2(1 / maxT);
  const avgEV = (maxEV + minEV) / 2;

  // 1. Velocidade base (SEM Filtro ND)
  const baseTargetT = 1 / Math.pow(2, avgEV);
  
  let closestSpeedBase = stdZonasSpeeds[0];
  let minDiffBase = Infinity;
  stdZonasSpeeds.forEach((sp) => {
    const diff = Math.abs(sp.t - baseTargetT);
    if (diff < minDiffBase) {
      minDiffBase = diff;
      closestSpeedBase = sp;
    }
  });

  // 2. Compensação do Filtro ND
  let targetT = baseTargetT;
  const ndStops = parseInt(document.getElementById("nd-filter-select").value) || 0;
  if (ndStops > 0) {
      targetT = baseTargetT * Math.pow(2, ndStops);
  }

  // 3. Velocidade Final para a Câmera
  let closestSpeedFinal = { s: "", t: targetT };
  
  if (targetT > 30) {
      if (targetT >= 60) closestSpeedFinal.s = Math.round(targetT / 60) + " min";
      else closestSpeedFinal.s = Math.round(targetT) + "s";
  } else {
      let minDiff = Infinity;
      stdZonasSpeeds.forEach((sp) => {
        const diff = Math.abs(sp.t - targetT);
        if (diff < minDiff) {
          minDiff = diff;
          closestSpeedFinal = sp;
        }
      });
  }

  document.getElementById("zonas-exposure-result").style.display = "block";
  document.getElementById("zonas-base-speed-val").innerText = closestSpeedFinal.s;

  // VEREDITO: Contraste e Recíproca
  const verdict = document.getElementById("zonas-verdict-box");

  if (rangeStops <= 7) {
    verdict.className = "verdict ok";
    verdict.innerHTML = `✅ Cena Segura (Alcance de ${Math.round(rangeStops)} stops).<br>O contraste entre as luzes e sombras está dentro do limite do sensor.`;
  } else {
    verdict.className = "verdict hdr";
    verdict.innerHTML = `⚠️ Contraste Alto (Alcance de ${Math.round(rangeStops)} stops).<br>A diferença de luz extrapolou a margem de 7 stops (pontos inteiros). Exige HDR.`;
  }

  const focalInput = document.getElementById("focal-length").value;
  const focalLength = parseFloat(focalInput);
  if (!isNaN(focalLength) && focalLength > 0) {
    const limiteTremida = 1 / focalLength;
    if (closestSpeedFinal.t > limiteTremida) {
      verdict.innerHTML += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.2); color: var(--accent-warning); font-size: 0.85rem; line-height: 1.4;">⚠️ <strong>Regra Recíproca Rompida:</strong> Sua velocidade final (${closestSpeedFinal.s}) é mais lenta que o limite de segurança da sua lente (${focalLength}mm). <strong>Uso obrigatório de tripé.</strong></div>`;
    }
  }

  // PLOTAGEM DA RÉGUA (-3 a +3) com base sem ND
  const layer = document.getElementById("zonas-meter-points-layer");
  layer.innerHTML = "";

  leiturasZonas.forEach((pt, index) => {
    const meterPos = Math.log2(closestSpeedBase.t / pt.t);
    let percentLeft = ((meterPos + 3) / 6) * 100;

    let isOut = false;
    if (percentLeft < 0) { percentLeft = 0; isOut = true; }
    if (percentLeft > 100) { percentLeft = 100; isOut = true; }

    const div = document.createElement("div");
    div.className = "meter-point";
    div.style.left = `calc(10px + (100% - 20px) * ${percentLeft / 100})`;
    if (isOut) div.style.opacity = "0.4";

    div.innerHTML = `<div class="meter-point-label">P${index + 1}</div><div class="meter-point-dot"></div>`;
    layer.appendChild(div);
  });
}
