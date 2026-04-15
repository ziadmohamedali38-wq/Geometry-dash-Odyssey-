// --- 1. CORE ENGINE & CONFIG ---
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

// --- 2. GAME STATE & DATA ---
let state = "BOOTING"; // BOOTING, HOME, ICON_KIT, PLAYING, DEV_OPTIONS
let user = null;
let frame = 0;

const player = {
    x: 100, y: 300, 
    w: 50, h: 50, 
    color: "#00FFCC", 
    mode: "CUBE", // CUBE or SHIP
    gravity: 0.6,
    velocity: 0,
    jumpForce: -12,
    isHolding: false
};

const iconKit = {
    colors: ["#00FFCC", "#FF3366", "#FFCC00", "#AA00FF", "#0088FF"],
    selectedColor: 0
};

// --- 3. THE SHARP-SCREEN SYSTEM ---
function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

// --- 4. ENGINE SYSTEMS ---
function update() {
    if (state === "PLAYING") {
        if (player.mode === "CUBE") {
            player.velocity += player.gravity;
            player.y += player.velocity;
            // Floor collision
            if (player.y > window.innerHeight - 150) {
                player.y = window.innerHeight - 150;
                player.velocity = 0;
            }
        } else if (player.mode === "SHIP") {
            // Ship Physics
            if (player.isHolding) player.velocity -= 0.8;
            else player.velocity += 0.6;
            
            player.y += player.velocity;
            player.velocity *= 0.98; // Drag
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    frame++;

    if (state === "BOOTING") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("CONNECTING TO ODESSY CLOUD...", window.innerWidth/2, window.innerHeight/2);
    }

    if (state === "HOME") {
        // --- TITLE ---
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 60px sans-serif";
        ctx.fillText("ODESSY", window.innerWidth/2, 150);

        // --- BUTTONS ---
        drawButton(window.innerWidth/2 - 100, 300, 200, 80, "PLAY", "#00FFCC");
        drawButton(window.innerWidth/2 - 100, 400, 200, 80, "ICON KIT", "#555");
        drawButton(window.innerWidth/2 - 100, 500, 200, 80, "DEV OPTS", "#333");

        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#888";
        ctx.fillText(user ? `LOGGED IN: ${user.displayName}` : "OFFLINE MODE", window.innerWidth/2, window.innerHeight - 50);
    }

    if (state === "ICON_KIT") {
        ctx.fillStyle = "white";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText("CHOOSE YOUR VIBE", window.innerWidth/2, 100);
        
        // Preview Cube
        ctx.fillStyle = iconKit.colors[iconKit.selectedColor];
        ctx.fillRect(window.innerWidth/2 - 40, 200, 80, 80);
        
        drawButton(window.innerWidth/2 - 60, 400, 120, 50, "NEXT", "#444");
        drawButton(window.innerWidth/2 - 60, 500, 120, 50, "BACK", "#222");
    }

    if (state === "PLAYING") {
        // Draw Ground
        ctx.fillStyle = "#111";
        ctx.fillRect(0, window.innerHeight - 100, window.innerWidth, 100);

        // Draw Player
        ctx.fillStyle = iconKit.colors[iconKit.selectedColor];
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        
        if (player.mode === "SHIP") {
            // Draw a basic ship shape
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(player.x + 60, player.y + 25);
            ctx.lineTo(player.x, player.y + 50);
            ctx.fill();
        } else {
            ctx.fillRect(player.x, player.y, player.w, player.h);
        }
        ctx.shadowBlur = 0;
    }

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

function drawButton(x, y, w, h, text, color) {
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(text, x + w/2, y + h/2 + 7);
}

// --- 5. INTERACTION LOGIC ---
const handleInput = (e, isDown) => {
    const t = e.touches ? e.touches[0] : e;
    const x = t.clientX;
    const y = t.clientY;

    if (isDown) {
        if (state === "HOME") {
            if (y > 300 && y < 380) state = "PLAYING";
            if (y > 400 && y < 480) state = "ICON_KIT";
            if (y > 500 && y < 580 && !user) auth.signInWithPopup(provider);
        } else if (state === "ICON_KIT") {
            if (y > 400 && y < 450) iconKit.selectedColor = (iconKit.selectedColor + 1) % iconKit.colors.length;
            if (y > 500 && y < 550) state = "HOME";
        } else if (state === "PLAYING") {
            player.isHolding = true;
            if (player.mode === "CUBE" && player.velocity === 0) player.velocity = player.jumpForce;
        }
    } else {
        player.isHolding = false;
    }
};

canvas.onmousedown = (e) => handleInput(e, true);
canvas.onmouseup = (e) => handleInput(e, false);
canvas.ontouchstart = (e) => { e.preventDefault(); handleInput(e, true); };
canvas.ontouchend = (e) => { e.preventDefault(); handleInput(e, false); };

// --- 6. THE BOOT SEQUENCE ---
auth.onAuthStateChanged((u) => {
    user = u;
    if (state === "BOOTING") state = "HOME";
});

// Check if we just came back from a redirect
auth.getRedirectResult().then(() => {
    draw(); // Start the engine loop
}).catch(() => draw());
