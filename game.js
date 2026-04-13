const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let state = 'MENU', att = 1, camX = 0, currentIdx = 0, paused = false;
let playerColor = '#0ff', totalJumps = 0, wins = 0;

// CHANGED: Welcoming Time is now 'cube' mode
const levels = [
    { name: 'WELCOMING TIME', mode: 'cube', len: 6000, color: '#0cc' },
    { name: 'BACK ON TIME', mode: 'cube', len: 7000, color: '#c0c' },
    { name: 'POLAR DICE', mode: 'cube', len: 8000, color: '#0c0' },
    { name: 'DRY DESERT', mode: 'cube', len: 10000, color: '#c60' }
];

let p = { x: 250, y: 0, vy: 0, size: 42, rot: 0, isShip: false, isHold: false, flipped: false };
let world = [];

function init() { 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}

window.nav = (id) => {
    document.querySelectorAll('.overlay').forEach(m => m.classList.add('hidden'));
    if(id !== 'none') document.getElementById(id).classList.remove('hidden');
    
    if(id === 'menu-more') {
        document.getElementById('stat-jumps').innerText = totalJumps;
        document.getElementById('stat-wins').innerText = wins;
    }
};

window.setColor = (c) => { playerColor = c; };

window.changeLvl = (dir) => {
    currentIdx = (currentIdx + dir + levels.length) % levels.length;
    document.getElementById('lvl-name').innerText = levels[currentIdx].name;
    document.getElementById('lvl-mode').innerText = "MODE: " + levels[currentIdx].mode.toUpperCase();
};

window.startGame = () => {
    state = 'PLAY'; 
    nav('none');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pause-trigger').classList.remove('hidden');
    resetGame();
};

window.togglePause = (val) => {
    paused = val;
    nav(val ? 'menu-pause' : 'none');
};

function resetGame() {
    camX = 0; p.vy = 0; p.rot = 0; p.flipped = false;
    // Mode check based on level data
    p.isShip = (levels[currentIdx].mode === 'ship');
    p.y = canvas.height * 0.75 - p.size;
    
    world = [];
    const spacing = 900;
    for(let i=1; i<=15; i++) {
        world.push({x: i * spacing, t: 's'}); 
        if(i % 3 === 0) world.push({x: i * spacing + 450, t: 'p'}); 
        if(currentIdx === 3 && i % 2 === 0) world.push({x: i * spacing + 60, t: 's'}); 
    }
}

// --- BUTTON FIX LOGIC ---
function handleGlobalInput(e, isDown) {
    // Check if the user is actually clicking a UI element
    const isUI = e.target.closest('.btn') || 
                 e.target.closest('.arrow') || 
                 e.target.id === 'pause-trigger' ||
                 e.target.tagName === 'BUTTON';

    if (isUI) return; // Ignore input for the game if clicking a button

    if (state === 'PLAY' && !paused) {
        if (isDown) {
            p.isHold = true;
            const floor = canvas.height * 0.75;
            const onSurface = p.flipped ? (p.y <= 75) : (p.y >= floor - p.size - 10);
            if (!p.isShip && onSurface) {
                p.vy = p.flipped ? 1300 : -1300;
                totalJumps++;
            }
        } else {
            p.isHold = false;
        }
    }
}

window.addEventListener('touchstart', (e) => handleGlobalInput(e, true), {passive: false});
window.addEventListener('touchend', (e) => handleGlobalInput(e, false));
window.addEventListener('mousedown', (e) => handleGlobalInput(e, true));
window.addEventListener('mouseup', (e) => handleGlobalInput(e, false));

function update(dt) {
    if (state !== 'PLAY' || paused) return;
    let gDir = p.flipped ? -1 : 1;

    if (p.isShip) {
        p.vy += (p.isHold ? -3800 : 2800) * gDir * dt;
        p.rot = p.vy * 0.12;
    } else {
        p.vy += (5000 * gDir) * dt;
        const floor = canvas.height * 0.75;
        if ((!p.flipped && p.y < floor - p.size) || (p.flipped && p.y > 75)) p.rot += 550 * dt;
        else p.rot = Math.round(p.rot / 90) * 90;
    }

    p.y += p.vy * dt; camX += 800 * dt;
    const floor = canvas.height * 0.75;
    
    if (!p.flipped && p.y > floor - p.size) { p.y = floor - p.size; p.vy = 0; }
    if (p.flipped && p.y < 75) { p.y = 75; p.vy = 0; }

    world.forEach(obj => {
        let ox = obj.x - camX + p.x;
        let oy = obj.y || (p.flipped ? 75 : floor - 50);
        if (p.x < ox + 42 && p.x + 38 > ox && p.y < oy + 50 && p.y + 38 > oy) {
            if (obj.t === 's') { 
                att++; 
                document.getElementById('att-val').innerText = att; 
                resetGame(); 
            } else if (obj.t === 'p') { 
                p.flipped = !p.flipped; 
                obj.x = -9999; 
            }
        }
    });

    let progress = Math.min(Math.floor((camX / levels[currentIdx].len) * 100), 100);
    document.getElementById('progress-val').innerText = progress + "%";
    if(progress >= 100) { 
        wins++; 
        state = 'MENU'; 
        nav('menu-home'); 
        alert("LEVEL COMPLETE!"); 
    }
}

function draw() {
    ctx.fillStyle = '#000'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const floor = canvas.height * 0.75;
    ctx.fillStyle = levels[currentIdx].color;
    ctx.fillRect(0, floor, canvas.width, 10);
    ctx.fillRect(0, 75, canvas.width, 10);

    if (state === 'PLAY') {
        ctx.save();
        ctx.translate(p.x + 21, p.y + 21); 
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = playerColor; 
        ctx.fillRect(-21, -21, 42, 42);
        ctx.strokeStyle = "white"; 
        ctx.lineWidth = 3; 
        ctx.strokeRect(-21, -21, 42, 42);
        ctx.restore();

        world.forEach(obj => {
            let ox = obj.x - camX + p.x;
            let oy = obj.y || (p.flipped ? 75 : floor);
            if (obj.t === 's') {
                ctx.fillStyle = '#ff3366'; ctx.beginPath();
                ctx.moveTo(ox, oy); ctx.lineTo(ox+25, oy - (p.flipped ? -50 : 50)); ctx.lineTo(ox+50, oy); ctx.fill();
            } else if (obj.t === 'p') {
                ctx.fillStyle = '#00ff66'; ctx.fillRect(ox, 75, 30, floor - 75);
            }
        });
    }
}

function loop(t) {
    let dt = Math.min((t - (this.lt || t)) / 1000, 0.016);
    this.lt = t; 
    update(dt); 
    draw();
    requestAnimationFrame(loop);
}

init(); 
requestAnimationFrame(loop); 
window.onresize = init;
