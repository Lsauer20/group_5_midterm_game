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

const BIRD_FRAME_WIDTH = 740 / 3;   // 246.67
const BIRD_FRAME_HEIGHT = 592 / 3;  // 197.33
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
  birdImage = loadImage("assets/images/bird.jpg");
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

  // Increase difficulty every 30 seconds
  let level = floor(millis() / 30000);

  // Bears move faster
  bearWalkSpeed = 1.5 + level * 0.3;

  // Bears spawn more often
  minSpawnTime = max(2000, 7000 - level * 500);
  maxSpawnTime = max(5000, 15000 - level * 1000);

}

function draw() {

  updateDifficulty();
  if (millis() > nextBearSpawn) {

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
  if (millis() > nextBirdSpawn) {

  let direction = random() < 0.5 ? 1 : -1;

  birds.push({

    x: direction === 1 ? -100 : width + 100,
    y: random(150, height * 0.5),

    direction: direction,
    facing: direction,

    leaving: false,

    frame: 0,
    frameTimer: 0,

    lastAttack: 0

  });

  let level = floor((millis() - 30000) / 30000);

  nextBirdSpawn = millis() + random(
    max(3000, 12000 - level * 1000),
    max(6000, 18000 - level * 1000)
  );
}

  nextBearSpawn = millis() + random(minSpawnTime, maxSpawnTime);

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
      FRAME_WIDTH,
      FRAME_HEIGHT,
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

      bird.frame = (bird.frame + 1) % 9;
      bird.frameTimer = 0;

    }

    // Move toward hive
    if (!bird.leaving) {

      if (bird.direction === 1) {

        if (bird.x < hiveX)
          bird.x += birdWalkSpeed;

      } else {

        if (bird.x > hiveX)
          bird.x -= birdWalkSpeed;

      }

    }

    // Leaving
    else {

      if (bird.direction === 1)
        bird.x -= birdWalkSpeed * 1.5;
      else
        bird.x += birdWalkSpeed * 1.5;

    }

    // Damage hive
    let distanceToHive = abs(bird.x - hiveX);

    if (!bird.leaving && distanceToHive < 80) {

      if (millis() - bird.lastAttack > 2000) {

        hiveHealth -= 5;
        hiveHealth = max(0, hiveHealth);

        bird.lastAttack = millis();

      }

    }

    // Draw bird
    push();

    translate(bird.x, bird.y);

    if (bird.facing === -1)
      scale(-1, 1);

    let row = floor(bird.frame / 3);
    let col = bird.frame % 3;

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

  for (let bear of bears) {

    if (

      mouseX > bear.x - FRAME_WIDTH/2 &&
      mouseX < bear.x + FRAME_WIDTH/2 &&
      mouseY > bear.y - FRAME_HEIGHT/2 &&
      mouseY < bear.y + FRAME_HEIGHT/2

    ) {

      bear.leaving = true;
      bear.facing *= -1;

      for (let bird of birds) {

  if (

    mouseX > bird.x - 60 &&
    mouseX < bird.x + 60 &&
    mouseY > bird.y - 60 &&
    mouseY < bird.y + 60

  ) {

    bird.leaving = true;
    bird.facing *= -1;

  }

}

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