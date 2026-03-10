        // Projeto: C.L.A.R.A.
        // Descrição: Central de Luz e Apoio ao Repertório de Artistas do Audiovisual.
        // Versão: 6.3.0
        // Mudanças da Versão: Migração para PWA Network-First (atualização automática transparente) e injeção dinâmica de versão no botão de sincronia.
        // Data da Versão: 10/03/2026 - 11:45
        // Desenvolvedor: Harry Bour 
        
        // ==========================================
        // VARIÁVEIS GLOBAIS E LINKS DAS PLANILHAS
        // ==========================================
        const LINK_PLANILHA_AULAS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=0&single=true&output=tsv";
        const LINK_PLANILHA_EVENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=1213067383&single=true&output=tsv";
        const LINK_PLANILHA_DATAS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=2069138341&single=true&output=tsv";
        const LINK_PLANILHA_DICIO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRqOEEEZGFugY9MN7_0OsVjxvl02CxltDPfTx3LbUtte0mY7nLHWJxmu-ISbymcrS7cbyK__ixm43fI/pub?gid=1758081988&single=true&output=tsv"; 
        const APP_VERSION = "6.3.0"; // ÚNICO LUGAR PARA MUDAR A VERSÃO NO FUTURO!
        let aulasArray = []; 
        let baseEventos = []; 
        let baseDatas = []; 
        let dicioArray = [];
        
        let dicioMode = 'search'; 
        let currentLetter = 'A';
        
        let filtrosCatAtivos = new Set(); 
        let filtrosUFAtivos = new Set();
        let filtroUltimosDiasAtivo = false; 
        let filtroEmBreveAtivo = false; // Adicionamos o controle do "Em Breve"
        let filtroEmAndamentoAtivo = false; // NOVO: Controle do "Em Andamento"

        const nomesUC = { 
            "UC1": "Captar imagens", 
            "UC2": "Iluminar cenas", 
            "UC3": "Revelação digital", 
            "UC4": "Manipular imagens", 
            "UC5": "Finalizar imagens", 
            "UC6": "Captar vídeos", 
            "UC7": "Fotojornalismo", 
            "UC8": "Social", 
            "UC9": "Moda e Editoriais", 
            "UC10": "Propaganda e Publicidade", 
            "UC11": "Paisagem e Arquitetura", 
            "UC12": "Ensaios fotográficos", 
            "UC13": "Portfólio", 
            "UC14": "Projeto Integrador" 
        };

        // ==========================================
        // MOTOR DE NAVEGAÇÃO 5.0 (TABS E SHEETS)
        // ==========================================
        function switchTab(viewId, elementTab) {
            
            // Remove a classe ativa de todas as abas
            document.querySelectorAll('.view-tab').forEach(function(v) {
                v.classList.remove('active');
            });
            
            // Remove a classe ativa de todos os botões do rodapé
            document.querySelectorAll('.tab-item').forEach(function(t) {
                t.classList.remove('active');
            });
            
            // Ativa a aba alvo
            const targetView = document.getElementById(viewId);
            targetView.classList.add('active');
            
            if(elementTab) {
                elementTab.classList.add('active');
            }
            
            // Retorna o scroll para o topo se o usuário clicar na aba que já está aberta
            targetView.scrollTo({top: 0, behavior: 'smooth'});
        }

        function openPush(id) { 
            document.getElementById(id).classList.add('active'); 
        }
        
        function closePush(id) { 
            document.getElementById(id).classList.remove('active'); 
        }

        function openBottomSheet(kicker, title, body, colorHex) {
            document.getElementById('sheet-kicker').innerText = kicker;
            document.getElementById('sheet-kicker').style.color = colorHex;
            document.getElementById('sheet-title').innerText = title;
            document.getElementById('sheet-subtitle').innerText = ""; 
            document.getElementById('sheet-body').innerHTML = body;
            
            document.getElementById('sheet-backdrop').classList.add('active');
            document.getElementById('bottom-sheet').classList.add('active');
        }

        // Alteração gerada em: 09/03/2026 - 23:45
        function closeBottomSheet() {
            document.getElementById('sheet-backdrop').classList.remove('active');
            document.getElementById('bottom-sheet').classList.remove('active');
            document.getElementById('side-menu').classList.remove('active'); // Garante que feche o menu também
        }

        function abrirModal(dataISO, ucNome, profNome, numAula) { 
            document.getElementById('sheet-kicker').innerText = `${getDiaDaSemana(dataISO)}, ${formatarDataBR(dataISO)}`;
            document.getElementById('sheet-kicker').style.color = "var(--text-muted)";
            document.getElementById('sheet-title').innerText = `${ucNome}`;
            document.getElementById('sheet-subtitle').innerText = `Aula ${numAula} • Prof. ${profNome}`;
            
            // NOVO: Cruzamento de dados. Procura eventos da turma que acontecem nesta mesma data
            const eventosDoDia = baseEventos.filter(function(ev) {
                const dt = processarDataInteligente(ev.data);
                return dt && dt.iso === dataISO;
            });

            let bodyHTML = "";

            // Se encontrou eventos, desenha cards bonitos dentro do modal
            if (eventosDoDia.length > 0) {
                bodyHTML = `<div style="margin-bottom: 12px; font-size: 0.75rem; color: var(--accent-eventos); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">📌 Programação Extra na Data:</div>`;
                
                eventosDoDia.forEach(function(ev) {
                    bodyHTML += `
                        <div style="background: rgba(217, 70, 239, 0.1); border-left: 3px solid var(--accent-eventos); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                            <div style="font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 1.3rem; color: #fff; margin-bottom: 6px;">${ev.titulo}</div>
                            <div style="color: #ccc; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;">${ev.desc}</div>
                        </div>
                    `;
                });
            } else {
                // Se não tem evento, mantém a mensagem padrão
                bodyHTML = "<em>Nenhum material extra ou evento cadastrado para esta data.</em>";
            }

            document.getElementById('sheet-body').innerHTML = bodyHTML;
            
            document.getElementById('sheet-backdrop').classList.add('active');
            document.getElementById('bottom-sheet').classList.add('active');
        } 
        
        function abrirVerbeteModal(termo, categoria, definicao) { 
            openBottomSheet(categoria, termo, definicao, 'var(--accent-dicio)'); 
        }
        
        function abrirGuiaLuz() { 
            openBottomSheet('LUZ DE ESTÚDIO', 'A Lógica do Estúdio', document.getElementById('guia-luz-content').innerHTML, 'var(--accent-calc)'); 
        }

        // ==========================================
        // AUTENTICAÇÃO E ACESSO DA TURMA
        // ==========================================
        function requireAuth(tabElement) {
            if (localStorage.getItem('auth_tpf43m') === 'true') { 
                switchTab('view-turma-menu', tabElement); 
            } else { 
                openPush('push-auth'); 
            }
        }
        
        function validarSenha() {
            const input = document.getElementById('input-senha').value.toUpperCase();
            if (input === 'TPF43M') {
                localStorage.setItem('auth_tpf43m', 'true');
                document.getElementById('auth-error').style.display = 'none'; 
                document.getElementById('input-senha').value = '';
                closePush('push-auth');
                
                // Ativa a aba da Turma visualmente após a senha ser inserida corretamente
                const tabTurma = document.querySelectorAll('.tab-item')[4];
                switchTab('view-turma-menu', tabTurma);
            } else { 
                document.getElementById('auth-error').style.display = 'block'; 
            }
        }

        document.getElementById('input-senha').addEventListener('keypress', function(e) { 
            if (e.key === 'Enter') {
                validarSenha(); 
            }
        });

        // ==========================================
        // INICIALIZAÇÃO BLINDADA DO APLICATIVO
        // ==========================================
        document.addEventListener('DOMContentLoaded', function() {
            // Injeta a versão visualmente no botão e no rodapé
            const versionDisplay = document.getElementById('version-display');
            if (versionDisplay) versionDisplay.innerText = `v${APP_VERSION} • Harry Bour • 2026`;
            
            const btnSyncMenu = document.getElementById('btn-sync-menu');
            if (btnSyncMenu) btnSyncMenu.innerHTML = `🔄 Sincronizar Dados (v${APP_VERSION})`;

            // Limpa o cache das planilhas se a versão do app mudar
            if (localStorage.getItem('clara_version') !== APP_VERSION) {
                localStorage.removeItem('tpf43m_aulas'); 
                localStorage.removeItem('tpf43m_eventos'); 
                localStorage.removeItem('tpf43m_datas'); 
                localStorage.removeItem('tpf43m_dicio');
                localStorage.setItem('clara_version', APP_VERSION);
            }
            
            // Carrega do Cache primeiro para velocidade
            if (localStorage.getItem('tpf43m_aulas')) processarAulas(localStorage.getItem('tpf43m_aulas'));
            if (localStorage.getItem('tpf43m_eventos')) processarEventos(localStorage.getItem('tpf43m_eventos'));
            if (localStorage.getItem('tpf43m_datas')) processarDatas(localStorage.getItem('tpf43m_datas'));
            if (localStorage.getItem('tpf43m_dicio')) processarDicio(localStorage.getItem('tpf43m_dicio'));

            if (lights.length === 0) { 
                addLight('Principal', 6, 0); 
                addLight('Preenchimento', 4, 0); 
            }
            
            initSunCalc(); 
            fetchGoogleSheets();
            atualizarContador();
        });
        
        function dismissSplash() {
            document.getElementById('splash-screen').style.opacity = '0';
            setTimeout(function() { 
                document.getElementById('splash-screen').style.display = 'none'; 
            }, 500);
        }

        // Alteração gerada em: 10/03/2026 - 00:15
        async function forceSync() {
            const btnMenu = document.getElementById('btn-sync-menu');
            if(!btnMenu) return;
            
            const textoOriginal = btnMenu.innerHTML;
            btnMenu.innerHTML = "⏳ Sincronizando...";
            btnMenu.style.opacity = "0.7";
            btnMenu.disabled = true;

            await fetchGoogleSheets();

            setTimeout(() => {
                btnMenu.innerHTML = "✅ Versão Atualizada!";
                btnMenu.style.color = "var(--accent-aulas)";
                
                setTimeout(() => {
                    btnMenu.innerHTML = textoOriginal;
                    btnMenu.style.opacity = "1";
                    btnMenu.style.color = "#fff";
                    btnMenu.disabled = false;
                }, 3000);
            }, 1000);
        }

        // FETCH BLINDADO: Garante que o botão Entrar sempre aparecerá
        async function fetchGoogleSheets() {
            const noCacheStr = `&nocache=${Date.now()}`;
            
            async function tryFetch(url, storageKey, processFunc) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const text = await response.text();
                        if (!text.includes('<html')) {
                            localStorage.setItem(storageKey, text);
                            processFunc(text);
                        }
                    }
                } catch (error) {
                    console.warn(`Aviso: Não foi possível sincronizar ${storageKey} no modo offline.`);
                }
            }

            // Dispara todas as requisições em paralelo
            Promise.all([
                tryFetch(LINK_PLANILHA_AULAS + noCacheStr, 'tpf43m_aulas', processarAulas),
                tryFetch(LINK_PLANILHA_EVENTOS + noCacheStr, 'tpf43m_eventos', processarEventos),
                tryFetch(LINK_PLANILHA_DATAS + noCacheStr, 'tpf43m_datas', processarDatas),
                tryFetch(LINK_PLANILHA_DICIO + noCacheStr, 'tpf43m_dicio', processarDicio)
            ]).finally(function() {
                
                // Blindagem: Roda independentemente de sucesso ou falha da internet
                setTimeout(function() {
                    const btnEntrar = document.getElementById('btn-entrar');
                    const textLoading = document.getElementById('loading-text');
                    const btnSync = document.getElementById('btn-force-sync');
                    
                    if (btnSync) {
                        btnSync.classList.remove('spinning');
                    }
                    
                    if (btnEntrar && btnEntrar.classList.contains('hidden')) {
                        textLoading.innerText = "Sincronização finalizada!";
                        textLoading.style.animation = "none";
                        btnEntrar.classList.remove('hidden');
                    }
                }, 1000);
                
            });
        }

        // ==========================================
        // PARSERS E TRATAMENTO DE TEXTO
        // ==========================================
        function processarDataInteligente(dataRaw) {
            if (!dataRaw) {
                return null; 
            }
            
            let dia, mes, ano;
            
            if (dataRaw.includes('/')) { 
                const partes = dataRaw.split('/');
                dia = partes[0];
                mes = partes[1];
                ano = partes[2];
            } else if (dataRaw.includes('-')) { 
                const partes = dataRaw.split('-');
                ano = partes[0];
                mes = partes[1];
                dia = partes[2];
            } else { 
                return null; 
            }
            
            if (!ano || !mes || !dia) {
                return null; 
            }
            
            if (ano.length === 2) {
                ano = "20" + ano;
            }
            
            return { 
                ano: parseInt(ano), 
                mes: parseInt(mes), 
                dia: parseInt(dia), 
                iso: `${ano}-${mes.toString().padStart(2,'0')}-${dia.toString().padStart(2,'0')}` 
            };
        }
        
        function tratarTSV(tsv) {
            if (tsv.includes('<html') || tsv.includes('<!DOCTYPE')) {
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
                } else if (char === '\t' && !dentroDeAspas) { 
                    linhaAtual.push(celulaAtual); 
                    celulaAtual = "";
                } else if (char === '\n' && !dentroDeAspas) { 
                    linhaAtual.push(celulaAtual.replace(/\r$/, '')); 
                    linhas.push(linhaAtual); 
                    linhaAtual = []; 
                    celulaAtual = "";
                } else { 
                    celulaAtual += char; 
                }
            }
            
            if (celulaAtual || linhaAtual.length > 0) { 
                linhaAtual.push(celulaAtual.replace(/\r$/, '')); 
                linhas.push(linhaAtual); 
            }
            return linhas;
        }

        function toISODate(d) { 
            const ano = d.getFullYear();
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const dia = String(d.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}`; 
        } 
        
        function formatarDataBR(iso) { 
            const partes = iso.split('-'); 
            const ano = partes[0];
            const mes = partes[1];
            const dia = partes[2];
            return `${dia}/${mes}`; 
        } 
        
        function getDiaDaSemana(iso) { 
            const partes = iso.split('-');
            const ano = partes[0];
            const mes = partes[1] - 1;
            const dia = partes[2];
            
            const d = new Date(ano, mes, dia, 12, 0, 0); 
            const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            
            return diasDaSemana[d.getDay()]; 
        } 

        // ==========================================
        // MÓDULO: AULAS E EVENTOS DA TURMA
        // ==========================================
        function processarAulas(tsv) { 
            const linhas = tratarTSV(tsv).slice(1); 
            aulasArray = []; 
            
            linhas.forEach(function(colunas) { 
                if (colunas.length >= 4 && colunas[0] && colunas[1]) { 
                    const dt = processarDataInteligente(colunas[0].trim()); 
                    if (dt) {
                        const codigoLimpo = colunas[1].trim();
                        const nomeDaUC = nomesUC[codigoLimpo] ? nomesUC[codigoLimpo] : '';
                        
                        aulasArray.push({ 
                            data: dt.iso, 
                            codigoUC: codigoLimpo, 
                            uc: `${codigoLimpo} - ${nomeDaUC}`, 
                            docente: colunas[2].trim(), 
                            aula: colunas[3].trim() 
                        }); 
                    }
                } 
            }); 
            initAulas(); 
        }

        function initAulas() { 
            const select = document.getElementById('filtroUC'); 
            select.innerHTML = '<option value="">-- Ver Todas as Aulas --</option>'; 
            
            for (const [codigo, nome] of Object.entries(nomesUC)) { 
                const opt = document.createElement('option'); 
                opt.value = codigo; 
                opt.textContent = `${codigo} - ${nome}`; 
                select.appendChild(opt); 
            } 
            
            mudarSemana(0); 
        } 

        document.getElementById('filtroUC').addEventListener('change', function(e) { 
            const ucSelec = e.target.value;
            
            if (!ucSelec) {
                return window.limparBusca(); 
            }
            
            document.getElementById('painel-aulas').style.display = 'none'; 
            document.getElementById('resultado-pesquisa').style.display = 'flex'; 
            
            const dUC = aulasArray.filter(function(a) {
                return a.codigoUC === ucSelec;
            }); 
            
            const hojeStr = toISODate(new Date()); 
            
            let todasEncerradas = false;
            if (dUC.length > 0) {
                todasEncerradas = dUC.every(function(a) {
                    return a.data < hojeStr;
                });
            }
            
            // Substitua esta linha específica:
            let htmlHTML = `<div class="card" style="border-top-width:4px; border-top-color:#f59e0b; width: 100%;">
                        <button onclick="window.limparBusca()" class="btn btn-outline" style="border-color:#f59e0b; color:#f59e0b; padding:8px; margin-bottom:16px;">Limpar Busca</button>
                        <h3 style="color:#f59e0b; margin-bottom:16px;">${nomesUC[ucSelec]}</h3>`; 
            
            if (todasEncerradas) {
                htmlHTML += `<div style="background:rgba(16,185,129,0.1); color:#10b981; padding:12px; border-radius:8px; font-weight:700; margin-bottom:16px;">✅ UC Encerrada</div>`; 
            }
            
            if (dUC.length === 0) {
                htmlHTML += `<p style="color:var(--text-muted);">Nenhuma aula agendada para esta UC na base.</p>`;
            }
            
            dUC.forEach(function(a) { 
                const isPast = a.data < hojeStr; 
                let rowStyle = "padding:12px 0; border-bottom:1px solid var(--border-color);";
                
                if (isPast) {
                    rowStyle = "padding:12px 0; border-bottom:1px solid var(--border-color); color:var(--text-muted); opacity:0.6;";
                }
                
                htmlHTML += `<div style="${rowStyle}" onclick="abrirModal('${a.data}','${a.uc}','${a.docente}','${a.aula}')">
                        <strong style="color:#fff;">${formatarDataBR(a.data)}</strong> - Prof. ${a.docente} 
                        <span style="display:block; font-size:0.85em; color:var(--text-muted);">Aula ${a.aula}</span>
                      </div>`; 
            }); 
            
            htmlHTML += `</div>`;
            document.getElementById('resultado-pesquisa').innerHTML = htmlHTML; 
        }); 

        window.limparBusca = function() { 
            document.getElementById('filtroUC').value = ""; 
            document.getElementById('resultado-pesquisa').style.display = 'none'; 
            document.getElementById('painel-aulas').style.display = 'flex'; 
        }

       // Alteração gerada em: 09/03/2026 - 21:57
        function mudarSemana(offset) { 
            const btnPassada = document.getElementById('btn-passada');
            const btnAtual = document.getElementById('btn-atual');
            const btnQueVem = document.getElementById('btn-que-vem');
            
            // Cores temáticas para cada estado
            const corPassada = 'var(--text-muted)';
            const corAtual = 'var(--accent-aulas)';
            const corQueVem = 'var(--accent-datas)';

            // 1. Reset Geral: Todos ficam com fundo transparente e borda colorida
            btnPassada.style.cssText = `padding: 12px 8px; font-size: 0.85rem; background: transparent; color: ${corPassada}; border-color: ${corPassada};`;
            btnAtual.style.cssText = `padding: 12px 8px; font-size: 0.85rem; background: transparent; color: ${corAtual}; border-color: ${corAtual};`;
            btnQueVem.style.cssText = `padding: 12px 8px; font-size: 0.85rem; background: transparent; color: ${corQueVem}; border-color: ${corQueVem};`;

            // 2. Aplica o fundo preenchido apenas ao botão ativo
            if (offset === -1) {
                btnPassada.style.background = corPassada;
                btnPassada.style.color = '#fff'; 
            } else if (offset === 0) {
                btnAtual.style.background = corAtual;
                btnAtual.style.color = '#fff';
            } else if (offset === 1) {
                btnQueVem.style.background = corQueVem;
                btnQueVem.style.color = '#121212'; // Contraste escuro para o ciano
            }
            
            const hoje = new Date(); 
            const diaDaSemanaHoje = hoje.getDay();
            
            // Calculando Segunda-feira da semana alvo
            const diffParaSegunda = hoje.getDate() - diaDaSemanaHoje + 1 + (offset * 7);
            const segundaFeira = new Date(hoje.getFullYear(), hoje.getMonth(), diffParaSegunda, 12, 0, 0); 
            
            // Calculando Sexta-feira da semana alvo
            const sextaFeira = new Date(segundaFeira.getFullYear(), segundaFeira.getMonth(), segundaFeira.getDate() + 4, 12, 0, 0); 
            
            const hojeStr = toISODate(hoje); 
            const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1); 
            const amanhaStr = toISODate(amanha); 
            
            const aSemana = aulasArray.filter(function(a) {
                return a.data >= toISODate(segundaFeira) && a.data <= toISODate(sextaFeira);
            }); 
            
            let htmlHTML = `<h3 style="margin-bottom:16px; text-align:center; color:var(--text-muted); font-family: 'DM Sans', sans-serif; font-size: 1rem;">Cronograma da Semana</h3>`; 
            
            if (aSemana.length === 0) { 
                htmlHTML += `<div class="card"><div style="text-align:center; color:var(--text-muted);">Sem aulas programadas para esta semana.</div></div>`; 
            } 
            
            aSemana.forEach(function(a) { 
                const isCancelled = a.aula.toLowerCase().includes('cancelada'); 
                let statusMsg = ''; 
                let colorHex = 'var(--accent-aulas)';

                if (isCancelled) { 
                    statusMsg = `❌ CANCELADA`; 
                    colorHex = 'var(--accent-danger)';
                } else if (a.data === hojeStr) { 
                    statusMsg = '🔥 HOJE'; 
                    colorHex = '#e91e63';
                } else if (a.data === amanhaStr) { 
                    statusMsg = `AMANHÃ! ⚡`; 
                    colorHex = 'var(--accent-warning)';
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
            
            document.getElementById('painel-aulas').innerHTML = htmlHTML; 
        }

        // ==========================================
        // MÓDULO: EVENTOS DA TURMA
        // ==========================================
        function processarEventos(tsv) { 
            const linhas = tratarTSV(tsv).slice(1); 
            baseEventos = []; 
            
            linhas.forEach(function(colunas) { 
                if (colunas.length >= 2 && colunas[0]) {
                    baseEventos.push({ 
                        data: colunas[0].trim(), 
                        titulo: colunas[1] ? colunas[1].trim() : '', 
                        desc: colunas[2] ? colunas[2].trim() : '' 
                    }); 
                }
            }); 
            
            initEventos(); 
        }

        function initEventos() { 
            const container = document.getElementById('lista-eventos'); 
            let htmlHTML = ''; 
            
            if (baseEventos.length === 0) { 
                container.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhum evento interno programado.</p>"; 
                return; 
            } 
            
            // Trava de Segurança na Ordenação
            baseEventos.sort(function(a, b) {
                const dtA = processarDataInteligente(a.data); 
                const dtB = processarDataInteligente(b.data);
                if (!dtA || !dtB) {
                    return 0;
                }
                const tempoA = new Date(dtA.iso).getTime();
                const tempoB = new Date(dtB.iso).getTime();
                return tempoA - tempoB;
            });
            
            const hojeLocal = new Date(); 
            hojeLocal.setHours(0, 0, 0, 0); 
            
            let eventosExibidos = 0; 
            
            baseEventos.forEach(function(ev) { 
                const dt = processarDataInteligente(ev.data); 
                if (!dt) {
                    return; 
                }
                
                const dataEvento = new Date(dt.ano, dt.mes - 1, dt.dia);
                const diffTime = dataEvento.getTime() - hojeLocal.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays < -10) {
                    return; 
                }
                
                let countdownHTML = ""; 
                
                if (diffDays > 1) { 
                    countdownHTML = `<span style="font-weight:normal; opacity:0.8;">Faltam ${diffDays} dias</span>`; 
                } else if (diffDays === 1) { 
                    countdownHTML = `<span style="color:var(--accent-warning);">É amanhã!</span>`; 
                } else if (diffDays === 0) { 
                    countdownHTML = `<span style="color:#e91e63;">É hoje!</span>`; 
                } else { 
                    countdownHTML = `<span style="font-weight:normal; opacity:0.5;">Passou</span>`; 
                } 
                
                htmlHTML += `<div class="card" style="border-top-width:4px; border-top-color:var(--accent-eventos);">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:8px;">
                                <span>${dt.dia.toString().padStart(2,'0')}/${dt.mes.toString().padStart(2,'0')}</span>
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

        // ==========================================
        // MÓDULO: AGENDA E RADAR CULTURAL V5
        // ==========================================
        function getCategoriaClasse(categoriaReal) {
            if (!categoriaReal) {
                return 'cat-default';
            }
            
            const str = categoriaReal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            
            if (str.includes('concurso') || str.includes('premio')) return 'cat-concurso';
            if (str.includes('edital') || str.includes('editais')) return 'cat-edital';
            if (str.includes('convocatoria')) return 'cat-convocatoria';
            if (str.includes('exposi')) return 'cat-exposicao';
            if (str.includes('mostra')) return 'cat-mostra';
            if (str.includes('curso')) return 'cat-cursos';
            if (str.includes('palestra')) return 'cat-palestra';
            if (str.includes('workshop')) return 'cat-workshop';
            if (str.includes('feira')) return 'cat-feira';
            if (str.includes('festival')) return 'cat-festival';
            
            return 'cat-default';
        }

        function processarDatas(tsv) { 
            const linhas = tratarTSV(tsv).slice(1); 
            baseDatas = []; 
            
            if(linhas.length === 0) {
                return;
            }
            
            linhas.forEach(function(colunas) { 
                if (colunas.length >= 1 && colunas[0] && colunas[0].trim() !== '') {
                    const dtInic = processarDataInteligente(colunas[0].trim());
                    if (!dtInic) return;
                    
                    const dtFim = (colunas.length > 1 && colunas[1].trim() !== '') ? processarDataInteligente(colunas[1].trim()) : dtInic;
                    const categoriaRaw = colunas.length > 2 && colunas[2].trim() !== '' ? colunas[2].trim() : 'Evento';
                    
                    const categoriasArray = categoriaRaw.split(';').map(function(cat) { 
                        const nome = cat.trim(); 
                        return { nome: nome, classe: getCategoriaClasse(nome) }; 
                    });
                    
                    const titulo = colunas.length > 3 ? colunas[3].trim() : 'Sem Título';
                    const local = colunas.length > 4 ? colunas[4].trim() : '';
                    const desc = colunas.length > 5 ? colunas[5].trim() : '';
                    
                    let link = colunas.length > 6 ? colunas[6].trim() : '';
                    if (link && !link.startsWith('http')) {
                        link = 'https://' + link;
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
                        uf: uf 
                    }); 
                }
            }); 
            
            renderFiltrosAgenda(); 
            initDatas(); 
        }

        function renderFiltrosAgenda() {
            const painelFiltros = document.getElementById('painel-filtros');
            const boxCat = document.getElementById('filtros-categoria');
            const boxUF = document.getElementById('filtros-uf');
            const boxUrgencia = document.getElementById('filtros-urgencia');
            const tituloUrgencia = document.getElementById('titulo-filtro-urgencia');
            
            if (baseDatas.length === 0) { 
                painelFiltros.style.display = 'none'; 
                return; 
            } 
            
            painelFiltros.style.display = 'block';

            let setCat = new Set(); 
            let setUF = new Set(); 
            let temUltimosDias = false; 
            let temEmBreve = false;
            let temEmAndamento = false;
            
            const hojeObj = new Date();
            hojeObj.setHours(0,0,0,0);
            const hojeTime = hojeObj.getTime();

            baseDatas.forEach(function(d) { 
                d.categorias.forEach(function(catObj) { setCat.add(catObj.nome); }); 
                if(d.uf) { setUF.add(d.uf); }
                
                // Conversão de datas para cálculo preciso
                const dtInicObj = new Date(d.dtInic.ano, d.dtInic.mes - 1, d.dtInic.dia).getTime();
                const dtFimObj = new Date(d.dtFim.ano, d.dtFim.mes - 1, d.dtFim.dia).getTime();
                
                const diffInicDays = Math.round((dtInicObj - hojeTime) / (1000 * 60 * 60 * 24));
                const diffFimDays = Math.round((dtFimObj - hojeTime) / (1000 * 60 * 60 * 24));
                
                // REGRA 1: Últimos dias
                if (diffInicDays <= 0 && diffFimDays >= 0 && diffFimDays <= 7) {
                    temUltimosDias = true;
                }
                // REGRA 2: Em Breve
                if (diffInicDays > 0 && diffInicDays <= 7) {
                    temEmBreve = true;
                }
                // REGRA 3: Em Andamento
                if (diffInicDays <= 0 && diffFimDays >= 0) {
                    temEmAndamento = true;
                }
            });

            let classTodasCat = filtrosCatAtivos.size === 0 ? 'active' : '';
            let htmlCat = `<div class="filter-chip chip-todas ${classTodasCat}" onclick="toggleFiltroCategoria('TODAS')">Todas</div>`;
            
            Array.from(setCat).sort().forEach(function(c) {
                const isActive = filtrosCatAtivos.has(c) ? 'active' : '';
                const cor = getCategoriaClasse(c);
                htmlCat += `<div class="filter-chip ${cor} ${isActive}" onclick="toggleFiltroCategoria('${c.replace(/'/g, "\\'")}')">${c}</div>`;
            });
            boxCat.innerHTML = htmlCat;

            let classTodasUF = filtrosUFAtivos.size === 0 ? 'active' : '';
            let htmlUF = `<div class="filter-chip chip-todas ${classTodasUF}" onclick="toggleFiltroUF('TODOS')">Brasil</div>`;
            
            Array.from(setUF).sort().forEach(function(u) {
                const isActive = filtrosUFAtivos.has(u) ? 'active' : '';
                htmlUF += `<div class="filter-chip chip-uf ${isActive}" onclick="toggleFiltroUF('${u}')">${u}</div>`;
            });
            boxUF.innerHTML = htmlUF;

            // Renderiza os Botões de Urgência / Status
            if (boxUrgencia && tituloUrgencia) {
                if (temUltimosDias || temEmBreve || temEmAndamento) {
                    tituloUrgencia.style.display = 'block';
                    boxUrgencia.style.display = 'flex';
                    let chipsHTML = '';
                    
                    if (temEmAndamento) {
                        let classAtivo = filtroEmAndamentoAtivo ? 'active' : '';
                        let estiloExtra = filtroEmAndamentoAtivo 
                            ? 'border-color: #10b981; background: #10b981; color: #fff;' 
                            : 'border-color: #10b981; color: #10b981; background: transparent;';
                        chipsHTML += `<div class="filter-chip ${classAtivo}" style="${estiloExtra}" onclick="toggleFiltroUrgencia('andamento')">▶️ EM ANDAMENTO</div>`;
                    }
                    
                    if (temUltimosDias) {
                        let classAtivo = filtroUltimosDiasAtivo ? 'active' : '';
                        let estiloExtra = filtroUltimosDiasAtivo 
                            ? 'border-color: var(--accent-danger); background: var(--accent-danger); color: #fff;' 
                            : 'border-color: var(--accent-danger); color: var(--accent-danger); background: transparent;';
                        chipsHTML += `<div class="filter-chip ${classAtivo}" style="${estiloExtra}" onclick="toggleFiltroUrgencia('ultimos')">🚨 ÚLTIMOS DIAS</div>`;
                    }
                    
                    if (temEmBreve) {
                        let classAtivo = filtroEmBreveAtivo ? 'active' : '';
                        let estiloExtra = filtroEmBreveAtivo 
                            ? 'border-color: var(--accent-warning); background: var(--accent-warning); color: #000;' 
                            : 'border-color: var(--accent-warning); color: var(--accent-warning); background: transparent;';
                        chipsHTML += `<div class="filter-chip ${classAtivo}" style="${estiloExtra}" onclick="toggleFiltroUrgencia('breve')">⏳ EM BREVE</div>`;
                    }
                    
                    boxUrgencia.innerHTML = chipsHTML;
                } else {
                    tituloUrgencia.style.display = 'none';
                    boxUrgencia.style.display = 'none';
                    filtroUltimosDiasAtivo = false;
                    filtroEmBreveAtivo = false;
                    filtroEmAndamentoAtivo = false;
                }
            }
        }

        function toggleFiltroCategoria(cat) {
            if (cat === 'TODAS') { 
                filtrosCatAtivos.clear(); 
            } else { 
                if (filtrosCatAtivos.has(cat)) {
                    filtrosCatAtivos.delete(cat); 
                } else {
                    filtrosCatAtivos.add(cat); 
                }
            }
            renderFiltrosAgenda(); 
            initDatas();
        }

        function toggleFiltroUF(uf) {
            if (uf === 'TODOS') { 
                filtrosUFAtivos.clear(); 
            } else { 
                if (filtrosUFAtivos.has(uf)) {
                    filtrosUFAtivos.delete(uf); 
                } else {
                    filtrosUFAtivos.add(uf); 
                }
            }
            renderFiltrosAgenda(); 
            initDatas();
        }

        function toggleFiltroUrgencia(tipo) {
            if (tipo === 'ultimos') {
                filtroUltimosDiasAtivo = !filtroUltimosDiasAtivo;
                filtroEmBreveAtivo = false;
                filtroEmAndamentoAtivo = false;
            } else if (tipo === 'breve') {
                filtroEmBreveAtivo = !filtroEmBreveAtivo;
                filtroUltimosDiasAtivo = false;
                filtroEmAndamentoAtivo = false;
            } else if (tipo === 'andamento') {
                filtroEmAndamentoAtivo = !filtroEmAndamentoAtivo;
                filtroUltimosDiasAtivo = false;
                filtroEmBreveAtivo = false;
            }
            renderFiltrosAgenda();
            initDatas();
        }

        function initDatas() { 
            const container = document.getElementById('lista-datas'); 
            let htmlHTML = ''; 
            
            if (baseDatas.length === 0) { 
                container.innerHTML = "<p style='text-align:center; color:var(--text-muted);'>Nenhuma data cadastrada na base.</p>"; 
                return; 
            } 
            
            baseDatas.sort(function(a, b) { 
                return new Date(a.dtInic.iso).getTime() - new Date(b.dtInic.iso).getTime(); 
            });
            
            const hojeISO = toISODate(new Date()); 
            const hojeObj = new Date();
            hojeObj.setHours(0,0,0,0);
            const hojeTime = hojeObj.getTime();
            
            let datasExibidas = 0; 
            
            baseDatas.forEach(function(ev) { 
                // Filtro Cruzado de Categorias
                const temCategoriaAtiva = filtrosCatAtivos.size === 0 || ev.categorias.some(function(cat) {
                    return filtrosCatAtivos.has(cat.nome);
                });
                
                if (!temCategoriaAtiva) return;
                if (filtrosUFAtivos.size > 0 && (!ev.uf || !filtrosUFAtivos.has(ev.uf))) return;

                // Cálculo de Urgência e Status
                const dtInicObj = new Date(ev.dtInic.ano, ev.dtInic.mes - 1, ev.dtInic.dia).getTime();
                const dtFimObj = new Date(ev.dtFim.ano, ev.dtFim.mes - 1, ev.dtFim.dia).getTime();
                
                const diffInicDays = Math.round((dtInicObj - hojeTime) / (1000 * 60 * 60 * 24));
                const diffFimDays = Math.round((dtFimObj - hojeTime) / (1000 * 60 * 60 * 24));
                
                const isUltimosDias = diffInicDays <= 0 && diffFimDays >= 0 && diffFimDays <= 7;
                const isEmBreve = diffInicDays > 0 && diffInicDays <= 7;
                const isEmAndamento = diffInicDays <= 0 && diffFimDays >= 0;

                // Bloqueia a renderização se um dos filtros de status estiver ativo e o evento não corresponder
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
                ev.categorias.forEach(function(cat) { 
                    tagsHTML += `<span class="ev-tipo ${cat.classe}">${cat.nome}</span> `; 
                });
                
                // Distintivos Visuais Diferenciados (Badges)
                let badgeHTML = "";
                // Prioridade de exibição: Últimos dias sobrepõe o Em Andamento
                if (isUltimosDias) {
                    badgeHTML = `<span style="background: var(--accent-danger); color: #fff; font-size: 0.6rem; font-family: 'DM Sans', sans-serif; font-weight: 800; padding: 4px 8px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">🚨 ÚLTIMOS DIAS</span>`;
                } else if (isEmBreve) {
                    badgeHTML = `<span style="background: var(--accent-warning); color: #000; font-size: 0.6rem; font-family: 'DM Sans', sans-serif; font-weight: 800; padding: 4px 8px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">⏳ EM BREVE</span>`;
                } else if (isEmAndamento) {
                    badgeHTML = `<span style="background: #10b981; color: #fff; font-size: 0.6rem; font-family: 'DM Sans', sans-serif; font-weight: 800; padding: 4px 8px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; vertical-align: middle;">▶️ EM ANDAMENTO</span>`;
                }

                const classeBordaPrincipal = ev.categorias.length > 0 ? ev.categorias[0].classe : 'cat-default';

                // GOOGLE CALENDAR
                const dateStart = ev.dtInic.iso.replace(/-/g, '');
                let dateEndStr = ev.dtFim ? ev.dtFim.iso : ev.dtInic.iso;
                let dateEndObj = new Date(dateEndStr);
                dateEndObj.setDate(dateEndObj.getDate() + 1); 
                const dateEnd = toISODate(dateEndObj).replace(/-/g, '');
                
                const urlTitulo = encodeURIComponent(ev.titulo);
                const urlDetalhe = encodeURIComponent(`Link: ${ev.link}\n\n${ev.desc}`);
                const urlLocal = encodeURIComponent(ev.local);
                const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${urlTitulo}&dates=${dateStart}/${dateEnd}&details=${urlDetalhe}&location=${urlLocal}`;

                htmlHTML += `
                    <div class="card datas-int ${classeBordaPrincipal}">
                        <div style="margin-bottom: 12px;">${tagsHTML}</div>
                        <div class="ev-titulo">${ev.titulo} ${badgeHTML}</div>
                        <div class="ev-periodo">📅 ${periodoHTML}</div>
                        ${ev.local ? `<div class="ev-local">📍 ${ev.local}</div>` : ''}
                        ${ev.desc ? `<div class="ev-desc">${ev.desc}</div>` : ''}
                        
                        <div style="display: flex; gap: 8px; margin-top: 24px; flex-wrap: wrap;">
                            ${ev.link ? `<a href="${ev.link}" target="_blank" class="btn btn-outline" style="font-size:0.8rem; padding:10px;">SAIBA MAIS (Link externo)</a>` : ''}
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

        // ==========================================
        // MÓDULO DA ENCICLOPÉDIA 
        // ==========================================
        function processarDicio(tsv) {
            const linhas = tratarTSV(tsv).slice(1); 
            dicioArray = []; 
            let catSet = new Set();
            
            linhas.forEach(function(colunas) {
                if (colunas.length >= 3 && colunas[0] && colunas[0].trim() !== '') {
                    let cat = colunas[1] ? colunas[1].trim() : 'Geral';
                    dicioArray.push({ 
                        termo: colunas[0].trim(), 
                        categoria: cat, 
                        definicao: colunas[2] ? colunas[2].trim() : '' 
                    });
                    catSet.add(cat);
                }
            });
            
            const selectCat = document.getElementById('filtroCategoriaDicio');
            if (selectCat) {
                let optionsHtml = '<option value="">Todas as Categorias</option>';
                Array.from(catSet).sort().forEach(function(c) { 
                    optionsHtml += `<option value="${c}">${c}</option>`; 
                });
                selectCat.innerHTML = optionsHtml;
            }
            
            if (dicioMode === 'search') {
                renderDicioSearch();
            }
        }

        function toggleDicioMode() {
            const btn = document.getElementById('btn-toggle-dicio');
            const areaSearch = document.getElementById('dicio-search-area'); 
            const areaAlpha = document.getElementById('dicio-alpha-area');
            
            if (dicioMode === 'search') {
                dicioMode = 'index'; 
                btn.innerText = "🔍 Buscar"; 
                btn.style.backgroundColor = "var(--accent-dicio)"; 
                btn.style.color = "#fff";
                
                areaSearch.classList.add('hidden'); 
                areaAlpha.classList.remove('hidden'); 
                
                renderAlphabet(); 
                renderDicioIndex(currentLetter);
            } else {
                dicioMode = 'search'; 
                btn.innerText = "🔤 Índice A-Z"; 
                btn.style.backgroundColor = "transparent"; 
                btn.style.color = "var(--accent-dicio)";
                
                areaSearch.classList.remove('hidden'); 
                areaAlpha.classList.add('hidden'); 
                document.getElementById('buscaDicio').value = ''; 
                
                renderDicioSearch();
            }
        }

        function renderAlphabet() {
            const cont = document.getElementById('dicio-alpha-area'); 
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''); 
            let htmlHTML = '';
            
            letters.forEach(function(letra) { 
                const activeClass = (letra === currentLetter) ? 'active chip-todas' : ''; 
                htmlHTML += `<div class="filter-chip ${activeClass}" style="border-radius:8px; padding:8px 14px;" onclick="selectLetter('${letra}')">${letra}</div>`; 
            });
            
            cont.innerHTML = htmlHTML;
        }

        function selectLetter(l) { 
            currentLetter = l; 
            renderAlphabet(); 
            renderDicioIndex(l); 
        }

        function filtrarDicio() { 
            if (dicioMode === 'search') {
                renderDicioSearch(); 
            }
        }

        function renderDicioSearch() {
            const container = document.getElementById('lista-dicio');
            if (dicioArray.length === 0) { 
                container.innerHTML = "<p style='text-align:center; color:var(--text-muted); grid-column: 1/-1;'>Nenhum dado vinculado ainda.</p>"; 
                return; 
            }
            
            const inputFiltro = document.getElementById('buscaDicio').value.toLowerCase(); 
            const catFiltro = document.getElementById('filtroCategoriaDicio').value;
            
            const itensFiltrados = dicioArray.filter(function(item) {
                const matchTexto = item.termo.toLowerCase().includes(inputFiltro) || item.definicao.toLowerCase().includes(inputFiltro);
                const matchCat = catFiltro === "" || item.categoria === catFiltro;
                return matchTexto && matchCat;
            }).sort(function(a, b) {
                return a.termo.localeCompare(b.termo);
            });
            
            if (itensFiltrados.length === 0) { 
                container.innerHTML = "<p style='text-align:center; color:var(--text-muted); grid-column: 1/-1;'>Nenhum termo encontrado.</p>"; 
                return; 
            }
            
            let htmlHTML = "";
            itensFiltrados.forEach(function(item) {
                const termoSafe = item.termo.replace(/'/g, "\\'");
                const catSafe = item.categoria.replace(/'/g, "\\'");
                const defSafe = item.definicao.replace(/'/g, "\\'").replace(/\n/g, '\\n');
                
                htmlHTML += `<div class="card dicio-item" onclick="abrirVerbeteModal('${termoSafe}', '${catSafe}', '${defSafe}')">
                            <div class="term" style="margin-bottom: 2px;">${item.termo}</div>
                            <div style="font-size: 0.75rem; color: var(--accent-dicio); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px;">${item.categoria}</div>
                            <div class="preview">${item.definicao}</div>
                         </div>`;
            });
            
            container.innerHTML = htmlHTML;
        }

        function renderDicioIndex(letter) {
            const container = document.getElementById('lista-dicio'); 
            if (dicioArray.length === 0) return;
            
            const itensFiltrados = dicioArray.filter(function(item) { 
                return item.termo.toUpperCase().startsWith(letter);
            }).sort(function(a, b) {
                return a.termo.localeCompare(b.termo);
            });
            
            if (itensFiltrados.length === 0) { 
                container.innerHTML = `<p style='text-align:center; color:var(--text-muted); margin-top:20px; grid-column: 1/-1;'>Nenhum verbete com a letra <strong>${letter}</strong>.</p>`; 
                return; 
            }
            
            let htmlHTML = '';
            itensFiltrados.forEach(function(item) {
                const termoSafe = item.termo.replace(/'/g, "\\'");
                const catSafe = item.categoria.replace(/'/g, "\\'");
                const defSafe = item.definicao.replace(/'/g, "\\'").replace(/\n/g, '\\n');
                
                htmlHTML += `<div class="card dicio-item" onclick="abrirVerbeteModal('${termoSafe}', '${catSafe}', '${defSafe}')">
                            <div class="term" style="margin-bottom: 2px;">${item.termo}</div>
                            <div style="font-size: 0.75rem; color: var(--accent-dicio); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 8px;">${item.categoria}</div>
                            <div class="preview">${item.definicao}</div>
                         </div>`;
            });
            
            container.innerHTML = htmlHTML;
        }

        // ==========================================
        // MÓDULO DE LUZ NATURAL E LUA
        // ==========================================
        let locLat = -23.5266; 
        let locLng = -46.6963; 
        let locName = "SNC Lapa Scipião (SP)";
        
        function formatTime(date) { 
            if (isNaN(date.getTime())) {
                return "--:--"; 
            }
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); 
        }

        function getEducativeInfo(time, lat, lng) {
            if (isNaN(time.getTime())) {
                return "";
            }
            const pos = SunCalc.getPosition(time, lat, lng);
            let altDeg = pos.altitude * 180 / Math.PI;
            let aziDeg = (pos.azimuth * 180 / Math.PI) + 180;
            
            let altText = "";
            if (altDeg < 0) { altText = "Abaixo do horizonte (Luz indireta)"; }
            else if (altDeg < 15) { altText = "Muito baixo (Sombras longas)"; }
            else if (altDeg < 45) { altText = "Baixo (Sombras médias)"; }
            else if (altDeg < 75) { altText = "Alto (Sombras curtas)"; }
            else { altText = "A pino (Sombras duras)"; }

            let dir = "";
            if (aziDeg >= 337.5 || aziDeg < 22.5) { dir = "Norte (N)"; }
            else if (aziDeg < 67.5) { dir = "Nordeste (NE)"; }
            else if (aziDeg < 112.5) { dir = "Leste (L)"; }
            else if (aziDeg < 157.5) { dir = "Sudeste (SE)"; }
            else if (aziDeg < 202.5) { dir = "Sul (S)"; }
            else if (aziDeg < 247.5) { dir = "Sudoeste (SO)"; }
            else if (aziDeg < 292.5) { dir = "Oeste (O)"; }
            else { dir = "Noroeste (NO)"; }

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

            if (phase < 0.03 || phase > 0.97) { 
                phaseName = "Nova"; emoji = "🌑"; witticism = "Zero luz! Paraíso das astrofotografias."; 
            } else if (phase < 0.25) { 
                phaseName = "Crescente"; emoji = "🌒"; witticism = "Rende fotos com luz suave noturna."; 
            } else if (phase < 0.28) { 
                phaseName = "Quarto Crescente"; emoji = "🌓"; witticism = "Luz lateral dramática, ótima para crateras."; 
            } else if (phase < 0.47) { 
                phaseName = "Gibosa Crescente"; emoji = "🌔"; witticism = "Quase cheia! A luz já ofusca estrelas."; 
            } else if (phase < 0.53) { 
                phaseName = "Cheia"; emoji = "🌕"; witticism = "Um rebatedor gigante no céu. Luz dura."; 
            } else if (phase < 0.72) { 
                phaseName = "Gibosa Minguante"; emoji = "🌖"; witticism = "A iluminação começa a diminuir."; 
            } else if (phase < 0.78) { 
                phaseName = "Quarto Minguante"; emoji = "🌗"; witticism = "Ideal para captar o nascer da lua de madrugada."; 
            } else { 
                phaseName = "Minguante"; emoji = "🌘"; witticism = "Brilho sumindo, como a bateria da câmera."; 
            }

            let supermoonTag = "";
            if (distance < 365000 && (phase > 0.45 && phase < 0.55)) { 
                supermoonTag = "<br><br>🌕 <strong>SUPER LUA:</strong> Perigeu. Prepare a teleobjetiva!"; 
            } else if (distance > 400000 && (phase < 0.05 || phase > 0.95)) { 
                supermoonTag = "<br><br>🌑 <strong>Micro Lua:</strong> Apogeu."; 
            }
            
            let eclipseText = "";
            if (phase < 0.03 || phase > 0.97 || (phase > 0.47 && phase < 0.53)) {
                eclipseText = " (Risco de eclipses!).";
            }

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
            const weatherDiv = document.getElementById('weather-results');
            const hojeStr = toISODate(new Date()); 
            const targetStr = toISODate(targetDate);
            
            if (targetStr !== hojeStr) { 
                weatherDiv.innerHTML = ''; 
                weatherDiv.classList.add('hidden'); 
                return; 
            }
            
            weatherDiv.innerHTML = '<span style="color:var(--text-muted);">🌤️ Consultando meteorologia...</span>'; 
            weatherDiv.classList.remove('hidden');
            
            const weather = await fetchWeather(locLat, locLng);
            
            if (!weather) { 
                weatherDiv.innerHTML = '<span style="color:var(--text-muted);">⚠️ Clima indisponível no modo offline.</span>'; 
                return; 
            }
            
            const code = weather.weathercode; 
            const isDay = weather.is_day === 1; 
            
            let icon = isDay ? '🌤️' : '🌙'; 
            let condicao = 'Misto'; 
            let dica = '';

            if (code === 0) { 
                icon = isDay ? '☀️' : '🌑'; 
                condicao = 'Céu Limpo'; 
                dica = isDay 
                    ? 'Luz dura e sombras fortes. Use difusores para retratos.' 
                    : 'Noite limpa. Excelente para astrofotografia e exposições longas.'; 
            } else if (code >= 1 && code <= 3) { 
                icon = '☁️'; 
                condicao = 'Nublado / Parcial'; 
                dica = isDay 
                    ? 'Luz suave (softbox natural). Cores fiéis e baixo contraste.' 
                    : 'Noite nublada. As nuvens refletem a poluição luminosa da cidade.'; 
            } else if (code === 45 || code === 48) { 
                icon = '🌫️'; 
                condicao = 'Neblina'; 
                dica = isDay 
                    ? 'Aproveite a profundidade atmosférica e silhuetas.' 
                    : 'Clima noir. As luzes da rua criam halos incríveis. Foco manual recomendado.'; 
            } else if (code >= 51 && code <= 67) { 
                icon = '🌧️'; 
                condicao = 'Chuva'; 
                dica = isDay 
                    ? 'Cores saturadas, mas proteja bem o equipamento.' 
                    : 'Aproveite os reflexos dramáticos no asfalto molhado. Proteja a câmera.'; 
            } else if (code >= 80 && code <= 99) { 
                icon = '⛈️'; 
                condicao = 'Risco de Chuva Forte'; 
                dica = isDay 
                    ? 'Luz dramática, mas risco ao equipamento.' 
                    : 'Luzes dramáticas e risco de raios. Evite áreas abertas.'; 
            }
            
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
            
            // O título fica solto em cima agora
            document.getElementById('local-ref-title').innerHTML = `📍 Referência: <strong>${locName}</strong>`;
            
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
            
            document.getElementById('suncalc-results').innerHTML = htmlHTML; 
            document.getElementById('moon-results').innerHTML = getMoonInfo(targetDate);
            document.getElementById('meteor-results').innerHTML = getMeteorInfo(targetDate); // Motor de Meteoros
            
            updateWeatherUI(targetDate);
        }

        // NOVO: Navegação entre Diurno e Noturno
        function switchLuzTab(tab) {
            const btnDiurna = document.getElementById('btn-tab-diurna');
            const btnNoturna = document.getElementById('btn-tab-noturna');
            const containerSun = document.getElementById('sun-data-container');
            const containerAstro = document.getElementById('astro-data-container');
            
            if (tab === 'diurna') {
                btnDiurna.classList.add('active');
                btnNoturna.classList.remove('active');
                containerSun.classList.remove('hidden');
                containerAstro.classList.add('hidden');
            } else {
                btnNoturna.classList.add('active');
                btnDiurna.classList.remove('active');
                containerAstro.classList.remove('hidden');
                containerSun.classList.add('hidden');
            }
        }

        // NOVO: O Motor de Chuva de Meteoros Offline
        function getMeteorInfo(targetDate) {
            const m = targetDate.getMonth() + 1; // 1 a 12
            const d = targetDate.getDate(); // 1 a 31
            
            // Banco de Dados Estático Anual (Nunca expira)
            const chuvas = [
                { nome: "Quadrantídeas", inicio: { m: 12, d: 28 }, fim: { m: 1, d: 12 }, pico: { m: 1, d: 3 }, taxa: 120, descricao: "Forte, mas janela de pico muito curta." },
                { nome: "Líridas", inicio: { m: 4, d: 14 }, fim: { m: 4, d: 30 }, pico: { m: 4, d: 22 }, taxa: 18, descricao: "Meteoros brilhantes, boa para fotografia." },
                { nome: "Eta Aquáridas", inicio: { m: 4, d: 19 }, fim: { m: 5, d: 28 }, pico: { m: 5, d: 6 }, taxa: 50, descricao: "Originada pelo Cometa Halley, excelente no Hemisfério Sul." },
                { nome: "Delta Aquáridas", inicio: { m: 7, d: 12 }, fim: { m: 8, d: 23 }, pico: { m: 7, d: 30 }, taxa: 25, descricao: "Dois radiantes, ritmo constante e prolongado." },
                { nome: "Perseidas", inicio: { m: 7, d: 17 }, fim: { m: 8, d: 24 }, pico: { m: 8, d: 12 }, taxa: 100, descricao: "A mais famosa do ano. Muitos meteoros brilhantes e rastros longos." },
                { nome: "Orionídeas", inicio: { m: 10, d: 2 }, fim: { m: 11, d: 7 }, pico: { m: 10, d: 21 }, taxa: 20, descricao: "Meteoros muito rápidos, também poeira do Cometa Halley." },
                { nome: "Leônidas", inicio: { m: 11, d: 6 }, fim: { m: 11, d: 30 }, pico: { m: 11, d: 17 }, taxa: 15, descricao: "Famosa por gerar 'tempestades' históricas no passado." },
                { nome: "Geminídeas", inicio: { m: 12, d: 4 }, fim: { m: 12, d: 20 }, pico: { m: 12, d: 14 }, taxa: 150, descricao: "A melhor chuva do ano. Intensa, multicolorida e confiável." },
                { nome: "Ursídeas", inicio: { m: 12, d: 17 }, fim: { m: 12, d: 26 }, pico: { m: 12, d: 22 }, taxa: 10, descricao: "Baixa intensidade, estritamente visível nas madrugadas." }
            ];
            
            let chuvaAtiva = null;
            let isPico = false;
            
            // Procura se a data cai dentro de alguma janela de chuva
            for (let i = 0; i < chuvas.length; i++) {
                const c = chuvas[i];
                let ativa = false;
                
                if (c.inicio.m > c.fim.m) {
                    // Cobre a virada de ano (ex: Dezembro a Janeiro)
                    if ((m === c.inicio.m && d >= c.inicio.d) || (m === c.fim.m && d <= c.fim.d)) { ativa = true; }
                } else {
                    // Mês normal
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
            
            let corBorda = isPico ? 'var(--accent-eventos)' : '#6366f1'; 
            let bgPainel = isPico ? 'rgba(217, 70, 239, 0.05)' : 'rgba(99, 102, 241, 0.05)';
            let badge = isPico ? `<span style="background: var(--accent-eventos); color: #fff; font-size: 0.6rem; font-weight: 800; font-family: 'DM Sans', sans-serif; padding: 4px 6px; border-radius: 4px; vertical-align: middle; margin-left: 8px; letter-spacing: 1px;">NOITE DE PICO!</span>` : '';
            
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
        
        // Alteração gerada em: 10/03/2026 - 10:50
        function initSunCalc() { 
            const hoje = new Date(); 
            const dataInput = document.getElementById('dataSunCalc'); 
            if(!dataInput.value) { 
                dataInput.value = toISODate(hoje); 
            } 
            renderSunCalc(hoje); 
            autoSwitchSunTab(); // <-- AGORA SIM ELA ESTÁ SENDO EXECUTADA AQUI DENTRO!
        }

        function autoSwitchSunTab() {
            const hora = new Date().getHours();
            // Se for entre 18h e 5h, abre em Astros e Lua
            if (hora >= 18 || hora <= 5) {
                switchLuzTab('noturna');
            } else {
                switchLuzTab('diurna');
            }
        }

        function toggleFiltrosLocal() {
            const body = document.getElementById('sun-filter-body');
            const chevron = document.getElementById('sun-filter-chevron');
            body.classList.toggle('expanded');
            chevron.innerText = body.classList.contains('expanded') ? '▲' : '▼';
        }
        
            function atualizarDataSunCalc() { 
            const dataString = document.getElementById('dataSunCalc').value; 
            if(!dataString) { return; }
            const partes = dataString.split('-'); 
            const ano = partes[0]; const mes = partes[1] - 1; const dia = partes[2];
            const targetDate = new Date(ano, mes, dia, 12, 0, 0); 
            renderSunCalc(targetDate); 
        }

        async function buscarLocalidadeSunCalc() {
            const query = document.getElementById('buscaLocalSunCalc').value; 
            if (!query) { return; }
            const btn = document.getElementById('btn-buscar-local'); 
            const originalText = btn.innerText; btn.innerText = "..."; btn.disabled = true;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    locLat = parseFloat(data[0].lat); locLng = parseFloat(data[0].lon); 
                    locName = data[0].display_name.split(',')[0] + " (Busca)"; 
                    atualizarDataSunCalc(); 
                } else { alert("Localidade não encontrada."); }
            } catch(e) { alert("Erro de conexão ao buscar localidade."); 
            } finally { btn.innerText = originalText; btn.disabled = false; }
        }
        
        function getMyLocation() { 
            const btn = document.getElementById('btn-gps'); 
            const btnOriginalText = btn.innerText; btn.innerText = "Buscando satélites..."; btn.disabled = true; 
            if ("geolocation" in navigator) { 
                navigator.geolocation.getCurrentPosition(
                    function(position) { 
                        locLat = position.coords.latitude; locLng = position.coords.longitude; locName = "Meu GPS Atual";
                        const dataString = document.getElementById('dataSunCalc').value; 
                        let targetDate = new Date();
                        if (dataString) { 
                            const partes = dataString.split('-'); const ano = partes[0]; const mes = partes[1] - 1; const dia = partes[2];
                            targetDate = new Date(ano, mes, dia, 12, 0, 0); 
                        }
                        renderSunCalc(targetDate); 
                        btn.innerText = "📍 Localização Atualizada!"; btn.style.borderColor = "var(--accent-aulas)"; btn.style.color = "var(--accent-aulas)"; 
                        setTimeout(function() { btn.innerText = btnOriginalText; btn.style.borderColor = "var(--accent-sun)"; btn.style.color = "var(--accent-sun)"; btn.disabled = false; }, 3000); 
                    }, 
                    function(error) { alert("Erro ao obter GPS. Verifique as permissões de localização do seu navegador."); btn.innerText = btnOriginalText; btn.disabled = false; }, 
                    { timeout: 10000 }
                ); 
            } else { alert("Seu navegador não suporta geolocalização."); btn.innerText = btnOriginalText; btn.disabled = false; } 
        }

        // ==========================================
        // MÓDULO CALCULADORA DE ESTÚDIO (Grid Design)
        // ==========================================
        const fStopsFull = [ 'f/1.0', 'f/1.4', 'f/2.0', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0', 'f/11', 'f/16', 'f/22', 'f/32', 'f/45', 'f/64' ];
        
        const fStopsData = [ 
            { f: '1.0', t1: '1.1', t2: '1.2', next: '1.4' }, 
            { f: '1.4', t1: '1.6', t2: '1.8', next: '2.0' }, 
            { f: '2.0', t1: '2.2', t2: '2.5', next: '2.8' }, 
            { f: '2.8', t1: '3.2', t2: '3.5', next: '4.0' }, 
            { f: '4.0', t1: '4.5', t2: '5.0', next: '5.6' }, 
            { f: '5.6', t1: '6.3', t2: '7.1', next: '8.0' }, 
            { f: '8.0', t1: '9.0', t2: '10', next: '11' }, 
            { f: '11', t1: '13', t2: '14', next: '16' }, 
            { f: '16', t1: '18', t2: '20', next: '22' }, 
            { f: '22', t1: '25', t2: '29', next: '32' }, 
            { f: '32', t1: '36', t2: '40', next: '45' }, 
            { f: '45', t1: '51', t2: '57', next: '64' }, 
            { f: '64', t1: '72', t2: '81', next: '90' } 
        ];
        
        let lights = []; 
        let lightIdCounter = 0; 
        
        function getAbsoluteValue(stopIndex, tenths) { 
            return (stopIndex * 10) + tenths; 
        }
        
        function addLight(role = 'Preenchimento', baseStop = 6, tenths = 0) { 
            if (lights.length >= 6) { 
                alert("Capacidade máxima do estúdio atingida: 1 Principal + 5 Secundárias."); 
                return;
            }
            
            lights.push({ 
                id: lightIdCounter++, 
                role: role, 
                baseStop: baseStop, 
                tenths: tenths 
            }); 
            
            renderLights(); 
        }
        
        function removeLight(id) { 
            lights = lights.filter(function(l) {
                return l.id !== id;
            }); 
            renderLights(); 
        }
        
        function updateLight(id, field, value) { 
            const light = lights.find(function(l) {
                return l.id === id;
            }); 
            
            if (light) { 
                light[field] = value; 
                
                // Se definiu esta luz como Principal, rebaixa as outras para evitar duplicidade
                if (field === 'role' && value === 'Principal') { 
                    lights.forEach(function(otherLight) { 
                        if (otherLight.id !== id && otherLight.role === 'Principal') {
                            otherLight.role = 'Preenchimento'; 
                        }
                    }); 
                }
                
                renderLights(); 
            } 
        }
        
        function nudgeLight(id, tenthsToAdd) { 
            const light = lights.find(function(l) {
                return l.id === id;
            }); 
            
            if (!light) {
                return; 
            }
            
            let newAbs = getAbsoluteValue(light.baseStop, light.tenths) + tenthsToAdd; 
            
            if (newAbs < 0) newAbs = 0; 
            if (newAbs > 120) newAbs = 120; 
            
            light.baseStop = Math.floor(newAbs / 10); 
            light.tenths = newAbs % 10; 
            
            renderLights(); 
        }
        
        function getCameraAdvice(stopIndex, tenths) { 
            const stopData = fStopsData[stopIndex]; 
            let message = ""; 
            let isWarning = false; 
            
            switch(tenths) { 
                case 0: 
                case 1: 
                    message = `📸 Config. Câmera: Use <strong>f/${stopData.f}</strong> (Ponto inteiro)`; 
                    break; 
                case 2: 
                    message = `⚠️ NA TOCHA PRINCIPAL: Reduza -2/10 para <strong>f/${stopData.f}</strong> ou Aumente +1/10 para <strong>f/${stopData.t1}</strong>`; 
                    isWarning = true; 
                    break; 
                case 3: 
                case 4: 
                    message = `📸 Config. Câmera: Use <strong>f/${stopData.t1}</strong> (1º Terço)`; 
                    break; 
                case 5: 
                    message = `⚠️ NA TOCHA PRINCIPAL: Mude 1/2 ponto para <strong>f/${stopData.f}</strong> ou <strong>f/${stopData.next}</strong> para evitar décimos chatos.`; 
                    isWarning = true; 
                    break; 
                case 6: 
                case 7: 
                    message = `📸 Config. Câmera: Use <strong>f/${stopData.t2}</strong> (2º Terço)`; 
                    break; 
                case 8: 
                    message = `⚠️ NA TOCHA PRINCIPAL: Reduza -1/10 para <strong>f/${stopData.t2}</strong> ou Aumente +2/10 para <strong>f/${stopData.next}</strong>`; 
                    isWarning = true; 
                    break; 
                case 9: 
                    message = `📸 Config. Câmera: Use <strong>f/${stopData.next}</strong> (Ponto Inteiro do próximo)`; 
                    break; 
            } 
            
            return { message: message, isWarning: isWarning }; 
        }
        
        function renderLights() { 
            const container = document.getElementById('lightsContainer'); 
            if (!container) {
                return; 
            }
            
            container.innerHTML = ''; 
            
            const cenario = document.getElementById('cenarioFundo').value; 
            
            const principal = lights.find(function(l) {
                return l.role === 'Principal';
            }); 
            
            lights.forEach(function(light) { 
                const isPrincipal = light.role === 'Principal'; 
                const row = document.createElement('div'); 
                
                let rowClassName = 'card light-card';
                if (isPrincipal) {
                    rowClassName += ' principal';
                }
                row.className = rowClassName; 
                
                // Opções para a Role
                let optionsRole = `
                    <option ${light.role === 'Principal' ? 'selected' : ''}>Principal</option>
                    <option ${light.role === 'Preenchimento' ? 'selected' : ''}>Preenchimento</option>
                    <option ${light.role === 'Recorte' ? 'selected' : ''}>Recorte</option>
                    <option ${light.role === 'Cabelo' ? 'selected' : ''}>Cabelo</option>
                    <option ${light.role === 'Fundo' ? 'selected' : ''}>Fundo</option>
                    <option ${light.role === 'Retorno' ? 'selected' : ''}>Retorno</option>
                `;

                // Opções para f-stop base
                let optionsStop = '';
                fStopsData.forEach(function(data, index) {
                    let isSelected = light.baseStop === index ? 'selected' : '';
                    optionsStop += `<option value="${index}" ${isSelected}>f/${data.f}</option>`;
                });

                // Opções para os décimos
                let optionsTenths = '';
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(t) {
                    let isSelected = light.tenths === t ? 'selected' : '';
                    optionsTenths += `<option value="${t}" ${isSelected}>${t}/10</option>`;
                });

                let deleteBtn = '';
                if (!isPrincipal) {
                    deleteBtn = `<button class="btn-luz-remove" onclick="removeLight(${light.id})">✖</button>`;
                }

                row.innerHTML = `
                    <div class="light-controls-row">
                        <select onchange="updateLight(${light.id}, 'role', this.value)">
                            ${optionsRole}
                        </select>
                        <select onchange="updateLight(${light.id}, 'baseStop', parseInt(this.value))">
                            ${optionsStop}
                        </select>
                        <select onchange="updateLight(${light.id}, 'tenths', parseInt(this.value))">
                            ${optionsTenths}
                        </select>
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
                    const colorFeedback = advice.isWarning ? 'var(--accent-warning)' : 'var(--text-main)';
                    const weightFeedback = advice.isWarning ? '800' : 'normal';
                    
                    resultHTML = `
                        <div style="color:${colorFeedback}; margin-bottom:12px; font-weight:${weightFeedback}; font-size: 0.95rem;">
                            ${advice.message}
                        </div>
                        <div style="color:#4caf50; font-weight:800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">
                            ⚓ Luz de Referência (Âncora)
                        </div>
                    `;
                } else if (principal) { 
                    const pAbs = getAbsoluteValue(principal.baseStop, principal.tenths); 
                    const lAbs = getAbsoluteValue(light.baseStop, light.tenths); 
                    const diffFromMain = lAbs - pAbs; 
                    
                    let isAtTarget = false; 
                    let targetMsg = ""; 
                    let splitAdvice = ""; 
                    
                    if (light.role === 'Preenchimento') { 
                        if (diffFromMain === -20) {
                            isAtTarget = true; 
                        }
                        targetMsg = "2 stops abaixo da principal (-2.0)"; 
                    } 
                    else if (light.role === 'Recorte' || light.role === 'Cabelo') { 
                        if (diffFromMain === 20) {
                            isAtTarget = true; 
                        }
                        targetMsg = "2 stops acima da principal (+2.0)"; 
                    } 
                    else if (cenario === 'branco') { 
                        if (light.role === 'Fundo') { 
                            if (diffFromMain >= 10 && diffFromMain <= 20) {
                                isAtTarget = true; 
                            }
                            targetMsg = "1 a 2 stops acima (+1.5 ideal)"; 
                        } 
                        else if (light.role === 'Retorno') { 
                            if (diffFromMain <= 0) {
                                isAtTarget = true; 
                            }
                            targetMsg = "Potência igual ou menor que a principal"; 
                            
                            if (diffFromMain > 0) { 
                                const difCalculada = (diffFromMain / 2).toFixed(1);
                                splitAdvice = `
                                    <div style="color:var(--accent-danger); margin-top:12px; font-weight:700; background:rgba(239,68,68,0.1); padding:8px; border-radius:6px;">
                                        ⚠️ Cuidado com o Vazamento! <br>Reduza ${difCalculada}/10 em cada flash do fundo.
                                    </div>
                                `; 
                            } 
                        } 
                    } 
                    else if (cenario === 'cinza') { 
                        if (light.role === 'Fundo') { 
                            if (diffFromMain >= -40 && diffFromMain <= -20) {
                                isAtTarget = true; 
                            }
                            targetMsg = "2 a 4 stops abaixo da principal"; 
                        } 
                    } 
                    
                    if (isAtTarget) { 
                        resultHTML = `
                            <div class="light-success-box">
                                <div class="light-success-title">✅ Intenção Atingida</div>
                                <span style="color:var(--text-main); font-weight:600;">${targetMsg}</span>
                            </div>
                        `;
                    } else { 
                        if (diffFromMain === 0 && targetMsg !== "") { 
                            resultHTML = `
                                <div style="color:var(--cat-convocatoria); font-weight:700; margin-bottom:8px; padding:8px; background:rgba(59,130,246,0.1); border-radius:6px;">
                                    ✅ Tocha Nivelada. <br>Passo 2: Agora aplique [ ${targetMsg} ]
                                </div>
                            `; 
                        } else { 
                            const diffToEqualize = pAbs - lAbs; 
                            const direction = diffToEqualize > 0 ? "Aumente" : "Reduza"; 
                            const mathHalf = Math.floor(Math.abs(diffToEqualize) / 5);
                            const mathTenth = Math.abs(diffToEqualize) % 5;
                            
                            resultHTML = `
                                <div style="margin-bottom:8px; color:var(--text-main); line-height: 1.5;">
                                    ⚙️ <strong>Passo 1 (Nivelar Tocha):</strong><br>
                                    ${direction} <strong>${mathHalf} clicks de (½)</strong> e <strong>${mathTenth} clicks de (⅒)</strong> para igualar com a Principal.
                                </div>
                            `; 
                                          
                            if (targetMsg) {
                                resultHTML += `
                                    <div style="color:var(--text-muted); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                                        🎯 Regra do Estúdio: ${targetMsg}
                                    </div>
                                `; 
                            }
                        } 
                        
                        if (splitAdvice) {
                            resultHTML += splitAdvice; 
                        }
                    } 
                } 
                
                resDiv.innerHTML = resultHTML; 
            }); 
        }

        // Alteração gerada em: 09/03/2026 - 23:45
        // ==========================================
        // MOTOR DE INTERFACE E NOTIFICAÇÕES
        // ==========================================
        function toggleMenu() {
            document.getElementById('side-menu').classList.toggle('active');
            document.getElementById('sheet-backdrop').classList.toggle('active');
        }

        function toggleFiltros() {
            const body = document.getElementById('filter-body');
            const chevron = document.getElementById('filter-chevron');
            body.classList.toggle('expanded');
            chevron.innerText = body.classList.contains('expanded') ? '▲' : '▼';
        }

        async function solicitarPermissaoNotificacao() {
            if (!("Notification" in window)) {
                alert("Este navegador não suporta notificações.");
                return;
            }

            const permissao = await Notification.requestPermission();
            if (permissao === "granted") {
                new Notification("C.L.A.R.A. Ativada!", {
                    body: "Permissão concedida. Você receberá alertas sobre luz e eventos.",
                    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff7b00'%3E%3Cpath d='M12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z'/%3E%3C/svg%3E"
                });
            } else {
                alert("Para receber alertas, você precisa autorizar as notificações nas configurações do seu celular ou navegador.");
            }
        }

        // ==========================================
        // CONTADOR DE VISITAS INVISÍVEL (API)
        // ==========================================
        async function atualizarContador() {
            try {
                const namespace = "clara_project_hb_2026"; 
                const key = "main_hits";
                const response = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
                const data = await response.json();
                
                const counterElement = document.getElementById('visitor-counter'); 
                if (counterElement) {
                    counterElement.innerText = `ID: ${data.value}`;
                }
            } catch (error) {
                // Falha silenciosa ignorada no console para não sujar o debug
            }
        }

        // Alteração gerada em: 10/03/2026 - 11:15
        // ==========================================
        // MOTOR PWA (INSTALAÇÃO DO APP)
        // ==========================================
        let deferredPrompt;
        
        // Ouve o sinal nativo de "PWA pronto para instalar" do navegador
        window.addEventListener('beforeinstallprompt', (e) => {
            // Impede o aviso padrão (chatito) do Chrome de aparecer sozinho
            e.preventDefault();
            // Guarda o evento para dispararmos apenas quando o usuário clicar no botão
            deferredPrompt = e;
            
            // Garante que o botão fique visível se o app ainda não estiver instalado
            const installBtn = document.getElementById('btn-install-pwa');
            const installedMsg = document.getElementById('pwa-installed-msg');
            if(installBtn) installBtn.style.display = 'inline-flex';
            if(installedMsg) installedMsg.classList.add('hidden');
        });

        // Conecta o clique do botão ao instalador nativo
        document.addEventListener('DOMContentLoaded', () => {
            const installBtn = document.getElementById('btn-install-pwa');
            if (installBtn) {
                installBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        // Dispara a janela de instalação do Android/iOS
                        deferredPrompt.prompt();
                        // Aguarda o usuário clicar em "Instalar" ou "Cancelar"
                        const { outcome } = await deferredPrompt.userChoice;
                        // Anula o prompt para não ser usado duas vezes
                        deferredPrompt = null;
                    } else {
                        // Failsafe para iOS ou navegadores que não suportam o botão nativo
                        alert("Para instalar no iOS: toque no botão de 'Compartilhar' (quadrado com seta para cima) e depois em 'Adicionar à Tela de Início'.");
                    }
                });
            }
        });

        // Ouve quando a instalação é concluída com sucesso
        window.addEventListener('appinstalled', () => {
            const installBtn = document.getElementById('btn-install-pwa');
            const installedMsg = document.getElementById('pwa-installed-msg');
            
            // Esconde o botão e mostra o check verde no menu
            if(installBtn) installBtn.style.display = 'none';
            if(installedMsg) installedMsg.classList.remove('hidden');
            
            deferredPrompt = null;
        });

        // ==========================================
        // SISTEMA DE PROTEÇÃO (ANTI-INSPECT / ANTI-COPY)
        // ==========================================
        
        // 1. Bloqueia o clique do Botão Direito
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // 2. Bloqueia atalhos de teclado (F12, Ctrl+U, Ctrl+Shift+I, etc)
        document.addEventListener('keydown', function(e) {
            // F12 (Inspecionar)
            if (e.key === 'F12') {
                e.preventDefault();
            }
            // Ctrl + Shift + I / J / C (Ferramentas de Desenvolvedor)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
            }
            // Ctrl + U (Ver Código-Fonte)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
            }
            // Ctrl + S (Salvar Página)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
                e.preventDefault();
            }
        });
   
        // ==========================================
        // REGISTRO DO SERVICE WORKER (PWA)
        // ==========================================
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js');
        }
