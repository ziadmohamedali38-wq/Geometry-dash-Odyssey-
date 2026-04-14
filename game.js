// --- Persistence & Account Layer ---
let gameData = JSON.parse(localStorage.getItem('GDOdysseyData')) || {
    totalJumps: 0,
    wins: 0,
    playerColor: '#0ff',
    attempts: 1,
    unlockedLevels: 1
};

function saveProgress() {
    localStorage.setItem('GDOdysseyData', JSON.stringify(gameData));
}

// --- Median Social Login API ---
window.loginUser = () => {
    // Triggers Median's native Google login
    window.location.href = 'median://social-login/google';
};

window.median_social_login_callback = (data) => {
    if(data.status === 'success') {
        gameData.userName = data.name;
        gameData.userId = data.id;
        saveProgress();
        alert("Welcome, " + data.name + "! Progress synced.");
    }
};

// --- Level Design (Remade for unique patterns) ---
// Type: 's' = Spike, 'p' = Portal, 'b' = Block/Platform
const levels = [
    { 
        name: 'WELCOMING TIME', mode: 'cube', len: 12000, color: '#0cc',
        map: [
            [800, 's'], [1100, 's'], [1600, 's'], [2100, 'p'], 
            [2600, 's'], [3000, 's'], [3500, 's'], [4200, 's'],
            [5000, 'p'], [5800, 's'], [6500, 's'], [7200, 's']
        ] 
    },
    { 
        name: 'BACK ON TIME', mode: 'cube', len: 15000, color: '#c0c',
        map: [
            [900, 's'], [1300, 's'], [1800, 'p'], [2400, 's'], [2500, 's'],
            [3200, 's'], [3900, 'p'], [4600, 's'], [5500, 's'], [6000, 's']
        ]
    }
];

// --- Engine Core ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let state = 'MENU', camX = 0, currentIdx = 0, paused = false;
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
        document.getElementById('stat-jumps').innerText = gameData.totalJumps;
        document.getElementById('stat-wins').innerText = gameData.wins;
    }
};

window.startGame = () => {
    state = 'PLAY'; 
    nav('none');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pause-trigger').classList.remove('hidden');
    resetGame();
};

function resetGame() {
    camX = 0; p.vy = 0; p.rot = 0; p.flipped = false;
    p.isShip = (levels[currentIdx].mode === 'ship');
    p.y = canvas.height * 0.75 - p.size;
    
    // Convert level map to world objects
    world = levels[currentIdx].map.map(obj => ({ x: obj[0], t: obj[1] }));
    document.getElementById('att-val').innerText = gameData.attempts;
}

function handleInput(down) {
    if (state !== 'PLAY' || paused) return;
    p.isHold = down;
    const floor = canvas.height * 0.75;
    const onSurface = p.flipped ? (p.y <= 75) : (p.y >= floor - p.size - 10);
    
    if (down && onSurface) {
        p.vy = p.flipped ? 1300 : -1300;
        gameData.totalJumps++;
        saveProgress();
    }
}

// Fixed listeners for Median
window.addEventListener('touchstart', (e) => { 
    if(!e.target.closest('.btn, .arrow, #pause-trigger')) handleInput(true); 
}, {passive: false});
window.addEventListener('touchend', () => handleInput(false));

function update(dt) {
    if (state !== 'PLAY' || paused) return;
    let gDir = p.flipped ? -1 : 1;

    // Physics
    p.vy += 5000 * gDir * dt;
    p.y += p.vy * dt; camX += 850 * dt; // Speed up slightly
    
    const floor = canvas.height * 0.75;
    if (!p.flipped && p.y > floor - p.size) { 
        p.y = floor - p.size; p.vy = 0; 
        p.rot = Math.round(p.rot / 90) * 90;
    } else if (p.flipped && p.y < 75) { 
        p.y = 75; p.vy = 0; 
        p.rot = Math.round(p.rot / 90) * 90;
    } else {
        p.rot += 550 * dt;
    }

    // Map Collision
    world.forEach(obj => {
        let ox = obj.x - camX + p.x;
        let oy = p.flipped ? 75 : floor - 50;
        if (p.x < ox + 40 && p.x + 40 > ox && p.y < oy + 50 && p.y + 50 > oy) {
            if (obj.t === 's') { 
                gameData.attempts++; 
                saveProgress(); 
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
        gameData.wins++; 
        saveProgress();
        state = 'MENU'; 
        nav('menu-home'); 
        alert("LEVEL COMPLETE!"); 
    }
}

function draw() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const floor = canvas.height * 0.75;
    ctx.fillStyle = levels[currentIdx].color;
    ctx.fillRect(0, floor, canvas.width, 12);
    ctx.fillRect(0, 75, canvas.width, 12);

    if (state === 'PLAY') {
        // Draw Player
        ctx.save();
        ctx.translate(p.x + 21, p.y + 21); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = gameData.playerColor; ctx.fillRect(-21, -21, 42, 42);
        ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.strokeRect(-21, -21, 42, 42);
        ctx.restore();

        // Draw Map Objects
        world.forEach(obj => {
            let ox = obj.x - camX + p.x;
            if (ox < -100 || ox > canvas.width + 100) return;
            let oy = p.flipped ? 75 : floor;
            
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
    this.lt = t; update(dt); draw();
    requestAnimationFrame(loop);
}

init(); requestAnimationFrame(loop); window.onresize = init;
