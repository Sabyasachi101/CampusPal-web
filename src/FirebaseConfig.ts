// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Export these
export { auth, provider, db };

