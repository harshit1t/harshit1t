(() => {
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');

  const size = 20; // cell size
  const cells = canvas.width / size;
  const speedBase = 110; // ms
  let speed = speedBase;

  let snake, dir, food, lastTime, acc, running, score;

  function init() {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = { x: 1, y: 0 };
    placeFood();
    lastTime = 0; acc = 0; running = true; score = 0; speed = speedBase;
    updateScore();
  }

  function placeFood() {
    while (true) {
      const f = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
      if (!snake.some(s => s.x === f.x && s.y === f.y)) { food = f; return; }
    }
  }

  function updateScore() { scoreEl.textContent = 'Score: ' + score; }

  function step(ts) {
    if (!running) return; // paused
    requestAnimationFrame(step);
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime; lastTime = ts; acc += dt;
    if (acc < speed) return;
    acc = 0;
    move();
    draw();
  }

  function move() {
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // wrap edges
    head.x = (head.x + cells) % cells;
    head.y = (head.y + cells) % cells;
    // collision with self
    if (snake.some((s, i) => i && s.x === head.x && s.y === head.y)) {
      running = false; flashGameOver(); return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10; updateScore(); speed = Math.max(50, speed * 0.97); placeFood();
    } else {
      snake.pop();
    }
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // grid (subtle)
    ctx.lineWidth = 1; ctx.strokeStyle = '#21262d';
    for (let i=0;i<=cells;i++){ ctx.beginPath(); ctx.moveTo(i*size,0); ctx.lineTo(i*size,canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*size); ctx.lineTo(canvas.width,i*size); ctx.stroke(); }
    // food
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(food.x*size, food.y*size, size, size);
    // snake
    snake.forEach((seg,i)=>{
      ctx.fillStyle = i===0 ? '#3fb950' : '#2ea043';
      ctx.fillRect(seg.x*size, seg.y*size, size, size);
    });
  }

  function flashGameOver() {
    scoreEl.textContent = 'Game Over — ' + score + ' (Press Restart)';
  }

  function changeDir(x,y) {
    // prevent reverse
    if (-x === dir.x && -y === dir.y) return;
    dir = { x, y };
  }

  window.addEventListener('keydown', e => {
    switch(e.key){
      case 'ArrowUp': case 'w': changeDir(0,-1); break;
      case 'ArrowDown': case 's': changeDir(0,1); break;
      case 'ArrowLeft': case 'a': changeDir(-1,0); break;
      case 'ArrowRight': case 'd': changeDir(1,0); break;
      case ' ': togglePause(); break;
    }
  });

  // Touch / swipe
  let touchStart;
  canvas.addEventListener('touchstart', e => { touchStart = e.touches[0]; });
  canvas.addEventListener('touchmove', e => {
    if (!touchStart) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.clientX;
    const dy = t.clientY - touchStart.clientY;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) changeDir(dx>0?1:-1,0); else changeDir(0,dy>0?1:-1);
      touchStart = null;
    }
  });

  function togglePause(){
    running = !running;
    pauseBtn.textContent = running? 'Pause' : 'Resume';
    pauseBtn.setAttribute('aria-pressed', String(!running));
    if (running) { lastTime = 0; requestAnimationFrame(step); }
  }

  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', () => { init(); draw(); requestAnimationFrame(step); });

  init();
  draw();
  requestAnimationFrame(step);
})();
