const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let state = 'MENU', att = 1, camX = 0, currentIdx = 0;

const levelData = [
    { name: 'WELCOMING TIME', stars: 1, length: 5000, mode: 'ship' },
    { name: 'BACK ON TIME', stars: 2, length: 6000, mode: 'cube' },
    { name: 'POLAR DICE', stars: 3, length: 7000, mode: 'cube' },
    { name: 'DRY DESERT', stars: 4, length: 8500, mode: 'cube' }
];

let bests = [0, 0, 0, 0];
const SPEED = 700, GRAVITY = 4900, JUMP = -1180;
let p = { x: 300, y: 0, vy: 0, size: 40, rot: 0, isShip: false, isHold: false, onG: false, flipped: false };
let world = [];

function init() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}

window.nav = function(id) {
    document.querySelectorAll('.overlay').forEach(m => m.classList.add('hidden'));
    if(id !== 'none') {
        document.getElementById(id).classList.remove('hidden');
        if(id === 'menu-levels') updateUI();
    }
};

window.changeLvl = function(dir) {
    currentIdx = (currentIdx + dir + levelData.length) % levelData.length;
    updateUI();
};

function updateUI() {
    const l = levelData[currentIdx];
    document.getElementById('lvl-name').innerText = l.name;
    document.getElementById('lvl-stars').innerText = "⭐ " + l.stars;
    document.getElementById('lvl-best').innerText = "BEST: " + bests[currentIdx] + "%";
}

window.startGame = function() {
    state = 'PLAY'; 
    window.nav('none');
    document.getElementById('hud').classList.remove('hidden');
    resetLvl();
};

function resetLvl() {
    const l = levelData[currentIdx];
    camX = 0; p.vy = 0; p.rot = 0; p.flipped = false;
    p.isShip = (l.mode === 'ship');
    const floor = canvas.height * 0.75;
    p.y = floor - p.size;
    world = currentIdx === 0 ? [{x: 1000, t: 's'}, {x: 1600, t: 's'}] : 
            currentIdx === 1 ? [{x: 900, t: 'pad'}, {x: 1500, t: 's'}] :
            currentIdx === 2 ? [{x: 1100, t: 'orb'}, {x: 1800, t: 's'}] :
                               [{x: 1000, t: 'portal'}, {x: 1600, t: 's', y: 150}];
}

function update(dt) {
    if (state !== 'PLAY') return;
    let gDir = p.flipped ? -1 : 1;
    if (p.isShip) { p.vy += (p.isHold ? -3900 : 3100) * gDir * dt; p.rot = p.vy * 0.1; }
    else { p.vy += (GRAVITY * gDir) * dt; if (!p.onG) p.rot += 500 * dt; else p.rot = Math.round(p.rot / 90) * 90; }
    
    p.y += p.vy * dt; camX += SPEED * dt; p.onG = false;
    const floor = canvas.height * 0.75;
    if (!p.flipped && p.y > floor - p.size) { p.y = floor - p.size; p.vy = 0; p.onG = true; }
    if (p.flipped && p.y < 60) { p.y = 60; p.vy = 0; p.onG = true; }

    let prog = Math.min(Math.floor((camX / levelData[currentIdx].length) * 100), 100);
    document.getElementById('progress-val').innerText = prog + "%";
    if (prog > bests[currentIdx]) bests[currentIdx] = prog;

    world.forEach(o => {
        let ox = o.x - camX + p.x; let oy = o.y || floor-50;
        if (p.x + 12 < ox + 38 && p.x + p.size - 12 > ox + 12 && p.y + 12 < oy + 38 && p.y + p.size - 12 > oy + 12) {
            if (o.t === 's') die();
            else if (o.t === 'pad') p.vy = JUMP * 1.5 * gDir;
            else if (o.t === 'orb' && p.isHold) { p.vy = JUMP * 1.1 * gDir; p.isHold = false; }
            else if (o.t === 'portal') p.flipped = !p.flipped;
        }
    });
}

function draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const floor = canvas.height * 0.75;
    ctx.strokeStyle = '#0ff'; ctx.lineWidth = 4;
    ctx.strokeRect(0, floor, canvas.width, 2);

    if (state === 'PLAY') {
        ctx.save(); ctx.translate(p.x+p.size/2, p.y+p.size/2); if(p.flipped) ctx.scale(1,-1); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = '#0ff'; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();

        world.forEach(o => {
            let ox = o.x - camX + p.x; let oy = o.y || floor-50;
            if (o.t === 's') { 
                ctx.fillStyle = '#f26'; ctx.beginPath(); ctx.moveTo(ox, floor); ctx.lineTo(ox+25, floor-50); ctx.lineTo(ox+50, floor); ctx.fill(); 
            } else { 
                ctx.fillStyle = o.t==='orb'?'#ff0':o.t==='pad'?'#f0f':'#0f0'; ctx.fillRect(ox, oy, 50, 50); 
            }
        });
    }
}

function die() { att++; document.getElementById('att-val').innerText = att; resetLvl(); }

// --- THE INPUT FIX ---
function handleStart(e) {
    if (e.target.tagName === 'BUTTON') return; // Don't jump when clicking menu buttons
    p.isHold = true;
    if (state === 'PLAY' && !p.isShip && p.onG) p.vy = JUMP * (p.flipped ? -1 : 1);
}

function handleEnd() { p.isHold = false; }

window.addEventListener('mousedown', handleStart);
window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchstart', (e) => { handleStart(e); }, { passive: false });
window.addEventListener('touchend', handleEnd);

function loop(t) { 
    let dt = Math.min((t - (this.lt||t))/1000, 0.016); 
    this.lt = t; update(dt); draw(); 
    requestAnimationFrame(loop); 
}

init(); 
requestAnimationFrame(loop); 
window.onresize = init;
