// ==========================================
// C.L.A.R.A. - MÓDULO LUZ DE ESTÚDIO (Flashes)
// ==========================================

const fStopsFull = ["f/1.0", "f/1.4", "f/2.0", "f/2.8", "f/4.0", "f/5.6", "f/8.0", "f/11", "f/16", "f/22", "f/32", "f/45", "f/64"];
const fStopsData = [
  { f: "1.0", t1: "1.1", t2: "1.2", next: "1.4" }, { f: "1.4", t1: "1.6", t2: "1.8", next: "2.0" },
  { f: "2.0", t1: "2.2", t2: "2.5", next: "2.8" }, { f: "2.8", t1: "3.2", t2: "3.5", next: "4.0" },
  { f: "4.0", t1: "4.5", t2: "5.0", next: "5.6" }, { f: "5.6", t1: "6.3", t2: "7.1", next: "8.0" },
  { f: "8.0", t1: "9.0", t2: "10", next: "11" }, { f: "11", t1: "13", t2: "14", next: "16" },
  { f: "16", t1: "18", t2: "20", next: "22" }, { f: "22", t1: "25", t2: "29", next: "32" },
  { f: "32", t1: "36", t2: "40", next: "45" }, { f: "45", t1: "51", t2: "57", next: "64" },
  { f: "64", t1: "72", t2: "81", next: "90" }
];

let lights = [];
let lightIdCounter = 0;

function getAbsoluteValue(stopIndex, tenths) { return stopIndex * 10 + tenths; }

function addLight(role = "Preenchimento", baseStop = 6, tenths = 0) {
  if (lights.length >= 6) { alert("Capacidade máxima do estúdio atingida: 1 Principal + 5 Secundárias."); return; }
  lights.push({ id: lightIdCounter++, role: role, baseStop: baseStop, tenths: tenths });
  renderLights();
}

function removeLight(id) { lights = lights.filter((l) => l.id !== id); renderLights(); }

function updateLight(id, field, value) {
  const light = lights.find((l) => l.id === id);
  if (light) {
    light[field] = value;
    if (field === "role" && value === "Principal") {
      lights.forEach((otherLight) => { if (otherLight.id !== id && otherLight.role === "Principal") otherLight.role = "Preenchimento"; });
    }
    renderLights();
  }
}

function nudgeLight(id, tenthsToAdd) {
  const light = lights.find((l) => l.id === id);
  if (!light) return;
  let newAbs = getAbsoluteValue(light.baseStop, light.tenths) + tenthsToAdd;
  if (newAbs < 0) newAbs = 0;
  if (newAbs > 120) newAbs = 120;
  light.baseStop = Math.floor(newAbs / 10);
  light.tenths = newAbs % 10;
  renderLights();
}

function getCameraAdvice(stopIndex, tenths) {
  const stopData = fStopsData[stopIndex];
  let message = ""; let isWarning = false;
  switch (tenths) {
    case 0: case 1: message = `📸 Config. Câmera: Use <strong>f/${stopData.f}</strong> (Ponto inteiro)`; break;
    case 2: message = `⚠️ NA TOCHA PRINCIPAL: Reduza -2/10 para <strong>f/${stopData.f}</strong> ou Aumente +1/10 para <strong>f/${stopData.t1}</strong>`; isWarning = true; break;
    case 3: case 4: message = `📸 Config. Câmera: Use <strong>f/${stopData.t1}</strong> (1º Terço)`; break;
    case 5: message = `⚠️ NA TOCHA PRINCIPAL: Mude 1/2 ponto para <strong>f/${stopData.f}</strong> ou <strong>f/${stopData.next}</strong> para evitar décimos chatos.`; isWarning = true; break;
    case 6: case 7: message = `📸 Config. Câmera: Use <strong>f/${stopData.t2}</strong> (2º Terço)`; break;
    case 8: message = `⚠️ NA TOCHA PRINCIPAL: Reduza -1/10 para <strong>f/${stopData.t2}</strong> ou Aumente +2/10 para <strong>f/${stopData.next}</strong>`; isWarning = true; break;
    case 9: message = `📸 Config. Câmera: Use <strong>f/${stopData.next}</strong> (Ponto Inteiro do próximo)`; break;
  }
  return { message, isWarning };
}

function renderLights() {
  const container = document.getElementById("lightsContainer");
  if (!container) return;
  container.innerHTML = "";
  const cenario = document.getElementById("cenarioFundo").value;
  const principal = lights.find((l) => l.role === "Principal");

  lights.forEach(function (light) {
    const isPrincipal = light.role === "Principal";
    const row = document.createElement("div");
    row.className = "card light-card" + (isPrincipal ? " principal" : "");

    let optionsRole = `
      <option ${light.role === "Principal" ? "selected" : ""}>Principal</option>
      <option ${light.role === "Preenchimento" ? "selected" : ""}>Preenchimento</option>
      <option ${light.role === "Recorte" ? "selected" : ""}>Recorte</option>
      <option ${light.role === "Cabelo" ? "selected" : ""}>Cabelo</option>
      <option ${light.role === "Fundo" ? "selected" : ""}>Fundo</option>
      <option ${light.role === "Retorno" ? "selected" : ""}>Retorno</option>
    `;

    let optionsStop = "";
    fStopsData.forEach((data, index) => { optionsStop += `<option value="${index}" ${light.baseStop === index ? "selected" : ""}>f/${data.f}</option>`; });

    let optionsTenths = "";
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((t) => { optionsTenths += `<option value="${t}" ${light.tenths === t ? "selected" : ""}>${t}/10</option>`; });

    let deleteBtn = isPrincipal ? "" : `<button class="btn-luz-remove" onclick="removeLight(${light.id})">✖</button>`;

    row.innerHTML = `
      <div class="light-controls-row">
          <select onchange="updateLight(${light.id}, 'role', this.value)">${optionsRole}</select>
          <select onchange="updateLight(${light.id}, 'baseStop', parseInt(this.value))">${optionsStop}</select>
          <select onchange="updateLight(${light.id}, 'tenths', parseInt(this.value))">${optionsTenths}</select>
      </div>
      <div class="light-actions-row" style="margin-top: 8px;">
          <button class="btn-luz-math" onclick="nudgeLight(${light.id}, -5)">-½</button>
          <button class="btn-luz-math" onclick="nudgeLight(${light.id}, -1)">-⅒</button>
          <button class="btn-luz-math" onclick="nudgeLight(${light.id}, 1)">+⅒</button>
          <button class="btn-luz-math" onclick="nudgeLight(${light.id}, 5)">+½</button>
          ${deleteBtn}
      </div>
      <div class="light-feedback" id="res-${light.id}"></div>
    `;

    container.appendChild(row);

    const resDiv = document.getElementById(`res-${light.id}`);
    let resultHTML = "";

    if (isPrincipal) {
      const advice = getCameraAdvice(light.baseStop, light.tenths);
      const colorFeedback = advice.isWarning ? "var(--accent-warning)" : "var(--text-main)";
      const weightFeedback = advice.isWarning ? "800" : "normal";
      resultHTML = `
          <div style="color:${colorFeedback}; margin-bottom:12px; font-weight:${weightFeedback}; font-size: 0.95rem;">${advice.message}</div>
          <div style="color:#4caf50; font-weight:800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">⚓ Luz de Referência (Âncora)</div>
      `;
    } else if (principal) {
      const pAbs = getAbsoluteValue(principal.baseStop, principal.tenths);
      const lAbs = getAbsoluteValue(light.baseStop, light.tenths);
      const diffFromMain = lAbs - pAbs;
      let isAtTarget = false; let targetMsg = ""; let splitAdvice = "";

      if (light.role === "Preenchimento") { if (diffFromMain === -20) isAtTarget = true; targetMsg = "2 stops abaixo da principal (-2.0)"; }
      else if (light.role === "Recorte" || light.role === "Cabelo") { if (diffFromMain === 20) isAtTarget = true; targetMsg = "2 stops acima da principal (+2.0)"; }
      else if (cenario === "branco") {
        if (light.role === "Fundo") { if (diffFromMain >= 10 && diffFromMain <= 20) isAtTarget = true; targetMsg = "1 a 2 stops acima (+1.5 ideal)"; }
        else if (light.role === "Retorno") {
          if (diffFromMain <= 0) isAtTarget = true; targetMsg = "Potência igual ou menor que a principal";
          if (diffFromMain > 0) { const difCalculada = (diffFromMain / 2).toFixed(1); splitAdvice = `<div style="color:var(--accent-danger); margin-top:12px; font-weight:700; background:rgba(239,68,68,0.1); padding:8px; border-radius:6px;">⚠️ Cuidado com o Vazamento! <br>Reduza ${difCalculada}/10 em cada flash do fundo.</div>`; }
        }
      }
      else if (cenario === "cinza") { if (light.role === "Fundo") { if (diffFromMain >= -40 && diffFromMain <= -20) isAtTarget = true; targetMsg = "2 a 4 stops abaixo da principal"; } }

      if (isAtTarget) {
        resultHTML = `<div class="light-success-box"><div class="light-success-title">✅ Intenção Atingida</div><span style="color:var(--text-main); font-weight:600;">${targetMsg}</span></div>`;
      } else {
        if (diffFromMain === 0 && targetMsg !== "") {
          resultHTML = `<div style="color:var(--cat-convocatoria); font-weight:700; margin-bottom:8px; padding:8px; background:rgba(59,130,246,0.1); border-radius:6px;">✅ Tocha Nivelada. <br>Passo 2: Agora aplique [ ${targetMsg} ]</div>`;
        } else {
          const diffToEqualize = pAbs - lAbs;
          const direction = diffToEqualize > 0 ? "Aumente" : "Reduza";
          const mathHalf = Math.floor(Math.abs(diffToEqualize) / 5);
          const mathTenth = Math.abs(diffToEqualize) % 5;
          resultHTML = `<div style="margin-bottom:8px; color:var(--text-main); line-height: 1.5;">⚙️ <strong>Passo 1 (Nivelar Tocha):</strong><br>${direction} <strong>${mathHalf} clicks de (½)</strong> e <strong>${mathTenth} clicks de (⅒)</strong> para igualar com a Principal.</div>`;
          if (targetMsg) resultHTML += `<div style="color:var(--text-muted); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">🎯 Regra do Estúdio: ${targetMsg}</div>`;
        }
        if (splitAdvice) resultHTML += splitAdvice;
      }
    }
    resDiv.innerHTML = resultHTML;
  });
}
