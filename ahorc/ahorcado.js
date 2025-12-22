// ### VARIABLES ###

// Array de palabras
var palabras = [
  ["Computacion", "Carrera"],
  ["Victoria", "Que mujer"],
  ["Death Note", "Anime"],
  ["Starbucks", "Café"],
  ["Fideos", "Comida"],
  ["Red Bull", "Bebida"],
  ["Kindle", "Sobrevalorado"],
  ["Sagaz", "Astuto"]
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
const VICTORIAS_OBJETIVO = 3;
const MENSAJE_TRES_VICTORIAS = "¡Felicidades! Adivinaste 3 palabras. La letra es: M";
let victorias = Number(localStorage.getItem('victorias') || 0);


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

// Compruba si ha finalizado
function compruebaFin() {
  if (oculta.indexOf("_") == -1) {
    // palabra acertada
    victorias++;
    localStorage.setItem('victorias', victorias);

    if (victorias >= VICTORIAS_OBJETIVO) {
      alert(MENSAJE_TRES_VICTORIAS);

      victorias = 0;
      localStorage.setItem('victorias', 0);
      marcarVictoriaYVolver('ahorcado', 'lobby.html');
    }

    document.getElementById("msg-final").innerHTML = "¡Bien! Siguiente palabra…";
    document.getElementById("msg-final").className = "zoom-in";

    setTimeout(() => {
      document.getElementById("msg-final").className = "";
      document.getElementById("msg-final").innerHTML = "";
      document.getElementById("acierto").innerHTML = "";
      // limpiar pista anterior
      const pistaEl = document.getElementById("hueco-pista");
      if (pistaEl) pistaEl.innerHTML = "";

      for (let i = 0; i <= 5; i++) {
        const el = document.getElementById("image" + i);
        if (el) el.className = el.className.replace("fade-in", "");
      }

      inicio(); // inicia la siguiente palabra automáticamente
    }, 800);

  } else if (cont == 0) {
    document.getElementById("msg-final").innerHTML = "Game Over";
    document.getElementById("msg-final").className += "zoom-in";
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
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