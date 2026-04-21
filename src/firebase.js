// src/firebase.js

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* ======================
   FIREBASE CONFIG
====================== */
const firebaseConfig = {
  apiKey: "AIzaSyBcDXp8Zsm6-q2Iuoax6e6H_pwPmkeq4uU",
  authDomain: "meme-generator-saas-65cb3.firebaseapp.com",
  projectId: "meme-generator-saas-65cb3",
  storageBucket: "meme-generator-saas-65cb3.appspot.com",
  messagingSenderId: "217488399030",
  appId: "1:217488399030:web:f01ff80f95b54890936417",
};

/* ======================
   SAFE INIT (NO DUPLICATE APP)
====================== */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/* ======================
   AUTH
====================== */
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

/* ======================
   GOOGLE LOGIN (FIXED POPUP ISSUES)
====================== */
export const loginWithGoogle = async () => {
  try {
    // safer popup handling (fix COOP errors)
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Login Error:", error);

    // Better UX
    if (error.code === "auth/popup-blocked") {
      alert("Popup blocked! Please allow popups in your browser.");
    } else if (error.code === "auth/cancelled-popup-request") {
      alert("Login cancelled.");
    } else {
      alert("Login failed. Try again.");
    }
  }
};

/* ======================
   LOGOUT
====================== */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

/* ======================
   FIRESTORE
====================== */
export const db = getFirestore(app);
