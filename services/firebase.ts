
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ⚠️ CONFIGURATION REQUISE :
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un projet "CKMoney"
// 3. Dans Authentification > Sign-in method, activez "Google"
// 4. Dans Paramètres du projet > Général, copiez la config SDK et remplacez ci-dessous :

const firebaseConfig = {
  apiKey: "AIzaSyDot4J_Z3G2jbC46-POX132VNGUu96f2LA",
  authDomain: "ckmoney-1f662.firebaseapp.com",
  projectId: "ckmoney-1f662",
  storageBucket: "ckmoney-1f662.firebasestorage.app",
  messagingSenderId: "897743585231",
  appId: "1:897743585231:web:7fb12cb404d567def75cba",
  measurementId: "G-P9SEH1JCG3"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
