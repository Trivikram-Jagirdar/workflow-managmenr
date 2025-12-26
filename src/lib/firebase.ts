// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4WkteCHZGoq0mmkrMJ68X1SCZT92pDxM",
  authDomain: "workflow-bdf24.firebaseapp.com",
  projectId: "workflow-bdf24",
  storageBucket: "workflow-bdf24.firebasestorage.app",
  messagingSenderId: "54440654548",
  appId: "1:54440654548:web:96df6fa9edbac845922d41",
  measurementId: "G-38N713F9M0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };