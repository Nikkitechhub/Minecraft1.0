const game = document.getElementById("game");
const slots = document.querySelectorAll(".slot");

let selectedBlock = "grass";

const blocks = [];

const blockColors = {
  grass: "#5fa83d",
  dirt: "#8b5a2b",
  stone: "#777",
  wood: "#9b642f"
};

// -------------------------
// Create world
// -------------------------

const worldWidth = 25;
const worldHeight = 8;

function createWorld() {
  for (let x = 0; x < worldWidth; x++) {
    const groundHeight = 3 + Math.floor(Math.random() * 3);

    for (let y = 0; y < groundHeight; y++) {
      createBlock(
        x,
        y,
        y === groundHeight - 1
          ? "grass"
          : y > groundHeight - 3
          ? "dirt"
          : "stone"
      );
    }
  }

  // Trees
  for (let i = 0; i < 5; i++) {
    const x = 2 + Math.floor(Math.random() * (worldWidth - 4));
    createTree(x, 3);
  }
}

// -------------------------
// Create block
// -------------------------

function createBlock(x, y, type) {
  const block = document.createElement("div");

  block.className = "block";
  block.dataset.x = x;
  block.dataset.y = y;
  block.dataset.type = type;

  block.style.position = "absolute";
  block.style.width = "45px";
  block.style.height = "45px";

  block.style.left = `${x * 45}px`;
  block.style.bottom = `${y * 45}px`;

  block.style.background = blockColors[type];

  block.style.border = "2px solid rgba(0,0,0,0.25)";
  block.style.boxShadow = "inset 3px 3px rgba(255,255,255,0.15)";

  game.appendChild(block);

  blocks.push(block);

  // Break block
  block.addEventListener("click", function (event) {
    event.stopPropagation();

    block.remove();

    const index = blocks.indexOf(block);

    if (index !== -1) {
      blocks.splice(index, 1);
    }
  });
}

// -------------------------
// Trees
// -------------------------

function createTree(x, groundY) {
  createBlock(x, groundY, "wood");
  createBlock(x, groundY + 1, "wood");
  createBlock(x, groundY + 2, "wood");

  createBlock(x - 1, groundY + 2, "grass");
  createBlock(x + 1, groundY + 2, "grass");

  createBlock(x, groundY + 3, "grass");
}

// -------------------------
// Block selection
// -------------------------

slots.forEach(slot => {
  slot.addEventListener("click", () => {
    slots.forEach(s => s.classList.remove("selected"));

    slot.classList.add("selected");

    selectedBlock = slot.dataset.block;
  });
});

// -------------------------
// Place blocks
// -------------------------

game.addEventListener("contextmenu", event => {
  event.preventDefault();

  const rect = game.getBoundingClientRect();

  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  const x = Math.floor(mouseX / 45);

  const y = Math.floor(
    (window.innerHeight - mouseY) / 45
  );

  // Don't place too far away
  if (x < 0 || x >= worldWidth) {
    return;
  }

  // Don't place duplicate block
  const alreadyExists = blocks.some(block => {
    return (
      Number(block.dataset.x) === x &&
      Number(block.dataset.y) === y
    );
  });

  if (alreadyExists) {
    return;
  }

  createBlock(x, y, selectedBlock);
});

// -------------------------
// Player
// -------------------------

const player = document.createElement("div");

player.id = "player";

player.style.position = "absolute";
player.style.width = "32px";
player.style.height = "42px";

player.style.background = "#3498db";
player.style.border = "3px solid #222";
player.style.borderRadius = "5px";

player.style.left = "200px";
player.style.bottom = "150px";

player.style.zIndex = "10";

game.appendChild(player);

let playerX = 200;
let playerY = 150;

let velocityY = 0;

const speed = 4;
const gravity = 0.6;
const jumpPower = 11;

let keys = {};

let onGround = false;

// -------------------------
// Keyboard
// -------------------------

document.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;

  if (
    event.code === "Space" &&
    onGround
  ) {
    velocityY = jumpPower;
    onGround = false;
  }
});

document.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

// -------------------------
// Player update
// -------------------------

function updatePlayer() {
  if (keys["a"]) {
    playerX -= speed;
  }

  if (keys["d"]) {
    playerX += speed;
  }

  // Gravity
  velocityY -= gravity;

  playerY += velocityY;

  // Ground collision
  const groundLevel = 135;

  if (playerY <= groundLevel) {
    playerY = groundLevel;
    velocityY = 0;
    onGround = true;
  }

  // World boundaries
  if (playerX < 0) {
    playerX = 0;
  }

  if (playerX > window.innerWidth - 32) {
    playerX = window.innerWidth - 32;
  }

  player.style.left = `${playerX}px`;
  player.style.bottom = `${playerY}px`;

  requestAnimationFrame(updatePlayer);
}

// -------------------------
// Start game
// -------------------------

createWorld();
updatePlayer();
