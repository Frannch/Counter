const fonemas = [
{ nombre: "1", frente: "pokemons/1.png", reverso: "pokemons/back.jpg" },
{ nombre: "2", frente: "pokemons/2.png", reverso: "pokemons/back.jpg" },
{ nombre: "3", frente: "pokemons/2,5.png", reverso: "pokemons/back.jpg" },
{ nombre: "4", frente: "pokemons/3.png", reverso: "pokemons/back.jpg" },
{ nombre: "5", frente: "pokemons/3,5.png", reverso: "pokemons/back.jpg" },
{ nombre: "6", frente: "pokemons/4.png", reverso: "pokemons/back.jpg" },
{ nombre: "7", frente: "pokemons/5.png", reverso: "pokemons/back.jpg" },
{ nombre: "8", frente: "pokemons/6.png", reverso: "pokemons/back.jpg" },
{ nombre: "9", frente: "pokemons/7.png", reverso: "pokemons/back.jpg" },
{ nombre: "10", frente: "pokemons/8.png", reverso: "pokemons/back.jpg" },
{ nombre: "11", frente: "pokemons/9.png", reverso: "pokemons/back.jpg" },
{ nombre: "12", frente: "pokemons/10.png", reverso: "pokemons/back.jpg" },
  
//Hoja 2
{ nombre: "13", frente: "pokemons/11.png", reverso: "pokemons/back.jpg" },
{ nombre: "14", frente: "pokemons/12.png", reverso: "pokemons/back.jpg" },
{ nombre: "15", frente: "pokemons/13.png", reverso: "pokemons/back.jpg" },
{ nombre: "16", frente: "pokemons/14.png", reverso: "pokemons/back.jpg" },
{ nombre: "17", frente: "pokemons/15.png", reverso: "pokemons/back.jpg" },
{ nombre: "18", frente: "pokemons/16.png", reverso: "pokemons/back.jpg" },
{ nombre: "19", frente: "pokemons/fran.png", reverso: "pokemons/back.jpg" },
{ nombre: "20", frente: "pokemons/Ro.png", reverso: "pokemons/back.jpg" }
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

document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});
