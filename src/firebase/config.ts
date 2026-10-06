// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB03Qfv9l_DqR4b8souqKWee0QaBYlLdcA",
  authDomain: "challenge06-e9802.firebaseapp.com",
  projectId: "challenge06-e9802",
  storageBucket: "challenge06-e9802.firebasestorage.app",
  messagingSenderId: "180652671828",
  appId: "1:180652671828:web:9832f6f570552fa46e7ec1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbFirestore = getFirestore(app);
export const dbRealtime = getDatabase(app);