// Safe Firebase client helper module
let initializeApp: any, getApps: any, getApp: any, getAuth: any, GoogleAuthProvider: any, getFirestore: any;

try {
  const firebaseApp = require("firebase/app");
  const firebaseAuth = require("firebase/auth");
  const firebaseDb = require("firebase/firestore");
  initializeApp = firebaseApp.initializeApp;
  getApps = firebaseApp.getApps;
  getApp = firebaseApp.getApp;
  getAuth = firebaseAuth.getAuth;
  GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
  getFirestore = firebaseDb.getFirestore;
} catch (e) {}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "verbaflow-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "verbaflow-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "verbaflow-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:demo",
};

let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (typeof window !== "undefined" && initializeApp) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {}
}

export { app, auth, db, googleProvider };
