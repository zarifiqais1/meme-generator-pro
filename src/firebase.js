import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
   LOGIN (POPUP)
====================== */
export const loginWithGoogle = async () => {
  try {
    // برگشت به حالت پاپ‌آپ برای جلوگیری از ریست شدن اپلیکیشن
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
    // جلوگیری از ارور در صورت بستن ناگهانی پنجره توسط کاربر
    if (error.code !== "auth/cancelled-popup-request") {
      throw error;
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
    console.error("Logout error:", error);
  }
};
