// --- 1. FIREBASE SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

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

// --- 2. AUTHENTICATION LOGIC ---
const loginBtn = document.getElementById('login-btn'); // Make sure you have this ID in your HTML
const userDisplay = document.getElementById('user-display');

export const handleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User logged in:", result.user.displayName);
    } catch (error) {
        console.error("Login failed:", error.message);
    }
};

export const handleLogout = () => {
    signOut(auth).then(() => {
        console.log("Logged out");
    });
};

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Playing as:", user.displayName);
        if(userDisplay) userDisplay.innerText = `Welcome, ${user.displayName}`;
    } else {
        if(userDisplay) userDisplay.innerText = "Guest Mode";
    }
});

// --- 3. GAME ENGINE / LEVEL DESIGN ---
// This is where your "Welcoming Time" cube logic and buttons go

const canvas = document.getElementById('gameCanvas');
// Add your specific cube movement and button fixing logic below...

console.log("Game Engine Loaded: Welcoming Time project active.");
