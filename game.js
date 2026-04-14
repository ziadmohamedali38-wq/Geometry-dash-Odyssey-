let gameData = JSON.parse(localStorage.getItem('GDOdysseyData')) || { totalJumps: 0, wins: 0, playerColor: '#0ff', attempts: 1 };
function save() { localStorage.setItem('GDOdysseyData', JSON.stringify(gameData)); }

const levels = [
    { name: 'WELCOMING TIME', len: 10000, color: '#0cc', map: [[800,'s'],[1400,'s'],[2000,'s'],[2800,'p'],[3600,'s'],[4500,'s']] },
    { name: 'BACK ON TIME', len: 12000, color: '#c0c', map: [[1000,'s'],[1800,'s'],[2600,'p'],[3400,'s'],[4200,'s']] }
];

let state='MENU', camX=0, currentIdx=0, paused=false, noclip=false;
const canvas=document.getElementById('gameCanvas'), ctx=canvas.getContext('2d');
let p = { x: 250, y: 0, vy: 0, size: 42, rot: 0, flipped: false };
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

window.checkDevPassword = () => {
    let pass = prompt("Password:");
    if(pass === "7952") {
        let cmd = prompt("Dev Console: (noclip, reset, jump100)");
        if(cmd === "noclip") { noclip = !noclip; alert("Noclip: " + noclip); }
        if(cmd === "jump100") { gameData.totalJumps += 100; save(); }
    }
};

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

window.addEventListener('touchstart', (e) => {
    if(e.target.closest('.btn, .arrow, #pause-trigger')) return;
    if(state==='PLAY' && !paused) {
        const floor = canvas.height*0.75;
        const onSurface = p.flipped ? (p.y <= 75) : (p.y >= floor - p.size - 5);
        if(onSurface) { p.vy = p.flipped ? 1100 : -1100; gameData.totalJumps++; save(); }
    }
});

function update(dt) {
    if(state!=='PLAY' || paused) return;
    p.vy += 4500 * (p.flipped ? -1 : 1) * dt;
    p.y += p.vy * dt; camX += 750 * dt; // Balanced speed

    const floor = canvas.height*0.75;
    if(!p.flipped && p.y > floor-p.size) { p.y=floor-p.size; p.vy=0; p.rot=Math.round(p.rot/90)*90; }
    else if(p.flipped && p.y < 75) { p.y=75; p.vy=0; p.rot=Math.round(p.rot/90)*90; }
    else { p.rot += 450 * dt; }

    if(!noclip) {
        world.forEach(o => {
            let ox = o.x - camX + p.x;
            if(p.x < ox+40 && p.x+40 > ox && Math.abs(p.y - (p.flipped?75:floor-50)) < 40) {
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
    ctx.fillStyle=levels[currentIdx].color; ctx.fillRect(0,floor,canvas.width,10); ctx.fillRect(0,75,canvas.width,10);
    if(state==='PLAY') {
        ctx.save(); ctx.translate(p.x+21, p.y+21); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle=gameData.playerColor; ctx.fillRect(-21,-21,42,42); ctx.restore();
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
