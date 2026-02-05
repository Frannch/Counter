const fonemas = [
{ nombre: "1", frente: "Hoja1/tarjeta_tarjeta_0001_0_0.png", reverso: "pokemons/back.jpg" },
{ nombre: "2", frente: "Hoja1/tarjeta_tarjeta_0001_0_1.png", reverso: "pokemons/back.jpg" },
{ nombre: "3", frente: "Hoja1/tarjeta_tarjeta_0001_0_2.png", reverso: "pokemons/back.jpg" },
{ nombre: "4", frente: "Hoja1/tarjeta_tarjeta_0001_0_3.png", reverso: "pokemons/back.jpg" },
{ nombre: "5", frente: "Hoja1/tarjeta_tarjeta_0001_0_4.png", reverso: "pokemons/back.jpg" },
{ nombre: "6", frente: "Hoja1/tarjeta_tarjeta_0001_0_5.png", reverso: "pokemons/back.jpg" },
{ nombre: "7", frente: "Hoja1/tarjeta_tarjeta_0001_0_6.png", reverso: "pokemons/back.jpg" },
{ nombre: "8", frente: "Hoja1/tarjeta_tarjeta_0001_0_7.png", reverso: "pokemons/back.jpg" },
{ nombre: "9", frente: "Hoja1/tarjeta_tarjeta_0001_0_8.png", reverso: "pokemons/back.jpg" },
{ nombre: "10", frente: "Hoja1/tarjeta_tarjeta_0001_0_9.png", reverso: "Hoja1/tarjeta_0002_11.png" },
{ nombre: "11", frente: "Hoja1/tarjeta_tarjeta_0001_0_10.png", reverso: "Hoja1/tarjeta_0002_10.png" },
{ nombre: "12", frente: "Hoja1/tarjeta_tarjeta_0001_0_11.png", reverso: "Hoja1/tarjeta_0002_9.png" },
  
//Hoja 2
{ nombre: "13", frente: "Hoja1/tarjeta_tarjeta_0003_0_0.png", reverso: "Hoja1/tarjeta_0004_2.png" },
{ nombre: "14", frente: "Hoja1/tarjeta_tarjeta_0003_0_1.png", reverso: "Hoja1/tarjeta_0004_1.png" },
{ nombre: "15", frente: "Hoja1/tarjeta_tarjeta_0003_0_2.png", reverso: "Hoja1/tarjeta_0004_0.png" },
{ nombre: "16", frente: "Hoja1/tarjeta_tarjeta_0003_0_3.png", reverso: "Hoja1/tarjeta_0004_5.png" },
{ nombre: "17", frente: "Hoja1/tarjeta_tarjeta_0003_0_4.png", reverso: "Hoja1/tarjeta_0004_4.png" },
{ nombre: "18", frente: "Hoja1/tarjeta_tarjeta_0003_0_5.png", reverso: "Hoja1/tarjeta_0004_3.png" },
{ nombre: "19", frente: "Hoja1/tarjeta_tarjeta_0003_0_6.png", reverso: "Hoja1/tarjeta_0004_8.png" },
{ nombre: "20", frente: "Hoja1/tarjeta_tarjeta_0003_0_7.png", reverso: "Hoja1/tarjeta_0004_7.png" },
{ nombre: "21", frente: "Hoja1/tarjeta_tarjeta_0003_0_8.png", reverso: "Hoja1/tarjeta_0004_6.png" },
{ nombre: "22", frente: "Hoja1/tarjeta_tarjeta_0003_0_9.png", reverso: "Hoja1/tarjeta_0004_11.png" }
];

const container = document.getElementById('cards-container');
const search = document.getElementById('search');
const pagination = document.getElementById('pagination');

const porPagina = 12;
let paginaActual = 1;

function crearTarjeta(fonema) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <img src="${fonema.frente}" alt="${fonema.nombre} frente" />
        <div class="card-btn-container">
          <button>Ver reverso</button>
        </div>
      </div>
      <div class="card-back">
        <img src="${fonema.reverso}" alt="${fonema.nombre} reverso" />
        <div class="card-btn-container">
          <button>Ver frente</button>
        </div>
      </div>
    </div>
  `;
  const btns = card.querySelectorAll('button');
  btns[0].addEventListener('click', () => card.classList.add('flipped'));
  btns[1].addEventListener('click', () => card.classList.remove('flipped'));
  return card;
}

function mostrarFonemas(filtro = '', pagina = 1) {
  const filtrados = fonemas.filter(f => f.nombre.toLowerCase().includes(filtro.toLowerCase()));
  const totalPaginas = Math.ceil(filtrados.length / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;

  container.innerHTML = '';
  filtrados.slice(inicio, fin).forEach(fonema => {
    container.appendChild(crearTarjeta(fonema));
  });

  // Paginación
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === pagina;
    btn.addEventListener('click', () => {
      paginaActual = i;
      mostrarFonemas(search.value, i);
    });
    pagination.appendChild(btn);
  }
}

search.addEventListener('input', e => {
  paginaActual = 1;
  mostrarFonemas(e.target.value, paginaActual);
});

mostrarFonemas();
