// ==========================================
// C.L.A.R.A. - MÓDULO DE LUZ NATURAL E ASTROS
// ==========================================

let locLat = -23.5266;
let locLng = -46.6963;
let locName = "SNC Lapa Scipião (SP)";

function formatTime(date) {
  if (isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getEducativeInfo(time, lat, lng) {
  if (isNaN(time.getTime())) return "";
  const pos = SunCalc.getPosition(time, lat, lng);
  let altDeg = (pos.altitude * 180) / Math.PI;
  let aziDeg = (pos.azimuth * 180) / Math.PI + 180;

  let altText = "";
  if (altDeg < 0) altText = "Abaixo do horizonte (Luz indireta)";
  else if (altDeg < 15) altText = "Muito baixo (Sombras longas)";
  else if (altDeg < 45) altText = "Baixo (Sombras médias)";
  else if (altDeg < 75) altText = "Alto (Sombras curtas)";
  else altText = "A pino (Sombras duras)";

  let dir = "";
  if (aziDeg >= 337.5 || aziDeg < 22.5) dir = "Norte (N)";
  else if (aziDeg < 67.5) dir = "Nordeste (NE)";
  else if (aziDeg < 112.5) dir = "Leste (L)";
  else if (aziDeg < 157.5) dir = "Sudeste (SE)";
  else if (aziDeg < 202.5) dir = "Sul (S)";
  else if (aziDeg < 247.5) dir = "Sudoeste (SO)";
  else if (aziDeg < 292.5) dir = "Oeste (O)";
  else dir = "Noroeste (NO)";

  return `<div class="info">📐 <strong>Altura (${Math.round(altDeg)}°):</strong> ${altText}<br>🧭 <strong>Direção:</strong> A luz vem do ${dir}</div>`;
}

function getMoonInfo(targetDate) {
  const moonIllum = SunCalc.getMoonIllumination(targetDate);
  const phase = moonIllum.phase;
  const fraction = moonIllum.fraction;
  const distance = moonIllum.distance;

  let phaseName = "";
  let emoji = "";
  let witticism = "";

  if (phase < 0.03 || phase > 0.97) { phaseName = "Nova"; emoji = "🌑"; witticism = "Zero luz! Paraíso das astrofotografias."; }
  else if (phase < 0.25) { phaseName = "Crescente"; emoji = "🌒"; witticism = "Rende fotos com luz suave noturna."; }
  else if (phase < 0.28) { phaseName = "Quarto Crescente"; emoji = "🌓"; witticism = "Luz lateral dramática, ótima para crateras."; }
  else if (phase < 0.47) { phaseName = "Gibosa Crescente"; emoji = "🌔"; witticism = "Quase cheia! A luz já ofusca estrelas."; }
  else if (phase < 0.53) { phaseName = "Cheia"; emoji = "🌕"; witticism = "Um rebatedor gigante no céu. Luz dura."; }
  else if (phase < 0.72) { phaseName = "Gibosa Minguante"; emoji = "🌖"; witticism = "A iluminação começa a diminuir."; }
  else if (phase < 0.78) { phaseName = "Quarto Minguante"; emoji = "🌗"; witticism = "Ideal para captar o nascer da lua de madrugada."; }
  else { phaseName = "Minguante"; emoji = "🌘"; witticism = "Brilho sumindo, como a bateria da câmera."; }

  let supermoonTag = "";
  if (distance < 365000 && phase > 0.45 && phase < 0.55) supermoonTag = "<br><br>🌕 <strong>SUPER LUA:</strong> Perigeu. Prepare a teleobjetiva!";
  else if (distance > 400000 && (phase < 0.05 || phase > 0.95)) supermoonTag = "<br><br>🌑 <strong>Micro Lua:</strong> Apogeu.";

  let eclipseText = "";
  if (phase < 0.03 || phase > 0.97 || (phase > 0.47 && phase < 0.53)) eclipseText = " (Risco de eclipses!).";

  return `
      <div class="card sun-card moon-card">
          <div class="row">
              <span class="label">Fase da Lua (${Math.round(fraction * 100)}%)</span>
              <span class="time">${emoji} ${phaseName}</span>
          </div>
          <div class="info" style="border-top: none; font-size: 0.9rem;">
              🔭 <strong>Dica:</strong> ${witticism} ${eclipseText} ${supermoonTag}
          </div>
      </div>
  `;
}

async function fetchWeather(lat, lng) {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
    const data = await response.json();
    return data.current_weather;
  } catch (e) {
    return null;
  }
}

async function updateWeatherUI(targetDate) {
  const weatherDiv = document.getElementById("weather-results");
  if(!weatherDiv) return;

  const hojeStr = toISODate(new Date());
  const targetStr = toISODate(targetDate);

  if (targetStr !== hojeStr) {
    weatherDiv.innerHTML = "";
    weatherDiv.classList.add("hidden");
    return;
  }

  weatherDiv.innerHTML = '<span style="color:var(--text-muted);">🌤️ Consultando meteorologia...</span>';
  weatherDiv.classList.remove("hidden");

  const weather = await fetchWeather(locLat, locLng);

  if (!weather) {
    weatherDiv.innerHTML = '<span style="color:var(--text-muted);">⚠️ Clima indisponível no modo offline.</span>';
    return;
  }

  const code = weather.weathercode;
  const isDay = weather.is_day === 1;
  let icon = isDay ? "🌤️" : "🌙";
  let condicao = "Misto";
  let dica = "";

  if (code === 0) { icon = isDay ? "☀️" : "🌑"; condicao = "Céu Limpo"; dica = isDay ? "Luz dura e sombras fortes. Use difusores para retratos." : "Noite limpa. Excelente para astrofotografia e exposições longas."; }
  else if (code >= 1 && code <= 3) { icon = "☁️"; condicao = "Nublado / Parcial"; dica = isDay ? "Luz suave (softbox natural). Cores fiéis e baixo contraste." : "Noite nublada. As nuvens refletem a poluição luminosa da cidade."; }
  else if (code === 45 || code === 48) { icon = "🌫️"; condicao = "Neblina"; dica = isDay ? "Aproveite a profundidade atmosférica e silhuetas." : "Clima noir. As luzes da rua criam halos incríveis. Foco manual recomendado."; }
  else if (code >= 51 && code <= 67) { icon = "🌧️"; condicao = "Chuva"; dica = isDay ? "Cores saturadas, mas proteja bem o equipamento." : "Aproveite os reflexos dramáticos no asfalto molhado. Proteja a câmera."; }
  else if (code >= 80 && code <= 99) { icon = "⛈️"; condicao = "Risco de Chuva Forte"; dica = isDay ? "Luz dramática, mas risco ao equipamento." : "Luzes dramáticas e risco de raios. Evite áreas abertas."; }

  const avisoPrudencia = `<div style="font-size: 0.8rem; color: var(--accent-warning); margin-top: 12px;">⚠️ <strong>Aviso C.L.A.R.A:</strong> Ferramentas de previsão baseiam-se em modelos. Antes de sair, abra a janela e confira o céu real.</div>`;

  weatherDiv.innerHTML = `
      <div style="display:flex; flex-direction:column; width: 100%;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-family:'Cormorant Garamond', serif; font-weight:700; color:#fff; font-size: 1.6rem;">
              <span>${icon} Clima Agora (${weather.temperature}°C)</span>
              <span style="font-size: 1.2rem;">${condicao}</span>
          </div>
          <div style="font-size:0.9rem; color:var(--text-muted); border-top:1px dashed var(--border-color); padding-top:12px; margin-top:12px; line-height: 1.4;">
              📸 <strong>Dica:</strong> ${dica}
          </div>
          ${avisoPrudencia}
      </div>
  `;
}

function renderSunCalc(targetDate) {
  const times = SunCalc.getTimes(targetDate, locLat, locLng);
  const refTitle = document.getElementById("local-ref-title");
  if(refTitle) refTitle.innerHTML = `📍 Referência: <strong>${locName}</strong>`;

  let htmlHTML = `
      <div class="card sun-card">
          <div class="row">
              <span class="label">🌅 Nascer do Sol</span>
              <span class="time">${formatTime(times.sunrise)}</span>
          </div>
          ${getEducativeInfo(times.sunrise, locLat, locLng)}
      </div>
      <div class="card sun-card golden">
          <div class="row">
              <span class="label">✨ Hora Dourada (Manhã)</span>
              <span class="time">${formatTime(times.sunriseEnd)} - ${formatTime(times.goldenHourEnd)}</span>
          </div>
          ${getEducativeInfo(times.sunriseEnd, locLat, locLng)}
      </div>
      <div class="card sun-card golden">
          <div class="row">
              <span class="label">✨ Hora Dourada (Tarde)</span>
              <span class="time">${formatTime(times.goldenHour)} - ${formatTime(times.sunsetStart)}</span>
          </div>
          ${getEducativeInfo(times.goldenHour, locLat, locLng)}
      </div>
      <div class="card sun-card">
          <div class="row">
              <span class="label">🌇 Pôr do Sol</span>
              <span class="time">${formatTime(times.sunset)}</span>
          </div>
          ${getEducativeInfo(times.sunset, locLat, locLng)}
      </div>
      <div class="card sun-card blue">
          <div class="row">
              <span class="label">🌃 Hora Azul</span>
              <span class="time">${formatTime(times.sunset)} - ${formatTime(times.dusk)}</span>
          </div>
          ${getEducativeInfo(times.dusk, locLat, locLng)}
      </div>
  `;

  document.getElementById("suncalc-results").innerHTML = htmlHTML;
  document.getElementById("moon-results").innerHTML = getMoonInfo(targetDate);
  document.getElementById("meteor-results").innerHTML = getMeteorInfo(targetDate);
  updateWeatherUI(targetDate);
}

function switchLuzTab(tab) {
  const btnDiurna = document.getElementById("btn-tab-diurna");
  const btnNoturna = document.getElementById("btn-tab-noturna");
  const containerSun = document.getElementById("sun-data-container");
  const containerAstro = document.getElementById("astro-data-container");

  if (tab === "diurna") {
    btnDiurna.classList.add("active");
    btnNoturna.classList.remove("active");
    containerSun.classList.remove("hidden");
    containerAstro.classList.add("hidden");
  } else {
    btnNoturna.classList.add("active");
    btnDiurna.classList.remove("active");
    containerAstro.classList.remove("hidden");
    containerSun.classList.add("hidden");
  }
}

function getMeteorInfo(targetDate) {
  const m = targetDate.getMonth() + 1;
  const d = targetDate.getDate();

  const chuvas = [
    { nome: "Quadrantídeas", inicio: { m: 12, d: 28 }, fim: { m: 1, d: 12 }, pico: { m: 1, d: 3 }, taxa: 120, descricao: "Forte, mas janela de pico muito curta." },
    { nome: "Líridas", inicio: { m: 4, d: 14 }, fim: { m: 4, d: 30 }, pico: { m: 4, d: 22 }, taxa: 18, descricao: "Meteoros brilhantes, boa para fotografia." },
    { nome: "Eta Aquáridas", inicio: { m: 4, d: 19 }, fim: { m: 5, d: 28 }, pico: { m: 5, d: 6 }, taxa: 50, descricao: "Originada pelo Cometa Halley, excelente no Hemisfério Sul." },
    { nome: "Delta Aquáridas", inicio: { m: 7, d: 12 }, fim: { m: 8, d: 23 }, pico: { m: 7, d: 30 }, taxa: 25, descricao: "Dois radiantes, ritmo constante e prolongado." },
    { nome: "Perseidas", inicio: { m: 7, d: 17 }, fim: { m: 8, d: 24 }, pico: { m: 8, d: 12 }, taxa: 100, descricao: "A mais famosa do ano. Muitos meteoros brilhantes e rastros longos." },
    { nome: "Orionídeas", inicio: { m: 10, d: 2 }, fim: { m: 11, d: 7 }, pico: { m: 10, d: 21 }, taxa: 20, descricao: "Meteoros muito rápidos, também poeira do Cometa Halley." },
    { nome: "Leônidas", inicio: { m: 11, d: 6 }, fim: { m: 11, d: 30 }, pico: { m: 11, d: 17 }, taxa: 15, descricao: "Famosa por gerar 'tempestades' históricas no passado." },
    { nome: "Geminídeas", inicio: { m: 12, d: 4 }, fim: { m: 12, d: 20 }, pico: { m: 12, d: 14 }, taxa: 150, descricao: "A melhor chuva do ano. Intensa, multicolorida e confiável." },
    { nome: "Ursídeas", inicio: { m: 12, d: 17 }, fim: { m: 12, d: 26 }, pico: { m: 12, d: 22 }, taxa: 10, descricao: "Baixa intensidade, estritamente visível nas madrugadas." },
  ];

  let chuvaAtiva = null;
  let isPico = false;

  for (let i = 0; i < chuvas.length; i++) {
    const c = chuvas[i];
    let ativa = false;

    if (c.inicio.m > c.fim.m) {
      if ((m === c.inicio.m && d >= c.inicio.d) || (m === c.fim.m && d <= c.fim.d)) ativa = true;
    } else {
      if (m > c.inicio.m && m < c.fim.m) ativa = true;
      else if (m === c.inicio.m && m === c.fim.m && d >= c.inicio.d && d <= c.fim.d) ativa = true;
      else if (m === c.inicio.m && m < c.fim.m && d >= c.inicio.d) ativa = true;
      else if (m === c.fim.m && m > c.inicio.m && d <= c.fim.d) ativa = true;
    }

    if (ativa) {
      chuvaAtiva = c;
      if (m === c.pico.m && d === c.pico.d) isPico = true;
      break;
    }
  }

  if (!chuvaAtiva) {
    return `
      <div class="card sun-card" style="border-left-color: #333;">
          <div class="row">
              <span class="label">☄️ Chuva de Meteoros</span>
              <span class="time" style="font-size: 1.1rem; color: #888;">Nenhuma ativa</span>
          </div>
      </div>
    `;
  }

  let corBorda = isPico ? "var(--accent-eventos)" : "#6366f1";
  let bgPainel = isPico ? "rgba(217, 70, 239, 0.05)" : "rgba(99, 102, 241, 0.05)";
  let badge = isPico ? `<span style="background: var(--accent-eventos); color: #fff; font-size: 0.6rem; font-weight: 800; font-family: 'DM Sans', sans-serif; padding: 4px 6px; border-radius: 4px; vertical-align: middle; margin-left: 8px; letter-spacing: 1px;">NOITE DE PICO!</span>` : "";

  return `
      <div class="card sun-card" style="border-left-color: ${corBorda}; background: ${bgPainel};">
          <div class="row">
              <span class="label">☄️ Chuva de Meteoros</span>
              <span class="time" style="font-size: 1.3rem;">${chuvaAtiva.nome} ${badge}</span>
          </div>
          <div class="info" style="border-top: none; font-size: 0.9rem;">
              🔭 <strong>Comportamento:</strong> ${chuvaAtiva.descricao}<br>
              🌠 <strong>Intensidade Máxima:</strong> Até ${chuvaAtiva.taxa} meteoros/hora.
          </div>
      </div>
  `;
}

function initSunCalc() {
  const hoje = new Date();
  const dataInput = document.getElementById("dataSunCalc");
  if (dataInput && !dataInput.value) dataInput.value = toISODate(hoje);
  renderSunCalc(hoje);
  autoSwitchSunTab();
}

function autoSwitchSunTab() {
  const hora = new Date().getHours();
  if (hora >= 18 || hora <= 5) switchLuzTab("noturna");
  else switchLuzTab("diurna");
}

function toggleFiltrosLocal() {
  const body = document.getElementById("sun-filter-body");
  const chevron = document.getElementById("sun-filter-chevron");
  body.classList.toggle("expanded");
  chevron.innerText = body.classList.contains("expanded") ? "▲" : "▼";
}

function atualizarDataSunCalc() {
  const dataString = document.getElementById("dataSunCalc").value;
  if (!dataString) return;
  const partes = dataString.split("-");
  const targetDate = new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0);
  renderSunCalc(targetDate);
}

async function buscarLocalidadeSunCalc() {
  const query = document.getElementById("buscaLocalSunCalc").value;
  if (!query) return;
  const btn = document.getElementById("btn-buscar-local");
  const originalText = btn.innerText;
  btn.innerText = "...";
  btn.disabled = true;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data && data.length > 0) {
      locLat = parseFloat(data[0].lat);
      locLng = parseFloat(data[0].lon);
      locName = data[0].display_name.split(",")[0] + " (Busca)";
      atualizarDataSunCalc();
    } else {
      alert("Localidade não encontrada.");
    }
  } catch (e) {
    alert("Erro de conexão.");
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

function getMyLocation() {
  const btn = document.getElementById("btn-gps");
  const btnOriginalText = btn.innerText;
  btn.innerText = "Buscando satélites...";
  btn.disabled = true;
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        locLat = position.coords.latitude;
        locLng = position.coords.longitude;
        locName = "Meu GPS Atual";
        const dataString = document.getElementById("dataSunCalc").value;
        let targetDate = new Date();
        if (dataString) {
          const partes = dataString.split("-");
          targetDate = new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0);
        }
        renderSunCalc(targetDate);
        btn.innerText = "📍 Localização Atualizada!";
        btn.style.borderColor = "var(--accent-aulas)";
        btn.style.color = "var(--accent-aulas)";
        setTimeout(() => {
          btn.innerText = btnOriginalText;
          btn.style.borderColor = "var(--accent-sun)";
          btn.style.color = "var(--accent-sun)";
          btn.disabled = false;
        }, 3000);
      },
      function (error) {
        alert("Erro ao obter GPS.");
        btn.innerText = btnOriginalText;
        btn.disabled = false;
      },
      { timeout: 10000 }
    );
  } else {
    alert("Geolocalização não suportada.");
    btn.innerText = btnOriginalText;
    btn.disabled = false;
  }
}
