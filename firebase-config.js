// ─────────────────────────────────────────────────────────────
//  firebase-config.js
//  Replace the placeholder values below with YOUR Firebase
//  project credentials.
//
//  How to get them:
//  1. Go to https://console.firebase.google.com
//  2. Create a project (or open an existing one)
//  3. Click the </> (Web) icon to register a web app
//  4. Copy the firebaseConfig object shown and paste it here
//  5. In the left sidebar → Build → Firestore Database
//     → Create database → Start in test mode → Done
// ─────────────────────────────────────────────────────────────
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDR7Dn1wtFKlg-wcz-0sSIZRM17DBA0Fck",
  authDomain: "form-database-61ba3.firebaseapp.com",
  projectId: "form-database-61ba3",
  storageBucket: "form-database-61ba3.firebasestorage.app",
  messagingSenderId: "449781543483",
  appId: "1:449781543483:web:4b53cdf99c19f778f9a21e",
  measurementId: "G-47EW5TXKMN"
};
// Initialise Firebase
firebase.initializeApp(firebaseConfig);

// Expose the Firestore instance globally so app.js can use it
const db = firebase.firestore();
