import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  arrayUnion
} from "./firebase";

export interface Project {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: string[]; // Array of user UIDs
  inviteCode: string;
  createdAt: any;
  // New Automation Fields
  repoUrl?: string;
  repoType?: 'github' | 'gitlab';
  repoToken?: string; // Stored as plain text for this demo (Caution: Sensitive)
  webhookUrl?: string;
  stagnancyLimitHours?: number; 
}

// Generate a random 8-character invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const createProject = async (name: string, description: string, adminId: string) => {
  try {
    const projectId = doc(collection(db, "projects")).id;
    const inviteCode = generateInviteCode();
    
    const projectData: Project = {
      id: projectId,
      name,
      description,
      adminId,
      members: [adminId],
      inviteCode,
      createdAt: serverTimestamp(),
      stagnancyLimitHours: 24, // Default to 24 hours
    };
    
    await setDoc(doc(db, "projects", projectId), projectData);
    
    // Also update the user's role to admin for this project context
    // In this simplified version, we just mark the user as an Admin PM
    const userRef = doc(db, "users", adminId);
    await updateDoc(userRef, {
      role: "admin",
      currentProjectId: projectId
    });
    
    return { projectId, inviteCode };
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const joinProjectByInviteCode = async (inviteCode: string, userId: string) => {
  try {
    const q = query(collection(db, "projects"), where("inviteCode", "==", inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("Invalid invite code");
    }
    
    const projectDoc = querySnapshot.docs[0];
    const projectId = projectDoc.id;
    
    await updateDoc(doc(db, "projects", projectId), {
      members: arrayUnion(userId)
    });
    
    // 1. Initialize user_project_progress for the new member
    // This ensures they appear in the team list immediately
    const progressRef = doc(db, "user_project_progress", `${userId}_${projectId}`);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      await setDoc(progressRef, {
        userId,
        projectId,
        progress: 0,
        completedTasks: [],
        lastActive: serverTimestamp()
      });
    }
    
    // 2. Update user's current project and role as developer
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "developer",
      currentProjectId: projectId
    });
    
    return projectId;
  } catch (error) {
    console.error("Error joining project:", error);
    throw error;
  }
};

export const getProjectDetails = async (projectId: string) => {
  try {
    const docSnap = await getDoc(doc(db, "projects", projectId));
    if (docSnap.exists()) {
      return docSnap.data() as Project;
    }
    return null;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
};
export const getUserProjects = async (userId: string) => {
  try {
    const q = query(collection(db, "projects"), where("members", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return [];
  }
};
