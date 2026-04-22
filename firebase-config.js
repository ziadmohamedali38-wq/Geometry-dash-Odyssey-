// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDEw8iPR12evpKzHBQmYnlcTdoYD3pK-xc",
    authDomain: "geometry-dash-odessy.firebaseapp.com",
    projectId: "geometry-dash-odessy",
    storageBucket: "geometry-dash-odessy.firebasestorage.app",
    messagingSenderId: "824100531511",
    appId: "1:824100531511:web:b25f7b5e688c425cd2feb2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Sign in anonymously for now so saving works immediately
auth.signInAnonymously().catch((error) => {
    console.error("Auth Error:", error);
});
