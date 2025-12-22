/* Lobby de Desafíos - Lógica de temporizadores, progreso y código secreto */
(function () {
  const stateKey = 'lobbyStart';
  const winKey = (id) => `win_${id}`;
  const grid = () => document.getElementById('games-grid');
  const secretEl = () => document.getElementById('secret-code');
  const progressEl = () => document.getElementById('progress');

  // Mostrar botón de testing solo cuando la URL tenga ?test=1
  const SHOW_TEST_BUTTON = new URLSearchParams(location.search).get('test') === '1';

  // Configuración de redirección al completar todas las letras
  const COMPLETE_REDIRECT = {
    url: 'final.html', // Cambia esto al destino deseado (relativo a html/lobby.html)
    delay: 10          // Segundos de cuenta regresiva
  };
  const ALL_COMPLETE_FLAG = 'lobbyAllCompleteShown';

  // CONFIGURACIÓN DE JUEGOS
  // IMPORTANTE: Usa el formato ISO 'YYYY-MM-DDTHH:mm:ss' para evitar errores entre navegadores.
  // Ejemplo: '2025-12-24T20:00:00' (Año-Mes-Dia T Hora:Minutos:Segundos)
  const games = [
    
    
    { 
      id: 'rompe', 
      name: 'Rompecabezas', 
      url: '../puzzle/Rompecabezas-master/index.html', 
      unlockAt: '2026-01-04T10:00:00', 
      letter: 'M', 
      hint: 'Fácil' 
    },
    { 
      id: 'ahorcado',
      name: 'Ahorcado', 
      url: '../ahorc/Ahorcado.html', 
      unlockAt: '2026-01-05T10:00:00', 
      letter: 'L', 
      hint: 'Adivina la palabra.' 
    },
    { 
      id: 'lizard', 
      name: 'Laberinto', 
      url: '../Laberinto/lab.html', 
      unlockAt: '2026-01-07T10:00:00', 
      letter: '6', 
      hint: 'Encuentra la salida.' 
    },
    { 
      id: 'rubik', 
      name: 'Rubik', 
      url: '../Rubik/src/Index.html', 
      unlockAt: '2026-01-03T10:00:00', 
      letter: 'V', 
      hint: 'Ármalo, si podés.' 
    },
    { 
      id: 'dice', 
      name: 'Space Invaders', 
      url: 'Dice.html', 
      unlockAt: '2026-01-03T10:00:00', // EJEMPLO: Cambia esto a tu fecha real
      letter: 'C', 
      hint: 'Aura' 
    },
    { 
      id: 'cartas', 
      name: 'Cartas', 
      url: 'cartas.html', 
      unlockAt: '2026-01-05T10:00:00', 
      letter: '1', 
      hint: 'Memoria y suerte.' 
    },
  ];

  const codeOrder = games.map((g) => ({ id: g.id, letter: g.letter }));

  function getStartTime() {
    const saved = localStorage.getItem(stateKey);
    if (saved) return parseInt(saved, 10);
    const now = Date.now();
    localStorage.setItem(stateKey, String(now));
    return now;
  }

  // Parser robusto de fechas
  function parseDateTime(input) {
    if (!input && input !== 0) return NaN;
    if (typeof input === 'number') return input; // Si ya es timestamp
    if (input instanceof Date) return input.getTime();
    
    // Intenta parsear string ISO o local
    const ts = Date.parse(input);
    if (!Number.isNaN(ts)) return ts;
    
    return NaN;
  }

  // Obtiene el momento de desbloqueo en ms
  function getUnlockAtMs(game) {
    if (game.unlockAt) {
      const ts = parseDateTime(game.unlockAt);
      if (!Number.isNaN(ts)) return ts;
      console.warn(`Fecha inválida para ${game.id}:`, game.unlockAt);
    }
    // Fallback por si no pones fecha: se desbloquea al instante
    return 0; 
  }

  function isUnlocked(game, now) {
    return now >= getUnlockAtMs(game);
  }

  function timeLeft(game, now) {
    const unlockAt = getUnlockAtMs(game);
    // Si la fecha es 0 o inválida, asumimos desbloqueado, tiempo restante 0
    if (unlockAt === 0) return 0;
    return Math.max(0, unlockAt - now);
  }

  // Formatea DD:HH:MM:SS o HH:MM:SS
  function formatDuration(ms) {
    const total = Math.ceil(ms / 1000);
    const d = Math.floor(total / 86400); // Días
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const p = (n) => String(n).padStart(2, '0');
    
    if (d > 0) return `${d}d ${p(h)}:${p(m)}:${p(s)}`;
    if (h > 0) return `${p(h)}:${p(m)}:${p(s)}`;
    return `${p(m)}:${p(s)}`;
  }

  function readWins() {
    const wins = new Set();
    games.forEach((g) => {
      if (localStorage.getItem(winKey(g.id)) === '1') wins.add(g.id);
    });
    return wins;
  }

  function setWin(id) {
    localStorage.setItem(winKey(id), '1');
  }

  function clearProgress() {
    localStorage.removeItem(stateKey);
    games.forEach((g) => localStorage.removeItem(winKey(g.id)));
    localStorage.removeItem(ALL_COMPLETE_FLAG); // limpiar la marca de “ya mostrado”
  }

  function renderGrid() {
    const container = grid();
    container.innerHTML = '';
    const now = Date.now();
    const wins = readWins();

    games.forEach((g) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.gameId = g.id;

      const unlockAt = getUnlockAtMs(g);
      const unlocked = isUnlocked(g, now);
      const won = wins.has(g.id);

      card.innerHTML = `
        <div class="card-top">
          <h3 class="title">${g.name}</h3>
          <span class="badge ${won ? 'won' : unlocked ? 'unlocked' : 'locked'}">
            ${won ? 'Completado' : unlocked ? 'Desbloqueado' : 'Bloqueado'}
          </span>
        </div>
        <p class="hint">${g.hint}</p>
        
        <div class="timer ${unlocked ? 'hide' : ''}">
          <span>Disponible en:</span>
          <strong class="countdown" data-countdown-for="${g.id}">${formatDuration(timeLeft(g, now))}</strong>
        </div>

        <div class="actions">
          <a class="btn primary ${unlocked ? '' : 'disabled'}" 
             href="${unlocked ? g.url : '#'}" 
             ${unlocked ? '' : 'aria-disabled="true"'}>
             ${won ? 'Volver a jugar' : 'Jugar'}
          </a>
          ${SHOW_TEST_BUTTON ? `<button type="button" class="btn test-btn" data-test-win="${g.id}" title="Solo para pruebas">Test: Ganar</button>` : ''}
        </div>
        
        <div class="letter">
          <span>Letra: </span><strong>${won ? g.letter : '—'}</strong>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function updateSecret() {
    const wins = readWins();
    const letters = codeOrder.map((c) => (wins.has(c.id) ? c.letter : '•'));
    const revealed = letters.filter((x) => x !== '•').length;
    secretEl().textContent = letters.join(' ');
    progressEl().textContent = `Progreso: ${revealed}/${codeOrder.length}`;
  }

// --- NUEVO: detección y overlay de finalización ---
  function hasAllCompleted() {
    return codeOrder.every((c) => localStorage.getItem(winKey(c.id)) === '1');
  }

  function injectCompletionStyles() {
    if (document.getElementById('completion-overlay-style')) return;
    const css = `
      .completion-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);z-index:99999}
      .completion-box{background:#111;color:#fff;max-width:560px;width:90%;padding:24px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);text-align:center;font-family:system-ui,Segoe UI,Roboto,Arial}
      .completion-box h2{margin:0 0 8px;font-size:1.8rem}
      .completion-box p{margin:6px 0}
      .completion-actions{margin-top:14px;display:flex;gap:8px;justify-content:center}
      .completion-btn{padding:.6rem 1rem;border-radius:8px;border:0;cursor:pointer;font-weight:700}
      .completion-btn.primary{background:#22c55e;color:#111}
      .completion-count{font-weight:800}
    `;
    const style = document.createElement('style');
    style.id = 'completion-overlay-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showCompletionOverlay(seconds, targetUrl) {
    injectCompletionStyles();
    const overlay = document.createElement('div');
    overlay.className = 'completion-overlay';
    overlay.innerHTML = `
      <div class="completion-box" role="dialog" aria-modal="true" aria-label="Desafíos completados">
        <h2>¡Felicitaciones!</h2>
        <p>Has completado todos los desafíos y revelado el código secreto.</p>
        <p>Redirigiendo en <span class="completion-count" id="completion-count">${seconds}</span> segundos…</p>
        <div class="completion-actions">
          <button class="completion-btn primary" id="completion-go-now">Ir ahora</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const countEl = overlay.querySelector('#completion-count');
    const goNow = overlay.querySelector('#completion-go-now');

    function go() { window.location.href = targetUrl; }
    let left = seconds;
    const timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        go();
      } else {
        countEl.textContent = String(left);
      }
    }, 1000);

    goNow.addEventListener('click', () => {
      clearInterval(timer);
      go();
    });
  }

  function checkAllCompleted() {
    if (!hasAllCompleted()) return;
    if (localStorage.getItem(ALL_COMPLETE_FLAG) === '1') return;
    localStorage.setItem(ALL_COMPLETE_FLAG, '1');
    showCompletionOverlay(COMPLETE_REDIRECT.delay, COMPLETE_REDIRECT.url);
  }
// --- FIN NUEVO ---

  // Oculta el botón de reinicio cuando no es modo test
  function setupResetVisibility() {
    const reset = document.getElementById('reset-progress');
    if (!reset) return;
    if (!SHOW_TEST_BUTTON) {
      reset.remove(); // lo quita del DOM si no está en modo test
    }
  }

  function attachHandlers() {
    // Listener del botón de testing (solo si ?test=1)
    if (SHOW_TEST_BUTTON) {
      grid().addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-test-win]');
        if (!btn) return;
        const id = btn.getAttribute('data-test-win');
        setWin(id);
        renderGrid();
        updateSecret();
        checkAllCompleted(); // <- verificar si se completó todo en modo test
      });
    }

    const reset = document.getElementById('reset-progress');
    if (SHOW_TEST_BUTTON && reset) {
      reset.addEventListener('click', () => {
        clearProgress();
        renderGrid();
        updateSecret();
      });
    }
  }

  function tick() {
    const now = Date.now();
    // Actualizamos contadores
    document.querySelectorAll('[data-countdown-for]').forEach((el) => {
      const id = el.getAttribute('data-countdown-for');
      const g = games.find((x) => x.id === id);
      if (!g) return;
      
      const left = timeLeft(g, now);
      
      // Si el tiempo llega a 0 y la carta sigue bloqueada visualmente, forzamos re-render
      if (left <= 0 && el.closest('.timer') && !el.closest('.timer').classList.contains('hide')) {
         // Pequeño hack para forzar el desbloqueo visual exacto al llegar a 0
         renderGrid();
         updateSecret();
         return;
      }
      
      el.textContent = formatDuration(left);
    });

    // Verificación de desbloqueo general
    let needsRender = false;
    games.forEach((g) => {
      const card = document.querySelector(`.card[data-game-id="${g.id}"]`);
      if (!card) return;
      const wasLocked = card.querySelector('.badge').classList.contains('locked');
      const unlockedNow = isUnlocked(g, now);
      if (wasLocked && unlockedNow) needsRender = true;
    });
    
    if (needsRender) {
      renderGrid();
      updateSecret();
    }
  }

  function handleWinFromURL() {
    const params = new URLSearchParams(location.search);
    const win = params.get('win');
    if (!win) return;
    const g = games.find((x) => x.id === win);
    if (!g) return;
    setWin(g.id);
    // Limpiar parámetro de la URL sin recargar
    params.delete('win');
    const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}${location.hash}`;
    history.replaceState({}, '', newUrl);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Inicializar
    getStartTime();
    handleWinFromURL();
    renderGrid();
    updateSecret();
    setupResetVisibility();
    attachHandlers();
    // Mostrar overlay si ya quedó todo completo en esta carga (ej. último win vino por URL)
    checkAllCompleted();
    // Ticker cada segundo
    setInterval(tick, 1000);
  });
})();