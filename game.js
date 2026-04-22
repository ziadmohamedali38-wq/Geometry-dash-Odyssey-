const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_W = 1920;
const GAME_H = 1080;

// Firebase Mock - Replace with your config
const db = null; 

let state = "HOME";
let cameraX = 0;
let currentLevel = 1;

const colors = ["#00fbff", "#fe0000", "#ffcf00", "#a200ff", "#00ff08"];
let selectedColor = 0;

const player = {
    x: 250, y: 0, w: 90, h: 90,
    vY: 0, gravity: 2.8, jump: -40,
    grounded: false, rotation: 0, speed: 15
};

// 3 Auth levels with Spikes and Blocks
const levels = {
    1: [{x: 900, y: 0, w: 90, h: 90, type: "SPIKE"}, {x: 1400, y: 0, w: 100, h: 100, type: "BLOCK"}, {x: 1800, y: 0, w: 90, h: 180, type: "BLOCK"}],
    2: [{x: 800, y: 150, w: 200, h: 50, type: "BLOCK"}, {x: 1200, y: 0, w: 90, h: 90, type: "SPIKE"}, {x: 1500, y: 0, w: 90, h: 90, type: "SPIKE"}],
    3: [{x: 700, y: 0, w: 90, h: 90, type: "SPIKE"}, {x: 1000, y: 250, w: 100, h: 100, type: "BLOCK"}, {x: 1400, y: 0, w: 90, h: 250, type: "BLOCK"}]
};

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.w/2, player.y + player.h/2);
    if (!player.grounded) player.rotation += 0.15; else player.rotation = Math.round(player.rotation / (Math.PI/2)) * (Math.PI/2);
    ctx.rotate(player.rotation);
    
    // Core Cube
    ctx.fillStyle = colors[selectedColor];
    ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
    ctx.strokeStyle = "black"; ctx.lineWidth = 4;
    ctx.strokeRect(-player.w/2, -player.h/2, player.w, player.h);

    // Iconic Face
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(-25, -25, 20, 20); // Eye L
    ctx.fillRect(5, -25, 20, 20);  // Eye R
    ctx.fillRect(-25, 10, 50, 10); // Mouth
    ctx.restore();
}

function drawSpike(obj) {
    const floor = GAME_H - 180;
    ctx.fillStyle = "#eee"; // Light grey spike as per assets
    ctx.beginPath();
    ctx.moveTo(obj.x, floor);
    ctx.lineTo(obj.x + obj.w/2, floor - obj.h);
    ctx.lineTo(obj.x + obj.w, floor);
    ctx.fill();
    ctx.strokeStyle = "black"; ctx.lineWidth = 3; ctx.stroke();
}

function update() {
    if (state !== "PLAYING") return;
    
    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floor = GAME_H - 180;
    if (player.y + player.h > floor) {
        player.y = floor - player.h;
        player.vY = 0; player.grounded = true;
    } else player.grounded = false;

    levels[currentLevel].forEach(obj => {
        const oY = floor - obj.h - obj.y;
        if (player.x + player.w - 10 > obj.x && player.x + 10 < obj.x + obj.w) {
            if (player.y + player.h > oY && player.y < oY + obj.h) {
                if (obj.type === "SPIKE") reset();
                else if (player.vY >= 0 && player.y + player.h < oY + 50) {
                    player.y = oY - player.h; player.vY = 0; player.grounded = true;
                } else reset();
            }
        }
    });
    cameraX = player.x - 300;
}

function reset() { player.x = 250; player.y = 0; player.vY = 0; }

function draw() {
    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
    grad.addColorStop(0, "#005291");
    grad.addColorStop(1, "#002b4d");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, GAME_W, GAME_H);

    if (state === "HOME") {
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 150px sans-serif";
        ctx.fillText("GEOMETRY ODYSSEY", GAME_W/2, 350);
        drawBtn(GAME_W/2 - 250, 500, 500, 120, "PLAY", "#00ff08");
        drawBtn(GAME_W/2 - 250, 650, 500, 120, "EDITOR", "#333");
    } else if (state === "PLAYING") {
        ctx.save(); ctx.translate(-cameraX, 0);
        // Ground line
        ctx.fillStyle = "#001220"; ctx.fillRect(cameraX, GAME_H-180, GAME_W, 180);
        ctx.strokeStyle = "white"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cameraX, GAME_H-180); ctx.lineTo(cameraX + GAME_W, GAME_H-180); ctx.stroke();

        levels[currentLevel].forEach(obj => {
            if (obj.type === "SPIKE") drawSpike(obj);
            else {
                ctx.fillStyle = "#111"; ctx.fillRect(obj.x, GAME_H-180-obj.h-obj.y, obj.w, obj.h);
                ctx.strokeStyle = "white"; ctx.lineWidth = 3; ctx.strokeRect(obj.x, GAME_H-180-obj.h-obj.y, obj.w, obj.h);
            }
        });
        drawPlayer();
        ctx.restore();
    }
    requestAnimationFrame(draw);
}

function drawBtn(x, y, w, h, txt, clr) {
    ctx.fillStyle = "#111"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = clr; ctx.lineWidth = 5; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "white"; ctx.font = "bold 50px sans-serif";
    ctx.fillText(txt, x + w/2, y + h/2 + 15);
}

window.addEventListener('mousedown', () => { 
    if (state === "PLAYING" && player.grounded) player.vY = player.jump;
    else if (state === "HOME") state = "PLAYING";
});
window.addEventListener('touchstart', (e) => { 
    e.preventDefault();
    if (state === "PLAYING" && player.grounded) player.vY = player.jump;
    else if (state === "HOME") state = "PLAYING";
}, {passive: false});

setInterval(update, 1000/60);
draw();
