// 1. MOBILE-STABLE FIREBASE LOADING
const scriptApp = document.createElement('script');
scriptApp.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
document.head.appendChild(scriptApp);

scriptApp.onload = () => {
    const scriptAuth = document.createElement('script');
    scriptAuth.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
    document.head.appendChild(scriptAuth);

    scriptAuth.onload = () => {
        // --- YOUR ACTUAL CONFIG ---
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

        // --- 2. THE GAME ENGINE ---
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);
        
        // Fullscreen Styling
        document.body.style.cssText = "margin:0; overflow:hidden; background:#111; touch-action:none;";
        
        let state = "MENU"; // MENU, PLAY
        const player = { x: 100, y: 100, size: 60, color: "#00FFCC" };
        const buttons = [{ x: 150, y: 300, w: 100, h: 100, color: "red", fixed: false }];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // Mobile Movement Fix
        const handleMove = (e) => {
            if (state !== "PLAY") return;
            const t = e.touches ? e.touches[0] : e;
            player.x = t.clientX - player.size / 2;
            player.y = t.clientY - player.size / 2;
        };

        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMove(e); }, {passive: false});

        // Click Logic
        canvas.onclick = () => {
            if (state === "MENU") {
                // Try to Login, but also move to PLAY so you aren't stuck
                auth.signInWithRedirect(provider);
                // Fallback: If redirect is blocked, let them play anyway after a tap
                setTimeout(() => { if(state === "MENU") state = "PLAY"; }, 2000);
            }
        };

        // Main Loop
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (state === "MENU") {
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.font = "bold 24px sans-serif";
                ctx.fillText("GEOMETRY DASH ODESSY", canvas.width/2, canvas.height/2 - 20);
                ctx.font = "16px sans-serif";
                ctx.fillText("TAP TO START / LOGIN", canvas.width/2, canvas.height/2 + 30);
            } else {
                // Draw Level
                buttons.forEach(b => {
                    // Collision
                    if (player.x < b.x + b.w && player.x + player.size > b.x && player.y < b.y + b.h && player.y + player.size > b.y) {
                        b.fixed = true; b.color = "#00FF66";
                    }
                    ctx.fillStyle = b.color;
                    ctx.fillRect(b.x, b.y, b.w, b.h);
                });

                // Draw Cube
                ctx.fillStyle = player.color;
                ctx.fillRect(player.x, player.y, player.size, player.size);
            }
            requestAnimationFrame(loop);
        }

        // Check if we just came back from a login
        auth.getRedirectResult().then(res => {
            if (res.user || auth.currentUser) state = "PLAY";
            loop();
        }).catch(() => {
            state = "MENU";
            loop();
        });
    };
};
