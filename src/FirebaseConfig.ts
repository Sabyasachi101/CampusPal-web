import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyApyvXyL_RY2WYOr1zBFydMDYWZJTHVyW0",
  authDomain: "campuspal-70aff.firebaseapp.com",
  projectId: "campuspal-70aff",
  storageBucket: "campuspal-70aff.firebasestorage.app",
  messagingSenderId: "116899194109",
  appId: "1:116899194109:web:c8287a00b20652c2084a94",
  measurementId: "G-RQVW0L43JG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services (fast, non-blocking)
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Export these
export { auth, provider, db };

