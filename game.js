// 1. ENGINE CORE & CONFIG
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

let state = "LOADING"; 
let user = null;
const ratio = window.devicePixelRatio || 1;

// Game Objects
const player = { x: 100, y: 100, size: 60, color: "#00FFCC", velocity: 0 };
const levelCard = { x: 20, y: 160, h: 120, color: "#161616", active: false };

// 2. THE SHARP-RENDERER (Fixes Blur)
function setupCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(ratio, ratio);
}

// 3. UI RENDERING (Rebuilt from Scratch)
function drawUI() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state === "MENU") {
        // Big Title
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("Odyssey", 30, 90);
        
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(user ? `LOGGED IN AS ${user.displayName.toUpperCase()}` : "TAP CARD TO SYNC & START", 30, 125);

        // Level Selection Card
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.fillStyle = levelCard.color;
        
        // Rounded Rect Helper
        ctx.beginPath();
        const cardW = window.innerWidth - 40;
        ctx.roundRect(20, 160, cardW, 120, 20);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "white";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("1. Welcoming Time", 50, 215);
        
        ctx.fillStyle = "#00FFCC";
        ctx.font = "14px sans-serif";
        ctx.fillText("READY TO LAUNCH", 50, 245);

    } else if (state === "PLAYING") {
        // Square Player
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "white";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("PLAYING: WELCOMING TIME", 30, 40);
    }
}

// 4. INPUT LOGIC
const handleTouch = (e) => {
    const t = e.touches ? e.touches[0] : e;
    const x = t.clientX;
    const y = t.clientY;

    if (state === "MENU") {
        // If clicking inside the card
        if (y > 160 && y < 280) {
            if (!user) {
                auth.signInWithRedirect(provider);
            } else {
                state = "PLAYING";
            }
        }
    } else {
        player.x = x - player.size / 2;
        player.y = y - player.size / 2;
    }
};

// 5. THE ENGINE LOOP
function loop() {
    drawUI();
    requestAnimationFrame(loop);
}

// 6. INITIALIZATION & AUTH CATCH
window.addEventListener('resize', setupCanvas);
setupCanvas();

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleTouch(e); }, {passive: false});
canvas.addEventListener('mousedown', handleTouch);

// This is the "Magic" that stops the loop
auth.getRedirectResult().then((result) => {
    if (result.user || auth.currentUser) {
        user = auth.currentUser || result.user;
    }
    state = "MENU";
    loop();
}).catch((err) => {
    console.error(err);
    state = "MENU";
    loop();
});
