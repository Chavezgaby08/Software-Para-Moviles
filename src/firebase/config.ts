import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAG6FBOyN9LQE1NmKCWApp9Xvuphl-9Gg",
  authDomain: "parcial-2-54bf1.firebaseapp.com",
  projectId: "parcial-2-54bf1",
  storageBucket: "parcial-2-54bf1.firebasestorage.app",
  messagingSenderId: "292511864461",
  appId: "1:292511864461:web:fa1d26b67a87ecfb0bf4c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);