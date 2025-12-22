// ### VARIABLES ###

// Array de palabras
var palabras = [
  ["Filosofia", "Carrera"],
  ["Victoria", "Que mujer"],
  ["Death Note", "Anime"],
  ["Starbucks", "Café"],
  ["Fideos", "Comida"],
  ["Red Bull", "Equipo"],
  ["Kindle", "Sobrevalorado"],
  ["Sagaz", "Astuto"],
  ["Rockwell", "Marca de mi casco"],
  ["Algoritmos dos","Materia dificil"],
  ["Beyblade","Juguete"],
  ["Fader", "Calle sin salida"],
  ["Midnight Memories", "Música"],
];
// Palabra a averiguar
var palabra = "";
// Nº aleatorio
var rand;
// Palabra oculta
var oculta = [];
// Elemento html de la palabra
var hueco = document.getElementById("palabra");
// Contador de intentos
var cont = 6;
// Botones de letras
var buttons = document.getElementsByClassName('letra');
// Boton de reset
var btnInicio = document.getElementById("reset");

// Nuevo: configuración y contador de victorias
const VICTORIAS_OBJETIVO = 5;
const MENSAJE_TRES_VICTORIAS = "¡Felicidades! Adivinaste 3 palabras. La letra es: M";
let victorias = Number(localStorage.getItem('victorias') || 0);
// UI de progreso
const progresoEl = document.getElementById('progreso');
function updateProgreso() {
  if (progresoEl) progresoEl.textContent = `${victorias}/${VICTORIAS_OBJETIVO}`;
}
updateProgreso();

// Nuevo: configuración y cartel de victoria + redirección al lobby
const GAME_ID = 'ahorcado';
const LOBBY_PATH = '../html/lobby.html';
const REDIRECT_DELAY = 10;

function notifyWinAndRedirect(gameId, lobbyPath, seconds = 10) {
  try { localStorage.setItem(`win_${gameId}`, '1'); } catch (_) {}
  const target = `${lobbyPath}?win=${encodeURIComponent(gameId)}`;

  if (!document.getElementById('win-overlay-style')) {
    const style = document.createElement('style');
    style.id = 'win-overlay-style';
    style.textContent = `
      .win-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:99999}
      .win-box{background:#111;color:#fff;max-width:560px;width:90%;padding:24px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);text-align:center;font-family:system-ui,Segoe UI,Roboto,Arial}
      .win-box h2{margin:0 0 8px;font-size:1.8rem}
      .win-box p{margin:6px 0}
      .win-actions{margin-top:14px;display:flex;gap:8px;justify-content:center}
      .win-btn{padding:.6rem 1rem;border-radius:8px;border:0;cursor:pointer;font-weight:700}
      .win-btn.primary{background:#22c55e;color:#111}
      .win-count{font-weight:800}
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.className = 'win-overlay';
  overlay.innerHTML = `
    <div class="win-box" role="dialog" aria-modal="true" aria-label="Has ganado">
      <h2>¡Felicitaciones!</h2>
      <p>Has completado el desafío del ahorcado.</p>
      <p>Volviendo al lobby en <span class="win-count" id="win-count">${seconds}</span> segundos…</p>
      <div class="win-actions">
        <button class="win-btn primary" id="win-go-now">Ir ahora</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function stopKeys(e){ e.stopImmediatePropagation(); }
  window.addEventListener('keydown', stopKeys, true);
  window.addEventListener('keyup', stopKeys, true);

  const countEl = overlay.querySelector('#win-count');
  const goNow = overlay.querySelector('#win-go-now');
  function go(){ window.location.href = target; }
  let left = seconds;
  const t = setInterval(() => {
    left -= 1;
    if (left <= 0) { clearInterval(t); go(); }
    else { countEl.textContent = String(left); }
  }, 1000);
  goNow.addEventListener('click', () => { clearInterval(t); go(); });
}

// ### FUNCIONES ###

// Escoger palabra al azar
function generaPalabra() {
  rand = Math.floor(Math.random() * palabras.length);
  palabra = palabras[rand][0].toUpperCase();
  console.log(palabra);
}

// Funcion para pintar los guiones de la palabra (mantiene espacios visibles)
function pintarGuiones(num) {
  oculta = [];
  for (var i = 0; i < num; i++) {
    oculta[i] = (palabra[i] === ' ') ? ' ' : '_';
  }
  hueco.innerHTML = oculta.join("");
}

//Generar abecedario
function generaABC (a,z) {
  document.getElementById("abcdario").innerHTML = "";
  var i = a.charCodeAt(0), j = z.charCodeAt(0);
  var letra = "";
  for( ; i<=j; i++) {
    letra = String.fromCharCode(i).toUpperCase();
    document.getElementById("abcdario").innerHTML += "<button value='" + letra + "' onclick='intento(\"" + letra + "\")' class='letra' id='"+letra+"'>" + letra + "</button>";
    if(i==110) {
      document.getElementById("abcdario").innerHTML += "<button value='Ñ' onclick='intento(\"Ñ\")' class='letra' id='"+letra+"'>Ñ</button>";
    }
  }
}

// Chequear intento
function intento(letra) {
  document.getElementById(letra).disabled = true;
  if(palabra.indexOf(letra) != -1) {
    for(var i=0; i<palabra.length; i++) {
      if(palabra[i]==letra) oculta[i] = letra;
    }
    hueco.innerHTML = oculta.join("");
    document.getElementById("acierto").innerHTML = "Bien!";
    document.getElementById("acierto").className += "acierto verde";
  }else{
    cont--;
    document.getElementById("intentos").innerHTML = cont;
    document.getElementById("acierto").innerHTML = "Fallo!";
    document.getElementById("acierto").className += "acierto rojo";
    document.getElementById("image"+cont).className += "fade-in";
  }
  compruebaFin();
  setTimeout(function () { 
    document.getElementById("acierto").className = ""; 
  }, 800);
}

// Obtener pista
function pista() {
  document.getElementById("hueco-pista").innerHTML = palabras[rand][1];
}

// Comprueba si ha finalizado (ganó/perdió la palabra)
function compruebaFin() {
  if (oculta.indexOf("_") == -1) {
    victorias++;
    localStorage.setItem('victorias', victorias);
    updateProgreso();

    if (victorias >= VICTORIAS_OBJETIVO) {
      victorias = 0;
      localStorage.setItem('victorias', 0);
      updateProgreso();
      notifyWinAndRedirect(GAME_ID, LOBBY_PATH, REDIRECT_DELAY);
      return;
    }

    document.getElementById("msg-final").innerHTML = "¡Bien! Siguiente palabra…";
    document.getElementById("msg-final").className = "zoom-in";

    setTimeout(() => {
      document.getElementById("msg-final").className = "";
      document.getElementById("msg-final").innerHTML = "";
      document.getElementById("acierto").innerHTML = "";
      const pistaEl = document.getElementById("hueco-pista");
      if (pistaEl) pistaEl.innerHTML = "";
      for (let i = 0; i <= 5; i++) {
        const el = document.getElementById("image" + i);
        if (el) el.className = el.className.replace("fade-in", "");
      }
      inicio();
    }, 800);

  } else if (cont == 0) {
    // Derrota: reiniciar progreso
    victorias = 0;
    localStorage.setItem('victorias', 0);
    updateProgreso();

    document.getElementById("msg-final").innerHTML = "Game Over";
    document.getElementById("msg-final").className += "zoom-in";
    for (var i = 0; i < buttons.length; i++) { buttons[i].disabled = true; }
    document.getElementById("reset").innerHTML = "Empezar";
    btnInicio.onclick = function () { location.reload() };
  }
}

// Restablecer juego
function inicio() {
  generaPalabra();
  pintarGuiones(palabra.length);
  generaABC("a","z");
  cont = 6;
  document.getElementById("intentos").innerHTML = cont;
  // limpiar pista al iniciar nueva palabra
  const pistaEl = document.getElementById("hueco-pista");
  if (pistaEl) pistaEl.innerHTML = "";
}

// Iniciar
window.onload = inicio();

//Funcion actualizar lobby
// Llamar cuando el jugador gane
function marcarVictoriaYVolver(gameId, lobbyPath) {
  try {
    // Marca la victoria para persistencia inmediata
    localStorage.setItem(`win_${gameId}`, '1');
  } catch (_) {}
  // Notifica al lobby y regresa
  window.location.href = `${lobbyPath}?win=${encodeURIComponent(gameId)}`;
}

/* Ejemplo de uso (dentro del evento/función de victoria):
marcarVictoriaYVolver('dice', 'lobby.html');
*/