// Pause System
let paused = false;
let pauseButton = {
  x: 0,
  y: 15,
  w: 60,
  h: 45
};
let beehive;
let beeImage;
let clouds = [];
let grassBlades = [];
let bees = [];

let bearImage;
let birdImage;
let birds = [];

let nextBirdSpawn;
let birdWalkSpeed = 4;

let gameStarted = false;
let gameOver = false;
let introTimer = 420; // 5 seconds
let fasterTimer = 0;
let previousLevel = 0;
let scoreLevel = 0;

let bearSpawnDelay = 12000;
let birdSpawnDelay = 15000;

const BIRD_COLS = 8;
const BIRD_ROWS = 3;

const BIRD_FRAME_WIDTH = 1602.666777 / 8;
const BIRD_FRAME_HEIGHT = 616 / 3; // 197.33
let bearX;
let bearY;
// Score
let score = 0;
let lastScoreTime = 0;

let bearFrame = 0;
let frameTimer = 0;
let bearLeaving = false;
let bearGone = false;
let nextBearSpawn;
let bearActive = false;
let bearDirection = 1;
let bearFacing = 1;
// Hive health
let hiveHealth = 100;
let bearAttacking = false;
const MAX_HIVE_HEALTH = 100;

let bears = [];

let minSpawnTime = 7000;
let maxSpawnTime = 15000;

let bearWalkSpeed = 1.5;

// Bear attacks
let lastBearAttack = 0;


const FRAME_WIDTH = 80; // 320 / 4
const FRAME_HEIGHT = 48;

function preload() {
  birdImage = loadImage("assets/images/bird.png");
  beehive = loadImage("assets/images/beehive.png");
  beeImage = loadImage("assets/images/happy_bee.png");
  bearImage = loadImage("assets/images/bear.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textFont("Trebuchet MS");
pauseButton.x = width - pauseButton.w - 20;
pauseButton.y = 15;
  bearX = -100; // Start off-screen
  bearY = height * 0.75 - 20;
  nextBearSpawn = millis() + random(10000, 20000);
  nextBirdSpawn = millis() + 30000; // first bird after 30 sec

  // Create grass blades
  for (let x = 0; x < width; x += 5) {
    grassBlades.push({
      x: x,
      offsetX: random(-4, 4),
      height: random(8, 20),
    });
  }

  // Create clouds
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(width),
      y: random(50, 200),
      size: random(60, 120),
      speed: random(0.5, 1.5),
    });
  }

  // Create bees around the hive
  for (let i = 0; i < 15; i++) {
    bees.push({
      x: width / 2 + random(-100, 100),
      y: height * 0.68 + random(-100, 100),

      targetX: width / 2 + random(-150, 150),
      targetY: height * 0.68 + random(-150, 150),

      speed: random(0.5, 2),
      size: random(25, 40),
    });
  }
}

function updateDifficulty() {

scoreLevel = floor(score / 5000);
if (scoreLevel > previousLevel) {
  fasterTimer = 120; // 3 seconds
  previousLevel = scoreLevel;
}

bearWalkSpeed = 1.5 + scoreLevel * 0.4;
birdWalkSpeed = 4 + scoreLevel * 0.5;

// Every 5000 score halves the delay again
bearSpawnDelay = max(100, 3000 / pow(2, scoreLevel));
birdSpawnDelay = max(150, 4000 / pow(2, scoreLevel));

}

function draw() {
if (!gameStarted) {

background(125, 205, 255);

// Sun
noStroke();
fill(255,220,80);
circle(width-140,120,110);

// Clouds
drawClouds();

// Ground
fill(60,180,75);
rect(0,height*0.75,width,height*0.25);

// Draw two bees
drawStartBees();


// Main title
textAlign(CENTER,CENTER);

stroke(0);
strokeWeight(6);
fill(255);

textSize(62);
text("DEFEND THE HIVE",width/2,120);

// Subtitle
noStroke();
fill(255);

textSize(24);
text(
"Protect your hive from hungry invaders.",
width/2,
175
);

// Start panel
fill(255,245);
stroke(0);
strokeWeight(3);

rect(width/2-260,230,520,170,20);

noStroke();
fill(40);

textSize(26);
text(
"Press SPACE to begin your adventure!",
width/2,
275
);

textSize(20);

text(
"Click bears and birds to scare\n"
+"them away before they damage\n"
+"your beehive.",
width/2,
340
);

return;

}

updateDifficulty();
if (score >= 200 && millis() > nextBearSpawn) {

  let direction = random() < 0.5 ? 1 : -1;

  bears.push({
    x: direction === 1 ? -100 : width + 100,
    y: height * 0.79 - FRAME_HEIGHT,

    direction: direction,
    facing: direction,

    leaving: false,

    frame: 0,
    frameTimer: 0,

    lastAttack: 0
  });

nextBearSpawn = millis() + random(
bearSpawnDelay * 0.5,
bearSpawnDelay
);
}

if (score >= 600 && millis() > nextBirdSpawn) {

  birds.push({
    x: random(0, width),
    y: -100,

    targetX: width / 2 + random(-120,120),
    targetY: height * 0.73,

    direction: 1,
facing: (random(0,width) < width/2) ? 1 : -1,

    leaving: false,

    frame: 0,
    frameTimer: 0,

    lastAttack: 0
  });

  let level = floor((millis() - 30000) / 30000);

nextBirdSpawn = millis() + random(
birdSpawnDelay * 0.5,
birdSpawnDelay
);
}

  // Sky
  background(135, 206, 235);

  updateScore();
drawTopUI();
drawPauseButton(); 
drawHiveHealthBar();

  // Clouds
  drawClouds();

  // Grass
  fill(34, 139, 34);
  noStroke();
  rect(0, height * 0.75, width, height * 0.25);

  // Grass texture
  drawGrassTexture();

  // Bear
  drawBears();

  drawBirds();

  // Beehive
image(beehive, width / 2, height * 0.71, 150, 150);

drawMiniHiveHealthBar();

// Bees
drawBees();

// Intro message
if (introTimer > 0){

fill(0,170);
noStroke();

rect(
width/2-340,
height/2-255,
680,
390,
20
);

fill(255);

textAlign(CENTER,CENTER);

textSize(34);

text(
"HOW TO PLAY",
width/2,
height/2-205
);

textSize(22);

text(
"Protect your hive from bears and birds.\n"
+
"Click enemies to scare them away.\n"
+
"Survive as long as possible to earn points.\n"
+
"Each round makes enemies faster.",
width/2,
height/2-70
);

fill(255,210,0);

textSize(24);

text(
"CLICK ENEMIES TO SEND THEM AWAY!",
width/2,
height/2+65
);

introTimer--;

}

if (fasterTimer > 0) {

  textAlign(CENTER, CENTER);

  fill(255,0,0);
  stroke(0);
  strokeWeight(4);

textSize(90);
fill(255,0,0);

text("FASTER!", width/2, height/2);
textSize(40);
text("Enemies are speeding up", width/2, height/2 + 80);

  fasterTimer--;

}
  if (hiveHealth <= 0) {
gameOver = true;
}
drawTopUI();
drawPauseButton();

if (paused) {
  fill(80, 80, 80, 170);
  noStroke();
  rect(0, 0, width, height);

  drawTopUI();
  drawPauseButton();

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(80);
  text("PAUSED", width / 2, height / 2);
}
}

function drawClouds() {
  fill(255);
  noStroke();

  for (let cloud of clouds) {
    // Move left
    cloud.x -= cloud.speed;

    // Wrap around screen
    if (cloud.x < -cloud.size * 2) {
      cloud.x = width + cloud.size;
      cloud.y = random(50, 200);
    }

    // Soft round cloud
    ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6);
    ellipse(
      cloud.x - cloud.size * 0.3,
      cloud.y,
      cloud.size * 0.7,
      cloud.size * 0.5,
    );
    ellipse(
      cloud.x + cloud.size * 0.3,
      cloud.y,
      cloud.size * 0.7,
      cloud.size * 0.5,
    );
    ellipse(
      cloud.x,
      cloud.y - cloud.size * 0.15,
      cloud.size * 0.8,
      cloud.size * 0.5,
    );
  }
}

function drawStartBees(){

drawBee(170,140,1);
drawBee(width-250,220,0.8);

}

function drawBee(x,y,s){

push();

translate(x,y);

scale(s);

stroke(0);
strokeWeight(2);

// wings
fill(230);

ellipse(-10,-12,18,28);
ellipse(10,-12,18,28);

// body
fill(255,210,0);

ellipse(0,0,38,26);

strokeWeight(3);

line(-8,-12,-8,12);
line(0,-13,0,13);
line(8,-12,8,12);

// head
fill(0);

circle(-20,0,12);

// eye
fill(255);

circle(-22,-2,3);

pop();

}

function drawGrassTexture() {
let groundY = height * 0.75;

stroke(30,120,30);
strokeWeight(2);

for (let blade of grassBlades){

let sway = sin(frameCount * 0.05 + blade.x * 0.08) * 5;

line(
blade.x,
groundY,
blade.x + blade.offsetX + sway,
groundY - blade.height
);

}
}

function drawBees() {
  let hiveX = width / 2;
 let hiveY = height * 0.71;

  for (let bee of bees) {
    // Move toward target
    let dx = bee.targetX - bee.x;
    let dy = bee.targetY - bee.y;

    let distance = dist(bee.x, bee.y, bee.targetX, bee.targetY);

    if (distance > 1) {
      bee.x += (dx / distance) * bee.speed;
      bee.y += (dy / distance) * bee.speed;
    }
    // Add buzzing jitter
    bee.x += random(-0.5, 0.5);
    bee.y += random(-0.5, 0.5);

    // Pick a new random target near hive
    if (distance < 15) {
      bee.targetX = hiveX + random(-150, 150);
      bee.targetY = hiveY + random(-150, 150);
    }

    image(beeImage, bee.x, bee.y, bee.size, bee.size);
  }
}

function drawBears() {

  for (let i = bears.length - 1; i >= 0; i--) {

    let bear = bears[i];
    let hiveX = width / 2;

    // Animation
    bear.frameTimer++;

    if (bear.frameTimer > 10) {
      bear.frame = (bear.frame + 1) % 4;
      bear.frameTimer = 0;
    }

    // Walking
    if (!bear.leaving) {

      if (bear.direction === 1) {

        if (bear.x < hiveX - 120)
          bear.x += bearWalkSpeed;

      } else {

        if (bear.x > hiveX + 120)
          bear.x -= bearWalkSpeed;

      }

    }

    // Leaving
    else {

      if (bear.direction === 1)
        bear.x -= bearWalkSpeed * 1.5;
      else
        bear.x += bearWalkSpeed * 1.5;

    }

    // Attack hive
    let distanceToHive = abs(bear.x - hiveX);

    if (!bear.leaving && distanceToHive <= 120) {

      if (millis() - bear.lastAttack > 1500) {

        hiveHealth -= 5;
        hiveHealth = max(0, hiveHealth);

        bear.lastAttack = millis();

      }

    }

    // Draw sprite
    push();

    translate(bear.x, bear.y);

    if (bear.facing === -1)
      scale(-1,1);

    image(
bearImage,
0,
0,
140,
90,
      bear.frame * FRAME_WIDTH,
      0,
      FRAME_WIDTH,
      FRAME_HEIGHT
    );

    pop();

    // Remove offscreen
    if (bear.x < -200 || bear.x > width + 200) {

      bears.splice(i,1);

    }

  }

}

function drawBirds() {

  let hiveX = width / 2;

  for (let i = birds.length - 1; i >= 0; i--) {

    let bird = birds[i];

    // Animate sprite
    bird.frameTimer++;

    if (bird.frameTimer > 6) {

     bird.frame = (bird.frame + 1) % 24;
      bird.frameTimer = 0;

    }

    // Move toward hive
if (!bird.leaving) {

  let dx = bird.targetX - bird.x;
  let dy = bird.targetY - bird.y;

  let distance = dist(
    bird.x,
    bird.y,
    bird.targetX,
    bird.targetY
  );

  if (distance > 5) {

    bird.x += dx/distance * birdWalkSpeed;
    bird.y += dy/distance * birdWalkSpeed;

  }

}

    // Leaving
    else {

      bird.y -= birdWalkSpeed*1.5;

if (bird.facing === 1)
  bird.x += birdWalkSpeed;
else
  bird.x -= birdWalkSpeed;

    }

    // Damage hive
  let hiveY = height*0.73;

let distanceToHive = dist(
  bird.x,
  bird.y,
  hiveX,
  hiveY
);

if (!bird.leaving && distanceToHive < 100) {

  if (millis() - bird.lastAttack > 2000) {

    hiveHealth -= 5;
    hiveHealth = max(0, hiveHealth);

    bird.lastAttack = millis();

  }

}
// Always face hive while attacking
if (!bird.leaving) {

  // Face toward hive
  if (bird.targetX > bird.x)
    bird.facing = 1;
  else
    bird.facing = -1;

}
else {

  // Face away from hive
  if (bird.targetX > bird.x)
    bird.facing = -1;
  else
    bird.facing = 1;

}
    // Draw bird
    push();

    translate(bird.x, bird.y);

    if (bird.facing === -1)
      scale(-1, 1);

let row = floor(bird.frame / 8);
let col = bird.frame % 8;

    image(

      birdImage,

      0,
      0,
      120,
      120,

      col * BIRD_FRAME_WIDTH,
      row * BIRD_FRAME_HEIGHT,

      BIRD_FRAME_WIDTH,
      BIRD_FRAME_HEIGHT

    );

    pop();

    // Remove offscreen
    if (bird.x < -200 || bird.x > width + 200)
      birds.splice(i, 1);

  }

}

function mousePressed() {


if (
    mouseX > pauseButton.x &&
    mouseX < pauseButton.x + pauseButton.w &&
    mouseY > pauseButton.y &&
    mouseY < pauseButton.y + pauseButton.h
) {
paused = !paused;

if (paused) {
  redraw();
  noLoop();
} else {
  loop();
}

return;
}
  // Bears
  for (let bear of bears) {

    if (
      mouseX > bear.x - FRAME_WIDTH / 2 &&
      mouseX < bear.x + FRAME_WIDTH / 2 &&
      mouseY > bear.y - FRAME_HEIGHT / 2 &&
      mouseY < bear.y + FRAME_HEIGHT / 2
    ) {

      bear.leaving = true;
      bear.facing *= -1;

    }
  }

  // Birds
  for (let bird of birds) {

    if (
      mouseX > bird.x - 60 &&
      mouseX < bird.x + 60 &&
      mouseY > bird.y - 60 &&
      mouseY < bird.y + 60
    ) {

    bird.leaving = true;

if (bird.x < width/2)
    bird.facing = -1;
else
    bird.facing = 1;

    }
  }

}

function drawHiveHealthBar() {

  let barWidth = 420;
  let barHeight = 34;

  let x = width / 2 - barWidth / 2;
  let y = 20;

  // Background
  fill(40,40,40,180);
  noStroke();
rect(x,y,barWidth,barHeight,16);

  // Health
  fill(0, 200, 0);
  rect(
x,
y,
barWidth*(hiveHealth/MAX_HIVE_HEALTH),
barHeight,
16
);

  // Border
noFill();
stroke(255);
strokeWeight(2);
rect(x, y, barWidth, barHeight, 16);

  // Text
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(
    "Beehive Health: " + hiveHealth + " / " + MAX_HIVE_HEALTH,
    width / 2,
    y + barHeight / 2
  );
}


function drawMiniHiveHealthBar() {

  let hiveX = width / 2;
  let hiveY = height * 0.71;

  let barWidth = 80;
  let barHeight = 10;

  // Background
  fill(80);
  rect(hiveX - barWidth / 2, hiveY - 95, barWidth, barHeight);

  // Health
  fill(0, 200, 0);
  rect(
    hiveX - barWidth / 2,
    hiveY - 95,
    barWidth * (hiveHealth / MAX_HIVE_HEALTH),
    barHeight
  );

  // Border
  noFill();
  stroke(0);
  rect(hiveX - barWidth / 2, hiveY - 95, barWidth, barHeight);

  noStroke();
}

function updateScore() {

  // Gain 100 points every second unless a bear is attacking
  if (!bearAttacking) {

    if (millis() - lastScoreTime >= 1000) {

      score += 100;
      lastScoreTime = millis();

    }

  }

}


function drawTopUI() {

fill(40, 40, 40, 180);
stroke(255);
strokeWeight(2);

// Round box
rect(20,15,170,50,12);

// Score box
rect(205,15,190,50,12);

// Health bar stays centered

fill(255);
noStroke();

textAlign(CENTER, CENTER);

textSize(21);

text(
"Round " + (scoreLevel + 1),
100,
38
);

text(
"Score: " + score,
290,
38
);

}

function drawPauseButton() {

fill(255,180,0);
  noStroke();
  rect(pauseButton.x, pauseButton.y, pauseButton.w, pauseButton.h, 12);

  fill(50);

  if (!paused) {

    // Pause bars
    rect(pauseButton.x + 20, pauseButton.y + 10, 5, 25, 2);
    rect(pauseButton.x + 35, pauseButton.y + 10, 5, 25, 2);

  } else {

    // Play icon
    triangle(
      pauseButton.x + 22, pauseButton.y + 10,
      pauseButton.x + 22, pauseButton.y + 35,
      pauseButton.x + 42, pauseButton.y + 22.5
    );

  }
}

function keyPressed() {

  // Start game
  if (!gameStarted && key === ' ') {

    gameStarted = true;
    introTimer = 300;

  }

  // Restart after game over
  else if (gameOver && key === ' ') {

    score = 0;
    hiveHealth = 100;

    bears = [];
    birds = [];

    gameOver = false;

    scoreLevel = 0;
    previousLevel = 0;
    fasterTimer = 0;
    introTimer = 300;

    nextBearSpawn = millis() + 5000;
    nextBirdSpawn = millis() + 8000;

  }

}