// src/firebase.js

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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
   INIT APP
====================== */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/* ======================
   AUTH
====================== */
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

/* ======================
   LOGIN (FIXED - NO POPUP ERROR)
====================== */
export const loginWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Login Error:", error);
  }
};

/* ======================
   HANDLE REDIRECT RESULT
====================== */
export const handleRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Redirect Login Error:", error);
    return null;
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
