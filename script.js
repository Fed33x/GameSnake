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
  // Очистка экрана
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Рисуем сетку для эффекта
  ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= canvas.width; i += box) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= canvas.height; i += box) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Отрисовка еды с эффектом свечения
  const foodGradient = ctx.createRadialGradient(
    food.x + box/2, food.y + box/2, 0,
    food.x + box/2, food.y + box/2, box
  );
  foodGradient.addColorStop(0, "#ff006e");
  foodGradient.addColorStop(0.5, "#ff1744");
  foodGradient.addColorStop(1, "#d50000");
  
  ctx.fillStyle = foodGradient;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ff006e";
  ctx.fillRect(food.x + 2, food.y + 2, box - 4, box - 4);
  
  // Внутреннее свечение еды
  ctx.fillStyle = "#ff9fdb";
  ctx.fillRect(food.x + 6, food.y + 6, box - 12, box - 12);
  ctx.shadowBlur = 0;

  // Отрисовка змейки с градиентом и свечением
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    const progress = i / snake.length;
    
    if (i === 0) {
      // Голова змейки
      const headGradient = ctx.createLinearGradient(
        segment.x, segment.y,
        segment.x + box, segment.y + box
      );
      headGradient.addColorStop(0, "#00f2fe");
      headGradient.addColorStop(1, "#667eea");
      
      ctx.fillStyle = headGradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f2fe";
      ctx.fillRect(segment.x + 1, segment.y + 1, box - 2, box - 2);
      
      // Глаза
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      const eyeSize = 4;
      if (direction === "RIGHT") {
        ctx.fillRect(segment.x + box - 8, segment.y + 5, eyeSize, eyeSize);
        ctx.fillRect(segment.x + box - 8, segment.y + box - 9, eyeSize, eyeSize);
      } else if (direction === "LEFT") {
        ctx.fillRect(segment.x + 4, segment.y + 5, eyeSize, eyeSize);
        ctx.fillRect(segment.x + 4, segment.y + box - 9, eyeSize, eyeSize);
      } else if (direction === "UP") {
        ctx.fillRect(segment.x + 5, segment.y + 4, eyeSize, eyeSize);
        ctx.fillRect(segment.x + box - 9, segment.y + 4, eyeSize, eyeSize);
      } else if (direction === "DOWN") {
        ctx.fillRect(segment.x + 5, segment.y + box - 8, eyeSize, eyeSize);
        ctx.fillRect(segment.x + box - 9, segment.y + box - 8, eyeSize, eyeSize);
      }
    } else {
      // Тело змейки с градиентом
      const bodyGradient = ctx.createLinearGradient(
        segment.x, segment.y,
        segment.x + box, segment.y + box
      );
      const r = Math.floor(0 + (102 - 0) * progress);
      const g = Math.floor(242 + (126 - 242) * progress);
      const b = Math.floor(254 + (234 - 254) * progress);
      
      bodyGradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      bodyGradient.addColorStop(1, `rgb(${Math.max(0, r-30)}, ${Math.max(0, g-30)}, ${Math.max(0, b-30)})`);
      
      ctx.fillStyle = bodyGradient;
      ctx.shadowBlur = 10 * (1 - progress);
      ctx.shadowColor = "#00f2fe";
      ctx.fillRect(segment.x + 2, segment.y + 2, box - 4, box - 4);
    }
  }
  ctx.shadowBlur = 0;

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  if (headX === food.x && headY === food.y) {
    score++;
    
    // Эффект при поедании еды
    ctx.fillStyle = "rgba(0, 242, 254, 0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#00f2fe";
    ctx.fillRect(food.x - 10, food.y - 10, box + 20, box + 20);
    ctx.shadowBlur = 0;
    
    food = randomFood();
    // Проверяем, чтобы еда не появилась на змейке
    while (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
      food = randomFood();
    }
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
    
    // Эффект взрыва при проигрыше
    ctx.fillStyle = "rgba(255, 0, 110, 0.8)";
    ctx.shadowBlur = 50;
    ctx.shadowColor = "#ff006e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
    
    setTimeout(() => {
      startBtn.textContent = "🔁 Начать заново";
      startBtn.style.display = "inline-block";
    }, 500);
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
