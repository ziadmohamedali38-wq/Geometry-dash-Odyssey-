// ==========================================
// 1. FIREBASE SETUP (DIRECT COMPAT)
// ==========================================
const scriptApp = document.createElement('script');
scriptApp.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
document.head.appendChild(scriptApp);

scriptApp.onload = () => {
    const scriptAuth = document.createElement('script');
    scriptAuth.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
    document.head.appendChild(scriptAuth);

    scriptAuth.onload = () => {
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

        // ==========================================
        // 2. CANVAS & SAMSUNG UI SETUP
// ==========================================
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);
        document.body.style.cssText = "margin:0; overflow:hidden; background:#000; touch-action:none; font-family: 'Samsung One', sans-serif;";

        let state = "MENU"; // MENU, PLAYING
        let user = null;

        const player = { x: 50, y: 50, size: 60, color: "#00FFCC" };
        const buttons = [
            { id: 1, x: 100, y: 150, w: 120, h: 80, color: "#FF4444", label: "FIX ME" }
        ];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // ==========================================
        // 3. INPUT HANDLING
        // ==========================================
        const handleInput = (e) => {
            const t = e.touches ? e.touches[0] : e;
            const rect = canvas.getBoundingClientRect();
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;

            if (state === "MENU") {
                // If they click the Login/Start button area
                if (y > canvas.height / 2) {
                    auth.signInWithRedirect(provider);
                    // Force start if login is slow
                    setTimeout(() => { if(state === "MENU") state = "PLAYING"; }, 2000);
                }
            } else {
                // Gameplay Movement
                player.x = x - player.size / 2;
                player.y = y - player.size / 2;
            }
        };

        canvas.addEventListener('mousedown', handleInput);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(e); }, {passive: false});
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleInput(e); }, {passive: false});

        // ==========================================
        // 4. DRAWING & LOGIC
        // ==========================================
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (state === "MENU") {
                // VERTICAL SAMSUNG-STYLE MENU
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.font = "bold 42px sans-serif";
                ctx.fillText("ODESSY", canvas.width / 2, 120);

                // Level Card (Horizontal pill shape)
                ctx.fillStyle = "#1c1c1c";
                const cardW = canvas.width - 60;
                ctx.beginPath();
                ctx.roundRect(30, 200, cardW, 100, 25);
                ctx.fill();

                ctx.fillStyle = "#fff";
                ctx.font = "bold 20px sans-serif";
                ctx.textAlign = "left";
                ctx.fillText("1. Welcoming Time", 60, 255);
                
                // Login Button at Bottom
                ctx.fillStyle = "#4285F4";
                ctx.beginPath();
                ctx.roundRect(canvas.width/2 - 100, canvas.height - 150, 200, 60, 30);
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText("LOGIN / PLAY", canvas.width / 2, canvas.height - 110);

            } else {
                // LANDSCAPE GAMEPLAY LOGIC
                buttons.forEach(btn => {
                    const hit = player.x < btn.x + btn.w &&
                                player.x + player.size > btn.x &&
                                player.y < btn.y + btn.h &&
                                player.y + player.size > btn.y;
                    if (hit) btn.color = "#00FF66";
                    
                    ctx.fillStyle = btn.color;
                    ctx.beginPath();
                    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 15);
                    ctx.fill();
                    ctx.fillStyle = "black";
                    ctx.font = "bold 14px sans-serif";
                    ctx.fillText(btn.color === "#00FF66" ? "DONE" : "PUSH", btn.x + btn.w/2, btn.y + btn.h/2 + 5);
                });

                // Cube
                ctx.fillStyle = player.color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = player.color;
                ctx.fillRect(player.x, player.y, player.size, player.size);
                ctx.shadowBlur = 0;

                // Player HUD
                ctx.fillStyle = "white";
                ctx.textAlign = "left";
                ctx.font = "14px sans-serif";
                ctx.fillText("User: " + (user?.displayName || "Guest"), 20, 40);
            }

            requestAnimationFrame(draw);
        }

        // ==========================================
        // 5. AUTH HANDLER
        // ==========================================
        auth.getRedirectResult().then(result => {
            if (result.user || auth.currentUser) {
                user = auth.currentUser;
                state = "PLAYING";
            }
            draw();
        }).catch(() => {
            state = "MENU";
            draw();
        });
    };
};
.
