const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const scoreDisplay = document.getElementById("score");

const box = 20;
let game;
let snake;
let direction;
let food;
let score;

function initGame() {
  snake = [{ x: 15 * box, y: 15 * box }];
  direction = "RIGHT";
  food = randomFood();
  score = 0;
  scoreDisplay.textContent = "Счёт: 0";
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Отрисовка змейки
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Еда
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  if (headX === food.x && headY === food.y) {
    score++;
    food = randomFood();
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  // Проверка столкновений
  if (
    headX < 0 ||
    headY < 0 ||
    headX >= canvas.width ||
    headY >= canvas.height ||
    snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
  ) {
    clearInterval(game);
    startBtn.textContent = "🔁 Начать заново";
    startBtn.style.display = "inline-block";
    return;
  }

  snake.unshift(newHead);
  scoreDisplay.textContent = "Счёт: " + score;
}

startBtn.addEventListener("click", () => {
  initGame();
  startBtn.style.display = "none";
  game = setInterval(draw, 100);
});
