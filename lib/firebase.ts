import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, onSnapshot, setDoc, getDoc, serverTimestamp, deleteDoc, arrayUnion, Timestamp } from "firebase/firestore";
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

// Persist user progress to Firestore (Project-specific + Global Summary)
export const updateUserProgress = async (userId: string, progress: number, projectId?: string) => {
  try {
    // 1. Update Global User Summary
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      progress,
      lastUpdated: serverTimestamp(),
      status: progress === 100 ? "Done" : "Active"
    });

    // 2. Update Project-Specific Progress if projectId is provided
    if (projectId) {
      const progressRef = doc(db, "user_project_progress", `${userId}_${projectId}`);
      await updateDoc(progressRef, {
        progress,
        lastActive: serverTimestamp(),
        status: progress === 100 ? "Done" : "Active"
      });
    }

    console.log(`Progress for ${userId} in ${projectId || 'Global'} updated to ${progress}%`);
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

// Update project settings (Admin only)
export const updateProjectSettings = async (projectId: string, data: any) => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
    console.log(`Settings for project ${projectId} updated.`);
  } catch (error) {
    console.error("Error updating project settings:", error);
  }
};

// Check for team stagnation and auto-mark as Blocked if necessary
export const checkTeamStagnation = async (projectId: string, limitHours: number) => {
  try {
    const q = query(collection(db, "user_project_progress"), where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);
    const now = new Date();
    let blockedCount = 0;
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.status === "Done" || data.status === "Blocked") continue;

      const lastActive = data.lastActive?.toDate() || new Date(0);
      const diffMs = now.getTime() - lastActive.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours >= limitHours) {
        await updateDoc(docSnap.ref, {
          status: "Blocked",
          blockedAt: serverTimestamp(),
          stagnant: true
        });
        blockedCount++;
        console.log(`User ${data.userId} marked as stagnant (last active ${diffHours.toFixed(1)}h ago)`);
      }
    }
    return blockedCount;
  } catch (error) {
    console.error("Error checking stagnation:", error);
  }
};
