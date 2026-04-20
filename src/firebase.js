import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Firebase Config (Production safe version)
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyBcDXp8zsm6-q2Iuoax6e6H_pwPmkeq4uU",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "meme-generator-saas-65cb3.firebaseapp.com",
  projectId:
    process.env.REACT_APP_FIREBASE_PROJECT_ID || "meme-generator-saas-65cb3",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "meme-generator-saas-65cb3.firebasestorage.app",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "217488399030",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:217488399030:web:f01ff80f95b54890936417",
};

// 🔥 Prevent double initialization
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ======================
// 🔐 AUTH
// ======================
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// ======================
// ☁️ FIRESTORE
// ======================
export const db = getFirestore(app);
