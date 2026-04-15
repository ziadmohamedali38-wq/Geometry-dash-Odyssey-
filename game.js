// --- FIREBASE & CONFIG ---
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

// --- ENGINE STATE ---
let state = "HOME"; 
let user = null;
let cameraX = 0;
const dpr = window.devicePixelRatio || 1;

// --- PLAYER & ICON KIT ---
const player = {
    x: 100, y: 0, w: 54, h: 54,
    colors: ["#00FFCC", "#FF3366", "#FFCC00", "#AA00FF"],
    colorIdx: 0,
    vY: 0, gravity: 0.9, jump: -17,
    grounded: false, speed: 6
};

// --- LEVEL DATA (The Foundation) ---
const level = [
    {x: 600, y: 0, w: 60, h: 60},
    {x: 900, y: 0, w: 60, h: 120},
    {x: 1200, y: 60, w: 200, h: 60},
    {x: 1600, y: 0, w: 60, h: 60}
];

function setup() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}

// --- CORE LOOPS ---
function update() {
    if (state !== "PLAYING") return;

    player.x += player.speed;
    player.vY += player.gravity;
    player.y += player.vY;

    const floor = window.innerHeight - 100;
    if (player.y + player.h > floor) {
        player.y = floor - player.h;
        player.vY = 0;
        player.grounded = true;
    } else {
        player.grounded = false;
    }

    cameraX = player.x - 100;
}

function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    if (state === "HOME") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 60px sans-serif";
        ctx.fillText("ODESSY", w/2, 150);

        drawBtn(w/2 - 120, 300, 240, 80, "START LEVEL", player.colors[player.colorIdx]);
        drawBtn(w/2 - 120, 420, 240, 80, "ICON KIT", "#333");
        drawBtn(w/2 - 120, 540, 240, 80, "DEV OPTS", "#111");

    } else if (state === "ICON_KIT") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText("SELECT ICON COLOR", w/2, 100);
        
        ctx.fillStyle = player.colors[player.colorIdx];
        ctx.fillRect(w/2 - 40, 200, 80, 80);

        drawBtn(w/2 - 100, 400, 200, 60, "CHANGE", "#444");
        drawBtn(w/2 - 100, 500, 200, 60, "BACK", "#222");

    } else if (state === "PLAYING") {
        ctx.save();
        ctx.translate(-cameraX, 0);

        // Ground
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(cameraX, h - 100, w, 100);
        ctx.strokeStyle = player.colors[player.colorIdx];
        ctx.strokeRect(cameraX, h-100, w, 2);

        // Level
        ctx.fillStyle = "#222";
        level.forEach(b => ctx.fillRect(b.x, h - 100 - b.h - b.y, b.w, b.h));

        // Player
        ctx.fillStyle = player.colors[player.colorIdx];
        ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

function drawBtn(x, y, w, h, txt, clr) {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 15); ctx.fill();
    ctx.strokeStyle = clr; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "white"; ctx.font = "bold 20px sans-serif";
    ctx.fillText(txt, x + w/2, y + h/2 + 8);
}

// --- TOUCH FIX (OFFSET KILLER) ---
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return {
        x: (t.clientX - rect.left),
        y: (t.clientY - rect.top)
    };
}

function input(e) {
    const p = getTouchPos(e);
    const w = window.innerWidth;

    if (state === "HOME") {
        if (p.x > w/2 - 120 && p.x < w/2 + 120) {
            if (p.y > 300 && p.y < 380) state = "PLAYING";
            if (p.y > 420 && p.y < 500) state = "ICON_KIT";
            if (p.y > 540 && p.y < 620 && !user) auth.signInWithRedirect(provider);
        }
    } else if (state === "ICON_KIT") {
        if (p.y > 400 && p.y < 460) player.colorIdx = (player.colorIdx + 1) % player.colors.length;
        if (p.y > 500 && p.y < 560) state = "HOME";
    } else if (state === "PLAYING") {
        if (player.grounded) player.vY = player.jump;
    }
}

canvas.addEventListener('mousedown', input);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); input(e); }, {passive: false});

window.addEventListener('resize', setup);
setup();

auth.onAuthStateChanged(u => { user = u; });
auth.getRedirectResult().then(() => {
    setInterval(() => { update(); draw(); }, 1000/60);
});
