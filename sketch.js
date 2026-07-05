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
let introTimer = 300; // 5 seconds
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
// Start screen
if (!gameStarted) {

  background(135,206,235);

  fill(255);
  textAlign(CENTER, CENTER);

  textSize(70);
  text("DEFEND YOUR HIVE", width/2, height/2 - 50);

  textSize(30);
  text("Press SPACE to Start", width/2, height/2 + 40);

  return;
}
if (gameOver) {

background(0);

fill(255);
textAlign(CENTER, CENTER);

textSize(60);
text("GAME OVER", width/2, height/2);

textSize(30);
text("Press SPACE to restart", width/2, height/2 + 80);

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
if (introTimer > 0) {

  fill(255);
  stroke(0);
  strokeWeight(4);

  textAlign(CENTER, CENTER);

  textSize(38);

  text(
    "Welcome to Protect Your Hive!\n\nDefend your precious bees\nagainst pesky critters trying\nto steal your delicious honey.\nSurvive for as long as you can!",
    width/2,
    height/2
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

function drawGrassTexture() {
  let groundY = height * 0.75;

  stroke(25, 110, 25);
  strokeWeight(2);

  for (let blade of grassBlades) {
    line(blade.x, groundY, blade.x + blade.offsetX, groundY - blade.height);
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

  let barWidth = 300;
  let barHeight = 25;

  let x = width / 2 - barWidth / 2;
  let y = 20;

  // Background
  fill(80);
  noStroke();
  rect(x, y, barWidth, barHeight);

  // Health
  fill(0, 200, 0);
  rect(
    x,
    y,
    barWidth * (hiveHealth / MAX_HIVE_HEALTH),
    barHeight
  );

  // Border
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(x, y, barWidth, barHeight);

  // Text
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
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

  // Round label (left)
  fill(255);
  textSize(24);
  textAlign(LEFT, CENTER);
  text("Round 1", 30, 35);

  // Score (right)
  textAlign(RIGHT, CENTER);
  text("Score: " + score, width - 30, 35);

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