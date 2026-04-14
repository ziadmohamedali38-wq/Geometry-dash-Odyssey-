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
// 2. CANVAS & GAME STATE
// ==========================================
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.backgroundColor = "#1a1a1a";

let gameState = "MENU"; // States: MENU, LOGGING_IN, PLAYING
let user = null;

const cube = { x: 100, y: 100, size: 50, color: "#00FFCC" };
const gameButtons = [
    { x: 100, y: 200, w: 100, h: 100, color: "#FF4444", pressed: false }
];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// 3. INPUT HANDLING (FIXED)
// ==========================================
function handleInput(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const clientY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    if (gameState === "MENU") {
        // If they click the middle of the screen in Menu, trigger login
        if (clientX > canvas.width/4 && clientX < (canvas.width/4)*3) {
            gameState = "LOGGING_IN";
            signInWithRedirect(auth, provider);
        }
    } else if (gameState === "PLAYING") {
        // Move Cube
        cube.x = clientX - cube.size / 2;
        cube.y = clientY - cube.size / 2;
    }
}

canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('mousemove', (e) => { if(gameState === "PLAYING") handleInput(e); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(e); }, {passive: false});
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleInput(e); }, {passive: false});

// ==========================================
// 4. GAME ENGINE
// ==========================================
function update() {
    if (gameState === "PLAYING") {
        gameButtons.forEach(btn => {
            const hit = cube.x < btn.x + btn.w &&
                        cube.x + cube.size > btn.x &&
                        cube.y < btn.y + btn.h &&
                        cube.y + cube.size > btn.y;
            if (hit) {
                btn.pressed = true;
                btn.color = "#33FF77";
            }
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "MENU") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 30px Arial";
        ctx.fillText("WELCOMING TIME", canvas.width / 2, canvas.height / 2 - 50);
        
        // Draw a clear "LOGIN" box
        ctx.fillStyle = "#4285F4";
        ctx.fillRect(canvas.width/2 - 100, canvas.height/2 - 25, 200, 50);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("LOGIN WITH GOOGLE", canvas.width / 2, canvas.height / 2 + 7);
    } 
    
    if (gameState === "LOGGING_IN") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Redirecting to Google...", canvas.width/2, canvas.height/2);
    }

    if (gameState === "PLAYING") {
        // Draw Level Buttons
        gameButtons.forEach(btn => {
            ctx.fillStyle = btn.color;
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = "black";
            ctx.fillText(btn.pressed ? "FIXED" : "CUBE HERE", btn.x + 10, btn.y + 55);
        });

        // Draw Cube
        ctx.fillStyle = cube.color;
        ctx.fillRect(cube.x, cube.y, cube.size, cube.size);

        ctx.fillStyle = "white";
        ctx.textAlign = "left";
        ctx.fillText("User: " + (user?.displayName || "Player"), 10, 30);
    }

    update();
    requestAnimationFrame(draw);
}

// ==========================================
// 5. AUTH CHECK
// ==========================================
getRedirectResult(auth).then((result) => {
    if (result || auth.currentUser) {
        user = result ? result.user : auth.currentUser;
        gameState = "PLAYING";
    }
}).catch((err) => {
    console.error(err);
    gameState = "MENU";
});

draw();
