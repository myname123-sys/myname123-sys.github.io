const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const catchSound = document.getElementById('catch-sound');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const gameContainer = document.querySelector('.game-container');
const nameOverlay = document.getElementById("nameOverlay");
const playerNameInput = document.getElementById("playerName");
const heartImages = document.querySelectorAll('.heart');

let lives = 5;
let score = 0;
let basketSpeed = 30;
let fallInterval = 1500;
let basketX;
let gameEnded = false;
let consecutiveCatches = 0;

const bombSound = new Audio("crash last main.mp3");

function startGame() {
  const name = playerNameInput.value.trim();
  if (name !== "") {
    nameOverlay.style.display = "none";
    gameContainer.style.display = "block";

    basketX = window.innerWidth / 2 - basket.offsetWidth / 2;
    basket.style.left = basketX + "px";

    setInterval(() => {
      if (!gameEnded) createItem();
    }, fallInterval);
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") startGame();
});
playerNameInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    startGame();
  }
});

function moveBasket(e) {
  if (e.key === 'ArrowLeft') move('left');
  else if (e.key === 'ArrowRight') move('right');
}

function move(direction) {
  if (gameEnded) return;

  const containerWidth = gameContainer.clientWidth;
  const basketWidth = basket.offsetWidth;

  if (direction === 'left') {
    basketX = Math.max(0, basketX - basketSpeed);
  } else if (direction === 'right') {
    basketX = Math.min(containerWidth - basketWidth, basketX + basketSpeed);
  }

  basket.style.left = basketX + 'px';
}

// Keyboard movement
document.addEventListener('keydown', moveBasket);

// Image button movement - works on mobile and desktop
['click', 'touchstart'].forEach(eventType => {
  leftBtn?.addEventListener(eventType, () => move('left'));
  rightBtn?.addEventListener(eventType, () => move('right'));
});

function createItem() {
  if (gameEnded) return;

  const item = document.createElement('div');
  item.classList.add('falling-item');

  const items = [
    { type: 'apple', image: 'apple.png', points: 1 },
    { type: 'banana', image: 'banana.png', points: 1 },
    { type: 'mango', image: 'mango.png', points: 1 },
    { type: 'watermelon', image: 'watermelon.png', points: 1 },
    { type: 'orange', image: 'orange.png', points: 1 },
    { type: 'litchi', image: 'litchi.png', points: 1 },
    { type: 'bomb', image: 'bomb 1.png', points: 0 }
  ];

  const random = items[Math.floor(Math.random() * items.length)];
  item.dataset.type = random.type;
  item.style.backgroundImage = `url('${random.image}')`;
  item.style.left = Math.random() * (window.innerWidth - 70) + 'px';
  item.style.top = '0px';

  gameContainer.appendChild(item);

  let speed = score < 15 ? 2 : 2 + Math.min((score - 15) * 0.3, 8);

  function fall() {
    if (gameEnded) {
      item.remove();
      return;
    }

    const top = parseFloat(item.style.top);
    if (top + item.offsetHeight < window.innerHeight) {
      item.style.top = top + speed + 'px';

      if (isCaught(item)) {
        if (random.type === 'bomb') {
          bombSound.play();
          item.remove();
          gameEnded = true;
          consecutiveCatches = 0;
          setTimeout(() => gameOver(), 2000);
        } else {
          score++;
          scoreDisplay.textContent = 'Score: ' + score;
          catchSound.play();
          item.remove();

          consecutiveCatches++;

          if (consecutiveCatches === 5) {
            if (lives < 5) {
              heartImages[lives].src = "red heart.png";
              lives++;
            }
            consecutiveCatches = 0;
          }
        }
        return;
      }

      requestAnimationFrame(fall);
    } else {
      item.remove();

      if (random.type !== 'bomb') {
        lives--;
        if (lives >= 0 && heartImages[lives]) {
          heartImages[lives].src = "grey heart.png";
        }
        consecutiveCatches = 0;
        if (lives === 0) {
          gameEnded = true;
          gameOver();
        }
      }
    }
  }

  fall();
}

function isCaught(item) {
  const itemRect = item.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();

  const verticalOffset = 15; // tighten vertical touch
  const horizontalPadding = 20; // ignore side brushes

  return (
    itemRect.bottom >= basketRect.top + verticalOffset &&
    itemRect.right - horizontalPadding >= basketRect.left &&
    itemRect.left + horizontalPadding <= basketRect.right
  );
}


function gameOver() {
  gameContainer.style.display = "none";

  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreText = document.getElementById("finalScoreText");
  gameOverScreen.style.display = "flex";
  finalScoreText.textContent = "Your score: " + score;

  document.getElementById("restartBtn").onclick = () => location.reload();
  document.getElementById("infoBtn").onclick = () => window.location.href = "info.html";
}

window.addEventListener('resize', () => {
  if (!gameEnded && gameContainer.style.display !== 'none') {
    basketX = Math.min(window.innerWidth - basket.offsetWidth, basketX);
    basket.style.left = basketX + 'px';
  }
});
