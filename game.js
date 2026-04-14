// ==========================================
// 1. FIREBASE & CORE SETUP
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 2. GAME ENGINE & CUBE MECHANICS
// ==========================================
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

let gameRunning = false;
let userProfile = null;

const player = {
    x: 50,
    y: 50,
    size: 40, // The Cube
    color: "#00FFCC",
    speed: 5
};

// Scaling Logic
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// 3. THE "WELCOMING TIME" LEVEL LOGIC
// ==========================================
const buttons = [
    { x: 200, y: 200, w: 60, h: 60, color: "red", active: false, label: "FIX ME" }
];

function update() {
    if (!gameRunning) return;

    // Movement (Simple Touch/Click follow for mobile)
    canvas.onmousemove = (e) => {
        player.x = e.clientX - player.size / 2;
        player.y = e.clientY - player.size / 2;
    };

    // Collision with Buttons
    buttons.forEach(btn => {
        if (player.x < btn.x + btn.w && player.x + player.size > btn.x &&
            player.y < btn.y + btn.h && player.y + player.size > btn.y) {
            btn.active = true;
            btn.color = "lime";
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameRunning) {
        // Login Screen UI
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("WELCOMING TIME", canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = "20px Arial";
        ctx.fillText("Click anywhere to Login with Google", canvas.width / 2, canvas.height / 2);
    } else {
        // Draw Player (Cube)
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);

        // Draw Buttons
        buttons.forEach(btn => {
            ctx.fillStyle = btn.color;
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = "black";
            ctx.fillText(btn.active ? "FIXED" : "PUSH", btn.x + 5, btn.y + 35);
        });

        // User Greeting
        ctx.fillStyle = "white";
        ctx.fillText("Player: " + userProfile.displayName, 20, 30);
    }
    requestAnimationFrame(draw);
}

// ==========================================
// 4. AUTHENTICATION FLOW
// ==========================================
window.loginWithGoogle = function() {
    signInWithRedirect(auth, provider);
};

// Auto-trigger login on first click if not logged in
canvas.addEventListener('click', () => {
    if (!gameRunning) window.loginWithGoogle();
});

// Handle Returning from Redirect
getRedirectResult(auth).then((result) => {
    if (result || auth.currentUser) {
        userProfile = result ? result.user : auth.currentUser;
        gameRunning = true;
        console.log("Level Loaded: Welcoming Time");
    }
}).catch((error) => alert("Login Error: " + error.message));

// Start Graphics
draw();
update();
