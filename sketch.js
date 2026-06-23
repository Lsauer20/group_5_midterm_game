let beehive;
let beeImage;
let clouds = [];
let grassBlades = [];
let bees = [];

let bearImage;
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

// Bear attacks
let lastBearAttack = 0;

const FRAME_WIDTH = 80; // 320 / 4
const FRAME_HEIGHT = 48;

function preload() {
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

function draw() {
  // Spawn a bear randomly every 10-20 seconds
  if (!bearActive && millis() > nextBearSpawn) {
    // Choose which side the bear comes from
    bearDirection = random() < 0.5 ? 1 : -1;

    if (bearDirection === 1) {
      bearX = -100;
      bearFacing = 1; // facing right
    } else {
      bearX = width + 100;
      bearFacing = -1; // facing left
    }

    bearY = height * 0.79 - FRAME_HEIGHT;

    bearLeaving = false;
    bearGone = false;
    bearActive = true;

    nextBearSpawn = millis() + random(7000, 15000);
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
  drawBear();

  // Beehive
  image(beehive, width / 2, height * 0.68, 150, 150);

  drawMiniHiveHealthBar();
  // Bees
  drawBees();
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
  let hiveY = height * 0.68;

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

function drawBear() {
  if (!bearActive) return;

  let hiveX = width / 2;

  // Animate sprite sheet
  frameTimer++;

  if (frameTimer > 10) {
    bearFrame = (bearFrame + 1) % 4;
    frameTimer = 0;
  }

  // Walking toward hive
  if (!bearLeaving) {
    if (bearDirection === 1) {
      // Bear came from left
      if (bearX < hiveX - 120) {
        bearX += 1.5;
      }
    } else {
      // Bear came from right
      if (bearX > hiveX + 120) {
        bearX -= 1.5;
      }
    }
  } else {
    // Bear leaves the way it came

    if (bearDirection === 1) {
      bearX -= 2.5;
    } else {
      bearX += 2.5;
    }

    // Remove bear when off-screen
    if (bearX < -200 || bearX > width + 200) {
      bearGone = true;
      bearActive = false;
      return;
    }
  }

  // Attack hive when close enough
if (!bearLeaving) {

  let distanceToHive = abs(bearX - hiveX);

  if (distanceToHive <= 120) {

  bearAttacking = true;

    // Attack every 1.5 seconds
    if (millis() - lastBearAttack > 1500) {

      hiveHealth -= 5;
      hiveHealth = max(hiveHealth, 0);

      lastBearAttack = millis();
    }
  }
}
if (distanceToHive > 120 || bearLeaving) {
  bearAttacking = false;
}
  push();

  translate(bearX, bearY);

  // Flip sprite when facing left
  if (bearFacing === -1) {
    scale(-1, 1);
  }

  image(
    bearImage,
    0,
    0,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    bearFrame * FRAME_WIDTH,
    0,
    FRAME_WIDTH,
    FRAME_HEIGHT,
  );

  pop();
}

function mousePressed() {
  if (bearGone) return;

  let bearWidth = FRAME_WIDTH;
  let bearHeight = FRAME_HEIGHT;

  if (
    mouseX > bearX - bearWidth / 2 &&
    mouseX < bearX + bearWidth / 2 &&
    mouseY > bearY - bearHeight / 2 &&
    mouseY < bearY + bearHeight / 2
  ) {
    bearLeaving = true;

    // Turn around
    bearFacing *= -1;
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
  let hiveY = height * 0.68;

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