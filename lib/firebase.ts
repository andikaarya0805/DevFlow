import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, onSnapshot, setDoc, getDoc, serverTimestamp, deleteDoc, arrayUnion } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqXaURs_yBL_cwyaTijeOyy-zklK9yP3Y",
  authDomain: "developer-onboarding-6f953.firebaseapp.com",
  projectId: "developer-onboarding-6f953",
  storageBucket: "developer-onboarding-6f953.firebasestorage.app",
  messagingSenderId: "694681711458",
  appId: "1:694681711458:web:b470a3eef7408359ce323b",
  measurementId: "G-DHJ5TGX3GR"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
export { db, auth, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, deleteDoc, arrayUnion };

// Persist user progress to Firestore
export const updateUserProgress = async (userId: string, progress: number) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      progress,
      lastUpdated: new Date(),
      status: progress === 100 ? "Done" : "Active"
    });
    console.log(`Progress for ${userId} updated to ${progress}%`);
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

// Fetch real count for High severity debts
export const getCriticalDebtsCount = async () => {
  try {
    const q = query(collection(db, "technical_debts"), where("severity", "==", "High"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0 ? querySnapshot.size : 12; // Fallback to 12 if empty for demo
  } catch (error) {
    console.error("Error fetching technical debts:", error);
    return 12; // Return mock value if firebase is not configured
  }
};

// Fetch real team progress with demo fallback
export const getTeamProgress = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    if (querySnapshot.empty) {
      // Demo fallback data as requested
      return [
        { id: "dika-dev", name: "Dika", role: "Fullstack Dev", progress: 33, status: "Active" },
        { id: "fready-dev", name: "Fready", role: "Backend Engineer", progress: 85, status: "Active" },
        { id: "ryan-dev", name: "Ryan", role: "UI/UX Designer", progress: 62, status: "Warning" }
      ];
    }
    return querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching team progress:", error);
    return [
      { id: "dika-dev", name: "Dika", role: "Fullstack Dev", progress: 33, status: "Active" },
      { id: "fready-dev", name: "Fready", role: "Backend Engineer", progress: 85, status: "Active" },
      { id: "ryan-dev", name: "Ryan", role: "UI/UX Designer", progress: 62, status: "Warning" }
    ];
  }
};
