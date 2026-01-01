// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase config - Replace with your own Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyCx6lMV49SPiXtLbBk_9lG5tl034FIdsZc",
    authDomain: "removecloths-b0103.firebaseapp.com",
    projectId: "removecloths-b0103",
    storageBucket: "removecloths-b0103.firebasestorage.app",
    messagingSenderId: "766413874280",
    appId: "1:766413874280:web:a57dccd149febd691587dd",
    measurementId: "G-D4YXV9TT9N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
