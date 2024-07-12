/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

let windowIsFullscreen = false;
var scl;
const GAME_WIDTH = 1536, GAME_HEIGHT = 760;
const HALF_WIDTH = GAME_WIDTH*0.5;
const HALF_HEIGHT = GAME_HEIGHT*0.5;
var canvasWidth, canvasHeight;

p5.disableFriendlyErrors = true;

let unit, timeUnit;
let standardWidth = GAME_WIDTH;

let mouseReleaseTime = 0;

let ninjaBodyRight, ninjaBodyLeft, ninjaSwordRight, ninjaSwordLeft, ninjaLongLimb, ninjaShortLimb;
let grapplerBodyRight, grapplerBodyLeft, grapplerBicepRight, grapplerBicepLeft, grapplerEmptyForearmRight, grapplerEmptyForearmLeft;
let grapplerUnloadedGunForearmRight, grapplerUnloadedGunForearmLeft, grapplerLoadedGunForearmRight, grapplerLoadedGunForearmLeft, grapplerLegRight, grapplerLegLeft, grapplerAnkleRight, grapplerAnkleLeft, grapplerHarpoonLeft, grapplerHarpoonRight;
let grapplerBodyRight2;
let drone, droneTurret;
let risingCrawler;
let crawlerBody, crawlerEye, crawlerPupil, crawlerPupil2, crawlerLegRight, crawlerLegLeft, crawlerSpikeRight, crawlerSpikeLeft;

let soundIsOn = true;
let laserSound, crawlerSplat, crawlerStepSound, music;

let pixelFont;

let verticalWall, horizontalWall;

let birdLeft, birdRight;

const NINJA = "NINJA", DRONE = "DRONE", GRAPPLER = "GRAPPLER";
const CRAWLER = "CRAWLER";
const PLAYER = 0, BOSS_ENEMY = 1, SMALL_ENEMY = 2;

const ADD_CRAWLER = "ADD_CRAWLER";

const ANIMATION = "ANIMATION", PLAY_THROUGH_ANIMATION = "PLAY_THROUGH_ANIMATION", IMAGE = "IMAGE";
const COLLIDER = "COLLIDER";
const RIGHT_WALL = "RIGHT_WALL", LEFT_WALL = "LEFT_WALL", FLOOR = "FLOOR", CEILING = "CEILING";
const IDLE = "IDLE", ATTACKING = "ATTACKING", TRANSITIONING_TO_ATTACK = "TRANSITIONING_TO_ATTACK", TRANSITIONING_TO_IDLE = "TRANSITIONING_TO_IDLE";
const END = "END", HOME = "HOME", CHARACTER_SCREEN = "CHARACTER_SCREEN";
let onMenu = true;
let menuScreen = HOME;
let homeScreen, helpScreen, endScreen;

let pureVoid;

let sky, cityBackground;

let world;
let timeSpeed = 1;

let gameTime = 0;

let stats = {
  score: 0,
  enemiesKilled: 0,
  daysSurvived: 0,
}

function preload() {

  unit = 1;
  timeUnit = 1;

  pureVoid = loadImage("assets/pureVoid.png");
  cityBackground = loadImage("assets/background.png");
  sky = loadImage("assets/timeBackground.png");
  endScreen = loadImage("assets/endScreen.png");
  // homeScreen = loadImage("assets/helpScreen1.png");
  homeScreen = loadImage("assets/fots_home.png");
  helpScreen = loadImage("assets/helpScreen3.png");

  verticalWall = loadImage("assets/verticalWall.png");
  horizontalWall = loadImage("assets/horizontalWall.png");

  birdLeft = loadImage("assets/birdLeft.png");
  birdRight = loadImage("assets/birdRight.png");

  risingCrawler = new Animation("assets/risingCrawler", 12, 2, true);
  crawlerBody = loadImage("assets/crawlerBody.png");
  crawlerEye = loadImage("assets/crawlerEye.png");
  crawlerPupil = loadImage("assets/crawlerPupil.png");
  crawlerPupil2 = loadImage("assets/crawlerPupil2.png");
  crawlerLegRight = loadImage("assets/crawlerLegRight.png");
  crawlerLegLeft = loadImage("assets/crawlerLegLeft.png");
  crawlerSpikeRight = loadImage("assets/crawlerSpikeRight.png");
  crawlerSpikeLeft = loadImage("assets/crawlerSpikeLeft.png");

  ninjaBodyRight = loadImage("assets/ninjaBodyRight.png");
  ninjaBodyLeft = loadImage("assets/ninjaBodyLeft.png");
  ninjaSwordRight = loadImage("assets/ninjaSwordRight.png");
  ninjaSwordLeft = loadImage("assets/ninjaSwordLeft.png");
  ninjaLongLimb = loadImage("assets/ninjaLongLimb.png");
  ninjaShortLimb = loadImage("assets/ninjaShortLimb.png");

  grapplerBodyLeft = loadImage("assets/grapplerBodyLeft.png");
  grapplerBodyRight = loadImage("assets/grapplerBodyRight.png");

  grapplerBodyRight2 = loadImage("assets/grapplerBodyRight2.png");

  grapplerBicepRight = loadImage("assets/grapplerBicepRight.png");
  grapplerBicepLeft = loadImage("assets/grapplerBicepLeft.png");
  grapplerEmptyForearmRight = loadImage("assets/grapplerEmptyForearmRight.png");
  grapplerEmptyForearmLeft = loadImage("assets/grapplerEmptyForearmLeft.png");
  grapplerUnloadedGunForearmRight = loadImage("assets/grapplerUnloadedGunForearmRight.png");
  grapplerUnloadedGunForearmLeft = loadImage("assets/grapplerUnloadedGunForearmLeft.png");
  grapplerLoadedGunForearmRight = loadImage("assets/grapplerLoadedGunForearmRight.png");
  grapplerLoadedGunForearmLeft = loadImage("assets/grapplerLoadedGunForearmLeft.png");
  grapplerLegRight = loadImage("assets/grapplerLegRight.png");
  grapplerLegLeft = loadImage("assets/grapplerLegLeft.png");
  grapplerAnkleRight = loadImage("assets/grapplerAnkleRight.png");
  grapplerAnkleLeft = loadImage("assets/grapplerAnkleLeft.png");
  grapplerHarpoonLeft = loadImage("assets/grapplerHarpoonLeft.png");
  grapplerHarpoonRight = loadImage("assets/grapplerHarpoonRight.png");

  drone = loadImage("assets/drone.png");
  droneTurret = loadImage("assets/droneTurret.png");

  laserSound = loadSound("assets/sounds/laserSound.wav");
  laserSound.setVolume(0.1);
  crawlerSplat = loadSound("assets/sounds/crawlerSplat.wav");
  crawlerSplat.setVolume(0.4);
  crawlerStepSound = loadSound("assets/sounds/crawlerStepSound.wav");
  crawlerStepSound.setVolume(0.3);
  music = loadSound("assets/sounds/squadUpMusic.wav");

  pixelFont = loadFont("assets/fonts/Minecraft.ttf");
}

function setup() {
  findScaleDimensions();
  createCanvas(canvasWidth, canvasHeight);
  // unit = width / GAME_WIDTH;
  unit = 1;

  imageMode(CENTER);
  rectMode(CENTER);
  textFont(pixelFont);

  world = new World();
}

function windowResized() {
  findScaleDimensions();
  resizeCanvas(canvasWidth, canvasHeight);
}

function findScaleDimensions() {
  // let dimensionRatio = GAME_WIDTH/GAME_HEIGHT;
  // canvasWidth = min(windowWidth, windowHeight*dimensionRatio);
  // canvasHeight = canvasWidth / dimensionRatio;
  // scl = canvasWidth / GAME_WIDTH;
  
  // for some reason resizing is really scuffed
  canvasWidth = GAME_WIDTH;
  canvasHeight = GAME_HEIGHT;
  scl = 1;
}

function draw() {
  scale(scl);

  controlMusic();

  timeUnit = constrain(timeSpeed*16.7/deltaTime, 0, 2);
  gameTime += timeSpeed;

  if (onMenu) {
    drawMenuScreen();
  } else {
    world.draw();
  }
}

function mousePressed() {
  const mx = mappedMouseX();
  const my = mappedMouseY();
  print(mx, my);
  if (onMenu) {
    if (menuScreen == HOME) {
      if (mx == constrain(mx, 585, 960)) {
        if (my == constrain(my, 370, 555)) {
          menuScreen = CHARACTER_SCREEN; 
        }
      }
    } else if (menuScreen == CHARACTER_SCREEN) {
      if (mx == constrain(mx, 1136, 1406)) {
        if (my == constrain(my, 554, 678)) {
          onMenu = false;
          menuScreen = null;
          worldReset();
        }
      }
    } else if (menuScreen == END) {
      if (mx == constrain(mx, 1000, 1424)) {
        if (my == constrain(my, 72, 200)) {
          onMenu = false;
          menuScreen = null;
          worldReset();
        }
      }
    }
  }
}

// map x from canvas bounds to game size bounds (1536)
function mapCanvasX(x) {
  return map(x, 0, canvasWidth, 0, GAME_WIDTH);
}

// map y from canvas bounds to game size bounds (760)
function mapCanvasY(y) {
  return map(y, 0, canvasHeight, 0, GAME_HEIGHT);
}

function mappedMouseX() {
  return mapCanvasX(mouseX);
}

function mappedMouseY() {
  return mapCanvasY(mouseY);
}

function drawMenuScreen() {
  if (menuScreen == END) {
    image(endScreen, width*0.5, height*0.5);
    drawEndScreenStats();
  } else if (menuScreen == HOME) {
    image(homeScreen, width*0.5, height*0.5);
  } else if (menuScreen == CHARACTER_SCREEN) {
    image(helpScreen, width*0.5, height*0.5);
  }
}

function drawEndScreenStats() {
  fill(0);
  noStroke();
  textSize(80);
  text(`Score: ${stats.score}`, 450, 320);
  text(`${stats.enemiesKilled} Spiders Blasted`, 450, 440);
  text(`Died on day ${stats.daysSurvived}`, 450, 560);
}

function validParameter(parameter) {
  return (parameter != null && parameter != undefined);
}

function hasValidParameter() {
  for (let i = 0; i < arguments.length; i++) {
    if (validParameter(arguments[i])) {
      return true;
    }
  }
  return false;
}

//  returns parameter if parameter is valid, otherwise returns default
function overrideParameter(parameter, defaultValue) {
  return validParameter(parameter) ? parameter : defaultValue;
}

function pointInside(x, y, left, top, right, bottom) {

  return ( x == constrain(x, left, right) && y == constrain(y, top, bottom) );

}

function keyPressed() {
  if (event.ctrlKey)
    return;
  let leftKey = [65, 37];
  let upKey = [87, 38];
  let rightKey = [68, 39];
  let downKey = [40, 83];
  let spaceKey = 32;
  let resetKey = 82;
  let muteKey = 77;
  let fullscreenKey = 70;
  
  switch (keyCode) {
    
    case leftKey[0] :
    case leftKey[1] :
      world.pressLeft();
      break;

    case rightKey[0] :
    case rightKey[1] :
      world.pressRight();
      break;

    case upKey[0] :
    case upKey[1] :
      world.pressUp();
      break;

    case downKey[0] :
    case downKey[1] :
      world.pressDown();
      break;
    
    case spaceKey :
      world.pressSpace();
      break;

    case resetKey :
      resetWorld();
      break;

    case muteKey :
      toggleMute();
      break;

    case fullscreenKey :
      toggleFullscreen();
      break;

    default :
      print("KEY PRESSED : " + keyCode);
      return;
  }
  event.preventDefault();
}

function keyReleased() {

  let leftKey = [65, 37];
  let upKey = [87, 38];
  let rightKey = [68, 39];
  let downKey = [40, 83];
  let spaceKey = 32;
  
  switch (keyCode) {
    
    case leftKey[0] :
    case leftKey[1] :
      world.unpressLeft();
      break;

    case rightKey[0] :
    case rightKey[1] :
      world.unpressRight();
      break;

    case upKey[0] :
    case upKey[1] :
      world.unpressUp();
      break;

    case downKey[0] :
    case downKey[1] :
      world.unpressDown();
      break;
    
    case spaceKey :
      world.unpressSpace();
      break;

  }

}

function gameOver() {
  onMenu = true;
  stats = world.getStats();
  menuScreen = END;
}

function worldReset() {
  world = new World();
  gameTime = 0;
}

function rightclick() {
  if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    }, false);
} else {
    document.attachEvent('oncontextmenu', function() {
        window.event.returnValue = false;
    });
}
  return false;
}

function mouseReleased() {
  if (mouseButton == LEFT) {
    mouseReleaseTime = frameCount;
  }
}

function playSound(sound) {
  if (soundIsOn) {
    sound.play();
  }
}

function playOnce(sound) {
  if (!sound.isPlaying) {
    playSound(sound);
  }
}

function controlMusic() {
  playOnce(music);
}

function toggleMute() {
  soundIsOn = !soundIsOn;
}

function mute() {
  soundIsOn = false;
}

function unmute() {
  soundIsOn = true;
}

function resetWorld() {
  world = new World();
}


function toggleFullscreen() {

  if (windowIsFullscreen) {
    closeFullscreen();
  } else {
    openFullscreen();
  }

}
      
/* View in fullscreen */
function openFullscreen() {
  windowIsFullscreen = true;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  windowIsFullscreen = false;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}