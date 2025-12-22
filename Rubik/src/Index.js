const colors = ['blue', 'green', 'white', 'yellow', 'orange', 'red'];
const pieces = document.getElementsByClassName('piece');
const SOLVED_LETTER = 'Felicidades :), la primer letra es: M'; // cambia aquí la letra que quieres mostrar

// === Victoria → lobby ===
const GAME_ID = 'rubik';
const LOBBY_PATH = '../../html/lobby.html';
const REDIRECT_DELAY = 10;

// Desactivar/activar mezcla inicial del cubo
const ENABLE_SCRAMBLE = false;

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
        <p>Has resuelto el cubo.</p>
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
// === fin victoria → lobby ===

/**
 * Returns j-th adjacent face of i-th face  
 * @param {*} i 
 * @param {*} j 
 * @returns 
 */
function mx(i, j) {
    return ([2, 4, 3, 5][j % 4 | 0] + i % 2 * ((j | 0) % 4 * 2 + 3) + 2 * (i / 2 | 0)) % 6;
}

function getAxis(face) {
    return String.fromCharCode('X'.charCodeAt(0) + face / 2);
}

/**
 * Moves each of 26 pieces to their places, assigns IDs and attaches stickers
 */
function assembleCube() {

    function moveTo(face) {
        id = id + (1 << face);

        const newDiv = createDiv();
        const attribute = `sticker ${colors[face]}`;

        pieces[i].children[face]
            .appendChild(newDiv)
            .setAttribute('class', attribute);

        const axis = getAxis(face);
        const value = face % 2 * 4 - 2;

        return `translate${axis}(${value}em)`;
    }

    for (var id, x, i = 0; id = 0, i < 26; i++) {
        x = mx(i, i % 18);

        const transform = `rotateX(0deg)${moveTo(i % 6)}${i > 5 ? moveTo(x) + (i > 17 ? moveTo(mx(x, x + 2)) : '') : ''}`
        pieces[i].style.transform = transform;

        const pieceId = `piece${id}`;
        pieces[i].setAttribute('id', pieceId);
    }
}

function createDiv() {
    return document.createElement('div');
}

function getPieceBy(face, index, corner) {
    const pieceId = `piece${(1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner}`;
    return document.getElementById(pieceId);
}

/**
 * Swaps stickers of the face (by clockwise) stated times, thereby rotates the face
 * @param {*} face 
 * @param {*} times 
 */
function swapPieces(face, times) {
    for (var i = 0; i < 6 * times; i++) {
        var piece1 = getPieceBy(face, i / 2, i % 2);
        var piece2 = getPieceBy(face, i / 2 + 1, i % 2);

        for (var j = 0; j < 5; j++) {
            var sticker1 = piece1?.children[j < 4 ? mx(face, j) : face].firstChild;
            var sticker2 = piece2?.children[j < 4 ? mx(face, j + 1) : face].firstChild;

            if (sticker1 && sticker2) {
                const c1 = sticker1.className;
                sticker1.className = sticker2.className;
                sticker2.className = c1;
            }
        }
    }
}

/**
 * Animates rotation of the face (by clockwise if cw), and then swaps stickers
 * @param {*} face 
 * @param {*} cw 
 * @param {*} currentTime 
 */
function animateRotation(face, cw, currentTime) {
    var k = .3 * (face % 2 * 2 - 1) * (2 * cw - 1);
    var qubes = Array(9).fill(pieces[face]).map((value, index) => index ? getPieceBy(face, index / 2, index % 2) : value);

    (function rotatePieces() {
        var passed = Date.now() - currentTime;
        var style = `rotate${getAxis(face)}(${k * passed * (passed < 300)}deg)`;

        qubes.forEach((piece) => {
            if (!piece) return;
            piece.style.transform = piece.style.transform.replace(/rotate.\(\S+\)/, style);
        });

        if (passed >= 300) {
            return swapPieces(face, 3 - 2 * cw);
        }

        requestAnimationFrame(rotatePieces);
    })();
}

function mouseDown(md_e) {
    var startXY = pivot.style.transform.match(/-?\d+\.?\d*/g).map(Number);
    var element = md_e.target.closest('.element');
    var face = [].indexOf.call((element || cube).parentNode.children, element);

    function mouseMove(mm_e) {
        if (element) {
            var gid = /\d/.exec(document.elementFromPoint(mm_e.pageX, mm_e.pageY).id);

            if (gid && gid.input.includes('anchor')) {
                mouseUp();

                var e = element.parentNode.children[mx(face, Number(gid) + 3)].hasChildNodes();
                animateRotation(mx(face, Number(gid) + 1 + 2 * e), e, Date.now());
            }
        }
        else {
            const transform = `rotateX(${startXY[0] - (mm_e.pageY - md_e.pageY) / 2}deg)rotateY(${startXY[1] + (mm_e.pageX - md_e.pageX) / 2}deg)`;
            pivot.style.transform = transform;
        }
    }

    function mouseUp() {
        document.body.appendChild(guide);
        scene.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
        scene.addEventListener('mousedown', mouseDown);
    }

    (element || document.body).appendChild(guide);

    scene.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
    scene.removeEventListener('mousedown', mouseDown);
}

function scramble(count = 25, animate = true) {
    let lastFace = -1;
    let i = 0;

    function step() {
        if (i >= count) return;

        let face;
        do { face = Math.floor(Math.random() * 6); } while (face === lastFace);
        lastFace = face;

        const cw = Math.random() < 0.5;

        if (animate) {
            animateRotation(face, cw, Date.now());
            setTimeout(step, 320);
        } else {
            swapPieces(face, 3 - 2 * cw);
            setTimeout(step, 0);
        }

        i++;
    }

    step();
}

function isSolved() {
    for (const piece of pieces) {
        for (let face = 0; face < 6; face++) {
            const sticker = piece.children[face]?.firstChild;
            if (!sticker) continue;
            if (sticker.className !== `sticker ${colors[face]}`) return false;
        }
    }
    return true;
}

document.ondragstart = () => false

// window.addEventListener('load', assembleCube);
window.addEventListener('load', () => {
    assembleCube();
    // Mezcla inicial (desactivada si ENABLE_SCRAMBLE = false)
    if (ENABLE_SCRAMBLE) requestAnimationFrame(() => scramble(25, true));

    const btn = document.getElementById('checkBtn');
    btn?.addEventListener('click', () => {
        if (isSolved()) {
            // alert(SOLVED_LETTER);
            notifyWinAndRedirect(GAME_ID, LOBBY_PATH, REDIRECT_DELAY);
        }
    });
});

scene.addEventListener('mousedown', mouseDown);