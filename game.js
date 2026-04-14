// --- Persistence Layer ---
let gameData = JSON.parse(localStorage.getItem('GDOdysseyData')) || {
    totalJumps: 0,
    wins: 0,
    playerColor: '#0ff',
    attempts: 1
};

function saveProgress() { localStorage.setItem('GDOdysseyData', JSON.stringify(gameData)); }

// --- Level Design (Now with specific Cube patterns) ---
const levels = [
    { name: 'WELCOMING TIME', mode: 'cube', len: 8000, color: '#0cc', map: [[800, 's'], [1500, 's'], [2200, 's'], [3000, 'p'], [4000, 's']] },
    { name: 'BACK ON TIME', mode: 'cube', len: 10000, color: '#c0c', map: [[1000, 's'], [2000, 'p'], [3000, 's'], [4000, 's']] },
    { name: 'DRY DESERT', mode: 'cube', len: 12000, color: '#c60', map: [[1200, 's'], [2400, 's'], [3600, 's'], [4800, 'p']] }
];

let state = 'MENU', camX = 0, currentIdx = 0, paused = false, noclip = false;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let p = { x: 250, y: 0, vy: 0, size: 42, rot: 0, isHold: false, flipped: false };
let world = [];

// --- FIX: Navigation & Speed ---
window.changeLvl = (dir) => {
    currentIdx = (currentIdx + dir + levels.length) % levels.length;
    document.getElementById('lvl-name').innerText = levels[currentIdx].name;
};

window.nav = (id) => {
    document.querySelectorAll('.overlay').forEach(m => m.classList.add('hidden'));
    if(id !== 'none') document.getElementById(id).classList.remove('hidden');
};

// --- Secret Developer Mode ---
window.checkDevPassword = () => {
    const pass = prompt("Enter Developer Password:");
    if(pass === "7952") {
        alert("ACCESS GRANTED. Terminal Open.");
        const cmd = prompt("Enter Command: (noclip, setwin, reset)");
        if(cmd === "noclip") { noclip = !noclip; alert("NoClip: " + noclip); }
        if(cmd === "setwin") { gameData.wins += 10; saveProgress(); }
    } else {
        alert("ACCESS DENIED.");
    }
};

function resetGame() {
    camX = 0; p.vy = 0; p.rot = 0; p.flipped = false;
    p.y = canvas.height * 0.75 - p.size;
    world = levels[currentIdx].map.map(obj => ({ x: obj[0], t: obj[1] }));
}

// --- FIX: Button Interaction ---
function handleInput(down, e) {
    if (e && (e.target.closest('.btn') || e.target.closest('.arrow'))) return; 
    p.isHold = down;
    if (state === 'PLAY' && down && !paused) {
        const onFloor = p.flipped ? (p.y <= 75) : (p.y >= (canvas.height * 0.75) - p.size - 5);
        if (onFloor) { p.vy = p.flipped ? 1100 : -1100; gameData.totalJumps++; saveProgress(); }
    }
}

window.addEventListener('touchstart', (e) => handleInput(true, e));
window.addEventListener('touchend', (e) => handleInput(false, e));

function update(dt) {
    if (state !== 'PLAY' || paused) return;
    p.vy += 4500 * (p.flipped ? -1 : 1) * dt; // Gravity
    p.y += p.vy * dt;
    camX += 700 * dt; // FIXED: Slower, more controllable speed

    const floor = canvas.height * 0.75;
    if (!p.flipped && p.y > floor - p.size) { p.y = floor - p.size; p.vy = 0; p.rot = Math.round(p.rot/90)*90; }
    else if (p.flipped && p.y < 75) { p.y = 75; p.vy = 0; p.rot = Math.round(p.rot/90)*90; }
    else { p.rot += 400 * dt; }

    if(!noclip) {
        world.forEach(obj => {
            let ox = obj.x - camX + p.x;
            if (p.x < ox + 40 && p.x + 40 > ox && Math.abs(p.y - (p.flipped ? 75 : floor - 50)) < 40) {
                if(obj.t === 's') { gameData.attempts++; saveProgress(); resetGame(); }
                if(obj.t === 'p') { p.flipped = !p.flipped; obj.x = -9999; }
            }
        });
    }

    if (camX > levels[currentIdx].len) { gameData.wins++; saveProgress(); state = 'MENU'; nav('menu-home'); }
}

function draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const floor = canvas.height * 0.75;
    ctx.fillStyle = levels[currentIdx].color;
    ctx.fillRect(0, floor, canvas.width, 10); ctx.fillRect(0, 75, canvas.width, 10);
    if (state === 'PLAY') {
        ctx.save(); ctx.translate(p.x+21, p.y+21); ctx.rotate(p.rot*Math.PI/180);
        ctx.fillStyle = gameData.playerColor; ctx.fillRect(-21, -21, 42, 42); ctx.restore();
        world.forEach(obj => {
            let ox = obj.x - camX + p.x;
            if (obj.t === 's') { ctx.fillStyle = '#ff3366'; ctx.beginPath(); ctx.moveTo(ox, p.flipped?75:floor); ctx.lineTo(ox+25, p.flipped?125:floor-50); ctx.lineTo(ox+50, p.flipped?75:floor); ctx.fill(); }
        });
    }
}

function loop(t) { update(Math.min((t - (this.lt || t)) / 1000, 0.016)); draw(); this.lt = t; requestAnimationFrame(loop); }
init(); requestAnimationFrame(loop);
