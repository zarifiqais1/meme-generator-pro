import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBcDXp8zSM6-q2Iuoax6e6H_pwPmkeq4uU",
  authDomain: "meme-generator-saas-65cb3.firebaseapp.com",
  projectId: "meme-generator-saas-65cb3",
  storageBucket: "meme-generator-saas-65cb3.appspot.com",
  messagingSenderId: "217488399030",
  appId: "1:217488399030:web:f01ff80f95b54890936417",
};

/* INIT */
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/* AUTH */
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();

/* IMPORTANT FIX */
provider.setCustomParameters({
  prompt: "select_account",
});

/* LOGIN */
export const loginWithGoogle = () => {
  return signInWithRedirect(auth, provider);
};

/* HANDLE REDIRECT ONCE ONLY */
export const handleRedirectLogin = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/* LOGOUT */
export const logout = () => signOut(auth);

/* FIRESTORE */
export const db = getFirestore(app);
