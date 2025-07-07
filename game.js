/* ---------- ① 先にプレイヤーを宣言 ---------- */
const player = { x: 0, y: 0, w: 40, h: 40 };   // x, y は後で設定

/* ---------- ② そのあとで canvas/ctx を取得 ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

/* ---------- ③ リサイズ処理 ---------- */
function resize () {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  if (player) player.y = canvas.height - 60;   // 安全チェック
}
window.addEventListener('resize', resize);
resize();

/* ---------- 以下は元のまま ---------- */
player.x = canvas.width / 2;   // 初期位置を中央に

let bullets = [];
let enemies = [];
let lastBullet = 0;
let lastEnemy  = 0;
let score      = 0;
let gameOver   = false;
const scoreEl   = document.getElementById('score');
const messageEl = document.getElementById('message');

canvas.addEventListener(
  'touchmove',
  e => {
    const t = e.touches[0];
    player.x = t.clientX;
    e.preventDefault();
  },
  { passive: false }
);
canvas.addEventListener('touchstart', () => { if (gameOver) reset(); });

function shoot() {
  bullets.push({ x: player.x, y: player.y - 20, w: 4, h: 12 });
}
function spawnEnemy() {
  const size = 30 + Math.random() * 20;
  const x    = Math.random() * (canvas.width - size);
  enemies.push({ x, y: -size, w: size, h: size });
}
function rectHit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
function reset() {
  bullets = [];
  enemies = [];
  score   = 0;
  scoreEl.textContent = score;
  gameOver = false;
  messageEl.classList.add('hidden');
}

/* ---------- メインループ ---------- */
let lastTime = performance.now();
function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  if (!gameOver) update(dt, now);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function update(dt, now) {
  if (now - lastBullet > 200)  { shoot();       lastBullet = now; }
  if (now - lastEnemy  > 1000) { spawnEnemy();  lastEnemy  = now; }

  bullets.forEach(b => (b.y -= 400 * dt));
  bullets = bullets.filter(b => b.y + b.h > 0);

  enemies.forEach(e => (e.y += 100 * dt));
  enemies = enemies.filter(e => e.y - e.h < canvas.height);

  enemies.forEach((e, ei) => {
    bullets.forEach((b, bi) => {
      if (rectHit(b, e)) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score++;
        scoreEl.textContent = score;
      }
    });
    if (rectHit(e, player)) {
      gameOver = true;
      messageEl.classList.remove('hidden');
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* プレイヤー */
  ctx.fillStyle = 'cyan';
  ctx.fillRect(
    player.x - player.w / 2,
    player.y - player.h / 2,
    player.w,
    player.h
  );

  /* 弾 */
  ctx.fillStyle = 'red';
  bullets.forEach(b =>
    ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)
  );

  /* 敵 */
  ctx.fillStyle = 'yellow';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));
}

