/**
 * GEOMETRY DASH ODESSY - COMPLETE ENGINE
 * Built for Samsung A16 / One UI Experience
 */

// --- FIREBASE INJECTOR ---
const loadFirebase = () => {
    const app = document.createElement('script');
    app.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
    document.head.appendChild(app);

    app.onload = () => {
        const auth = document.createElement('script');
        auth.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
        document.head.appendChild(auth);

        auth.onload = () => { initGame(); };
    };
};

const initGame = () => {
    // YOUR ACTUAL FIREBASE PROJECT CONFIG
    const firebaseConfig = {
        apiKey: "AIzaSyDEw8iPR12evpKzHBQmYnlcTdoYD3pK-xc",
        authDomain: "geometry-dash-odessy.firebaseapp.com",
        projectId: "geometry-dash-odessy",
        storageBucket: "geometry-dash-odessy.firebasestorage.app",
        messagingSenderId: "824100531511",
        appId: "1:824100531511:web:b25f7b5e688c425cd2feb2",
        measurementId: "G-M3CE56HJB2"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // --- GAME ENGINE ---
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    let state = "LEVEL_SELECT"; 
    let user = null;
    const player = { x: 100, y: 100, size: 60, color: "#00FFCC" };
    const levelButtons = [
        { id: 1, x: 150, y: 200, w: 120, h: 80, color: "#FF4444", text: "PUSH" }
    ];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- INTERACTION ---
    const handleAction = (e) => {
        const t = e.touches ? e.touches[0] : e;
        const x = t.clientX;
        const y = t.clientY;

        if (state === "LEVEL_SELECT") {
            // Check if user tapped the "Level 1" card area
            if (y > 150 && y < 300) {
                if (!auth.currentUser) {
                    auth.signInWithRedirect(provider);
                } else {
                    state = "PLAYING";
                }
            }
        } else {
            // Move Player
            player.x = x - player.size / 2;
            player.y = y - player.size / 2;
        }
    };

    canvas.addEventListener('mousedown', handleAction);
    canvas.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        handleAction(e); 
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { 
        e.preventDefault(); 
        handleAction(e); 
    }, { passive: false });

    // --- DRAWING ---
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (state === "LEVEL_SELECT") {
            // SAMSUNG VERTICAL UI
            ctx.fillStyle = "white";
            ctx.textAlign = "left";
            ctx.font = "bold 40px sans-serif";
            ctx.fillText("Odyssey", 30, 80);
            
            ctx.font = "16px sans-serif";
            ctx.fillStyle = "#888";
            ctx.fillText(user ? `User: ${user.displayName}` : "Tap below to sign in", 30, 115);

            // Level Card
            ctx.fillStyle = "#1c1c1c";
            ctx.beginPath();
            ctx.roundRect(20, 160, canvas.width - 40, 120, 25);
            ctx.fill();

            ctx.fillStyle = "white";
            ctx.font = "bold 20px sans-serif";
            ctx.fillText("1. Welcoming Time", 50, 215);
            ctx.fillStyle = "#00FFCC";
            ctx.font = "14px sans-serif";
            ctx.fillText("START PROJECT", 50, 245);

        } else if (state === "PLAYING") {
            // LANDSCAPE ACTION
            levelButtons.forEach(btn => {
                // Collision Detection
                if (player.x < btn.x + btn.w && player.x + player.size > btn.x && player.y < btn.y + btn.h && player.y + player.size > btn.y) {
                    btn.color = "#00FF66";
                    btn.text = "FIXED";
                }
                ctx.fillStyle = btn.color;
                ctx.beginPath();
                ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 15);
                ctx.fill();
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.font = "bold 16px sans-serif";
                ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + btn.h/2 + 7);
            });

            // Player Cube
            ctx.fillStyle = player.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = player.color;
            ctx.fillRect(player.x, player.y, player.size, player.size);
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(draw);
    }

    // --- BOOTSTRAP ---
    auth.getRedirectResult().then((result) => {
        if (result.user || auth.currentUser) {
            user = auth.currentUser || result.user;
        }
        draw();
    }).catch(() => { draw(); });
};

loadFirebase();
