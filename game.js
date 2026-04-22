const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const G = {
    W: 1920, H: 1080, floor: 900,
    state: "SPLASH",
    cameraX: 0,
    attempts: 1
};

let player = {
    x: 400, y: 0, w: 90, h: 90,
    vY: 0, gravity: 3.5, jump: -48,
    rotation: 0, grounded: false
};

// FULL DATA
const Level1 = [
    {x: 1200, y: 0, w: 90, h: 90, type: 'spike'},
    {x: 1600, y: 0, w: 100, h: 100, type: 'block'},
    {x: 1700, y: 0, w: 100, h: 100, type: 'block'},
    {x: 2300, y: 0, w: 90, h: 90, type: 'spike'},
    {x: 2390, y: 0, w: 90, h: 90, type: 'spike'},
    {x: 3000, y: 220, w: 400, h: 80, type: 'block'}
];

const Game = {
    start(levelID) {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-hud').classList.remove('hidden');
        G.state = "PLAYING";
        this.reset();
    },

    reset() {
        player.x = 400; player.y = 0; player.vY = 0;
        G.cameraX = 0;
    },

    drawPlayer() {
        ctx.save();
        ctx.translate(player.x + 45, player.y + 45);
        if (!player.grounded) player.rotation += 0.2;
        else player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
        ctx.rotate(player.rotation);

        // Core Icon
        ctx.fillStyle = "#00fbff";
        ctx.fillRect(-45, -45, 90, 90);
        ctx.strokeStyle = "black"; ctx.lineWidth = 6; ctx.strokeRect(-45, -45, 90, 90);

        // Face Logic
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(-22, -30, 18, 18); // Eye L
        ctx.fillRect(6, -30, 18, 18);  // Eye R
        ctx.fillRect(-20, 15, 40, 10); // Mouth
        ctx.restore();
    },

    update() {
        if (G.state !== "PLAYING") return;

        player.x += 17; // Stereo Madness Speed
        player.vY += player.gravity;
        player.y += player.vY;

        if (player.y + player.h > G.floor) {
            player.y = G.floor - player.h;
            player.vY = 0; player.grounded = true;
        } else player.grounded = false;

        G.cameraX = player.x - 500;

        // Collision Logic
        Level1.forEach(obj => {
            let oY = G.floor - obj.h - obj.y;
            if (player.x + player.w - 15 > obj.x && player.x + 15 < obj.x + obj.w) {
                if (player.y + player.h > oY && player.y < oY + obj.h) {
                    this.reset();
                    G.attempts++;
                    document.getElementById('attempt-label').innerText = `ATTEMPT ${G.attempts}`;
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

        if (G.state === "PLAYING") {
            ctx.save();
            ctx.translate(-G.cameraX, 0);

            // Ground
            ctx.fillStyle = "#001220"; ctx.fillRect(G.cameraX, G.floor, G.W, 180);
            ctx.strokeStyle = "white"; ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(G.cameraX, G.floor); ctx.lineTo(G.cameraX + G.W, G.floor); ctx.stroke();

            // Level Elements
            Level1.forEach(obj => {
                if (obj.type === 'spike') {
                    ctx.fillStyle = "white";
                    ctx.beginPath(); ctx.moveTo(obj.x, G.floor);
                    ctx.lineTo(obj.x + 45, G.floor - 90); ctx.lineTo(obj.x + 90, G.floor);
                    ctx.fill();
                } else {
                    ctx.fillStyle = "#000"; ctx.fillRect(obj.x, G.floor - obj.h - obj.y, obj.w, obj.h);
                    ctx.strokeStyle = "white"; ctx.lineWidth = 4; ctx.strokeRect(obj.x, G.floor - obj.h - obj.y, obj.w, obj.h);
                }
            });

            this.drawPlayer();
            ctx.restore();
            this.update();
        }
        requestAnimationFrame(() => this.render());
    }
};

// Initial Splash
setTimeout(() => {
    document.getElementById('splash-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        G.state = "MENU";
    }, 1000);
}, 2500);

window.addEventListener('mousedown', () => { if(player.grounded) player.vY = player.jump; });
window.addEventListener('touchstart', (e) => { 
    if(player.grounded) player.vY = player.jump; 
    e.preventDefault(); 
}, {passive: false});

Game.render();
