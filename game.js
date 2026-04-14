import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// --- 1. FIREBASE CONFIGURATION ---
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

// --- 2. ENGINE SETUP & CONSTANTS ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = {
    GRAVITY: 0.9,
    JUMP_FORCE: -13,
    SPEED: 5,
    GROUND_Y: 360,
    CUBE_SIZE: 30
};

let gameState = {
    player: {
        x: 80,
        y: 300,
        vy: 0,
        rotation: 0,
        isGrounded: false,
        isDead: false
    },
    level: {
        offset: 0,
        obstacles: [
            { x: 600, y: 330, w: 30, h: 30 },
            { x: 900, y: 330, w: 30, h: 30 },
            { x: 1200, y: 280, w: 30, h: 80 } // A tall pillar
        ]
    },
    attempts: 1
};

// --- 3. CORE PHYSICS ENGINE ---
function applyPhysics() {
    if (gameState.player.isDead) return;

    // Apply Gravity
    gameState.player.vy += CONFIG.GRAVITY;
    gameState.player.y += gameState.player.vy;

    // Level Scroll
    gameState.level.offset += CONFIG.SPEED;

    // Ground Collision
    if (gameState.player.y + CONFIG.CUBE_SIZE > CONFIG.GROUND_Y) {
        gameState.player.y = CONFIG.GROUND_Y - CONFIG.CUBE_SIZE;
        gameState.player.vy = 0;
        gameState.player.isGrounded = true;
        
        // Snap rotation to nearest 90deg upon landing
        gameState.player.rotation = Math.round(gameState.player.rotation / 90) * 90;
    } else {
        gameState.player.isGrounded = false;
        gameState.player.rotation += 6; // Mid-air spin
    }

    checkCollisions();
}

function checkCollisions() {
    gameState.level.obstacles.forEach(obj => {
        let relativeX = obj.x - gameState.level.offset;
        
        // Box Collision detection
        if (gameState.player.x < relativeX + obj.w &&
            gameState.player.x + CONFIG.CUBE_SIZE > relativeX &&
            gameState.player.y < obj.y + obj.h &&
            gameState.player.y + CONFIG.CUBE_SIZE > obj.y) {
            
            handleDeath();
        }
    });
}

function handleDeath() {
    gameState.player.isDead = true;
    console.log("Crash! Restarting attempt:", gameState.attempts);
    setTimeout(() => {
        gameState.player.y = 300;
        gameState.player.vy = 0;
        gameState.player.isDead = false;
        gameState.level.offset = 0;
        gameState.attempts++;
    }, 1000);
}

// --- 4. RENDERING SYSTEM ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background/Floor
    ctx.strokeStyle = "#555";
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.GROUND_Y);
    ctx.lineTo(canvas.width, CONFIG.GROUND_Y);
    ctx.stroke();

    // Draw Obstacles
    ctx.fillStyle = "#FF4444";
    gameState.level.obstacles.forEach(obj => {
        let drawX = obj.x - gameState.level.offset;
        if (drawX > -100 && drawX < canvas.width + 100) {
            ctx.fillRect(drawX, obj.y, obj.w, obj.h);
        }
    });

    // Draw Player (Cube)
    ctx.save();
    let p = gameState.player;
    ctx.translate(p.x + CONFIG.CUBE_SIZE / 2, p.y + CONFIG.CUBE_SIZE / 2);
    ctx.rotate((p.rotation * Math.PI) / 180);
    
    // The "Welcoming Time" Neon Cube
    ctx
