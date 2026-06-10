/**
 * SECURITY NOTE — Firebase Client SDK Configuration
 *
 * Firebase client-side configuration values (apiKey, appId, projectId, etc.)
 * are INTENTIONALLY PUBLIC. Google designed them to be safe to embed in
 * client-side JavaScript. They identify your Firebase project but do NOT
 * grant administrative access by themselves.
 *
 * Real security is enforced by:
 *  1. Firebase Security Rules → firestore.rules & storage.rules
 *  2. GCP API key restrictions (HTTP referrer & API restrictions)
 *     → https://console.cloud.google.com/apis/credentials
 *  3. Firebase App Check (reCAPTCHA v3) — configured below
 *
 * DO NOT move these values behind a server-side proxy: the Firebase client
 * SDK requires them in the browser to initialise Auth, Firestore, and Storage.
 *
 * See: https://firebase.google.com/docs/projects/api-keys
 */
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


let app;
let auth;
let googleProvider;
let db;
let analytics;
let storage;
let isFirebaseInitialized = false;

try {
  // Check if we have the required config
  const hasRequiredConfig = firebaseConfig.apiKey && 
                            firebaseConfig.projectId && 
                            firebaseConfig.apiKey !== 'your_api_key';
  
  if (!hasRequiredConfig) {
    throw new Error("Firebase configuration is missing or using default values");
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  analytics = getAnalytics(app);
  // Initialize App Check to mitigate abuse and ensure only genuine clients access Firebase
  try {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    }
  } catch (err) {
    console.warn('App Check initialization failed:', err?.message || err);
  }
  storage = getStorage(app);
  isFirebaseInitialized = true;

} catch (error) {
  console.warn("Firebase initialization failed:", error.message, "\nUsing fallback mode.");
  // Fallback to prevent app crash on White Screen
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb) => { cb(null); return () => { }; },
    signInWithPopup: () => Promise.reject("Firebase not initialized"),
    signOut: () => Promise.resolve()
  };
  googleProvider = {};
  db = null;
  analytics = null;
  storage = null;
}

export { auth, googleProvider, db, analytics, storage, isFirebaseInitialized };
