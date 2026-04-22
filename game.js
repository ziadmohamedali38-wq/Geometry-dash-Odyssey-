const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const G = {
    W: 1920, H: 1080, floor: 900,
    state: "MENU",
    cameraX: 0,
    attempts: 1
};

let player = {
    x: 400, y: 0, w: 92, h: 92,
    vY: 0, grav: 3.4, jump: -48,
    rot: 0, grounded: false, color: "#00fbff"
};

// FULL ASSET LEVELS
const Levels = {
    1: { name: "STEREO MADNESS", data: [
        {x: 1200, y: 0, w: 90, h: 90, type: 'spike'},
        {x: 1800, y: 0, w: 100, h: 100, type: 'block'},
        {x: 1900, y: 0, w: 100, h: 100, type: 'block'},
        {x: 2500, y: 0, w: 90, h: 90, type: 'spike'},
        {x: 2590, y: 0, w: 90, h: 90, type: 'spike'},
        {x: 3200, y: 220, w: 400, h: 80, type: 'block'}
    ]},
    2: { name: "BACK ON TRACK", data: [
        {x: 1000, y: 0, w: 90, h: 90, type: 'spike'},
        {x: 1500, y: 200, w: 200, h: 50, type: 'block'}
    ]},
    3: { name: "POLARGEIST", data: [
        {x: 900, y: 0, w: 90, h: 250, type: 'block'}
    ]}
};

let activeLevel = Levels[1];

const Engine = {
    initGame(lv) {
        activeLevel = Levels[lv];
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-hud').classList.remove('hidden');
        document.getElementById('level-title').innerText = activeLevel.name;
        G.state = "PLAYING";
        this.reset();
    },

    reset() {
        player.x = 400; player.y = 0; player.vY = 0;
        G.cameraX = 0;
    },

    drawPlayer() {
        ctx.save();
        ctx.translate(player.x + 46, player.y + 46);
        if (!player.grounded) player.rot += 0.22;
        else player.rot = Math.round(player.rot / (Math.PI / 2)) * (Math.PI / 2);
        ctx.rotate(player.rot);

        // Core Icon
        ctx.fillStyle = player.color;
        ctx.fillRect(-46, -46, 92, 92);
        ctx.strokeStyle = "black"; ctx.lineWidth = 6; ctx.strokeRect(-46, -46, 92, 92);

        // THE FACE
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(-24, -32, 20, 20); // Eye L
        ctx.fillRect(8, -32, 20, 20);  // Eye R
        ctx.fillRect(-22, 12, 44, 12); // Mouth
        ctx.restore();
    },

    update() {
        if (G.state !== "PLAYING") return;

        player.x += 16.5; // Constant speed
        player.vY += player.grav;
        player.y += player.vY;

        if (player.y + player.h > G.floor) {
            player.y = G.floor - player.h;
            player.vY = 0; player.grounded = true;
        } else player.grounded = false;

        G.cameraX = player.x - 500;

        // Collision Check
        activeLevel.data.forEach(obj => {
            let oY = G.floor - obj.h - obj.y;
            if (player.x + player.w - 20 > obj.x && player.x + 20 < obj.x + obj.w) {
                if (player.y + player.h > oY && player.y < oY + obj.h) {
                    this.reset();
                    G.attempts++;
                    document.getElementById('attempt-count').innerText = `ATTEMPT ${G.attempts}`;
                }
            }
        });

        document.getElementById('progress-fill').style.width = Math.min((player.x / 8000) * 100, 100) + "%";
    },

    render() {
        // Gradient BG
        let bg = ctx.createLinearGradient(0, 0, 0, G.H);
        bg.addColorStop(0, "#005291");
        bg.addColorStop(1, "#002b4d");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, G.W, G.H);

        ctx.save();
        ctx.translate(-G.cameraX, 0);

        // Ground
        ctx.fillStyle = "#001220"; ctx.fillRect(G.cameraX, G.floor, G.W, 180);
        ctx.strokeStyle = "white"; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.moveTo(G.cameraX, G.floor); ctx.lineTo(G.cameraX + G.W, G.floor); ctx.stroke();

        // Level Design
        activeLevel.data.forEach(obj => {
            if (obj.type === 'spike') {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.moveTo(obj.x, G.floor);
                ctx.lineTo(obj.x + 45, G.floor - 90); ctx.lineTo(obj.x + 90, G.floor);
                ctx.fill();
                ctx.strokeStyle = "black"; ctx.lineWidth = 4; ctx.stroke();
            } else {
                ctx.fillStyle = "#000"; ctx.fillRect(obj.x, G.floor - obj.h - obj.y, obj.w, obj.h);
                ctx.strokeStyle = "white"; ctx.lineWidth = 4; ctx.strokeRect(obj.x, G.floor - obj.h - obj.y, obj.w, obj.h);
            }
        });

        this.drawPlayer();
        ctx.restore();
        
        if (G.state === "PLAYING") this.update();
        requestAnimationFrame(() => this.render());
    }
};

window.addEventListener('mousedown', () => { if(player.grounded) player.vY = player.jump; });
window.addEventListener('touchstart', (e) => { 
    if(player.grounded) player.vY = player.jump; 
    e.preventDefault(); 
}, {passive: false});

Engine.render();
