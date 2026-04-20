import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBcDXp8zsm6-q2Iuoax6e6H_pwPmkeq4uU",
  authDomain: "meme-generator-saas-65cb3.firebaseapp.com",
  projectId: "meme-generator-saas-65cb3",
  storageBucket: "meme-generator-saas-65cb3.firebasestorage.app",
  messagingSenderId: "217488399030",
  appId: "1:217488399030:web:f01ff80f95b54890936417",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

export const db = getFirestore(app);
