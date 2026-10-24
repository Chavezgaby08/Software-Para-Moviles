import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  type Auth
} from "firebase/auth";

// Prevenir errores de gapi.iframes en Capacitor / iOS WebKit
interface CustomWindow extends Window {
  gapi?: {
    iframes?: {
      getContext?: () => {
        openChild?: () => Record<string, unknown>;
        getParent?: () => Record<string, unknown>;
      };
    };
    load?: (name: string, callback?: () => void) => void;
  };
}

if (typeof window !== 'undefined') {
  const win = window as unknown as CustomWindow;
  win.gapi = win.gapi || {};
  if (!win.gapi.iframes) {
    win.gapi.iframes = {
      getContext: () => ({
        openChild: () => ({}),
        getParent: () => ({}),
      }),
    };
  }
  if (!win.gapi.load) {
    win.gapi.load = (_name: string, callback?: () => void) => {
      if (typeof callback === 'function') {
        try {
          callback();
        } catch (e) {
          console.warn("gapi.load callback caught:", e);
        }
      }
    };
  }
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBAG6FBOyN9LQE1NmKCWApp9Xvuphl-9Gg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "parcial-2-54bf1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parcial-2-54bf1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "parcial-2-54bf1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "292511864461",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:292511864461:web:fa1d26b67a87ecfb0bf4c4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Inicializar Auth con persistencia local explícita sin el popupRedirectResolver (que carga apis.google.com/gapi.iframes)
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence]
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;