// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
// TD: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqWeXx8wDNuTZQvgmnjlXOeJdNRPWuKWg",
  authDomain: "challenge05-84796.firebaseapp.com",
  projectId: "challenge05-84796",
  storageBucket: "challenge05-84796.firebasestorage.app",
  messagingSenderId: "338800167834",
  appId: "1:338800167834:web:f3ed3382752294ab04c823",
  measurementId: "G-J23WENVWZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth : Auth = getAuth(app);
const analytics = getAnalytics(app);