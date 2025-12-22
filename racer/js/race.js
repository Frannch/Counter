// controls the race

var track = null;

var numbers = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
var Race = function() {
  this.track = null;
//  this.player = null;

  this.state = 0;
  this.countdownNumber = 3;
  this.lastTime = 0 ;

  this.carCount = 15;// 10;

  this.trackNumber = 0;

  this.zIsDown = false;
  this.xIsDown = false;

  this.raceNumber = 0;
  this.winShown = false; // <- NUEVO: evitar overlay duplicado
}

var STATE_PRERACE = 0;
var STATE_COUNTDOWN = 1;
var STATE_RACING = 4;
var STATE_RACEOVER = 5;

Race.COUNTDOWN_INTERVAL = 800;//800;//800;//1;//800;

Race.prototype = {
  init: function() {
    // init never gets called?
  },

  start: function(trackNumber) {
    raceAudioEngineSpeed(0);

    if(trackNumber >= 4) {
      trackNumber = 0;
    }
    trackNumber = 0;
    this.raceNumber = trackNumber;
    track = new Track();

    switch(trackNumber) {
      case 0:
        track.buildTrack1();
        break;
      case 1:
        track.buildTrack2();
        break;
      case 2:
        track.buildTrack3();
        break;
      case 3:
        track.buildTrack4();
        break;

    }

    this.resetCars();
    player = cars[0];
    player.initSlipstreamLines();

    this.state = STATE_PRERACE;
    this.countdownNumber = 4;
    this.lastTime = getTimestamp();

    this.winShown = false; // reset del flag en cada carrera
  },

  raceOver: function() {
    this.state = STATE_RACEOVER;

    // Detectar TOP-8 y mostrar overlay + redirigir
    var posStr = (cars && cars[0] && cars[0].finishPosition) || '';
    var m = String(posStr).match(/^\d+/);
    var rank = m ? parseInt(m[0], 10) : NaN;
    var isTop8 = Number.isFinite(rank) && rank >= 1 && rank <= 8;

    if (isTop8 && !this.winShown) {
      this.winShown = true;
      notifyWinAndRedirect(GAME_ID, LOBBY_PATH, REDIRECT_DELAY);
    }
  },

  keyDown: function(e) {
    if(this.state !== STATE_RACEOVER) {
      switch(e.keyCode) {
        case 90: // z
          this.zIsDown = true;
          player.setDrift(true);
          break;
        case 88: // x
          this.xIsDown = true;
          player.setTurbo(true);
          break;
        case KEYUP:
          player.setAccelerate(true);
          break;
        case KEYDOWN:
          player.setBrake(true);
          break;
        case KEYLEFT:
          player.setTurnLeft(true);
          break;
        case KEYRIGHT:
          player.setTurnRight(true);
          break;
      }
    } else {
    }
    
  },

  keyUp: function(e) {


    if(this.state != STATE_RACEOVER) {
      switch(e.keyCode) {
        case 90: // z
          this.zIsDown = false;
          player.setDrift(false);
          break;
        case 88:
          this.xIsDown = false;
          player.setTurbo(false);
          break;
        case KEYUP:
          player.setAccelerate(false);
          break;
        case KEYDOWN:
          player.setBrake(false);
          break;
        case KEYLEFT:
          player.setTurnLeft(false);
          break;
        case KEYRIGHT:
          player.setTurnRight(false);
          break;
      }
    } else {
      // Estado: RACEOVER
      // Si ya mostramos overlay de victoria, ignorar entradas
      if (this.winShown) {
        return;
      }

      if(e.keyCode == 90) { // Z: Retry
        if(!this.zIsDown) {
          this.start(this.raceNumber);
        }
        this.zIsDown = false;
      }

      // Eliminado: avanzar a la siguiente carrera con X
      // if(e.keyCode == 88) { ... }
    }
  },

  
  resetCars: function() {
    //    resetCars();
    cars = [];
    var n, car, segment, offset, z, sprite, speed;
    for (var n = 0 ; n < this.carCount ; n++) {
      z = track.getLength() - (this.carCount - n) * Track.segmentLength * 13;

      segment = track.findSegment(z);

      var trackLeft = segment.p1.world.x;
      var trackRight = segment.p2.world.x;
//      var trackWidth = trackRight - trackLeft;

//      sprite = SPRITES.CAR_STRAIGHT;

      car = new Car();

      var x = 0;
      if(n%2) {
        x = trackLeft / 2;
      } else {
        x = trackRight / 2 - car.width;

      }


      car.index = n;
//      car.offset = offset;
      car.x = x;
      car.z = z;
      car.sprite = sprite;
      car.speed = 0;//speed;      
      car.percent = utilPercentRemaining(car.z, Track.segmentLength);  

      // player speeds are set in car.js
      if(car.index !== 0) {
        var maxSpeed = 23000;//23000;
        if(car.index < 8 && car.index > 3) {
          car.maxSpeed = maxSpeed * 0.905 - mathRand() * (this.carCount - n - 1) * maxSpeed / 55;
        } else if(car.index > 12) {
          car.maxSpeed = maxSpeed * 0.905 - (this.carCount - n - 1) * maxSpeed / 65;
        } else {
          car.maxSpeed = maxSpeed * 0.905 - (this.carCount - n - 1) * maxSpeed / 45;
        }
        car.accel = maxSpeed / 2;  
        
        if(car.index < 4) {
          car.takeCornerOnInside = false;
        } else if(car.index < 8) {
          car.takeCornerOnInside = mathRand() > 0.4;
          car.slowOnCorners = mathRand() > 0.6;
        }
      }
      segment.cars.push(car);
      cars.push(car);
    }

  },

  updatePrerace: function(dt) {
    var time = getTimestamp();
    if(time - this.lastTime > Race.COUNTDOWN_INTERVAL) {
      this.lastTime = getTimestamp();
      this.countdownNumber--;
      if(this.countdownNumber == 3) {
        speak('RACE');
      }
      if(this.countdownNumber == 2) {
        speak(numbers[this.raceNumber]);
      }
      if(this.countdownNumber <= 0) {
        this.state = STATE_COUNTDOWN;
        this.countdownNumber = 3;
        raceAudioTone(220, 1/4);
//        speak(this.countdownNumber);
      }
    }
    camera.update(dt);

  },

  updateCountdown: function(dt) {
    var time = getTimestamp();
    if(time - this.lastTime > Race.COUNTDOWN_INTERVAL) {
      this.lastTime = getTimestamp();
      this.countdownNumber--;
      if(this.countdownNumber <= 0) {
        raceAudioTone(440, 1/2);
        this.state = STATE_RACING;
      } else {
        raceAudioTone(220, 1/4);
//        speak(this.countdownNumber);
      }
    }
    camera.update(dt);
  },

  updateRace: function(dt) {
    var playerSegment = track.findSegment(player.z);
    var speedPercent  = player.speedPercent;//player.speed / maxSpeed;
    var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
    var startPosition = camera.z;
  
    for(var i = 0; i < cars.length; i++) {
      cars[i].update(dt);//, playerSegment, player.width);
    }
  //  updateCars(dt, playerSegment, player.width);
  
//    player.update(dt);
    camera.update(dt);


    bgLayer3Offset  = utilIncrease(bgLayer3Offset,  bgLayer3Speed  * playerSegment.curve * (camera.z-startPosition) / Track.segmentLength, 1);
    bgLayer2Offset = utilIncrease(bgLayer2Offset, bgLayer2Speed * playerSegment.curve * (camera.z-startPosition) / Track.segmentLength, 1);
    bgLayer1Offset = utilIncrease(bgLayer1Offset, bgLayer1Speed * playerSegment.curve * (camera.z-startPosition) / Track.segmentLength, 1);


  },

  updateRaceOver: function() {

  },

  update: function(dt) {
    switch(this.state) {
      case STATE_PRERACE:
        this.updatePrerace(dt);
        break;
      case STATE_COUNTDOWN:
        this.updateCountdown(dt);
        break;
      case STATE_RACEOVER:
      case STATE_RACING:
        this.updateRace(dt);
        break;
    }
  },

  render: function() {
    renderRender();
    if(this.state == STATE_PRERACE) {
//      context.font = "120px \"Courier New\", Courier, monospace";
      context.font = 'italic bold 350px ' + helvetica;

      if(this.countdownNumber < 4) {
        cntxFillStyle(DARKGREY);
        cntxFillText("RACE", 14, 304);  
        cntxFillStyle(LIGHTGREY);
        cntxFillText("RACE", 10, 300);  
      }

      if(this.countdownNumber < 3) {
        if(this.raceNumber == 0) {
          context.font = 'italic bold 440px ' + helvetica;
        } else if(this.raceNumber == 1) {
          context.font = 'italic bold 430px ' + helvetica;
        } else if(this.raceNumber == 2) {
          context.font = 'italic bold 290px ' + helvetica;
        } else if(this.raceNumber == 3) {
          context.font = 'italic bold 358px ' + helvetica;
        }

        cntxFillStyle(DARKGREY);
        cntxFillText(numbers[this.raceNumber], 14, 674);  
        cntxFillStyle(LIGHTGREY);
        cntxFillText(numbers[this.raceNumber], 10, 670);  
      }

    }

    if(this.state == STATE_COUNTDOWN) {

      context.font = ' 300px ' + helvetica;
      context.fillStyle= '#111111';
      context.fillText(this.countdownNumber, 449, 254);  
      context.fillStyle= LIGHTGREY;
      context.fillText(this.countdownNumber, 445, 250);  


    }
    
    if(this.state == STATE_RACING) {

      cntxFillStyle(LIGHTGREY);
      cntxStrokeStyle(LIGHTGREY);
      context.font = ' 80px ' + helvetica;
      context.fillText(player.getPosition(), 10, 80);

      context.font = ' 40px ' + helvetica;
      context.fillText("Lap " + player.getLap() + " of 2", 10, 130);
      context.fillText("Lap Time: " + player.getCurrentLapTime().toFixed(2), 10, 180);


      context.font = ' 80px ' + helvetica;

      var speed = ("000" + Math.round(player.getSpeed() / 100 ).toString(10)).substr(-3);
      context.fillText( speed + "km/h", 695, 80);
      context.font = ' 40px ' + helvetica;

      context.fillText( "Turbo ", 670, 136);
      cntxBeginPath();
      context.rect(796, 110, 208, 28);
      cntxStroke();      
      cntxFillRect(800, 114, player.turboAmount * 2, 20);

      if( cars[0].newPositionTime > 0) {
        context.font = ' 160px ' + helvetica;
        cntxFillStyle(LIGHTGREY);
        context.fillText(cars[0].getPosition(), 334, 184);
      }

    }

    if(this.state == STATE_RACEOVER) {
      context.font = ' 300px ' + helvetica;
      cntxFillStyle(LIGHTGREY);
      context.fillText(cars[0].finishPosition, 300, 290);
      context.font = ' 40px ' + helvetica;
      var y = 380;
      // Quitado el mensaje "x: Next Race"
      // if(cars[0].finishPosition == '1st') {
      //   context.fillText("x: Next Race", 397, y);
      //   y += 80;
      // }
      context.fillText("z: Retry", 445, y);
    }


  }
}

// === Config victoria → lobby (TOP-8) ===
const GAME_ID = 'racer';                 // Asegúrate de tener este id en js/lobby.js
const LOBBY_PATH = '../html/lobby.html'; // Ruta al lobby
const REDIRECT_DELAY = 10;               // segundos

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
      <p>Has quedado entre los 8 primeros.</p>
      <p>Volviendo al lobby en <span class="win-count" id="win-count">${seconds}</span> segundos…</p>
      <div class="win-actions">
        <button class="win-btn primary" id="win-go-now">Ir ahora</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
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
// === fin config victoria → lobby ===