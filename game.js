import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDEw8iPR12evpKzHBQmYnlcTdoYD3pK-xc",
    authDomain: "geometry-dash-odessy.firebaseapp.com",
    projectId: "geometry-dash-odessy",
    storageBucket: "geometry-dash-odessy.firebasestorage.app",
    messagingSenderId: "824100531511",
    appId: "1:824100531511:web:b25f7b5e688c425cd2feb2",
    measurementId: "G-M3CE56HJB2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- GAME STATE & CONSTANTS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = {
    player: {
        x: 100,
        y: 300,
        width: 30,
        height: 30,
        vy: 0,
        gravity: 0.6,
        jumpForce: -10,
        isGrounded: false,
        isDead: false,
        rotation: 0
    },
    level: "Welcoming Time",
    attempts: localStorage.getItem('attempts') || 0,
    isPaused: false
};

// --- CORE ENGINE LOGIC (Cube & Physics) ---
function update() {
    if (gameState.isPaused || gameState.player.isDead) return;

    // Physics
    gameState.player.vy += gameState.player.gravity;
    gameState.player.y += gameState.player.vy;

    // Floor Collision (Basic)
    if (gameState.player.y > 350) {
        gameState.player.y = 350;
        gameState.player.vy = 0;
        gameState.player.isGrounded = true;
        gameState.player.rotation = Math.round(gameState.player.rotation / 90) * 90;
    } else {
        gameState.player.isGrounded = false;
        gameState.player.rotation += 5; // Rotation in air
    }

    draw();
    requestAnimationFrame(update);
}

function jump() {
    if (gameState.player.isGrounded) {
        gameState.player.vy = gameState.player.jumpForce;
    }
}

// --- INPUTS ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
});
canvas.addEventListener('mousedown', jump);

// --- AUTH UI SYNC ---
onAuthStateChanged(auth, (user) => {
    const statusEl = document.getElementById('auth-status');
    if (user) {
        console.log("Syncing progress for:", user.displayName);
        if(statusEl) statusEl.innerText = `User: ${user.displayName}`;
    } else {
        if(statusEl) statusEl.innerText = "Guest Mode";
    }
});

// Login Trigger (Call this from your UI button)
export const startLogin = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (err) {
        console.error("Auth Error:", err);
    }
};

// Start the game loop
update();
