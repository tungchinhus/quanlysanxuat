// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuIT3ZuNI7gz3eQKPnR1uM6M5j7JggkXs",
  authDomain: "quanlysanxuat-b7346.firebaseapp.com",
  databaseURL: "https://quanlysanxuat-default-rtdb.firebaseio.com",
  projectId: "quanlysanxuat",
  storageBucket: "quanlysanxuat.firebasestorage.app",
  messagingSenderId: "355582229234",
  appId: "1:355582229234:web:d5f4b8efb8b73243936e6b",
  measurementId: "G-XQ8HTM4458"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth, firebaseConfig };
