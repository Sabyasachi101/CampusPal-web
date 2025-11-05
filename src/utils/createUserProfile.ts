import { setDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { User } from "firebase/auth";

/**
 * Creates a Firestore user profile if it doesn't already exist.
 * Matches structure expected by Directory and Profile pages.
 */
export const createUserProfile = async (user: User | null): Promise<void> => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // ✅ Only create if not already in Firestore
  if (!userSnap.exists()) {
    const profileData = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "New User",
      photoURL: user.photoURL || "",
      department: "Not Set", // consistent with Directory filters
      batch: "Not Set",
      bio: "Hey there! I'm new to CampusPal 🎓",
      interests: [],
      createdAt: Timestamp.now(),
    };

    await setDoc(userRef, profileData);
    console.log("✅ Firestore profile created for:", user.uid);
  } else {
    console.log("ℹ️ Firestore profile already exists for:", user.uid);
  }
};
