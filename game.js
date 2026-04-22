// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiProgress = document.getElementById('progress-container');
const uiBar = document.getElementById('progress-bar');

// Internal Resolution (Hardcoded 1080p)
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
    x: 300, y: 0, w: 90, h: 90, // Scaled up for 1080p
    vY: 0, gravity: 2.2, jump: -38,
    grounded: false, speed: 14
};

// Hardcoded Level (Editor levels will replace this later)
let activeLevelData = [
    {x: 1000, y: 0, w: 150, h: 150, type: "BLOCK"},
    {x: 1800, y: 0, w: 90, h: 90, type: "SPIKE"},
    {x: 2500, y: 200, w: 400, h: 80, type: "BLOCK"}
];

// --- CORE LOOPS ---
function update() {
    if (state !== "PLAYING") return;

    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floor = GAME_H - 150;
    player.grounded = false;

    // Floor Check
    if (player.y + player.h > floor) {
        player.y = floor - player.h;
        player.vY = 0;
        player.grounded = true;
    }

    // Collision Check
    activeLevelData.forEach(obj => {
        const objY = floor - obj.h - obj.y;
        if (player.x + player.w > obj.x && player.x < obj.x + obj.w) {
            if (player.y + player.h > objY && player.y < objY + obj.h) {
                if (obj.type === "SPIKE") resetPlayer();
                else if (player.vY >= 0 && player.y + player.h < objY + 40) { // Land on top
                    player.y = objY - player.h;
                    player.vY = 0;
                    player.grounded = true;
                } else {
                    resetPlayer(); // Hit the side
                }
            }
        }
    });

    cameraX = player.x - 400;

    // Progress Bar Logic (Assuming level ends at x = 5000)
    const progress = Math.min((player.x / 5000) * 100, 100);
    uiBar.style.width = progress + "%";
}

function resetPlayer() {
    player.x = 300; player.y = 0; player.vY = 0;
}

// --- RENDERER ---
function draw() {
    // Clear the 1920x1080 frame
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    if (state === "HOME") {
        uiProgress.style.display = "none";
        
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.font = "bold 150px sans-serif";
        ctx.fillText("ODYSSEY", GAME_W/2, 300);

        // Huge 1080p Buttons
        drawBtn(GAME_W/2 - 300, 450, 600, 120, "PLAY LEVEL 1", colors[selectedColor]);
        drawBtn(GAME_W/2 - 300, 600, 600, 120, "ICON KIT", "#555");
        drawBtn(GAME_W/2 - 300, 750, 600, 120, "EDITOR", "#333");

    } else if (state === "ICON_KIT") {
        ctx.fillStyle = "white"; ctx.font = "bold 80px sans-serif";
        ctx.fillText("SELECT YOUR VIBE", GAME_W/2, 200);

        // Draw Player Preview
        ctx.fillStyle = colors[selectedColor];
        ctx.shadowBlur = 40; ctx.shadowColor = colors[selectedColor];
        ctx.fillRect(GAME_W/2 - 75, 300, 150, 150);
        ctx.shadowBlur = 0;

        // 15 Color Grid
        const size = 100; const gap = 30;
        colors.forEach((c, i) => {
            const col = i % 5; const row = Math.floor(i / 5);
            const x = GAME_W/2 - 310 + (col * (size + gap));
            const y = 550 + (row * (size + gap));
            
            ctx.fillStyle = c; ctx.fillRect(x, y, size, size);
            if (selectedColor === i) {
                ctx.strokeStyle = "white"; ctx.lineWidth = 8;
                ctx.strokeRect(x - 5, y - 5, size + 10, size + 10);
            }
        });

        drawBtn(GAME_W/2 - 200, 950, 400, 100, "BACK", "#444");

    } else if (state === "PLAYING") {
        uiProgress.style.display = "block";
        
        ctx.save();
        ctx.translate(-cameraX, 0);
        
        // Ground
        ctx.fillStyle = "#151515"; ctx.fillRect(cameraX, GAME_H-150, GAME_W, 150);
        ctx.strokeStyle = colors[selectedColor]; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cameraX, GAME_H-150); ctx.lineTo(cameraX + GAME_W, GAME_H-150); ctx.stroke();

        // Level Objects
        activeLevelData.forEach(obj => {
            ctx.fillStyle = obj.type === "SPIKE" ? "#FF2255" : "#333";
            ctx.fillRect(obj.x, GAME_H - 150 - obj.h - obj.y, obj.w, obj.h);
        });

        // Player
        ctx.fillStyle = colors[selectedColor];
        ctx.shadowBlur = 30; ctx.shadowColor = colors[selectedColor];
        ctx.fillRect(player.x, player.y, player.w, player.h);
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

// --- TOUCH SOLVER (The Offset Killer) ---
function input(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    
    // Calculate scale between real screen size and 1920x1080 canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Map touch to internal 1920x1080 coordinates
    const touchX = (t.clientX - rect.left) * scaleX;
    const touchY = (t.clientY - rect.top) * scaleY;

    if (state === "HOME") {
        if (touchX > GAME_W/2 - 300 && touchX < GAME_W/2 + 300) {
            if (touchY > 450 && touchY < 570) { state = "PLAYING"; resetPlayer(); }
            if (touchY > 600 && touchY < 720) state = "ICON_KIT";
            if (touchY > 750 && touchY < 870) alert("Editor UI coming next!"); 
        }
    } else if (state === "ICON_KIT") {
        if (touchX > GAME_W/2 - 200 && touchX < GAME_W/2 + 200 && touchY > 950 && touchY < 1050) state = "HOME";
        
        // Grid Collision Logic
        const size = 100; const gap = 30;
        colors.forEach((c, i) => {
            const col = i % 5; const row = Math.floor(i / 5);
            const bx = GAME_W/2 - 310 + (col * (size + gap));
            const by = 550 + (row * (size + gap));
            if (touchX > bx && touchX < bx + size && touchY > by && touchY < by + size) {
                selectedColor = i;
                uiBar.style.background = c; // Update progress bar color
                uiBar.style.boxShadow = `0 0 15px ${c}`;
            }
        });
    } else if (state === "PLAYING" && player.grounded) {
        player.vY = player.jump;
    }
}

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); input(e); }, {passive: false});
canvas.addEventListener('mousedown', input);

setInterval(update, 1000/60);
draw();
