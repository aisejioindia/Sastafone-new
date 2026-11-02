// Sastafone Surat - Official Firebase Configuration & Initialization
// Provided by User for Project: sastafone (sastafone.firebaseapp.com)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyDclGzVRyu6uP0rneXFJy688P4CI3KGFCM",
  authDomain: "sastafone.firebaseapp.com",
  projectId: "sastafone",
  storageBucket: "sastafone.firebasestorage.app",
  messagingSenderId: "162458238860",
  appId: "1:162458238860:web:bc3263b44f4fdc30d3a0a9",
  measurementId: "G-XVFFKSWHWJ"
};

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase App safely (singleton instance)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication Instance
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Firebase Firestore Database Instance
export const db = getFirestore(app);

// Initialize Analytics if supported in the browser environment
export const initAnalytics = async () => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        return getAnalytics(app);
      }
    } catch (e) {
      console.warn('Firebase Analytics not supported in this environment:', e);
    }
  }
  return null;
};

// Auto-run analytics initialization in client
if (typeof window !== 'undefined') {
  initAnalytics().catch(() => {});
}

