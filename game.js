// --- CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDEw8iPR12evpKzHBQmYnlcTdoYD3pK-xc",
    authDomain: "geometry-dash-odessy.firebaseapp.com",
    projectId: "geometry-dash-odessy",
    storageBucket: "geometry-dash-odessy.firebasestorage.app",
    messagingSenderId: "824100531511",
    appId: "1:824100531511:web:b25f7b5e688c425cd2feb2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

// --- ENGINE STATE ---
let state = "HOME"; 
let cameraX = 0;
let user = null;

const player = {
    x: 100, y: 100, w: 50, h: 50,
    color: "#00FFCC",
    vY: 0, gravity: 1.2, jump: -19,
    grounded: false, speed: 7
};

// --- LEVEL OBJECTS ---
const blocks = [
    {x: 500, y: 0, w: 200, h: 60},
    {x: 850, y: 0, w: 100, h: 120},
    {x: 1200, y: 100, w: 300, h: 40},
    {x: 1700, y: 0, w: 80, h: 80}
];

function setup() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}

// --- PHYSICS (ANTI-CLIPPING) ---
function update() {
    if (state !== "PLAYING") return;

    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floorLimit = window.innerHeight - 100;
    player.grounded = false;

    // Floor Collision
    if (player.y + player.h > floorLimit) {
        player.y = floorLimit - player.h;
        player.vY = 0;
        player.grounded = true;
    }

    // Solid Block Collision
    blocks.forEach(b => {
        const bTop = floorLimit - b.h - b.y;
        const bBottom = floorLimit - b.y;
        
        // Vertical Check (Landing on top)
        if (player.x + player.w > b.x && player.x < b.x + b.w) {
            if (player.y + player.h > bTop && player.y + player.h < bBottom && player.vY >= 0) {
                player.y = bTop - player.h;
                player.vY = 0;
                player.grounded = true;
            }
            // Horizontal Check (Hitting the side)
            else if (player.y + player.h > bTop + 5 && player.x + player.w > b.x && player.x < b.x + 10) {
                reset();
            }
        }
    });

    cameraX = player.x - 150;
}

function reset() {
    player.x = 100; player.y = 100; player.vY = 0;
    state = "HOME";
}

// --- RENDERER ---
function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    if (state === "HOME") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 50px sans-serif";
        ctx.fillText("ODYSSEY", w/2, 150);
        
        ctx.strokeStyle = player.color; ctx.lineWidth = 4;
        ctx.strokeRect(w/2 - 100, 300, 200, 80);
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("PLAY", w/2, 348);
    } else if (state === "PLAYING") {
        ctx.save();
        ctx.translate(-cameraX, 0);
        
        // World
        ctx.fillStyle = "#111";
        ctx.fillRect(cameraX, h - 100, w, 100);
        ctx.fillStyle = "#333";
        blocks.forEach(b => ctx.fillRect(b.x, h - 100 - b.h - b.y, b.w, b.h));

        // Player
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 15; ctx.shadowColor = player.color;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.restore();
    }
    requestAnimationFrame(draw);
}

// --- INPUT ---
function input(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;

    if (state === "HOME") {
        if (x > window.innerWidth/2 - 100 && x < window.innerWidth/2 + 100 && y > 300 && y < 380) state = "PLAYING";
    } else if (state === "PLAYING" && player.grounded) {
        player.vY = player.jump;
    }
}

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); input(e); }, {passive: false});
canvas.addEventListener('mousedown', input);
window.addEventListener('resize', setup);

setup();
setInterval(update, 1000/60);
draw();
