// --- Persistence ---
let gameData = JSON.parse(localStorage.getItem('GDOdysseyData')) || { totalJumps: 0, wins: 0, playerColor: '#0ff', attempts: 1 };
function save() { localStorage.setItem('GDOdysseyData', JSON.stringify(gameData)); }

// --- Temporary Session Flags (Wiped on reload) ---
let noclip = false;
let sessionSpeedMult = 1;

const levels = [
    { name: 'WELCOMING TIME', len: 10000, color: '#0cc', map: [[800,'s'],[1400,'s'],[2000,'s'],[2600,'s'],[3200,'p'],[4000,'s'],[4800,'s'],[5500,'s']] },
    { name: 'BACK ON TIME', len: 15000, color: '#c0c', map: [[1000,'s'],[1800,'s'],[2600,'p'],[3400,'s'],[4200,'s'],[5000,'s'],[5800,'p'],[6500,'s']] }
];

let state='MENU', camX=0, currentIdx=0, paused=false;
const canvas=document.getElementById('gameCanvas'), ctx=canvas.getContext('2d');
let p = { x: 250, y: 0, vy: 0, size: 42, rot: 0, flipped: false, isHold: false };
let world = [];

function init() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }

window.nav = (id) => {
    document.querySelectorAll('.overlay').forEach(m=>m.classList.add('hidden'));
    if(id!=='none') document.getElementById(id).classList.remove('hidden');
    document.getElementById('stat-jumps').innerText = gameData.totalJumps;
    document.getElementById('stat-wins').innerText = gameData.wins;
};

window.changeLvl = (dir) => {
    currentIdx = (currentIdx + dir + levels.length) % levels.length;
    document.getElementById('lvl-name').innerText = levels[currentIdx].name;
};

window.openDevTerminal = () => {
    let pass = prompt("Enter Dev Key:");
    if(pass === "7952") {
        let cmd = prompt("Terminal: noclip, speedup, resetstats, setwins").toLowerCase();
        if(cmd === "noclip") { noclip = !noclip; alert("NoClip: " + noclip); }
        if(cmd === "speedup") { sessionSpeedMult = 1.5; alert("Speed Boost Active"); }
        if(cmd === "resetstats") { gameData = {totalJumps:0, wins:0, playerColor:'#0ff', attempts:1}; save(); location.reload(); }
        if(cmd === "setwins") { gameData.wins = parseInt(prompt("Set wins to:")); save(); }
    } else { alert("Unauthorized."); }
};

window.togglePause = (val) => { paused = val; nav(val ? 'menu-home' : 'none'); };

window.startGame = () => { 
    state='PLAY'; nav('none'); 
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pause-trigger').classList.remove('hidden');
    resetGame(); 
};

function resetGame() {
    camX=0; p.vy=0; p.rot=0; p.flipped=false;
    p.y = canvas.height*0.75 - p.size;
    world = levels[currentIdx].map.map(o => ({x: o[0], t: o[1]}));
    document.getElementById('att-val').innerText = gameData.attempts;
}

function handleJump(isDown, e) {
    if(e && e.target.closest('.btn, .arrow, button')) return;
    p.isHold = isDown;
    if(state === 'PLAY' && isDown && !paused) {
        const floor = canvas.height*0.75;
        const onSurface = p.flipped ? (p.y <= 75) : (p.y >= floor - p.size - 8);
        if(onSurface) { p.vy = p.flipped ? 1150 : -1150; gameData.totalJumps++; save(); }
    }
}

window.addEventListener('touchstart', (e) => handleJump(true, e));
window.addEventListener('touchend', (e) => handleJump(false, e));

function update(dt) {
    if(state!=='PLAY' || paused) return;
    p.vy += 4800 * (p.flipped ? -1 : 1) * dt;
    p.y += p.vy * dt; 
    camX += (750 * sessionSpeedMult) * dt; 

    const floor = canvas.height*0.75;
    if(!p.flipped && p.y > floor-p.size) { p.y=floor-p.size; p.vy=0; p.rot=Math.round(p.rot/90)*90; }
    else if(p.flipped && p.y < 75) { p.y=75; p.vy=0; p.rot=Math.round(p.rot/90)*90; }
    else { p.rot += 480 * dt; }

    if(!noclip) {
        world.forEach(o => {
            let ox = o.x - camX + p.x;
            let oy = p.flipped ? 75 : floor;
            // Precise Hitbox Collision
            if(p.x < ox+40 && p.x+35 > ox && Math.abs(p.y - (p.flipped ? 75 : floor-45)) < 40) {
                if(o.t==='s') { gameData.attempts++; save(); resetGame(); }
                if(o.t==='p') { p.flipped=!p.flipped; o.x=-9999; }
            }
        });
    }

    let prog = Math.min(Math.floor((camX/levels[currentIdx].len)*100), 100);
    document.getElementById('progress-val').innerText = prog + "%";
    if(prog >= 100) { gameData.wins++; save(); state='MENU'; nav('menu-home'); }
}

function draw() {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    const floor = canvas.height*0.75;
    ctx.fillStyle=levels[currentIdx].color; ctx.fillRect(0,floor,canvas.width,12); ctx.fillRect(0,75,canvas.width,12);
    if(state==='PLAY') {
        ctx.save(); ctx.translate(p.x+21, p.y+21); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle=gameData.playerColor; ctx.fillRect(-21,-21,42,42);
        if(noclip) { ctx.strokeStyle = 'lime'; ctx.lineWidth = 2; ctx.strokeRect(-21,-21,42,42); }
        ctx.restore();
        world.forEach(o => {
            let ox = o.x - camX + p.x;
            if(o.t==='s') { 
                ctx.fillStyle='#ff3366'; ctx.beginPath(); 
                ctx.moveTo(ox, p.flipped?75:floor); ctx.lineTo(ox+25, p.flipped?125:floor-50); ctx.lineTo(ox+50, p.flipped?75:floor); ctx.fill(); 
            }
        });
    }
}

function loop(t) { update(Math.min((t-(this.lt||t))/1000,0.016)); draw(); this.lt=t; requestAnimationFrame(loop); }
init(); requestAnimationFrame(loop); window.onresize=init;
