// --- FIREBASE SETUP ---
const firebaseConfig = {
    apiKey: "AIzaSyDEw8iPR12evpKzHBQmYnlcTdoYD3pK-xc",
    authDomain: "geometry-dash-odessy.firebaseapp.com",
    projectId: "geometry-dash-odessy",
    storageBucket: "geometry-dash-odessy.firebasestorage.app",
    messagingSenderId: "824100531511",
    appId: "1:824100531511:web:b25f7b5e688c425cd2feb2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // For Level Editor saving

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

// --- ENGINE STATE ---
let state = "HOME"; 
let currentLevel = 1;
let cameraX = 0;

// 15 COLOR ICON KIT
const colors = ["#00FFCC", "#FF3366", "#FFCC00", "#AA00FF", "#0088FF", "#FF8800", "#00FF00", "#FFFFFF", "#FF00FF", "#444444", "#00FFFF", "#FFFF00", "#CCFF00", "#0066FF", "#FF5555"];
let selectedColor = 0;

const player = {
    x: 100, y: 0, w: 50, h: 50,
    vY: 0, gravity: 1.2, jump: -19,
    grounded: false, speed: 7
};

// LEVELS DATA
const levels = {
    1: [ {x: 600, y: 0, w: 60, h: 60, type: "BLOCK"}, {x: 1000, y: 0, w: 50, h: 50, type: "SPIKE"}, {x: 1400, y: 80, w: 200, h: 40, type: "BLOCK"} ],
    2: [ {x: 500, y: 0, w: 100, h: 100, type: "BLOCK"}, {x: 800, y: 40, w: 50, h: 50, type: "SPIKE"}, {x: 1200, y: 0, w: 300, h: 40, type: "BLOCK"} ]
};

function setup() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}

// --- CORE LOGIC ---
function update() {
    if (state !== "PLAYING") return;

    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floor = window.innerHeight - 100;
    player.grounded = false;

    if (player.y + player.h > floor) {
        player.y = floor - player.h;
        player.vY = 0;
        player.grounded = true;
    }

    // Collision & Spike Logic
    levels[currentLevel].forEach(obj => {
        const objY = floor - obj.h - obj.y;
        if (player.x + player.w > obj.x && player.x < obj.x + obj.w) {
            if (player.y + player.h > objY && player.y < objY + obj.h) {
                if (obj.type === "SPIKE") reset();
                else if (player.vY >= 0 && player.y + player.h < objY + 20) {
                    player.y = objY - player.h;
                    player.vY = 0;
                    player.grounded = true;
                } else {
                    reset(); // Hit side of block
                }
            }
        }
    });

    cameraX = player.x - 150;
    
    // Progress Bar (Level is roughly 3000px long)
    const progress = Math.min((player.x / 3000) * 100, 100);
    document.getElementById('progress-bar').style.width = progress + "%";
    if (progress >= 100) { state = "HOME"; reset(); }
}

function reset() {
    player.x = 100; player.y = 0; player.vY = 0;
}

// --- UI DRAWING ---
function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    if (state === "HOME") {
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.font = "bold 60px sans-serif"; ctx.fillText("ODYSSEY", w/2, 150);
        
        drawBtn(w/2 - 120, 250, 240, 70, "LEVEL 1", colors[selectedColor]);
        drawBtn(w/2 - 120, 350, 240, 70, "LEVEL 2", "#333");
        drawBtn(w/2 - 120, 450, 240, 70, "ICON KIT", "#555");
        drawBtn(w/2 - 120, 550, 240, 70, "EDITOR", "#222");

    } else if (state === "ICON_KIT") {
        ctx.fillStyle = "white"; ctx.fillText("SELECT COLOR", w/2, 100);
        const size = 50;
        colors.forEach((c, i) => {
            ctx.fillStyle = c;
            const col = i % 5;
            const row = Math.floor(i / 5);
            ctx.fillRect(w/2 - 140 + (col * 60), 180 + (row * 60), size, size);
            if (selectedColor === i) {
                ctx.strokeStyle = "white"; ctx.lineWidth = 3;
                ctx.strokeRect(w/2 - 140 + (col * 60), 180 + (row * 60), size, size);
            }
        });
        drawBtn(w/2 - 100, 450, 200, 60, "BACK", "#333");
    } else if (state === "PLAYING") {
        renderGame(w, h);
    }
    requestAnimationFrame(draw);
}

function renderGame(w, h) {
    ctx.save();
    ctx.translate(-cameraX, 0);
    ctx.fillStyle = "#111"; ctx.fillRect(cameraX, h-100, w, 100);
    
    levels[currentLevel].forEach(obj => {
        ctx.fillStyle = obj.type === "SPIKE" ? "#FF3366" : "#333";
        ctx.fillRect(obj.x, h - 100 - obj.h - obj.y, obj.w, obj.h);
    });

    ctx.fillStyle = colors[selectedColor];
    ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.restore();
}

function drawBtn(x, y, w, h, txt, clr) {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 15); ctx.fill();
    ctx.strokeStyle = clr; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "white"; ctx.font = "bold 20px sans-serif";
    ctx.fillText(txt, x + w/2, y + h/2 + 8);
}

// --- INTERACTION ---
function handle(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    const w = window.innerWidth;

    if (state === "HOME") {
        if (y > 250 && y < 320) { state = "PLAYING"; currentLevel = 1; }
        if (y > 350 && y < 420) { state = "PLAYING"; currentLevel = 2; }
        if (y > 450 && y < 520) state = "ICON_KIT";
        if (y > 550 && y < 620) alert("Editor Opening..."); 
    } else if (state === "ICON_KIT") {
        if (y > 450 && y < 510) state = "HOME";
        // Logic for color grid selection goes here
    } else if (state === "PLAYING" && player.grounded) {
        player.vY = player.jump;
    }
}

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handle(e); }, {passive: false});
canvas.addEventListener('mousedown', handle);
window.addEventListener('resize', setup);
setup();
setInterval(update, 1000/60);
draw();
