window.addEventListener('load', () => {
  /* ---------- プレイヤー ---------- */
  const player = { x: 0, y: 0, w: 40, h: 40 };

  /* ---------- Canvas ---------- */
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  /* ---------- リサイズ ---------- */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height - 60;
    player.x = canvas.width / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- 変数 ---------- */
  let bullets = [];
  let enemies = [];
  let lastBullet = 0;
  let lastEnemy  = 0;
  const enemyInterval = 1000;      // 一定 1 秒ごとに敵
  let score = 0;
  let gameOver = false;

  const scoreEl   = document.getElementById('score');
  const messageEl = document.getElementById('message');
  const finalScoreEl = document.getElementById('finalScore');

  /* ---------- 入力（タッチ & マウス） ---------- */
  function handleMove(x){ player.x = x; }
  canvas.addEventListener('touchmove', e => {
    handleMove(e.touches[0].clientX); e.preventDefault();
  }, {passive:false});
  canvas.addEventListener('mousemove', e => handleMove(e.clientX));
  canvas.addEventListener('touchstart', () => { if (gameOver) reset(); });
  canvas.addEventListener('mousedown', () => { if (gameOver) reset(); });

  /* ---------- ゲームロジック ---------- */
  function shoot(){ bullets.push({x:player.x,y:player.y-20,w:4,h:12}); }
  function spawnEnemy(){
    const size=30+Math.random()*20;
    const x=Math.random()*(canvas.width-size);
    enemies.push({x:x,y:-size,w:size,h:size});
  }
  function rectHit(a,b){return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;}

  function reset(){
    bullets=[]; enemies=[]; score=0; scoreEl.textContent=score;
    gameOver=false; messageEl.classList.add('hidden');
  }

  let lastTime=performance.now();
  function loop(now){
    const dt=(now-lastTime)/1000; lastTime=now;
    if(!gameOver) update(dt,now);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function update(dt,now){
    if(now-lastBullet>200){ shoot(); lastBullet=now; }
    if(now-lastEnemy>enemyInterval){ spawnEnemy(); lastEnemy=now; }

    bullets.forEach(b=>b.y-=400*dt);
    bullets=bullets.filter(b=>b.y+b.h>0);

    enemies.forEach(e=>e.y+=100*dt);
    enemies=enemies.filter(e=>{
      if(e.y>canvas.height){
        if(score>0) score--;
        scoreEl.textContent=score;
        return false;
      }
      return true;
    });

    enemies.forEach((e,ei)=>{
      bullets.forEach((b,bi)=>{
        if(rectHit(b,e)){
          enemies.splice(ei,1); bullets.splice(bi,1);
          score++; scoreEl.textContent=score;
        }
      });
      if(rectHit(e,player)){
        gameOver=true;
        finalScoreEl.textContent=`SCORE: ${score}`;
        messageEl.classList.remove('hidden');
      }
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // player
    ctx.fillStyle='cyan';
    ctx.fillRect(player.x-player.w/2,player.y-player.h/2,player.w,player.h);

    // bullets
    ctx.fillStyle='red';
    bullets.forEach(b=>ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h));

    // enemies
    ctx.fillStyle='yellow';
    enemies.forEach(e=>ctx.fillRect(e.x,e.y,e.w,e.h));
  }
});
