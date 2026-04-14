import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithRedirect, 
    getRedirectResult 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your specific Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEw8iPR12evpKzHBQmYnlcTdoYD3pK-xc",
  authDomain: "geometry-dash-odessy.firebaseapp.com",
  projectId: "geometry-dash-odessy",
  storageBucket: "geometry-dash-odessy.firebasestorage.app",
  messagingSenderId: "824100531511",
  appId: "1:824100531511:web:b25f7b5e688c425cd2feb2",
  measurementId: "G-M3CE56HJB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Game Canvas Setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Style the page to be fullscreen
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "#000";

let gameState = "LOADING"; 
let user = null;

// The Cube (Player)
const player = {
    x: 50,
    y: 50,
    size: 50,
    color: "#00FFCC"
};

// The Level Buttons (Welcoming Time)
const buttons = [
    { x: 150, y: 200, w: 80, h: 80, color: "#FF4444", fixed: false },
    { x: 300, y: 400, w: 80, h: 80, color: "#FF4444", fixed: false }
];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Handling Input
function movePlayer(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    player.x = x - player.size / 2;
    player.y = y - player.size / 2;
}

canvas.addEventListener('mousemove', (e) => {
    if (gameState === "PLAYING") movePlayer(e);
});

canvas.addEventListener('touchstart', (e) => {
    if (gameState === "MENU") {
        signInWithRedirect(auth, provider);
    } else if (gameState === "PLAYING") {
        movePlayer(e);
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (gameState === "PLAYING") {
        e.preventDefault();
        movePlayer(e);
    }
}, { passive: false });

canvas.addEventListener('mousedown', () => {
    if (gameState === "MENU") signInWithRedirect(auth, provider);
});

// The Game Loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "MENU") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText("WELCOMING TIME", canvas.width / 2, canvas.height / 2);
        ctx.font = "18px sans-serif";
        ctx.fillText("TAP ANYWHERE TO LOGIN", canvas.width / 2, canvas.height / 2 + 50);
    }

    if (gameState === "PLAYING") {
        // Draw & Check Buttons
        buttons.forEach(btn => {
            // Collision Detection
            if (player.x < btn.x + btn.w && 
                player.x + player.size > btn.x && 
                player.y < btn.y + btn.h && 
                player.y + player.size > btn.y) {
                btn.fixed = true;
                btn.color = "#00FF66";
            }
            ctx.fillStyle = btn.color;
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        });

        // Draw Player (Cube)
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.shadowBlur = 0;

        // HUD
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.font = "14px sans-serif";
        ctx.fillText("Cube Pilot: " + (user?.displayName || "Player"), 20, 30);
    }

    requestAnimationFrame(draw);
}

// Auth State Handling
getRedirectResult(auth).then((result) => {
    if (result || auth.currentUser) {
        user = result ? result.user : auth.currentUser;
        gameState = "PLAYING";
    } else {
        gameState = "MENU";
    }
}).catch((err) => {
    console.error("Auth Error:", err);
    gameState = "MENU";
});

draw();
