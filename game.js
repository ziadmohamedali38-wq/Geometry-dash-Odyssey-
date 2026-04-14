// ==========================================
// 1. FIREBASE SETUP
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
// 2. CANVAS & PLAYER (CUBE) SETUP
// ==========================================
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "#1a1a1a";

let gameActive = false;
let user = null;

const cube = {
    x: 100,
    y: 100,
    size: 50,
    color: "#00FFCC"
};

const buttons = [
    { id: 1, x: 150, y: 300, w: 80, h: 80, color: "#FF4444", pressed: false },
    { id: 2, x: 300, y: 150, w: 80, h: 80, color: "#FF4444", pressed: false }
];

// Handle Mobile Touch and Scaling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Input Handling for the Cube
function moveCube(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    cube.x = clientX - cube.size / 2;
    cube.y = clientY - cube.size / 2;
}

canvas.addEventListener('mousemove', moveCube);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); 
    moveCube(e);
}, { passive: false });

// ==========================================
// 3. THE FIXED BUTTON LOGIC
// ==========================================
function checkCollisions() {
    buttons.forEach(btn => {
        // Strict Rectangle Collision Formula
        const isColliding = cube.x < btn.x + btn.w &&
                            cube.x + cube.size > btn.x &&
                            cube.y < btn.y + btn.h &&
                            cube.y + cube.size > btn.y;

        if (isColliding) {
            btn.pressed = true;
            btn.color = "#33FF77"; // Turns Green when fixed
        } else {
            // Keep it green once fixed, or remove this line to make it toggle
            // btn.pressed = false; 
        }
    });
}

// ==========================================
// 4. MAIN GAME LOOP
// ==========================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameActive) {
        // Welcome Screen
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("WELCOMING TIME", canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = "16px sans-serif";
        ctx.fillText("Tap to Login & Start", canvas.width / 2, canvas.height / 2);
    } else {
        // Draw Buttons
        buttons.forEach(btn => {
            ctx.fillStyle = btn.color;
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = "white";
            ctx.font = "12px sans-serif";
            ctx.fillText(btn.pressed ? "FIXED" : "PUSH", btn.x + 40, btn.y + 45);
        });

        // Draw Cube (Player)
        ctx.fillStyle = cube.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = cube.color;
        ctx.fillRect(cube.x, cube.y, cube.size, cube.size);
        ctx.shadowBlur = 0; // Reset shadow

        // HUD
        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText("User: " + user.displayName, 20, 40);
    }

    checkCollisions();
    requestAnimationFrame(draw);
}

// ==========================================
// 5. AUTH FLOW
// ==========================================
canvas.addEventListener('click', () => {
    if (!gameActive) signInWithRedirect(auth, provider);
});

getRedirectResult(auth).then((result) => {
    if (result || auth.currentUser) {
        user = result ? result.user : auth.currentUser;
        gameActive = true;
    }
}).catch((err) => console.error(err));

draw();
