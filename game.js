// --- ENGINE CONFIG ---
const GAME_W = 1920;
const GAME_H = 1080;
let state = "HOME";
let currentLevel = 1;

// Physics Tweaks for "Pro Mode"
const player = {
    x: 300, y: 0, w: 90, h: 90,
    vY: 0, gravity: 2.8, jump: -42, // Heavier gravity + stronger jump = Snappy
    grounded: false, speed: 15
};

// --- ICON FACES ---
function drawPlayer(x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 30; ctx.shadowColor = color;
    ctx.fillRect(x, y, player.w, player.h);
    
    // The "Face" (Icon Kit Detail)
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    // Eyes
    ctx.fillRect(x + 20, y + 20, 15, 15);
    ctx.fillRect(x + 55, y + 20, 15, 15);
    // Mouth
    ctx.fillRect(x + 20, y + 60, 50, 10);
    ctx.restore();
}

// --- 3 LEVEL DESIGN ---
const levels = {
    1: [ {x: 800, y: 0, w: 100, h: 100, type: "BLOCK"}, {x: 1200, y: 0, w: 80, h: 80, type: "SPIKE"}, {x: 1800, y: 150, w: 300, h: 60, type: "BLOCK"} ],
    2: [ {x: 700, y: 0, w: 90, h: 90, type: "SPIKE"}, {x: 1100, y: 200, w: 200, h: 50, type: "BLOCK"}, {x: 1500, y: 0, w: 90, h: 90, type: "SPIKE"} ],
    3: [ {x: 600, y: 300, w: 100, h: 50, type: "BLOCK"}, {x: 900, y: 0, w: 90, h: 180, type: "BLOCK"}, {x: 1400, y: 0, w: 90, h: 90, type: "SPIKE"} ]
};

// --- EDITOR LOGIC (Firebase Ready) ---
let editorObjects = [];
function openEditor() {
    state = "EDITOR";
    editorObjects = []; // Start fresh
}

function handleEditorClick(tx, ty) {
    // Add a block where you click in the 1920x1080 space
    editorObjects.push({ x: tx + cameraX, y: GAME_H - 150 - ty, w: 90, h: 90, type: "BLOCK" });
    console.log("Block added!");
}

// --- CORE LOOP ---
function update() {
    if (state !== "PLAYING") return;

    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floor = GAME_H - 150;
    if (player.y + player.h > floor) {
        player.y = floor - player.h;
        player.vY = 0;
        player.grounded = true;
    }

    // Collision Detection (Blocks & Spikes)
    let activeData = levels[currentLevel];
    activeData.forEach(obj => {
        const objY = floor - obj.h - obj.y;
        if (player.x + player.w > obj.x && player.x < obj.x + obj.w) {
            if (player.y + player.h > objY && player.y < objY + obj.h) {
                if (obj.type === "SPIKE") {
                    resetPlayer(); 
                } else if (player.vY >= 0 && player.y + player.h < objY + 45) {
                    player.y = objY - player.h;
                    player.vY = 0;
                    player.grounded = true;
                } else {
                    resetPlayer(); // Dead on side hit
                }
            }
        }
    });

    cameraX = player.x - 400;
}

// --- RENDERER ---
function draw() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    const w = GAME_W; const h = GAME_H;

    if (state === "HOME") {
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.font = "bold 120px sans-serif"; ctx.fillText("GEOMETRY ODYSSEY", w/2, 250);
        
        drawBtn(w/2 - 250, 400, 500, 100, "LEVEL 1", colors[selectedColor]);
        drawBtn(w/2 - 250, 520, 500, 100, "LEVEL 2", "#222");
        drawBtn(w/2 - 250, 640, 500, 100, "LEVEL 3", "#111");
        drawBtn(w/2 - 250, 800, 500, 80, "EDITOR", "#333");
    } 
    else if (state === "PLAYING") {
        ctx.save();
        ctx.translate(-cameraX, 0);
        
        // Ground Line
        ctx.strokeStyle = colors[selectedColor]; ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(cameraX, h-150); ctx.lineTo(cameraX + w, h-150); ctx.stroke();

        levels[currentLevel].forEach(obj => {
            if (obj.type === "SPIKE") {
                // Triangle Spike
                ctx.fillStyle = "#FF3366";
                ctx.beginPath();
                ctx.moveTo(obj.x, h-150);
                ctx.lineTo(obj.x + obj.w/2, h-150-obj.h);
                ctx.lineTo(obj.x + obj.w, h-150);
                ctx.fill();
            } else {
                ctx.fillStyle = "#222"; ctx.strokeStyle = "white"; ctx.lineWidth = 2;
                ctx.fillRect(obj.x, h - 150 - obj.h - obj.y, obj.w, obj.h);
                ctx.strokeRect(obj.x, h - 150 - obj.h - obj.y, obj.w, obj.h);
            }
        });

        drawPlayer(player.x, player.y, colors[selectedColor]);
        ctx.restore();
    }
    requestAnimationFrame(draw);
}
