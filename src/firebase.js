import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect, // تغییر به Redirect برای حل مشکل مرورگر و Vercel
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

/* 🔥 IMPORTANT FIX: keep login after refresh */
setPersistence(auth, browserLocalPersistence).catch(console.error);

/* ======================
   FIRESTORE
====================== */
export const db = getFirestore(app);

/* ======================
   GOOGLE PROVIDER
====================== */
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

/* ======================
   LOGIN (REDIRECT)
====================== */
export const loginWithGoogle = async () => {
  try {
    // استفاده از Redirect به جای Popup برای پایداری در Vercel و موبایل
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/* ======================
   LOGOUT
====================== */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
};
