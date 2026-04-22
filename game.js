const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const prog = document.getElementById('progress-fill');

let player = { x: 300, y: 800, w: 90, h: 90, vY: 0, g: 3, jump: -45, grounded: false, rot: 0 };
let cameraX = 0;
let levelWidth = 5000;

// Authentic Level Design (Based on your assets)
const levelData = [
    { x: 1000, y: 0, w: 90, h: 90, type: 'spike' },
    { x: 1400, y: 0, w: 100, h: 100, type: 'block' },
    { x: 1800, y: 0, w: 90, h: 90, type: 'spike' },
    { x: 2200, y: 150, w: 200, h: 60, type: 'block' }
];

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + 45, player.y + 45);
    if(!player.grounded) player.rot += 0.15; 
    else player.rot = Math.round(player.rot/(Math.PI/2))*(Math.PI/2);
    ctx.rotate(player.rot);

    // Cube with Face
    ctx.fillStyle = "#00FFCC";
    ctx.fillRect(-45, -45, 90, 90);
    ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.strokeRect(-45, -45, 90, 90);
    
    // Eyes & Mouth
    ctx.fillStyle = "black";
    ctx.fillRect(-20, -25, 15, 15); ctx.fillRect(10, -25, 15, 15);
    ctx.fillRect(-20, 15, 45, 8);
    ctx.restore();
}

function draw() {
    ctx.clearRect(0,0,1920,1080);
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Ground
    ctx.fillStyle = "#001a2d"; ctx.fillRect(cameraX, 900, 1920, 180);
    ctx.strokeStyle = "white"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cameraX, 900); ctx.lineTo(cameraX + 1920, 900); ctx.stroke();

    levelData.forEach(obj => {
        if(obj.type === 'spike') {
            ctx.fillStyle = "#eee"; // Grey spike from assets
            ctx.beginPath(); ctx.moveTo(obj.x, 900);
            ctx.lineTo(obj.x + 45, 900 - 90); ctx.lineTo(obj.x + 90, 900); ctx.fill();
        } else {
            ctx.fillStyle = "#222"; ctx.fillRect(obj.x, 900 - obj.h - obj.y, obj.w, obj.h);
            ctx.strokeStyle = "white"; ctx.strokeRect(obj.x, 900 - obj.h - obj.y, obj.w, obj.h);
        }
    });

    drawPlayer();
    ctx.restore();

    // Physics
    player.x += 15;
    player.vY += player.g;
    player.y += player.vY;
    if(player.y > 810) { player.y = 810; player.vY = 0; player.grounded = true; }
    else player.grounded = false;

    cameraX = player.x - 400;
    prog.style.width = (player.x / levelWidth * 100) + "%";

    requestAnimationFrame(draw);
}

window.addEventListener('touchstart', () => { if(player.grounded) player.vY = player.jump; });
window.addEventListener('mousedown', () => { if(player.grounded) player.vY = player.jump; });

draw();
