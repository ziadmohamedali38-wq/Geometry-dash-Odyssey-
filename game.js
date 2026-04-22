const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiBar = document.getElementById('progress-bar');
const uiContainer = document.getElementById('progress-container');

// Internal 1080p Resolution
const GAME_W = 1920;
const GAME_H = 1080;

// --- STATE ---
let state = "HOME"; 
let cameraX = 0;
let currentLevel = 1;

// 15 Color Kit
const colors = ["#00FFCC", "#FF3366", "#FFCC00", "#AA00FF", "#0088FF", "#FF8800", "#00FF00", "#FFFFFF", "#FF00FF", "#444444", "#00FFFF", "#FFFF00", "#CCFF00", "#0066FF", "#FF5555"];
let selectedColor = 0;

const player = {
    x: 200, y: 0, w: 90, h: 90,
    vY: 0, gravity: 3.2, jump: -45, // Snappy "Pro" physics
    grounded: false, speed: 16
};

// --- 3 PRO LEVELS ---
const levels = {
    1: [ {x: 800, y: 0, w: 120, h: 120, type: "BLOCK"}, {x: 1400, y: 0, w: 90, h: 90, type: "SPIKE"}, {x: 2000, y: 200, w: 300, h: 60, type: "BLOCK"} ],
    2: [ {x: 700, y: 0, w: 100, h: 100, type: "SPIKE"}, {x: 1100, y: 300, w: 150, h: 150, type: "BLOCK"}, {x: 1600, y: 0, w: 100, h: 100, type: "SPIKE"} ],
    3: [ {x: 600, y: 0, w: 300, h: 80, type: "BLOCK"}, {x: 1200, y: 0, w: 90, h: 180, type: "BLOCK"}, {x: 1500, y: 0, w: 90, h: 90, type: "SPIKE"} ]
};

// --- RENDER HELPERS ---
function drawPlayer(x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 30; ctx.shadowColor = color;
    ctx.fillRect(x, y, player.w, player.h);
    
    // Icon Face Detail
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x + 20, y + 25, 15, 15); // Eye L
    ctx.fillRect(x + 55, y + 25, 15, 15); // Eye R
    ctx.fillRect(x + 20, y + 65, 50, 10); // Mouth
    ctx.restore();
}

function drawSpike(x, y, w, h) {
    const floorY = GAME_H - 150;
    ctx.fillStyle = "#FF3366";
    ctx.beginPath();
    ctx.moveTo(x, floorY);
    ctx.lineTo(x + w/2, floorY - h);
    ctx.lineTo(x + w, floorY);
    ctx.fill();
}

// --- MAIN ENGINE ---
function update() {
    if (state !== "PLAYING") return;

    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floor = GAME_H - 150;
    player.grounded = false;

    if (player.y + player.h > floor) {
        player.y = floor - player.h;
        player.vY = 0;
        player.grounded = true;
    }

    // Collision (Blocks & Spikes)
    levels[currentLevel].forEach(obj => {
        const objY = floor - obj.h - obj.y;
        if (player.x + player.w > obj.x && player.x < obj.x + obj.w) {
            if (player.y + player.h > objY && player.y < objY + obj.h) {
                if (obj.type === "SPIKE") resetLevel();
                else if (player.vY >= 0 && player.y + player.h < objY + 45) {
                    player.y = objY - player.h;
                    player.vY = 0;
                    player.grounded = true;
                } else {
                    resetLevel();
                }
            }
        }
    });

    cameraX = player.x - 400;
    
    // UI Progress
    const progress = Math.min((player.x / 4000) * 100, 100);
    uiBar.style.width = progress + "%";
    if (progress >= 100) { state = "HOME"; resetLevel(); }
}

function resetLevel() {
    player.x = 200; player.y = 0; player.vY = 0;
}

function draw() {
    ctx.fillStyle = "#0a0a0a"; // Keep it dark
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    if (state === "HOME") {
        uiContainer.style.display = "none";
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.font = "bold 120px sans-serif";
        ctx.fillText("GEOMETRY ODYSSEY", GAME_W/2, 300);

        drawBtn(GAME_W/2 - 250, 450, 500, 110, "LEVEL 1", colors[selectedColor]);
        drawBtn(GAME_W/2 - 250, 580, 500, 110, "LEVEL 2", "#222");
        drawBtn(GAME_W/2 - 250, 710, 500, 110, "ICON KIT", "#444");
    } 
    else if (state === "ICON_KIT") {
        ctx.fillStyle = "white"; ctx.font = "bold 80px sans-serif";
        ctx.fillText("ICON KIT", GAME_W/2, 200);
        drawPlayer(GAME_W/2 - 45, 300, colors[selectedColor]);

        const size = 100; const gap = 30;
        colors.forEach((c, i) => {
            const col = i % 5; const row = Math.floor(i / 5);
            const bx = GAME_W/2 - 310 + (col * (size + gap));
            const by = 550 + (row * (size + gap));
            ctx.fillStyle = c; ctx.fillRect(bx, by, size, size);
            if (selectedColor === i) {
                ctx.strokeStyle = "white"; ctx.lineWidth = 6;
                ctx.strokeRect(bx - 5, by - 5, size + 10, size + 10);
            }
        });
        drawBtn(GAME_W/2 - 150, 950, 300, 80, "BACK", "#333");
    } 
    else if (state === "PLAYING") {
        uiContainer.style.display = "block";
        ctx.save();
        ctx.translate(-cameraX, 0);
        
        // Ground
        ctx.fillStyle = "#151515"; ctx.fillRect(cameraX, GAME_H-150, GAME_W, 150);
        ctx.strokeStyle = colors[selectedColor]; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cameraX, GAME_H-150); ctx.lineTo(cameraX + GAME_W, GAME_H-150); ctx.stroke();

        levels[currentLevel].forEach(obj => {
            if (obj.type === "SPIKE") drawSpike(obj.x, obj.y, obj.w, obj.h);
            else {
                ctx.fillStyle = "#333"; ctx.fillRect(obj.x, GAME_H - 150 - obj.h - obj.y, obj.w, obj.h);
                ctx.strokeStyle = "white"; ctx.lineWidth = 2;
                ctx.strokeRect(obj.x, GAME_H - 150 - obj.h - obj.y, obj.w, obj.h);
            }
        });

        drawPlayer(player.x, player.y, colors[selectedColor]);
        ctx.restore();
    }
    requestAnimationFrame(draw);
}

function drawBtn(x, y, w, h, txt, clr) {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.fill();
    ctx.strokeStyle = clr; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = "white"; ctx.font = "bold 40px sans-serif";
    ctx.fillText(txt, x + w/2, y + h/2 + 15);
}

function input(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    const sX = GAME_W / rect.width;
    const sY = GAME_H / rect.height;
    const tx = (t.clientX - rect.left) * sX;
    const ty = (t.clientY - rect.top) * sY;

    if (state === "HOME") {
        if (tx > GAME_W/2 - 250 && tx < GAME_W/2 + 250) {
            if (ty > 450 && ty < 560) { state = "PLAYING"; currentLevel = 1; resetLevel(); }
            if (ty > 580 && ty < 690) { state = "PLAYING"; currentLevel = 2; resetLevel(); }
            if (ty > 710 && ty < 820) state = "ICON_KIT";
        }
    } else if (state === "ICON_KIT") {
        if (ty > 950 && ty < 1030) state = "HOME";
        const size = 100; const gap = 30;
        colors.forEach((c, i) => {
            const col = i % 5; const row = Math.floor(i / 5);
            const bx = GAME_W/2 - 310 + (col * (size + gap));
            const by = 550 + (row * (size + gap));
            if (tx > bx && tx < bx + size && ty > by && ty < by + size) selectedColor = i;
        });
    } else if (state === "PLAYING" && player.grounded) {
        player.vY = player.jump;
    }
}

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); input(e); }, {passive: false});
canvas.addEventListener('mousedown', input);
setInterval(update, 1000/60);
draw();
